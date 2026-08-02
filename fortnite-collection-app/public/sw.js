// Fortnite Collection service worker — v3
// Strategy:
//  - Navigations: network-first (fresh HTML every deploy), cached shell only offline
//  - Hashed build assets (_next/static): stale-while-revalidate
//  - Images (/fortnite-images) + API: network-only (file manager is source of truth)
const CACHE = "fn-collection-v3";
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
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Network-only: API responses + live gallery images. Never cache.
  if (request.url.includes("/api/") || url.pathname.includes("/fortnite-images/")) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  // Network-first for navigations: a new deploy must win over any cached shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/", copy));
          return res;
        })
        .catch(() => caches.match("/"))
    );
    return;
  }

  // Stale-while-revalidate for everything else (hashed _next assets, shell files).
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
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
