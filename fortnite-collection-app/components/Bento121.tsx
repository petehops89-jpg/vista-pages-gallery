"use client";

import { useEffect, useState } from "react";

/**
 * Bento121 — OWNER TUNNEL (Pete).
 *
 * Deliberately NOT on the 16:9 floor map (Box 119 Diary etc. live on-grid).
 * This tile floats BEYOND the 16:9 canvas: absolutely positioned overlay,
 * draggable, pinned to the owner. Shows the :8888 tunnel + gate-pete + PIN
 * (X1973) status, and the MOCK/TEST indicator so nothing is ever hard-locked.
 */
const TUNNEL_PORT = 8888;
const GATE = "gate-pete";

export default function Bento121({ onClose }: { onClose?: () => void }) {
  const [pos, setPos] = useState({ x: 40, y: 40 });
  const [verified, setVerified] = useState(false);
  const [mock, setMock] = useState(true);
  const [attempt, setAttempt] = useState("");
  const [health, setHealth] = useState<string>("—");

  // MOCK/TEST: probe the tunnel health without locking anything
  useEffect(() => {
    let alive = true;
    const probe = async () => {
      try {
        const r = await fetch(`http://localhost:${TUNNEL_PORT}/owner/health`, { cache: "no-store" });
        if (!alive) return;
        const j = await r.json();
        setMock(j.mode !== "LIVE");
        setHealth(j.mode || "—");
      } catch {
        if (!alive) return;
        // tunnel not running -> still mock, never lock the UI
        setMock(true);
        setHealth("down (mock)");
      }
    };
    probe();
    const id = setInterval(probe, 3000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const tryOpen = async () => {
    try {
      const r = await fetch(`http://localhost:${TUNNEL_PORT}/owner/open`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gate: GATE, pin: attempt }),
      });
      const j = await r.json();
      setVerified(!!j.verified);
      setMock(j.mode !== "LIVE");
    } catch {
      // no hard lock: failure => stays mock
      setMock(true);
      setVerified(false);
    }
  };

  // drag
  const drag = (e: React.MouseEvent) => {
    const startX = e.clientX - pos.x;
    const startY = e.clientY - pos.y;
    const move = (ev: MouseEvent) => setPos({ x: ev.clientX - startX, y: ev.clientY - startY });
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div
      className="absolute z-50 w-56 rounded-lg border border-fn-gold/40 bg-black/80 p-2 shadow-2xl backdrop-blur"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        onMouseDown={drag}
        className="mb-1 flex cursor-move items-center justify-between"
      >
        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-fn-gold">
          Bento 121 · Owner Tunnel
        </span>
        {onClose && (
          <button onClick={onClose} className="text-[10px] text-fn-muted hover:text-fn-gold">
            ✕
          </button>
        )}
      </div>

      <div className="space-y-1 text-[9px]">
        <div className="flex justify-between">
          <span className="text-fn-muted">ingress</span>
          <span className="font-mono text-fn-gold">:{TUNNEL_PORT}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-fn-muted">gate</span>
          <span className="font-bold text-fn-text">{GATE}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-fn-muted">mode</span>
          <span className={`font-bold ${mock ? "text-fn-accent2" : "text-fn-accent"}`}>
            {mock ? "MOCK / TEST" : "LIVE"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-fn-muted">state</span>
          <span className={`font-bold ${verified ? "text-fn-accent" : "text-fn-muted"}`}>
            {verified ? "VERIFIED" : health}
          </span>
        </div>

        <input
          value={attempt}
          onChange={(e) => setAttempt(e.target.value)}
          placeholder="PIN (X1973)"
          className="w-full rounded border border-white/10 bg-black/60 px-1 py-0.5 text-[9px] text-fn-text outline-none"
          aria-label="Owner PIN"
        />
        <button
          onClick={tryOpen}
          className="w-full rounded bg-fn-gold/30 py-0.5 text-[9px] font-bold text-fn-gold"
          title="Open owner tunnel (mock if unverified — never locks)"
        >
          OPEN TUNNEL
        </button>
        <div className="pt-0.5 text-center text-[8px] text-fn-muted">
          off-map · beyond 16:9 · no hard lock
        </div>
      </div>
    </div>
  );
}
