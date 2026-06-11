// Proxy to the FastAPI embedding service (ai_api/app.py).
//
// Keeps EMBEDDING_API_URL server-side and gives the browser a same-origin
// endpoint (no CORS). Mirrors the upstream contract:
//   POST /api/encode  { type: "requirement" | "clo", texts: string[] }
//                  -> { type, dim, count, embeddings: number[][] }
//   GET  /api/encode  -> upstream /health  { status, device, dim }

import type { NextRequest } from "next/server";

const API_BASE = process.env.EMBEDDING_API_URL ?? "http://127.0.0.1:8000";

type EncodeType = "requirement" | "clo";

function isEncodeType(t: unknown): t is EncodeType {
  return t === "requirement" || t === "clo";
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const { type, texts } = (body ?? {}) as { type?: unknown; texts?: unknown };

  if (!isEncodeType(type)) {
    return Response.json(
      { error: "`type` must be 'requirement' or 'clo'" },
      { status: 400 },
    );
  }
  if (
    !Array.isArray(texts) ||
    texts.length === 0 ||
    !texts.every((t) => typeof t === "string")
  ) {
    return Response.json(
      { error: "`texts` must be a non-empty array of strings" },
      { status: 400 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE}/encode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, texts }),
      cache: "no-store",
    });
  } catch {
    return Response.json(
      {
        error: `Cannot reach encoding service at ${API_BASE}. Is the FastAPI server running?`,
      },
      { status: 502 },
    );
  }

  const data = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    // FastAPI surfaces errors as { detail: ... } (e.g. 503 model belum siap).
    const detail =
      (data && (data.detail ?? data.error)) || upstream.statusText;
    return Response.json({ error: detail }, { status: upstream.status });
  }

  return Response.json(data, { status: 200 });
}

export async function GET() {
  try {
    const upstream = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    const data = await upstream.json().catch(() => null);
    return Response.json(data ?? { status: "unknown" }, {
      status: upstream.status,
    });
  } catch {
    return Response.json(
      {
        status: "unreachable",
        device: null,
        dim: null,
        error: `Cannot reach encoding service at ${API_BASE}`,
      },
      { status: 502 },
    );
  }
}
