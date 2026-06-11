// Client for the embedding/encoding service (FastAPI — see ai_api/app.py).
//
// The model is asymmetric e5 (multilingual-e5-large fine-tuned):
//   requirement → PASSAGE side ("passage: " prefix)
//   clo         → QUERY   side ("query: "   prefix)
// It returns 1024-dim, unit-normalized float32 vectors (cosine = dot product),
// which we store in Supabase pgvector (`requirements.embedding`, `clos.embedding`).
//
// Calls go through the Next.js route handler at /api/encode so the FastAPI URL
// stays server-side (EMBEDDING_API_URL) and we avoid browser CORS.

export type EncodeType = "requirement" | "clo";

export interface EncodeResponse {
  type: EncodeType;
  dim: number;
  count: number;
  embeddings: number[][];
}

export interface EncodingHealth {
  status: "ok" | "loading" | string;
  device: string;
  dim: number | null;
}

const ENCODE_ENDPOINT = "/api/encode";

// Encode a batch of texts. Returns one embedding (number[]) per input text,
// in the same order. Empty input short-circuits without hitting the network.
export async function encodeTexts(
  type: EncodeType,
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const res = await fetch(ENCODE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, texts }),
  });

  if (!res.ok) {
    const detail = await res
      .json()
      .then((b) => b?.error ?? b?.detail)
      .catch(() => null);
    throw new Error(
      `Encoding API error (${res.status})${detail ? `: ${detail}` : ""}`,
    );
  }

  const data = (await res.json()) as EncodeResponse;
  return data.embeddings;
}

// Convenience wrappers for the two sides of the asymmetric model.
export const encodeRequirements = (texts: string[]) =>
  encodeTexts("requirement", texts);
export const encodeClos = (texts: string[]) => encodeTexts("clo", texts);

export async function encodeRequirement(text: string): Promise<number[]> {
  const [embedding] = await encodeTexts("requirement", [text]);
  return embedding;
}

export async function encodeClo(text: string): Promise<number[]> {
  const [embedding] = await encodeTexts("clo", [text]);
  return embedding;
}

// Liveness/readiness of the encoding service. `status` is "ok" once the model
// is loaded, "loading" while it warms up, or "unreachable" if FastAPI is down.
export async function getEncodingHealth(): Promise<EncodingHealth> {
  const res = await fetch(ENCODE_ENDPOINT, { method: "GET" });
  return (await res.json()) as EncodingHealth;
}
