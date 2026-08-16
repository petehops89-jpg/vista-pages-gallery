import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// Serve gallery images dynamically from disk on every request.
// Next.js production caches public/ at boot, so files added/removed after
// startup 404/400. Reading the folder per-request makes add/delete instant —
// exactly the live file-manager behaviour the app needs.
export const dynamic = "force-dynamic";

const IMG_DIR = path.join(process.cwd(), "public", "fortnite-images");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  // Only allow image extensions (mirrors lib/gallery.ts filter).
  if (!/\.(webp|jpg|jpeg|png|gif|avif)$/i.test(name)) {
    return new NextResponse("Not an image", { status: 400 });
  }

  // Traversal guard: resolved path must stay inside IMG_DIR.
  const file = path.join(IMG_DIR, name);
  if (!file.startsWith(IMG_DIR + path.sep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const data = fs.readFileSync(file);
    const ext = path.extname(name).toLowerCase();
    return new NextResponse(data, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        // No cache: the frontend cache-busts with ?v= anyway, and this keeps
        // deletes/replacements visible immediately.
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
