import {
  byCompetition,
  bySeason,
  filterLines,
  formatNum,
  metricDefs,
  per90Defs,
  radarAxes,
  seasonLabel,
  totals,
  type CompetitionRow,
  type MetricDef,
  type Num,
  type PlayerDossier,
  type PlayerProfile,
  type Scope,
  type SeasonRow,
  type StatType,
  type Totals,
} from "@/lib/player-stats";
import type { SeriesPair } from "./Charts";

// Everything a comparison renders for one scope, derived from two dossiers.

export type MetricRow = { def: MetricDef; left: Num; right: Num };

export type ComparisonViewModel = {
  names: [string, string];
  left: Totals;
  right: Totals;
  empty: boolean;
  labels: string[];
  goals: SeriesPair;
  assists: SeriesPair;
  minutes: SeriesPair;
  contributions: SeriesPair;
  rating: SeriesPair | null;
  radar: { labels: string[]; series: SeriesPair; tooltips: [string[], string[]] } | null;
  metrics: { category: string; rows: MetricRow[] }[];
  per90: { label: string; left: Num; right: Num }[];
  seasons: { season: number; left: SeasonRow | null; right: SeasonRow | null }[];
  competitions: [CompetitionRow[], CompetitionRow[]];
};

const INITIAL = /^\p{Lu}\p{Ll}?\.\s+/u;

// "L. Messi" -> "Messi"; "Cristiano Ronaldo" stays whole.
export function shortName(p: PlayerProfile) {
  return p.name.replace(INITIAL, "");
}

// Two display lines for the big name: ["Lionel", "Messi"].
export function nameLines(p: PlayerProfile): [string, string] {
  if (INITIAL.test(p.name)) return [p.firstname?.split(" ")[0] ?? "", shortName(p)];
  const [first, ...rest] = p.name.split(" ");
  return rest.length ? [first, rest.join(" ")] : ["", first];
}

// "Lionel Messi" rather than the API's abbreviated "L. Messi".
export function displayName(p: PlayerProfile) {
  return nameLines(p).filter(Boolean).join(" ");
}

export function initials(p: PlayerProfile) {
  return nameLines(p)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function buildViewModel(
  leftDossier: PlayerDossier,
  rightDossier: PlayerDossier,
  scope: Scope,
  latest: number | null,
): ComparisonViewModel {
  const names: [string, string] = [shortName(leftDossier.profile), shortName(rightDossier.profile)];
  const types: Record<string, StatType> = { ...leftDossier.statTypes, ...rightDossier.statTypes };
  const leftLines = filterLines(leftDossier.lines, scope, latest);
  const rightLines = filterLines(rightDossier.lines, scope, latest);
  const left = totals(leftLines, types);
  const right = totals(rightLines, types);

  const seasonList = [...new Set([...leftLines, ...rightLines].map((l) => l.season))].sort(
    (a, b) => a - b,
  );
  const leftBySeason = bySeason(leftLines);
  const rightBySeason = bySeason(rightLines);

  const pair = (pick: (row: SeasonRow) => Num): SeriesPair => [
    { label: names[0], data: seasonList.map((s) => pickOrNull(leftBySeason.get(s), pick)) },
    { label: names[1], data: seasonList.map((s) => pickOrNull(rightBySeason.get(s), pick)) },
  ];

  const running = (data: Num[]) => {
    let total = 0;
    return data.map((v) => (total += v ?? 0));
  };
  const contributionsRaw = pair((r) => r.goals + r.assists);
  const rating = pair((r) => r.rating);

  // Every other statistic the API returned, so nothing it sends is hidden.
  const extraDefs: MetricDef[] = Object.entries(types)
    .map(([code, type]) => ({
      id: `extra-${code}`,
      label: type.name,
      category: "More Stats",
      decimals: type.average ? 1 : undefined,
      unit: /percentage|%/i.test(`${code} ${type.name}`) ? "%" : undefined,
      value: (t: Totals) => t.extra[code] ?? (t.apps > 0 ? 0 : null),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const metrics = new Map<string, MetricRow[]>();
  for (const def of [...metricDefs, ...extraDefs]) {
    const row = { def, left: def.value(left), right: def.value(right) };
    if (row.left === null && row.right === null) continue;
    // Keeper-only extras on two outfielders (and similar) are just noise.
    if (def.category === "More Stats" && !row.left && !row.right) continue;
    const group = metrics.get(def.category) ?? [];
    group.push(row);
    metrics.set(def.category, group);
  }

  return {
    names,
    left,
    right,
    empty: left.apps === 0 && right.apps === 0,
    labels: seasonList.map(seasonLabel),
    goals: pair((r) => r.goals),
    assists: pair((r) => r.assists),
    minutes: pair((r) => r.minutes),
    contributions: [
      { ...contributionsRaw[0], data: running(contributionsRaw[0].data) },
      { ...contributionsRaw[1], data: running(contributionsRaw[1].data) },
    ],
    rating: rating.some((s) => s.data.some((v) => v !== null)) ? rating : null,
    radar: buildRadar(left, right, names),
    metrics: [...metrics].map(([category, rows]) => ({ category, rows })),
    per90: per90Defs
      .map((d) => ({ label: d.label, left: d.value(left), right: d.value(right) }))
      .filter((row) => row.left !== null || row.right !== null),
    seasons: [...seasonList].reverse().map((season) => ({
      season,
      left: leftBySeason.get(season) ?? null,
      right: rightBySeason.get(season) ?? null,
    })),
    competitions: [byCompetition(leftLines), byCompetition(rightLines)],
  };
}

function pickOrNull(row: SeasonRow | undefined, pick: (row: SeasonRow) => Num) {
  return row ? pick(row) : null;
}

// Each axis is scaled so the better of the two players scores 100.
function buildRadar(left: Totals, right: Totals, names: [string, string]) {
  const axes = radarAxes
    .map((axis) => ({ axis, l: axis.value(left), r: axis.value(right) }))
    .filter((a): a is typeof a & { l: number; r: number } => a.l !== null && a.r !== null);
  if (axes.length < 3) return null;

  const scale = (v: number, other: number) => {
    const best = Math.max(v, other);
    return best > 0 ? Math.round((v / best) * 100) : 0;
  };
  const describe = (v: number, unit: string | undefined, hint: string) =>
    `${formatNum(v, { decimals: unit ? 0 : 2, unit })} ${hint}`;

  return {
    labels: axes.map((a) => a.axis.label),
    series: [
      { label: names[0], data: axes.map((a) => scale(a.l, a.r)) },
      { label: names[1], data: axes.map((a) => scale(a.r, a.l)) },
    ] as SeriesPair,
    tooltips: [
      axes.map((a) => describe(a.l, a.axis.unit, a.axis.hint)),
      axes.map((a) => describe(a.r, a.axis.unit, a.axis.hint)),
    ] as [string[], string[]],
  };
}
