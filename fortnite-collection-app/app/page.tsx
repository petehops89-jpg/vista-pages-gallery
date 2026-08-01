"use client";

import { useEffect, useState } from "react";
import NavMenu from "@/components/NavMenu";
import BentoGrid, { BentoItem } from "@/components/BentoGrid";
import PowderBurst from "@/components/PowderBurst";
import FadeIn from "@/components/FadeIn";
import { HexBackdrop, LogoMark } from "@/components/SvgDecor";
import { mcpTriggerDailyCycle } from "@/lib/mcp";

type ImageDoc = { src: string; title: string; subtitle?: string };
type ApiResp = { items: ImageDoc[]; dayIndex: number; total: number; date: string };

export default function Home() {
  const [data, setData] = useState<ApiResp | null>(null);
  const [burst, setBurst] = useState(0);
  const [allowPush, setAllowPush] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadImages() {
      try {
        const res = await fetch("/api/images", { cache: "no-store" });
        const d: ApiResp = await res.json();
        if (!active) return;
        setData(d);
        setBurst((b) => b + 1);
      } catch {
        if (!active) return;
        setData({ items: [], dayIndex: 0, total: 0, date: "" });
      }
    }

    loadImages();

    const interval = window.setInterval(loadImages, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

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
      setBurst((b) => b + 1); // celebratory powder burst
    } catch (e) {
      setMcpStatus("MCP unreachable: " + String(e));
    }
  }

  const bento: BentoItem[] = (data?.items ?? []).map((it, i) => ({
    src: it.src,
    title: it.title,
    subtitle: it.subtitle,
    span: i === 0 ? "big" : i % 3 === 0 ? "wide" : "sm",
  }));

  return (
    <main className="relative mx-auto max-w-3xl px-4 pb-24">
      <PowderBurst trigger={burst} />
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
        <BentoGrid items={bento.length ? bento : PLACEHOLDER_BENTO} />
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

      <footer className="mt-10 text-center text-xs text-fn-muted">
        © Fortnite Collection. Not affiliated with Epic Games.
      </footer>
    </main>
  );
}

const PLACEHOLDER_BENTO: BentoItem[] = [
  { src: "/fortnite-images/01.webp", title: "Loading…", span: "big" },
  { src: "/fortnite-images/02.webp", title: "Loading…" },
  { src: "/fortnite-images/03.webp", title: "Loading…" },
  { src: "/fortnite-images/04.webp", title: "Loading…", span: "wide" },
];
