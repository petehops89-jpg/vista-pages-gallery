# Fortnite Collection — Android wrapper (TWA)

The site is a PWA (`manifest.webmanifest` + `sw.js`), so it can be installed
directly OR wrapped in a native Android shell with **Trusted Web Activity (TWA)**.

## Option A: Install as PWA (no store)
Open the deployed URL in Chrome on Android → Menu → "Install app". That's it —
it runs full-screen like a native app, with push notifications working.

## Option B: Ship on Google Play (TWA)
1. Generate a signing key:
   ```
   keytool -genkey -v -keystore fn-release.keystore -alias fn -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Generate the Digital Asset Links hash:
   ```
   npx @bubblewrap/cli fingerprint \
     --package-name com.fortnite.collection \
     --sha256-cert-fingerprint <FROM_ABOVE>
   ```
3. Scaffold the Android project:
   ```
   npx @bubblewrap/cli init --manifest https://YOUR_DOMAIN/manifest.webmanifest \
     --packageId com.fortnite.collection
   npx @bubblewrap/cli build
   ```
4. Add the generated `assetlinks.json` to `https://YOUR_DOMAIN/.well-known/assetlinks.json`
   so the TWA trusts your domain.
5. Upload the built `.aab` to Google Play.

> The PWA uses `viewport-fit=cover` + `env(safe-area-inset-*)` so it respects
> notches in both standalone and TWA modes.
