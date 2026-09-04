"""Sinh migration seed luật từ data/ke-toan (Excel Rule + overrides.json + name2code.json).
Chạy TAY: python tools/scripts/ke_toan_sinh_luat_sql.py > supabase/migrations/20260904040100_ke_toan_01_luat_seed.sql
Không PII: chỉ tên công ty, từ khoá, tên hàng. Cột "Ngoại lệ"/"Điều kiện tách mã" của Excel có tên
cá nhân → bị lược bằng regex họ tên VN. Cột "Nhà cung cấp" ghi thẳng tên cá nhân (nhãn "(cá nhân)")
→ bị che bằng chỉ số dòng, xem CA_NHAN bên dưới.
"""
import glob, json, os, re, sys, warnings
warnings.filterwarnings("ignore")
import openpyxl
sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PKG = glob.glob(os.path.join(ROOT, "data", "ke-toan", "*", "*", "gwt_ketoan"))[0]
sys.path.insert(0, os.path.dirname(PKG))
from gwt_ketoan import engine, nexia  # noqa: E402

XLSX = glob.glob(os.path.join(ROOT, "data", "ke-toan", "**", "GWT_Rule phan bo chi phi.xlsx"), recursive=True)[0]
OV = json.load(open(os.path.join(PKG, "overrides.json"), encoding="utf-8"))
N2C = json.load(open(os.path.join(PKG, "ref", "name2code.json"), encoding="utf-8"))
TEN_NGUOI = re.compile(r"\(?(Nguyễn|Trần|Lê|Phạm|Hoàng|Huỳnh|Phan|Vũ|Võ|Đặng|Bùi|Đỗ|Hồ|Ngô|Dương|Lý)\s+[^)\n,;·]+\)?")
# NCC cá nhân (không phải công ty) — cột "Nhà cung cấp" đôi khi ghi thẳng tên người + nhãn "(cá nhân)".
# rà tay 04/09: 2/66 dòng "2.Rule theo NCC" dạng này (Thiều Hữu Long, NGUYỄN THỊ THÚY QÙYNH) — che tên,
# giữ nhãn để không đổi ý nghĩa rule; rule mất khả năng khớp NCC thật, cần accountant nhập lại qua app.
CA_NHAN = re.compile(r"^.*\((c[áa]\s*nh[âa]n)\)\s*$", re.I)


def q(s):
    return "null" if s is None or s == "" else "'" + str(s).replace("'", "''") + "'"


rows = []  # (kind, pattern, target, condition, priority, origin)
for i, (k, v) in enumerate(OV["supplier_kmcp"].items()):
    rows.append(("supplier", engine.norm(k), v, None, i, "override_json"))
for i, (k, v) in enumerate(OV["keyword_kmcp"].items()):
    rows.append(("keyword", engine.norm(k), v, None, i, "override_json"))
for i, (k, v) in enumerate(OV["product_name_code"].items()):
    rows.append(("product_name", nexia.sd(k), v, None, i, "override_json"))

wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)


def bang(ten, *must):
    ws = wb[ten]
    data = [list(r) for r in ws.iter_rows(values_only=True)]
    hi = next(i for i, r in enumerate(data) if r and all(any(x and m in str(x) for x in r) for m in must))
    hdr = [str(x).strip() if x else "" for x in data[hi]]
    return [dict(zip(hdr, r)) for r in data[hi + 1:] if r and any(r)]


for i, r in enumerate(bang("2.Rule theo NCC", "Nhà cung cấp", "Mã mặc định")):
    ncc, ma = r.get("Nhà cung cấp / Tên đối tượng"), r.get("Mã mặc định")
    if not ncc or not ma:
        continue
    dk = TEN_NGUOI.sub("", str(r.get("Điều kiện tách mã") or "")).strip() or None
    if CA_NHAN.match(str(ncc)):
        ncc = f"ncc ca nhan {i} (che ten — nhap lai qua app)"
    rows.append(("supplier", engine.norm(ncc), str(ma).strip(), dk, i, "rule_excel"))

for i, r in enumerate(bang("1.Rule theo loai GD", "Mã KMCP", "Từ khoá")):
    ma = r.get("Mã KMCP")
    if not ma:
        continue
    tk = next((v for k, v in r.items() if k.startswith("Từ khoá")), "")
    nl = next((v for k, v in r.items() if k.startswith("Ngoại lệ")), "")
    nl = TEN_NGUOI.sub("", str(nl or "")).strip()
    nl = None if nl in ("", "—", "-") else nl
    for j, ph in enumerate(engine._keyword_phrases(str(tk or ""))):
        rows.append(("keyword", ph, str(ma).strip(), nl, i * 100 + j, "rule_excel"))

for i, (k, v) in enumerate(N2C.items()):
    rows.append(("product_name", nexia.sd(k), v, None, i, "history"))

print("-- ke_toan_01_luat_seed — SINH BẰNG tools/scripts/ke_toan_sinh_luat_sql.py, KHÔNG sửa tay.")
print("-- Cách lùi nếu hỏng: delete from accounting.rules where origin in ('override_json','rule_excel','history');")
print("insert into accounting.rules (kind, pattern, target_code, condition, priority, origin) values")
print(",\n".join(f"  ({q(k)}, {q(p)}, {q(t)}, {q(c)}, {pr}, {q(o)})" for k, p, t, c, pr, o in rows) + ";")
print(f"-- tổng {len(rows)} luật", file=sys.stderr)
