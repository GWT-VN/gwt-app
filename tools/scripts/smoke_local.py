"""Smoke test DB LOCAL sau `npx supabase db reset` cho gwt-app. Chạy local hoặc trên CI db-reset.
Đọc key từ `npx supabase status -o json`. Phải in "ALL OK" (exit 1 khi lỗi → CI đỏ).
Khu mới thêm phép thử vào cuối file, KHÔNG sửa phép thử của khu khác.
"""
import json, subprocess, sys
import requests

sys.stdout.reconfigure(encoding="utf-8")
U = "http://127.0.0.1:54321"
raw = subprocess.run("npx supabase@2 status -o json", capture_output=True, text=True, shell=True).stdout
st = json.loads(raw[raw.index("{"):])
ANON, SVC = st["ANON_KEY"], st["SERVICE_ROLE_KEY"]
ok = True


def chk(name, cond, extra=""):
    global ok
    ok &= bool(cond)
    print(("✓" if cond else "✗"), name, extra)


def h(key, **more):
    return {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json", **more}


# --- Nền tảng: seed staff, RLS ---
r = requests.get(f"{U}/rest/v1/staff?select=email&email=eq.dev.admin@gwt.vn", headers=h(SVC))
chk("service_role: staff có dev.admin", r.status_code == 200 and len(r.json()) == 1, r.status_code)
r = requests.get(f"{U}/rest/v1/staff?select=email", headers=h(ANON))
chk("anon: staff bị chặn", r.status_code in (401, 403) or r.json() == [], r.status_code)
r = requests.post(f"{U}/rest/v1/rpc/work_viec_cua_toi", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn"})
chk("service_role: rpc work_viec_cua_toi", r.status_code == 200, (r.status_code, r.text[:80]))

# --- Khu Kế toán: thêm ở Task 8 ---

print("\nALL OK" if ok else "\nCÓ LỖI")
sys.exit(0 if ok else 1)
