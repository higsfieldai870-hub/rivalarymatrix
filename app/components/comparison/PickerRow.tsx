"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PlayerProfile } from "@/lib/player-stats";
import api from "./api.module.css";
import styles from "./comparison.module.css";
import PlayerPicker from "./PlayerPicker";

type Selection = [PlayerProfile | null, PlayerProfile | null];

function hintFor([left, right]: Selection) {
  if (!left && !right) return "Pick a player for each corner.";
  if (!left) return "Now pick the left player.";
  if (!right) return "Now pick the right player.";
  if (left.id === right.id) return "Pick two different players.";
  return null;
}

// Both pickers plus swap, and the button that opens the full comparison at
// /compare/<left-name>-vs-<right-name>.
export default function PickerRow() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Selection>([null, null]);
  const [error, setError] = useState<string | null>(null);
  const hint = hintFor(selected);

  function select(next: Selection) {
    setSelected(next);
    setError(null);
  }

  function viewComparison() {
    const [left, right] = selected;
    if (!left || !right) return;
    setError(null);

    // The server builds the URL, since only it knows whether a name alone
    // leads back to this player.
    startTransition(async () => {
      try {
        const res = await fetch(`/api/compare?left=${left.id}&right=${right.id}`);
        const body = (await res.json()) as { path?: string; error?: string };
        if (!res.ok || !body.path) throw new Error(body.error ?? "Couldn't open the comparison.");
        const path = body.path;
        startTransition(() => router.push(path));
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <>
      <div className={api.pickerRow}>
        <PlayerPicker side="left" player={selected[0]} onSelect={(p) => select([p, selected[1]])} />

        <div className={api.pickerVs}>
          <div className={styles.vsBall} aria-hidden>
            ⚽
          </div>
          <button
            type="button"
            className={api.swap}
            disabled={!selected[0] && !selected[1]}
            onClick={() => select([selected[1], selected[0]])}
          >
            ⇄ SWAP
          </button>
        </div>

        <PlayerPicker side="right" player={selected[1]} onSelect={(p) => select([selected[0], p])} />
      </div>

      <div className={api.compareAction}>
        <button
          type="button"
          className={api.compareButton}
          disabled={hint !== null || pending}
          onClick={viewComparison}
        >
          {pending ? "Opening comparison…" : "View full comparison →"}
        </button>
        <p className={`${api.compareHint} ${error ? api.searchError : ""}`} aria-live="polite">
          {error ?? hint}
        </p>
      </div>
    </>
  );
}
