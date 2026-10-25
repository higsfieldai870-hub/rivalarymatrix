import type { Metadata } from "next";
import Link from "next/link";
import api from "@/app/components/comparison/api.module.css";
import styles from "@/app/components/comparison/comparison.module.css";
import { MissingKeyNotice } from "@/app/components/comparison/Notices";
import PickerRow from "@/app/components/comparison/PickerRow";
import { hasApiKey } from "@/lib/bsd/client";
import { matchupPath, slugify } from "@/lib/player-slug";
import { iconicRivalries } from "@/lib/popular-players";
import { openGraph } from "@/lib/site";
import page from "./compare.module.css";

const title = "Compare Any Two Players";
const description =
  "Search any two footballers and compare their live stats side by side: goals, assists, xG, ratings, scouting reports, transfers and more.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/compare" },
  openGraph: openGraph("/compare", title, description),
};

const quickPicks = [
  { label: "Messi vs Ronaldo", href: "/compare/lionel-messi-vs-cristiano-ronaldo" },
  { label: "Haaland vs Mbappé", href: "/compare/erling-haaland-vs-kylian-mbappe" },
];

const features = [
  {
    title: "Career numbers",
    text: "Goals, assists, goal contributions, appearances and minutes, with goals per game, minutes per goal and average match rating, so totals and efficiency sit side by side.",
  },
  {
    title: "Season by season",
    text: "Charts of goals, assists, minutes and match rating for every season on record, so you can see when each player peaked and how long they stayed there.",
  },
  {
    title: "Per 90 minutes",
    text: "Output scaled to a full match, the fair way to compare a regular starter with a player who comes off the bench or has missed time through injury.",
  },
  {
    title: "Advanced analytics",
    text: "Shooting, creativity, dribbling and duels, defending and discipline: shot accuracy and conversion, key passes, pass accuracy, tackles, interceptions and cards.",
  },
  {
    title: "Scouting report",
    text: "Ratings for attacking, technical, tactical, defending and creativity, plus potential, scouting role and injury risk, drawn on a radar for both players at once.",
  },
  {
    title: "Profile and career path",
    text: "Age, height, preferred foot, market value, contract and wage, every club played for, international caps and goals, trophies won and injury history.",
  },
];

const steps = [
  {
    title: "Pick two players",
    text: "Start typing a name in each box and choose from the suggestions. Search covers global stars and squad players in leagues around the world.",
  },
  {
    title: "Open the comparison",
    text: "Every matchup gets its own page and link, like /compare/erling-haaland-vs-kylian-mbappe, so you can bookmark it or send it to whoever you're arguing with.",
  },
  {
    title: "Switch the view",
    text: "Flip between career, club and international football, then scroll down for a breakdown by competition: league, cups, Champions League and national team.",
  },
];

const faqs = [
  {
    q: "Which players can I compare?",
    a: "Any two players in the database, from any position and any league it covers. Comparing players in the same role gives the fairest read, since a striker and a centre-back are judged on different numbers.",
  },
  {
    q: "How far back does the data go?",
    a: "Match data covers the 2011/12 season onwards. Earlier seasons aren't included, so career totals for players who started before then can sit below their official figures.",
  },
  {
    q: "How up to date are the stats?",
    a: "Stats come from a live football data feed and refresh through the day, so a comparison reflects the latest matches without you doing anything.",
  },
  {
    q: "Why look at per 90 numbers?",
    a: "Totals reward whoever has played more. Per 90 figures divide output by minutes played, so a young player in their first full season can be measured fairly against an established star.",
  },
];

// The same iconic pairs as the rivalries hub, linked by name. The comparison
// page redirects each name to the player's canonical URL.
const popular = iconicRivalries.map(([a, b]) => ({
  label: `${a} vs ${b}`,
  href: matchupPath(slugify(a), slugify(b)),
}));

export default function ComparePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>
            <i className={styles.eyebrowDot} />
            BUILD YOUR OWN • LIVE API DATA
          </div>

          <h1 className={styles.heroTitle}>
            PLAYER <span>VS</span> PLAYER
          </h1>

          <p className={styles.heroText}>
            Type the names of any two players, then open the full comparison: match stats, xG,
            scouting reports, contracts, transfers and more.
          </p>

          {hasApiKey() ? (
            <PickerRow />
          ) : (
            <div className={api.pickerNotice}>
              <MissingKeyNotice />
            </div>
          )}

          <div className={api.quickPicks}>
            <span>TRY</span>
            {quickPicks.map((pick) => (
              <Link key={pick.label} className={api.quickPick} href={pick.href}>
                {pick.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className={page.container}>
        <section className={page.section}>
          <div className={page.label}>WHAT YOU GET</div>
          <h2 className={page.title}>Every Number, Side By Side</h2>
          <p className={page.lead}>
            A player comparison here is more than a goals column. Each head-to-head lines both
            players up across the full range of their game, from raw output to the underlying
            numbers scouts use, so you can see not just who scored more but how and when.
          </p>
          <div className={page.grid}>
            {features.map((f) => (
              <div key={f.title} className={page.card}>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={page.section}>
          <div className={page.label}>HOW IT WORKS</div>
          <h2 className={page.title}>Compare Players In Three Steps</h2>
          <ol className={page.steps}>
            {steps.map((s, i) => (
              <li key={s.title} className={page.card}>
                <span className={page.stepNumber}>{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={page.section}>
          <div className={page.label}>NEED AN IDEA?</div>
          <h2 className={page.title}>Popular Player Comparisons</h2>
          <p className={page.lead}>
            The head-to-heads fans search for most. For hundreds more, grouped by position, browse
            the <Link href="/rivalries">full list of football rivalries</Link>.
          </p>
          <ul className={page.links}>
            {popular.map((p) => (
              <li key={p.href}>
                <Link href={p.href}>{p.label}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={page.section}>
          <div className={page.label}>FAQ</div>
          <h2 className={page.title}>Player Comparison Questions</h2>
          <div className={page.faq}>
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
