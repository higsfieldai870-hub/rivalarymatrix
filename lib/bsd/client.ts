import "server-only";

// Low-level client for the BSD (Bzzoiro Sports Data) football API v2, the
// API documented at goaldir.com. The token travels in the Authorization
// header, never in URLs, and every failure becomes a typed error so callers
// never cache a bad response.

const BASE = process.env.STATS_A_BASE_URL ?? "https://sports.bzzoiro.com/api/v2";
export const IMAGE_BASE = "https://sports.bzzoiro.com/img";

export type BsdErrorKind =
  | "missing-key"
  | "auth"
  | "paid"
  | "not-found"
  | "quota"
  | "rate-limit"
  | "bad-request"
  | "network"
  | "api";

export class BsdError extends Error {
  kind: BsdErrorKind;

  constructor(message: string, kind: BsdErrorKind) {
    super(message);
    this.name = "BsdError";
    this.kind = kind;
  }
}

export function isBsdError(error: unknown): error is BsdError {
  return error instanceof BsdError;
}

export function hasApiKey() {
  return Boolean(process.env.STATS_A_KEY);
}

// A few requests in flight at once keeps a cold comparison quick without
// hammering the API.
const MAX_IN_FLIGHT = 6;
let inFlight = 0;
const waiting: (() => void)[] = [];

async function acquire() {
  if (inFlight < MAX_IN_FLIGHT) {
    inFlight++;
    return;
  }
  await new Promise<void>((resolve) => waiting.push(resolve));
}

function release() {
  const next = waiting.shift();
  if (next) next();
  else inFlight--;
}

// Daily quota as last reported by the API (free accounts only; paid
// accounts get no RateLimit headers, meaning unlimited).
let quota: { remaining: number; limit: number } | null = null;

export function lastKnownQuota() {
  return quota;
}

function learnQuota(headers: Headers) {
  const remaining = headers.get("ratelimit")?.match(/r=(\d+)/)?.[1];
  const limit = headers.get("ratelimit-policy")?.match(/q=(\d+)/)?.[1];
  if (remaining && limit) quota = { remaining: Number(remaining), limit: Number(limit) };
}

type ErrorBody = { detail?: string; code?: string; error?: unknown };

export async function bsdGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const key = process.env.STATS_A_KEY;
  if (!key) {
    throw new BsdError(
      "No BSD API key found. Add STATS_A_KEY to .env and restart the server.",
      "missing-key",
    );
  }

  const url = new URL(`${BASE}${path}`);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, String(value));

  for (let attempt = 0; ; attempt++) {
    await acquire();
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { Authorization: `Token ${key}`, Accept: "application/json" },
        cache: "no-store",
      });
    } catch (error) {
      throw new BsdError(`Could not reach the BSD API: ${(error as Error).message}`, "network");
    } finally {
      release();
    }

    learnQuota(res.headers);
    if (res.ok) return (await res.json()) as T;

    const body = (await res.json().catch(() => ({}))) as ErrorBody;
    const detail = typeof body.detail === "string" ? body.detail : "";

    if (res.status === 429 && body.code === "rate_limited" && attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
      continue;
    }

    switch (res.status) {
      case 401:
        throw new BsdError("BSD rejected the API key. Check STATS_A_KEY in .env.", "auth");
      case 402:
        throw new BsdError(detail || "This BSD endpoint needs a paid add-on.", "paid");
      case 404:
        throw new BsdError(detail || "Not found.", "not-found");
      case 400:
        throw new BsdError(`BSD rejected the request: ${detail || "invalid parameter"}.`, "bad-request");
      case 429: {
        if (body.code === "taster_exhausted") {
          const hours = Math.ceil(Number(res.headers.get("retry-after") ?? 0) / 3600);
          throw new BsdError(
            `The daily BSD request quota is used up. It resets at midnight UTC${hours ? ` (in about ${hours} h)` : ""}.`,
            "quota",
          );
        }
        throw new BsdError("BSD is rate limiting requests. Try again in a moment.", "rate-limit");
      }
      default:
        throw new BsdError(`BSD returned HTTP ${res.status}${detail ? `: ${detail}` : "."}`, "api");
    }
  }
}

export function describeApiError(error: unknown) {
  if (isBsdError(error)) return error.message;
  return "Something went wrong while loading data from BSD.";
}
