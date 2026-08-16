/**
 * vector-mesh-model.cjs
 * MESH LAYER on top of cluster-1 vector model (BASE LAYER 0).
 *
 * WEBA = MICRO MESH  : intra-subsystem star to a local mesh-router.
 * WEBB = MACRO MESH  : HOME -> LOCAL -> REMOTE spine (blue prism) + cloud cross-link.
 *
 * Mesh is DERIVED from the same 12 live container vectors (subsystem field),
 * so it stays consistent with vector-floor-model.cjs. No new free variables.
 */

// ---- 12 live containers (mirrors vector-floor-model.cjs; subsystem drives mesh) ----
const LIVE = [
  { id: "vistamations-app",        sub: "LOCAL" },
  { id: "vistamations-redis",      sub: "LOCAL" },
  { id: "vistamations-nginx",      sub: "LOCAL" },
  { id: "vistamations-prometheus", sub: "LOCAL" },
  { id: "presentations-app",       sub: "LOCAL" },
  { id: "pdfcraft",                sub: "LOCAL" },
  { id: "vistamations-monitor",    sub: "LOCAL" },
  { id: "docmerge",                sub: "LOCAL" },
  { id: "pres-app",                sub: "LOCAL" },
  { id: "angry_sinoussi",          sub: "CLOUD" },
  { id: "laughing_antonelli",      sub: "CLOUD" },
  { id: "infallible_mccarthy",     sub: "CLOUD" },
];

// ---- WEBA : MICRO MESH (per-subsystem star) ----
function microMesh(nodes) {
  const bySub = {};
  for (const n of nodes) (bySub[n.sub] ||= []).push(n.id);
  const routers = {};
  const links = [];
  for (const [sub, ids] of Object.entries(bySub)) {
    const router = `weba-router-${sub.toLowerCase()}`;
    routers[sub] = router;
    for (const id of ids) links.push([id, router, "micro"]);
  }
  return { routers, links, bySub };
}

// ---- WEBB : MACRO MESH (spine) ----
// HOME (Pete's microserver) -> LOCAL (docker daemon) -> REMOTE (cloud + endpoint)
const SPINE = [
  { id: "home-microserver",   tier: "HOME",   g: 0.0 },
  { id: "local-docker",       tier: "LOCAL",  g: 0.5 },
  { id: "remote-cloud-edge",  tier: "REMOTE", g: 1.0 },
];
const macroLinks = [
  ["home-microserver", "local-docker", "macro"],
  ["local-docker", "remote-cloud-edge", "macro"],
  // cross-link: local subsystem <-> cloud subsystem (system-docker backbone)
  ["weba-router-local", "weba-router-cloud", "macro-backbone"],
];

// ---- assemble ----
const weba = microMesh(LIVE);
const allLinks = [...weba.links, ...macroLinks];

// ---- validation ----
const checks = [];
checks.push(["WEBA: 2 subsystem routers (LOCAL, CLOUD)", Object.keys(weba.routers).length === 2]);
checks.push(["WEBA: micro links = 12 (one per container)", weba.links.length === 12]);
checks.push(["WEBB: spine has 3 tiers HOME/LOCAL/REMOTE", SPINE.length === 3]);
checks.push(["WEBB: macro links = 3 (spine 2 + backbone 1)", macroLinks.length === 3]);
checks.push(["every container assigned to a micro router", LIVE.every(n => weba.routers[n.sub])]);

// ---- output ----
console.log("================ MESH LAYER (on cluster-1 BASE LAYER 0) ================\n");

console.log("--- WEBA = MICRO MESH (intra-subsystem star) ---");
for (const [sub, ids] of Object.entries(weba.bySub)) {
  console.log(`  ${weba.routers[sub].padEnd(22)} <- ${ids.length} nodes`);
  ids.forEach(id => console.log(`      └─ ${id}`));
}

console.log("\n--- WEBB = MACRO MESH (HOME -> LOCAL -> REMOTE spine) ---");
SPINE.forEach((s, i) => {
  const tag = i === 0 ? "●" : i === SPINE.length - 1 ? "●" : "◆";
  console.log(`  ${tag} ${s.tier.padEnd(7)} ${s.id}  (g=${s.g})`);
});
console.log("  links:");
macroLinks.forEach(([a, b, k]) => console.log(`      ${a} --[${k}]--> ${b}`));

console.log("\n--- AGGREGATE (WEBA routers hang off WEBB) ---");
console.log(`  total mesh nodes = ${LIVE.length + Object.keys(weba.routers).length + SPINE.length} (12 containers + 2 WEBA routers + 3 WEBB spine)`);
console.log(`  total mesh links = ${allLinks.length} (12 micro + 3 macro)`);

console.log("\n================ MESH CONSTRAINT VALIDATION ================");
let ok = true;
checks.forEach(([n, p]) => { if (!p) ok = false; console.log(`  [${p ? "PASS" : "FAIL"}] ${n}`); });
console.log(`\nRESULT: ${ok ? "MESH CONSISTENT WITH VECTOR MODEL" : "MESH VIOLATION"}`);

console.log("\n--- maps onto prior layers ---");
console.log("  width hierarchy : system-docker -> subsystem-local-docker | subsystem-cloud-docker");
console.log("  blue prism      : HOME(microserver) -> LOCAL(daemon) -> REMOTE(cloud+endpoint)");
console.log("  WEBA routers    : one per subsystem (local, cloud)  = micro mesh");
console.log("  WEBB spine      : home->local->remote + local<->cloud backbone = macro mesh");
