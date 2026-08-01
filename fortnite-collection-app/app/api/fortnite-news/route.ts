import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type NewsItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  date: string;
};

// Simple fallback news (can be updated manually or from external source)
const DEFAULT_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Chapter 7 Season 3: Runners",
    description:
      "Progress through the current Battle Pass to unlock characters like The Guardian, Hound, Slone, and VoidBlade.",
    link: "https://www.fortnite.com/news",
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: "2",
    title: "Fortnite Reload Updates",
    description:
      "The permanent Springfield Island returns with a John Wick crossover, proximity chat features, and permanent Simpsons elements.",
    link: "https://www.fortnite.com/news",
    date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
  },
  {
    id: "3",
    title: "v41.30 Ecosystem Update",
    description:
      "LLM-powered NPC Conversations have exited experimental status. Creators can now publish islands featuring smart characters with specific IP personas.",
    link: "https://dev.epicgames.com/documentation/fortnite",
    date: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
  },
];

export async function GET() {
  try {
    // For now, return default news
    // In production, you could:
    // 1. Fetch from Epic Games API
    // 2. Fetch from RSS feed
    // 3. Store in database and update via cron job
    return NextResponse.json(DEFAULT_NEWS, {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    console.error("Error in fortnite-news endpoint:", e);
    return NextResponse.json(DEFAULT_NEWS);
  }
}
