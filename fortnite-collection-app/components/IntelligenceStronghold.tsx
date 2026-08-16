"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * IntelligenceStronghold — BENTO BOX No. 121 (INTEL STRONGHOLD).
 *
 * A server-backed intel ledger. Docs are NOT stored in the browser — every
 * add/delete round-trips to GET/POST/DELETE /api/stronghold, and the route
 * persists them to c:\vis-intel\stronghold.json (default; override via
 * STRONGHOLD_DATA_DIR). A shared secret (STRONGHOLD_TOKEN, set in .env on the
 * server and entered here once) gates every request via the x-stronghold-token
 * header. The token lives only in component state / localStorage-on-this-tab;
 * it is never committed.
 */

type Doc = {
  id: number;
  title: string;
  body: string;
  tag: string;
  ts: string;
};

const TOKEN_KEY = "bento121-stronghold-token";
const API = "/api/stronghold";

export default function IntelligenceStronghold() {
  const [token, setToken] = useState("");
  const [savedToken, setSavedToken] = useState<string | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("intel");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // restore token (tab-scoped) so reloads don't lose the gate
  useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      if (t) setSavedToken(t);
    } catch {
      /* ignore */
    }
  }, []);

  const load = useCallback(async () => {
    if (!savedToken) return;
    setBusy(true);
    try {
      const res = await fetch(API, {
        headers: { "x-stronghold-token": savedToken },
        cache: "no-store",
      });
      if (res.status === 401) {
        setStatus("unauthorized — check token");
        return;
      }
      const d = await res.json();
      setDocs(d.docs ?? []);
      setStatus(null);
    } catch {
      setStatus("fetch failed");
    } finally {
      setBusy(false);
    }
  }, [savedToken]);

  useEffect(() => {
    load();
  }, [load]);

  const arm = () => {
    const t = token.trim();
    if (!t) return;
    try {
      localStorage.setItem(TOKEN_KEY, t);
    } catch {
      /* ignore */
    }
    setSavedToken(t);
    setStatus(null);
  };

  const add = async () => {
    const t = title.trim();
    const b = body.trim();
    if (!t || !b || !savedToken) return;
    setBusy(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-stronghold-token": savedToken,
        },
        body: JSON.stringify({ title: t, body: b, tag: tag.trim() || "intel" }),
      });
      if (res.status === 401) {
        setStatus("unauthorized — check token");
        return;
      }
      setTitle("");
      setBody("");
      await load();
    } catch {
      setStatus("add failed");
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: number) => {
    if (!savedToken) return;
    setBusy(true);
    try {
      const res = await fetch(API, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          "x-stronghold-token": savedToken,
        },
        body: JSON.stringify({ id }),
      });
      if (res.status === 401) {
        setStatus("unauthorized — check token");
        return;
      }
      await load();
    } catch {
      setStatus("delete failed");
    } finally {
      setBusy(false);
    }
  };

  if (!savedToken) {
    return (
      <div className="rounded-lg border border-fn-gold/30 bg-black/30 p-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-display text-[10px] font-bold uppercase tracking-wider text-fn-gold">
            Intel Stronghold
          </span>
          <span className="font-mono text-[8px] text-fn-muted">BOX 121</span>
        </div>
        <p className="mb-1 text-[9px] text-fn-muted">
          server-backed · docs at c:\vis-intel
        </p>
        <div className="flex gap-1">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && arm()}
            placeholder="stronghold token"
            type="password"
            className="min-w-0 flex-1 rounded border border-white/10 bg-white/5 px-1.5 py-1 text-[10px] text-fn-text placeholder:text-fn-muted"
          />
          <button
            onClick={arm}
            className="rounded bg-fn-gold/30 px-2 py-1 text-[9px] font-bold text-fn-gold"
          >
            ARM
          </button>
        </div>
        <div className="mt-1 text-[8px] text-fn-muted">
          token = STRONGHOLD_TOKEN (.env) · stored tab-local only
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-fn-gold/30 bg-black/30 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-fn-gold">
          Intel Stronghold
        </span>
        <span className="font-mono text-[8px] text-fn-muted">
          BOX 121 · {docs.length}
        </span>
      </div>

      {/* add row */}
      <div className="mb-1 space-y-1">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="title"
          className="w-full rounded border border-white/10 bg-white/5 px-1.5 py-1 text-[10px] text-fn-text placeholder:text-fn-muted"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="intel body"
          rows={2}
          className="w-full resize-y rounded border border-white/10 bg-white/5 px-1.5 py-1 text-[10px] text-fn-text placeholder:text-fn-muted"
        />
        <div className="flex gap-1">
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="tag"
            className="w-20 rounded border border-white/10 bg-white/5 px-1.5 py-1 text-[9px] text-fn-text placeholder:text-fn-muted"
          />
          <button
            onClick={add}
            disabled={busy}
            className="flex-1 rounded bg-fn-gold/30 px-2 py-1 text-[9px] font-bold text-fn-gold disabled:opacity-40"
          >
            {busy ? "…" : "STORE"}
          </button>
          <button
            onClick={() => {
              try {
                localStorage.removeItem(TOKEN_KEY);
              } catch {
                /* ignore */
              }
              setSavedToken(null);
              setDocs([]);
            }}
            className="rounded bg-white/10 px-2 py-1 text-[9px] font-bold text-fn-muted"
            title="disarm (clears tab-local token)"
          >
            DISARM
          </button>
        </div>
      </div>

      {/* list */}
      <div className="max-h-32 space-y-0.5 overflow-auto">
        {docs.length === 0 && (
          <div className="text-[9px] text-fn-muted">no docs stored</div>
        )}
        {docs.map((d) => (
          <div
            key={d.id}
            className="rounded border border-white/5 bg-white/5 px-1 py-0.5"
          >
            <div className="flex items-center gap-1">
              <span className="flex-1 truncate text-[9px] font-bold text-fn-text">
                {d.title}
              </span>
              <span className="text-[7px] uppercase text-fn-muted">{d.tag}</span>
              <button
                onClick={() => del(d.id)}
                className="text-[9px] text-fn-muted hover:text-fn-accent2"
                aria-label="delete"
              >
                ×
              </button>
            </div>
            <div className="truncate text-[8px] text-fn-muted">{d.body}</div>
          </div>
        ))}
      </div>

      {status && <div className="mt-1 text-[8px] text-fn-accent2">{status}</div>}
      <div className="mt-1 text-[8px] text-fn-muted">
        server-backed · GET/POST/DELETE /api/stronghold · c:\vis-intel
      </div>
    </div>
  );
}
