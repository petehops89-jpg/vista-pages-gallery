"use client";

import { useState } from "react";
import MiniClock from "./MiniClock";

/**
 * ControlHub — the L1 terminal HUB + DASHBOARD surface.
 *
 * HUB     = central cross-road that all agent/MCP traffic routes through.
 * DASHBOARD = live status board for the 3 X GATE model (Layer 1 0AUTH →
 *            Layer 2 Command-Control) plus the container permission levels.
 *
 * Toggle between HUB (map of nodes) and DASHBOARD (status grid).
 */
type Node = { id: string; label: string; status: "ONLINE" | "STANDBY" | "SEALED" };

const NODES: Node[] = [
  { id: "hub", label: "HUB", status: "ONLINE" },
  { id: "g1", label: "0AUTH", status: "ONLINE" },
  { id: "g2", label: "MCP AUTH", status: "ONLINE" },
  { id: "g3", label: "CLEARANCE", status: "STANDBY" },
  { id: "ag", label: "AGENT-L1", status: "ONLINE" },
  { id: "op", label: "OPER-L2", status: "ONLINE" },
  { id: "ow", label: "OWNER-L3", status: "SEALED" },
];

export default function ControlHub() {
  const [tab, setTab] = useState<"HUB" | "DASHBOARD">("DASHBOARD");

  const color: Record<Node["status"], string> = {
    ONLINE: "text-fn-accent",
    STANDBY: "text-fn-gold",
    SEALED: "text-fn-muted",
  };

  return (
    <div className="flex h-full w-full flex-col rounded-lg border border-fn-accent/30 bg-black/30 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-display text-[11px] font-bold uppercase tracking-wider text-fn-accent">
          CONTROL HUB
        </span>
        <div className="flex gap-1">
          {(["HUB", "DASHBOARD"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                tab === t ? "bg-fn-accent/30 text-fn-accent" : "bg-white/10 text-fn-muted"
              }`}
            >
              {t}
            </button>
          ))}
          <span className="rounded bg-black/40 px-1.5 py-0.5">
            <MiniClock />
          </span>
        </div>
      </div>

      {tab === "DASHBOARD" ? (
        <div className="grid flex-1 grid-cols-2 gap-1 overflow-auto">
          {NODES.map((n) => (
            <div
              key={n.id}
              className="flex items-center justify-between rounded border border-white/10 bg-white/5 px-1.5 py-1"
            >
              <span className="text-[9px] font-bold text-fn-text">{n.label}</span>
              <span className={`text-[8px] font-bold ${color[n.status]}`}>{n.status}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative flex flex-1 items-center justify-center">
          <svg viewBox="0 0 100 60" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
            <line x1="50" y1="30" x2="20" y2="12" stroke="var(--fn-accent)" strokeOpacity="0.5" />
            <line x1="50" y1="30" x2="80" y2="12" stroke="var(--fn-accent)" strokeOpacity="0.5" />
            <line x1="50" y1="30" x2="20" y2="48" stroke="var(--fn-accent)" strokeOpacity="0.5" />
            <line x1="50" y1="30" x2="80" y2="48" stroke="var(--fn-accent)" strokeOpacity="0.5" />
            <circle cx="50" cy="30" r="7" fill="var(--fn-accent)" fillOpacity="0.25" stroke="var(--fn-accent)" />
            <circle cx="20" cy="12" r="4" fill="var(--fn-gold)" fillOpacity="0.4" />
            <circle cx="80" cy="12" r="4" fill="var(--fn-accent)" fillOpacity="0.4" />
            <circle cx="20" cy="48" r="4" fill="var(--fn-accent)" fillOpacity="0.4" />
            <circle cx="80" cy="48" r="4" fill="var(--fn-muted)" fillOpacity="0.4" />
            <text x="50" y="33" textAnchor="middle" fontSize="6" fill="var(--fn-text)" fontWeight="bold">HUB</text>
          </svg>
        </div>
      )}
    </div>
  );
}
