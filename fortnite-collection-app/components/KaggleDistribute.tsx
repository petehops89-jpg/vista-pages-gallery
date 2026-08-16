"use client";

import { useEffect, useState } from "react";
import MiniClock from "./MiniClock";

/**
 * KaggleDistribute — Kaggle compute establishment + distribution panel.
 *
 * Credentials are expected from the environment (KAGGLE_USERNAME / KAGGLE_KEY)
 * and are NEVER committed (the repo .env is gitignored). This component only
 * reflects config state and triggers a distribution action stub. The actual
 * Kaggle API call must run server-side with the secret, not in the browser.
 *
 * Wire-in for control-room:
 *  - LIVE CLOCK: UTC tick (reuses MiniClock) so the tile shows wall time.
 *  - LIMITS GAUGE: a weekly compute-hours gauge. When Kaggle creds are OK the
 *    gauge shows used/cap and ticks ~1 "hour" every real second (demo cadence)
 *    so you can watch usage climb; DISTRIBUTE adds a chunk of compute. Resets
 *    weekly (UTC Monday) to model Kaggle's 30h/wk free-GPU quota.
 */

const WEEKLY_CAP_H = 30; // Kaggle free tier: 30 GPU hours / week
const DEMO_MS_PER_HOUR = 1000; // 1 real second = 1 "compute hour" (demo pace)

function weekStartMs(d = new Date()): number {
  // UTC Monday 00:00 of the current week.
  const now = new Date(d);
  const day = (now.getUTCDay() + 6) % 7; // Mon=0
  const monday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - day,
    0,
    0,
    0
  );
  return monday;
}

export default function KaggleDistribute() {
  // In the browser we cannot read server env. We surface a "configured?"" flag
  // that the server would resolve; here we model it as a toggle for demo.
  const [configured, setConfigured] = useState(false);
  const [distributed, setDistributed] = useState(0);
  const [usedH, setUsedH] = useState(0);

  // Recompute the weekly window + roll usage over on week change (when configured).
  useEffect(() => {
    if (!configured) return;
    let start = weekStartMs();
    setUsedH(0);
    const tick = setInterval(() => {
      const ns = weekStartMs();
      if (ns !== start) {
        start = ns;
        setUsedH(0); // new week → quota refills
      } else {
        setUsedH((h) => Math.min(WEEKLY_CAP_H, h + 1));
      }
    }, DEMO_MS_PER_HOUR);
    return () => clearInterval(tick);
  }, [configured]);

  const distribute = () => {
    if (!configured) return;
    setDistributed((d) => d + 1);
    setUsedH((h) => Math.min(WEEKLY_CAP_H, h + 2)); // each dispatch = 2 compute hrs
  };

  const pct = Math.min(100, (usedH / WEEKLY_CAP_H) * 100);
  const remain = Math.max(0, WEEKLY_CAP_H - usedH);

  return (
    <div className="rounded-lg border border-fn-accent2/30 bg-black/30 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-fn-accent2">
          Kaggle · Compute
        </span>
        <div className="flex items-center gap-1">
          <MiniClock tz="UTC" />
          <button
            onClick={() => setConfigured((c) => !c)}
            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
              configured
                ? "bg-fn-accent/30 text-fn-accent"
                : "bg-white/10 text-fn-muted"
            }`}
            title="Toggle Kaggle credential state (server resolves real env)"
          >
            {configured ? "CRED OK" : "NO CRED"}
          </button>
        </div>
      </div>

      {/* limits gauge */}
      <div className="mb-1">
        <div className="mb-0.5 flex justify-between text-[8px] uppercase tracking-wider text-fn-muted">
          <span>weekly GPU</span>
          <span>
            {usedH.toFixed(0)} / {WEEKLY_CAP_H}h · {remain.toFixed(0)} left
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded bg-white/10">
          <div
            className={`h-full rounded transition-all duration-500 ${
              pct > 85
                ? "bg-fn-accent2"
                : pct > 50
                ? "bg-fn-gold"
                : "bg-fn-accent"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="space-y-1 text-[9px]">
        <div className="flex justify-between">
          <span className="text-fn-muted">compute</span>
          <span className="font-bold text-fn-text">
            {configured ? "kaggle · gpu" : "offline"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-fn-muted">distribution</span>
          <span className="font-bold text-fn-text">{distributed} dispatched</span>
        </div>
      </div>

      <button
        onClick={distribute}
        disabled={!configured}
        className={`mt-1 w-full rounded py-1 text-[9px] font-bold ${
          configured
            ? "bg-fn-accent2/30 text-fn-accent2"
            : "cursor-not-allowed bg-white/5 text-fn-muted"
        }`}
      >
        {configured ? "DISTRIBUTE" : "LOCKED — needs KAGGLE_KEY"}
      </button>
      <div className="mt-1 text-[8px] text-fn-muted">
        server-side only · env: KAGGLE_USERNAME / KAGGLE_KEY
      </div>
    </div>
  );
}
