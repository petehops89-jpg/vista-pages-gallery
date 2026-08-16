/**
 * VECTOR FLOOR MODEL — vistamations control room
 * =================================================
 * Cluster 1 = MATH (the coordinate space / BASE LAYER 0).
 * Every container is a vector in the SAME dimension space (uniform schema).
 * Independent vars are few; everything else is DERIVED by math (variable reduction).
 *
 * Run:  node vector-floor-model.cjs
 */

// ---------- 1. INDEPENDENT CONSTANTS (the only "free" variables) ----------

// Screen types: aspect ratio only. Width is anchored to res tier (variable reduction).
const SCREEN = {
  S169:  { aspect: 16 / 9,  label: "16:9  standard" },
  S1610: { aspect: 16 / 10, label: "16:10 monitor" },
  UW21:  { aspect: 21 / 9,  label: "21:9  ultrawide" },
  SU32:  { aspect: 32 / 9,  label: "32:9  super-ultrawide" },
  S43:   { aspect: 4 / 3,   label: "4:3   legacy" },
  S11:   { aspect: 1,       label: "1:1   square" },
  P916:  { aspect: 9 / 16,  label: "9:16  phone portrait" },
};

// Resolution tiers: scale factor on the 1920x1080 base unit (16:9 anchor).
const RESTIER = {
  FHD:    { scale: 1,    label: "1080p" },
  QHD:    { scale: 4 / 3, label: "1440p" },
  UHD4K:  { scale: 2,    label: "4K  (BASE LAYER max)" },
  UHD8K:  { scale: 4,    label: "8K" },
};

// Brand index: each brand -> allowed aspects + max res tier it can drive.
const BRAND = {
  Samsung: { aspects: ["S169", "UW21", "SU32"],        max: "UHD4K" },
  Sony:    { aspects: ["S169", "S1610"],               max: "UHD8K" },
  LG:      { aspects: ["S169", "UW21"],                max: "UHD4K" },
  TCL:     { aspects: ["S169"],                        max: "UHD4K" },
  Generic: { aspects: Object.keys(SCREEN),             max: "UHD4K" },
};

const RES_ORDER = ["FHD", "QHD", "UHD4K", "UHD8K"];
const resRank = (r) => RES_ORDER.indexOf(r);

// ---------- 2. DERIVED MATH (constraints, not free vars) ----------

// w,h derived purely from (screen, res). One width anchor (1920*scale).
function dims(screenKey, resKey) {
  const a = SCREEN[screenKey].aspect;
  const s = RESTIER[resKey].scale;
  const w = Math.round(1920 * s);
  const h = Math.round(w / a);
  return { w, h, aspect: a, pixels: w * h };
}

// Grid placement: N containers -> ceil(sqrt(N)) lattice on BASE LAYER plane.
// Normalized centroid (gx,gy) in [0,1]x[0,1]. Pure function of index + count.
function gridSlot(i, n) {
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const col = i % cols;
  const row = Math.floor(i / cols);
  return {
    cols, rows,
    gx: (col + 0.5) / cols,
    gy: (row + 0.5) / rows,
  };
}

// ---------- 3. UNIFORM CONTAINER VECTOR (same schema for ALL) ----------
// Fields: id | layer | subsystem | parent | role | screen | res | state | mcp
//         + derived: aspect | w | h | pixels | gx | gy
function makeVector(spec, i, n) {
  const d = dims(spec.screen, spec.res);
  const g = gridSlot(i, n);
  return {
    id: spec.id,
    layer: spec.layer ?? 0,            // BASE LAYER = 0
    subsystem: spec.subsystem,         // SYSTEM | LOCAL | CLOUD
    parent: spec.parent ?? null,
    role: spec.role,                   // GATE|MCP|SERVER|AGENT|DATA|EXPORTER|CACHE
    screen: spec.screen,
    res: spec.res,
    state: spec.state,                 // UP | DOWN | UNHEALTHY
    mcp: !!spec.mcp,
    // ---- derived ----
    aspect: +d.aspect.toFixed(4),
    w: d.w, h: d.h,
    pixels: d.pixels,
    gx: +g.gx.toFixed(4),
    gy: +g.gy.toFixed(4),
    grid: `${g.cols}x${g.rows}`,
  };
}

// ---------- 4. CLUSTER 1 = MATH : the BASE LAYER (16:9 @ 4K max width) ----------
const CLUSTER1 = {
  name: "MATH",
  layer: 0,
  baseScreen: "S169",
  baseRes: "UHD4K",            // 4K = max width on BASE LAYER
  baseDims: dims("S169", "UHD4K"),   // 3840 x 2160
};

