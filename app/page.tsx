import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PickerRow from "@/app/components/comparison/PickerRow";
import FeatureArt, { type ArtKind } from "@/app/components/home/FeatureArt";
import { hasApiKey } from "@/lib/bsd/client";
import { metricDefs, scopes } from "@/lib/player-stats";
import { openGraph } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: openGraph(
    "/",
    "Rivalry Matrix — Football Head-to-Head Comparisons",
    "Put any two footballers side by side: goals, assists, xG, ratings, scouting reports, contracts and transfers, all from live data.",
  ),
};

// BSD player photos (by id) and comparison links (by name).
const photo = (id: number) => `https://sports.bzzoiro.com/img/player/${id}/?sor=true`;

type Rivalry = {
  href: string;
  badge: string;
  title: string;
  text: string;
  // null: an open "pick your own" card with mystery portraits.
  photos: [string, string] | null;
};

const featured = {
  href: "/compare/erling-haaland-vs-kylian-mbappe",
  badge: "THE NEXT ERA",
  title: "Haaland vs Mbappé",
  text: "Power against pace: the two defining forwards of their generation, compared season by season, club by club.",
  photos: [photo(852), photo(594)],
} satisfies Rivalry;

const rivalries: Rivalry[] = [
  {
    href: "/compare/pedri-vs-jude-bellingham",
    badge: "MIDFIELD MAESTROS",
    title: "Pedri vs Bellingham",
    text: "Barcelona's metronome against Madrid's box-crashing midfielder.",
    photos: [photo(744), photo(592)],
  },
  {
    href: "/compare/lamine-yamal-vs-michael-olise",
    badge: "LEFT-FOOTED WIZARDS",
    title: "Yamal vs Olise",
    text: "Two left-footers on the right wing, dribble for dribble.",
    photos: [photo(745), photo(2467)],
  },
  {
    href: "/compare/lamine-yamal-vs-kylian-mbappe",
    badge: "PRODIGY VS SUPERSTAR",
    title: "Yamal vs Mbappé",
    text: "The teenage sensation measured against an established superstar.",
    photos: [photo(745), photo(594)],
  },
  {
    href: "/compare",
    badge: "YOUR RIVALRY",
    title: "Player 1 vs Player 2",
    text: "Pick any two players and build your own head-to-head.",
    photos: null,
  },
];

// Real match-ups only; the open "pick your own" card is left out.
const allRivalries = [featured, ...rivalries].filter((r) => r.photos);

// Hero line-up: each left player faces their rival on the same row.
const cast = allRivalries.slice(0, 3).map((r) => r.photos!);

const steps = [
  {
    title: "Type two names",
    text: "Search any player by name, from global stars to lower-league squad players.",
  },
  {
    title: "Open the comparison",
    text: "Career, club and international numbers, charts, scouting and transfers on one page.",
  },
  {
    title: "Share the link",
    text: "Every comparison has its own address, so the argument can continue anywhere.",
  },
];

type Feature = { id: string; title: string; text: string; art: ArtKind; wide?: boolean };

const features: Feature[] = [
  {
    id: "stat-battle",
    title: "Stat Battle",
    text: `${metricDefs.length}+ metrics as head-to-head bars, from shots and duels to xG.`,
    art: "battle",
    wide: true,
  },
  {
    id: "scouting",
    title: "Scouting Report",
    text: "Attribute scores, ability, potential, strengths and weaknesses.",
    art: "radar",
  },
  {
    id: "per-90",
    title: "Per 90",
    text: "Output normalised to a full match, so minutes played never skew it.",
    art: "clock",
  },
  {
    id: "analytics",
    title: "Advanced Analytics",
    text: "Season-by-season charts for goals, assists, ratings and workload.",
    art: "chart",
    wide: true,
  },
  {
    id: "bio",
    title: "Player File",
    text: "Age, height, contract, market value, wage and international record.",
    art: "number",
  },
  {
    id: "career",
    title: "Career Stats",
    text: "Appearances, minutes, goals, assists and ratings in every scope.",
    art: "number",
  },
  {
    id: "seasons",
    title: "Season By Season",
    text: "Clubs, appearances, goals, assists and ratings for every season.",
    art: "number",
  },
  {
    id: "competitions",
    title: "By Competition",
    text: "Every league and cup each player has appeared in, most played first.",
    art: "number",
  },
  {
    id: "career-path",
    title: "Career Path",
    text: "Every club and every transfer, with fees where they were published.",
    art: "path",
    wide: true,
  },
];

const heroStats = [
  { value: `${metricDefs.length}+`, label: "METRICS" },
  { value: scopes.length, label: "FILTERS" },
  { value: features.length, label: "SECTIONS" },
];

function Portrait({ src, side, className }: { src: string; side: number; className: string }) {
  return (
    <div className={`${className} ${side === 0 ? styles.ringLeft : styles.ringRight}`}>
      <Image src={src} alt="" width={300} height={300} sizes="180px" />
    </div>
  );
}

// "Messi vs Ronaldo" with the "vs" set apart.
function RivalryTitle({ title }: { title: string }) {
  const [left, right] = title.split(" vs ");
  return (
    <>
      {left} <span>vs</span> {right}
    </>
  );
}

