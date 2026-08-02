import { NextRequest, NextResponse } from "next/server";
import { getDailyImages } from "@/lib/gallery";

// GET /api/images — returns today's rotated image set (used by the frontend).
export const dynamic = "force-dynamic";

export async function GET() {
  const data = getDailyImages();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
