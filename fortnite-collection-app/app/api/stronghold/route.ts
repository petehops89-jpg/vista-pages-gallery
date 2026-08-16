import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

/**
 * Intelligence Stronghold — server-backed doc store.
 *
 * Docs are persisted to disk under STRONGHOLD_DATA_DIR (default ./data,
 * gitignored) as stronghold.json. Every request must carry the shared secret
 * in the `x-stronghold-token` header; the value is compared against
 * STRONGHOLD_TOKEN from .env. No doc ever lives in the client or in git.
 *
 *   GET    /api/stronghold   -> list docs
 *   POST   /api/stronghold   -> { title, body, tag? }  add a doc
 *   DELETE /api/stronghold   -> { id }                 remove a doc
 */

type Doc = {
  id: number;
  title: string;
  body: string;
  tag: string;
  ts: string;
};

// Docs persist to c:\vis-intel by default (absolute, off-repo). Override with
// STRONGHOLD_DATA_DIR. The file is stronghold.json inside that directory.
const DATA_DIR = process.env.STRONGHOLD_DATA_DIR || "c:/vis-intel";
const DATA_FILE = path.isAbsolute(DATA_DIR)
  ? path.join(DATA_DIR, "stronghold.json")
  : path.join(process.cwd(), DATA_DIR, "stronghold.json");

function tokenOk(req: NextRequest): boolean {
  const env = process.env.STRONGHOLD_TOKEN;
  if (!env) return false; // misconfigured server → lock down
  const sent = req.headers.get("x-stronghold-token") || "";
  // constant-time-ish compare to avoid trivial timing leaks
  if (sent.length !== env.length) return false;
  let diff = 0;
  for (let i = 0; i < env.length; i++) diff |= sent.charCodeAt(i) ^ env.charCodeAt(i);
  return diff === 0;
}

function readAll(): Doc[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw) as Doc[];
  } catch {
    return [];
  }
}

function writeAll(docs: Doc[]): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(docs, null, 2), "utf8");
}

export async function GET(req: NextRequest) {
  if (!tokenOk(req))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ docs: readAll() });
}

export async function POST(req: NextRequest) {
  if (!tokenOk(req))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let payload: { title?: string; body?: string; tag?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const title = (payload.title || "").trim();
  const body = (payload.body || "").trim();
  if (!title || !body)
    return NextResponse.json({ error: "title and body required" }, { status: 400 });

  const docs = readAll();
  const doc: Doc = {
    id: docs.length ? Math.max(...docs.map((d) => d.id)) + 1 : 1,
    title,
    body,
    tag: (payload.tag || "intel").trim(),
    ts: new Date().toISOString(),
  };
  docs.unshift(doc);
  writeAll(docs);
  return NextResponse.json({ doc }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!tokenOk(req))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let payload: { id?: number };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const docs = readAll().filter((d) => d.id !== payload.id);
  writeAll(docs);
  return NextResponse.json({ ok: true, remaining: docs.length });
}
