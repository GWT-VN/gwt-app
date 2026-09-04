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

# --- Khu Kế toán ---
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_ky_list", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn"})
chk("service_role: rpc ke_toan_ky_list (admin)", r.status_code == 200 and r.json() == [], (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_ky_list", headers=h(SVC), json={"p_email": "dev.ketoan@gwt.vn"})
chk("service_role: rpc ke_toan_ky_list (vai ke_toan)", r.status_code == 200, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_ky_list", headers=h(SVC), json={"p_email": "dev.cs@gwt.vn"})
chk("vai cs: ke_toan_ky_list BỊ từ chối", r.status_code >= 400 and "Kế toán" in r.text, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_ky_list", headers=h(ANON), json={"p_email": "dev.admin@gwt.vn"})
chk("anon: rpc ke_toan_ky_list BỊ chặn", r.status_code in (401, 403, 404), r.status_code)
r = requests.get(f"{U}/rest/v1/periods?select=id", headers={**h(SVC), "Accept-Profile": "accounting"})
chk("schema accounting KHÔNG expose (406/404)", r.status_code in (404, 406), r.status_code)
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_ky_tao", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_ky": "2026-08"})
chk("ke_toan_ky_tao 2026-08", r.status_code == 200 and r.json()["ky"] == "2026-08", (r.status_code, r.text[:80]))
ky_id = r.json()["id"] if r.status_code == 200 else None
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_ky_tao", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_ky": "2026-13"})
chk("ke_toan_ky_tao kỳ sai bị từ chối", r.status_code >= 400, r.status_code)
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_nguon_list", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id})
chk("ke_toan_nguon_list kỳ vừa tạo = []", r.status_code == 200 and r.json() == [], (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_nguon_xoa", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_source_id": 0})
chk("ke_toan_nguon_xoa source không tồn tại → deleted 0", r.status_code == 200 and r.json() == {"deleted": 0}, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_luat_list", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn"})
chk("luật đã seed ≥ 500", r.status_code == 200 and len(r.json()) >= 500, (r.status_code, len(r.json()) if r.status_code == 200 else r.text[:80]))
r = requests.get(f"{U}/rest/v1/expense_category?select=ma", headers=h(SVC))
chk("expense_category gương = 24", r.status_code == 200 and len(r.json()) == 24, r.status_code)
r = requests.get(f"{U}/storage/v1/bucket/accounting", headers=h(SVC))
chk("storage: bucket accounting riêng tư", r.status_code == 200 and r.json().get("public") is False, (r.status_code, r.text[:80]))

print("\nALL OK" if ok else "\nCÓ LỖI")
sys.exit(0 if ok else 1)
