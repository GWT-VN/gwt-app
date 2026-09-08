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
# ke_toan_dong_nhap đi QUA PostgREST (role authenticator nạp safeupdate trên Supabase → UPDATE/DELETE
# không WHERE bị chặn; lỗi thật 07/09/2026 "UPDATE requires a WHERE clause" ở lô đầu tiên). Gọi RPC
# bằng HTTP như app, không gọi psql, để bắt đúng lớp lỗi này. 2 dòng cùng line_key → dedupe trong lô.
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_nguon_them", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id,
    "p_kind": "nexia", "p_file_name": "smoke.xlsx", "p_storage_path": "2026-08/smoke.xlsx", "p_headers": {"vao": ["A"]}, "p_row_count": 2})
chk("ke_toan_nguon_them (smoke)", r.status_code == 200 and "id" in r.json(), (r.status_code, r.text[:80]))
src_id = r.json()["id"] if r.status_code == 200 else None
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_nguon_list", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id})
chk("ke_toan_nguon_list có storage_path (migration 06)", r.status_code == 200 and r.json() and r.json()[0].get("storage_path") == "2026-08/smoke.xlsx", (r.status_code, r.text[:120]))
dong = [{"direction": "vao", "line_key": "smoke-k1", "row_order": i, "raw": ["x"], "period_id": 0, "first_source_id": 0} for i in (1, 2)]
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_dong_nhap", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id, "p_source_id": src_id, "p_rows": dong})
chk("ke_toan_dong_nhap qua PostgREST: 2 dòng trùng khoá → inserted 1, kept 1", r.status_code == 200 and r.json() == {"inserted": 1, "updated": 0, "kept": 1}, (r.status_code, r.text[:120]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_dong_nhap", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id, "p_source_id": src_id, "p_rows": dong})
chk("ke_toan_dong_nhap lần 2 → updated 1, kept 1", r.status_code == 200 and r.json() == {"inserted": 0, "updated": 1, "kept": 1}, (r.status_code, r.text[:120]))
# Upload LẠI file đã sửa (migration 07): source 2 chỉ còn dòng k2 → chốt → k1 bị đánh "không còn trong file
# mới nhất"; k1 quay lại ở lô sau với row_order mới → UPDATE phải cập nhật row_order + bỏ cờ thiếu.
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_nguon_chot", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_source_id": src_id})
chk("ke_toan_nguon_chot source 1: mọi dòng đều của nó → missing 0", r.status_code == 200 and r.json() == {"missing": 0}, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_nguon_them", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id,
    "p_kind": "nexia", "p_file_name": "smoke2.xlsx", "p_storage_path": "2026-08/smoke2.xlsx", "p_headers": {"vao": ["A"]}, "p_row_count": 1})
src2 = r.json()["id"] if r.status_code == 200 else None
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_dong_nhap", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id, "p_source_id": src2,
    "p_rows": [{"direction": "vao", "line_key": "smoke-k2", "row_order": 1, "raw": ["y"]}]})
chk("upload lại: dòng mới k2 inserted 1", r.status_code == 200 and r.json() == {"inserted": 1, "updated": 0, "kept": 0}, (r.status_code, r.text[:120]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_nguon_chot", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_source_id": src2})
chk("ke_toan_nguon_chot source 2: k1 không còn → missing 1", r.status_code == 200 and r.json() == {"missing": 1}, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_dong_list", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id, "p_direction": "vao"})
co = {d["line_key"]: d for d in (r.json() if r.status_code == 200 else [])}
chk("dong_list: k1 missing_in_last_upload=true, k2=false", co.get("smoke-k1", {}).get("missing_in_last_upload") is True and co.get("smoke-k2", {}).get("missing_in_last_upload") is False, (r.status_code, {k: v.get("missing_in_last_upload") for k, v in co.items()}))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_dong_nhap", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id, "p_source_id": src2,
    "p_rows": [{"direction": "vao", "line_key": "smoke-k1", "row_order": 7, "raw": ["x2"]}]})
chk("k1 quay lại với row_order 7 → updated 1", r.status_code == 200 and r.json() == {"inserted": 0, "updated": 1, "kept": 0}, (r.status_code, r.text[:120]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_dong_list", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id, "p_direction": "vao"})
co = {d["line_key"]: d for d in (r.json() if r.status_code == 200 else [])}
chk("dong_list: k1 row_order=7 (migration 07) và hết cờ thiếu", co.get("smoke-k1", {}).get("row_order") == 7 and co.get("smoke-k1", {}).get("missing_in_last_upload") is False, (r.status_code, co.get("smoke-k1", {}).get("row_order"), co.get("smoke-k1", {}).get("missing_in_last_upload")))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_nguon_xoa", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_source_id": src_id})
chk("ke_toan_nguon_xoa source ĐANG có dòng → deleted 0", r.status_code == 200 and r.json() == {"deleted": 0}, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_nguon_xoa", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_source_id": 0})
chk("ke_toan_nguon_xoa source không tồn tại → deleted 0", r.status_code == 200 and r.json() == {"deleted": 0}, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_luat_list", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn"})
chk("luật đã seed ≥ 500", r.status_code == 200 and len(r.json()) >= 500, (r.status_code, len(r.json()) if r.status_code == 200 else r.text[:80]))
r = requests.get(f"{U}/rest/v1/expense_category?select=ma", headers=h(SVC))
chk("expense_category gương = 24", r.status_code == 200 and len(r.json()) == 24, r.status_code)
r = requests.get(f"{U}/storage/v1/bucket/accounting", headers=h(SVC))
chk("storage: bucket accounting riêng tư", r.status_code == 200 and r.json().get("public") is False, (r.status_code, r.text[:80]))

