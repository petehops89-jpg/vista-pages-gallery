"use client";

import { motion } from "framer-motion";
import Image from "next/image";

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
  sm: "col-span-1 row-span-1",
  wide: "col-span-2 row-span-1",
  tall: "col-span-1 row-span-2",
  big: "col-span-2 row-span-2",
};

export default function BentoGrid({ items }: { items: BentoItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it, i) => (
        <motion.a
          key={it.src + i}
          href="#"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, delay: (i % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -6, scale: 1.02 }}
          className={`group relative overflow-hidden rounded-xl border border-fn-accent/25 bg-fn-panel/70 shadow-lg aspect-video ${
            SPAN_CLASS[it.span ?? "sm"]
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={it.src}
            alt={it.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
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
