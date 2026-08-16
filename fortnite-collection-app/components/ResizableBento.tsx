"use client";

import { useCallback, useRef, useState } from "react";
import BentoMenu from "./BentoMenu";

/**
 * ResizableBento — a single resizeable bento tile (no aspect lock; free W×H).
 * Drag the bottom-right grip to resize. Used inside McpBentoGrid containers.
 */
export default function ResizableBento({
  title,
  children,
  initialW = 150,
  initialH = 96,
}: {
  title: string;
  children?: React.ReactNode;
  initialW?: number;
  initialH?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(initialW);
  const [h, setH] = useState(initialH);
  const drag = useRef<{ sx: number; sy: number; sw: number; sh: number } | null>(null);

  const onDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      drag.current = { sx: e.clientX, sy: e.clientY, sw: w, sh: h };
      const move = (ev: PointerEvent) => {
        if (!drag.current) return;
        const dw = ev.clientX - drag.current.sx;
        const dh = ev.clientY - drag.current.sy;
        setW(Math.max(60, drag.current.sw + dw));
        setH(Math.max(48, drag.current.sh + dh));
      };
      const up = () => {
        drag.current = null;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [w, h]
  );

  return (
    <div
      ref={ref}
      className="relative flex flex-col rounded-lg border border-fn-accent/30 bg-black/30"
      style={{ width: w, height: h }}
    >
      <div className="flex items-center justify-between border-b border-fn-accent/15 px-2 py-1">
        <span className="text-[9px] font-bold uppercase tracking-wider text-fn-accent">
          {title}
        </span>
        <BentoMenu onSelect={() => {}} />
      </div>
      <div className="flex-1 overflow-auto p-1 text-[9px] text-fn-muted">{children}</div>
      <div
        onPointerDown={onDown}
        className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
        title="Drag to resize"
      >
        <div className="absolute bottom-1 right-1 h-2 w-2 rounded-sm border-b-2 border-r-2 border-fn-accent" />
      </div>
    </div>
  );
}
