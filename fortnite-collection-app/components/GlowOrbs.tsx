"use client";

import { motion } from "framer-motion";

/**
 * Subtle ambient glow orbs drifting slowly behind the content.
 * Pure decoration: pointer-events-none, low opacity, never overdone.
 */
const ORBS = [
  { x: "12%", y: "18%", size: 180, color: "#00e5ff", delay: 0, duration: 26 },
  { x: "78%", y: "12%", size: 140, color: "#ff3b6b", delay: 3, duration: 31 },
  { x: "85%", y: "70%", size: 220, color: "#a259ff", delay: 6, duration: 28 },
  { x: "10%", y: "80%", size: 160, color: "#ffd54a", delay: 9, duration: 24 },
  { x: "50%", y: "45%", size: 120, color: "#2ecc71", delay: 12, duration: 33 },
];

export default function GlowOrbs() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {ORBS.map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: o.size,
            height: o.size,
            left: o.x,
            top: o.y,
            background: `radial-gradient(circle, ${o.color}55 0%, ${o.color}22 45%, transparent 70%)`,
            filter: "blur(24px)",
          }}
          animate={{ y: [0, -40, 30, 0], x: [0, 30, -20, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: o.duration, delay: o.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
