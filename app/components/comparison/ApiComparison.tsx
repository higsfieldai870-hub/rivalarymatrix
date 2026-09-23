import Link from "next/link";
import { connection } from "next/server";
import type { DataSource, PlayerDossier } from "@/lib/player-stats";
import { describeApiError, hasApiKey } from "@/lib/bsd/client";
import { getDataSource, getPlayerDossier } from "@/lib/bsd/players";
import api from "./api.module.css";
import ComparisonView from "./ComparisonView";
import { MissingKeyNotice, Notice, NoticeBlock } from "./Notices";

type Loaded =
  | { status: "ok"; left: PlayerDossier; right: PlayerDossier; source: DataSource }
  | { status: "missing"; messages: string[] }
  | { status: "error"; message: string };

async function load(leftId: number, rightId: number): Promise<Loaded> {
  try {
    const [left, right] = await Promise.all([getPlayerDossier(leftId), getPlayerDossier(rightId)]);
    if (left.status === "ok" && right.status === "ok") {
      return { status: "ok", left: left.dossier, right: right.dossier, source: getDataSource() };
    }
    const messages = [left, right].flatMap((r) => (r.status === "missing" ? [r.message] : []));
    return { status: "missing", messages };
  } catch (error) {
    return { status: "error", message: describeApiError(error) };
  }
}

// Loads both players from BSD and renders the full comparison.
export default async function ApiComparison({ leftId, rightId }: { leftId: number; rightId: number }) {
  // Always fetch at request time, never during `next build`.
  await connection();

  if (!hasApiKey()) {
    return (
      <NoticeBlock>
        <MissingKeyNotice />
      </NoticeBlock>
    );
  }

  const result = await load(leftId, rightId);

  if (result.status === "error") {
    return (
      <NoticeBlock>
        <Notice title="Couldn't load the comparison" error>
          {result.message}
        </Notice>
      </NoticeBlock>
    );
  }

  if (result.status === "missing") {
    return (
      <NoticeBlock>
        <Notice title="Player not found" error>
          {result.messages.join(" ")}{" "}
          <Link className={api.inlineLink} href="/compare">
            Search for the player again
          </Link>
          .
        </Notice>
      </NoticeBlock>
    );
  }

  return <ComparisonView left={result.left} right={result.right} source={result.source} />;
}
