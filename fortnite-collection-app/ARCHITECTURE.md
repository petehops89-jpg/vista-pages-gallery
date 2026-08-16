# Fortnite Collection — Docker / Gateway / MCP architecture

This folder holds the **mobile-first Fortnite collection app** plus its
containerised runtime and orchestration layer. It lives inside the
`vista-pages-gallery` repo as a sub-project (`fortnite-collection-app/`).

## Topology

```
            ┌─────────────────────────────────────────────┐
 Browser ──▶│  GATEWAY (Caddy :8080)                       │
            │   - single ingress                           │
            │   - public routes open (/, /api/images, …)   │
            │   - protected routes need X-Gateway-Key      │
            │     (/api/cycle, /api/push, /mcp/*)          │
            └───────┬───────────────────────┬──────────────┘
                    │                        │
              ┌─────▼─────┐            ┌─────▼─────┐
              │  APP       │            │  MCP       │
              │ (Next.js   │◀──calls───│ orchestrator│
              │  :3000)    │            │  :4000      │
              └────────────┘            └─────┬──────┘
                                              │ tools:
                                              │  trigger_daily_cycle
                                              │  list_today_images
                                              │  gateway_health
```

- **APP** — the Next.js gallery (animations, bento, push, daily cycle).
- **GATEWAY** — Caddy reverse proxy; auth gate for sensitive routes.
- **MCP** — internal Model Context Protocol orchestrator. The *app calls it*
  (e.g. "Run cycle via MCP" button) to trigger the daily cycle and query state.
  It is JSON-RPC over HTTP, so it also works with an AI client later.

## Run locally (Docker)

```bash
cd fortnite-collection-app
cp .env .env.local        # set real CYCLE_TOKEN / GATEWAY_KEY / VAPID keys
docker compose up --build
# Gallery:  http://localhost:8080
# MCP:      http://localhost:8080/mcp   (needs X-Gateway-Key header)
```

## Run without Docker (dev)

```bash
npm install
npm run dev              # http://localhost:3000
# in another terminal:
cd mcp-server && npm install && npm start
```

## Daily cycle

`0 12 * * *` GitHub Action → `POST /api/cycle` (Bearer CYCLE_TOKEN) →
push notification to subscribers. The same cycle can be fired from the app via
the MCP orchestrator ("Run cycle via MCP").

## Branching

This app is committed on branch **`left`** and also copied to **`master`**
(main) per repo convention.
