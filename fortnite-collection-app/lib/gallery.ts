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
  /** Aspect ratio: '16:9' or '6:1' — determines tile span in bento grid. */
  aspectRatio?: '16:9' | '6:1';
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

/**
 * Detect image dimensions by reading file headers.
 * Returns { width, height } or null if detection fails.
 */
function getImageDimensions(filePath: string): { width: number; height: number } | null {
  try {
    const buffer = fs.readFileSync(filePath);
    
    // JPEG
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] === 0xff) {
          const marker = buffer[offset + 1];
          if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
            const height = (buffer[offset + 5] << 8) | buffer[offset + 6];
            const width = (buffer[offset + 7] << 8) | buffer[offset + 8];
            return { width, height };
          }
          const len = (buffer[offset + 2] << 8) | buffer[offset + 3];
          offset += len + 2;
        } else {
          offset++;
        }
      }
    }
    
    // PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      const width = (buffer[16] << 24) | (buffer[17] << 16) | (buffer[18] << 8) | buffer[19];
      const height = (buffer[20] << 24) | (buffer[21] << 16) | (buffer[22] << 8) | buffer[23];
      return { width, height };
    }
    
    // WebP
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
      if (buffer[12] === 0x56 && buffer[13] === 0x50 && buffer[14] === 0x38) {
        const width = 1 + (((buffer[26] & 0x3f) << 8) | buffer[25]);
        const height = 1 + (((buffer[28] & 0x0f) << 10) | (buffer[27] << 2) | ((buffer[26] & 0xc0) >> 6));
        return { width, height };
      }
    }
    
    // GIF
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      const width = buffer[6] | (buffer[7] << 8);
      const height = buffer[8] | (buffer[9] << 8);
      return { width, height };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Classify aspect ratio: return '6:1' if close to 6:1, else '16:9'.
 * Tolerance: within 5% of target ratio.
 */
function classifyAspectRatio(width: number, height: number): '16:9' | '6:1' {
  const ratio = width / height;
  const target6to1 = 6;
  const target16to9 = 16 / 9;
  
  const diff6 = Math.abs(ratio - target6to1);
  const diff16 = Math.abs(ratio - target16to9);
  
  return diff6 < diff16 ? '6:1' : '16:9';
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
        const dims = getImageDimensions(path.join(IMG_DIR, d.name));
        return { name: d.name, mtime: stat.mtimeMs, dims };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    return files.map(({ name, mtime, dims }) => ({
      src: `/fortnite-images/${encodeURIComponent(name)}`,
      title: prettify(name),
      version: Math.floor(mtime),
      aspectRatio: dims ? classifyAspectRatio(dims.width, dims.height) : '16:9',
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
