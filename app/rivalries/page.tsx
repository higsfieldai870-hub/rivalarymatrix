import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import compare from "@/app/components/comparison/comparison.module.css";
import JsonLd from "@/app/components/JsonLd";
import { getPopularMatchups, type PopularMatchup } from "@/lib/bsd/popular";
import { matchupPath, slugify } from "@/lib/player-slug";
import {
  iconicRivalries,
  popularPlayers,
  rivalryNote,
  roleLabels,
  type Role,
} from "@/lib/popular-players";
import { absoluteUrl, openGraph } from "@/lib/site";
import styles from "./rivalries.module.css";

// Same lifetime as the sitemap, which lists the same comparisons.
export const revalidate = 86400;

const title = "Popular Football Rivalries & Player Comparisons";
const description =
  "Browse the most searched football head-to-heads: Messi vs Ronaldo, Haaland vs Mbappé, Yamal vs Vinícius and 200 more, grouped by position, all with live stats.";

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

const faqs = [
  {
    q: "What makes a football rivalry?",
    a: "Usually one of three things: two players at rival clubs, two players chasing the same place in a national team, or two stars of the same generation whose fans can't agree who is better. The iconic list above covers all three.",
  },
  {
    q: "Why are the comparisons grouped by position?",
    a: "Because players are judged on different numbers. Goals and shots matter most for a striker; tackles, interceptions and duels for a defender; saves and goals conceded for a goalkeeper. Comparing within a position keeps the debate fair.",
  },
  {
    q: "Are career totals complete?",
    a: "Match data starts in the 2011/12 season. For players whose careers began earlier, such as Messi and Ronaldo, the totals here cover their careers from that season on and can sit below the official figures.",
  },
  {
    q: "Can I compare players who aren't listed?",
    a: "Yes. These are the most searched matchups, but you can build a comparison between any two players in the database.",
  },
];

function MatchupTitle({ m }: { m: PopularMatchup }) {
  return (
    <>
      {m.left.name} <span>vs</span> {m.right.name}
    </>
  );
}

