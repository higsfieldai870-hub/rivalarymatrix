import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import compare from "@/app/components/comparison/comparison.module.css";
import JsonLd from "@/app/components/JsonLd";
import { getPopularMatchups, resolvePopularPlayers, type PopularMatchup } from "@/lib/bsd/popular";
import { roleLabels, type Role } from "@/lib/popular-players";
import { absoluteUrl, openGraph } from "@/lib/site";
import styles from "./rivalries.module.css";

// Same lifetime as the sitemap, which lists the same comparisons.
export const revalidate = 86400;

const title = "Popular Football Rivalries & Player Comparisons";
const description =
  "Browse the most searched football head-to-heads: Messi vs Ronaldo, Haaland vs Mbappé, Yamal vs Vinícius and hundreds more, all with live stats.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/rivalries" },
  openGraph: openGraph("/rivalries", title, description),
};

const roles = Object.keys(roleLabels) as Role[];

function MatchupTitle({ m }: { m: PopularMatchup }) {
  return (
    <>
      {m.left.name} <span>vs</span> {m.right.name}
    </>
  );
}

function MatchupCard({ m }: { m: PopularMatchup }) {
  return (
    <Link href={m.path} className={styles.card}>
      <div className={styles.faces}>
        {[m.left, m.right].map((p, side) => (
          <div
            key={p.player.id}
            className={`${styles.face} ${side === 0 ? styles.faceLeft : styles.faceRight}`}
          >
            <Image src={p.player.photo} alt="" width={120} height={120} sizes="56px" />
          </div>
        ))}
      </div>
      <h3>
        <MatchupTitle m={m} />
      </h3>
      <span className={styles.more}>
        COMPARE <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

export default async function RivalriesPage() {
  const [players, matchups] = await Promise.all([resolvePopularPlayers(), getPopularMatchups()]);
  const iconic = matchups.filter((m) => m.kind === "iconic");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Iconic football rivalries",
    itemListElement: iconic.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${m.left.name} vs ${m.right.name}`,
      url: absoluteUrl(m.path),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className={compare.hero}>
        <div className={compare.container}>
          <div className={compare.eyebrow}>
            <i className={compare.eyebrowDot} />
            {matchups.length} HEAD-TO-HEADS • LIVE API DATA
          </div>
          <h1 className={compare.heroTitle}>
            FOOTBALL <span>RIVALRIES</span>
          </h1>
          <p className={compare.heroText}>
            The comparisons fans argue about most, plus every pairing of the game&apos;s biggest
            names. Pick one and settle it with the numbers.
          </p>
        </div>
      </section>

      <div className={styles.container}>
        {matchups.length === 0 ? (
          <p className={styles.empty}>
            Rivalries are unavailable right now. <Link href="/compare">Build your own comparison</Link>.
          </p>
        ) : (
          <>
            <section className={styles.section}>
              <div className={styles.label}>THE CLASSICS</div>
              <h2 className={styles.title}>Iconic Rivalries</h2>
              <div className={styles.cardGrid}>
                {iconic.map((m) => (
                  <MatchupCard key={m.path} m={m} />
                ))}
              </div>
            </section>

            {roles.map((role) => {
              const list = matchups.filter((m) => m.kind === "same-role" && m.left.role === role);
              if (!list.length) return null;
              return (
                <section key={role} className={styles.section}>
                  <div className={styles.label}>SAME POSITION</div>
                  <h2 className={styles.title}>{roleLabels[role]} Head To Head</h2>
                  <div className={styles.cardGrid}>
                    {list.map((m) => (
                      <MatchupCard key={m.path} m={m} />
                    ))}
                  </div>
                </section>
              );
            })}

            <section className={styles.section}>
              <div className={styles.label}>EVERY PAIRING</div>
              <h2 className={styles.title}>Compare By Player</h2>
              <div className={styles.players}>
                {players.map((p) => {
                  const list = matchups.filter(
                    (m) => m.left.player.id === p.player.id || m.right.player.id === p.player.id,
                  );
                  return (
                    <details key={p.player.id} className={styles.player}>
                      <summary>
                        <Image src={p.player.photo} alt="" width={80} height={80} sizes="36px" />
                        <span>{p.name}</span>
                        <em>{list.length}</em>
                      </summary>
                      <ul>
                        {list.map((m) => (
                          <li key={m.path}>
                            <Link href={m.path}>
                              vs {m.left.player.id === p.player.id ? m.right.name : m.left.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
