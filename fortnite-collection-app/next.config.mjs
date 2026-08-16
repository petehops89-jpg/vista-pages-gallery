/** @type {import('next').NextConfig} */
// Static export for Cloudflare Workers (Pages-style _worker.js / wrangler).
// NOTE: output:"export" disables next start and server routes (app/api/*).
//       The UI (gallery / hub / landing) is fully prerendered to ./out.
//       Live data paths (MCP bus etc.) talk to the local daemon at runtime,
//       so they degrade gracefully without a server.
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
