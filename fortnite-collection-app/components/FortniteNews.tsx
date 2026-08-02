"use client";

import { useEffect, useState } from "react";

export type NewsItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  date: string;
};

export function FortniteNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/fortnite-news");
        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }
        const text = await res.text();
        if (!text) {
          throw new Error("Empty response");
        }
        const data: NewsItem[] = JSON.parse(text);
        setNews(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error loading news:", e);
        setError(String(e));
        setNews([]);
      } finally {
        setLoading(false);
      }
    }

    loadNews();
    const interval = setInterval(loadNews, 3600000); // Refresh every hour
    return () => clearInterval(interval);
  }, []);

  // Always render so the section never silently vanishes.
  return (
    <section id="news" className="mt-8">
      <h2 className="mb-3 font-display text-xl font-bold uppercase tracking-wider text-fn-accent">
        Daily Drop · Fortnite News
      </h2>
      {loading ? (
        <p className="text-sm text-fn-muted">Loading news…</p>
      ) : news.length === 0 ? (
        <p className="text-sm text-fn-muted">
          No news right now — check back later.
        </p>
      ) : (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {news.map((item) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="fn-card p-4 transition hover:border-fn-accent/50"
          >
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-fn-text line-clamp-2">
              {item.title}
            </h3>
            <p className="mt-2 text-xs text-fn-muted line-clamp-2">
              {item.description}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-fn-accent">Read More</span>
              <span className="text-xs text-fn-muted">
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>
          </a>
        ))}
      </div>
      )}
    </section>
  );
}
