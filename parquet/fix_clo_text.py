"""
Fix clos.clo_text — replace verbose full_clo_text with cleaner clo_paraphrase.
Embeddings stay (they were correctly built from paraphrase).
"""
import os
from pathlib import Path
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env.local")

sb = create_client(
    os.environ["NEXT_PUBLIC_SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)

clo_df = pd.read_parquet(ROOT / "parquet" / "clos_encoded.parquet")
print(f"loaded {len(clo_df)} clo rows from parquet")

# Build matkul nama -> uuid map
res = sb.table("matkul").select("id, nama").limit(2000).execute()
matkul_map = {r["nama"]: r["id"] for r in res.data}
print(f"loaded {len(matkul_map)} matkul from db")

updated = 0
missing = 0
for _, r in clo_df.iterrows():
    matkul_uuid = matkul_map.get(r["mata_kuliah"])
    if not matkul_uuid:
        missing += 1
        continue
    sb.table("clos").update({"clo_text": r["clo_paraphrase"]}).eq(
        "matkul_id", matkul_uuid
    ).eq("clo_code", r["clo_code"]).execute()
    updated += 1
    if updated % 50 == 0:
        print(f"  updated {updated}/{len(clo_df)}")

print(f"\ndone. updated={updated}, missing_matkul={missing}")
