"use client";

import { useEffect, useState } from "react";
import LightningStreaks from "./LightningStreaks";
import { subscribeCron, getCronState } from "./cronBus";

/**
 * WebhookCron — 5 webhook endpoints with a 1-second cron tick.
 *
 * The cron fires every 1s ("1 second x"); each fire pulses the 5 webhook
 * rows (subtle lightning-streak overlay per tick). Webhook URLs are editable
 * placeholders; actual dispatch would POST to them on each tick (gated).
 */
const HOOKS = [
  { id: "WH1", name: "finance-feed", url: "https://hooks.vistamations/wh/finance" },
  { id: "WH2", name: "travel-feed", url: "https://hooks.vistamations/wh/travel" },
  { id: "WH3", name: "weather-feed", url: "https://hooks.vistamations/wh/weather" },
  { id: "WH4", name: "culture-feed", url: "https://hooks.vistamations/wh/culture" },
  { id: "WH5", name: "philosophy-feed", url: "https://hooks.vistamations/wh/philosophy" },
];

export default function WebhookCron() {
  const [tick, setTick] = useState(0);
  const [cronOn, setCronOn] = useState(true);

  // subscribe to the shared cron bus (CommandControl master toggle / per-job kill)
  useEffect(() => subscribeCron(() => setCronOn(getCronState().enabled)), []);

  // 1-second cron — only runs while the bus says enabled
  useEffect(() => {
    if (!cronOn) return; // master OFF => interval never starts (tick frozen)
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [cronOn]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-fn-accent/30 bg-black/30 p-2">
      <LightningStreaks className="opacity-30" />
      <div className="relative mb-1 flex items-center justify-between">
        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-fn-accent">
          Webhook · Cron
        </span>
        <span className="flex items-center gap-1">
          <span
            className={`rounded px-1 py-0.5 text-[9px] font-bold ${
              cronOn ? "bg-fn-accent/20 text-fn-accent" : "bg-fn-accent2/20 text-fn-accent2"
            }`}
            title={cronOn ? "cron running" : "cron KILLED (master off)"}
          >
            {cronOn ? `1s × ${tick}` : "KILLED"}
          </span>
        </span>
      </div>
      <div className="relative space-y-1">
        {HOOKS.map((h, i) => (
          <div
            key={h.id}
            className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-1.5 py-1"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background:
                  tick % 5 === i ? "var(--fn-accent)" : "var(--fn-muted)",
                opacity: tick % 5 === i ? 1 : 0.4,
                transition: "opacity 0.2s",
              }}
            />
            <span className="w-16 text-[9px] font-bold text-fn-text">{h.name}</span>
            <span className="flex-1 truncate text-[8px] text-fn-muted">{h.url}</span>
          </div>
        ))}
      </div>
      <div className="relative mt-1 text-[8px] text-fn-muted">
        5 webhooks · 1s cron · vector pulse
      </div>
    </div>
  );
}
