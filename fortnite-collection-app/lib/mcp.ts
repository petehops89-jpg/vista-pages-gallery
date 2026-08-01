/**
 * Client the Next.js app uses to call the internal MCP orchestrator.
 * Direct connection to MCP (internal Docker network).
 */
const MCP_BASE = process.env.MCP_BASE_URL || "http://localhost:4000";

type RpcResult = { content?: { type: string; text: string }[]; isError?: boolean };

async function callTool(name: string, args: Record<string, unknown> = {}): Promise<RpcResult> {
  const res = await fetch(`${MCP_BASE}/`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name, arguments: args },
    }),
  });
  const data = (await res.json()) as { result?: RpcResult };
  return data.result ?? { content: [], isError: true };
}

export async function mcpTriggerDailyCycle() {
  return callTool("trigger_daily_cycle");
}

export async function mcpListTodayImages() {
  return callTool("list_today_images");
}

export async function mcpGatewayHealth() {
  return callTool("gateway_health");
}
