"use client";

import { useState } from "react";
import ResizableBento from "./ResizableBento";
import LightningStreaks from "./LightningStreaks";

/**
 * McpBentoGrid — 5 MCP containers (B1–B5), each holding 4 resizeable inner
 * bentos (20 tiles total). Every inner tile is resizeable (free W×H).
 *
 * The 20 tiles are seeded across the protocol's 7 menu categories:
 * Finance, Travel, Weather, World Clock, Art, Culture, Philosophy.
 * A subtle 1-second lightning-streak overlay marks the "1 second x" cadence.
 */
const CONTAINERS = [
  { id: "B1", seed: ["Finance", "Travel", "Weather", "World Clock"] },
  { id: "B2", seed: ["Art", "Culture", "Philosophy", "Finance"] },
  { id: "B3", seed: ["Travel", "Weather", "Art", "Culture"] },
  { id: "B4", seed: ["World Clock", "Philosophy", "Finance", "Travel"] },
  { id: "B5", seed: ["Weather", "Art", "Culture", "Philosophy"] },
] as const;

export default function McpBentoGrid() {
  const [active, setActive] = useState<string>("B1");

  return (
    <div className="relative rounded-xl border border-fn-accent/30 bg-fn-panel/60 p-2">
      <LightningStreaks className="opacity-40" />

      {/* container selector */}
      <div className="relative mb-2 flex items-center gap-1">
        <span className="font-display text-[11px] font-bold uppercase tracking-wider text-fn-accent">
          MCP BENTO
        </span>
        <div className="ml-auto flex gap-1">
          {CONTAINERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                active === c.id ? "bg-fn-accent/30 text-fn-accent" : "bg-white/10 text-fn-muted"
              }`}
            >
              {c.id}
            </button>
          ))}
        </div>
      </div>

      {/* active container: 4 resizeable inner bentos */}
      <div className="relative flex flex-wrap gap-2">
        {CONTAINERS.find((c) => c.id === active)!.seed.map((cat, i) => (
          <ResizableBento
            key={`${active}-${i}`}
            title={`${active}·${i + 1} ${cat}`}
            initialW={150}
            initialH={96}
          >
            <div className="grid h-full place-items-center text-center">
              <div>
                <div className="font-bold text-fn-text">{cat}</div>
                <div className="text-[8px] text-fn-muted">mcp · resizeable</div>
              </div>
            </div>
          </ResizableBento>
        ))}
      </div>

      <div className="relative mt-2 text-center text-[9px] uppercase tracking-wider text-fn-muted">
        5 containers × 4 bentos · 20 resizeable · 1s vector cadence
      </div>
    </div>
  );
}
