#!/usr/bin/env python3
"""Sao lưu tự động mọi worktree lên GitHub — chạy 22:00 mỗi ngày.

VÌ SAO: máy CEO không tắt, nhiều phiên Claude làm song song, và người ta quên push.
Đo ngày 21/08/2026: 31 commit trên 5 nhánh chỉ tồn tại trên ổ máy này — nặng nhất là
20 commit làm lại phân quyền. **Commit không phải là backup; chỉ push mới là backup.**

LUẬT PII (quan trọng hơn cả việc backup):
  • KHÔNG BAO GIỜ `git add -A`. File đã theo dõi thì `git add -u`.
  • File MỚI chưa từng commit: chỉ tự thêm nếu nằm trong thư mục code cho phép VÀ có
    đuôi code cho phép. Excel/PDF/ảnh/csv và file lạ chỗ thì KHÔNG đụng — máy quét PII
    đọc được file chữ, không đọc được ruột file nhị phân. Chúng chỉ được ghi vào log
    để sáng hôm sau người xem.
  • Mọi thứ sắp commit đều phải qua tools/scripts/scan_pii_secrets.py. Dính là bỏ
    nguyên worktree đó, không commit.
  • Không bao giờ đụng nhánh `main`.

JOB CHẠY BẢN CHÉP NGOÀI iCLOUD — đừng bỏ bước cài:
  macOS KHÔNG cho tiến trình launchd đọc ~/Library/Mobile Documents (iCloud Drive).
  Chạy tay trong Terminal thì được (Terminal có quyền), nên cài xong nhìn rất ổn —
  còn job đêm thì chết ngay dòng đầu: "can't open file …: Operation not permitted".
  Đã câm đúng như vậy 7 đêm liền, 21–27/08/2026, log vẫn ghi đều nên không ai thấy.
  Vì thế tools/cai-lich-saoluu.sh CHÉP script này (kèm scan_pii_secrets.py) sang
  ~/gwt-worktrees/_tools/ và cho launchd chạy bản đó. Sửa file này trong repo xong
  phải chạy lại tools/cai-lich-saoluu.sh, nếu không đêm nay vẫn là bản cũ.

DÙNG:
    python3 tools/saoluu_dem.py          # chạy thật
    python3 tools/saoluu_dem.py --thu    # chạy thử: chỉ in ra, không commit/push

Lịch chạy: ~/Library/LaunchAgents/vn.gwt.saoluu.plist (cài bằng tools/cai-lich-saoluu.sh)
Nhật ký:   ~/gwt-worktrees/_saoluu.log
"""
import hashlib
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

GOC = Path(__file__).resolve().parent.parent
LOG = Path(os.environ.get("GWT_SAOLUU_LOG", Path.home() / "gwt-worktrees" / "_saoluu.log"))
# Kho worktree — nguồn sự thật để biết cần sao lưu chỗ nào. Nằm NGOÀI iCloud là có chủ ý:
# mọi thứ job đêm phải đụng tới đều buộc phải nằm ngoài đó (xem đầu file).
KHO = Path(os.environ.get("GWT_KHO_WT", Path.home() / "gwt-worktrees"))


def tim_quet_pii():
    """Tìm scan_pii_secrets.py: bản chép để cạnh script, rồi mới tới bản trong repo.

    Không thấy = KHÔNG chạy. Cửa PII là điều kiện bắt buộc, thà không sao lưu đêm nay
    còn hơn commit nhầm số điện thoại khách.
    """
    ung_vien = []
    if os.environ.get("GWT_QUET_PII"):
        ung_vien.append(Path(os.environ["GWT_QUET_PII"]))
    ung_vien.append(Path(__file__).resolve().parent / "scan_pii_secrets.py")
    ung_vien.append(GOC / "tools" / "scripts" / "scan_pii_secrets.py")
    for f in ung_vien:
        try:
            if f.is_file() and os.access(f, os.R_OK):
                return f
        except OSError:
            continue                      # iCloud chặn đọc thì coi như không có
    return None


QUET_PII = tim_quet_pii()

# Thư mục được phép tự thêm file mới. Ngoài các thư mục này = không đụng.
THU_MUC_OK = re.compile(r"^(apps/|db/|docs/|tools/|supabase/|\.github/)")
# Đuôi file được phép tự thêm. Excel/PDF/ảnh/csv KHÔNG nằm ở đây là có chủ ý.
DUOI_OK = re.compile(r"\.(ts|tsx|js|jsx|mjs|cjs|sql|sh|py|md|css|jsonc?|ya?ml)$")
# File ở GỐC repo thì mặc định không tự thêm (gốc là chỗ data thô hay bị quăng vào).
# Chỉ trừ đúng mấy file dự án quen mặt này. BACKLOG.md/backlog/ đã bị .gitignore chặn.
GOC_OK = {"HANDOFF.md", "CLAUDE.md", "README.md", "AGENTS.md",
          ".gitignore", "vercel.json", "package.json"}


