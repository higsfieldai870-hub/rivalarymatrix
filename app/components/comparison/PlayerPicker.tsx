"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { PlayerProfile, Side } from "@/lib/player-stats";
import api from "./api.module.css";
import { displayName } from "./view-model";

type Status = "idle" | "loading" | "done" | "error";

const SEARCH_DELAY_MS = 450;

function describe(p: PlayerProfile) {
  return [p.nationality, p.position, p.age !== null ? `${p.age} yrs` : null]
    .filter(Boolean)
    .join(" • ");
}

// Combobox that searches players by name (debounced, so each pause costs at
// most one request) and reports the chosen player.
export default function PlayerPicker({
  side,
  player,
  onSelect,
}: {
  side: Side;
  player: PlayerProfile | null;
  onSelect: (player: PlayerProfile) => void;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerProfile[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const request = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      request.current?.abort();
    },
    [],
  );

  async function search(q: string) {
    const controller = new AbortController();
    request.current = controller;

    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      const body = (await res.json()) as { players?: PlayerProfile[]; error?: string };
      if (!res.ok) throw new Error(body.error ?? "Search failed.");

      setResults(body.players ?? []);
      setActive(0);
      setStatus("done");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message);
      setStatus("error");
    }
  }

  function onChange(value: string) {
    setQuery(value);
    setOpen(true);
    setError(null);
    clearTimeout(timer.current);
    request.current?.abort();

    const q = value.trim();
    if (q.length < 3) {
      setResults([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    timer.current = setTimeout(() => search(q), SEARCH_DELAY_MS);
  }

  function choose(p: PlayerProfile) {
    onSelect(p);
    setQuery("");
    setResults([]);
    setStatus("idle");
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      choose(results[active]);
    }
  }

  const showList = open && results.length > 0;
  const hint =
    status === "error"
      ? error
      : status === "loading"
        ? "Searching…"
        : status === "done" && results.length === 0
          ? "No players found. Try the full name or another spelling."
          : "Search by name, e.g. Messi, Haaland, Bellingham";

  return (
    <div className={`${api.picker} ${side === "left" ? api.pickerLeft : api.pickerRight}`}>
      <div className={api.pickerLabel}>{side === "left" ? "LEFT CORNER" : "RIGHT CORNER"}</div>

      <div className={api.selected}>
        {player ? (
          <>
            <div className={api.selectedPhoto}>
              <Image src={player.photo} alt="" width={150} height={150} sizes="58px" />
            </div>
            <div>
              <div className={api.selectedName}>{displayName(player)}</div>
              <div className={api.selectedMeta}>{describe(player)}</div>
            </div>
          </>
        ) : (
          <>
            <div className={`${api.selectedPhoto} ${api.selectedEmpty}`} aria-hidden>
              ?
            </div>
            <div>
              <div className={api.selectedName}>Choose a player</div>
              <div className={api.selectedMeta}>Search below</div>
            </div>
          </>
        )}
      </div>

      <div className={api.searchField}>
        <input
          className={api.searchInput}
          type="search"
          value={query}
          placeholder={player ? "Search to change player" : "Search player name"}
          aria-label={`${side === "left" ? "Left" : "Right"} player search`}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList ? `${listId}-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        />

        {showList && (
          <ul id={listId} role="listbox" className={api.results}>
            {results.map((p, i) => (
              <li
                key={p.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={api.option}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(p)}
              >
                <Image src={p.photo} alt="" width={36} height={36} unoptimized />
                <div>
                  <span className={api.optionName}>{displayName(p)}</span>
                  <span className={api.optionMeta}>{describe(p)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={`${api.searchHint} ${status === "error" ? api.searchError : ""}`} aria-live="polite">
        {hint}
      </div>
    </div>
  );
}
