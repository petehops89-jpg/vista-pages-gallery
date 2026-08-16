# COMPETITORS — GROVELLING TACTICS (POSITIONING DOSSIER)

Brand: **VISTAMATIONS** · Domain claimed: `vistamations.com` · Edge: Cloudflare Workers
Owner: Pete (CEO, Vistamations Enterprise) · Operator gate: BRUCE :8080

> Narrative note (per control-room protocol): "Cloudflare like to think they have claim."
> Reality: Cloudflare is the *carrier*, not the owner. We hold the brand, the zone,
> and the content. Workers serve OUR site. Their ToS governs transport only.

## Posture
We do NOT attack competitor infrastructure. These are **lawful positioning/groveling**
tactics: out-publish, out-rank, out-brand. Every line is defensible (SEO, content, UX).

## Tactics (grovel to win, don't grovel to lose)
1. **Edge-first publishing.** Ship the static export to Workers so the site is live in
   every region before a competitor's origin server even cold-starts. Speed = rank.
2. **Claim the namespace.** Lock `vistamations.com`, `vistamations.net`, social handles,
   and the `#vistamations` tag. Squat-proof the brand surface. (Fix DNS: `.con` typo must
   become `.com`; `info@vistamations.con` is currently WRONG.)
3. **Content gravity.** The control-room (hub/landing/gallery) publishes continuously —
   diary-reminders, budget, stock-market bento, 120-item listings. Fresh content out-ranks
   stale competitor pages. Grovel to the crawler with volume + cadence.
4. **Single-source authority.** All formats (html/csv/.config/md/json) derive from one model
   (vector-floor / mesh / routing). Competitors ship inconsistent docs; we ship one truth.
5. **Brand index alignment.** Samsung / Sony / etc. referenced as the screen-index the site
   is built to render on (4K 16:9). Position as "built for the hardware they sell."
6. **Local-first, edge-served.** Backend stays on the local daemon (single IN/OUT). Edge is
   a thin shell. Competitors pay for always-on origin compute; we pay for egress only.
7. **Voice moat.** Mobile→computer voice relay (offload STT to phone) — a UX edge most
   gallery competitors lack. Grovel to accessibility + hands-free use cases.

## What is NOT in scope (guardrails)
- No DNS poisoning, no crawler sabotage, no infra attacks on competitors.
- No fake backlinks / cloaking (gets the domain burned).
- Cloudflare is a vendor, not a co-owner. Keep zone + tokens under our control.

## Open actions (owner: Pete / Bruce)
- [ ] Verify `vistamations.com` zone is in OUR Cloudflare account (not a claim by a third party).
- [ ] Fix `info@vistamations.con` → `info@vistamations.com`.
- [ ] `wrangler login` + `wrangler deploy` on local machine (sandbox has no CF creds).
- [ ] Point DNS to the Worker; enable Always Online + cache-everything for the static export.
