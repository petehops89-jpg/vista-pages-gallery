"use client";

import { useState } from "react";

/**
 * BentoMenu — a hamburger (≡) pull-down with 4 items, for any bento tile.
 *
 * Default 4 items: Open · Resize · Pin · Dismiss. Clicking outside closes it.
 * onSelect receives the item id so the parent can act (or ignore, for demo).
 */
export type BentoAction = "open" | "resize" | "pin" | "dismiss";

const DEFAULT_ITEMS: { id: BentoAction; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "resize", label: "Resize" },
  { id: "pin", label: "Pin" },
  { id: "dismiss", label: "Dismiss" },
];

export default function BentoMenu({
  items = DEFAULT_ITEMS,
  onSelect,
}: {
  items?: { id: BentoAction; label: string }[];
  onSelect?: (id: BentoAction) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="grid h-5 w-5 place-items-center rounded text-fn-muted hover:bg-white/10 hover:text-fn-text"
        title="Bento menu"
        aria-label="Bento menu"
      >
        <span className="text-[13px] leading-none">≡</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-24 overflow-hidden rounded border border-white/15 bg-fn-panel shadow-lg">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onSelect?.(it.id);
                }}
                className="block w-full px-2 py-1 text-left text-[10px] text-fn-text hover:bg-fn-accent/20"
              >
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
