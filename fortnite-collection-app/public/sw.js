// Minimal PWA service worker: cache shell for offline + handle web-push.
const CACHE = "fn-collection-v2";
const SHELL = ["/", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache dynamic API responses or image assets; always go to network.
  if (request.method !== "GET") return;
  if (request.url.includes("/api/")) return;
  if (url.pathname.includes("/fortnite-images/")) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// Web Push: show the notification when the serverless /api/push fires one.
self.addEventListener("push", (event) => {
  let payload = { title: "Fortnite Collection", body: "Daily drop ready!" };
  try {
    if (event.data) payload = event.data.json();
  } catch (e) {
    /* keep defaults */
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: "fn-daily",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
