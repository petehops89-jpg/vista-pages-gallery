"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Particle = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
  rotate: number;
};

const COLORS = ["#00e5ff", "#ff3b6b", "#ffd54a", "#a259ff", "#2ecc71"];

/**
 * Exploding coloured-powder burst. Renders a fixed, full-screen canvas of
 * particles that fire once on mount (and whenever `trigger` changes).
 * Simulates powder: fast initial spread, gravity, fade.
 */
export default function PowderBurst({
  trigger = 0,
  count = 36,
}: {
  trigger?: number;
  count?: number;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0 && particles.length === 0) return;
    const cx = typeof window !== "undefined" ? window.innerWidth / 2 : 200;
    const cy = typeof window !== "undefined" ? window.innerHeight * 0.35 : 200;
    const next: Particle[] = Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 180 + Math.random() * 320;
      return {
        id: Date.now() + i,
        x: cx,
        y: cy,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed - 120,
        size: 6 + Math.random() * 14,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
      };
    });
    setParticles(next);
    const t = setTimeout(() => setParticles([]), 1600);
    return () => clearTimeout(t);
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: p.x, y: p.y, opacity: 1, scale: 1, rotate: p.rotate }}
          animate={{
            x: p.x + p.dx,
            y: p.y + p.dy + 260, // gravity
            opacity: 0,
            scale: 0.2,
            rotate: p.rotate + 360,
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: "40% 60% 55% 45%", // irregular powder grain
            background: p.color,
            filter: "blur(1px)",
            boxShadow: `0 0 12px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}
