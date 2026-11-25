#!/usr/bin/env python3
"""Smoke sau `supabase db reset` (CI db-reset): bảng + hàm chính phải có. Chỉ stdlib + psql."""
import re
import subprocess
import sys
from pathlib import Path

BANG_CAN_CO = ["tickets", "cs_customers", "sales_orders", "customer_addresses"]  # schema public
HAM_CAN_CO = ["kho_bot_ghi", "kho_bot_ds_serial", "bot_ds_don", "bot_ds_don_dau",
              "bot_tra_ticket", "bot_tao_ticket", "bot_dong_bo_cts20_ghi", "bot_ticket_moi"]  # schema public; thêm tên hàm mới vào đây

CONFIG = Path(__file__).resolve().parent.parent / "supabase" / "config.toml"


def db_port() -> str:
    m = re.search(r"^\[db\]\s*(?:\n(?!\[).*)*?\nport\s*=\s*(\d+)", CONFIG.read_text(), re.M)
    return m.group(1) if m else "54322"


def query(sql: str) -> str:
    r = subprocess.run(
        ["psql", "-h", "127.0.0.1", "-p", db_port(), "-U", "postgres", "-d", "postgres", "-tA", "-c", sql],
        capture_output=True, text=True, env={"PGPASSWORD": "postgres", "PATH": "/usr/bin:/usr/local/bin:/bin"},
    )
    if r.returncode:
        raise RuntimeError(r.stderr.strip())
    return r.stdout.strip()


def main() -> int:
    loi = []
    for t in BANG_CAN_CO:
        if query(f"select to_regclass('public.{t}') is not null") != "t":
            loi.append(f"thiếu bảng public.{t}")
    for f in HAM_CAN_CO:
        if query(f"select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace "
                 f"where n.nspname='public' and p.proname='{f}'") == "0":
            loi.append(f"thiếu hàm public.{f}")
    for l in loi:
        print("FAIL:", l)
    if loi:
        return 1
    print("ALL OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
