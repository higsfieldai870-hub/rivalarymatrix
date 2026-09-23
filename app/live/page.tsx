import type { Metadata } from "next";
import { openGraph } from "@/lib/site";
import styles from "./live.module.css";

const title = "Watch Live Football";
const description =
  "Stream live football from every major league and cup: kick-off to full time, on any device, on HattiTV.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/live" },
  openGraph: openGraph("/live", title, description),
};

const STREAM_URL = "https://hattitv.com/sports/football";

const leagues = [
  "Premier League",
  "La Liga",
  "Champions League",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Europa League",
  "World Cup Qualifiers",
];

const perks = [
  {
    icon: "▶",
    title: "Every Kick-Off",
    text: "Live matches from the biggest leagues and cups, all in one place.",
  },
  {
    icon: "◎",
    title: "Crisp HD Streams",
    text: "Sharp, smooth pictures so you never miss a through ball or a late run.",
  },
  {
    icon: "▣",
    title: "Any Screen",
    text: "Phone, tablet, laptop or TV: pick up the match wherever you are.",
  },
];

function WatchLink({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <a href={STREAM_URL} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

export default function LivePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.liveBadge}>
            <i className={styles.liveDot} />
            LIVE NOW • ON HATTITV
          </div>

          <h1 className={styles.heroTitle}>
            Watch football <span>live</span>
          </h1>

          <p className={styles.heroText}>
            Done comparing? Catch the players in action. Every big match, streamed live from
            kick-off to the final whistle.
          </p>

          <div className={styles.heroActions}>
            <WatchLink className={styles.ctaPrimary}>
              Watch live now <span aria-hidden>↗</span>
            </WatchLink>
          </div>

          {/* A mock broadcast: the whole screen is one link to the stream. */}
          <WatchLink className={styles.screen}>
            <span className={styles.srOnly}>Open live football on HattiTV</span>
            <div className={styles.pitch} aria-hidden>
              <i className={styles.halfway} />
              <i className={styles.centreCircle} />
              <i className={`${styles.box} ${styles.boxLeft}`} />
              <i className={`${styles.box} ${styles.boxRight}`} />
              <i className={styles.ball} />
            </div>

            <div className={styles.scoreboard} aria-hidden>
              <span className={styles.team}>HOME</span>
              <span className={styles.score}>
                2<i>:</i>1
              </span>
              <span className={styles.team}>AWAY</span>
              <span className={styles.clock}>78&apos;</span>
            </div>

            <div className={styles.onAir} aria-hidden>
              <i className={styles.liveDot} />
              LIVE
            </div>

            <div className={styles.play} aria-hidden>
              <span>▶</span>
            </div>

            <div className={styles.screenCaption} aria-hidden>
              TAP TO START WATCHING
            </div>
          </WatchLink>
        </div>
      </section>

      <div className={styles.tickerClip} aria-hidden>
        <div className={styles.ticker}>
          <div className={styles.tickerTrack}>
            {[0, 1, 2, 3].map((copy) =>
              leagues.map((league) => (
                <span key={`${copy}-${league}`} className={styles.tickerItem}>
                  {league}
                  <b>⚽</b>
                </span>
              )),
            )}
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>WHY WATCH HERE</div>
          <h2 className={styles.sectionTitle}>The Whole Game, Live</h2>

          <div className={styles.perks}>
            {perks.map((perk, i) => (
              <div
                key={perk.title}
                className={styles.perk}
                data-reveal
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className={styles.perkIcon} aria-hidden>
                  {perk.icon}
                </span>
                <h3>{perk.title}</h3>
                <p>{perk.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.container}>
        <div className={styles.closing} data-reveal>
          <h2>
            Don&apos;t miss <span>kick-off</span>
          </h2>
          <p>The match is on. Grab a seat and open the stream.</p>
          <WatchLink className={styles.ctaPrimary}>
            Go to HattiTV Football <span aria-hidden>↗</span>
          </WatchLink>
        </div>
      </section>
    </>
  );
}
