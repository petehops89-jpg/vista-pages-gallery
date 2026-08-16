"use client";

import { useEffect, useState } from "react";

/**
 * Clock — live control-room time readout.
 * Shows local browser time, UTC, and AEST (Australia/Sydney, auto DST) plus the
 * date. Ties to the protocol's XCLOCK / RACHAEL scheduler role.
 */
function fmt(d: Date, tz?: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: tz,
  }).format(d);
}

export default function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Australia/Sydney",
  }).format(now);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-fn-accent/20 bg-black/20 p-1 text-center">
      <div className="font-display text-base font-bold leading-none text-fn-accent">{fmt(now)}</div>
      <div className="text-[8px] uppercase tracking-wider text-fn-muted">local</div>
      <div className="mt-1 font-display text-xs leading-none text-fn-gold">{fmt(now, "UTC")}</div>
      <div className="text-[8px] uppercase tracking-wider text-fn-muted">UTC</div>
      <div className="mt-1 font-display text-xs leading-none text-fn-text">{fmt(now, "Australia/Sydney")}</div>
      <div className="text-[8px] uppercase tracking-wider text-fn-muted">AEST · {dateStr}</div>
    </div>
  );
}
