"use client";

import { useEffect, useState } from "react";

/**
 * PetesQuestionsBento — BENTO BOX No. 120 (PETE'S QUESTIONS TO HERMES).
 *
 * A standalone Q&A ledger tile. Pete logs a question he fired at Hermes, tags
 * it with a category (what domain the question lived in), and tracks whether
 * Hermes has answered it yet. Each entry keeps the question text, an optional
 * answer note, the channel/category, a timestamp, and an answered flag.
 *
 * Local-only: entries persist to localStorage so they survive reloads. No
 * server. Categories are toggle filters over the question list.
 */

type Channel =
  | "Code"
  | "Research"
  | "Finance"
  | "Ops"
  | "Ideas"
  | "Random";

const CHANNELS: Channel[] = [
  "Code",
  "Research",
  "Finance",
  "Ops",
  "Ideas",
  "Random",
];

type Question = {
  id: number;
  text: string;
  answer: string;
  chan: Channel;
  ts: string;
  answered: boolean;
};

const KEY = "bento120-petes-questions";

export default function PetesQuestionsBento() {
  const [items, setItems] = useState<Question[]>([]);
  const [filter, setFilter] = useState<Channel | "ALL">("ALL");
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState("");
  const [chan, setChan] = useState<Channel>("Code");

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
      {
        id: Date.now(),
        text: t,
        answer: answer.trim(),
        chan,
        ts: new Date().toISOString(),
        answered: answer.trim().length > 0,
      },
      ...list,
    ]);
    setText("");
    setAnswer("");
  };

  const toggle = (id: number) =>
    setItems((list) =>
      list.map((q) => (q.id === id ? { ...q, answered: !q.answered } : q))
    );

  const del = (id: number) =>
    setItems((list) => list.filter((q) => q.id !== id));

  const open = items.filter((q) => !q.answered).length;

  const shown = filter === "ALL" ? items : items.filter((q) => q.chan === filter);

  return (
    <div className="rounded-lg border border-fn-accent/30 bg-black/30 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-fn-accent">
          Pete&apos;s Q&apos;s → Hermes
        </span>
        <span className="font-mono text-[8px] text-fn-muted">
          BOX 120 · {open} open
        </span>
      </div>

      {/* channel filters */}
      <div className="mb-1 flex flex-wrap gap-0.5">
        <button
          onClick={() => setFilter("ALL")}
          className={`rounded px-1 py-0.5 text-[8px] font-bold ${
            filter === "ALL"
              ? "bg-fn-accent/30 text-fn-accent"
              : "bg-white/10 text-fn-muted"
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
              filter === c
                ? "bg-fn-accent/30 text-fn-accent"
                : "bg-white/10 text-fn-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* add row */}
      <div className="mb-1 space-y-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="ask Hermes…"
          className="w-full rounded border border-white/10 bg-white/5 px-1.5 py-1 text-[10px] text-fn-text placeholder:text-fn-muted"
        />
        <div className="flex gap-1">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Hermes answer (optional)"
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
            className="rounded bg-fn-accent/30 px-2 py-1 text-[9px] font-bold text-fn-accent"
          >
            +
          </button>
        </div>
      </div>

      {/* list */}
      <div className="max-h-32 space-y-0.5 overflow-auto">
        {shown.length === 0 && (
          <div className="text-[9px] text-fn-muted">no questions in this view</div>
        )}
        {shown.map((q) => (
          <div
            key={q.id}
            className={`rounded border border-white/5 bg-white/5 px-1 py-0.5 ${
              q.answered ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start gap-1">
              <input
                type="checkbox"
                checked={q.answered}
                onChange={() => toggle(q.id)}
                className="mt-0.5 h-3 w-3 accent-fn-accent"
                aria-label="answered"
              />
              <div className="min-w-0 flex-1">
                <div
                  className={`text-[9px] ${
                    q.answered ? "text-fn-muted line-through" : "text-fn-text"
                  }`}
                  title={`${q.chan} · ${q.ts}`}
                >
                  {q.text}
                </div>
                {q.answer && (
                  <div className="truncate text-[8px] text-fn-accent">
                    ↳ {q.answer}
                  </div>
                )}
              </div>
              <span className="text-[7px] uppercase text-fn-muted">
                {q.chan}
              </span>
              <button
                onClick={() => del(q.id)}
                className="text-[9px] text-fn-muted hover:text-fn-accent2"
                aria-label="delete"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1 text-[8px] text-fn-muted">
        Q&A ledger · {items.length} total · {open} unanswered · localStorage
      </div>
    </div>
  );
}
