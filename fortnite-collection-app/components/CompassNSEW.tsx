"use client";

import { useState } from "react";

/**
 * CompassNSEW — directional control widget for the floating control-room tile.
 * Click N/S/E/W to set the heading (degrees, 0 = North). The needle rotates to
 * point at the selected heading. Used to visualise endpoint-to-endpoint routing
 * direction of the "1-bit" through the control-room map.
 */
const DIRS = [
  { label: "N", deg: 0 },
  { label: "E", deg: 90 },
  { label: "S", deg: 180 },
  { label: "W", deg: 270 },
];

export default function CompassNSEW() {
  const [heading, setHeading] = useState(0);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-fn-accent/20 bg-black/20 p-1">
      <svg viewBox="0 0 100 100" className="h-full w-full max-h-[88px]" preserveAspectRatio="xMidYMid meet">
        <circle cx="50" cy="50" r="46" fill="none" stroke="var(--fn-accent)" strokeOpacity="0.4" strokeWidth="2" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => {
          const rad = ((a - 90) * Math.PI) / 180;
          const x1 = 50 + 42 * Math.cos(rad);
          const y1 = 50 + 42 * Math.sin(rad);
          const x2 = 50 + 46 * Math.cos(rad);
          const y2 = 50 + 46 * Math.sin(rad);
          return (
            <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--fn-muted)" strokeWidth="1" strokeOpacity="0.6" />
          );
        })}
        {/* needle: rotates so the red tip points at the heading */}
        <g transform={`rotate(${heading} 50 50)`}>
          <polygon points="50,12 54,50 50,54 46,50" fill="var(--fn-accent2)" />
          <polygon points="50,88 54,50 50,46 46,50" fill="#ffffff" fillOpacity="0.85" />
        </g>
        <circle cx="50" cy="50" r="3" fill="var(--fn-gold)" />
        <text x="50" y="9" textAnchor="middle" fontSize="8" fill="var(--fn-accent)" fontWeight="bold">N</text>
        <text x="94" y="53" textAnchor="middle" fontSize="8" fill="var(--fn-muted)">E</text>
        <text x="50" y="97" textAnchor="middle" fontSize="8" fill="var(--fn-muted)">S</text>
        <text x="6" y="53" textAnchor="middle" fontSize="8" fill="var(--fn-muted)">W</text>
      </svg>
      <div className="mt-1 flex gap-1">
        {DIRS.map((d) => (
          <button
            key={d.label}
            onClick={() => setHeading(d.deg)}
            className={`rounded px-1 text-[9px] font-bold ${
              heading === d.deg ? "bg-fn-accent/40 text-fn-accent" : "bg-white/10 text-fn-muted"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="text-[9px] text-fn-muted">{heading}°</div>
    </div>
  );
}
