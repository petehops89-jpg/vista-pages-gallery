"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "Daily Drop", href: "#drop" },
];

/** Mobile-first top bar with a smooth expand/collapse hover/tap menu. */
export default function NavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-fn-bg/70 border-b border-fn-accent/20">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <span className="font-display text-lg font-bold uppercase tracking-widest text-fn-accent">
          FN Collection
        </span>
        <button
          aria-label="Menu"
          className="fn-btn !px-3 !py-1"
          onMouseEnter={() => setOpen(true)}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-fn-accent/10 bg-fn-panel/90"
          >
            {LINKS.map((l, i) => (
              <motion.li
                key={l.href}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 font-display uppercase tracking-wider text-fn-text hover:bg-fn-accent/10 hover:text-fn-accent"
                >
                  {l.label}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </nav>
  );
}
