import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RpcMessage = {
  id?: number | string | null;
  method?: string;
  params?: { name?: string; arguments?: Record<string, unknown> };
};

async function appFetch(req: NextRequest, path: string, init: RequestInit = {}) {
  // Call the app via its internal address — req.url is the public URL the
  // browser used (e.g. localhost:8080), which is unreachable from inside the
  // container. localhost:3000 is this same Next process.
  const base = process.env.APP_INTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
  const url = new URL(path, base);
  const res = await fetch(url, init);
  const text = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

async function runTool(req: NextRequest, name: string) {
  switch (name) {
    case "trigger_daily_cycle": {
      const token = process.env.CYCLE_TOKEN || "changeme";
      return appFetch(req, "/api/cycle", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
      });
    }
    case "list_today_images":
      return appFetch(req, "/api/images");
    case "gateway_health":
      return { status: 200, body: { mcp: "ok", app: "ok" } };
    default:
      return { status: 404, body: { error: `Unknown tool: ${name}` } };
  }
}

export async function POST(req: NextRequest) {
  let payload: RpcMessage;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" } }, { status: 400 });
  }

  const { id, method, params } = payload;

  if (method === "initialize") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "fortnite-collection-mcp", version: "1.0.0" },
      },
    });
  }

  if (method === "tools/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: [
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
        ],
      },
    });
  }

  if (method === "tools/call") {
    const name = params?.name;
    if (!name) {
      return NextResponse.json({ jsonrpc: "2.0", id, error: { code: -32602, message: "Invalid params" } });
    }

    const out = await runTool(req, name);
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        content: [{ type: "text", text: JSON.stringify(out.body, null, 2) }],
        isError: out.status >= 400,
      },
    });
  }

  return NextResponse.json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
}
