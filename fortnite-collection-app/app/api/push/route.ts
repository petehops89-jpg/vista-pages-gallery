import { NextRequest, NextResponse } from "next/server";
import type { PushSubscription } from "web-push";
import { addSubscription, getPublicKey } from "@/lib/push";

export const dynamic = "force-dynamic";

/** GET /api/push?pub=1 — return the VAPID public key for the browser to subscribe. */
export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("pub") === "1") {
    const key = getPublicKey();
    if (!key) return NextResponse.json({ error: "vapid not configured" }, { status: 500 });
    return NextResponse.json({ publicKey: key });
  }
  return NextResponse.json({ ok: true });
}

/** POST /api/push — store a push subscription from the browser. */
export async function POST(req: NextRequest) {
  try {
    const sub = (await req.json()) as PushSubscription;
    if (!sub || !sub.endpoint) {
      return NextResponse.json({ error: "invalid subscription" }, { status: 400 });
    }
    addSubscription(sub);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }
}
