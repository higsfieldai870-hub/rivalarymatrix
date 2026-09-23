import { NextResponse, type NextRequest } from "next/server";
import { describeApiError, isBsdError } from "@/lib/bsd/client";
import { comparisonPath } from "@/lib/bsd/matchup";

function parseId(value: string | null) {
  return value && /^\d{1,8}$/.test(value) ? Number(value) : null;
}

// The shareable /compare/<left>-vs-<right> URL for two picked players.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const left = parseId(params.get("left"));
  const right = parseId(params.get("right"));

  if (left === null || right === null || left === right) {
    return NextResponse.json({ error: "Pick two different players." }, { status: 400 });
  }

  try {
    const path = await comparisonPath(left, right);
    if (!path) {
      return NextResponse.json({ error: "One of those players couldn't be found." }, { status: 404 });
    }
    return NextResponse.json({ path });
  } catch (error) {
    const status = isBsdError(error) && error.kind === "missing-key" ? 503 : 502;
    return NextResponse.json({ error: describeApiError(error) }, { status });
  }
}
