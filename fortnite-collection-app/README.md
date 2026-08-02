# Fortnite Collection

Mobile-first **Fortnite collection** gallery — animated browsing, daily image
cycling, and push notifications. Built with **Next.js 15 (App Router)** + **Framer
Motion**, designed to run on **GitHub Codespaces / GitHub Pages / Vercel**, and
wrap into an **Android TWA**.

## Features
- 🎇 **Exploding coloured-powder** particle burst on load (Framer Motion)
- 🧭 **Smooth hover/tap nav menu** that expands/collapses
- 🪟 **Fade + translate** section/card entrances
- ▦ **Bento/tile layout** for the collection grid
- 🎨 **SVG / vector** logo + hex backdrop
- 🔄 **Daily auto-cycle** of `fornite-images/` at 12:00 (GitHub Action cron)
- 🔔 **Web-push notifications** when the daily drop refreshes
- 📱 **Mobile-first + PWA** (installable, offline shell) → wrap in Android TWA
- 🔁 **Serverless CORS proxy** (`/api/proxy`) so the frontend can reach
  third-party APIs server-to-server without browser restrictions

## Architecture
```
Browser (React)
   │  fetch same-origin
   ▼
Next.js serverless routes (/api/*)
   ├─ /api/images   → reads fornite-images/, rotates by day index
   ├─ /api/cycle     → Bearer-auth; triggers daily push (called by cron)
   ├─ /api/proxy     → CORS-bypass fetch to allowlisted hosts
   └─ /api/push      → web-push subscribe + VAPID key
        │
GitHub Action (cron 0 12 * * *) ──POST /api/cycle──▶ push notification
```

## Local dev (Codespaces or your machine)
```bash
npm install
cp .env.example .env.local   # set CYCLE_TOKEN + VAPID keys (see below)
npm run dev                  # http://localhost:3000
```

### Generate secrets
```bash
# 1) cycle token (shared secret between the cron and /api/cycle)
openssl rand -hex 32

# 2) VAPID keys for web push
npx web-push generate-vapid-keys
```
Put them in `.env.local` (never commit it).

## Daily cycle
- Deterministic: the day index is derived from the UTC date, so the same day
  always shows the same subset. Adding images to `fornite-images/` extends the
  cycle length automatically.
- The GitHub Action `daily-cycle.yml` calls `POST /api/cycle` with the bearer
  token. Set repo secrets `CYCLE_URL` and `CYCLE_TOKEN`.

## Android
See [ANDROID.md](ANDROID.md) — PWA install or TWA via Bubblewrap.

## Replace placeholders
- `public/fornite-images/*.webp` — your real Fortnite images
- The Perchance embed (from the gallery repo) can be added as a route later.
