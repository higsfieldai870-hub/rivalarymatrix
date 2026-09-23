"use client";

import { useMemo, useState } from "react";
import {
  latestSeason,
  scopes,
  seasonLabel,
  type DataSource,
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
  DataNotes,
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

export default function ComparisonView({
  left,
  right,
  source,
}: {
  left: PlayerDossier;
  right: PlayerDossier;
  source: DataSource | null;
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
              {labelFor(s.id, s.label)}
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
          <CareerCard view={view} scopeLabel={scopeLabel} players={players} />
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
      <DataNotes players={players} source={source} />
    </>
  );
}
