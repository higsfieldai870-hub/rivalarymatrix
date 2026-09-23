"use client";

import Image from "next/image";
import { useState, type CSSProperties, type ReactNode } from "react";
import {
  daysBetween,
  daysMissed,
  formatCompact,
  formatNum,
  leftShare,
  seasonLabel,
  type CompetitionRow,
  type Num,
  type PlayerDossier,
  type Side,
} from "@/lib/player-stats";
import api from "./api.module.css";
import { BarChart, LineChart, RadarChart } from "./Charts";
import styles from "./comparison.module.css";
import { displayName, initials, nameLines, type ComparisonViewModel } from "./view-model";

type Pair = [PlayerDossier, PlayerDossier];

const upper = (text: string) => text.toUpperCase();
const sideClass = (side: Side, left: string, right: string) => (side === "left" ? left : right);
const percent = (fraction: number) => `${(fraction * 100).toFixed(1)}%`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Deterministic so server and browser render the same text.
export function formatDate(iso: string | null) {
  if (!iso) return "–";
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function SectionHeader({
  id,
  label,
  title,
  children,
}: {
  id?: string;
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.sectionHeader} id={id}>
      <div>
        <div className={styles.sectionLabel}>{label}</div>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      {children && <div className={styles.sectionDescription}>{children}</div>}
    </div>
  );
}

function Section({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} className={`${styles.section} ${api.anchor}`}>
      <div className={styles.container}>{children}</div>
    </section>
  );
}

