import webpush from "web-push";
import { getDayIndex, listImages } from "./gallery";

let configured = false;
function ensureVapid() {
  if (configured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const sub = process.env.VAPID_SUBJECT || "mailto:you@example.com";
  if (pub && priv) webpush.setVapidDetails(sub, pub, priv);
  configured = true;
}

// In a real deployment, persist subscriptions in a DB. For this scaffold we
// keep them in-memory (resets on cold start) — wire to Redis/DB for production.
const subscriptions: webpush.PushSubscription[] = [];

export function addSubscription(sub: webpush.PushSubscription) {
  subscriptions.push(sub);
}

export function getPublicKey(): string | undefined {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
}

/** Called by /api/cycle: tells every subscriber today's drop is live. */
export async function notifyDailyDrop(): Promise<number> {
  ensureVapid();
  const total = listImages().length;
  const dayIndex = getDayIndex(total);
  const payload = JSON.stringify({
    title: "Fortnite Collection — Daily Drop",
    body: `Day ${dayIndex + 1} is live. Tap to view the new items.`,
  });
  await Promise.all(
    subscriptions.map((s) =>
      webpush.sendNotification(s, payload).catch(() => {/* drop dead subs */})
    )
  );
  return dayIndex;
}
