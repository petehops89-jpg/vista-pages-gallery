"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";

/**
 * Bento-style tile grid with 16:9 aspect ratio.
 * Pass items with a `span` to make some tiles bigger.
 * Each tile fades + translates in and lifts on hover for a smooth feel.
 */
export type BentoItem = {
  src: string;
  title: string;
  subtitle?: string;
  span?: "sm" | "wide" | "tall" | "big";
};

const SPAN_CLASS: Record<NonNullable<BentoItem["span"]>, string> = {
  sm: "col-span-1",
  wide: "col-span-2",
  tall: "col-span-1",
  big: "col-span-2",
};

/** Aspect ratios: 1-col tiles are 16:9; full-width strips are 6:1. */
const ASPECT_STYLE: Record<NonNullable<BentoItem["span"]>, CSSProperties> = {
  sm: { aspectRatio: "16 / 9" },
  wide: { aspectRatio: "6 / 1" },
  tall: { aspectRatio: "16 / 9" },
  big: { aspectRatio: "6 / 1" },
};

export default function BentoGrid({ items }: { items: BentoItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 grid-flow-dense">
      {items.map((it, i) => (
        <motion.a
          key={`${it.src}-${i}`}
          href="#"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, delay: (i % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{
            y: -12,
            scale: 1.06,
            // 1.2s hover wait before the lift + grow kicks in.
            transition: { delay: 1.2, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
          }}
          style={ASPECT_STYLE[it.span ?? "sm"]}
          className={`group relative overflow-hidden rounded-xl border border-fn-accent/25 bg-fn-panel/70 shadow-lg ${
            SPAN_CLASS[it.span ?? "sm"]
          }`}
        >
          {it.src && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={it.src}
              alt={it.title}
              loading="lazy"
              onError={(e) => {
                // Hide broken tiles instead of showing error icons — the next
                // poll drops them once the file is gone.
                e.currentTarget.style.display = "none";
              }}
              className="absolute inset-0 h-full w-full object-cover transition duration-500"
            />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <span className="absolute bottom-0 left-0 p-3">
            <span className="block font-display text-sm font-bold uppercase tracking-wide text-white">
              {it.title}
            </span>
            {it.subtitle && (
              <span className="block text-xs text-fn-muted">{it.subtitle}</span>
            )}
          </span>
        </motion.a>
      ))}
    </div>
  );
}
