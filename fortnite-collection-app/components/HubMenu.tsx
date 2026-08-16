"use client";

import { useState } from "react";
import MiniClock from "./MiniClock";
import McpBentoGrid from "./McpBentoGrid";
import MechanicalEntry from "./MechanicalEntry";
import WebhookCron from "./WebhookCron";
import KaggleDistribute from "./KaggleDistribute";
import BudgetPanel from "./BudgetPanel";
import StockMarketBento from "./StockMarketBento";
import DiaryRemindersBento from "./DiaryRemindersBento"; // BENTO BOX 119
import PetesQuestionsBento from "./PetesQuestionsBento"; // BENTO BOX 120
import IntelligenceStronghold from "./IntelligenceStronghold"; // BENTO BOX 121
import BentoMenu from "./BentoMenu";

/**
 * HubMenu — the HUB landing surface.
 *
 * - 30 real menu entries across 7 categories (Finance, Travel, Weather, World
 *   Clock, Art, Culture, Philosophy) — slot 1 is the digital clock.
 * - MCP BENTO: 5 containers (B1–B5) × 4 resizeable inner bentos.
 * - Mechanical entry (two numeric inputs, code gate).
 * - 5 webhooks + 1-second cron (vector pulse).
 * - Kaggle compute + distribute (server-side creds only).
 * - Sub-level selector: -1 / -2 / BASEMENT.
 */
type Cat = "Finance" | "Travel" | "Weather" | "World Clock" | "Art" | "Culture" | "Philosophy";

const MENU: { label: string; cat: Cat }[] = [
  { label: "Portfolio", cat: "Finance" },
  { label: "Markets", cat: "Finance" },
  { label: "Ledger", cat: "Finance" },
  { label: "FX Rates", cat: "Finance" },
  { label: "Flights", cat: "Travel" },
  { label: "Hotels", cat: "Travel" },
  { label: "Routes", cat: "Travel" },
  { label: "Visa", cat: "Travel" },
  { label: "Radar", cat: "Weather" },
  { label: "Forecast", cat: "Weather" },
  { label: "Storms", cat: "Weather" },
  { label: "Tides", cat: "Weather" },
  { label: "UTC", cat: "World Clock" },
  { label: "AEST", cat: "World Clock" },
  { label: "GMT", cat: "World Clock" },
  { label: "Zones", cat: "World Clock" },
  { label: "Gallery", cat: "Art" },
  { label: "Sculpture", cat: "Art" },
  { label: "Palette", cat: "Art" },
  { label: "Museum", cat: "Art" },
  { label: "History", cat: "Culture" },
  { label: "Language", cat: "Culture" },
  { label: "Ritual", cat: "Culture" },
  { label: "Myth", cat: "Culture" },
  { label: "Logic", cat: "Philosophy" },
  { label: "Ethics", cat: "Philosophy" },
  { label: "Metaphysics", cat: "Philosophy" },
  { label: "Stoicism", cat: "Philosophy" },
  { label: "Dialogue", cat: "Philosophy" },
  { label: "Dialectic", cat: "Philosophy" },
];

const CAT_COLOR: Record<Cat, string> = {
  Finance: "text-fn-accent",
  Travel: "text-fn-gold",
  Weather: "text-fn-accent2",
  "World Clock": "text-fn-accent",
  Art: "text-fn-gold",
  Culture: "text-fn-accent2",
  Philosophy: "text-fn-text",
};

const LEVELS = ["L0", "-1", "-2", "BASEMENT"] as const;
type Level = (typeof LEVELS)[number];

export default function HubMenu() {
  const [level, setLevel] = useState<Level>("-1");
  const [filter, setFilter] = useState<Cat | "ALL">("ALL");
  const [list120, setList120] = useState(false);

  const shown = filter === "ALL" ? MENU : MENU.filter((m) => m.cat === filter);

  return (
    <div className="mx-auto space-y-3" style={{ width: 640, maxWidth: "100%" }}>
      {/* header + sub-levels */}
      <div className="flex items-center gap-2">
        <span className="font-display text-xs font-bold uppercase tracking-wider text-fn-accent">
          Hub · Landing
        </span>
        <div className="ml-auto flex gap-1">
          {LEVELS.map((lv) => (
            <button
              key={lv}
              onClick={() => setLevel(lv)}
              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                level === lv ? "bg-fn-gold/30 text-fn-gold" : "bg-white/10 text-fn-muted"
              }`}
            >
              {lv}
            </button>
          ))}
        </div>
      </div>

      {/* slot 1 clock + 30 menu entries */}
      <div className="rounded-xl border border-fn-accent/30 bg-fn-panel/70 p-2">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="font-mono text-sm font-bold tabular-nums text-fn-accent">
              <MiniClock />
            </div>
            <div className="text-[8px] uppercase tracking-wider text-fn-muted">slot 1 · digital clock</div>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setList120((v) => !v)}
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                list120 ? "bg-fn-gold/30 text-fn-gold" : "bg-white/10 text-fn-muted"
              }`}
              title="Toggle 120-item listing"
            >
              LIST {list120 ? "30" : "120"}
            </button>
            {(["Finance", "Travel", "Weather", "World Clock", "Art", "Culture", "Philosophy"] as Cat[]).map(
              (c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                    filter === c ? "bg-fn-gold/30 text-fn-gold" : "bg-white/10 text-fn-muted"
                  }`}
                >
                  {c}
                </button>
              )
            )}
          </div>
        </div>

        {/* 30 menu entries OR 120-item listing (opacity 60%) */}
        <div style={{ opacity: 0.6 }} className="transition-opacity hover:opacity-100">
          {list120 ? (
            <div className="grid grid-cols-4 gap-1 sm:grid-cols-6">
              {Array.from({ length: 120 }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded border border-white/5 bg-white/5 px-1 py-1"
                  title={`${level} · item ${i + 1}`}
                >
                  <span className="text-[8px] font-bold text-fn-text">#{i + 1}</span>
                  <BentoMenu onSelect={() => {}} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:grid-cols-5">
              {shown.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center justify-between rounded border border-white/5 bg-white/5 px-1.5 py-1"
                  title={`${level} · ${m.cat} · ${m.label}`}
                >
                  <div>
                    <div className="text-[9px] font-bold text-fn-text">{m.label}</div>
                    <div className={`text-[8px] ${CAT_COLOR[m.cat]}`}>{m.cat}</div>
                  </div>
                  <BentoMenu onSelect={() => {}} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-1 text-center text-[9px] uppercase tracking-wider text-fn-muted">
          {list120 ? "120 listing items" : `${shown.length} of 30 menu entries`} · {level} · opacity 60%
        </div>
      </div>

      {/* MCP BENTO 5×4 */}
      <McpBentoGrid />

      {/* budget + stock-market + diary-reminders (BOX 119) + pete's Q's (BOX 120) */}
      <div className="grid gap-2 sm:grid-cols-2">
        <BudgetPanel />
        <StockMarketBento />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <DiaryRemindersBento />
        <PetesQuestionsBento />
      </div>

      {/* intel stronghold (BOX 121) — server-backed doc store */}
      <IntelligenceStronghold />

      {/* mechanical entry + kaggle */}
      <div className="grid gap-2 sm:grid-cols-2">
        <MechanicalEntry code="1973" />
        <KaggleDistribute />
      </div>

      {/* webhook cron */}
      <WebhookCron />
    </div>
  );
}