def duoc_tu_them(f):
    """File mới này có được job tự đưa vào commit không?"""
    if "/" not in f:
        return f in GOC_OK
    return bool(THU_MUC_OK.search(f) and DUOI_OK.search(f))

THU = "--thu" in sys.argv
_log_fh = None
HONG = []          # worktree mà git không mở nổi — dùng để đoán bệnh ở cuối lượt


def _stdout_la_log():
    """plist trỏ StandardOutPath vào đúng file log → in ra là log bị ghi đôi."""
    try:
        return os.fstat(sys.stdout.fileno()).st_ino == LOG.stat().st_ino
    except OSError:
        return False


def ghi(dong=""):
    if not (_log_fh and _stdout_la_log()):
        print(dong, flush=True)
    if _log_fh:
        _log_fh.write(dong + "\n")
        _log_fh.flush()


def git(wt, *args, kiem=False):
    """Chạy git trong worktree wt. Trả về (ma_thoat, stdout đã strip)."""
    r = subprocess.run(["git", "-C", str(wt), *args],
                       capture_output=True, text=True)
    if kiem and r.returncode != 0:
        ghi(f"      git {' '.join(args)} lỗi: {r.stderr.strip()[:300]}")
    return r.returncode, r.stdout.strip()


def dong(s):
    return [x for x in s.splitlines() if x.strip()]


def worktrees():
    """Mọi worktree cần sao lưu.

    Nguồn chính là quét thẳng thư mục KHO, KHÔNG hỏi `git worktree list` ở kho gốc:
    kho gốc nằm trong iCloud, job launchd không đọc được, và đó chính là chỗ job
    chết câm 7 đêm. Khi chạy tay (đọc được kho gốc) thì gộp thêm cho đủ, phòng khi
    có worktree đặt ngoài KHO.
    """
    ds = {}
    try:
        for d in sorted(KHO.iterdir()):
            if d.name.startswith("_") or not d.is_dir():
                continue
            if (d / ".git").exists():
                ds[d.resolve()] = str(d)
    except OSError as e:
        ghi(f"⚠️  không đọc được kho worktree {KHO}: {e}")

    rc, out = git(GOC, "worktree", "list", "--porcelain")
    if rc == 0:
        for l in out.splitlines():
            if l.startswith("worktree "):
                q = Path(l[len("worktree "):])
                try:
                    ds.setdefault(q.resolve(), str(q))
                except OSError:
                    pass
    return list(ds.values())


def bao_man_hinh(noi_dung):
    """Bắn thông báo macOS. Job hỏng mà chỉ ghi log thì không ai đọc — đã im 7 đêm liền.

    osascript chạy được từ launchd và KHÔNG cần quyền đĩa, nên đây là đường báo động
    duy nhất chắc chắn còn hoạt động khi mọi thứ khác bị chặn.
    """
    if THU:
        return
    try:
        subprocess.run(
            ["/usr/bin/osascript", "-e",
             f'display notification {json.dumps(noi_dung)} '
             f'with title "Sao lưu GWT" subtitle "Xem ~/gwt-worktrees/_saoluu.log"'],
            capture_output=True, timeout=20)
    except Exception:
        pass                              # báo động hỏng thì cũng đừng làm job chết


