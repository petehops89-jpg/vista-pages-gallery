/**
 * Fortnite Collection — MCP Orchestrator (internal)
 *
 * Role: the "architect" the Next.js app calls to orchestrate the system.
 * It exposes tool-callable operations:
 *   - trigger_daily_cycle : POST /api/cycle on the app (Bearer CYCLE_TOKEN)
 *   - list_today_images    : GET  /api/images on the app
 *   - gateway_health       : ping the app + self
 *
 * Transport: a minimal MCP-shaped JSON-RPC HTTP server (no external SDK needed,
 * so it builds/runs offline). Swap in @modelcontextprotocol/sdk for full
 * stdio/client compatibility if you wire a desktop AI client later.
 *
 * Env:
 *   PORT=4000
 *   APP_BASE_URL=http://app:3000
 *   CYCLE_TOKEN=<shared secret, must match the app's CYCLE_TOKEN>
 */
const http = require("http");
const { URL } = require("url");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 4000);
const APP_BASE_URL = process.env.APP_BASE_URL || "http://app:3000";
const WORKSPACE_DIR = process.env.WORKSPACE_DIR || "/workspace";
const CYCLE_TOKEN = process.env.CYCLE_TOKEN || "changeme";

const TOOLS = [
  {
    name: "trigger_daily_cycle",
    description: "Trigger the Fortnite collection daily image-cycle + push notification.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_today_images",
    description: "List today's rotated Fortnite collection images from the app.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "gateway_health",
    description: "Health-check the app service and the MCP orchestrator.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "workspace_list",
    description: "List files in Terence's local workspace folder (scoped to WORKSPACE_DIR).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "workspace_read",
    description: "Read a text file from Terence's local workspace folder.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string" } },
      required: ["path"],
    },
  },
  {
    name: "workspace_write",
    description: "Write a text file into Terence's local workspace folder (creates dirs).",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        content: { type: "string" },
      },
      required: ["path", "content"],
    },
  },
];

async function appFetch(path, opts = {}) {
  const res = await fetch(APP_BASE_URL + path, opts);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
}

const HANDLERS = {
  trigger_daily_cycle: async () => {
    const r = await appFetch("/api/cycle", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${CYCLE_TOKEN}` },
    });
    return r;
  },
  list_today_images: async () => appFetch("/api/images"),
  gateway_health: async () => {
    const app = await appFetch("/api/images").catch((e) => ({ status: 0, body: String(e) }));
    return { status: 200, body: { mcp: "ok", app: app.status } };
  },
};

// ---- Workspace tools: scoped to WORKSPACE_DIR, traversal-proof ----

function safeJoin(base, rel) {
  const root = path.resolve(base);
  const target = path.resolve(root, String(rel || "."));
  if (target !== root && !target.startsWith(root + path.sep)) {
    throw new Error("Path escapes workspace");
  }
  return target;
}

const WORKSPACE_HANDLERS = {
  workspace_list: async () => {
    if (!fs.existsSync(WORKSPACE_DIR)) return { status: 404, body: { error: "workspace not mounted" } };
    const entries = fs.readdirSync(WORKSPACE_DIR, { withFileTypes: true }).map((e) => ({
      name: e.name,
      type: e.isDirectory() ? "dir" : "file",
      size: e.isFile() ? fs.statSync(path.join(WORKSPACE_DIR, e.name)).size : null,
    }));
    return { status: 200, body: { path: WORKSPACE_DIR, entries } };
  },
  workspace_read: async (args = {}) => {
    const file = safeJoin(WORKSPACE_DIR, args.path);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      return { status: 404, body: { error: "File not found" } };
    }
    return { status: 200, body: { path: args.path, content: fs.readFileSync(file, "utf8") } };
  },
  workspace_write: async (args = {}) => {
    const file = safeJoin(WORKSPACE_DIR, args.path);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, String(args.content ?? ""));
    return { status: 200, body: { path: args.path, ok: true } };
  },
};

function jsonRpc(id, result) {
  return { jsonrpc: "2.0", id, result };
}
function jsonRpcError(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405).end("Method Not Allowed");
    return;
  }
  let raw = "";
  for await (const chunk of req) raw += chunk;
  let msg;
  try { msg = JSON.parse(raw); } catch {
    res.writeHead(400, { "content-type": "application/json" });
    return res.end(JSON.stringify(jsonRpcError(null, -32700, "Parse error")));
  }

  const { id, method, params } = msg;

  try {
    if (method === "initialize") {
      return send(res, jsonRpc(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "fortnite-collection-mcp", version: "1.0.0" },
      }));
    }
    if (method === "tools/list") {
      return send(res, jsonRpc(id, { tools: TOOLS }));
    }
    if (method === "tools/call") {
      const name = params?.name;
      const handler = HANDLERS[name] || WORKSPACE_HANDLERS[name];
      if (!handler) return send(res, jsonRpcError(id, -32601, `Unknown tool: ${name}`));
      const out = await handler(params?.arguments || {});
      return send(res, jsonRpc(id, {
        content: [{ type: "text", text: JSON.stringify(out, null, 2) }],
        isError: out.status >= 400,
      }));
    }
    return send(res, jsonRpcError(id, -32601, `Method not found: ${method}`));
  } catch (e) {
    return send(res, jsonRpcError(id, -32603, String(e)));
  }
});

function send(res, payload) {
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

server.listen(PORT, () => console.log(`[mcp] orchestrator listening on :${PORT}`));
