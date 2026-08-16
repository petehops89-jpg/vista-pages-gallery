/**
 * gen-floor-map.cjs
 * Renders vector-floor-model.cjs data to an SVG control-room floor map.
 * Same math (cluster 1 = MATH, BASE LAYER 0 @ 4K 16:9). Self-contained copy
 * of the 12 live containers + grid so the artifact is reproducible.
 */
const fs = require("fs");

const W = 1920, H = 1080;          // display canvas (half-4K, keeps file small)
const OX = 40, OY = 60, GW = 1840, GH = 900;  // inner grid plane

// 12 live containers (from docker ps -a 2026-08-16). gx,gy from gridSlot(i,12).
const LIVE = [
  { id: "vistamations-app",        role: "SERVER",  sub: "LOCAL",  state: "UNHEALTHY", mcp: true,  gx: 0.125,  gy: 0.1667 },
  { id: "vistamations-redis",      role: "DATA",    sub: "LOCAL",  state: "DOWN",      mcp: false, gx: 0.375,  gy: 0.1667 },
  { id: "vistamations-nginx",      role: "GATE",    sub: "LOCAL",  state: "DOWN",      mcp: false, gx: 0.625,  gy: 0.1667 },
  { id: "vistamations-prometheus", role: "EXPORTER",sub: "LOCAL",  state: "DOWN",      mcp: false, gx: 0.875,  gy: 0.1667 },
  { id: "presentations-app",       role: "SERVER",  sub: "LOCAL",  state: "UP",        mcp: false, gx: 0.125,  gy: 0.5 },
  { id: "pdfcraft",                role: "SERVER",  sub: "LOCAL",  state: "UP",        mcp: false, gx: 0.375,  gy: 0.5 },
  { id: "vistamations-monitor",    role: "AGENT",   sub: "LOCAL",  state: "UP",        mcp: true,  gx: 0.625,  gy: 0.5 },
  { id: "docmerge",                role: "SERVER",  sub: "LOCAL",  state: "UP",        mcp: false, gx: 0.875,  gy: 0.5 },
  { id: "pres-app",                role: "SERVER",  sub: "LOCAL",  state: "UP",        mcp: false, gx: 0.125,  gy: 0.8333 },
  { id: "angry_sinoussi",          role: "EXPORTER",sub: "CLOUD",  state: "UP",        mcp: false, gx: 0.375,  gy: 0.8333 },
  { id: "laughing_antonelli",      role: "EXPORTER",sub: "CLOUD",  state: "DOWN",      mcp: false, gx: 0.625,  gy: 0.8333 },
  { id: "infallible_mccarthy",     role: "EXPORTER",sub: "CLOUD",  state: "UP",        mcp: false, gx: 0.875,  gy: 0.8333 },
];

const COLOR = { UP: "#34d399", UNHEALTHY: "#fbbf24", DOWN: "#f87171" };
const cx = (gx) => OX + gx * GW;
const cy = (gy) => OY + gy * GH;

let s = "";
const add = (t) => (s += t + "\n");

