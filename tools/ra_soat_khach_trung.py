#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ra_soat_khach_trung.py — rà khách nghi trùng giữa/ trong hai bảng khách, một lượt.

BỐI CẢNH (đo prod 26/08/2026, đừng tin tiền đề cũ trong backlog):
  • public.customers    (Sales) 400 dòng · public.cs_customers (CSKH) 432 dòng
  • SĐT trùng trong cùng bảng: **0** — đã có ràng buộc chặn trùng SĐT
  • 144 cặp CSKH↔Sales khớp nhau bằng SĐT  → nối được bằng SQL, KHÔNG cần AI
  • ~47 cặp cùng tên nhưng khác/thiếu SĐT  → chỗ duy nhất cần phán đoán
  ⇒ Vì vậy đây là script chạy MỘT LƯỢT, không phải tính năng trong sản phẩm.

BA LUẬT PII (xem docs/QUY-TRINH-CLAUDE.md §7.3) — script này tuân thủ cả ba:
  1. Chỉ ĐỀ XUẤT. Không ghi một chữ nào vào DB. Kết quả là file để người tick.
  2. Che trước khi gửi: gửi TÊN (bắt buộc, đó là việc cần phán đoán) + **3 số cuối**
     SĐT + tỉnh. KHÔNG gửi số điện thoại đầy đủ, KHÔNG gửi địa chỉ, email, MST.
  3. Ghi lại: file kết quả kèm đúng phần đã gửi đi, để sau còn truy được.

Dùng `claude -p` (gói subscription trên máy CEO) chứ không dùng API key: đây là
một lượt phân tích nội bộ do người chạy tay, không phải tính năng phục vụ nhân viên.

DÙNG:
    .venv/bin/python tools/ra_soat_khach_trung.py            # chạy thật
    .venv/bin/python tools/ra_soat_khach_trung.py --khong-goi-claude   # chỉ liệt kê cặp
    .venv/bin/python tools/ra_soat_khach_trung.py --ra <file.md>

