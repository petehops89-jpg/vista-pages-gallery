"use client";

import { useState } from "react";

/**
 * Calendar — month grid for the control room.
 * Visualises the protocol's "only half a calendar — the future endpoint side":
 * days AFTER today are highlighted as the (existing) future endpoint half; past
 * days are dimmed as the missing/half side. Today is marked gold.
 */
export default function Calendar() {
  const [ref] = useState(() => new Date());
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Intl.DateTimeFormat("en-AU", { month: "short" }).format(ref);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSameMonth =
    month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="flex h-full w-full flex-col rounded-lg border border-fn-accent/20 bg-black/20 p-1">
      <div className="mb-1 text-center font-display text-[10px] font-bold uppercase tracking-wider text-fn-accent">
        {monthName} {year}
      </div>
      <div className="grid grid-cols-7 gap-[2px] text-[8px] text-fn-muted">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 gap-[2px]">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const isToday = isSameMonth && d === today.getDate();
          const isFuture = isSameMonth && d > today.getDate();
          return (
            <div
              key={i}
              className={
                "grid place-items-center rounded text-[9px] " +
                (isToday
                  ? "bg-fn-gold/30 font-bold text-fn-gold"
                  : isFuture
                  ? "bg-fn-accent/15 text-fn-accent"
                  : "text-fn-muted/40")
              }
            >
              {d}
            </div>
          );
        })}
      </div>
      <div className="mt-1 text-center text-[8px] uppercase tracking-wider text-fn-muted">
        future endpoint side ▸
      </div>
    </div>
  );
}
