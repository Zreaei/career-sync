"""
Seed Supabase database from encoded parquet files.

Loads requirements + CLO embeddings from parquet (768/1024-dim from custom
transformer), and inserts:
  - companies (deduped from requirements.company)
  - matkul    (deduped from clos.mata_kuliah, kode generated from slug)
  - jobs      (one per unique requirements.job_id, hr_id NULL)
  - requirements (with embedding vector)
  - clos      (with embedding vector)

Idempotent: each step checks count first and skips if already populated.
"""

import os
import re
import sys
import time
import unicodedata
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PARQUET_DIR = PROJECT_ROOT / "parquet"
REQ_FILE = PARQUET_DIR / "requirements_encoded.parquet"
CLO_FILE = PARQUET_DIR / "clos_encoded.parquet"

# Batch sizes — tuned for 1024-dim vectors (~10 KB serialized per row)
COMPANY_BATCH = 500
MATKUL_BATCH = 500
JOB_BATCH = 500
REQ_BATCH = 200   # ~2 MB / batch with embedding
CLO_BATCH = 100


def log(msg: str) -> None:
    print(f"[seed] {msg}", flush=True)


def slugify_kode(nama: str, used: set[str]) -> str:
    """Generate a unique short kode from matkul name (max 12 chars)."""
    ascii_name = unicodedata.normalize("NFKD", nama).encode("ascii", "ignore").decode()
    words = re.findall(r"[A-Za-z0-9]+", ascii_name)
    if not words:
        base = "MK"
    elif len(words) == 1:
        base = words[0][:6].upper()
    else:
        base = "".join(w[0].upper() for w in words)[:6]
    # ensure uniqueness
    kode = base
    n = 1
    while kode in used:
        n += 1
        kode = f"{base}{n}"
    used.add(kode)
    return kode


def get_client() -> Client:
    load_dotenv(PROJECT_ROOT / ".env.local")
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        log("ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local")
        sys.exit(1)
    return create_client(url, key)


def count_rows(sb: Client, table: str) -> int:
    res = sb.table(table).select("id", count="exact").limit(1).execute()
    return res.count or 0


def insert_in_batches(sb: Client, table: str, rows: list[dict], batch: int) -> None:
    total = len(rows)
    for start in range(0, total, batch):
        end = min(start + batch, total)
        chunk = rows[start:end]
        attempt = 0
        while True:
            try:
                sb.table(table).insert(chunk).execute()
                break
            except Exception as e:
                attempt += 1
                if attempt > 3:
                    log(f"FATAL: insert {table} [{start}:{end}] failed after 3 retries: {e}")
                    raise
                log(f"  retry {attempt}/3 for {table} [{start}:{end}]: {e}")
                time.sleep(2 * attempt)
        log(f"  {table}: inserted {end}/{total}")


def fetch_all(sb: Client, table: str, columns: str) -> list[dict]:
    """Page through a table — supabase-py default limit is 1000."""
    all_rows: list[dict] = []
    page = 0
    page_size = 1000
    while True:
        res = (
            sb.table(table)
            .select(columns)
            .range(page * page_size, (page + 1) * page_size - 1)
            .execute()
        )
        rows = res.data or []
        all_rows.extend(rows)
        if len(rows) < page_size:
            break
        page += 1
    return all_rows


def seed_companies(sb: Client, req_df: pd.DataFrame) -> dict[str, str]:
    """Dedupe companies (case-insensitive trim), insert, return {normalized_name: uuid}."""
    existing = count_rows(sb, "companies")
    if existing > 0:
        log(f"companies: {existing} rows already exist, loading existing mapping")
        rows = fetch_all(sb, "companies", "id, name")
        return {row["name"].strip().lower(): row["id"] for row in rows}

    names = (
        req_df["company"]
        .dropna()
        .str.strip()
        .loc[lambda s: s.str.len() > 0]
        .drop_duplicates()
    )
    log(f"companies: {len(names)} unique to insert")
    rows = [{"name": n} for n in names]
    insert_in_batches(sb, "companies", rows, COMPANY_BATCH)

    fetched = fetch_all(sb, "companies", "id, name")
    return {row["name"].strip().lower(): row["id"] for row in fetched}


def seed_matkul(sb: Client, clo_df: pd.DataFrame) -> dict[str, str]:
    """Insert unique mata_kuliah, return {nama: uuid}."""
    existing = count_rows(sb, "matkul")
    if existing > 0:
        log(f"matkul: {existing} rows already exist, loading existing mapping")
        res = sb.table("matkul").select("id, nama").execute()
        return {row["nama"]: row["id"] for row in res.data}

    names = clo_df["mata_kuliah"].drop_duplicates().tolist()
    used: set[str] = set()
    rows = [{"nama": n, "kode": slugify_kode(n, used)} for n in names]
    log(f"matkul: {len(rows)} unique to insert")
    insert_in_batches(sb, "matkul", rows, MATKUL_BATCH)

    res = sb.table("matkul").select("id, nama").execute()
    return {row["nama"]: row["id"] for row in res.data}


