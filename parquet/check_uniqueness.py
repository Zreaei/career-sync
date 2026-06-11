import pandas as pd
df = pd.read_parquet("parquet/requirements_encoded.parquet")
first = df.groupby("job_id", sort=False).first().reset_index()
print(f"unique job_id: {len(first)}")
# How many duplicates by (title, location)?
dupes = first.groupby(["title", "location"]).size()
multi = dupes[dupes > 1]
print(f"(title, location) pairs that map to multiple jobs: {len(multi)}")
print(f"jobs affected: {multi.sum()}")
print(f"\ntop 10 collisions:")
print(multi.sort_values(ascending=False).head(10))

# Try with company added
print("\n--- with company ---")
dupes2 = first.groupby(["title", "location", "company"], dropna=False).size()
multi2 = dupes2[dupes2 > 1]
print(f"(title, location, company) collisions: {len(multi2)}, jobs affected: {multi2.sum()}")
