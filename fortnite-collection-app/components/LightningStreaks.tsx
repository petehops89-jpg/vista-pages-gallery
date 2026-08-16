"use client";

/**
 * LightningStreaks — subtle vector lightning streaks animating on a 1-second loop.
 *
 * Pure SVG + CSS. Each streak is a thin polyline that flashes in/out once per
 * second (staggered). "Subtle" = low opacity, thin stroke, no fill, behind content.
 * Used as a control-room backdrop overlay (pointer-events: none).
 *
 * Cadence: 1s vector clip (the protocol's "1 second x" tick).
 */
const STREAKS = [
  "M0,10 L40,40 L30,70 L70,110",
  "M120,0 L100,50 L140,80 L110,130",
  "M200,20 L230,60 L210,90 L250,140",
  "M60,140 L90,100 L70,70 L110,30",
  "M260,120 L240,80 L280,50 L250,10",
];

export default function LightningStreaks({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <style>{`
        @keyframes ls-flash {
          0%   { opacity: 0;   stroke-dashoffset: 200; }
          8%   { opacity: 0.55; }
          20%  { opacity: 0;   stroke-dashoffset: 0; }
          100% { opacity: 0;   stroke-dashoffset: 0; }
        }
        .ls-streak {
          fill: none;
          stroke: var(--fn-accent);
          stroke-width: 1;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 200;
          opacity: 0;
          animation: ls-flash 1s linear infinite;
        }
      `}</style>
      <svg viewBox="0 0 320 160" preserveAspectRatio="none" className="h-full w-full">
        {STREAKS.map((d, i) => (
          <path
            key={i}
            d={d}
            className="ls-streak"
            style={{ animationDelay: `${(i * 0.2).toFixed(2)}s` }}
          />
        ))}
      </svg>
    </div>
  );
}
