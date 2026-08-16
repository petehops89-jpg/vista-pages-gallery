"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import MiniClock from "./MiniClock";

/**
 * ResizeMoveBento — a single bento card that is DRAGGABLE and RESIZABLE inside
 * the gallery surface (not fixed to the viewport like FloatingBentoTile).
 * Aspect is NOT forced (free bento), but min/max bounds are enforced.
 *
 * Props:
 *   src / title / subtitle  — same shape as BentoGrid items
 *   initialX / initialY / initialW / initialH — starting layout (px, relative to parent)
 */
const MIN_W = 160;
const MIN_H = 90;
const MAX_W = 900;
const MAX_H = 600;

export default function ResizeMoveBento({
  src,
  title,
  subtitle,
  initialX = 24,
  initialY = 24,
  initialW = 280,
  initialH = 158,
}: {
  src?: string;
  title: string;
  subtitle?: string;
  initialX?: number;
  initialY?: number;
  initialW?: number;
  initialH?: number;
}) {
  const [box, setBox] = useState({ x: initialX, y: initialY, w: initialW, h: initialH });
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const size = useRef<{ px: number; py: number; w: number; h: number } | null>(null);

  useEffect(() => {
    const onUp = () => {
      drag.current = null;
      size.current = null;
    };
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, []);

  const onDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: box.x, y: box.y };
  }, [box.x, box.y]);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.px;
    const dy = e.clientY - drag.current.py;
    setBox((p) => ({ ...p, x: Math.max(0, drag.current!.x + dx), y: Math.max(0, drag.current!.y + dy) }));
  }, []);

  const onSizeDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    size.current = { px: e.clientX, py: e.clientY, w: box.w, h: box.h };
  }, [box.w, box.h]);

  const onSizeMove = useCallback((e: React.PointerEvent) => {
    if (!size.current) return;
    const dx = e.clientX - size.current.px;
    const dy = e.clientY - size.current.py;
    setBox((p) => ({
      ...p,
      w: Math.min(MAX_W, Math.max(MIN_W, size.current!.w + dx)),
      h: Math.min(MAX_H, Math.max(MIN_H, size.current!.h + dy)),
    }));
  }, []);

  return (
    <motion.div
      className="absolute z-20 overflow-hidden rounded-xl border border-fn-accent/30 bg-fn-panel/80 shadow-lg"
      style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* drag handle */}
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        className="flex cursor-grab items-center justify-between border-b border-fn-accent/20 bg-fn-accent/10 px-2 py-1 active:cursor-grabbing"
      >
        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-fn-text">{title}</span>
        <MiniClock />
      </div>

      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={src} alt={title} loading="lazy" className="absolute inset-x-0 bottom-0 top-6 h-[calc(100%-24px)] w-full object-cover" />
      ) : (
        <div className="absolute inset-x-0 bottom-0 top-6 grid place-items-center text-xs text-fn-muted">
          {subtitle ?? "resize / move"}
        </div>
      )}

      {/* resize grip */}
      <div
        onPointerDown={onSizeDown}
        onPointerMove={onSizeMove}
        className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
        title="Drag to resize"
      >
        <div className="absolute bottom-1 right-1 h-2 w-2 rounded-sm border-b-2 border-r-2 border-fn-accent" />
      </div>
    </motion.div>
  );
}
