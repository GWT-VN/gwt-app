#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
doi_chieu_db.py — đối chiếu schema LOCAL với PRODUCTION.

VÌ SAO KHÔNG SO TÊN FILE MIGRATION
----------------------------------
Cách hiển nhiên là so `supabase/migrations/*.sql` với sổ migration của prod
(`supabase_migrations.schema_migrations`). Cách đó SAI ở repo này, đo ngày
26/08/2026:

  * Sổ prod ghi mốc thời gian KHÁC tên file local cho cùng một migration
    (local `20260821090000_sales_khach_them_province…` ↔ prod `20260821062130`).
  * Nhiều migration được áp bằng `execute_sql` chứ không qua `apply_migration`,
    nên KHÔNG vào sổ. `work_13`→`work_17` là ví dụ: cả 18 hàm của chúng đều
    đã có trên prod, nhưng sổ prod không có dòng nào.

So sổ ⇒ vừa báo động giả vừa bỏ sót. Script này so **object có thật trong DB**:
hàm, bảng, view (và cột nếu bật `--cot`).

DÙNG
----
    python3 tools/doi_chieu_db.py --sql      # in câu SQL để chạy trên prod
    python3 tools/doi_chieu_db.py --prod prod.json
    python3 tools/doi_chieu_db.py --prod -   # đọc JSON prod từ stdin

Lấy phía prod: nhờ Claude chạy câu SQL của `--sql` qua Supabase MCP
(project `bwzmqfbcgouhvhoslmmm`), lưu kết quả thành JSON rồi truyền vào `--prod`.
Lệnh tắt `/doi-chieu-db` làm sẵn cả chuỗi này.

Mã thoát: 0 = khớp (hoặc chỉ prod thừa) · 1 = PROD THIẾU · 2 = lỗi chạy.
"""

import argparse
import json
import subprocess
import sys

SCHEMA = ("public", "work", "sales")


def cau_sql(co_cot: bool) -> str:
    """Câu SQL chạy y hệt ở cả local lẫn prod, trả về 1 mảng JSON các khoá."""
    ds = ", ".join(f"'{s}'" for s in SCHEMA)
    phan = [
        # Bỏ hàm do EXTENSION tạo (pg_trgm, unaccent…) — không phải code của mình.
        f"""select 'fn:' || n.nspname || '.' || p.proname
            from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname in ({ds})
              and not exists (select 1 from pg_depend d
                              where d.objid = p.oid and d.deptype = 'e')""",
        f"""select 'tb:' || table_schema || '.' || table_name
            from information_schema.tables
            where table_schema in ({ds}) and table_type = 'BASE TABLE'""",
        f"""select 'vw:' || table_schema || '.' || table_name
            from information_schema.views where table_schema in ({ds})""",
    ]
    if co_cot:
        phan.append(
            f"""select 'co:' || table_schema || '.' || table_name || '.' || column_name
                from information_schema.columns where table_schema in ({ds})"""
        )
    return (
        "with dt(khoa) as (\n  " + "\n  union all\n  ".join(phan) + "\n)\n"
        "select coalesce(json_agg(khoa order by khoa), '[]'::json) as ket_qua from dt;"
    )


def tim_container() -> str:
    ra = subprocess.run(
        ["docker", "ps", "--format", "{{.Names}}"], capture_output=True, text=True
    )
    for ten in ra.stdout.split():
        if ten.startswith("supabase_db_"):
            return ten
    loi("Không thấy container supabase_db_* nào đang chạy. Chạy `supabase start` trước.")


def doc_local(container: str, sql: str) -> list:
    ra = subprocess.run(
        ["docker", "exec", "-i", container, "psql", "-U", "postgres",
         "-d", "postgres", "-tAc", sql],
        capture_output=True, text=True,
    )
    if ra.returncode != 0:
        loi(f"psql trong container thất bại:\n{ra.stderr.strip()}")
    return json.loads(ra.stdout.strip() or "[]")


def doc_prod(duong_dan: str) -> list:
    tho = sys.stdin.read() if duong_dan == "-" else open(duong_dan, encoding="utf-8").read()
    dl = json.loads(tho)
    # Chấp nhận cả mảng trần lẫn dạng Supabase MCP bọc: [{"ket_qua": [...]}]
    if isinstance(dl, list) and dl and isinstance(dl[0], dict):
        for khoa in ("ket_qua", "json_agg", "coalesce"):
            if khoa in dl[0]:
                return dl[0][khoa] or []
        loi(f"JSON prod là mảng object nhưng không có cột quen thuộc: {list(dl[0])}")
    if isinstance(dl, dict):
        for khoa in ("ket_qua", "json_agg", "coalesce"):
            if khoa in dl:
                return dl[khoa] or []
    return dl


NHAN = {"fn": "hàm", "tb": "bảng", "vw": "view", "co": "cột"}


def in_nhom(tieu_de: str, khoa_thieu: set) -> None:
    print(f"\n{tieu_de} ({len(khoa_thieu)}):")
    for loai in ("tb", "vw", "fn", "co"):
        cua_loai = sorted(k[3:] for k in khoa_thieu if k.startswith(loai + ":"))
        if cua_loai:
            print(f"  {NHAN[loai]} ({len(cua_loai)}): " + ", ".join(cua_loai[:40]))
            if len(cua_loai) > 40:
                print(f"    … và {len(cua_loai) - 40} cái nữa")


def loi(thong_diep: str):
    print(f"❌ {thong_diep}", file=sys.stderr)
    sys.exit(2)


def main() -> int:
    p = argparse.ArgumentParser(description="Đối chiếu schema local ↔ production")
    p.add_argument("--sql", action="store_true", help="chỉ in câu SQL cho prod rồi thoát")
    p.add_argument("--prod", help="file JSON kết quả chạy câu SQL đó trên prod ('-' = stdin)")
    p.add_argument("--cot", action="store_true", help="so cả từng cột (chi tiết hơn, dài hơn)")
    p.add_argument("--container", help="tên container Postgres local (mặc định: tự dò)")
    tham_so = p.parse_args()

    sql = cau_sql(tham_so.cot)
    if tham_so.sql:
        print(sql)
        return 0

    container = tham_so.container or tim_container()
    local = set(doc_local(container, sql))
    print(f"LOCAL  ({container}): {len(local)} object")

    if not tham_so.prod:
        print("\nChưa có phía prod. Chạy câu SQL sau trên production rồi truyền lại "
              "bằng --prod:\n")
        print(sql)
        return 0

    prod = set(doc_prod(tham_so.prod))
    print(f"PROD                     : {len(prod)} object")

    prod_thieu = local - prod
    local_thieu = prod - local

    if not prod_thieu and not local_thieu:
        print("\n✅ Khớp hoàn toàn.")
        return 0

    if prod_thieu:
        in_nhom("🔴 PROD THIẾU (local có, prod chưa) — áp migration trước khi merge", prod_thieu)
    if local_thieu:
        in_nhom("🟡 LOCAL thiếu (prod có, local chưa) — thường là do baseline cũ", local_thieu)

    return 1 if prod_thieu else 0


if __name__ == "__main__":
    sys.exit(main())
