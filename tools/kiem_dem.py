#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
kiem_dem.py — bản kiểm đêm, chạy 23:00 sau khi sao lưu xong.

TRIẾT LÝ: đo bằng CODE, phán đoán bằng CLAUDE.
Ba việc dưới đây là phép đếm thuần git — code làm, chắc chắn, không tốn token.
Chỉ việc cuối (đối chiếu backlog với code thật) mới cần đọc hiểu, mới gọi `claude -p`.

Bản kiểm CHỈ ĐỌC và CHỈ BÁO CÁO. Nó không sửa file, không commit, không đụng
backlog — sáng ra CEO đọc báo cáo rồi tự quyết. Job chạy lúc không có ai ngồi
canh thì không được phép tự ý đổi gì.

DÙNG:
    python3 tools/kiem_dem.py            # chạy thật (có gọi claude -p)
    python3 tools/kiem_dem.py --nhanh    # chỉ phần đo bằng code, không gọi Claude

Báo cáo: ~/gwt-worktrees/_kiem_dem_<ngày>.md   ·   Nhật ký: ~/gwt-worktrees/_kiem_dem.log
Lịch:    tools/cai-lich-kiem-dem.sh
"""
import argparse
import os
import re
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

GOC = Path(__file__).resolve().parent.parent
THU_MUC_BC = Path(os.environ.get("GWT_BAOCAO_DIR", Path.home() / "gwt-worktrees"))
TUOI_NHANH_TOI_DA = 3          # ngày — luật CEO chốt 21/08/2026
NGAY_CHOT_QUY_UOC = "2026-08-19"  # từ mốc này, migration mới phải ở supabase/migrations/


def git(*doi_so, cwd=None) -> str:
    ra = subprocess.run(["git", *doi_so], cwd=cwd or GOC,
                        capture_output=True, text=True)
    return ra.stdout.strip()


def cac_worktree() -> list:
    ds, hien_tai = [], {}
    for dong in git("worktree", "list", "--porcelain").splitlines():
        if dong.startswith("worktree "):
            hien_tai = {"duong_dan": Path(dong[9:])}
        elif dong.startswith("branch "):
            hien_tai["nhanh"] = dong[7:].replace("refs/heads/", "")
        elif dong == "" and hien_tai:
            ds.append(hien_tai)
            hien_tai = {}
    if hien_tai:
        ds.append(hien_tai)
    return [w for w in ds if w.get("nhanh")]


def do_nhanh_qua_han() -> list:
    """Nhánh sống quá TUOI_NHANH_TOI_DA ngày mà chưa merge vào main."""
    ket_qua = []
    for wt in cac_worktree():
        nhanh = wt["nhanh"]
        if nhanh == "main":
            continue
        goc = git("merge-base", nhanh, "origin/main")
        if not goc:
            continue
        dau = git("log", "-1", "--format=%cI", goc)
        if not dau:
            continue
        tuoi = datetime.now(timezone.utc) - datetime.fromisoformat(dau)
        so_commit = len(git("log", "--oneline", f"origin/main..{nhanh}").splitlines())
        if tuoi > timedelta(days=TUOI_NHANH_TOI_DA) and so_commit:
            ket_qua.append(f"`{nhanh}` — cắt từ main {tuoi.days} ngày trước, "
                           f"{so_commit} commit chưa merge")
    return ket_qua


def do_chua_push() -> list:
    """Commit chỉ tồn tại trên ổ máy này. Commit không phải backup; push mới là."""
    ket_qua = []
    for wt in cac_worktree():
        nhanh = wt["nhanh"]
        # Chạy từ kho gốc, KHÔNG từ thư mục worktree: `git worktree list` vẫn liệt kê
        # cả worktree đã bị xoá thư mục (prunable) — cd vào đó là FileNotFoundError.
        xa = git("rev-parse", "--abbrev-ref", f"{nhanh}@{{upstream}}")
        if not xa:
            so = len(git("log", "--oneline", f"origin/main..{nhanh}").splitlines())
            if so:
                ket_qua.append(f"`{nhanh}` — CHƯA CÓ trên GitHub, {so} commit chỉ nằm ở máy này")
            continue
        so = len(git("log", "--oneline", f"{xa}..{nhanh}").splitlines())
        if so:
            ket_qua.append(f"`{nhanh}` — {so} commit chưa push")
    return ket_qua


def do_migration_sai_cho() -> list:
    """Migration VỪA VIẾT mà đặt ở db/*/migrations/ thay vì supabase/migrations/.

    db/*/migrations/ là LỊCH SỬ (đã gộp vào baseline 19/08/2026). File MỚI phải nằm ở
    supabase/migrations/ — thư mục DUY NHẤT Supabase CLI đọc. Đặt sai chỗ thì
    `supabase db reset` không dựng ra nó ⇒ máy dev lệch prod.

    HAI CÁI BẪY đã trả giá khi viết hàm này (đo 26/08/2026):
      1. Mốc cố định 19/08 → 78 báo động giả: hôm đó là commit tái cấu trúc repo,
         nó DI CHUYỂN ~60 file cũ vào db/cs/migrations/.
      2. `git log --diff-filter=A -- <đường dẫn>` vẫn tính file di chuyển là "thêm mới":
         lọc theo đường dẫn khiến git không nhìn thấy phía NGUỒN của phép đổi tên nên
         không nhận ra đó là rename. Phải xem diff TOÀN CÂY của từng commit (`-M`)
         rồi mới lọc đường dẫn — lúc đó file di chuyển hiện là `R`, không phải `A`.
    """
    duoi_db = re.compile(r"^db/[^/]+/migrations/.+\.sql$")
    # Pathspec phải là mẫu khớp TRỌN đường dẫn file. "db/*/migrations" không khớp
    # file nào (không có file nào tên đúng như vậy) nên trả về rỗng — vòng lặp chạy
    # 0 lần và hàm im lặng báo "không có gì". Phải có "/*.sql" ở cuối.
    ma_commit = git("log", "--since=7 days ago", "--format=%H",
                    "--", "db/*/migrations/*.sql").splitlines()
    them_moi = set()
    for ma in ma_commit:
        for dong in git("show", "--name-status", "-M", "--format=", ma).splitlines():
            phan = dong.split("\t")
            if phan[0].startswith("A") and len(phan) > 1 and duoi_db.match(phan[1]):
                them_moi.add(phan[1])

    # Tên ở supabase/ có tiền tố mốc thời gian (20260822073955_work_12_nhac_nguoi.sql)
    # nên so bằng "có chứa gốc tên", không so bằng nhau.
    ten_supabase = " ".join(x.stem for x in (GOC / "supabase" / "migrations").glob("*.sql"))
    return [f"`{f}` — file migration mới nhưng đặt ở db/, không có bản trong "
            f"supabase/migrations/ (xem db/MIGRATIONS-CONVENTION.md)"
            for f in sorted(them_moi) if Path(f).stem not in ten_supabase]


def goi_claude(phan_do: str) -> str:
    """Phần cần đọc hiểu: đối chiếu backlog với code thật. CHỈ ĐỌC, chỉ báo cáo."""
    loi_nhac = f"""Bạn là bản kiểm đêm của repo GWT-App. Phiên này CHỈ ĐỌC:
