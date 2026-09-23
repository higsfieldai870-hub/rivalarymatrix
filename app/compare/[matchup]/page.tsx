import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import api from "@/app/components/comparison/api.module.css";
import ApiComparison from "@/app/components/comparison/ApiComparison";
import styles from "@/app/components/comparison/comparison.module.css";
import {
  ComparisonSkeleton,
  MissingKeyNotice,
  Notice,
  NoticeBlock,
} from "@/app/components/comparison/Notices";
import { displayName, shortName } from "@/app/components/comparison/view-model";
import { hasApiKey } from "@/lib/bsd/client";
import { resolveMatchup } from "@/lib/bsd/matchup";

export async function generateMetadata({
  params,
}: PageProps<"/compare/[matchup]">): Promise<Metadata> {
  const { matchup } = await params;
  const result = hasApiKey() ? await resolveMatchup(matchup) : null;
  if (result?.status !== "ok") return { title: "Player Comparison" };

  const [left, right] = [displayName(result.left), displayName(result.right)];
  return {
    title: `${left} vs ${right}`,
    description: `${left} vs ${right} compared side by side with live data: goals, assists, xG, ratings, scouting reports, transfers and more.`,
  };
}

const searchAgain = (
  <Link className={api.inlineLink} href="/compare">
    Search for the players again
  </Link>
);

export default async function MatchupPage({ params }: PageProps<"/compare/[matchup]">) {
  const { matchup } = await params;

  if (!hasApiKey()) {
    return (
      <NoticeBlock>
        <MissingKeyNotice />
      </NoticeBlock>
    );
  }

  const result = await resolveMatchup(matchup);

  if (result.status === "invalid") notFound();

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
          No player called {result.names.map((n) => `“${n}”`).join(" or ")}. {searchAgain}.
        </Notice>
      </NoticeBlock>
    );
  }

  // One URL per matchup: fix case and accents, and add or drop ids.
  if (result.path !== `/compare/${matchup}`) redirect(result.path);

  const { left, right } = result;

  if (left.id === right.id) {
    return (
      <NoticeBlock>
        <Notice title="Same player twice">
          {displayName(left)} is on both sides. {searchAgain}.
        </Notice>
      </NoticeBlock>
    );
  }

  return (
    <>
      <section className={`${styles.hero} ${api.matchupHero}`}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>
            <i className={styles.eyebrowDot} />
            HEAD TO HEAD • LIVE API DATA
          </div>

          <h1 className={`${styles.heroTitle} ${api.matchupTitle}`}>
            {shortName(left)} <span>VS</span> {shortName(right)}
          </h1>

          <div className={api.quickPicks}>
            <Link className={api.quickPick} href={result.swapPath}>
              ⇄ Swap sides
            </Link>
            <Link className={api.quickPick} href="/compare">
              New comparison
            </Link>
          </div>
        </div>
      </section>

      <Suspense key={`${left.id}-${right.id}`} fallback={<ComparisonSkeleton />}>
        <ApiComparison leftId={left.id} rightId={right.id} />
      </Suspense>
    </>
  );
}
