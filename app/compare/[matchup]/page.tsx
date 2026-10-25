import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import api from "@/app/components/comparison/api.module.css";
import JsonLd from "@/app/components/JsonLd";
import ComparisonView from "@/app/components/comparison/ComparisonView";
import styles from "@/app/components/comparison/comparison.module.css";
import { MissingKeyNotice, NoticeBlock } from "@/app/components/comparison/Notices";
import { displayName, shortName } from "@/app/components/comparison/view-model";
import { hasApiKey } from "@/lib/bsd/client";
import { resolveMatchup } from "@/lib/bsd/matchup";
import { getPlayerDossier } from "@/lib/bsd/players";
import { findPopularMatchup } from "@/lib/bsd/popular";
import { rivalryNote } from "@/lib/popular-players";
import { absoluteUrl, openGraph, SITE_URL } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/compare/[matchup]">): Promise<Metadata> {
  const { matchup } = await params;
  const result = hasApiKey() ? await resolveMatchup(matchup) : null;
  // Errors, unknown names and bad URLs stay out of search results.
  if (result?.status !== "ok" || result.left.id === result.right.id) {
    return { title: "Player Comparison", robots: { index: false, follow: true } };
  }

  // Popular pairs have one canonical order, so the swapped URL isn't a
  // duplicate; mixed-position pairs stay out of the index (see sitemap.ts).
  const popular = await findPopularMatchup(result.left.id, result.right.id);
  const canonical = popular?.path ?? result.path;
  const robots = popular?.kind === "cross-role" ? { index: false, follow: true } : undefined;

  const [left, right] = [displayName(result.left), displayName(result.right)];
  const title = `${left} vs ${right}: Stats Comparison`;
  const description = `${left} vs ${right} compared side by side with live data: goals, assists, xG, ratings, per-90 numbers, scouting reports, transfers and more.`;

  return {
    title,
    description,
    keywords: [
      `${left} vs ${right}`,
      `${right} vs ${left}`,
      `${left} vs ${right} stats`,
      `${left} stats`,
      `${right} stats`,
      "player comparison",
    ],
    // The canonical order, even when this page was reached by another spelling.
    alternates: { canonical },
    robots,
    openGraph: openGraph(canonical, title, description),
  };
}

// Both players' full records. Data trouble throws (usually the daily BSD
// quota), and the page answers with a server error that crawlers retry later.
async function loadDossiers(leftId: number, rightId: number) {
  const [left, right] = await Promise.all([getPlayerDossier(leftId), getPlayerDossier(rightId)]);
  if (left.status !== "ok" || right.status !== "ok") notFound();
  return [left.dossier, right.dossier] as const;
}

export default async function MatchupPage({ params }: PageProps<"/compare/[matchup]">) {
  const { matchup } = await params;

  if (!hasApiKey()) {
    return (
      <NoticeBlock>
        <MissingKeyNotice />
      </NoticeBlock>
    );
  }

  // Everything is loaded before the response starts, so a failure gets a real
  // status code. Streamed in after a 200, an error message would be crawled
  // and indexed as the page's content.
  const result = await resolveMatchup(matchup);
  if (result.status === "invalid" || result.status === "missing") notFound();
  if (result.status === "error") throw new Error(result.message);

  // One URL per matchup: fix case and accents, and add or drop ids.
  if (result.path !== `/compare/${matchup}`) permanentRedirect(result.path);

  const { left, right } = result;
  if (left.id === right.id) notFound();

  const [leftDossier, rightDossier] = await loadDossiers(left.id, right.id);

  const title = `${displayName(left)} vs ${displayName(right)}`;

  // Iconic rivalries get their write-up; every other pair a plain summary.
  const popular = await findPopularMatchup(left.id, right.id);
  const note = popular && rivalryNote(popular.left.name, popular.right.name);
  const club = (p: typeof left) => (p.currentTeam ? ` (${p.currentTeam})` : "");
  const intro = `${displayName(left)}${club(left)} vs ${displayName(right)}${club(right)}: career goals and assists, per-90 output, season-by-season form, scouting ratings and transfers, side by side.`;
  const person = (p: typeof left) => ({
    "@type": "Person",
    name: displayName(p),
    image: p.photo,
    ...(p.nationality && { nationality: p.nationality }),
    ...(p.currentTeam && { memberOf: { "@type": "SportsTeam", name: p.currentTeam } }),
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        url: absoluteUrl(result.path),
        name: `${title}: Stats Comparison`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: [person(left), person(right)],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Compare", item: absoluteUrl("/compare") },
          { "@type": "ListItem", position: 3, name: title, item: absoluteUrl(result.path) },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className={`${styles.hero} ${api.matchupHero}`}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>
            <i className={styles.eyebrowDot} />
            HEAD TO HEAD • LIVE API DATA
          </div>

          <h1 className={`${styles.heroTitle} ${api.matchupTitle}`}>
            {shortName(left)} <span>VS</span> {shortName(right)}
          </h1>

          <p className={styles.heroText}>
            {note && <>{note} </>}
            {intro}
          </p>

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

      <ComparisonView key={`${left.id}-${right.id}`} left={leftDossier} right={rightDossier} />

      <section className={api.guideLink}>
        <div className={styles.container}>
          <p>
            New to stats like xG, key passes or per 90 numbers?{" "}
            <Link href="/stats-guide">Read what every number in this comparison means</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
