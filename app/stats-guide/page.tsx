import type { Metadata } from "next";
import Link from "next/link";
import compare from "@/app/components/comparison/comparison.module.css";
import JsonLd from "@/app/components/JsonLd";
import { absoluteUrl, openGraph } from "@/lib/site";
import styles from "./stats-guide.module.css";

// Plain-English definitions for every number on a comparison page. One page
// that every comparison links to, rather than the same text on each of them.

const title = "Football Stats Explained: xG, Per 90, Key Passes and More";
const description =
  "What every football stat means, in plain English: expected goals (xG), xA, per 90 numbers, key passes, duels, shot conversion, match ratings and scouting reports.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/stats-guide" },
  openGraph: openGraph("/stats-guide", title, description),
};

type Term = { term: string; meaning: string };
type Group = { title: string; intro?: string; terms: Term[] };

const groups: Group[] = [
  {
    title: "The views",
    intro: "The tabs at the top of the comparison change which matches every number below counts.",
    terms: [
      { term: "Career", meaning: "Every club and international match on record, added together." },
      { term: "Club", meaning: "Club football only: league, domestic cups and European competition." },
      { term: "International", meaning: "Matches for the national team." },
      { term: "Champions League", meaning: "UEFA Champions League matches only, the closest thing to a like-for-like test against elite opposition." },
      { term: "Latest Season", meaning: "The most recent season either player has data for, for current form." },
    ],
  },
  {
    title: "Output",
    terms: [
      { term: "Goals", meaning: "Goals scored, penalties included. Own goals don't count." },
      { term: "Assists", meaning: "The final pass or touch before a teammate scores." },
      { term: "Goal Contributions (G+A)", meaning: "Goals plus assists: the simplest measure of how many goals a player is directly involved in." },
      { term: "Appearances", meaning: "Matches played, whether starting or coming off the bench." },
      { term: "Minutes", meaning: "Total time on the pitch. The fairest base for comparing output, since appearances off the bench count the same as full games." },
      { term: "Goals / Game and G+A / Game", meaning: "Goals, or goals plus assists, divided by appearances." },
      { term: "Minutes / Goal", meaning: "How many minutes on average between goals. Lower is better." },
      { term: "Average Rating", meaning: "The average of the player's match performance ratings, which score every action in a game. Higher is better." },
    ],
  },
  {
    title: "Shooting",
    terms: [
      { term: "Shots", meaning: "Every attempt at goal, whether on target, off target or blocked." },
      { term: "Shots On Target", meaning: "Shots that would have gone in without a save: the goalkeeper had to stop them, or they scored." },
      { term: "Shot Accuracy", meaning: "Shots on target as a percentage of all shots." },
      { term: "Shot Conversion", meaning: "Goals as a percentage of shots: how often a shot ends up in the net." },
      { term: "Expected Goals (xG)", meaning: "How many goals a player's chances would produce for an average finisher, based on where and how each shot was taken. Scoring more than your xG suggests elite finishing; fewer suggests missed chances." },
      { term: "xG On Target (xGOT)", meaning: "Expected goals measured after the shot, taking account of where it was placed in the goal. It rewards hitting the corners." },
      { term: "Big Chances Missed", meaning: "Clear opportunities, usually one against one or close range, that didn't result in a goal." },
    ],
  },
  {
    title: "Creativity and passing",
    terms: [
      { term: "Key Passes", meaning: "Passes that lead directly to a teammate's shot, whether or not it goes in." },
      { term: "Expected Assists (xA)", meaning: "The expected goals value of the shots a player's passes set up: chance creation that doesn't depend on the teammate finishing." },
      { term: "Big Chances Created", meaning: "Passes that set up a clear scoring opportunity." },
      { term: "Passes and Accurate Passes", meaning: "All passes attempted, and those that reached a teammate." },
      { term: "Pass Accuracy", meaning: "Accurate passes as a percentage of all passes. Defenders and deep midfielders usually score higher, as their passes carry less risk." },
      { term: "Progressive Carries", meaning: "Runs with the ball that move it significantly towards the opponent's goal." },
    ],
  },
  {
    title: "Dribbling and duels",
    terms: [
      { term: "Dribbles Attempted and Successful Dribbles", meaning: "Attempts to take on an opponent with the ball, and those that got past them." },
      { term: "Dribble Success", meaning: "Successful dribbles as a percentage of attempts." },
      { term: "Duels and Duels Won", meaning: "One-against-one contests for the ball, on the ground or in the air, and how many the player won." },
      { term: "Duel Win Rate", meaning: "Duels won as a percentage of all duels." },
      { term: "Fouls Drawn", meaning: "Times the player was fouled: a sign of how hard they are to stop." },
    ],
  },
  {
    title: "Defending and discipline",
    terms: [
      { term: "Tackles", meaning: "Challenges that win the ball, or knock it away, from an opponent in possession." },
      { term: "Interceptions", meaning: "Passes cut out by reading the play." },
      { term: "Blocks", meaning: "Shots or passes blocked with the body." },
      { term: "Dribbled Past", meaning: "Times an opponent beat the player with a dribble. Lower is better." },
      { term: "Fouls Committed, Yellow Cards and Red Cards", meaning: "Fouls given against the player, and the cards they received." },
    ],
  },
  {
    title: "Goalkeeping",
    terms: [
      { term: "Saves", meaning: "Shots on target the goalkeeper stopped." },
      { term: "Goals Conceded", meaning: "Goals let in while on the pitch. Lower is better, though it depends heavily on the defence in front." },
    ],
  },
  {
    title: "Per 90 minutes",
    intro: "Per 90 numbers divide a total by minutes played and scale it to a full match. They are the fairest way to compare a regular starter with a player who comes off the bench or has missed time, and the profile radar is built from them.",
    terms: [
      { term: "Goals, Assists and G+A per 90", meaning: "Output for every full match's worth of minutes." },
      { term: "Shots, Key Passes and Successful Dribbles per 90", meaning: "How often a player shoots, creates and beats a man per match." },
      { term: "Duels Won and Tackles + Interceptions per 90", meaning: "Defensive work rate, scaled to a full match." },
    ],
  },
  {
    title: "Scouting report and profile",
    terms: [
      { term: "Attacking, Technical, Tactical, Defending and Creativity", meaning: "Scouting ratings for each side of a player's game, drawn on a radar so both players' shapes can be compared at a glance." },
      { term: "Ability Rating", meaning: "An overall scouting rating out of 200." },
      { term: "Potential", meaning: "How much better the player is expected to become. Most relevant for young players." },
      { term: "Scouting Role", meaning: "The kind of player scouts see them as, which is more specific than their listed position." },
      { term: "Injury Risk", meaning: "A scouting estimate of how likely the player is to pick up injuries, based on their history." },
      { term: "Market Value", meaning: "An estimate of the transfer fee the player would command today, not what was actually paid." },
    ],
  },
];