export default function Home() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.cast} aria-hidden>
          {cast.map((pair, row) =>
            pair.map((src, side) => (
              <Portrait
                key={src}
                src={src}
                side={side}
                className={`${styles.face} ${styles[`row${row}`]} ${side === 0 ? styles.faceLeft : styles.faceRight}`}
              />
            )),
          )}
        </div>

        <div className={styles.container}>
          <div className={styles.castStrip} aria-hidden>
            {[0, 1].map((side) => (
              <div key={side} className={styles.stripGroup}>
                {cast.map((pair) => (
                  <Portrait key={pair[side]} src={pair[side]} side={side} className={styles.stripFace} />
                ))}
              </div>
            ))}
          </div>

          <h1 className={styles.heroTitle}>
            Settle the <span>debate</span>
          </h1>

          <p className={styles.heroText}>
            Put any two footballers side by side: goals, assists, xG, ratings, scouting reports,
            contracts and transfers, all from live data.
          </p>

          <div className={styles.heroActions}>
            <Link href="/compare" className={styles.ctaPrimary}>
              Compare players <span aria-hidden>→</span>
            </Link>
            <Link href={featured.href} className={styles.ctaGhost}>
              <span className={styles.ctaFaces} aria-hidden>
                {featured.photos.map((src) => (
                  <Image key={src} src={src} alt="" width={60} height={60} sizes="26px" />
                ))}
              </span>
              {featured.title}
            </Link>
          </div>

          <dl className={styles.heroStats}>
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className={styles.tickerClip} aria-hidden>
        <div className={styles.ticker}>
          <div className={styles.tickerTrack}>
            {/* Two identical halves, each wider than any screen, so the
                -50% loop never shows a gap. */}
            {[0, 1, 2, 3, 4, 5].map((copy) =>
              allRivalries.map((r) => (
                <span key={`${copy}-${r.href}`} className={styles.tickerItem}>
                  <RivalryTitle title={r.title} />
                  <b>⚽</b>
                </span>
              )),
            )}
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionLabel}>FEATURED RIVALRIES</div>
              <h2 className={styles.sectionTitle}>Start With A Classic</h2>
            </div>
          </div>

          <div className={styles.rivalryGrid}>
            <div className={styles.featuredCell} data-reveal>
              <Link href={featured.href} className={styles.featuredCard}>
                <div className={styles.featuredFaces}>
                  <Portrait src={featured.photos[0]} side={0} className={styles.bigPortrait} />
                  <span className={styles.featuredVs} aria-hidden>
                    VS
                  </span>
                  <Portrait src={featured.photos[1]} side={1} className={styles.bigPortrait} />
                </div>
                <span className={styles.badge}>{featured.badge}</span>
                <h3>
                  <RivalryTitle title={featured.title} />
                </h3>
                <p>{featured.text}</p>
                <span className={styles.more}>
                  OPEN COMPARISON <span aria-hidden>→</span>
                </span>
              </Link>
            </div>

            {rivalries.map((rivalry, i) => (
              <div key={rivalry.href} data-reveal style={{ transitionDelay: `${(i + 1) * 70}ms` }}>
                <Link href={rivalry.href} className={styles.rivalryCard}>
                  <div className={styles.rivalryFaces}>
                    {rivalry.photos
                      ? rivalry.photos.map((src, side) => (
                          <Portrait key={src} src={src} side={side} className={styles.miniPortrait} />
                        ))
                      : [0, 1].map((side) => (
                          <div
                            key={side}
                            className={`${styles.miniPortrait} ${styles.mysteryPortrait} ${side === 0 ? styles.ringLeft : styles.ringRight}`}
                          >
                            ?
                          </div>
                        ))}
                  </div>
                  <span className={styles.badge}>{rivalry.badge}</span>
                  <h3>
                    <RivalryTitle title={rivalry.title} />
                  </h3>
                  <p>{rivalry.text}</p>
                  <span className={styles.more}>
                    OPEN <span aria-hidden>→</span>
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionLabel}>HOW IT WORKS</div>
              <h2 className={styles.sectionTitle}>Two Names, One Verdict</h2>
            </div>
          </div>

          <ol className={styles.steps}>
            {steps.map((step, i) => (
              <li
                key={step.title}
                className={styles.step}
                data-reveal
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className={styles.stepNum}>{String(i + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                {i === steps.length - 1 && (
                  <code className={styles.urlChip}>/compare/erling-haaland-vs-kylian-mbappe</code>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionLabel}>INSIDE EVERY COMPARISON</div>
              <h2 className={styles.sectionTitle}>Every Way To Settle It</h2>
            </div>
            <p className={styles.sectionDescription}>
              Every comparison has the same sections, so it is always like for like, and the stat
              sections all follow the Career, Club, International and season filters.
            </p>
          </div>

          <div className={styles.bento}>
            {features.map((feature, i) => (
              <div
                key={feature.id}
                className={feature.wide ? styles.wide : undefined}
                data-reveal
                style={{ transitionDelay: `${(i % 3) * 70}ms` }}
              >
                <Link href={`${featured.href}#${feature.id}`} className={styles.tile}>
                  <div className={styles.tileArt} aria-hidden>
                    <FeatureArt kind={feature.art} index={i + 1} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                  <span className={styles.more}>
                    SEE AN EXAMPLE <span aria-hidden>→</span>
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.container}>
        <div className={styles.closing} data-reveal>
          <h2>
            Pick a <span>side</span>
          </h2>
          <p>Type two names and every number you need to argue it out is one click away.</p>
          {hasApiKey() ? (
            <PickerRow />
          ) : (
            <Link href="/compare" className={styles.ctaPrimary}>
              Compare players <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