def lan_chay_truoc():
    """Mốc lượt chạy gần nhất, đọc ngược từ nhật ký — để biết có đêm nào trượt."""
    try:
        txt = LOG.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None
    moc = re.findall(r"SAO LƯU ĐÊM · (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})", txt)
    if not moc:
        return None
    try:
        return datetime.strptime(moc[-1], "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return None


def canh_bao_ban_cu(ds_wt):
    """Bản đang chạy có còn khớp bản trong repo không?

    Job chạy bản chép ở ~/gwt-worktrees/_tools/. Sửa script trong repo mà quên cài lại
    thì đêm nay vẫn chạy bản cũ — im lặng, không ai thấy. Worktree nào cũng có bản repo
    của file này và worktree thì đọc được, nên đối chiếu ngay tại đây.
    """
    try:
        toi = hashlib.sha256(Path(__file__).resolve().read_bytes()).hexdigest()
    except OSError:
        return
    thay_ban_repo = False
    for wt in ds_wt:
        f = Path(wt) / "tools" / "saoluu_dem.py"
        try:
            if not f.is_file():
                continue
            thay_ban_repo = True
            if hashlib.sha256(f.read_bytes()).hexdigest() == toi:
                return                    # có ít nhất một bản repo khớp → yên tâm
        except OSError:
            continue
    if thay_ban_repo:
        ghi("⚠️  bản đang chạy KHÁC mọi bản trong repo — nhiều khả năng đã cũ.")
        ghi("   Cài lại cho khớp: bash tools/cai-lich-saoluu.sh")


def dang_do_dang(wt):
    """Đang dở merge/rebase/cherry-pick thì đừng chen vào."""
    _, gd = git(wt, "rev-parse", "--git-dir")
    if not gd:
        return True
    p = Path(gd) if Path(gd).is_absolute() else Path(wt) / gd
    return any((p / t).exists() for t in
               ("MERGE_HEAD", "rebase-merge", "rebase-apply", "CHERRY_PICK_HEAD"))


def xu_ly(wt):
    """Trả về (so_commit, so_push, so_can_xem)."""
    ten = Path(wt).name
    if not Path(wt).is_dir():
        ghi(f"⚠️  {wt} — thư mục không còn, bỏ qua")
        return 0, 0, 1

    rc, nhanh = git(wt, "rev-parse", "--abbrev-ref", "HEAD")
    if rc != 0:
        # Hai bệnh khác nhau, cùng triệu chứng: (a) worktree mồ côi — thư mục còn, git
        # đã gỡ; (b) cả kho git bị chặn quyền. Chưa kết luận ở đây, để cuối lượt đếm
        # rồi mới nói — hỏng đúng vài chỗ là (a), hỏng sạch là (b).
        HONG.append(ten)
        ghi(f"⚠️  {ten} — git không mở được worktree này, KHÔNG sao lưu được.")
        return 0, 0, 1
    if nhanh in ("main", "HEAD", ""):
        ghi(f"·  {ten} [{nhanh or '?'}] — bỏ qua (main hoặc không đứng ở nhánh nào)")
        return 0, 0, 0

    if dang_do_dang(wt):
        ghi(f"⚠️  {ten} [{nhanh}] — đang dở merge/rebase, KHÔNG đụng vào")
        return 0, 0, 1

    ghi("")
    ghi(f"── {ten}  [{nhanh}]")
    commit = push = can_xem = 0

    # 1. File đã theo dõi có thay đổi
    _, a = git(wt, "diff", "--name-only")
    _, b = git(wt, "diff", "--cached", "--name-only")
    da_theo_doi = sorted(set(dong(a)) | set(dong(b)))

    # 2. File mới chưa từng commit — lọc theo thư mục + đuôi
    _, c = git(wt, "ls-files", "--others", "--exclude-standard")
    moi_nhan, moi_bo = [], []
    for f in dong(c):
        (moi_nhan if duoc_tu_them(f) else moi_bo).append(f)

    if moi_bo:
        ghi(f"   ⚠️  {len(moi_bo)} file mới KHÔNG tự thêm "
            f"(sai thư mục hoặc không phải file code) — cần người xem:")
        for f in moi_bo:
            ghi(f"        · {f}")
        can_xem += 1

    if da_theo_doi or moi_nhan:
        if THU:
            ghi(f"   [thử] sẽ commit {len(da_theo_doi)} file đã theo dõi "
                f"+ {len(moi_nhan)} file mới")
        else:
            git(wt, "add", "-u", kiem=True)
            for f in moi_nhan:
                git(wt, "add", "--", f, kiem=True)

            # Cửa PII — dính là bỏ nguyên worktree này
            r = subprocess.run([sys.executable, str(QUET_PII), "--staged"],
                               cwd=wt, capture_output=True, text=True)
            if r.returncode != 0:
                ghi("   ⛔ QUÉT PII PHÁT HIỆN — bỏ staged, KHÔNG commit worktree này:")
                for l in (r.stdout + r.stderr).splitlines()[:20]:
                    ghi(f"        {l}")
                git(wt, "reset", "-q")
                return commit, push, can_xem + 1

            if git(wt, "diff", "--cached", "--quiet")[0] == 0:
                ghi("   ·  không có gì để commit")
            else:
                _, ds = git(wt, "diff", "--cached", "--name-only")
                n = len(dong(ds))
                msg = (f"chore(saoluu): sao lưu tự động "
                       f"{datetime.now():%d/%m/%Y %H:%M}\n\n"
                       f"Commit do job sao lưu 22h tạo, KHÔNG phải mốc việc đã xong.\n"
                       f"Gộp/sửa lại thoải mái ở phiên sau. {n} file.")
                if git(wt, "commit", "-q", "--no-verify", "-m", msg, kiem=True)[0] == 0:
                    ghi(f"   ✅ đã commit {n} file")
                    commit += 1
                else:
                    can_xem += 1
    else:
        ghi("   ·  không có thay đổi")

    # 3. Push
    rc, up = git(wt, "rev-parse", "--abbrev-ref", "@{upstream}")
    if rc != 0 or not up or up == "origin/main":
        can_push = True          # nhánh chưa từng có bản riêng trên GitHub
    else:
        _, n = git(wt, "rev-list", "--count", f"{up}..HEAD")
        can_push = n not in ("0", "")

    if not can_push:
        ghi("   ·  GitHub đã có đủ, không cần push")
    elif THU:
        ghi(f"   [thử] sẽ push {nhanh} lên origin")
    elif git(wt, "push", "-q", "-u", "origin", nhanh, kiem=True)[0] == 0:
        ghi(f"   ✅ đã push {nhanh} lên GitHub")
        push += 1
    else:
        ghi(f"   ⛔ push {nhanh} THẤT BẠI — xem log")
        can_xem += 1

    return commit, push, can_xem


def main():
    global _log_fh
    LOG.parent.mkdir(parents=True, exist_ok=True)
    truoc = lan_chay_truoc()             # đọc TRƯỚC khi mở ghi thêm
    _log_fh = LOG.open("a", encoding="utf-8")

    ghi("")
    ghi("═" * 63)
    ghi(f"SAO LƯU ĐÊM · {datetime.now():%Y-%m-%d %H:%M:%S}"
        + ("   [CHẠY THỬ]" if THU else ""))
    ghi("═" * 63)
    ghi(f"·  chạy bản: {Path(__file__).resolve()}")
    if truoc:
        cach = (datetime.now() - truoc).total_seconds() / 3600
        if cach > 30:
            ghi(f"⚠️  lượt trước cách đây {cach / 24:.1f} ngày ({truoc:%d/%m %H:%M})"
                f" — có đêm bị trượt")

    # Cửa PII là điều kiện bắt buộc: không có máy quét thì dừng, đừng commit mò.
    if QUET_PII is None:
        ghi("⛔ KHÔNG đọc được scan_pii_secrets.py — DỪNG, không commit gì cả.")
        ghi("   Cài lại bản chạy nền: bash tools/cai-lich-saoluu.sh")
        ghi("─" * 63)
        _log_fh.close()
        return 2

    tc = tp = tx = 0
    ds_wt = []                 # có tên sẵn: khối kết luận cuối lượt vẫn chạy được khi nổ
    try:
        ds_wt = worktrees()
        canh_bao_ban_cu(ds_wt)
        if not ds_wt:
            ghi(f"⚠️  KHÔNG thấy worktree nào trong {KHO} — không sao lưu được gì.")
            tx += 1
        for wt in ds_wt:
            c, q, x = xu_ly(wt)
            tc, tp, tx = tc + c, tp + q, tx + x
    except Exception:
        import traceback
        ghi("")
        ghi("⛔ LỖI KHÔNG LƯỜNG TRƯỚC — job dừng giữa chừng, phần còn lại CHƯA sao lưu:")
        for l in traceback.format_exc().splitlines()[-10:]:
            ghi(f"   {l}")
        tx += 1

    if HONG and len(HONG) == len(ds_wt):
        # Hỏng sạch 100% = không phải chuyện từng worktree, mà là cả kho git bị chặn.
        ghi("")
        ghi("⛔ HỎNG TOÀN BỘ — KHÔNG SAO LƯU ĐƯỢC GÌ.")
        ghi(f"   git không mở nổi cả {len(HONG)}/{len(HONG)} worktree.")
        ghi("   Gần như chắc chắn: kho git nằm trong iCloud Drive, mà macOS không cho")
        ghi("   job chạy nền đọc iCloud — worktree nằm ngoài iCloud cũng vô ích, vì file")
        ghi("   .git của nó trỏ ngược vào kho gốc trong đó.")
        ghi("   Sửa (chọn một):")
        ghi("     · Cài đặt hệ thống → Quyền riêng tư & Bảo mật → Toàn quyền truy cập đĩa")
        ghi(f"       → '+' → Cmd+Shift+G → dán: {sys.executable}")
        ghi("     · Hoặc chuyển kho git ra ngoài iCloud (dứt điểm hơn).")
        ghi("   Xong thì kiểm lại: bash tools/cai-lich-saoluu.sh --kiem")
        bao_man_hinh("KHÔNG sao lưu được gì: job nền không mở nổi kho git (iCloud).")

    ghi("")
    ghi("─" * 63)
    ghi(f"XONG {datetime.now():%H:%M:%S} — commit: {tc} · push: {tp} · cần người xem: {tx}")
    ghi("─" * 63)
    if tx and not (HONG and len(HONG) == len(ds_wt)):
        bao_man_hinh(f"{tx} chỗ cần người xem (commit: {tc} · push: {tp}).")
    _log_fh.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
