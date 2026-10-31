"""Run migration SQL against Supabase using the pg-meta API endpoint."""
import httpx
import sys
import os

PROJECT_REF = "ipqgpfqmvqviwssgfiwi"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcWdwZnFtdnF2aXdzc2dmaXdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzQzNjA0OCwiZXhwIjoyMTA5MDEyMDQ4fQ.yrinVJsTcVj1YvLjM5REQmzSoct1fam6PJ6QsYBGMTM"

HEADERS = {
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "apikey": SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
}

BASE_URL = f"https://{PROJECT_REF}.supabase.co"

def execute_sql(sql, label=""):
    endpoints = [
        f"{BASE_URL}/pg-meta/default/query",
        f"{BASE_URL}/pg/query",
    ]
    for endpoint in endpoints:
        try:
            print(f"  Trying {endpoint}...")
            resp = httpx.post(
                endpoint,
                headers=HEADERS,
                json={"query": sql},
                timeout=120.0,
            )
            if resp.status_code == 200:
                print(f"  [OK] SUCCESS via {endpoint}")
                return True, resp.text
            elif resp.status_code == 404:
                print(f"  [WARN] 404 - trying next endpoint...")
                continue
            else:
                print(f"  [FAIL] {resp.status_code}: {resp.text[:300]}")
                return False, resp.text
        except Exception as e:
            print(f"  [ERROR] {str(e)[:200]}")
            continue
    return False, "All endpoints failed"

def main():
    print("=" * 60)
    print("SWASTHYA SENSE - Database Migration Runner")
    print("=" * 60)
    
    # Test connectivity
    print("\n1. Testing connectivity...")
    ok, result = execute_sql("SELECT 1 as test;")
    if not ok:
        print(f"\n[FAIL] Cannot connect. Result: {result[:200]}")
        sys.exit(1)
    print("\n[OK] Connected to Supabase!\n")
    
    # Read migration SQL
    base = os.path.dirname(os.path.abspath(__file__))
    mig = os.path.join(base, "supabase", "migrations", "20261031_initial_schema.sql")
    seed = os.path.join(base, "supabase", "seed.sql")
    
    print("2. Running schema migration...")
    with open(mig, "r", encoding="utf-8") as f:
        migration_sql = f.read()
    
    ok, result = execute_sql(migration_sql)
    if ok:
        print("   [OK] Schema migration done!")
    else:
        print(f"   [FAIL] Full migration failed, trying chunks...")
        chunks = split_sql(migration_sql)
        success = 0
        fail = 0
        for i, chunk in enumerate(chunks):
            chunk = chunk.strip()
            if not chunk or chunk.startswith("--"):
                continue
            ok2, res2 = execute_sql(chunk, f"chunk {i+1}")
            if ok2:
                success += 1
            else:
                fail += 1
                print(f"   [FAIL] Chunk {i+1}: {res2[:150]}")
                print(f"   SQL preview: {chunk[:80]}...")
        print(f"\n   Chunks done: {success} OK, {fail} failed")
    
    print("\n3. Running seed data...")
    with open(seed, "r", encoding="utf-8") as f:
        seed_sql = f.read()
    ok, result = execute_sql(seed_sql)
    if ok:
        print("   [OK] Seed data inserted!")
    else:
        print(f"   [FAIL] {result[:200]}")
    
    print("\n4. Verifying tables...")
    ok, result = execute_sql(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;"
    )
    if ok:
        print(f"   Tables found: {result[:600]}")
    
    # Create storage buckets
    print("\n5. Creating storage buckets...")
    for bucket_name, is_public in [("profile-pictures", True), ("medical-documents", False), ("prescriptions", False)]:
        try:
            resp = httpx.post(
                f"{BASE_URL}/storage/v1/bucket",
                headers=HEADERS,
                json={"id": bucket_name, "name": bucket_name, "public": is_public},
                timeout=15.0,
            )
            if resp.status_code in (200, 201):
                print(f"   [OK] Bucket '{bucket_name}' created (public={is_public})")
            elif "already exists" in resp.text.lower() or resp.status_code == 409:
                print(f"   [OK] Bucket '{bucket_name}' already exists")
            else:
                print(f"   [WARN] Bucket '{bucket_name}': {resp.status_code} {resp.text[:100]}")
        except Exception as e:
            print(f"   [ERROR] Bucket '{bucket_name}': {str(e)[:100]}")
    
    print("\n" + "=" * 60)
    print("MIGRATION COMPLETE!")
    print("=" * 60)

def split_sql(sql):
    statements = []
    current = []
    in_block = False
    for line in sql.split("\n"):
        stripped = line.strip()
        if "$$" in stripped and not in_block:
            in_block = True
            current.append(line)
            continue
        if "$$" in stripped and in_block:
            in_block = False
            current.append(line)
            statements.append("\n".join(current))
            current = []
            continue
        current.append(line)
        if not in_block and stripped.endswith(";") and not stripped.startswith("--"):
            statements.append("\n".join(current))
            current = []
    if current:
        r = "\n".join(current).strip()
        if r:
            statements.append(r)
    return statements

if __name__ == "__main__":
    main()
