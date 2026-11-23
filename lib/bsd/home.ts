import "server-only";

import { totals, type Num } from "@/lib/player-stats";
import { rivalryNote } from "@/lib/popular-players";
import { getPlayerDossier } from "./players";
import { getPopularMatchups } from "./popular";

// The most searched rivalries on the homepage, each with a short head-to-head
// written from the same career totals the comparison page shows. Names must
// match an iconic rivalry in lib/popular-players.ts.

const HOME_RIVALRIES = [
  { left: "Lionel Messi", right: "Cristiano Ronaldo", short: ["Messi", "Ronaldo"] },
  { left: "Lionel Messi", right: "Lamine Yamal", short: ["Messi", "Yamal"] },
  { left: "Erling Haaland", right: "Kylian Mbappé", short: ["Haaland", "Mbappé"] },
  { left: "Lamine Yamal", right: "Kylian Mbappé", short: ["Yamal", "Mbappé"] },
  { left: "Vinícius Júnior", right: "Lamine Yamal", short: ["Vinícius", "Yamal"] },
  { left: "Kylian Mbappé", right: "Vinícius Júnior", short: ["Mbappé", "Vinícius"] },
  { left: "Harry Kane", right: "Erling Haaland", short: ["Kane", "Haaland"] },
  { left: "Erling Haaland", right: "Mohamed Salah", short: ["Haaland", "Salah"] },
  { left: "Mohamed Salah", right: "Bukayo Saka", short: ["Salah", "Saka"] },
  { left: "Pedri", right: "Jude Bellingham", short: ["Pedri", "Bellingham"] },
  { left: "Lamine Yamal", right: "Michael Olise", short: ["Yamal", "Olise"] },
  { left: "Robert Lewandowski", right: "Harry Kane", short: ["Lewandowski", "Kane"] },
] as const;

export type HomeFaq = { q: string; a: string };

export type HomeRivalry = {
  href: string;
  title: string;
  note: string | undefined;
  photos: [string, string];
  faqs: HomeFaq[];
};

const whole = (n: number) => n.toLocaleString("en-GB");
const per90 = (count: number, minutes: number) => (minutes > 0 ? (count / minutes) * 90 : null);
const fixed = (n: Num, digits = 2) => (n === null ? null : n.toFixed(digits));

// "Messi has more (474 to 431)", or a level answer when the figures match.
function compare(
  [a, b]: readonly [string, string],
  [x, y]: [Num, Num],
  more: (winner: string, loser: string, w: string, l: string) => string,
  level: (value: string) => string,
  format: (n: number) => string,
): string | null {
  if (x === null || y === null) return null;
  if (format(x) === format(y)) return level(format(x));
  return x > y ? more(a, b, format(x), format(y)) : more(b, a, format(y), format(x));
}

function faqsFor(short: readonly [string, string], lt: ReturnType<typeof totals>, rt: ReturnType<typeof totals>) {
  const [a, b] = short;
  const faqs: (HomeFaq | null)[] = [
    {
      q: `Who has scored more goals, ${a} or ${b}?`,
      a:
        compare(
          short,
          [lt.goals, rt.goals],
          (w, l, wv, lv) => `${w}, with ${wv} goals to ${l}'s ${lv}.`,
          (v) => `They're level on ${v} goals each.`,
          whole,
        ) + ` ${a} has played ${whole(lt.apps)} games and ${b} ${whole(rt.apps)}.`,
      // compare() only returns null for missing values, and goals never are.
    },
    (() => {
      const answer = compare(
        short,
        [per90(lt.goals, lt.minutes), per90(rt.goals, rt.minutes)],
        (w, l, wv, lv) => `${w} scores more often: ${wv} goals per 90 minutes against ${l}'s ${lv}.`,
        (v) => `Both score at the same rate: ${v} goals per 90 minutes.`,
        (n) => n.toFixed(2),
      );
      return answer ? { q: `Who scores more often, ${a} or ${b}?`, a: answer } : null;
    })(),
    {
      q: `Who has more assists, ${a} or ${b}?`,
      a:
        compare(
          short,
          [lt.assists, rt.assists],
          (w, l, wv, lv) => `${w}, with ${wv} assists to ${l}'s ${lv}.`,
          (v) => `They have the same number of assists: ${v}.`,
          whole,
        ) ?? "",
    },
    (() => {
      const answer = compare(
        short,
        [lt.rating, rt.rating],
        (w, l, wv, lv) => `${w}, with an average match rating of ${wv} against ${l}'s ${lv}.`,
        (v) => `They're level on an average match rating of ${v}.`,
        (n) => fixed(n) ?? "",
      );
      return answer ? { q: `Who has the better average match rating, ${a} or ${b}?`, a: answer } : null;
    })(),
  ];
  return faqs.filter((f): f is HomeFaq => f !== null && f.a !== "");
}

// Rivalries whose players can't be loaded right now (usually the daily API
// quota) are left out; the page is rebuilt hourly, so they return.
export async function getHomeRivalries(): Promise<HomeRivalry[]> {
  const matchups = await getPopularMatchups().catch(() => []);
  const results = await Promise.all(
    HOME_RIVALRIES.map(async ({ left, right, short }) => {
      const m = matchups.find(
        (x) =>
          (x.left.name === left && x.right.name === right) ||
          (x.left.name === right && x.right.name === left),
      );
      if (!m) return null;
      try {
        const [ld, rd] = await Promise.all([
          getPlayerDossier(m.left.player.id),
          getPlayerDossier(m.right.player.id),
        ]);
        if (ld.status !== "ok" || rd.status !== "ok") return null;
        // Keep the order fans say it in, whatever order the URL uses.
        const flipped = m.left.name !== left;
        const [lDossier, rDossier] = flipped ? [rd.dossier, ld.dossier] : [ld.dossier, rd.dossier];
        const [lp, rp] = flipped ? [m.right, m.left] : [m.left, m.right];
        return {
          href: m.path,
          title: `${short[0]} vs ${short[1]}`,
          note: rivalryNote(left, right),
          photos: [lp.player.photo, rp.player.photo] as [string, string],
          faqs: faqsFor(short, totals(lDossier.lines), totals(rDossier.lines)),
        };
      } catch {
        return null;
      }
    }),
  );
  return results.filter((r): r is HomeRivalry => r !== null);
}
