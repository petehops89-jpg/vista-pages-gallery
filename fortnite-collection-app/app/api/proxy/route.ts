import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/proxy?url=<external>&...rest
 * Serverless CORS-bypass proxy. The browser calls our same-origin endpoint;
 * the server fetches the external resource and returns it. Use this for any
 * third-party image/API that blocks browser requests (e.g. the Perchance
 * generator data, or an external Fortnite stats API). Never proxy arbitrary
 * hosts in production — keep an allowlist.
 */
export const dynamic = "force-dynamic";

const ALLOWLIST = [
  "perchance.org",
  "api.fortniteapi.io",
  "fortnite-api.com",
];

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  if (!target) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return NextResponse.json({ error: "bad url" }, { status: 400 });
  }

  if (!ALLOWLIST.includes(url.hostname)) {
    return NextResponse.json({ error: "host not allowed" }, { status: 403 });
  }

  try {
    const upstream = await fetch(url.toString(), {
      headers: { "user-agent": "fn-collection/1.0" },
    });
    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/octet-stream",
        "cache-control": "public, max-age=300",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
