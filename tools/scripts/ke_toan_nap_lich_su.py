"""Nạp lịch sử chi phí T1-T6/2026 (SQLite tool Python, bảng expense) vào
accounting.corrections (origin='history') qua RPC public.ke_toan_lich_su_nap.

Chạy TAY một lần: python tools/scripts/ke_toan_nap_lich_su.py [--dry]
Cần apps/web/.env.local (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
--dry: chỉ đếm dòng, KHÔNG gọi RPC, KHÔNG ghi DB.

seller_norm/desc_norm tính bằng engine.norm() (gwt_ketoan/engine.py, dòng 24:
lowercase, bỏ dấu, đ->d, gộp khoảng trắng) — cùng thuật toán với norm() TS ở
apps/web/lib/ke-toan/chuan-hoa.ts, để RPC ke_toan_thong_ke_hoc (tính tiền tố 5
từ đầu bằng string_to_array(desc_norm,' ')[1:5] phía SQL) khớp cách engine TS
tính tiền tố (norm(desc).split(' ').slice(0,5)) trong dau-vao.ts.

Chạy lại (sau khi đã nạp): RPC không dedupe -> nhân đôi dòng. Trước khi chạy
lại phải xoá bằng tay (MCP execute_sql, đã đối chiếu số dòng trước khi xoá):
  delete from accounting.corrections where origin = 'history';
"""
import glob
import os
import sys

import requests

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")  # console Windows mặc định cp1252, in tiếng Việt vỡ

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PKG = glob.glob(os.path.join(ROOT, "data", "ke-toan", "*", "*", "gwt_ketoan"))[0]
sys.path.insert(0, os.path.dirname(PKG))
from gwt_ketoan import engine  # noqa: E402

env = dict(
    l.strip().split("=", 1)
    for l in open(os.path.join(ROOT, "apps", "web", ".env.local"), encoding="utf-8")
    if "=" in l and not l.startswith("#")
)
U, K = env["NEXT_PUBLIC_SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE_KEY"]

con = engine.connect()
rows = [
    {
        "seller_norm": engine.norm(r["ten_doi_tuong"]),
        "desc_norm": engine.norm(r["dien_giai"]),
        "code": (r["ma_kmcp"] or "").strip(),
    }
    for r in con.execute(
        "SELECT ten_doi_tuong, dien_giai, ma_kmcp FROM expense "
        "WHERE ma_kmcp IS NOT NULL AND ma_kmcp <> ''"
    )
]
print("dòng lịch sử:", len(rows))

if "--dry" in sys.argv:
    sys.exit(0)

try:
    r = requests.post(
        f"{U}/rest/v1/rpc/ke_toan_lich_su_nap",
        headers={
            "apikey": K,
            "Authorization": f"Bearer {K}",
            "Content-Type": "application/json",
        },
        json={"p_email": "ai@gwt.vn", "p_rows": rows},
        timeout=120,
    )
except requests.RequestException as e:
    print("Lỗi mạng khi gọi RPC:", type(e).__name__)
    sys.exit(1)

print(r.status_code, r.text[:200])
if r.status_code != 200:
    sys.exit(1)
