"use client";

import { useEffect, useState } from "react";
import { subscribeCron, getCronState, setCronEnabled, killCronJob, reviveCronJob } from "./cronBus";

/**
 * CommandControl — two-layer command-control panel for the control room.
 *
 * LAYER 1 = "0AUTH"  → the zero-auth gate (protocol: "if you're not permitted,
 *                      do not pass this gate"). External ingress / Bruce.
 * LAYER 2 = "COMMAND-CONTROL" → token + transport auth, then per-agent clearance.
 *
 * The panel toggles between DISPLAY (monitor / read-only) and MONITOR modes.
 *
 * 3 X GATE model (sequential, least → most privileged):
 *   GATE 1 (0Auth Ingress) → external entry · Bruce
 *   GATE 2 (MCP Auth)      → token + transport
 *   GATE 3 (Clearance)     → per-agent permission level
 *
 * Permission levels:
 *   L0 GUEST  : read-only, no tools
 *   L1 AGENT  : scoped tools
 *   L2 OPER   : command-control
 *   L3 OWNER  : full orchestration (Pete)
 */
export type PermLevel = "L0" | "L1" | "L2" | "L3";

const GATES: { id: string; name: string; desc: string }[] = [
  { id: "g1", name: "0AUTH", desc: "Ingress · Bruce" },
  { id: "g2", name: "MCP AUTH", desc: "Token + transport" },
  { id: "g3", name: "CLEARANCE", desc: "Per-agent permission" },
];

const LEVELS: { lv: PermLevel; role: string; scope: string }[] = [
  { lv: "L0", role: "GUEST", scope: "read-only, no tools" },
  { lv: "L1", role: "AGENT", scope: "scoped tools" },
  { lv: "L2", role: "OPER", scope: "command-control" },
  { lv: "L3", role: "OWNER", scope: "full orchestration" },
];

// Cron jobs visible to the kill-list (seeded from known in-app cron sources).
const CRON_JOBS: { id: string; name: string }[] = [
  { id: "WH1", name: "finance-feed (1s)" },
  { id: "WH2", name: "travel-feed (1s)" },
  { id: "WH3", name: "weather-feed (1s)" },
  { id: "WH4", name: "culture-feed (1s)" },
  { id: "WH5", name: "philosophy-feed (1s)" },
  { id: "VECTOR", name: "vector-cadence (1s)" },
];

