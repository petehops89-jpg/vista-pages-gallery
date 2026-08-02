import fs from "node:fs";
import path from "node:path";

/**
 * Reads the fortnite-images gallery folder dynamically at request time.
 * No rebuild needed — changes to the folder appear instantly.
 */
const IMG_DIR = path.join(process.cwd(), "public", "fortnite-images");

export type GalleryImage = {
  src: string;
  title: string;
  subtitle?: string;
  /** File mtime in ms — used as a cache-buster so adds/deletes show instantly. */
  version?: number;
};

export function getDayIndex(totalFiles: number): number {
  // Deterministic day index from UTC date. Cycles through `totalFiles` days.
  const start = Date.UTC(2026, 7, 1); // 2026-08-01 baseline (today)
  const now = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );
  const day = Math.floor((now - start) / 86_400_000);
  return totalFiles > 0 ? ((day % totalFiles) + totalFiles) % totalFiles : 0;
}

export function listImages(): GalleryImage[] {
  try {
    if (!fs.existsSync(IMG_DIR)) return [];
    const files = fs
      .readdirSync(IMG_DIR, { withFileTypes: true })
      .filter(
        (d) => d.isFile() && /\.(webp|jpg|jpeg|png|gif|avif)$/i.test(d.name)
      )
      .map((d) => {
        const stat = fs.statSync(path.join(IMG_DIR, d.name));
        return { name: d.name, mtime: stat.mtimeMs };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    return files.map(({ name, mtime }) => ({
      src: `/fortnite-images/${encodeURIComponent(name)}`,
      title: prettify(name),
      version: Math.floor(mtime),
    }));
  } catch (e) {
    console.error("Error reading images:", e);
    return [];
  }
}

export function getDailyImages(perDay = 6): {
  items: GalleryImage[];
  dayIndex: number;
  total: number;
  date: string;
} {
  const all = listImages();
  const total = all.length;
  const dayIndex = getDayIndex(total);
  if (total === 0) return { items: [], dayIndex: 0, total: 0, date: "" };

  // Rotate the list by dayIndex, then take `perDay` images starting at offset.
  const rotated = [...all.slice(dayIndex), ...all.slice(0, dayIndex)];
  const items = rotated.slice(0, Math.min(perDay, total));
  return {
    items,
    dayIndex,
    total,
    date: new Date().toISOString().slice(0, 10),
  };
}

function prettify(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
