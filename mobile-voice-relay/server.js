/**
 * mobile-voice-relay / server.js
 * COMPUTER side (runs on the Windows box, but does NOT touch audio).
 *
 * Role: receive transcript TEXT from the phone (which did capture+STT),
 *       forward it to the agent/MCP bus, and echo status back.
 * Windows never processes a mic buffer -> voice bottleneck removed.
 *
 * Endpoints:
 *   POST /voice        body {text, lang, device}  -> {ok, id, action}
 *   GET  /voice/health -> {ok:true}
 *   GET  /             -> serves the phone PWA (index.html)
 *
 * Run:  node server.js   (PORT env optional, default 3007)
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3007);
const PUBLIC = path.join(__dirname, "public");
const INBOX = path.join(__dirname, "inbox"); // transcript log (audit trail)
fs.mkdirSync(INBOX, { recursive: true });

let seq = 0;

function json(res, code, obj) {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(obj));
}

function logTranscript(rec) {
  const f = path.join(INBOX, `t-${Date.now()}.json`);
  fs.writeFileSync(f, JSON.stringify(rec, null, 2));
}

const server = http.createServer((req, res) => {
  // health
  if (req.method === "GET" && req.url === "/voice/health") return json(res, 200, { ok: true });

  // receive transcript from phone
  if (req.method === "POST" && req.url === "/voice") {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      let body;
      try { body = JSON.parse(raw); } catch { return json(res, 400, { ok: false, error: "bad json" }); }
      const text = String(body.text || "").trim();
      if (!text) return json(res, 400, { ok: false, error: "empty text" });
      const rec = {
        id: `vox-${++seq}`,
        text,
        lang: body.lang || "en-AU",
        device: body.device || "mobile",
        ts: new Date().toISOString(),
      };
      logTranscript(rec);
      // --- hook point: forward to agent bus / MCP / control room ---
      // e.g. fetch("http://localhost:4000", {method:"POST", body: JSON.stringify({tool:"voice_in", ...rec})})
      console.log(`[voice] ${rec.id} <- ${rec.device}: ${rec.text}`);
      return json(res, 200, { ok: true, id: rec.id, action: "received" });
    });
    return;
  }

  // serve PWA
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    const f = path.join(PUBLIC, "index.html");
    if (fs.existsSync(f)) {
      res.writeHead(200, { "content-type": "text/html" });
      return fs.createReadStream(f).pipe(res);
    }
  }

  json(res, 404, { ok: false, error: "not found" });
});

server.listen(PORT, () => console.log(`[relay] listening on :${PORT}  (phone -> computer voice bus)`));