# --- Khu Wiki ingest (migration wiki_00) — mọi RPC đi qua PostgREST như app ---
ITEM = lambda mid, khu="sales": {"message_id": mid, "thread_id": None, "cau_hoi": "Lõi CTD50 ở đâu?", "tra_loi": "Trên cùng, dưới nắp.",
    "nguoi_tra_loi": "Smoke", "tra_loi_luc": "2026-09-07T03:10:00Z", "jump_link": "https://discord.com/channels/1/2/" + mid, "nguon_ids": [mid], "khu_goi_y": khu, "do_tin_cay": 0.9}
r = requests.post(f"{U}/rest/v1/rpc/wiki_ingest_nhan", headers=h(SVC), json={"p_kenh_id": "kenh-smoke", "p_items": [ITEM("100"), ITEM("100"), ITEM("101", "san-pham")]})
chk("wiki_ingest_nhan: 3 item (1 trùng) → them 2, bo_qua 1", r.status_code == 200 and r.json() == {"them": 2, "bo_qua": 1}, (r.status_code, r.text[:120]))
r = requests.post(f"{U}/rest/v1/rpc/wiki_ingest_nhan", headers=h(ANON), json={"p_kenh_id": "kenh-smoke", "p_items": []})
chk("anon: wiki_ingest_nhan BỊ chặn", r.status_code in (401, 403, 404), r.status_code)
r = requests.post(f"{U}/rest/v1/rpc/wiki_watermark_set", headers=h(SVC), json={"p_kenh_id": "kenh-smoke", "p_message_id": "101"})
r = requests.post(f"{U}/rest/v1/rpc/wiki_watermark_get", headers=h(SVC), json={})
chk("wiki_watermark set/get", r.status_code == 200 and r.json().get("kenh-smoke") == "101", (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/wiki_ingest_run_ghi", headers=h(SVC), json={"p_kenh_id": "kenh-smoke", "p_received": 3, "p_inserted": 2, "p_skipped": 1, "p_rejected": 0})
chk("wiki_ingest_run_ghi", r.status_code == 200 and "id" in r.json(), (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/wiki_de_xuat_list", headers=h(SVC), json={"p_email": "dev.cs@gwt.vn", "p_status": "pending"})
chk("vai cs: wiki_de_xuat_list BỊ từ chối", r.status_code >= 400 and "duyệt" in r.text, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/wiki_de_xuat_list", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_status": "pending"})
ds = r.json() if r.status_code == 200 else []
chk("admin: wiki_de_xuat_list pending = 2", r.status_code == 200 and len(ds) == 2, (r.status_code, r.text[:120]))
sp = next((d for d in ds if d["message_id"] == "101"), {}); sl = next((d for d in ds if d["message_id"] == "100"), {})
chk("item khu_goi_y=san-pham → khu san-pham + can_pkb", sp.get("khu") == "san-pham" and sp.get("can_pkb") is True, sp)
r = requests.post(f"{U}/rest/v1/rpc/wiki_de_xuat_duyet", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_id": sl.get("id")})
chk("duyệt khi chưa tick PII → lỗi", r.status_code >= 400 and "PII" in r.text, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/wiki_de_xuat_sua", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_id": sl.get("id"), "p_question": "Lõi CTD50 nằm đâu?", "p_answer": "Trên cùng.", "p_khu": "cskh", "p_pii_checked": True})
chk("wiki_de_xuat_sua (đổi khu cskh, tick PII)", r.status_code == 200 and r.json().get("ok") is True, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/wiki_de_xuat_duyet", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_id": sl.get("id")})
chk("duyệt sau khi tick PII → ok", r.status_code == 200 and r.json().get("ok") is True, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/wiki_de_xuat_duyet", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_id": sl.get("id")})
chk("duyệt lần 2 → lỗi (chỉ pending)", r.status_code >= 400, r.status_code)
r = requests.post(f"{U}/rest/v1/rpc/wiki_de_xuat_duyet", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_id": sp.get("id")})
chk("duyệt item sản phẩm → lỗi (can_pkb)", r.status_code >= 400 and "PKB" in r.text, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/wiki_hoi_dap", headers=h(SVC), json={"p_email": "dev.cs@gwt.vn", "p_khu": "cskh"})
chk("wiki_hoi_dap('cskh') cho vai cs = 1 (đã duyệt)", r.status_code == 200 and len(r.json()) == 1 and r.json()[0]["question"] == "Lõi CTD50 nằm đâu?", (r.status_code, r.text[:120]))
r = requests.post(f"{U}/rest/v1/rpc/wiki_de_xuat_dem", headers=h(SVC), json={"p_email": "dev.cs@gwt.vn"})
chk("wiki_de_xuat_dem = 1 (còn item sản phẩm)", r.status_code == 200 and r.json() == {"pending": 1}, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/wiki_de_xuat_tu_choi", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_id": sl.get("id"), "p_ly_do": "trùng"})
chk("từ chối item đã duyệt (gỡ publish) → ok", r.status_code == 200 and r.json().get("ok") is True, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/wiki_hoi_dap", headers=h(SVC), json={"p_email": "dev.cs@gwt.vn", "p_khu": "cskh"})
chk("wiki_hoi_dap('cskh') sau gỡ = 0", r.status_code == 200 and r.json() == [], (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/wiki_lan_quet", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn"})
chk("wiki_lan_quet có kenh-smoke + run", r.status_code == 200 and r.json() and r.json()[0]["channel_id"] == "kenh-smoke" and r.json()[0]["run"]["inserted"] == 2, (r.status_code, r.text[:160]))


print("\nALL OK" if ok else "\nCÓ LỖI")
sys.exit(0 if ok else 1)
