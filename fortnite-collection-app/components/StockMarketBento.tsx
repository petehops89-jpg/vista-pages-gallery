"use client";

import { useState } from "react";

/**
 * StockMarketBento — a stock-market tile for the control-room bento grid.
 *
 * Seeded tickers with synthetic price/change. Prices tick on a 1s interval to
 * feel live (clearly synthetic — no real market data wired). Expandable list.
 */
const SEED = [
  { sym: "VISTA", px: 184.2, chg: +1.3 },
  { sym: "XORG", px: 92.7, chg: -0.4 },
  { sym: "DOC", px: 311.0, chg: +2.1 },
  { sym: "BRUCE", px: 47.5, chg: +0.2 },
  { sym: "MERLN", px: 128.9, chg: -1.0 },
  { sym: "PETE", px: 999.0, chg: +5.0 },
];

export default function StockMarketBento() {
  const [rows, setRows] = useState(SEED);

  // synthetic 1s tick
  // (kept light: only when mounted; cheap map over 6 rows)
  useState(() => {
    const id = setInterval(() => {
      setRows((r) =>
        r.map((x) => {
          const d = (Math.random() - 0.5) * 0.6;
          return { ...x, px: +(x.px + d).toFixed(2), chg: +(x.chg + d).toFixed(2) };
        })
      );
    }, 1000);
    return () => clearInterval(id);
  });

  return (
    <div className="rounded-lg border border-fn-accent/30 bg-black/30 p-2">
      <div className="mb-1 font-display text-[10px] font-bold uppercase tracking-wider text-fn-accent">
        Stock Market
      </div>
      <div className="space-y-0.5">
        {rows.map((r) => (
          <div key={r.sym} className="flex items-center justify-between text-[9px]">
            <span className="font-bold text-fn-text">{r.sym}</span>
            <span className="font-mono text-fn-muted">{r.px.toFixed(2)}</span>
            <span className={`font-mono ${r.chg >= 0 ? "text-fn-accent" : "text-fn-accent2"}`}>
              {r.chg >= 0 ? "+" : ""}
              {r.chg.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 text-[8px] text-fn-muted">synthetic · 1s tick</div>
    </div>
  );
}
