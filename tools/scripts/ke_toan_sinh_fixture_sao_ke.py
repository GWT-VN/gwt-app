"""Sinh fixture sao kê VCB đã che PII: apps/web/lib/ke-toan/__fixtures__/vcb63-t8.json = { rows: string[][] } toàn bộ ô sheet (kể cả phần đầu),
che: số tài khoản/CIF/số bút toán ≥7 số → '#', SĐT 10 số → 0900000nnn ổn định, tên người trong nội dung giữ nguyên chữ HOA của công ty,
tên cá nhân (dòng luong/freelancer/thanh toan <Tên>) → 'KH-n'. Giữ số tiền, ngày, số chứng từ ngắn, mã lệnh. Chạy: python tools/scripts/ke_toan_sinh_fixture_sao_ke.py"""
import glob, json, os, re, sys, xlrd
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = glob.glob(os.path.join(ROOT, "data", "ke-toan", "B*", "B*", "Sao k*", "2026.08", "Sao kê VCB63.xls"))[0]
OUT = os.path.join(ROOT, "apps", "web", "lib", "ke-toan", "__fixtures__", "vcb63-t8.json")
sdt, ten = {}, {}
def che(s):
    s = str(s)
    s = re.sub(r"(?<!\d)(0\d{9})(?!\d)", lambda m: sdt.setdefault(m.group(1), "0900000%03d" % (len(sdt) + 1)), s)
    s = re.sub(r"\d{7,}", lambda m: "#" * len(m.group(0)), s)
    # tên cá nhân: 2–4 từ viết Hoa Chữ Đầu ngay sau 'thanh toan' / 'Freelancer' → KH-n (công ty viết HOA toàn bộ giữ nguyên)
    s = re.sub(r"((?:thanh toan|Freelancer)\s+)((?:[A-Z][a-z]+\s){1,3}[A-Z][a-z]+)", lambda m: m.group(1) + ten.setdefault(m.group(2), "KH-%d" % (len(ten) + 1)), s)
    return s
ws = xlrd.open_workbook(SRC).sheet_by_index(0)
rows = [[che(ws.cell_value(r, c)) if ws.cell_value(r, c) != "" else "" for c in range(ws.ncols)] for r in range(ws.nrows)]
for r in rows[:13]:  # phần đầu: che chủ TK/địa chỉ/CIF; giữ nhãn, ngày, số dư đầu kỳ
    for i, v in enumerate(r):
        if i == 2 and v and not re.match(r"^[\d,]+ VND$|^\d\d/\d\d/\d{4}$|^(VND|Tài khoản)", v): r[i] = "CHU TAI KHOAN"
json.dump({"rows": rows}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print(OUT, len(rows), "hàng")
