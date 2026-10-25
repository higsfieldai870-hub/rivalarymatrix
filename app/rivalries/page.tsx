import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import compare from "@/app/components/comparison/comparison.module.css";
import JsonLd from "@/app/components/JsonLd";
import { getPopularMatchups, resolvePopularPlayers, type PopularMatchup } from "@/lib/bsd/popular";
import { matchupPath, slugify } from "@/lib/player-slug";
import { iconicRivalries, popularPlayers, roleLabels, type Role } from "@/lib/popular-players";
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

// Name-based links for when BSD can't be reached. The comparison page
// redirects a name to the player's canonical URL, so these always resolve,
// and the page never renders empty for crawlers.
type StaticMatchup = { path: string; left: string; right: string };

const staticMatchup = (left: string, right: string): StaticMatchup => ({
  path: matchupPath(slugify(left), slugify(right)),
  left,
  right,
});

const staticIconic = iconicRivalries.map(([a, b]) => staticMatchup(a, b));

const staticByRole = roles.map((role) => {
  const names = popularPlayers.filter((p) => p.role === role).map((p) => p.name);
  return {
    role,
    list: names.flatMap((a, i) => names.slice(i + 1).map((b) => staticMatchup(a, b))),
  };
});

const roleIntros: Record<Role, string> = {
  forward:
    "Centre-forwards live and die by the goal column, so these pages lead with goals, shots and minutes per goal, then show how each striker's numbers moved season by season.",
  winger:
    "Wide players are judged on end product and ball-carrying: goals plus assists, successful dribbles and how consistently they produce across a whole campaign.",
  midfielder:
    "Midfield comparisons balance creation with control: assists, passing volume, tackles and interceptions, so a deep playmaker and a box-to-box runner can be read fairly.",
  defender:
    "Defenders are compared on duels, tackles, interceptions, blocks and discipline, alongside the attacking contribution modern full-backs and centre-backs are expected to add.",
  goalkeeper:
    "Goalkeeper head-to-heads focus on saves, goals conceded and match ratings, the numbers that separate a good season between the posts from a great one.",
};

function MatchupTitle({ m }: { m: PopularMatchup }) {
  return (
    <>
      {m.left.name} <span>vs</span> {m.right.name}
    </>
  );
}

function StaticCard({ m }: { m: StaticMatchup }) {
  return (
    <Link href={m.path} className={styles.card}>
      <h3>
        {m.left} <span>vs</span> {m.right}
      </h3>
      <span className={styles.more}>
        COMPARE <span aria-hidden>→</span>
      </span>
    </Link>
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
  const listed = iconic.length
    ? iconic.map((m) => ({ name: `${m.left.name} vs ${m.right.name}`, path: m.path }))
    : staticIconic.map((m) => ({ name: `${m.left} vs ${m.right}`, path: m.path }));
  const total =
    matchups.length || staticByRole.reduce((n, r) => n + r.list.length, staticIconic.length);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Iconic football rivalries",
    itemListElement: listed.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.name,
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
            {total} HEAD-TO-HEADS • LIVE API DATA
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
        <section className={styles.section}>
          <div className={styles.intro}>
            <p>
              Every rivalry below opens a full head-to-head built from match data: career goals and
              assists, appearances and minutes, season-by-season charts, per-90 efficiency, match
              ratings and trophy cabinets, side by side. Start with the classics fans have argued
              about for years, like <Link href={staticIconic[0].path}>Messi vs Ronaldo</Link>, or
              jump to the position you care about.
            </p>
            <p>
              Comparisons are grouped by role, because a striker and a goalkeeper are judged on
              different numbers. If the pairing you want isn&apos;t listed,{" "}
              <Link href="/compare">build your own comparison</Link> between any two players.
            </p>
          </div>
        </section>

        {matchups.length === 0 ? (
          <>
            <section className={styles.section}>
              <div className={styles.label}>THE CLASSICS</div>
              <h2 className={styles.title}>Iconic Rivalries</h2>
              <div className={styles.cardGrid}>
                {staticIconic.map((m) => (
                  <StaticCard key={m.path} m={m} />
                ))}
              </div>
            </section>

            {staticByRole.map(({ role, list }) => (
              <section key={role} className={styles.section}>
                <div className={styles.label}>SAME POSITION</div>
                <h2 className={styles.title}>{roleLabels[role]} Head To Head</h2>
                <p className={styles.roleIntro}>{roleIntros[role]}</p>
                <ul className={styles.linkList}>
                  {list.map((m) => (
                    <li key={m.path}>
                      <Link href={m.path}>
                        {m.left} vs {m.right}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
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
                  <p className={styles.roleIntro}>{roleIntros[role]}</p>
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
              <p className={styles.roleIntro}>
                Every player here is paired with every other, so you can test any star against the
                rest of the list. Open a name to see all of their head-to-heads.
              </p>
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

        <section className={styles.section}>
          <div className={styles.label}>THE DATA</div>
          <h2 className={styles.title}>How The Comparisons Work</h2>
          <div className={styles.intro}>
            <p>
              Each comparison pulls both players&apos; records season by season and lines them up
              on the same scale: totals for the debate, per-90 rates for fairness when one player
              has played far more minutes, and charts that show when each was at their peak.
            </p>
            <p>
              Match data covers the 2011/12 season onwards. Earlier seasons aren&apos;t included,
              so career totals for long-serving players, Messi and Ronaldo among them, can sit below
              the official figures.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