Kết quả: data/ra-soat-khach-trung-<ngày>.md  (data/ đã gitignore — CÓ PII, không commit)
"""
import argparse
import json
import os
import re
import subprocess
import sys
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime
from pathlib import Path

GOC = Path(__file__).resolve().parent.parent


def _kho_chinh() -> Path:
    """Thư mục kho git CHÍNH (không phải worktree).

    File .env.local.prod bị gitignore nên worktree mới tạo KHÔNG có nó — chỉ kho
    chính mới có. Không tìm sang đó thì script chạy từ worktree luôn báo thiếu env.
    """
    try:
        chung = subprocess.run(["git", "rev-parse", "--git-common-dir"], cwd=GOC,
                               capture_output=True, text=True).stdout.strip()
        if chung:
            return (GOC / chung).resolve().parent
    except Exception:
        pass
    return GOC


def _duong_dan_env() -> Path:
    for goc in (GOC, _kho_chinh()):
        dd = goc / "apps" / "web" / ".env.local.prod"
        if dd.exists():
            return dd
    return GOC / "apps" / "web" / ".env.local.prod"
NHOM_GIU_CHO_TOI_THIEU = 20   # nhóm cùng tên đông hơn mức này = tên giữ chỗ, không phải trùng


# ── chuẩn hoá ────────────────────────────────────────────────────────────────
def bo_dau(s: str) -> str:
    s = (s or "").replace("Đ", "D").replace("đ", "d")
    s = unicodedata.normalize("NFD", s)
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def ten_chuan(s: str) -> str:
    return re.sub(r"\s+", " ", bo_dau(s).lower()).strip()


def sdt_chuan(s: str) -> str:
    """Về dạng so sánh được: bỏ ký tự không phải số, gỡ 84/0 ở đầu."""
    d = re.sub(r"\D", "", s or "")
    if d.startswith("84"):
        d = d[2:]
    return d.lstrip("0")


# ── lấy dữ liệu ──────────────────────────────────────────────────────────────
def doc_env() -> tuple:
    env_prod = _duong_dan_env()
    if not env_prod.exists():
        loi(f"Không thấy {env_prod} (cũng không có ở kho chính)")
    bien = {}
    for dong in env_prod.read_text(encoding="utf-8").splitlines():
        if "=" in dong and not dong.strip().startswith("#"):
            k, _, v = dong.partition("=")
            bien[k.strip()] = v.strip().strip('"').strip("'")
    url = bien.get("NEXT_PUBLIC_SUPABASE_URL")
    khoa = bien.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not khoa:
        loi("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local.prod")
    return url, khoa


def lay_bang(url: str, khoa: str, ten_bang: str, cot: str) -> list:
    """Gọi thẳng PostgREST bằng thư viện chuẩn — KHÔNG dùng gói `supabase`.

    Vì sao không dùng gói đó: gốc repo có thư mục `supabase/` (Supabase CLI). Chạy
    script từ gốc repo thì Python coi ./supabase/ là namespace package và che mất thư
    viện. Tệ hơn: `import supabase` vẫn "thành công" (bắt trúng thư mục), nên tưởng
    đã cài trong khi chưa. Dùng urllib thì không có cửa cho loại lỗi đó.
    """
    ra, buoc, tat = [], 1000, 0
    while True:
        q = f"{url.rstrip('/')}/rest/v1/{ten_bang}?select={urllib.parse.quote(cot)}" \
            f"&limit={buoc}&offset={tat}"
        req = urllib.request.Request(q, headers={
            "apikey": khoa, "Authorization": f"Bearer {khoa}", "Accept": "application/json",
        })
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                lo = json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            loi(f"PostgREST trả {e.code} cho bảng {ten_bang}: {e.read().decode('utf-8')[:300]}")
        except urllib.error.URLError as e:
            loi(f"Không nối được tới Supabase: {e.reason}")
        ra += lo
        if len(lo) < buoc:
            return ra
        tat += buoc


def lay_du_lieu() -> list:
    url, khoa = doc_env()

    ho_so = []
    for d in lay_bang(url, khoa, "customers",
                      "id,ma_kh,customer_code,name,phone,phone_chuan,province_moi,"
                      "total_orders,first_order_date,last_order_date"):
        ho_so.append({
            "nguon": "sales", "id": d["id"], "ma": d.get("ma_kh") or d.get("customer_code"),
            "ten_goc": d.get("name") or "", "sdt": sdt_chuan(d.get("phone_chuan") or d.get("phone")),
            "tinh": d.get("province_moi") or "", "don": d.get("total_orders") or 0,
            "lan_dau": d.get("first_order_date"), "lan_cuoi": d.get("last_order_date"),
        })
    for d in lay_bang(url, khoa, "cs_customers",
                      "id,ma_kh,customer_code,full_name,primary_phone,province,created_at"):
        ho_so.append({
            "nguon": "cskh", "id": d["id"], "ma": d.get("ma_kh") or d.get("customer_code"),
            "ten_goc": d.get("full_name") or "", "sdt": sdt_chuan(d.get("primary_phone")),
            "tinh": d.get("province") or "", "don": None,
            "lan_dau": (d.get("created_at") or "")[:10] or None, "lan_cuoi": None,
        })
    for h in ho_so:
        h["ten"] = ten_chuan(h["ten_goc"])
    return ho_so


# ── dựng cặp nghi trùng ──────────────────────────────────────────────────────
def dung_cap(ho_so: list) -> tuple:
    theo_ten = defaultdict(list)
    for h in ho_so:
        if h["ten"]:
            theo_ten[h["ten"]].append(h)

    cap, giu_cho, tu_noi = [], [], 0
    for ten, ds in theo_ten.items():
        if len(ds) < 2:
            continue
        if len(ds) >= NHOM_GIU_CHO_TOI_THIEU and not any(h["sdt"] for h in ds):
            giu_cho.append((ten, len(ds)))     # tên giữ chỗ — báo riêng, không đem đi hỏi
            continue
        for i in range(len(ds)):
            for j in range(i + 1, len(ds)):
                a, b = ds[i], ds[j]
                if a["sdt"] and b["sdt"] and a["sdt"] == b["sdt"]:
                    tu_noi += 1               # cùng tên cùng SĐT ⇒ chắc chắn, khỏi hỏi
                    continue
                cap.append((a, b))
    return cap, giu_cho, tu_noi


# ── che PII rồi mới gửi đi ───────────────────────────────────────────────────
def che(h: dict) -> dict:
    """Chỉ ba thứ rời khỏi máy: TÊN, 3 SỐ CUỐI của SĐT, TỈNH."""
    return {
        "nguon": h["nguon"],
        "ten": h["ten_goc"],
        "sdt_3_so_cuoi": h["sdt"][-3:] if h["sdt"] else None,
        "sdt_do_dai": len(h["sdt"]) if h["sdt"] else 0,
        "tinh": h["tinh"] or None,
        "so_don": h["don"],
        "lan_dau": h["lan_dau"],
    }


LOI_NHAC = """Bạn đang rà soát dữ liệu khách hàng của một công ty lọc nước Việt Nam.
Hai nguồn: "sales" (bảng đơn hàng) và "cskh" (bảng chăm sóc khách hàng).

