import "server-only";

import { totals, type Num, type Totals } from "@/lib/player-stats";
import { rivalryNote } from "@/lib/popular-players";
import { getPlayerDossier } from "./players";
import { getPopularMatchups, type PopularMatchup } from "./popular";

// Quick head-to-head answers for the popular rivalries, written from the same
// career totals the comparison page shows. Used by the homepage's most
// searched rivalries and by every card on the rivalries page.

export type HomeFaq = { q: string; a: string };

// The name fans use: usually the surname, a few exceptions.
const SHORT_NAMES: Record<string, string> = {
  "Vinícius Júnior": "Vinícius",
  "Virgil van Dijk": "Van Dijk",
  "Kevin De Bruyne": "De Bruyne",
  "Trent Alexander-Arnold": "Alexander-Arnold",
  "Bruno Fernandes": "Bruno Fernandes",
};

export const shortName = (name: string) => SHORT_NAMES[name] ?? name.split(" ").at(-1)!;

const whole = (n: number) => n.toLocaleString("en-GB");
const per90 = (count: number, minutes: number) => (minutes > 0 ? (count / minutes) * 90 : null);
const twoDp = (n: number) => n.toFixed(2);

type Phrase = (winner: string, loser: string, w: string, l: string) => string;

// "Messi, with 474 to 431", or a level answer when the figures match. Pass
// lowerWins for stats where less is better, such as goals conceded.
function compare(
  [a, b]: readonly [string, string],
  [x, y]: [Num, Num],
  more: Phrase,
  level: (value: string) => string,
  format: (n: number) => string,
  lowerWins = false,
): string | null {
  if (x === null || y === null) return null;
  if (format(x) === format(y)) return level(format(x));
  const aWins = lowerWins ? x < y : x > y;
  return aWins ? more(a, b, format(x), format(y)) : more(b, a, format(y), format(x));
}

const faq = (q: string, a: string | null): HomeFaq | null => (a ? { q, a } : null);

function outfieldFaqs(names: readonly [string, string], lt: Totals, rt: Totals) {
  const [a, b] = names;
  return [
    faq(
      `Who has scored more goals, ${a} or ${b}?`,
      `${compare(
        names,
        [lt.goals, rt.goals],
        (w, l, wv, lv) => `${w}, with ${wv} goals to ${l}'s ${lv}.`,
        (v) => `They're level on ${v} goals each.`,
        whole,
      )} ${a} has played ${whole(lt.apps)} games and ${b} ${whole(rt.apps)}.`,
    ),
    faq(
      `Who scores more often, ${a} or ${b}?`,
      compare(
        names,
        [per90(lt.goals, lt.minutes), per90(rt.goals, rt.minutes)],
        (w, l, wv, lv) => `${w} scores more often: ${wv} goals per 90 minutes against ${l}'s ${lv}.`,
        (v) => `Both score at the same rate: ${v} goals per 90 minutes.`,
        twoDp,
      ),
    ),
    faq(
      `Who has more assists, ${a} or ${b}?`,
      compare(
        names,
        [lt.assists, rt.assists],
        (w, l, wv, lv) => `${w}, with ${wv} assists to ${l}'s ${lv}.`,
        (v) => `They have the same number of assists: ${v}.`,
        whole,
      ),
    ),
    faq(
      `Who has the better average match rating, ${a} or ${b}?`,
      compare(
        names,
        [lt.rating, rt.rating],
        (w, l, wv, lv) => `${w}, with an average match rating of ${wv} against ${l}'s ${lv}.`,
        (v) => `They're level on an average match rating of ${v}.`,
        twoDp,
      ),
    ),
  ];
}