def seed_jobs(sb: Client, req_df: pd.DataFrame, company_map: dict[str, str]) -> dict[int, str]:
    """One job per unique csv job_id; return {csv_job_id: jobs.uuid}."""
    existing = count_rows(sb, "jobs")
    if existing > 0:
        log(f"jobs: {existing} rows already exist — assuming seed already done. Loading mapping…")
        # We need to associate csv_job_id with jobs.uuid. Use title+location as proxy.
        # Better: re-derive from existing jobs row order. For now, abort if jobs already exist.
        log("  jobs already populated — refusing to re-seed (may corrupt FKs). Skipping.")
        return {}

    # Take first row per job_id
    first = req_df.groupby("job_id", sort=False).first().reset_index()
    log(f"jobs: {len(first)} unique to insert")

    rows = []
    for _, r in first.iterrows():
        company_id = None
        if isinstance(r["company"], str) and r["company"].strip():
            company_id = company_map.get(r["company"].strip().lower())
        rows.append({
            "title": r["title"] or "(Tanpa Judul)",
            "location": r["location"],
            "company_id": company_id,
            "hr_id": None,
            "status": "active",
        })

    insert_in_batches(sb, "jobs", rows, JOB_BATCH)

    # Build mapping by re-reading jobs in insertion order via title+location match.
    # Safer: use a returning-style query — but supabase-py insert returns inserted rows.
    # Redo as single batch loop capturing returned ids.
    return {}  # We'll use a different approach: insert with return below.


def seed_jobs_with_mapping(
    sb: Client, req_df: pd.DataFrame, company_map: dict[str, str]
) -> dict[int, str]:
    """One job per unique csv job_id; capture returned uuid per csv_job_id."""
    existing = count_rows(sb, "jobs")
    if existing > 0:
        log(f"jobs: {existing} rows already exist — skipping insert.")
        log("  Cannot rebuild csv_job_id → uuid mapping from DB alone.")
        log("  If you need to re-seed requirements, TRUNCATE jobs and re-run.")
        sys.exit(1)

    first = req_df.groupby("job_id", sort=False).first().reset_index()
    log(f"jobs: {len(first)} unique to insert")

    mapping: dict[int, str] = {}
    total = len(first)
    for start in range(0, total, JOB_BATCH):
        end = min(start + JOB_BATCH, total)
        chunk = first.iloc[start:end]
        rows = []
        csv_ids = []
        for _, r in chunk.iterrows():
            company_id = None
            if isinstance(r["company"], str) and r["company"].strip():
                company_id = company_map.get(r["company"].strip().lower())
            rows.append({
                "title": r["title"] or "(Tanpa Judul)",
                "location": r["location"],
                "company_id": company_id,
                "hr_id": None,
                "status": "active",
            })
            csv_ids.append(int(r["job_id"]))

        attempt = 0
        while True:
            try:
                res = sb.table("jobs").insert(rows).execute()
                break
            except Exception as e:
                attempt += 1
                if attempt > 3:
                    raise
                log(f"  retry {attempt}/3 for jobs [{start}:{end}]: {e}")
                time.sleep(2 * attempt)

        for csv_id, returned in zip(csv_ids, res.data):
            mapping[csv_id] = returned["id"]
        log(f"  jobs: inserted {end}/{total}")

    return mapping


def seed_requirements(sb: Client, req_df: pd.DataFrame, job_map: dict[int, str]) -> None:
    existing = count_rows(sb, "requirements")
    if existing > 0:
        log(f"requirements: {existing} already exist — skipping.")
        return

    log(f"requirements: {len(req_df)} rows to insert (batched {REQ_BATCH})")
    rows = []
    skipped = 0
    for _, r in req_df.iterrows():
        job_uuid = job_map.get(int(r["job_id"]))
        if not job_uuid:
            skipped += 1
            continue
        rows.append({
            "job_id": job_uuid,
            "req_text": r["req_text"],
            "position": int(r["req_position"]),
            "embedding": list(r["embedding"]),
        })
    if skipped:
        log(f"  skipped {skipped} rows with unmapped job_id")

    insert_in_batches(sb, "requirements", rows, REQ_BATCH)


def seed_clos(sb: Client, clo_df: pd.DataFrame, matkul_map: dict[str, str]) -> None:
    existing = count_rows(sb, "clos")
    if existing > 0:
        log(f"clos: {existing} already exist — skipping.")
        return

    rows = []
    for _, r in clo_df.iterrows():
        matkul_uuid = matkul_map.get(r["mata_kuliah"])
        if not matkul_uuid:
            continue
        rows.append({
            "matkul_id": matkul_uuid,
            "clo_code": r["clo_code"],
            "clo_text": r["clo_paraphrase"],  # paraphrase is cleaner for UI display
            "embedding": list(r["embedding"]),  # embedding was also encoded from paraphrase
        })
    log(f"clos: {len(rows)} rows to insert")
    insert_in_batches(sb, "clos", rows, CLO_BATCH)


def main() -> None:
    sb = get_client()

    log("loading parquet files…")
    req_df = pd.read_parquet(REQ_FILE)
    clo_df = pd.read_parquet(CLO_FILE)
    log(f"  requirements: {len(req_df)} rows, {req_df['job_id'].nunique()} unique jobs")
    log(f"  clos: {len(clo_df)} rows, {clo_df['mata_kuliah'].nunique()} unique matkul")

    t0 = time.time()

    log("\n-- step 1: companies")
    company_map = seed_companies(sb, req_df)
    log(f"  → {len(company_map)} companies in DB")

    log("\n-- step 2: matkul")
    matkul_map = seed_matkul(sb, clo_df)
    log(f"  → {len(matkul_map)} matkul in DB")

    log("\n-- step 3: jobs")
    job_map = seed_jobs_with_mapping(sb, req_df, company_map)
    log(f"  → {len(job_map)} jobs inserted")

    log("\n-- step 4: requirements (with embeddings)")
    seed_requirements(sb, req_df, job_map)

    log("\n-- step 5: clos (with embeddings)")
    seed_clos(sb, clo_df, matkul_map)

    log(f"\ndone in {time.time() - t0:.1f}s")

    log("\n-- verifying counts")
    for tbl in ["companies", "matkul", "jobs", "requirements", "clos"]:
        log(f"  {tbl}: {count_rows(sb, tbl)} rows")


if __name__ == "__main__":
    main()