Với MỖI cặp dưới đây, quyết định hai hồ sơ có phải CÙNG MỘT người/đơn vị không.

Bạn được cho: tên đầy đủ, 3 SỐ CUỐI của điện thoại (số đầy đủ đã được che có chủ ý),
độ dài số, tỉnh, số đơn, ngày đầu. KHÔNG suy đoán thêm dữ liệu bạn không có.

Cân nhắc:
- 3 số cuối GIỐNG nhau + cùng tên  ⇒ rất nhiều khả năng cùng người (nhưng vẫn có thể trùng ngẫu nhiên, xác suất 1/1000).
- 3 số cuối KHÁC nhau ⇒ hai số điện thoại khác nhau. Có thể là một người hai số, cũng có thể là hai người trùng tên. Tên Việt Nam trùng nhau RẤT phổ biến (Nguyễn Văn A…).
- Khác tỉnh là dấu hiệu mạnh cho "hai người khác nhau".
- Một bên là cá nhân, một bên là công ty/đại lý ⇒ thường KHÁC nhau.
- Tên càng đặc biệt (ít gặp, có chức danh, có tên công ty) thì trùng tên càng có ý nghĩa.

Sai lầm đắt nhất là gộp nhầm hai khách THẬT thành một. Khi lưỡng lự, chọn "khong_chac".

Trả về DUY NHẤT một khối JSON, không thêm chữ nào ngoài khối đó:
```json
[{"cap": 0, "ket_luan": "trung"|"khac"|"khong_chac", "do_tin": 0-100, "ly_do": "một câu ngắn tiếng Việt"}]
```

