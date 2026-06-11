"""
Fill req_best_clo: for each requirement, find the most similar CLO (cosine sim).
Compute in DB in batches via SQL — uses pgvector cross join.
Each batch ~500 reqs × 164 clos = 82k vector ops, well under statement timeout.
"""
import os, time
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env.local")
sb = create_client(os.environ["NEXT_PUBLIC_SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])

# Use SQL function via postgrest rpc — but pgrst doesn't expose arbitrary SQL.
# Use the schema-cache-side approach: insert via SQL passed to supabase functions.
# Workaround: create a thin SQL function that takes a batch range, run it via rpc.

# Easier: use psycopg2 over Supabase connection pooler.
# But to avoid extra deps, we'll create a one-shot SQL function then call via rpc.

# Setup: ensure helper function exists (idempotent)
print("[info] using helper function rpc approach")

# Check current count
res = sb.table("req_best_clo").select("requirement_id", count="exact").limit(1).execute()
already = res.count or 0
print(f"[info] req_best_clo already has {already} rows")

# Total requirements to process
res = sb.table("requirements").select("id", count="exact").limit(1).execute()
total = res.count or 0
print(f"[info] total requirements to process: {total}")

# Fetch all requirements ordered by id (stable batching)
# We page through and process each batch via direct SQL execution.
# Since supabase-py can't execute arbitrary SQL, we use a stored helper.

# Alternative: insert one batch at a time by computing sim in Python with embeddings.
# We need to fetch embeddings to compute locally.

import pandas as pd
import numpy as np

# Fetch all clos (id + embedding) — small set
print("[info] fetching all clo embeddings from DB...")
res = sb.table("clos").select("id, embedding").limit(2000).execute()
clo_rows = res.data
clo_ids = [r["id"] for r in clo_rows]
clo_embs = np.array([np.array(r["embedding"], dtype="float32") for r in clo_rows])
# Normalize for cosine sim
clo_norms = clo_embs / np.linalg.norm(clo_embs, axis=1, keepdims=True)
print(f"[info] loaded {len(clo_ids)} CLOs, embedding shape {clo_embs.shape}")

# Fetch requirements in batches
BATCH = 1000
offset = 0
processed = 0
t0 = time.time()
while True:
    page = (
        sb.table("requirements")
        .select("id, job_id, embedding")
        .order("id")
        .range(offset, offset + BATCH - 1)
        .execute()
    )
    rows = page.data
    if not rows:
        break

    # Build numpy array of req embeddings for this batch
    req_ids = [r["id"] for r in rows]
    job_ids = [r["job_id"] for r in rows]
    req_embs = np.array(
        [np.array(r["embedding"], dtype="float32") for r in rows]
    )
    req_norms = req_embs / np.linalg.norm(req_embs, axis=1, keepdims=True)

    # cosine sim = dot product of normalized vectors. shape: (batch, 164)
    sims = req_norms @ clo_norms.T

    # Per requirement: argmax over CLOs
    best_idx = sims.argmax(axis=1)
    best_sims = sims[np.arange(len(rows)), best_idx]
    best_clo_ids = [clo_ids[i] for i in best_idx]

    # Build insert payload
    payload = [
        {
            "requirement_id": req_ids[i],
            "job_id": job_ids[i],
            "best_clo_id": best_clo_ids[i],
            "sim": float(round(best_sims[i], 6)),
        }
        for i in range(len(rows))
    ]
    sb.table("req_best_clo").upsert(payload, on_conflict="requirement_id").execute()

    processed += len(rows)
    elapsed = time.time() - t0
    print(f"[info] processed {processed}/{total} reqs ({elapsed:.1f}s elapsed)")
    offset += BATCH
    if len(rows) < BATCH:
        break

print(f"\n[done] {processed} requirements processed in {time.time() - t0:.1f}s")
