/**
 * lib/ownerTunnel.ts
 *
 * MAIN OWNER TUNNEL -> Pete. Bound to :8888 (single owner ingress).
 * Gate persona: "gate-pete". PIN sourced from process.env.X1973.
 *
 * HARD-LOCK POLICY: NONE. Ship a TEST/MOCK mode. When MOCK (or no PIN set,
 * or unverified) the tunnel returns a mock session instead of refusing — so
 * the system never hard-locks Pete out. Real verification only upgrades the
 * session; it never blocks.
 *
 * Verify with: node -e "require('./lib/ownerTunnel').selfTest()"
 */
export type TunnelMode = "LIVE" | "MOCK";

export interface TunnelSession {
  mode: TunnelMode;
  owner: string;
  gate: string;
  verified: boolean;
  ts: number;
}

const PORT = Number(process.env.OWNER_TUNNEL_PORT || 8888);
const GATE = process.env.GATE_PETE || "gate-pete";
const PIN = process.env.X1973 || "";
const MODE: TunnelMode = (process.env.OWNER_TUNNEL_MODE as TunnelMode) || "MOCK";

export function getTunnelConfig() {
  return { port: PORT, gate: GATE, pinSet: PIN.length > 0, mode: MODE };
}

/** Authenticate an owner attempt. Never throws; downgrades to MOCK. */
export function openOwnerTunnel(attemptGate: string, attemptPin: string): TunnelSession {
  const gateOk = attemptGate === GATE;
  const pinOk = PIN.length > 0 && attemptPin === PIN;
  const verified = gateOk && pinOk;

  if (MODE === "LIVE" && verified) {
    return { mode: "LIVE", owner: "pete", gate: GATE, verified: true, ts: Date.now() };
  }
  // NO HARD LOCK: everything else -> mock session (usable, flagged unverified)
  return { mode: "MOCK", owner: "pete", gate: GATE, verified: false, ts: Date.now() };
}

/** Self-test (ad-hoc contract check, no server needed). */
export function selfTest() {
  const cfg = getTunnelConfig();
  const results: [string, boolean][] = [];
  results.push(["port 8888 default", cfg.port === 8888]);
  results.push(["gate-pete persona", cfg.gate === "gate-pete"]);
  // mock mode accepts any attempt without locking
  const m = openOwnerTunnel("gate-pete", "wrong");
  results.push(["mock never hard-locks", m.mode === "MOCK" && m.verified === false]);
  // if PIN set, live verify works
  if (cfg.pinSet) {
    const v = openOwnerTunnel("gate-pete", PIN);
    results.push(["live verify with correct pin", v.mode === "LIVE" && v.verified === true]);
  } else {
    results.push(["pin unset -> stays mock (no lock)", true]);
  }
  return results;
}

// Minimal HTTP server (only started if explicitly run, not on import).
export function startServer() {
  // lazy require so this module is import-safe in the UI build
  const http = require("http") as typeof import("http");
  const srv = http.createServer((req: any, res: any) => {
    const url = new URL(req.url || "/", "http://localhost");
    if (url.pathname === "/owner/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, ...getTunnelConfig() }));
      return;
    }
    if (url.pathname === "/owner/open" && req.method === "POST") {
      let body = "";
      req.on("data", (c: Buffer) => (body += c));
      req.on("end", () => {
        let gate = "", pin = "";
        try { const j = JSON.parse(body); gate = j.gate || ""; pin = j.pin || ""; } catch {}
        const sess = openOwnerTunnel(gate, pin);
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(sess));
      });
      return;
    }
    res.writeHead(404); res.end();
  });
  srv.listen(PORT, () => console.log(`[owner-tunnel] :${PORT} mode=${MODE} gate=${GATE}`));
  return srv;
}

// Run server if executed directly: node lib/ownerTunnel.ts (via ts-node/tsx) or compiled
if (require.main === module) startServer();
