"use client";

import { useEffect, useState } from "react";

/** MiniClock — compact HH:MM:SS readout used as a corner badge on every bento tile. */
export default function MiniClock({ tz }: { tz?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return null;
  const t = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: tz,
  }).format(now);
  return <span className="font-mono text-[9px] tabular-nums text-fn-accent/80">{t}</span>;
}