export default function CommandControl({ current = "L2" }: { current?: PermLevel }) {
  const [open, setOpen] = useState<string[]>(["g1", "g2", "g3"]);
  const [mode, setMode] = useState<"DISPLAY" | "MONITOR">("DISPLAY");
  const [cronOn, setCronOn] = useState(true);
  const [killed, setKilled] = useState<Set<string>>(new Set());
  const [sel, setSel] = useState("WH1");

  // sync with shared cron bus
  useEffect(
    () =>
      subscribeCron(() => {
        const s = getCronState();
        setCronOn(s.enabled);
        setKilled(new Set(s.killed));
      }),
    []
  );

  const toggle = (id: string) =>
    setOpen((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const masterToggle = () => setCronEnabled(!cronOn); // propagates to WebhookCron etc.
  const killSelected = () => killCronJob(sel);
  const aliveCount = CRON_JOBS.filter((j) => !killed.has(j.id)).length;

  return (
    <div className="flex h-full w-full flex-col rounded-lg border border-fn-accent/30 bg-black/30 p-2">
      {/* layer + mode */}
      <div className="mb-1 flex items-center justify-between">
        <span className="font-display text-[11px] font-bold uppercase tracking-wider text-fn-accent">
          Command-Control
        </span>
        <div className="flex items-center gap-1">
          <span className="rounded bg-fn-accent2/30 px-1.5 py-0.5 text-[10px] font-bold text-fn-accent2">
            L{current.slice(1)}
          </span>
          <button
            onClick={() => setMode((m) => (m === "DISPLAY" ? "MONITOR" : "DISPLAY"))}
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
              mode === "MONITOR" ? "bg-fn-gold/30 text-fn-gold" : "bg-fn-accent/20 text-fn-accent"
            }`}
            title="Toggle display / monitor"
          >
            {mode}
          </button>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-2 gap-1 text-[8px]">
        <span
          className={`rounded px-1 py-0.5 text-center font-bold ${
            mode === "DISPLAY" ? "bg-fn-accent/20 text-fn-accent" : "text-fn-muted"
          }`}
        >
          L1 · 0AUTH
        </span>
        <span
          className={`rounded px-1 py-0.5 text-center font-bold ${
            mode === "MONITOR" ? "bg-fn-gold/20 text-fn-gold" : "text-fn-muted"
          }`}
        >
          L2 · COMMAND
        </span>
      </div>

      {/* 3-gate model */}
      <div className="grid grid-cols-3 gap-1">
        {GATES.map((g, i) => {
          const on = open.includes(g.id);
          return (
            <button
              key={g.id}
              onClick={() => toggle(g.id)}
              className={`rounded border px-1 py-1 text-left ${
                on ? "border-fn-accent/50 bg-fn-accent/15" : "border-white/10 bg-white/5 opacity-50"
              }`}
            >
              <div className="text-[9px] font-bold text-fn-text">
                {i + 1}. {g.name}
              </div>
              <div className="text-[8px] text-fn-muted">{g.desc}</div>
              <div className={`mt-0.5 text-[8px] font-bold ${on ? "text-fn-accent" : "text-fn-muted"}`}>
                {on ? "OPEN" : "SEALED"}
              </div>
            </button>
          );
        })}
      </div>

      {/* CRON CONTROL — master kill toggle + select-to-kill form */}
      <div className="mt-2 rounded border border-fn-accent2/30 bg-black/20 p-1.5">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-display text-[9px] font-bold uppercase tracking-wider text-fn-accent2">
            Cron Control
          </span>
          <button
            onClick={masterToggle}
            className={`rounded px-2 py-0.5 text-[9px] font-bold ${
              cronOn ? "bg-fn-accent/30 text-fn-accent" : "bg-fn-accent2/30 text-fn-accent2"
            }`}
            title="Master toggle — OFF kills all cron ticks"
          >
            {cronOn ? "CRON ON" : "CRON OFF"}
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            killSelected();
          }}
          className="flex items-center gap-1"
        >
          <select
            value={sel}
            onChange={(e) => setSel(e.target.value)}
            aria-label="Select cron job to kill"
            className="flex-1 rounded border border-white/10 bg-black/60 px-1 py-0.5 text-[9px] text-fn-text"
          >
            {CRON_JOBS.map((j) => (
              <option key={j.id} value={j.id} disabled={killed.has(j.id)}>
                {j.id} · {j.name}
                {killed.has(j.id) ? " (KILLED)" : ""}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded bg-fn-accent2/30 px-2 py-0.5 text-[9px] font-bold text-fn-accent2"
            title="Kill selected cron job"
          >
            KILL
          </button>
        </form>

        <div className="mt-1 flex items-center justify-between text-[8px] text-fn-muted">
          <span>
            {aliveCount}/{CRON_JOBS.length} alive
          </span>
          {killed.size > 0 && (
            <button
              onClick={() => killed.forEach((id) => reviveCronJob(id))}
              className="rounded bg-white/10 px-1.5 py-0.5 text-[8px] font-bold text-fn-muted"
              title="Revive all killed jobs"
            >
              REVIVE ALL
            </button>
          )}
        </div>
      </div>

      {/* permission levels */}
      <div className="mt-2 space-y-0.5">
        {LEVELS.map((l) => (
          <div
            key={l.lv}
            className={`flex items-center justify-between rounded px-1.5 py-0.5 text-[9px] ${
              l.lv === current ? "bg-fn-gold/20 text-fn-gold" : "text-fn-muted"
            }`}
          >
            <span className="font-bold">
              {l.lv} · {l.role}
            </span>
            <span className="truncate pl-2">{l.scope}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
