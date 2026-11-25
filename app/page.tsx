import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PickerRow from "@/app/components/comparison/PickerRow";
import FeatureArt, { type ArtKind } from "@/app/components/home/FeatureArt";
import { hasApiKey } from "@/lib/bsd/client";
import { getHomeRivalries } from "@/lib/bsd/home";
import { metricDefs, scopes } from "@/lib/player-stats";
import { openGraph } from "@/lib/site";
import styles from "./page.module.css";

// The head-to-head answers come from live data; rebuilt hourly so a rivalry
// missed during an API outage comes back quickly.
export const revalidate = 3600;

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

const faqs = [
  {
    q: "What is Rivalry Matrix?",
    a: "A free football statistics site that puts two players side by side: career goals and assists, per 90 numbers, season-by-season charts, advanced stats, scouting reports and transfers, all on one page.",
  },
  {
    q: "How do I compare two football players?",
    a: "Type a name into each search box on the compare page, pick the players from the suggestions and open the comparison. Every pairing gets its own page and link.",
  },
  {
    q: "Is Rivalry Matrix free to use?",
    a: "Yes. There's no sign-up and no account; the site is supported by advertising.",
  },
  {
    q: "Where do the stats come from?",
    a: "From BSD (Bzzoiro Sports Data), a football data provider. The same data powers every comparison on the site.",
  },
  {
    q: "How far back do the stats go?",
    a: "Match data covers the 2011/12 season onwards. Detailed per-match stats such as shots, passes and duels are available for most matches from the mid-2010s.",
  },
  {
    q: "Why are some career totals lower than official figures?",
    a: "Because match data starts in 2011/12. For Messi and Ronaldo, earlier club seasons and international matches are added from Transfermarkt (appearances, minutes, goals and assists), so their totals cover the full career. For other players whose careers began earlier, totals count from 2011/12 on.",
  },
  {
    q: "How often are the stats updated?",
    a: "Player stats are refreshed daily, so a comparison picks up recent matches within a day.",
  },
  {
    q: "What does per 90 mean?",
    a: "A per 90 figure divides a total by minutes played and scales it to a full match. It's the fairest way to compare a regular starter with a player who comes off the bench or has missed games.",
  },
  {
    q: "What is xG (expected goals)?",
    a: "Expected goals estimates how many goals a player's chances would produce for an average finisher, based on where and how each shot was taken. Scoring more than your xG points to good finishing.",
  },
  {
    q: "What is xA (expected assists)?",
    a: "The expected goals value of the chances a player's passes create. It measures chance creation without depending on whether a teammate finishes.",
  },
  {
    q: "What is a key pass?",
    a: "A pass that leads directly to a teammate's shot, whether or not the shot goes in. It's one of the best simple measures of creativity.",
  },
  {
    q: "What is the average match rating?",
    a: "The average of a player's per-match performance ratings, which score every action in a game. Higher is better.",
  },
  {
    q: "Can I compare players in different positions?",
    a: "Yes, any two players can be compared. Comparing players in the same position is the fairest, since a striker and a defender are judged on different numbers.",
  },
  {
    q: "Can I compare goalkeepers?",
    a: "Yes. Goalkeeper comparisons include saves, goals conceded and match ratings alongside appearances and minutes.",
  },
  {
    q: "Are international matches included?",
    a: "Yes. Switch between career, club and international numbers with the tabs at the top of any comparison.",
  },
  {
    q: "Can I see Champions League stats on their own?",
    a: "Yes. The Champions League tab limits every number in the comparison to Champions League matches, and there's a latest-season tab for current form.",
  },
  {
    q: "What is in the scouting report?",
    a: "Ratings for attacking, technical, tactical, defending and creativity, an overall ability rating out of 200, potential, scouting role and injury risk.",
  },
  {
    q: "Does it show transfer history?",
    a: "Yes. The career path section lists every club a player has played for and their transfers, with fees where they were published.",
  },
  {
    q: "Can I share a comparison?",
    a: "Yes. Every comparison has its own address, such as /compare/erling-haaland-vs-kylian-mbappe, so you can bookmark it or send it to anyone.",
  },
  {
    q: "What if I can't find a player?",
    a: "Check the spelling or try the player's surname alone. If they still don't appear, contact us with their full name and current club.",
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

export default async function Home() {
  const searched = await getHomeRivalries();

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
          </div>

          {/* Every featured rivalry one tap away, two by two under the main button. */}
          <div className={styles.heroPicks}>
            {allRivalries.map((r) => (
              <Link key={r.href} href={r.href} className={styles.ctaGhost}>
                <span className={styles.ctaFaces} aria-hidden>
                  {r.photos!.map((src) => (
                    <Image key={src} src={src} alt="" width={28} height={28} />
                  ))}
                </span>
                {r.title}
              </Link>
            ))}
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
            <Link href="/rivalries" className={styles.sectionLink}>
              Browse all football rivalries <span aria-hidden>→</span>
            </Link>
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

      {searched.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.sectionLabel}>MOST SEARCHED</div>
                <h2 className={styles.sectionTitle}>The Rivalries Fans Search For</h2>
              </div>
              <p className={styles.sectionDescription}>
                The questions fans ask most, answered from our match data. It covers the 2011/12
                season onwards, plus Messi&apos;s and Ronaldo&apos;s full careers, so totals for other
                long careers sit below official figures. Open any rivalry for the full comparison.
              </p>
            </div>

            <div className={styles.searchedGrid}>
              {searched.map((r) => (
                <article key={r.href} className={styles.searchedCard}>
                  <div className={styles.searchedHead}>
                    <span className={styles.ctaFaces} aria-hidden>
                      {r.photos.map((src) => (
                        <Image key={src} src={src} alt="" width={28} height={28} />
                      ))}
                    </span>
                    <h3>
                      <Link href={r.href}>
                        <RivalryTitle title={r.title} />
                      </Link>
                    </h3>
                  </div>
                  {r.note && <p className={styles.searchedNote}>{r.note}</p>}
                  <div className={styles.faqList}>
                    {r.faqs.map((f, i) => (
                      <details key={f.q} className={styles.faqItem} open={i === 0}>
                        <summary>{f.q}</summary>
                        <p>{f.a}</p>
                      </details>
                    ))}
                  </div>
                  <Link href={r.href} className={styles.more}>
                    FULL COMPARISON <span aria-hidden>→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

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

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionLabel}>FAQ</div>
              <h2 className={styles.sectionTitle}>Questions, Answered</h2>
            </div>
          </div>

          <div className={`${styles.faqList} ${styles.faqColumns}`}>
            {faqs.map((f) => (
              <details key={f.q} className={styles.faqItem}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
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