// Floor grid planes (overlay regions on the BASE LAYER plane)
const FLOOR = [
  { id: "vis-docker1",  region: "FULL",     gx0: 0.0, gy0: 0.0, gx1: 1.0, gy1: 1.0, desc: "full screen" },
  { id: "vis-docker-1a", region: "SUB-L",   gx0: 0.0, gy0: 0.0, gx1: 0.5, gy1: 0.5, desc: "sub left" },
  { id: "vis-docker-2a", region: "SUB-R",   gx0: 0.5, gy0: 0.0, gx1: 1.0, gy1: 0.5, desc: "sub right" },
];

// Trinity tri-core at BASE LAYER 0 : base | mcp | server
const TRINITY = [
  { id: "core-base",  role: "BASE",  gx: 0.5, gy: 0.85, mcp: false },
  { id: "core-mcp",   role: "MCP",   gx: 0.35, gy: 0.85, mcp: true },
  { id: "core-server",role: "SERVER",gx: 0.65, gy: 0.85, mcp: true },
];

// Width container hierarchy: system-docker -> {subsystem-local-docker, subsystem-cloud-docker}
const HIERARCHY = {
  "system-docker": { children: ["subsystem-local-docker", "subsystem-cloud-docker"] },
};

// ---------- 5. ALIGNMENT MAP (external tools -> model nodes) ----------
const ALIGN = {
  "VS Code":         { mapsTo: "subsystem-local-docker", note: "local dev IDE" },
  "Cloudflare":      { mapsTo: "subsystem-cloud-docker", note: "edge/CDN = Bruce gate" },
  "Google AI Studio":{ mapsTo: "core-mcp",               note: "AI/model runtime" },
  "Stitch":          { mapsTo: "vis-docker1",            note: "UI design layer (16:9 4K)" },
};

// ---------- 6. THE 12 LIVE CONTAINERS (from docker ps -a, 2026-08-16) ----------
// State taken from live daemon. subsystem/role/screen/res are the MODEL assignment.
const LIVE = [
  { id: "vistamations-app",        subsystem: "LOCAL",  parent: "subsystem-local-docker",  role: "SERVER",  state: "UNHEALTHY", mcp: true,  screen: "S169",  res: "UHD4K" },
  { id: "vistamations-redis",      subsystem: "LOCAL",  parent: "subsystem-local-docker",  role: "DATA",    state: "DOWN",      mcp: false, screen: "S11",   res: "FHD"   },
  { id: "vistamations-nginx",      subsystem: "LOCAL",  parent: "subsystem-local-docker",  role: "GATE",    state: "DOWN",      mcp: false, screen: "S169",  res: "UHD4K" },
  { id: "vistamations-prometheus", subsystem: "LOCAL",  parent: "subsystem-local-docker",  role: "EXPORTER",state: "DOWN",      mcp: false, screen: "S169",  res: "QHD"   },
  { id: "presentations-app",       subsystem: "LOCAL",  parent: "subsystem-local-docker",  role: "SERVER",  state: "UP",        mcp: false, screen: "S169",  res: "UHD4K" },
  { id: "pdfcraft",                subsystem: "LOCAL",  parent: "subsystem-local-docker",  role: "SERVER",  state: "UP",        mcp: false, screen: "S169",  res: "UHD4K" },
  { id: "vistamations-monitor",    subsystem: "LOCAL",  parent: "subsystem-local-docker",  role: "AGENT",   state: "UP",        mcp: true,  screen: "S169",  res: "QHD"   },
  { id: "docmerge",                subsystem: "LOCAL",  parent: "subsystem-local-docker",  role: "SERVER",  state: "UP",        mcp: false, screen: "S169",  res: "UHD4K" },
  { id: "pres-app",                subsystem: "LOCAL",  parent: "subsystem-local-docker",  role: "SERVER",  state: "UP",        mcp: false, screen: "S169",  res: "UHD4K" },
  { id: "angry_sinoussi",          subsystem: "CLOUD",  parent: "subsystem-cloud-docker",  role: "EXPORTER",state: "UP",        mcp: false, screen: "S1610", res: "FHD"   },
  { id: "laughing_antonelli",      subsystem: "CLOUD",  parent: "subsystem-cloud-docker",  role: "EXPORTER",state: "DOWN",      mcp: false, screen: "S1610", res: "FHD"   },
  { id: "infallible_mccarthy",     subsystem: "CLOUD",  parent: "subsystem-cloud-docker",  role: "EXPORTER",state: "UP",        mcp: false, screen: "S1610", res: "FHD"   },
];

// ---------- 7. BUILD + VALIDATE ----------
const vectors = LIVE.map((s, i) => makeVector(s, i, LIVE.length));