CÁC CẶP:
"""


def hoi_claude(cap_da_che: list) -> list:
    ket = []
    for dau in range(0, len(cap_da_che), 25):
        lo = cap_da_che[dau:dau + 25]
        nhac = LOI_NHAC + json.dumps(
            [{"cap": dau + i, "a": a, "b": b} for i, (a, b) in enumerate(lo)],
            ensure_ascii=False, indent=1)
        try:
            ra = subprocess.run(["claude", "-p", nhac], capture_output=True, text=True, timeout=600)
        except FileNotFoundError:
            loi("Không thấy lệnh `claude` trên PATH.")
        except subprocess.TimeoutExpired:
            print(f"⚠️  lô {dau}: claude quá 10 phút, bỏ lô này", file=sys.stderr); continue
        if ra.returncode != 0:
            print(f"⚠️  lô {dau}: claude lỗi {ra.returncode}: {ra.stderr[:200]}", file=sys.stderr); continue
        khoi = re.search(r"```(?:json)?\s*(\[.*?\])\s*```", ra.stdout, re.S) \
            or re.search(r"(\[\s*\{.*\}\s*\])", ra.stdout, re.S)
        if not khoi:
            print(f"⚠️  lô {dau}: không tách được JSON từ trả lời", file=sys.stderr); continue
        try:
            ket += json.loads(khoi.group(1))
        except json.JSONDecodeError as e:
            print(f"⚠️  lô {dau}: JSON hỏng ({e})", file=sys.stderr)
        print(f"   …đã hỏi xong {min(dau + 25, len(cap_da_che))}/{len(cap_da_che)} cặp", file=sys.stderr)
    return ket


NHAN = {"trung": "🔴 NHIỀU KHẢ NĂNG TRÙNG", "khong_chac": "🟡 KHÔNG CHẮC",
        "khac": "🟢 NHIỀU KHẢ NĂNG KHÁC NHAU"}


def viet_bao_cao(cap, cap_che, phan_xet, giu_cho, tu_noi, duong_dan: Path) -> None:
    theo_idx = {p.get("cap"): p for p in phan_xet if isinstance(p, dict)}
    dong = [
        f"# Rà soát khách nghi trùng — {datetime.now():%d/%m/%Y}", "",
        "> ⚠️ File này **có PII khách** — `data/` đã gitignore, đừng commit, đừng gửi ra ngoài.", "",
        "**Cách dùng:** tick `[x]` những cặp anh đồng ý gộp, rồi bảo Claude thực hiện. "
        "Claude KHÔNG tự gộp bất cứ cặp nào.", "",
        "## Tóm tắt", "",
        f"- Cặp đem đi hỏi: **{len(cap)}**",
        f"- Cùng tên **và** cùng SĐT (chắc chắn trùng, không cần hỏi): **{tu_noi}**",
        f"- Nhóm tên giữ chỗ đã loại khỏi phép rà: **{len(giu_cho)}**", "",
        "**Đã gửi đi những gì:** tên đầy đủ · 3 số cuối SĐT · tỉnh · số đơn · ngày đầu. "
        "**Không** gửi: số điện thoại đầy đủ, địa chỉ, email, mã số thuế.", "",
    ]
    if giu_cho:
        dong += ["## Nhóm tên giữ chỗ (KHÔNG phải khách trùng)", ""]
        dong += [f"- `{t}` — **{n}** dòng, không dòng nào có SĐT. Cần anh cho biết đây là gì."
                 for t, n in sorted(giu_cho, key=lambda x: -x[1])]
        dong += [""]

    for loai in ("trung", "khong_chac", "khac"):
        nhom = [i for i in range(len(cap)) if theo_idx.get(i, {}).get("ket_luan") == loai]
        if not nhom:
            continue
        dong += [f"## {NHAN[loai]} ({len(nhom)} cặp)", ""]
        for i in nhom:
            a, b = cap[i]
            p = theo_idx[i]
            dong += [
                f"- [ ] **Cặp {i}** · độ tin {p.get('do_tin','?')}% — {p.get('ly_do','')}",
                f"    - `{a['nguon']}` **{a['ten_goc']}** · mã `{a['ma']}` · "
                f"SĐT …{a['sdt'][-3:] if a['sdt'] else '(trống)'} · {a['tinh'] or '(không tỉnh)'}"
                + (f" · {a['don']} đơn" if a["don"] is not None else ""),
                f"    - `{b['nguon']}` **{b['ten_goc']}** · mã `{b['ma']}` · "
                f"SĐT …{b['sdt'][-3:] if b['sdt'] else '(trống)'} · {b['tinh'] or '(không tỉnh)'}"
                + (f" · {b['don']} đơn" if b["don"] is not None else ""),
            ]
        dong += [""]

    thieu = [i for i in range(len(cap)) if i not in theo_idx]
    if thieu:
        dong += [f"## ⚠️ {len(thieu)} cặp chưa có phán xét (Claude lỗi hoặc bỏ lô)", "",
                 "Chạy lại script để hỏi tiếp.", ""]

    duong_dan.parent.mkdir(parents=True, exist_ok=True)
    duong_dan.write_text("\n".join(dong), encoding="utf-8")


def loi(td: str):
    print(f"❌ {td}", file=sys.stderr); sys.exit(2)


def main() -> int:
    p = argparse.ArgumentParser(description="Rà khách nghi trùng, một lượt")
    p.add_argument("--ra", help="đường dẫn file kết quả")
    p.add_argument("--khong-goi-claude", action="store_true",
                   help="chỉ dựng danh sách cặp, không hỏi Claude")
    ts = p.parse_args()

    print("Đang lấy dữ liệu từ production…", file=sys.stderr)
    ho_so = lay_du_lieu()
    print(f"   {sum(1 for h in ho_so if h['nguon']=='sales')} Sales + "
          f"{sum(1 for h in ho_so if h['nguon']=='cskh')} CSKH", file=sys.stderr)

    cap, giu_cho, tu_noi = dung_cap(ho_so)
    print(f"   {len(cap)} cặp cần phán đoán · {tu_noi} cặp chắc chắn trùng · "
          f"{len(giu_cho)} nhóm tên giữ chỗ", file=sys.stderr)

    cap_che = [(che(a), che(b)) for a, b in cap]
    phan_xet = []
    if cap and not ts.khong_goi_claude:
        print("Đang hỏi Claude…", file=sys.stderr)
        phan_xet = hoi_claude(cap_che)

    ra = Path(ts.ra) if ts.ra else GOC / "data" / f"ra-soat-khach-trung-{datetime.now():%Y-%m-%d}.md"
    viet_bao_cao(cap, cap_che, phan_xet, giu_cho, tu_noi, ra)
    print(f"\n✅ Đã ghi {ra}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
