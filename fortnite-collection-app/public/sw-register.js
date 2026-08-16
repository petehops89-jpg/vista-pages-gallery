// Registers the service worker for offline/PWA support + push notifications.
// Skipped entirely on localhost so dev changes never get cached/stale.
const isLocalDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);

if ("serviceWorker" in navigator && !isLocalDev) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("SW registration failed:", err);
    });
  });
  // Auto-reload once when a new service worker takes over, so users always
  // get the fresh build instead of stale cached HTML/chunks after a deploy.
  let refreshed = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshed) return;
    refreshed = true;
    window.location.reload();
  });
} else if (isLocalDev) {
  console.log("[dev] service worker registration skipped on localhost");
}