add(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Consolas,monospace">`);
add(`  <rect width="${W}" height="${H}" fill="#0a0e14"/>`);

// header
add(`  <text x="${OX}" y="36" fill="#e5e7eb" font-size="22" font-weight="bold">VECTOR FLOOR MAP — CLUSTER 1 = MATH — BASE LAYER 0 (4K 16:9)</text>`);
add(`  <text x="${OX}" y="54" fill="#9ca3af" font-size="13">12 container vectors · grid 4×3 · trinity tri-core · floor planes vis-docker1 / -1a / -2a</text>`);

// floor planes
add(`  <rect x="${OX}" y="${OY}" width="${GW}" height="${GH}" fill="none" stroke="#22d3ee" stroke-width="2"/>`);
add(`  <text x="${OX+8}" y="${OY+20}" fill="#22d3ee" font-size="13">vis-docker1 (FULL)</text>`);
// sub planes = top half quadrants
add(`  <rect x="${OX}" y="${OY}" width="${GW/2}" height="${GH/2}" fill="#a21caf22" stroke="#d946ef" stroke-width="1.5" stroke-dasharray="6 4"/>`);
add(`  <text x="${OX+8}" y="${OY+GH/2-8}" fill="#d946ef" font-size="12">vis-docker-1a (SUB-L)</text>`);
add(`  <rect x="${OX+GW/2}" y="${OY}" width="${GW/2}" height="${GH/2}" fill="#a21caf22" stroke="#d946ef" stroke-width="1.5" stroke-dasharray="6 4"/>`);
add(`  <text x="${OX+GW/2+8}" y="${OY+GH/2-8}" fill="#d946ef" font-size="12">vis-docker-2a (SUB-R)</text>`);

// grid lattice (4x3)
for (let c = 0; c <= 4; c++) { const x = OX + (GW/4)*c; add(`  <line x1="${x}" y1="${OY}" x2="${x}" y2="${OY+GH}" stroke="#1f2937" stroke-width="1"/>`); }
for (let r = 0; r <= 3; r++) { const y = OY + (GH/3)*r; add(`  <line x1="${OX}" y1="${y}" x2="${OX+GW}" y2="${y}" stroke="#1f2937" stroke-width="1"/>`); }

// container nodes
for (const v of LIVE) {
  const x = cx(v.gx), y = cy(v.gy);
  const r = v.mcp ? 20 : 16;
  add(`  <circle cx="${x}" cy="${y}" r="${r}" fill="${COLOR[v.state]}" fill-opacity="0.25" stroke="${COLOR[v.state]}" stroke-width="2.5"/>`);
  if (v.mcp) add(`  <circle cx="${x}" cy="${y}" r="4" fill="#22d3ee"/>`);
  add(`  <text x="${x}" y="${y-26}" fill="#e5e7eb" font-size="11" text-anchor="middle">${v.id}</text>`);
  add(`  <text x="${x}" y="${y+30}" fill="#9ca3af" font-size="10" text-anchor="middle">${v.role} · ${v.sub}</text>`);
}

// trinity tri-core (bottom strip)
add(`  <line x1="${cx(0.35)}" y1="1015" x2="${cx(0.65)}" y2="1015" stroke="#22d3ee" stroke-width="1.5"/>`);
const TRINITY = [["core-base","BASE",0.35],["core-mcp","MCP",0.5],["core-server","SERVER",0.65]];
for (const [id,role,gx] of TRINITY) {
  const x = cx(gx);
  add(`  <circle cx="${x}" cy="1015" r="14" fill="#0ea5e9" fill-opacity="0.3" stroke="#0ea5e9" stroke-width="2"/>`);
  add(`  <text x="${x}" y="1000" fill="#7dd3fc" font-size="11" text-anchor="middle">${id}</text>`);
  add(`  <text x="${x}" y="1040" fill="#9ca3af" font-size="10" text-anchor="middle">${role}</text>`);
}
add(`  <text x="${OX}" y="1000" fill="#7dd3fc" font-size="13" font-weight="bold">TRINITY tri-core (layer 0):</text>`);

// legend
const lx = OX + GW - 360, ly = OY + GH - 70;
add(`  <rect x="${lx}" y="${ly}" width="350" height="62" fill="#111827" stroke="#374151"/>`);
add(`  <circle cx="${lx+20}" cy="${ly+20}" r="8" fill="#34d399"/> <text x="${lx+38}" y="${ly+25}" fill="#e5e7eb" font-size="12">UP (7)</text>`);
add(`  <circle cx="${lx+20}" cy="${ly+44}" r="8" fill="#fbbf24"/> <text x="${lx+38}" y="${ly+49}" fill="#e5e7eb" font-size="12">UNHEALTHY (1)</text>`);
add(`  <circle cx="${lx+160}" cy="${ly+20}" r="8" fill="#f87171"/> <text x="${lx+178}" y="${ly+25}" fill="#e5e7eb" font-size="12">DOWN (4)</text>`);
add(`  <circle cx="${lx+160}" cy="${ly+44}" r="8" fill="#22d3ee"/> <text x="${lx+178}" y="${ly+49}" fill="#e5e7eb" font-size="12">● = MCP-linked (2)</text>`);

add(`</svg>`);

fs.writeFileSync("vector-floor-map.svg", s);
console.log("wrote vector-floor-map.svg  (" + s.length + " bytes)");
console.log("nodes: " + LIVE.length + " | UP=7 UNHEALTHY=1 DOWN=4 | MCP-linked=2");