function ShowAll({
  total,
  shown,
  open,
  onToggle,
  noun,
}: {
  total: number;
  shown: number;
  open: boolean;
  onToggle: () => void;
  noun: string;
}) {
  if (total <= shown) return null;
  return (
    <div className={api.toggle}>
      <button type="button" onClick={onToggle} aria-expanded={open}>
        {open ? `Show fewer ${noun}` : `Show all ${total} ${noun}`}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Showcase & bio
// ---------------------------------------------------------------------------

export function Showcase({ players }: { players: Pair }) {
  return (
    <section className={styles.container}>
      <div className={styles.showcase}>
        <PlayerPanel dossier={players[0]} side="left" />

        <div className={styles.vsCenter}>
          <div className={styles.vsBall} aria-hidden>
            ⚽
          </div>
          <span>HEAD TO HEAD</span>
        </div>

        <PlayerPanel dossier={players[1]} side="right" />
      </div>
    </section>
  );
}

function PlayerPanel({ dossier, side }: { dossier: PlayerDossier; side: Side }) {
  const p = dossier.profile;
  const [first, last] = nameLines(p);
  const role = [p.position, p.nationality].filter(Boolean).map((v) => upper(v!)).join(" • ");

  return (
    <div className={`${styles.player} ${sideClass(side, styles.playerLeft, styles.playerRight)}`}>
      {p.number !== null && (
        <div className={styles.playerNumber} aria-hidden>
          {String(p.number).padStart(2, "0")}
        </div>
      )}

      <div className={styles.portrait}>
        <Image src={p.photo} alt={p.name} width={150} height={150} sizes="220px" loading="eager" />
      </div>

      <div className={styles.playerInfo}>
        <div className={styles.playerRole}>{role}</div>
        <h2 className={styles.playerName}>
          {first && (
            <>
              {first}
              <br />
            </>
          )}
          {last}
        </h2>
        <div className={styles.playerDetails}>
          <span>
            AGE <strong>{p.age ?? "–"}</strong>
          </span>
          <span>
            CLUB <strong>{upper(dossier.currentClub?.name ?? "–")}</strong>
          </span>
          {p.height && (
            <span>
              HEIGHT <strong>{upper(p.height)}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamName({ team }: { team: NonNullable<PlayerDossier["currentClub"]> }) {
  return (
    <>
      {team.logo && (
        <Image className={api.logo} src={team.logo} alt="" width={22} height={22} unoptimized />
      )}
      {team.name}
    </>
  );
}

// `available` means "not listed as missing", so it is shown as such.
function availability(d: PlayerDossier) {
  const status = d.bio.availability;
  if (!status) return "–";
  if (status === "available") return <span className={api.statusFit}>Available</span>;
  const detail = [d.bio.injuryType, d.bio.injuryReturn && `back ${formatDate(d.bio.injuryReturn)}`]
    .filter(Boolean)
    .join(", ");
  return (
    <span className={api.statusInjured}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
      {detail ? ` (${detail})` : ""}
    </span>
  );
}

const euros = (value: Num) => (value === null ? "–" : `€${formatCompact(value)}`);

export function Bio({ players, names }: { players: Pair; names: [string, string] }) {
  const [open, setOpen] = useState(false);
  const allRows: { label: string; value: (d: PlayerDossier) => ReactNode }[] = [
    {
      label: "FULL NAME",
      value: (d) => [d.profile.firstname, d.profile.lastname].filter(Boolean).join(" ") || d.profile.name,
    },
    { label: "DATE OF BIRTH", value: (d) => formatDate(d.profile.birthDate) },
    {
      label: "BIRTHPLACE",
      value: (d) => [d.profile.birthPlace, d.profile.birthCountry].filter(Boolean).join(", ") || "–",
    },
    { label: "NATIONALITY", value: (d) => d.profile.nationality ?? "–" },
    { label: "HEIGHT", value: (d) => d.profile.height ?? "–" },
    { label: "WEIGHT", value: (d) => d.profile.weight ?? "–" },
    { label: "POSITION", value: (d) => d.profile.position ?? "–" },
    { label: "ROLE", value: (d) => d.profile.detailedPosition ?? "–" },
    { label: "PREFERRED FOOT", value: (d) => d.profile.preferredFoot ?? "–" },
    { label: "SHIRT NUMBER", value: (d) => d.profile.number ?? "–" },
    {
      label: "CURRENT CLUB",
      value: (d) => (d.currentClub ? <TeamName team={d.currentClub} /> : "–"),
    },
    { label: "CONTRACT UNTIL", value: (d) => (d.bio.contractUntil ? formatDate(d.bio.contractUntil) : "–") },
    { label: "MARKET VALUE", value: (d) => euros(d.bio.marketValueEur) },
    { label: "ANNUAL WAGE", value: (d) => euros(d.bio.wageEurAnnual) },
    {
      label: "NATIONAL TEAM",
      value: (d) => (d.bio.nationalTeam ? <TeamName team={d.bio.nationalTeam} /> : "–"),
    },
    { label: "CAPS", value: (d) => d.bio.caps ?? "–" },
    { label: "INTERNATIONAL GOALS", value: (d) => d.bio.internationalGoals ?? "–" },
    {
      label: "LAST CAP",
      value: (d) => (d.bio.lastInternational ? formatDate(d.bio.lastInternational) : "–"),
    },
    { label: "CLUBS PLAYED FOR", value: (d) => d.clubs.filter((c) => !c.national).length || "–" },
    { label: "STATUS", value: (d) => availability(d) },
  ];
  // Hide rows the provider has no data for on either side.
  const rows = allRows.filter((row) => players.some((d) => row.value(d) !== "–"));
  const shown = open ? rows : rows.slice(0, 5);

  return (
    <Section id="bio">
      <SectionHeader label="PLAYER FILE" title="Player Bio" />

      <div className={styles.careerCard} data-reveal>
        <div className={styles.careerTop}>
          <div className={`${styles.careerPlayer} ${styles.left}`}>{upper(names[0])}</div>
          <div className={styles.careerCenter}>PROFILE</div>
          <div className={`${styles.careerPlayer} ${styles.right}`}>{upper(names[1])}</div>
        </div>

        {shown.map((row) => (
          <div key={row.label} className={`${styles.careerRow} ${api.bioRow}`}>
            <div className={api.bioValue}>{row.value(players[0])}</div>
            <div className={styles.careerStat}>{row.label}</div>
            <div className={`${api.bioValue} ${api.right}`}>{row.value(players[1])}</div>
          </div>
        ))}
      </div>
      <ShowAll total={rows.length} shown={5} open={open} onToggle={() => setOpen((v) => !v)} noun="rows" />
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Scope-driven sections
// ---------------------------------------------------------------------------

export function CareerCard({ view, scopeLabel }: { view: ComparisonViewModel; scopeLabel: string }) {
  const rows: { label: string; left: Num; right: Num; decimals?: number }[] = [
    { label: "GOALS", left: view.left.goals, right: view.right.goals },
    { label: "APPEARANCES", left: view.left.apps, right: view.right.apps },
    { label: "ASSISTS", left: view.left.assists, right: view.right.assists },
    { label: "MINUTES", left: view.left.minutes, right: view.right.minutes },
    { label: "AVG RATING", left: view.left.rating, right: view.right.rating, decimals: 2 },
  ];

  return (
    <section id="career" className={`${styles.careerSection} ${api.anchor}`}>
      <div className={styles.container}>
        <SectionHeader label={`${upper(scopeLabel)} DATA`} title="Career Stats On Record" />

        <div className={styles.careerCard} data-reveal>
          <div className={styles.careerTop}>
            <div className={`${styles.careerPlayer} ${styles.left}`}>{upper(view.names[0])}</div>
            <div className={styles.careerCenter}>{upper(scopeLabel)} ON RECORD</div>
            <div className={`${styles.careerPlayer} ${styles.right}`}>{upper(view.names[1])}</div>
          </div>

          {rows.map((row) => (
            <div key={row.label} className={styles.careerRow}>
              <div className={`${styles.careerNumber} ${styles.left}`}>
                {formatNum(row.left, { decimals: row.decimals })}
              </div>
              <div className={styles.careerStat}>{row.label}</div>
              <div className={`${styles.careerNumber} ${styles.right}`}>
                {formatNum(row.right, { decimals: row.decimals })}
              </div>
            </div>
          ))}

        </div>

        <p className={api.coverage}>
          <span className={api.coverageIcon} aria-hidden>
            i
          </span>
          BSD has no per-match data before 2011/12, so earlier seasons are missing and these totals
          are floors, not official career figures.
        </p>
      </div>
    </section>
  );
}

function ChartCard({
  index,
  title,
  meta,
  children,
}: {
  index: number;
  title: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.chartCard} data-reveal>
      <div className={styles.chartHeading}>
        <div className={styles.chartTitle}>
          <span className={styles.chartIndex}>{String(index).padStart(2, "0")}</span>
          <h3>{title}</h3>
        </div>
        <div className={styles.chartMeta}>{meta}</div>
      </div>
      {children}
    </div>
  );
}

export function Analytics({ view }: { view: ComparisonViewModel }) {
  const [a, b] = view.names;
  const span =
    view.labels.length > 1 ? `${view.labels[0]} – ${view.labels.at(-1)}` : (view.labels[0] ?? "");
  const vs = `${a} and ${b}`;
  let index = 0;

  return (
    <Section id="analytics">
      <SectionHeader label="PERFORMANCE LAB" title="Advanced Analytics" />

      <ChartCard index={++index} title="Goals By Season" meta={`GOALS • ${span}`}>
        <div className={styles.fullChart}>
          <BarChart
            labels={view.labels}
            series={view.goals}
            suffix=" goals"
            ariaLabel={`Bar chart of goals per season for ${vs}, ${span}.`}
          />
        </div>
      </ChartCard>

      {view.radar && (
        <ChartCard index={++index} title="Player Profile" meta="RELATIVE ATTRIBUTES">
          <div className={styles.profileChart}>
            <div className={styles.radarWrapper}>
              <RadarChart
                labels={view.radar.labels}
                series={view.radar.series}
                tooltips={view.radar.tooltips}
                ariaLabel={`Radar chart comparing ${vs} on ${view.radar.labels.join(", ")}.`}
              />
            </div>

            <div className={styles.profileSide}>
              <div className={styles.profilePlayer}>
                <div className={`${styles.profileDot} ${styles.dotLeft}`} />
                {upper(a)}
              </div>
              <div className={styles.profilePlayer}>
                <div className={`${styles.profileDot} ${styles.dotRight}`} />
                {upper(b)}
              </div>
            </div>
          </div>
        </ChartCard>
      )}

      <ChartCard index={++index} title="Assists By Season" meta="CREATIVITY">
        <div className={styles.fullChart}>
          <LineChart
            labels={view.labels}
            series={view.assists}
            suffix=" assists"
            ariaLabel={`Line chart of assists per season for ${vs}, ${span}.`}
          />
        </div>
      </ChartCard>

      <ChartCard index={++index} title="Goal Contributions" meta="CUMULATIVE GOALS + ASSISTS">
        <div className={styles.fullChart}>
          <LineChart
            labels={view.labels}
            series={view.contributions}
            suffix=" G+A total"
            fill
            ariaLabel={`Line chart of cumulative goals plus assists for ${vs}, ${span}.`}
          />
        </div>
      </ChartCard>

      {view.rating && (
        <ChartCard index={++index} title="Match Rating" meta="AVERAGE RATING PER SEASON">
          <div className={styles.fullChart}>
            <LineChart
              labels={view.labels}
              series={view.rating}
              decimals={2}
              beginAtZero={false}
              ariaLabel={`Line chart of average match rating per season for ${vs}, ${span}.`}
            />
          </div>
        </ChartCard>
      )}

      <ChartCard index={++index} title="Minutes Played" meta="WORKLOAD PER SEASON">
        <div className={styles.fullChart}>
          <BarChart
            labels={view.labels}
            series={view.minutes}
            suffix=" min"
            ariaLabel={`Bar chart of minutes played per season for ${vs}, ${span}.`}
          />
        </div>
      </ChartCard>
    </Section>
  );
}

export function StatBattle({ view }: { view: ComparisonViewModel }) {
  const [open, setOpen] = useState(false);
  const total = view.metrics.reduce((n, group) => n + group.rows.length, 0);
  // Cap the metric rows across groups, dropping groups left empty.
  const limit = open ? total : 5;
  const groups = view.metrics
    .map((group, i) => {
      const before = view.metrics.slice(0, i).reduce((n, g) => n + g.rows.length, 0);
      return { ...group, rows: group.rows.slice(0, Math.max(0, limit - before)) };
    })
    .filter((group) => group.rows.length > 0);

  return (
    <Section id="stat-battle">
      <SectionHeader label="STAT BATTLE" title="Every Metric" />

      <div className={styles.metrics} data-reveal>
        {groups.map((group) => (
          <div key={group.category}>
            <div className={api.category}>{group.category}</div>
            {group.rows.map(({ def, left, right }) => {
              const share = leftShare(left, right);
              const vars = { "--h": share ?? 0, "--m": share === null ? 0 : 1 - share } as CSSProperties;
              const opts = { decimals: def.decimals, unit: def.unit };

              return (
                <div key={def.id} className={styles.metric}>
                  <div className={`${styles.metricValue} ${styles.leftValue}`}>
                    <strong>{formatNum(left, opts)}</strong>
                    <span>{upper(view.names[0])}</span>
                  </div>

                  <div className={styles.metricMiddle}>
                    <div className={styles.metricTitle}>{upper(def.label)}</div>
                    <div className={styles.comparisonLine} style={vars} aria-hidden>
                      <div className={`${styles.comparisonFill} ${styles.leftFill}`} />
                      <div className={`${styles.comparisonFill} ${styles.rightFill}`} />
                    </div>
                    <div className={styles.comparisonPercent}>
                      <span className={styles.leftPercent}>{share === null ? "" : percent(share)}</span>
                      <span className={styles.rightPercent}>
                        {share === null ? "" : percent(1 - share)}
                      </span>
                    </div>
                  </div>

                  <div className={`${styles.metricValue} ${styles.rightValue}`}>
                    <strong>{formatNum(right, opts)}</strong>
                    <span>{upper(view.names[1])}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <ShowAll total={total} shown={5} open={open} onToggle={() => setOpen((v) => !v)} noun="metrics" />
    </Section>
  );
}

export function Per90({ view, players }: { view: ComparisonViewModel; players: Pair }) {
  return (
    <Section id="per-90">
      <SectionHeader label="EFFICIENCY" title="Per 90 Minutes" />

      <div className={styles.per90Grid}>
        {(["left", "right"] as const).map((side, i) => {
          const d = players[i];
          return (
            <div
              key={side}
              className={`${styles.per90Player} ${sideClass(side, styles.leftPer90, styles.rightPer90)}`}
              data-reveal
            >
              <div className={styles.per90Header}>
                <div>
                  <span>PER 90 • {formatNum(view[side].minutes)} MINUTES</span>
                  <h3>{displayName(d.profile)}</h3>
                </div>
                <div className={styles.per90Number} aria-hidden>
                  {d.profile.number !== null ? String(d.profile.number).padStart(2, "0") : ""}
                </div>
              </div>

              {view.per90.map((stat) => {
                const value = stat[side];
                const best = Math.max(stat.left ?? 0, stat.right ?? 0);
                const width = value !== null && best > 0 ? (value / best) * 100 : 0;
                return (
                  <div key={stat.label} className={styles.per90Stat}>
                    <div className={styles.per90StatHead}>
                      <span>{stat.label}</span>
                      <strong>{formatNum(value, { decimals: 2 })}</strong>
                    </div>
                    <div className={styles.miniTrack} aria-hidden>
                      <div style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

const SEASON_COLUMNS = ["PLAYER", "CLUB", "APPS", "GOALS", "ASSISTS", "G+A", "MINUTES", "RATING"];

export function SeasonTable({ view, players }: { view: ComparisonViewModel; players: Pair }) {
  const [open, setOpen] = useState(false);
  const shown = open ? view.seasons : view.seasons.slice(0, 5);

  return (
    <Section id="seasons">
      <SectionHeader label="SEASON BY SEASON" title="Every Season" />

      <div className={styles.seasonTable}>
        {shown.map((row) => (
          <div key={row.season} className={styles.seasonBlock} data-reveal>
            <div className={styles.seasonTitle}>
              <strong>{seasonLabel(row.season)}</strong>
              <span>SEASON</span>
            </div>

            <div role="table" aria-label={`${row.season} season`}>
              <div className={styles.seasonHead} role="row">
                {SEASON_COLUMNS.map((c) => (
                  <div key={c} role="columnheader">
                    {c}
                  </div>
                ))}
              </div>

              {(["left", "right"] as const).map((side, i) => {
                const line = row[side];
                const p = players[i].profile;
                return (
                  <div
                    key={side}
                    className={`${styles.seasonPlayer} ${sideClass(side, styles.leftRow, styles.rightRow)}`}
                    role="row"
                  >
                    <div className={styles.seasonPlayerName} role="cell">
                      <b>{initials(p)}</b>
                      {displayName(p)}
                    </div>
                    <div role="cell" data-label="CLUB">
                      {line ? line.clubs.join(" / ") : "No data"}
                    </div>
                    <div role="cell" data-label="APPS">
                      {line?.apps ?? "–"}
                    </div>
                    <div role="cell" data-label="GOALS">
                      <strong>{line?.goals ?? "–"}</strong>
                    </div>
                    <div role="cell" data-label="ASSISTS">
                      {line?.assists ?? "–"}
                    </div>
                    <div role="cell" data-label="G+A">
                      <strong>{line ? line.goals + line.assists : "–"}</strong>
                    </div>
                    <div role="cell" data-label="MINUTES">
                      {formatNum(line?.minutes ?? null)}
                    </div>
                    <div role="cell" data-label="RATING">
                      {formatNum(line?.rating ?? null, { decimals: 2 })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ShowAll
        total={view.seasons.length}
        shown={5}
        open={open}
        onToggle={() => setOpen((v) => !v)}
        noun="seasons"
      />
    </Section>
  );
}

function CompetitionList({ rows, side, name }: { rows: CompetitionRow[]; side: Side; name: string }) {
  const [open, setOpen] = useState(false);
  const shown = open ? rows : rows.slice(0, 8);

  return (
    <div>
      <div
        className={`${styles.trophyColumn} ${sideClass(side, styles.leftTrophies, styles.rightTrophies)}`}
        data-reveal
      >
        <div className={api.subhead}>
          {upper(name)} • {rows.length} COMPETITIONS
        </div>
        {shown.length === 0 && <div className={api.emptyList}>No appearances in this scope.</div>}
        {shown.map((c) => (
          <div key={c.id} className={api.listItem}>
            <div className={api.listIcon}>
              {c.logo && <Image src={c.logo} alt="" width={26} height={26} unoptimized />}
            </div>
            <div className={api.listMain}>
              <span className={api.listTitle}>{c.name}</span>
              <span className={api.listMeta}>
                {[c.country, `${c.seasons} season${c.seasons === 1 ? "" : "s"}`]
                  .filter(Boolean)
                  .join(" • ")}
              </span>
            </div>
            <div className={api.listStats}>
              <div>
                <strong>{c.apps}</strong>
                <span>APPS</span>
              </div>
              <div>
                <strong>{c.goals}</strong>
                <span>GOALS</span>
              </div>
              <div>
                <strong>{c.assists}</strong>
                <span>AST</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ShowAll total={rows.length} shown={8} open={open} onToggle={() => setOpen((v) => !v)} noun="competitions" />
    </div>
  );
}

export function Competitions({ view }: { view: ComparisonViewModel }) {
  return (
    <Section id="competitions">
      <SectionHeader label="BREAKDOWN" title="By Competition" />

      <div className={api.columns}>
        <CompetitionList rows={view.competitions[0]} side="left" name={view.names[0]} />
        <CompetitionList rows={view.competitions[1]} side="right" name={view.names[1]} />
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Scope-independent sections
// ---------------------------------------------------------------------------

function PlayerColumn({
  dossier,
  side,
  kicker,
  children,
}: {
  dossier: PlayerDossier;
  side: Side;
  kicker: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`${styles.trophyColumn} ${sideClass(side, styles.leftTrophies, styles.rightTrophies)}`}
      data-reveal
    >
      <div className={styles.trophyPlayerHeader}>
        <div className={styles.trophyAvatar}>{initials(dossier.profile)}</div>
        <div>
          <span>{kicker}</span>
          <h3>{displayName(dossier.profile)}</h3>
        </div>
      </div>
      {children}
    </div>
  );
}

function TrophyColumn({ dossier, side }: { dossier: PlayerDossier; side: Side }) {
  const [open, setOpen] = useState(false);
  const summary = dossier.trophies;
  const winners = summary?.winners ?? [];
  const shown = open ? winners : winners.slice(0, 10);

  return (
    <div>
      <PlayerColumn
        dossier={dossier}
        side={side}
        kicker={
          summary
            ? `${summary.totalWins} TITLES • ${summary.runnersUp} RUNNER-UP FINISHES`
            : "TROPHIES UNAVAILABLE"
        }
      >
        {!summary && <div className={api.emptyList}>No trophy data available.</div>}
        {summary && winners.length === 0 && <div className={api.emptyList}>No titles recorded.</div>}
        {shown.map((h) => (
          <div key={`${h.league}-${h.country}`} className={api.listItem}>
            <div className={api.count}>{h.count}</div>
            <div className={api.listMain}>
              <span className={api.listTitle}>{h.league}</span>
              <span className={api.listMeta}>
                {[h.country, h.seasons.join(", ")].filter(Boolean).join(" • ")}
              </span>
            </div>
          </div>
        ))}
      </PlayerColumn>
      <ShowAll total={winners.length} shown={10} open={open} onToggle={() => setOpen((v) => !v)} noun="titles" />
    </div>
  );
}

export function Trophies({ players }: { players: Pair }) {
  return (
    <Section id="trophies">
      <SectionHeader label="HONOURS" title="Trophy Cabinet">
        Every title on record for each player, grouped by competition, with the seasons it was
        won in. Runner-up finishes are counted in the heading.
      </SectionHeader>

      <div className={api.columns}>
        <TrophyColumn dossier={players[0]} side="left" />
        <TrophyColumn dossier={players[1]} side="right" />
      </div>
    </Section>
  );
}

function seasonSpan(seasons: number[]) {
  if (!seasons.length) return "";
  const first = seasons[0];
  const last = seasons[seasons.length - 1];
  return first === last ? String(first) : `${first}–${last}`;
}

function PathColumn({ dossier, side }: { dossier: PlayerDossier; side: Side }) {
  const transfers = dossier.transfers;

  return (
    <PlayerColumn dossier={dossier} side={side} kicker={`${dossier.clubs.length} TEAMS`}>
      <div className={api.subhead}>TEAMS</div>
      {dossier.clubs.map((club) => (
        <div key={club.id} className={api.listItem}>
          <div className={api.listIcon}>
            {club.logo && <Image src={club.logo} alt="" width={26} height={26} unoptimized />}
          </div>
          <div className={api.listMain}>
            <span className={api.listTitle}>{club.name}</span>
            <span className={api.listMeta}>
              {[
                club.national ? "National team" : "Club",
                seasonSpan(club.seasons),
                club.seasons.length
                  ? `${club.seasons.length} season${club.seasons.length === 1 ? "" : "s"}`
                  : "",
              ]
                .filter(Boolean)
                .join(" • ")}
            </span>
          </div>
        </div>
      ))}

      <div className={api.subhead}>TRANSFERS</div>
      {transfers === null && <div className={api.emptyList}>Transfer history unavailable.</div>}
      {transfers?.length === 0 && <div className={api.emptyList}>No transfers recorded.</div>}
      {transfers?.map((t, i) => (
        <div key={`${t.date}-${i}`} className={api.listItem}>
          <div className={api.listMain}>
            <span className={api.listTitle}>
              {t.from?.name ?? "Unknown"}
              <span className={api.arrow}>→</span>
              {t.to?.name ?? "Unknown"}
            </span>
            <span className={api.listMeta}>
              {formatDate(t.date)}
              {t.type ? ` • ${t.type}` : ""}
            </span>
          </div>
        </div>
      ))}
    </PlayerColumn>
  );
}

export function CareerPath({ players }: { players: Pair }) {
  return (
    <Section id="career-path">
      <SectionHeader label="JOURNEY" title="Career Path" />

      <div className={api.columns}>
        <PathColumn dossier={players[0]} side="left" />
        <PathColumn dossier={players[1]} side="right" />
      </div>
    </Section>
  );
}

function InjuryColumn({ dossier, side }: { dossier: PlayerDossier; side: Side }) {
  const [open, setOpen] = useState(false);
  const injuries = dossier.injuries;
  const list = injuries ?? [];
  const shown = open ? list : list.slice(0, 6);
  const days = daysMissed(list);
  const latest = list[0];

  return (
    <div>
      <PlayerColumn dossier={dossier} side={side} kicker="AVAILABILITY">
        {injuries === null ? (
          <div className={api.emptyList}>Injury history unavailable.</div>
        ) : (
          <>
            <div className={api.summary}>
              <div>
                <strong>{list.length}</strong>
                <span>SPELLS OUT</span>
              </div>
              <div>
                <strong>{formatNum(days)}</strong>
                <span>DAYS MISSED</span>
              </div>
              <div>
                <strong>{latest ? latest.start?.slice(0, 4) ?? "–" : "–"}</strong>
                <span>LATEST</span>
              </div>
            </div>
            {list.length === 0 && <div className={api.emptyList}>No absences recorded.</div>}
            {shown.map((injury, i) => (
              <div key={`${injury.start}-${i}`} className={api.listItem}>
                <div className={api.listMain}>
                  <span className={api.listTitle}>{injury.type}</span>
                  <span className={api.listMeta}>
                    {formatDate(injury.start)} → {formatDate(injury.end)}
                    {daysBetween(injury.start, injury.end) !== null &&
                      ` • ${daysBetween(injury.start, injury.end)} days`}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </PlayerColumn>
      <ShowAll total={list.length} shown={6} open={open} onToggle={() => setOpen((v) => !v)} noun="absences" />
    </div>
  );
}

export function Availability({ players }: { players: Pair }) {
  return (
    <Section id="availability">
      <SectionHeader label="FITNESS" title="Injuries & Absences">
        Every recorded spell on the sidelines, most recent first.
      </SectionHeader>

      <div className={api.columns}>
        <InjuryColumn dossier={players[0]} side="left" />
        <InjuryColumn dossier={players[1]} side="right" />
      </div>
    </Section>
  );
}

const SCOUTING_AXES = [
  { label: "Attacking", key: "attacking" },
  { label: "Technical", key: "technical" },
  { label: "Tactical", key: "tactical" },
  { label: "Defending", key: "defending" },
  { label: "Creativity", key: "creativity" },
] as const;

function ScoutingColumn({ dossier, side }: { dossier: PlayerDossier; side: Side }) {
  const s = dossier.scouting;
  const facts = s
    ? [
        { label: "Scouting role", value: s.role },
        { label: "Ability rating", value: s.rating !== null ? `${s.rating} / 200` : null },
        { label: "Potential", value: s.potential },
        { label: "Injury risk", value: s.injuryRisk },
      ].filter((f) => f.value)
    : [];

  return (
    <PlayerColumn dossier={dossier} side={side} kicker="SCOUTING">
      {!s && <div className={api.emptyList}>No scouting data for this player.</div>}
      {facts.map((f) => (
        <div key={f.label} className={api.listItem}>
          <div className={api.listMain}>
            <span className={api.listMeta}>{f.label}</span>
            <span className={api.listTitle}>{f.value}</span>
          </div>
        </div>
      ))}
      {s && s.strengths.length > 0 && (
        <div className={api.listItem}>
          <div className={api.listMain}>
            <span className={api.listMeta}>Strengths</span>
            <div className={api.chips}>
              {s.strengths.map((item) => (
                <span key={item} className={api.chip}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {s && s.weaknesses.length > 0 && (
        <div className={api.listItem}>
          <div className={api.listMain}>
            <span className={api.listMeta}>Weaknesses</span>
            <div className={api.chips}>
              {s.weaknesses.map((item) => (
                <span key={item} className={`${api.chip} ${api.chipWeak}`}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </PlayerColumn>
  );
}

export function ScoutingReport({ players, names }: { players: Pair; names: [string, string] }) {
  const [a, b] = players.map((d) => d.scouting);
  const axes = SCOUTING_AXES.filter(({ key }) => a?.[key] != null && b?.[key] != null);

  return (
    <Section id="scouting">
      <SectionHeader label="SCOUTING" title="Scouting Report" />

      {axes.length >= 3 && (
        <div className={styles.chartCard} data-reveal>
          <div className={styles.profileChart}>
            <div className={styles.radarWrapper}>
              <RadarChart
                labels={axes.map((x) => x.label)}
                series={[
                  { label: names[0], data: axes.map((x) => a![x.key]) },
                  { label: names[1], data: axes.map((x) => b![x.key]) },
                ]}
                min={0}
                max={20}
                tooltips={[
                  axes.map((x) => `${a![x.key]} / 20`),
                  axes.map((x) => `${b![x.key]} / 20`),
                ]}
                ariaLabel={`Radar chart of scouting attributes for ${names[0]} and ${names[1]}.`}
              />
            </div>
            <div className={styles.profileSide}>
              <div className={styles.profilePlayer}>
                <div className={`${styles.profileDot} ${styles.dotLeft}`} />
                {upper(names[0])}
              </div>
              <div className={styles.profilePlayer}>
                <div className={`${styles.profileDot} ${styles.dotRight}`} />
                {upper(names[1])}
              </div>
              <p>Scouting scores, not match statistics. Higher is better on every axis.</p>
            </div>
          </div>
        </div>
      )}

      <div className={api.columns}>
        <ScoutingColumn dossier={players[0]} side="left" />
        <ScoutingColumn dossier={players[1]} side="right" />
      </div>
    </Section>
  );
}

function MediaColumn({ dossier, side }: { dossier: PlayerDossier; side: Side }) {
  const [open, setOpen] = useState(false);
  const items = dossier.media ?? [];
  const shown = open ? items : items.slice(0, 5);

  return (
    <div>
      <PlayerColumn dossier={dossier} side={side} kicker={`${items.length} LATEST ITEMS`}>
        {items.length === 0 && <div className={api.emptyList}>No recent videos or posts.</div>}
        {shown.map((item) => (
          <a
            key={item.url}
            className={`${api.listItem} ${api.mediaItem}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={api.mediaType}>{item.type === "video" ? "▶" : "✦"}</span>
            <div className={api.listMain}>
              <span className={api.listTitle}>{item.title || "Untitled"}</span>
              <span className={api.listMeta}>
                {[item.type, item.account, formatDate(item.publishedAt)].filter(Boolean).join(" • ")}
              </span>
            </div>
          </a>
        ))}
      </PlayerColumn>
      <ShowAll total={items.length} shown={5} open={open} onToggle={() => setOpen((v) => !v)} noun="items" />
    </div>
  );
}

export function Media({ players }: { players: Pair }) {
  return (
    <Section id="media">
      <SectionHeader label="MEDIA" title="Latest Media" />

      <div className={api.columns}>
        <MediaColumn dossier={players[0]} side="left" />
        <MediaColumn dossier={players[1]} side="right" />
      </div>
    </Section>
  );
}
