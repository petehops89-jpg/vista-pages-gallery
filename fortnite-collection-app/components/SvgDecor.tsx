/** Decorative SVG vectors (animated gradient, hexagons) for the hero/background. */
export function HexBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <pattern id="hexes" width="56" height="48" patternUnits="userSpaceOnUse">
          <path
            d="M28 0 L56 16 L56 32 L28 48 L0 32 L0 16 Z"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="1.2"
          />
        </pattern>
        <radialGradient id="glow" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="#ff3b6b" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0b1020" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexes)" />
      <rect width="100%" height="100%" fill="url(#glow)" />
    </svg>
  );
}

export function LogoMark({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-label="Fortnite Collection logo">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00e5ff" />
          <stop offset="1" stopColor="#ff3b6b" />
        </linearGradient>
      </defs>
      <path d="M256 96 L400 176 V336 L256 416 L112 336 V176 Z" fill="none" stroke="url(#lg)" strokeWidth="22" />
      <circle cx="256" cy="256" r="40" fill="#ffd54a" />
    </svg>
  );
}
