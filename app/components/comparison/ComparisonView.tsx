"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  latestSeason,
  scopes,
  seasonLabel,
  type PlayerDossier,
  type Scope,
} from "@/lib/player-stats";
import api from "./api.module.css";
import styles from "./comparison.module.css";
import {
  Analytics,
  Availability,
  Bio,
  CareerCard,
  CareerPath,
  Competitions,
  Media,
  Per90,
  ScoutingReport,
  SeasonTable,
  Showcase,
  StatBattle,
  Trophies,
} from "./sections";
import { Notice } from "./Notices";
import { buildViewModel } from "./view-model";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// Icon and short label for the mobile bottom bar.
const SCOPE_TAB: Record<Scope, { short: string; icon: ReactNode }> = {
  career: {
    short: "Career",
    icon: (
      <svg {...iconProps}>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M15 7h6v6" />
      </svg>
    ),
  },
  club: {
    short: "Club",
    icon: (
      <svg {...iconProps}>
        <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
      </svg>
    ),
  },
  international: {
    short: "Intl",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    ),
  },
  ucl: {
    short: "UCL",
    icon: (
      <svg {...iconProps}>
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
      </svg>
    ),
  },
  latest: {
    short: "Season",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    ),
  },
};

export default function ComparisonView({
  left,
  right,
}: {
  left: PlayerDossier;
  right: PlayerDossier;
}) {
  const [scope, setScope] = useState<Scope>("career");
  const latest = useMemo(() => latestSeason(left, right), [left, right]);
  const view = useMemo(
    () => buildViewModel(left, right, scope, latest),
    [left, right, scope, latest],
  );
  const players: [PlayerDossier, PlayerDossier] = [left, right];

  const labelFor = (id: Scope, label: string) =>
    id === "latest" && latest !== null ? seasonLabel(latest) : label;
  const scopeLabel = labelFor(scope, scopes.find((s) => s.id === scope)!.label);

  const hasInjuries = players.some((d) => d.injuries !== null);
  const hasTrophies = players.some((d) => d.trophies !== null);
  const hasScouting = players.some((d) => d.scouting !== null);
  const hasMedia = players.some((d) => d.media?.length);

  return (
    <>
      <div className={api.scopeBar}>
        <div className={api.scopeInner} role="group" aria-label="Statistic scope">
          {scopes.map((s) => (
            <button
              key={s.id}
              type="button"
              className={styles.filter}
              aria-pressed={scope === s.id}
              disabled={s.id === "latest" && latest === null}
              onClick={() => setScope(s.id)}
            >
              <span className={api.scopeIcon} aria-hidden>
                {SCOPE_TAB[s.id].icon}
              </span>
              <span className={api.scopeLong}>{labelFor(s.id, s.label)}</span>
              <span className={api.scopeShort} aria-hidden>
                {labelFor(s.id, SCOPE_TAB[s.id].short)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Showcase players={players} />
      <Bio players={players} names={view.names} />
      {hasScouting && <ScoutingReport players={players} names={view.names} />}

      {view.empty ? (
        <section className={styles.section}>
          <div className={styles.container}>
            <Notice title="No matches in this scope">
              Neither player has {scopeLabel.toLowerCase()} appearances in the seasons your API
              plan returned. Try another filter.
            </Notice>
          </div>
        </section>
      ) : (
        <>
          <CareerCard view={view} scopeLabel={scopeLabel} />
          <Analytics view={view} />
          <StatBattle view={view} />
          <Per90 view={view} players={players} />
          <SeasonTable key={scope} view={view} players={players} />
          <Competitions key={`c-${scope}`} view={view} />
        </>
      )}

      {hasTrophies && <Trophies players={players} />}
      <CareerPath players={players} />
      {hasInjuries && <Availability players={players} />}
      {hasMedia && <Media players={players} />}
    </>
  );
}
