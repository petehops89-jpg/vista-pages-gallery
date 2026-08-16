/**
 * worker.js — Cloudflare Worker entry for vistamations.com
 *
 * Serves the static Next.js export from ./out (via [assets] binding) and
 * proxies live /api/* calls to the local control-room daemon. This keeps the
 * website live on the edge while the heavy backend stays local (single IN/OUT
 * model: BRUCE-GATE :8080 -> EP-B app :3000, etc.).
 *
 * Deploy:  wrangler deploy   (needs CLOUDFLARE_API_TOKEN / wrangler login on YOUR box)
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Live API proxy: route to local daemon (set DAEMON_ORIGIN on deploy).
    // In static-export mode the Next API routes are gone, so the Worker
    // provides them by proxying to the running docker stack.
    if (url.pathname.startsWith("/api/")) {
      const daemon = env.DAEMON_ORIGIN || "http://localhost:3000";
      const upstream = new URL(url.pathname + url.search, daemon);
      const upstreamReq = new Request(upstream, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: "follow",
      });
      try {
        const resp = await fetch(upstreamReq);
        const out = new Response(resp.body, resp);
        out.headers.set("Access-Control-Allow-Origin", "*");
        return out;
      } catch {
        return new Response(JSON.stringify({ ok: false, error: "daemon unreachable" }), {
          status: 502,
          headers: { "content-type": "application/json" },
        });
      }
    }

    // Otherwise serve the static export.
    return env.ASSETS.fetch(request);
  },
};