function StaticCard({ m }: { m: StaticMatchup }) {
  const note = rivalryNote(m.left, m.right);
  return (
    <Link href={m.path} className={styles.card}>
      <h3>
        {m.left} <span>vs</span> {m.right}
      </h3>
      {note && <p>{note}</p>}
      <span className={styles.more}>
        COMPARE <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

function MatchupCard({ m }: { m: PopularMatchup }) {
  const note = m.kind === "iconic" ? rivalryNote(m.left.name, m.right.name) : undefined;
  return (
    <Link href={m.path} className={styles.card}>
      <div className={styles.faces}>
        {[m.left, m.right].map((p, side) => (
          <div
            key={p.player.id}
            className={`${styles.face} ${side === 0 ? styles.faceLeft : styles.faceRight}`}
          >
            {/* Fixed size, no `sizes`: a 1x/2x srcset instead of one entry per breakpoint,
                which kept this page's HTML far larger than its content. */}
            <Image src={p.player.photo} alt="" width={56} height={56} />
          </div>
        ))}
      </div>
      <h3>
        <MatchupTitle m={m} />
      </h3>
      {note && <p>{note}</p>}
      <span className={styles.more}>
        COMPARE <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

export default async function RivalriesPage() {
  const matchups = await getPopularMatchups();
  const iconic = matchups.filter((m) => m.kind === "iconic");

  // An inline link to a popular pair, at its canonical URL when BSD resolved it.
  const paths = new Map(matchups.map((m) => [`${m.left.name}|${m.right.name}`, m.path]));
  const vs = (a: string, b: string) => (
    <Link href={paths.get(`${a}|${b}`) ?? paths.get(`${b}|${a}`) ?? staticMatchup(a, b).path}>
      {a} vs {b}
    </Link>
  );
  const listed = iconic.length
    ? iconic.map((m) => ({ name: `${m.left.name} vs ${m.right.name}`, path: m.path }))
    : staticIconic.map((m) => ({ name: `${m.left} vs ${m.right}`, path: m.path }));
  // Mixed-position pairs aren't listed here (they're kept out of the index),
  // so the count covers the iconic and same-position ones on this page.
  const total =
    matchups.filter((m) => m.kind !== "cross-role").length ||
    staticByRole.reduce((n, r) => n + r.list.length, staticIconic.length);

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
            {total} HEAD-TO-HEADS
          </div>
          <h1 className={compare.heroTitle}>
            FOOTBALL <span>RIVALRIES</span>
          </h1>
          <p className={compare.heroText}>
            The comparisons fans argue about most, plus head-to-heads between the biggest names in
            every position. Pick one and settle it with the numbers.
          </p>
        </div>
      </section>

      <div className={styles.container}>
        <section className={styles.section}>
          <div className={styles.intro}>
            <p>
              Every rivalry below opens a full head-to-head built from match data: career goals and
              assists, appearances and minutes, season-by-season charts, per-90 efficiency, match
              ratings and scouting reports, side by side. Start with the classics fans have argued
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
          </>
        )}

        <section className={styles.section}>
          <div className={styles.label}>THE STORYLINES</div>
          <h2 className={styles.title}>Where The Great Rivalries Come From</h2>
          <div className={styles.stories}>
            <div>
              <h3>El Clásico: Barcelona vs Real Madrid</h3>
              <p>
                No fixture produces more player debates. For a decade it was {vs("Lionel Messi", "Cristiano Ronaldo")},
                the two meeting in Clásico after Clásico. The new generation has taken over:{" "}
                {vs("Lamine Yamal", "Kylian Mbappé")} on the flanks and up front,{" "}
                {vs("Vinícius Júnior", "Lamine Yamal")} wing against wing, and{" "}
                {vs("Pedri", "Jude Bellingham")} in the middle of the pitch.
              </p>
            </div>
            <div>
              <h3>The Premier League</h3>
              <p>
                England&apos;s top flight is built on rivalries between clubs, and the players carry
                them on. Liverpool and Arsenal meet in {vs("Mohamed Salah", "Bukayo Saka")} and{" "}
                {vs("Virgil van Dijk", "William Saliba")}; Manchester&apos;s midfields in{" "}
                {vs("Kevin De Bruyne", "Bruno Fernandes")}. For the best striker in the league,
                it&apos;s {vs("Harry Kane", "Erling Haaland")}.
              </p>
            </div>
            <div>
              <h3>Germany and the Bundesliga</h3>
              <p>
                Germany&apos;s brightest talents are compared constantly, none more than{" "}
                {vs("Florian Wirtz", "Jamal Musiala")}. At Bayern Munich the question is how one
                great number nine measures up to the next: {vs("Robert Lewandowski", "Harry Kane")}.
              </p>
            </div>
            <div>
              <h3>Teammates and generations</h3>
              <p>
                Some of the best debates are between players on the same side.{" "}
                {vs("Lionel Messi", "Neymar")} shared two dressing rooms;{" "}
                {vs("Cristiano Ronaldo", "Karim Benzema")} spent nine seasons together at Real
                Madrid. And for the era after them, everyone asks the same thing:{" "}
                {vs("Erling Haaland", "Kylian Mbappé")}.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.label}>THE METHOD</div>
          <h2 className={styles.title}>How To Settle A Football Debate</h2>
          <ol className={styles.method}>
            <li>
              <h3>Compare like with like</h3>
              <p>
                Pick players in the same position and, ideally, the same era. A winger&apos;s
                goal tally means something different from a striker&apos;s, and football in 2012
                was played at a different tempo from today.
              </p>
            </li>
            <li>
              <h3>Use per 90 numbers, not just totals</h3>
              <p>
                Totals reward whoever has played the most. Goals and assists per 90 minutes show
                who produces more when they are actually on the pitch.
              </p>
            </li>
            <li>
              <h3>Look at peak and consistency</h3>
              <p>
                The season-by-season charts show how high each player&apos;s best year went and
                how many seasons they stayed near it. A long run of good years can beat one
                spectacular season.
              </p>
            </li>
            <li>
              <h3>Check the big stage</h3>
              <p>
                Switch the comparison to Champions League or international football to see who
                delivers against the strongest opposition, not just in domestic league games.
              </p>
            </li>
            <li>
              <h3>Read the underlying numbers</h3>
              <p>
                Expected goals, shot conversion and key passes separate finishing from chance
                creation, and show whether a hot streak is sustainable or running ahead of the
                chances a player gets.
              </p>
            </li>
          </ol>
        </section>

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

        <section className={styles.section}>
          <div className={styles.label}>FAQ</div>
          <h2 className={styles.title}>Football Rivalry Questions</h2>
          <div className={styles.faq}>
            {faqs.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
