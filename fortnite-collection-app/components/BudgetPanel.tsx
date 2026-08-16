"use client";

import { useEffect, useState } from "react";

/**
 * BudgetPanel — vista-coin budget with a live timestamp.
 *
 * Budget: 4,500,000 vista-coin (protocol currency). Shows a live timestamp
 * (local + AEST) so the figure is anchored to "now".
 */
export default function BudgetPanel() {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const aest = new Intl.DateTimeFormat("en-AU", {
        timeZone: "Australia/Sydney",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(d);
      setNow(`${d.toISOString()} · AEST ${aest}`);
    };
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-lg border border-fn-gold/30 bg-black/30 p-2">
      <div className="flex items-center justify-between">
        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-fn-gold">
          Budget
        </span>
        <span className="font-mono text-[9px] text-fn-muted">{now}</span>
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-fn-gold">4,500,000</div>
      <div className="text-[9px] uppercase tracking-wider text-fn-muted">vista-coin · allocated</div>
    </div>
  );
}