// Saves and goals conceded only exist for matches with per-match data, so
// their rates use the minutes from those matches.
function goalkeeperFaqs(names: readonly [string, string], lt: Totals, rt: Totals) {
  const [a, b] = names;
  const saves = (t: Totals) => (t.tracked.saves ? per90(t.tracked.saves, t.tracked.minutes) : null);
  const conceded = (t: Totals) =>
    t.tracked.saves ? per90(t.tracked.conceded, t.tracked.minutes) : null;
  return [
    faq(
      `Who has played more games, ${a} or ${b}?`,
      compare(
        names,
        [lt.apps, rt.apps],
        (w, l, wv, lv) => `${w}, with ${wv} appearances to ${l}'s ${lv}.`,
        (v) => `They have played the same number of games: ${v}.`,
        whole,
      ),
    ),
    faq(
      `Who makes more saves, ${a} or ${b}?`,
      compare(
        names,
        [saves(lt), saves(rt)],
        (w, l, wv, lv) => `${w} makes ${wv} saves per 90 minutes against ${l}'s ${lv}.`,
        (v) => `Both make ${v} saves per 90 minutes.`,
        twoDp,
      ),
    ),
    faq(
      `Who concedes fewer goals, ${a} or ${b}?`,
      compare(
        names,
        [conceded(lt), conceded(rt)],
        (w, l, wv, lv) => `${w} concedes ${wv} goals per 90 minutes against ${l}'s ${lv}.`,
        (v) => `Both concede ${v} goals per 90 minutes.`,
        twoDp,
        true,
      ),
    ),
    faq(
      `Who has the better average match rating, ${a} or ${b}?`,
      compare(
        names,
        [lt.rating, rt.rating],
        (w, l, wv, lv) => `${w}, with an average match rating of ${wv} against ${l}'s ${lv}.`,
        (v) => `They're level on an average match rating of ${v}.`,
        twoDp,
      ),
    ),
  ];
}

// The head-to-head answers for a popular matchup, in its left/right order, or
// null when either player's data can't be loaded right now (usually the
// daily API quota).
export async function matchupFaqs(m: PopularMatchup): Promise<HomeFaq[] | null> {
  try {
    const [ld, rd] = await Promise.all([
      getPlayerDossier(m.left.player.id),
      getPlayerDossier(m.right.player.id),
    ]);
    if (ld.status !== "ok" || rd.status !== "ok") return null;
    const names = [shortName(m.left.name), shortName(m.right.name)] as const;
    const build =
      m.left.role === "goalkeeper" && m.right.role === "goalkeeper" ? goalkeeperFaqs : outfieldFaqs;
    return build(names, totals(ld.dossier.lines), totals(rd.dossier.lines)).filter(
      (f): f is HomeFaq => f !== null,
    );
  } catch {
    return null;
  }
}

// The most searched rivalries on the homepage, in the order fans say them.
// Names must match an iconic rivalry in lib/popular-players.ts.
const HOME_RIVALRIES: [string, string][] = [
  ["Lionel Messi", "Cristiano Ronaldo"],
  ["Lionel Messi", "Lamine Yamal"],
  ["Erling Haaland", "Kylian Mbappé"],
  ["Lamine Yamal", "Kylian Mbappé"],
  ["Vinícius Júnior", "Lamine Yamal"],
  ["Kylian Mbappé", "Vinícius Júnior"],
  ["Harry Kane", "Erling Haaland"],
  ["Erling Haaland", "Mohamed Salah"],
  ["Mohamed Salah", "Bukayo Saka"],
  ["Pedri", "Jude Bellingham"],
  ["Lamine Yamal", "Michael Olise"],
  ["Robert Lewandowski", "Harry Kane"],
];

export type HomeRivalry = {
  href: string;
  title: string;
  note: string | undefined;
  photos: [string, string];
  faqs: HomeFaq[];
};

// Rivalries whose players can't be loaded right now are left out; the page
// is rebuilt hourly, so they return.
export async function getHomeRivalries(): Promise<HomeRivalry[]> {
  const matchups = await getPopularMatchups().catch(() => []);
  const results = await Promise.all(
    HOME_RIVALRIES.map(async ([left, right]) => {
      const found = matchups.find(
        (x) =>
          (x.left.name === left && x.right.name === right) ||
          (x.left.name === right && x.right.name === left),
      );
      if (!found) return null;
      // Keep the order fans say it in, whatever order the URL uses.
      const m = found.left.name === left ? found : { ...found, left: found.right, right: found.left };
      const faqs = await matchupFaqs(m);
      if (!faqs) return null;
      return {
        href: m.path,
        title: `${shortName(left)} vs ${shortName(right)}`,
        note: rivalryNote(left, right),
        photos: [m.left.player.photo, m.right.player.photo] as [string, string],
        faqs,
      };
    }),
  );
  return results.filter((r): r is HomeRivalry => r !== null);
}