// Constraint checks
const SCHEMA_KEYS = ["id","layer","subsystem","parent","role","screen","res","state","mcp","aspect","w","h","pixels","gx","gy","grid"];
const checks = [];
checks.push(["uniform schema (all vectors same 16 fields)", vectors.every(v => SCHEMA_KEYS.every(k => k in v))]);
checks.push(["grid normalized in [0,1]", vectors.every(v => v.gx >= 0 && v.gx <= 1 && v.gy >= 0 && v.gy <= 1)]);
checks.push(["BASE LAYER = 0 for all", vectors.every(v => v.layer === 0)]);
checks.push(["4K is max res on BASE", RESTIER.UHD4K.scale === 2 && Math.max(...vectors.map(v=>v.pixels)) <= dims("S169","UHD4K").pixels]);
checks.push(["brand index: Sony can do 8K", BRAND.Sony.max === "UHD8K"]);
checks.push(["brand index: Samsung capped 4K", BRAND.Samsung.max === "UHD4K"]);
checks.push(["hierarchy has 2 subsystems", HIERARCHY["system-docker"].children.length === 2]);
checks.push(["alignment maps 4 tools", Object.keys(ALIGN).length === 4]);

// ---------- 8. OUTPUT ----------
console.log("================ CLUSTER 1 = MATH (BASE LAYER) ================");
console.log(`layer=${CLUSTER1.layer}  base=${CLUSTER1.baseScreen} @ ${CLUSTER1.baseRes}  ->  ${CLUSTER1.baseDims.w}x${CLUSTER1.baseDims.h}  (${(CLUSTER1.baseDims.pixels/1e6).toFixed(2)} MP)`);
console.log("\n--- FLOOR GRID (overlay planes) ---");
FLOOR.forEach(f => console.log(`  ${f.id.padEnd(14)} ${f.region.padEnd(7)} [${f.gx0},${f.gy0}]->[${f.gx1},${f.gy1}]  ${f.desc}`));
console.log("\n--- TRINITY tri-core (layer 0) ---");
TRINITY.forEach(t => console.log(`  ${t.id.padEnd(12)} role=${t.role.padEnd(7)} g=(${t.gx},${t.gy}) mcp=${t.mcp}`));
console.log("\n--- WIDTH HIERARCHY ---");
console.log(`  system-docker -> ${HIERARCHY["system-docker"].children.join(" | ")}`);

console.log("\n================ 12 CONTAINER VECTORS ================");
console.log("id".padEnd(22), "sub".padEnd(6), "role".padEnd(9), "scr".padEnd(6), "res".padEnd(6), "state".padEnd(10), "dim(px)".padEnd(12), "g(x,y)".padEnd(14), "mcp");
vectors.forEach(v => {
  console.log(
    v.id.padEnd(22),
    v.subsystem.padEnd(6),
    v.role.padEnd(9),
    v.screen.padEnd(6),
    v.res.padEnd(6),
    v.state.padEnd(10),
    `${v.w}x${v.h}`.padEnd(12),
    `(${v.gx},${v.gy})`.padEnd(14),
    v.mcp ? "Y" : "."
  );
});

console.log("\n--- SCREEN TYPE TABLE ---");
Object.entries(SCREEN).forEach(([k,s]) => console.log(`  ${k.padEnd(6)} aspect=${s.aspect.toFixed(4)}  ${s.label}`));
console.log("--- BRAND INDEX ---");
Object.entries(BRAND).forEach(([k,b]) => console.log(`  ${k.padEnd(8)} aspects=[${b.aspects.join(",")}]  max=${b.max}`));
console.log("--- ALIGNMENT ---");
Object.entries(ALIGN).forEach(([k,a]) => console.log(`  ${k.padEnd(16)} -> ${a.mapsTo.padEnd(24)} (${a.note})`));

console.log("\n================ CONSTRAINT VALIDATION ================");
let ok = true;
checks.forEach(([name, pass]) => { if (!pass) ok = false; console.log(`  [${pass ? "PASS" : "FAIL"}] ${name}`); });
console.log(`\nRESULT: ${ok ? "ALL CONSTRAINTS SATISFIED" : "CONSTRAINT VIOLATION"}`);

console.log("\n================ ENVIRONMENT FLAGS (from disk) ================");
console.log("  C:\\vistamations.com        -> MISSING (only C:\\vistamations-music exists)");
console.log("  info@vistamations.con      -> .con likely typo for .com");
console.log("  cloudflared                 -> NOT installed");
console.log("  VS Code CLI (code)         -> installed");
console.log("  X display                  -> none (headless daemon)");
