import "server-only";

import { filterLines, totals, type Num, type StatLine, type Totals } from "@/lib/player-stats";
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

// ---------------------------------------------------------------------------
// The longer set shown on the homepage's most searched rivalries
// ---------------------------------------------------------------------------

const list = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

type Measure = {
  label: string;
  values: [Num, Num];
  format: (n: number) => string;
  lowerWins?: boolean;
};

// "Who is better?" is the question fans search most. There's no single
// answer, so count who leads on each measure and say which ones.
function betterFaq(names: readonly [string, string], measures: Measure[]): HomeFaq | null {
  const [a, b] = names;
  const leads: [string[], string[]] = [[], []];
  for (const m of measures) {
    const [x, y] = m.values;
    if (x === null || y === null || m.format(x) === m.format(y)) continue;
    const aWins = m.lowerWins ? x < y : x > y;
    leads[aWins ? 0 : 1].push(m.label);
  }
  const [la, lb] = leads;
  if (!la.length && !lb.length) return null;
  const side = (name: string, items: string[]) =>
    items.length ? `${name} leads on ${list(items)}` : `${name} leads on none of them`;
  const verdict =
    la.length === lb.length
      ? "On our numbers it's level"
      : `On our numbers ${la.length > lb.length ? a : b} edges it, ${Math.max(la.length, lb.length)} measures to ${Math.min(la.length, lb.length)}`;
  return {
    q: `Who is better, ${a} or ${b}?`,
    a: `${verdict}. Of ${la.length + lb.length} key measures, ${side(a, la)}; ${side(b, lb)}. Which matters most is your call, and the full comparison has every stat side by side.`,
  };
}

// Goals (or games, for goalkeepers) in one scope, when either player has
// played in it.
function scopeFaq(
  names: readonly [string, string],
  [ll, rl]: [StatLine[], StatLine[]],
  q: string,
  what: "goals" | "apps",
  noun: string,
  // For goals, how many games they came from: "Messi has 191 caps and Ronaldo 226."
  games?: (a: string, x: string, b: string, y: string) => string,
): HomeFaq | null {
  const [lt, rt] = [totals(ll), totals(rl)];
  if (lt.apps === 0 && rt.apps === 0) return null;
  const answer = compare(
    names,
    [lt[what], rt[what]],
    (w, l, wv, lv) => `${w}, with ${wv} ${noun} to ${l}'s ${lv}.`,
    (v) => `They're level on ${v} ${noun} each.`,
    whole,
  );
  const context = games ? ` ${games(names[0], whole(lt.apps), names[1], whole(rt.apps))}` : "";
  return faq(q, answer && `${answer}${context}`);
}

function extendedFaqs(
  names: readonly [string, string],
  lines: [StatLine[], StatLine[]],
  goalkeepers: boolean,
): HomeFaq[] {
  const [a, b] = names;
  const [lt, rt] = [totals(lines[0]), totals(lines[1])];
  const pick = (scope: "ucl" | "international"): [StatLine[], StatLine[]] => [
    filterLines(lines[0], scope, null),
    filterLines(lines[1], scope, null),
  ];
  const saves = (t: Totals) => (t.tracked.saves ? per90(t.tracked.saves, t.tracked.minutes) : null);
  const conceded = (t: Totals) =>
    t.tracked.saves ? per90(t.tracked.conceded, t.tracked.minutes) : null;

  const better = betterFaq(
    names,
    goalkeepers
      ? [
          { label: "games played", values: [lt.apps, rt.apps], format: whole },
          { label: "saves per 90", values: [saves(lt), saves(rt)], format: twoDp },
          {
            label: "goals conceded per 90",
            values: [conceded(lt), conceded(rt)],
            format: twoDp,
            lowerWins: true,
          },
          { label: "average rating", values: [lt.rating, rt.rating], format: twoDp },
        ]
      : [
          { label: "total goals", values: [lt.goals, rt.goals], format: whole },
          {
            label: "goals per 90",
            values: [per90(lt.goals, lt.minutes), per90(rt.goals, rt.minutes)],
            format: twoDp,
          },
          { label: "total assists", values: [lt.assists, rt.assists], format: whole },
          {
            label: "assists per 90",
            values: [per90(lt.assists, lt.minutes), per90(rt.assists, rt.minutes)],
            format: twoDp,
          },
          { label: "average rating", values: [lt.rating, rt.rating], format: twoDp },
        ],
  );

  const core = (goalkeepers ? goalkeeperFaqs : outfieldFaqs)(names, lt, rt);

  const extras = goalkeepers
    ? [
        scopeFaq(
          names,
          pick("ucl"),
          `Who has played more Champions League games, ${a} or ${b}?`,
          "apps",
          "Champions League games",
        ),
        scopeFaq(names, pick("international"), `Who has more international caps, ${a} or ${b}?`, "apps", "caps"),
      ]
    : [
        scopeFaq(
          names,
          pick("ucl"),
          `Who has more Champions League goals, ${a} or ${b}?`,
          "goals",
          "Champions League goals",
          (a, x, b, y) => `${a} has played ${x} Champions League games and ${b} ${y}.`,
        ),
        scopeFaq(
          names,
          pick("international"),
          `Who has more international goals, ${a} or ${b}?`,
          "goals",
          "international goals",
          (a, x, b, y) => `${a} has ${x} caps and ${b} ${y}.`,
        ),
        faq(
          `Who has more goal contributions, ${a} or ${b}?`,
          compare(
            names,
            [lt.goals + lt.assists, rt.goals + rt.assists],
            (w, l, wv, lv) => `${w}, with ${wv} goals and assists combined to ${l}'s ${lv}.`,
            (v) => `They're level on ${v} goals and assists combined.`,
            whole,
          ),
        ),
      ];

  return [better, ...core, ...extras].filter((f): f is HomeFaq => f !== null).slice(0, 7);
}

// The head-to-head answers for a popular matchup, in its left/right order, or
// null when either player's data can't be loaded right now (usually the
// daily API quota).
// `extended` adds "who is better", Champions League, international and
// goal-contribution questions (up to 7 in all), as the homepage shows.
export async function matchupFaqs(
  m: PopularMatchup,
  { extended = false }: { extended?: boolean } = {},
): Promise<HomeFaq[] | null> {
  try {
    const [ld, rd] = await Promise.all([
      getPlayerDossier(m.left.player.id),
      getPlayerDossier(m.right.player.id),
    ]);
    if (ld.status !== "ok" || rd.status !== "ok") return null;
    const names = [shortName(m.left.name), shortName(m.right.name)] as const;
    const goalkeepers = m.left.role === "goalkeeper" && m.right.role === "goalkeeper";
    if (extended) return extendedFaqs(names, [ld.dossier.lines, rd.dossier.lines], goalkeepers);
    const build = goalkeepers ? goalkeeperFaqs : outfieldFaqs;
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
      const faqs = await matchupFaqs(m, { extended: true });
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
