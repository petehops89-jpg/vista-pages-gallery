"use client";

import { useState } from "react";

/**
 * EndpointABCD — seamless endpoint routing model for the control room.
 *
 * Four endpoints A→B→C→D form a closed handoff loop. "Seamless" = the handoff
 * between endpoints carries zero visible traffic (no packet jitter / no drop):
 * we model each hop as a vector hop with a "no-traffic" flag.
 *
 * MATH (2D plane, endpoints on a unit square):
 *   A = (0,0)  B = (1,0)  C = (1,1)  D = (0,1)
 *   hop vector v_i = P_{i+1} - P_i ; hop length |v| = 1 for every edge.
 *   "no-traffic" latency per hop = 0ms (silent/seamless). Total loop = 4 hops.
 *
 * Click an endpoint to select it; the readout shows its coordinates, the
 * outgoing vector, and the seamless (zero-traffic) hop cost.
 */
const PTS: { id: "A" | "B" | "C" | "D"; x: number; y: number }[] = [
  { id: "A", x: 0, y: 0 },
  { id: "B", x: 1, y: 0 },
  { id: "C", x: 1, y: 1 },
  { id: "D", x: 0, y: 1 },
];

const ORDER = ["A", "B", "C", "D"] as const;
type Id = (typeof ORDER)[number];

function hop(from: Id, to: Id) {
  const get = (id: Id) => PTS.find((p) => p.id === id)!;
  const a = get(from);
  const b = get(to);
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const len = Math.hypot(vx, vy);
  return { vx, vy, len };
}

export default function EndpointABCD() {
  const [sel, setSel] = useState<Id>("A");
  const idx = ORDER.indexOf(sel);
  const next = ORDER[(idx + 1) % 4];
  const h = hop(sel, next);
  const p = PTS[idx];

  return (
    <div className="flex h-full w-full flex-col rounded-lg border border-fn-accent/30 bg-black/30 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-display text-[11px] font-bold uppercase tracking-wider text-fn-accent">
          Endpoint ABCD
        </span>
        <span className="rounded bg-fn-gold/20 px-1.5 py-0.5 text-[9px] font-bold text-fn-gold">
          NO-TRAFFIC
        </span>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full max-h-[150px]" preserveAspectRatio="xMidYMid meet">
          {/* square loop A-B-C-D-A */}
          <polygon
            points="10,90 90,90 90,10 10,10"
            fill="none"
            stroke="var(--fn-accent)"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
          {PTS.map((pt, i) => {
            const cx = 10 + pt.x * 80;
            const cy = 90 - pt.y * 80;
            const active = pt.id === sel;
            return (
              <g key={pt.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={active ? 6 : 4}
                  fill={active ? "var(--fn-gold)" : "var(--fn-accent)"}
                  fillOpacity={active ? 0.9 : 0.5}
                  onClick={() => setSel(pt.id)}
                  style={{ cursor: "pointer" }}
                />
                <text x={cx} y={cy - 8} textAnchor="middle" fontSize="7" fill="var(--fn-text)" fontWeight="bold">
                  {pt.id}
                </text>
                {i < 3 && (
                  <text x={(cx + (10 + PTS[i + 1].x * 80)) / 2} y={(cy + (90 - PTS[i + 1].y * 80)) / 2} textAnchor="middle" fontSize="5" fill="var(--fn-muted)">
                    0ms
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* math readout */}
      <div className="mt-1 grid grid-cols-2 gap-1 text-[9px]">
        <div className="rounded bg-white/5 px-1.5 py-1">
          <div className="text-fn-muted">selected</div>
          <div className="font-bold text-fn-text">
            {sel} = ({p.x},{p.y})
          </div>
        </div>
        <div className="rounded bg-white/5 px-1.5 py-1">
          <div className="text-fn-muted">hop → {next}</div>
          <div className="font-bold text-fn-accent">
            v=({h.vx},{h.vy}) |v|={h.len}
          </div>
        </div>
        <div className="col-span-2 rounded bg-fn-accent/10 px-1.5 py-1 text-center">
          <span className="text-fn-muted">seamless loop: 4 hops · per-hop latency </span>
          <span className="font-bold text-fn-accent">0ms</span>
          <span className="text-fn-muted"> · total traffic </span>
          <span className="font-bold text-fn-accent">0</span>
        </div>
      </div>
    </div>
  );
}
