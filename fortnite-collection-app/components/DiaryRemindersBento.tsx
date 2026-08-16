"use client";

import { useEffect, useState } from "react";

/**
 * DiaryRemindersBento — BENTO BOX No. 119 (DIARY-REMINDERS).
 *
 * A standalone secretary tile. Eight reminder channels, each a self-contained
 * domain the secretary tracks:
 *   A. Secretarial · Law · Education · Commercialism · Drama · Fine Art ·
 *      Recreation · Future Tech Gadgets
 *
 * Local-only: reminders persist to localStorage so they survive reloads. No
 * server. Channels are toggle filters over the reminder list.
 */

type Channel =
  | "Secretarial"
  | "Law"
  | "Education"
  | "Commercialism"
  | "Drama"
  | "Fine Art"
  | "Recreation"
  | "Future Tech Gadgets";

const CHANNELS: Channel[] = [
  "Secretarial",
  "Law",
  "Education",
  "Commercialism",
  "Drama",
  "Fine Art",
  "Recreation",
  "Future Tech Gadgets",
];

type Reminder = {
  id: number;
  text: string;
  chan: Channel;
  ts: string;
  done: boolean;
};

const KEY = "bento119-diary-reminders";

export default function DiaryRemindersBento() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [filter, setFilter] = useState<Channel | "ALL">("ALL");
  const [text, setText] = useState("");
  const [chan, setChan] = useState<Channel>("Secretarial");

  // load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setItems((list) => [
      { id: Date.now(), text: t, chan, ts: new Date().toISOString(), done: false },
      ...list,
    ]);
    setText("");
  };

  const toggle = (id: number) =>
    setItems((list) => list.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));

  const del = (id: number) => setItems((list) => list.filter((r) => r.id !== id));

  const shown = filter === "ALL" ? items : items.filter((r) => r.chan === filter);

  return (
    <div className="rounded-lg border border-fn-gold/30 bg-black/30 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-fn-gold">
          Diary · Reminders
        </span>
        <span className="font-mono text-[8px] text-fn-muted">BOX 119</span>
      </div>

      {/* channel filters */}
      <div className="mb-1 flex flex-wrap gap-0.5">
        <button
          onClick={() => setFilter("ALL")}
          className={`rounded px-1 py-0.5 text-[8px] font-bold ${
            filter === "ALL" ? "bg-fn-gold/30 text-fn-gold" : "bg-white/10 text-fn-muted"
          }`}
        >
          ALL
        </button>
        {CHANNELS.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            title={c}
            className={`rounded px-1 py-0.5 text-[8px] font-bold ${
              filter === c ? "bg-fn-gold/30 text-fn-gold" : "bg-white/10 text-fn-muted"
            }`}
          >
            {c.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* add row */}
      <div className="mb-1 flex gap-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="remind me…"
          className="min-w-0 flex-1 rounded border border-white/10 bg-white/5 px-1.5 py-1 text-[10px] text-fn-text placeholder:text-fn-muted"
        />
        <select
          value={chan}
          onChange={(e) => setChan(e.target.value as Channel)}
          className="rounded border border-white/10 bg-white/5 px-1 text-[9px] text-fn-text"
        >
          {CHANNELS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={add}
          className="rounded bg-fn-gold/30 px-2 py-1 text-[9px] font-bold text-fn-gold"
        >
          +
        </button>
      </div>

      {/* list */}
      <div className="max-h-28 space-y-0.5 overflow-auto">
        {shown.length === 0 && (
          <div className="text-[9px] text-fn-muted">no reminders in this view</div>
        )}
        {shown.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-1 rounded border border-white/5 bg-white/5 px-1 py-0.5"
          >
            <input
              type="checkbox"
              checked={r.done}
              onChange={() => toggle(r.id)}
              className="h-3 w-3 accent-fn-gold"
            />
            <span
              className={`flex-1 truncate text-[9px] ${
                r.done ? "text-fn-muted line-through" : "text-fn-text"
              }`}
              title={`${r.chan} · ${r.ts}`}
            >
              {r.text}
            </span>
            <span className="text-[7px] uppercase text-fn-muted">{r.chan.split(" ")[0]}</span>
            <button
              onClick={() => del(r.id)}
              className="text-[9px] text-fn-muted hover:text-fn-accent2"
              aria-label="delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-1 text-[8px] text-fn-muted">
        standalone secretary · {items.length} total · localStorage
      </div>
    </div>
  );
}
