"use client";

import { useEffect, useState } from "react";
import NavMenu from "@/components/NavMenu";
import BentoGrid, { BentoItem } from "@/components/BentoGrid";
import PowderBurst from "@/components/PowderBurst";
import FadeIn from "@/components/FadeIn";
import { HexBackdrop, LogoMark } from "@/components/SvgDecor";
import { mcpTriggerDailyCycle } from "@/lib/mcp";
import GlowOrbs from "@/components/GlowOrbs";
import { FortniteNews } from "@/components/FortniteNews";

type ImageDoc = { src: string; title: string; subtitle?: string; version?: number };
type ApiResp = { items: ImageDoc[]; dayIndex: number; total: number; date: string };

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<ApiResp | null>(null);
  const [burst, setBurst] = useState(0);
  const [allowPush, setAllowPush] = useState(false);

  // Hydration guard — prevent mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    let active = true;
    let lastSig = "";

    async function loadImages() {
      try {
        const res = await fetch("/api/images", { cache: "no-store" });
        const d: ApiResp = await res.json();
        if (!active) return;
        // Only burst when the actual image set changed (add/delete/replace),
        // not on every poll — stops the constant powder explosions.
        const sig = d.items.map((i) => `${i.src}:${i.version ?? 0}`).join("|");
        setData(d);
        if (sig !== lastSig) {
          lastSig = sig;
          setBurst((b) => b + 1);
        }
      } catch {
        if (!active) return;
        setData({ items: [], dayIndex: 0, total: 0, date: "" });
      }
    }

    loadImages();

    const interval = window.setInterval(loadImages, 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isMounted]);

  async function subscribePush() {
    const reg = await navigator.serviceWorker.ready;
    const keyResp = await fetch("/api/push?pub=1");
    const { publicKey } = await keyResp.json();
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey,
    });
    await fetch("/api/push", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(sub),
    });
    setAllowPush(true);
  }

  const [mcpStatus, setMcpStatus] = useState<string | null>(null);
  async function runViaMcp() {
    setMcpStatus("orchestrating…");
    try {
      const res = await mcpTriggerDailyCycle();
      const text = res.content?.[0]?.text ?? JSON.stringify(res);
      setMcpStatus(text);
      setBurst((b) => b + 1);
    } catch (e) {
      setMcpStatus("MCP unreachable: " + String(e));
    }
  }

  const bento: BentoItem[] = (data?.items ?? []).map((it, i) => ({
    src: it.version ? `${it.src}?v=${it.version}` : it.src,
    title: it.title,
    subtitle: it.subtitle,
    // Rhythm: one full-width 6:1 strip, then two 16:9 tiles — repeat.
    // Every 2-col row is fully filled, no orphan cells.
    span: i % 3 === 0 ? "wide" : "sm",
  }));

  if (!isMounted) {
    return null;
  }

  return (
    <main className="relative mx-auto max-w-3xl px-4 pb-24">
      <PowderBurst trigger={burst} />
      <GlowOrbs />
      <NavMenu />

      {/* HERO */}
      <section id="home" className="relative mt-6 overflow-hidden rounded-2xl fn-card p-6">
        <HexBackdrop />
        <div className="relative flex items-center gap-4">
          <LogoMark size={56} />
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-widest text-fn-text">
              Fortnite Collection
            </h1>
            <p className="text-sm text-fn-muted">
              {data ? `Day ${data.dayIndex + 1} of ${data.total} · ${data.date}` : "Loading drop…"}
            </p>
          </div>
        </div>
      </section>

      {/* BENTO */}
      <FadeIn className="mt-6">
        <h2 id="skins" className="mb-3 font-display text-xl font-bold uppercase tracking-wider text-fn-accent">
          Collection
        </h2>
        {data && data.total === 0 ? (
          <div className="fn-card rounded-xl p-6 text-center text-sm text-fn-muted">
            No images yet — drop files into{" "}
            <code className="text-fn-accent">public/fortnite-images</code> and
            they&apos;ll appear here automatically.
          </div>
        ) : (
          <BentoGrid items={bento.length ? bento : PLACEHOLDER_BENTO} />
        )}
      </FadeIn>

      {/* DAILY DROP / PUSH */}
      <FadeIn className="mt-8" delay={0.1}>
        <section id="drop" className="fn-card p-5">
          <h2 className="font-display text-lg font-bold uppercase tracking-wider text-fn-accent2">
            Daily Drop
          </h2>
          <p className="mt-1 text-sm text-fn-muted">
            New items auto-cycle every day at 12:00. Get a push when the drop refreshes.
          </p>
          <div className="mt-3 flex items-center gap-5">
            {NEWS_ICONS.map((ic) => (
              <a
                key={ic.label}
                href={ic.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ic.label}
                title={ic.label}
                className="text-fn-muted transition-colors hover:text-fn-accent"
              >
                {ic.svg}
              </a>
            ))}
          </div>
          <button
            className="fn-btn mt-3"
            onClick={subscribePush}
            disabled={allowPush}
          >
            {allowPush ? "Notifications on ✓" : "Enable notifications"}
          </button>
          <button className="fn-btn mt-3 ml-2" onClick={runViaMcp}>
            Run cycle via MCP
          </button>
          {mcpStatus && (
            <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-xs text-fn-accent">
              {mcpStatus}
            </pre>
          )}
        </section>
      </FadeIn>

      <FortniteNews />

      <footer className="mt-10 text-center text-xs text-fn-muted">
        © Fortnite Collection. Not affiliated with Epic Games.
      </footer>
    </main>
  );
}

const NEWS_ICONS = [
  {
    label: "Fortnite News (RSS)",
    href: "https://www.fortnite.com/news",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11a9 9 0 0 1 9 9" />
        <path d="M4 4a16 16 0 0 1 16 16" />
        <circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Fortnite on X",
    href: "https://x.com/FortniteGame",
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 2H22l-6.9 7.9L23.4 22h-6.4l-5-6.5L6.2 22H3l7.4-8.5L1.5 2h6.6l4.5 6L18.9 2z" />
      </svg>
    ),
  },
  {
    label: "Fortnite on YouTube",
    href: "https://www.youtube.com/@FortniteGame",
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="4" />
        <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Fortnite Official",
    href: "https://www.fortnite.com",
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
      </svg>
    ),
  },
];

const PLACEHOLDER_BENTO: BentoItem[] = [
  { src: "", title: "Loading…", span: "big" },
  { src: "", title: "Loading…" },
  { src: "", title: "Loading…" },
  { src: "", title: "Loading…", span: "wide" },
];
