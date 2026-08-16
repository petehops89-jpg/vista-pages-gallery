"use client";

import { useState } from "react";

/**
 * MechanicalEntry — two numeric input boxes styled as a mechanical combo-lock
 * entry (protocol: "door / PIN" theme). Values are clamped to 0–9 per digit
 * (or any integer). Submit checks against a configurable code (default 1973,
 * the protocol PIN).
 */
export default function MechanicalEntry({
  code = "1973",
  onPass,
}: {
  code?: string;
  onPass?: () => void;
}) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [status, setStatus] = useState<"IDLE" | "OPEN" | "SEALED">("IDLE");

  const submit = () => {
    const entered = `${a}${b}`;
    if (entered === code) {
      setStatus("OPEN");
      onPass?.();
    } else {
      setStatus("SEALED");
    }
  };

  const Box = ({
    val,
    set,
    label,
  }: {
    val: string;
    set: (v: string) => void;
    label: string;
  }) => (
    <div className="flex flex-col items-center">
      <div className="grid h-14 w-14 place-items-center rounded-md border-2 border-fn-gold/50 bg-black/60 font-mono text-2xl font-bold text-fn-gold shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
        {val || "0"}
      </div>
      <input
        type="number"
        inputMode="numeric"
        value={val}
        onChange={(e) => set(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
        className="mt-1 w-14 rounded bg-transparent text-center text-[9px] text-fn-muted outline-none"
        placeholder={label}
        aria-label={label}
      />
    </div>
  );

  return (
    <div className="rounded-lg border border-fn-gold/30 bg-black/30 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-fn-gold">
          Mechanical Entry
        </span>
        <span
          className={`text-[9px] font-bold ${
            status === "OPEN" ? "text-fn-accent" : status === "SEALED" ? "text-fn-accent2" : "text-fn-muted"
          }`}
        >
          {status}
        </span>
      </div>
      <div className="flex items-end gap-3">
        <Box val={a} set={setA} label="digits" />
        <Box val={b} set={setB} label="digits" />
        <button
          onClick={submit}
          className="fn-btn !px-3 !py-2 !text-[10px]"
          title="Submit mechanical code"
        >
          ENTER
        </button>
      </div>
      <div className="mt-1 text-[8px] text-fn-muted">two numeric inputs · code gate</div>
    </div>
  );
}