tuyệt đối không sửa file, không commit, không push, không đụng backlog.
Trả lời bằng tiếng Việt, ngắn gọn, dạng markdown.

Phần đo bằng máy đã có sẵn (đừng làm lại):
{phan_do}

Việc của bạn — đối chiếu backlog với code thật:
1. Đọc `backlog/cskh.md`, `backlog/viec.md`, `backlog/sales.md`, `backlog/nen-tang.md`.
2. Với mỗi mục còn để ngỏ ở phần `🔨 ĐANG LÀM` hoặc `🐞 LỖI CẦN SỬA`, xem
   `git log --since="7 days ago" --oneline` và diff xem có commit nào ĐÃ LÀM
   việc đó rồi mà mục vẫn chưa được chuyển trạng thái không.
3. Chỉ nêu mục nào bạn tìm được **commit cụ thể** làm bằng chứng. Không đoán.
   Không tìm thấy gì thì nói thẳng "không thấy mục nào lệch" — đừng bịa cho đủ.

Định dạng mỗi phát hiện: khu · mục · commit (mã ngắn + tiêu đề) · vì sao bạn cho là đã xong.
"""
    try:
        ra = subprocess.run(
            ["claude", "-p", loi_nhac,
             "--allowedTools", "Read", "Grep", "Glob", "Bash(git log*)", "Bash(git show*)",
         # KHÔNG dùng acceptEdits: bản kiểm cam kết chỉ đọc. Edit/Write không nằm
         # trong --allowedTools nên đã bị chặn, nhưng để acceptEdits ở đây thì mai
         # sau ai nới allowedTools là job lặng lẽ được quyền sửa file lúc 23h.
         "--permission-mode", "default"],
            cwd=GOC, capture_output=True, text=True, timeout=900,
        )
    except subprocess.TimeoutExpired:
        return "_(claude -p quá 15 phút, đã bỏ. Phần đo bằng code ở trên vẫn đúng.)_"
    except FileNotFoundError:
        return "_(không thấy lệnh `claude` trên PATH — bỏ phần đối chiếu backlog.)_"
    if ra.returncode != 0:
        return f"_(gọi `claude -p` thất bại, mã {ra.returncode}: {ra.stderr.strip()[:400]})_"
    return ra.stdout.strip() or "_(claude không trả về gì)_"


def main() -> int:
    p = argparse.ArgumentParser(description="Bản kiểm đêm repo GWT-App")
    p.add_argument("--nhanh", action="store_true",
                   help="chỉ phần đo bằng code, không gọi claude -p")
    tham_so = p.parse_args()

    hom_nay = datetime.now().strftime("%Y-%m-%d")
    git("fetch", "--quiet", "origin")

    muc = [
        ("Nhánh quá hạn (>%d ngày chưa merge)" % TUOI_NHANH_TOI_DA, do_nhanh_qua_han()),
        ("Commit chưa lên GitHub (commit ≠ backup)", do_chua_push()),
        ("Migration đặt sai thư mục", do_migration_sai_cho()),
    ]

    def cat(ds, toi_da=10):
        return ds[:toi_da] + ([f"…và {len(ds) - toi_da} mục nữa"] if len(ds) > toi_da else [])

    dong = [f"# Bản kiểm đêm — {hom_nay}", ""]
    co_van_de = False
    for tieu_de, ds in muc:
        dong.append(f"## {tieu_de}")
        if ds:
            co_van_de = True
            dong += [f"- {d}" for d in cat(ds)]
        else:
            dong.append("- ✅ không có gì")
        dong.append("")

    phan_do = "\n".join(dong)
    if not tham_so.nhanh:
        dong += ["## Backlog lệch với code (Claude đọc và đối chiếu)", "",
                 goi_claude(phan_do), ""]

    bao_cao = "\n".join(dong)
    THU_MUC_BC.mkdir(parents=True, exist_ok=True)
    duong_dan = THU_MUC_BC / f"_kiem_dem_{hom_nay}.md"
    duong_dan.write_text(bao_cao, encoding="utf-8")

    with open(THU_MUC_BC / "_kiem_dem.log", "a", encoding="utf-8") as f:
        f.write(f"[{datetime.now():%Y-%m-%d %H:%M}] {duong_dan.name} — "
                f"{'CÓ việc cần xem' if co_van_de else 'sạch'}\n")

    print(bao_cao)
    print(f"\n→ đã ghi {duong_dan}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
