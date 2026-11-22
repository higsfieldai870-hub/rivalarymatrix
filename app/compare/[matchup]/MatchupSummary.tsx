import Link from "next/link";
import api from "@/app/components/comparison/api.module.css";
import styles from "@/app/components/comparison/comparison.module.css";
import { displayName } from "@/app/components/comparison/view-model";
import type { PopularMatchup } from "@/lib/bsd/popular";
import {
  filterLines,
  formatNum,
  latestSeason,
  seasonLabel,
  totals,
  type PlayerDossier,
  type Totals,
} from "@/lib/player-stats";

// The written half of a comparison: what the numbers say, in sentences, and
// links to the other head-to-heads these players appear in. Rendered on the
// server, so it is in the HTML search engines read, and it is different on
// every page, unlike the charts and tables around it.

type Side = { name: string; dossier: PlayerDossier };

const per = (value: number, apps: number) => (apps > 0 ? value / apps : null);
const minutesPer = (minutes: number, value: number) => (value > 0 ? minutes / value : null);
const n = (v: number) => formatNum(v);
const d2 = (v: number | null) => formatNum(v, { decimals: 2 });

// "Messi (649) has more than Ronaldo (488)", or a tie.
function more(a: Side, av: number, b: Side, bv: number, what: string) {
  if (av === bv) return `${a.name} and ${b.name} are level on ${n(av)} ${what}.`;
  const [hi, hv, lo, lv] = av > bv ? [a, av, b, bv] : [b, bv, a, av];
  return `${hi.name} has more ${what}: ${n(hv)} to ${lo.name}'s ${n(lv)}.`;
}

function careerParagraphs(left: Side, right: Side, l: Totals, r: Totals, since: number | null) {
  const out: string[] = [];
  const from = since !== null ? ` since ${seasonLabel(since)}` : "";

  out.push(
    `On record${from}, ${left.name} has ${n(l.goals)} goals and ${n(l.assists)} assists in ${n(l.apps)} appearances, ` +
      `while ${right.name} has ${n(r.goals)} goals and ${n(r.assists)} assists in ${n(r.apps)}.`,
  );

  const lg = per(l.goals, l.apps);
  const rg = per(r.goals, r.apps);
  if (lg !== null && rg !== null) {
    const better = lg === rg ? null : lg > rg ? left : right;
    const lm = minutesPer(l.minutes, l.goals);
    const rm = minutesPer(r.minutes, r.goals);
    out.push(
      `${left.name} averages ${d2(lg)} goals per game against ${right.name}'s ${d2(rg)}` +
        (better ? `, so ${better.name} scores more often` : "") +
        (lm !== null && rm !== null
          ? `: a goal every ${n(lm)} minutes for ${left.name} and every ${n(rm)} for ${right.name}.`
          : "."),
    );
  }

  const lc = l.goals + l.assists;
  const rc = r.goals + r.assists;
  out.push(
    `${more(left, l.assists, right, r.assists, "assists")} ` +
      `Counting goals and assists together, the totals are ${n(lc)} for ${left.name} and ${n(rc)} for ${right.name}` +
      (l.minutes > 0 && r.minutes > 0
        ? `, or ${d2((lc / l.minutes) * 90)} and ${d2((rc / r.minutes) * 90)} per 90 minutes.`
        : "."),
  );

  if (l.rating !== null && r.rating !== null) {
    const hi = l.rating >= r.rating ? left : right;
    out.push(
      `Their average match ratings are ${formatNum(l.rating, { decimals: 2 })} for ${left.name} and ` +
        `${formatNum(r.rating, { decimals: 2 })} for ${right.name}` +
        (l.rating === r.rating ? "." : `, which puts ${hi.name} ahead on overall influence per game.`),
    );
  }
  return out;
}

function scopeSentence(left: Side, right: Side, l: Totals, r: Totals, label: string) {
  if (l.apps === 0 && r.apps === 0) return null;
  const part = (s: Side, t: Totals) =>
    t.apps > 0
      ? `${s.name} has ${n(t.goals)} goals and ${n(t.assists)} assists in ${n(t.apps)} games`
      : `${s.name} has no ${label} appearances on record`;
  return `${label[0].toUpperCase()}${label.slice(1)}: ${part(left, l)}; ${part(right, r)}.`;
}

export default function MatchupSummary({
  left,
  right,
  related,
}: {
  left: PlayerDossier;
  right: PlayerDossier;
  related: PopularMatchup[];
}) {
  const a: Side = { name: displayName(left.profile), dossier: left };
  const b: Side = { name: displayName(right.profile), dossier: right };
  const latest = latestSeason(left, right);

  const scoped = (scope: Parameters<typeof filterLines>[1]) =>
    [totals(filterLines(left.lines, scope, latest)), totals(filterLines(right.lines, scope, latest))] as const;

  const [lCareer, rCareer] = scoped("career");
  const seasons = [...left.lines, ...right.lines].map((x) => x.season);
  const since = seasons.length ? Math.min(...seasons) : null;
  const career = lCareer.apps + rCareer.apps > 0 ? careerParagraphs(a, b, lCareer, rCareer, since) : [];

  const breakdown = [
    scopeSentence(a, b, ...scoped("club"), "club football"),
    scopeSentence(a, b, ...scoped("international"), "international football"),
    scopeSentence(a, b, ...scoped("ucl"), "the Champions League"),
    latest !== null ? scopeSentence(a, b, ...scoped("latest"), `the ${seasonLabel(latest)} season`) : null,
  ].filter((s): s is string => s !== null);

  const ages = [left.profile, right.profile];
  const profile =
    ages[0].age !== null && ages[1].age !== null
      ? `${a.name} is ${ages[0].age}${left.profile.currentTeam ? ` and plays for ${left.profile.currentTeam}` : ""}; ` +
        `${b.name} is ${ages[1].age}${right.profile.currentTeam ? ` and plays for ${right.profile.currentTeam}` : ""}.`
      : null;

  if (!career.length && !related.length) return null;

  return (
    <section className={styles.section} id="summary">
      <div className={styles.container}>
        {career.length > 0 && (
          <div className={api.summary}>
            <div className={styles.sectionLabel}>IN WORDS</div>
            <h2 className={styles.sectionTitle}>
              {a.name} vs {b.name} in numbers
            </h2>

            {profile && <p>{profile}</p>}
            {career.map((p) => (
              <p key={p}>{p}</p>
            ))}

            {breakdown.length > 0 && (
              <>
                <h3>Club, country and Champions League</h3>
                <ul>
                  {breakdown.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </>
            )}

            <p className={api.summaryNote}>
              Totals come from per-match records{since !== null ? ` from ${seasonLabel(since)} onwards` : ""}, so
              they can be lower than official career figures for players who started earlier.
            </p>
          </div>
        )}

        {related.length > 0 && (
          <nav className={api.related} aria-label="Related comparisons">
            <h2>More head-to-heads with {a.name} or {b.name}</h2>
            <ul>
              {related.map((m) => (
                <li key={m.path}>
                  <Link href={m.path}>
                    {displayName(m.left.player)} vs {displayName(m.right.player)}
                  </Link>
                </li>
              ))}
            </ul>
            <p>
              <Link href="/rivalries">See every featured rivalry</Link>
            </p>
          </nav>
        )}
      </div>
    </section>
  );
}