export default function StatsGuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Football stats glossary",
    url: absoluteUrl("/stats-guide"),
    hasDefinedTerm: groups.flatMap((g) =>
      g.terms.map((t) => ({ "@type": "DefinedTerm", name: t.term, description: t.meaning })),
    ),
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className={compare.hero}>
        <div className={compare.container}>
          <div className={compare.eyebrow}>
            <i className={compare.eyebrowDot} />
            STATS GUIDE
          </div>
          <h1 className={compare.heroTitle}>
            FOOTBALL STATS <span>EXPLAINED</span>
          </h1>
          <p className={compare.heroText}>
            What every number in a player comparison means, from goals per game to expected
            goals, and how to read them without getting fooled by the totals.
          </p>
        </div>
      </section>

      <section className={styles.guide}>
        <div className={styles.container}>
          <p className={styles.lead}>
            Match data covers the 2011/12 season onwards. Detailed stats such as shots, passes and
            duels come from matches with full per-match data, so for older seasons they can cover
            fewer games than goals and appearances. To see these numbers in action, open a
            comparison like{" "}
            <Link href="/compare/erling-haaland-vs-kylian-mbappe">Haaland vs Mbappé</Link> or{" "}
            <Link href="/compare">compare any two players</Link>.
          </p>

          <div className={styles.groups}>
            {groups.map((g) => (
              <div key={g.title} className={styles.group}>
                <h2>{g.title}</h2>
                {g.intro && <p className={styles.groupIntro}>{g.intro}</p>}
                <dl>
                  {g.terms.map((t) => (
                    <div key={t.term}>
                      <dt>{t.term}</dt>
                      <dd>{t.meaning}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
