#!/usr/bin/env python3
"""Hút một site Google Sites về markdown để đưa vào wiki.

    python3 tools/scripts/hut-google-sites.py <url-goc> <thu-muc-ra> [--ten "Tên site"]

Ví dụ:
    python3 tools/scripts/hut-google-sites.py \\
        https://sites.google.com/gwt.vn/gwt-camnang-congviec \\
        data/wiki-nhap/_hut-sites/cong-viec

Chỉ dùng stdlib — không thêm gói.

VÌ SAO CURL ĐƯỢC MÀ KHÔNG CẦN TRÌNH DUYỆT: Google Sites nhúng sẵn nội dung vào HTML
trả về (server-render), không phải dựng bằng JS. Nên `urllib` lấy đủ, nhanh hơn nhiều
so với bấm từng trang qua trình duyệt.

CẤU TRÚC GOOGLE SITES: mỗi khối nội dung là `<div class="zfr3Q …">`; tiêu đề là thẻ
`<h1>`–`<h6>` thật. Thanh điều hướng nằm trong `<nav>` và lặp lại ở MỌI trang — không
loại ra thì mỗi file .md lại có nguyên cái menu dính ở đầu.

Script này CHỈ hút về `data/` (đã gitignore) để người soạn đọc và biên tập lại. Nó
KHÔNG ghi thẳng vào `apps/web/content/` — nội dung Google Sites phần lớn là bản
AI tổng hợp (hạng D theo thang nguồn của PKB), phải có người xem và gắn nhãn trước.
"""
import argparse
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from html.parser import HTMLParser

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
BO_QUA_THE = {"script", "style", "noscript", "svg", "nav", "header", "footer"}


def tai(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "vi,en;q=0.8"})
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read().decode("utf-8", "replace")


class BocNoiDung(HTMLParser):
    """Chuyển phần thân trang Google Sites thành markdown.

    Chỉ nhận nội dung nằm trong khối `zfr3Q` (khối nội dung của Sites) và trong
    list/table. Mọi thứ trong `nav/header/footer/script` bị bỏ — đó là menu lặp.
    """

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ra: list[str] = []
        self.buf: list[str] = []
        self.sau_bo_qua = 0        # độ sâu đang nằm trong thẻ phải bỏ
        self.trong_khoi = 0        # độ sâu đang nằm trong khối nội dung
        self.heading: str | None = None
        self.trong_li = False
        self.kieu_ds: list[str] = []
        self.trong_o = False       # ô của bảng
        self.hang: list[str] = []
        self.bang: list[list[str]] = []
        self.link: str | None = None

    # --- tiện ích ---
    def _xa(self):
        t = re.sub(r"[ \t]+", " ", "".join(self.buf)).strip()
        self.buf = []
        return t

    def _them(self, s: str):
        if s:
            self.ra.append(s)

    # --- xử lý thẻ ---
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in BO_QUA_THE or a.get("role") == "navigation":
            self.sau_bo_qua += 1
            return
        if self.sau_bo_qua:
            return

        cls = a.get("class", "")
        if "zfr3Q" in cls:
            self.trong_khoi += 1

        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self._them(self._xa())
            self.heading = tag
        elif tag in ("ul", "ol"):
            self._them(self._xa())
            self.kieu_ds.append(tag)
        elif tag == "li":
            self._them(self._xa())
            self.trong_li = True
        elif tag == "table":
            self._them(self._xa())
            self.bang = []
        elif tag == "tr":
            self.hang = []
        elif tag in ("td", "th"):
            self.trong_o = True
            self.buf = []
        elif tag == "a" and a.get("href"):
            self.link = a["href"]
        elif tag == "br":
            self.buf.append(" ")

    def handle_endtag(self, tag):
        if tag in BO_QUA_THE:
            self.sau_bo_qua = max(0, self.sau_bo_qua - 1)
            return
        if self.sau_bo_qua:
            return

        if tag in ("h1", "h2", "h3", "h4", "h5", "h6") and self.heading:
            t = self._xa()
            if t:
                self._them("#" * int(self.heading[1]) + " " + t)
            self.heading = None
        elif tag == "li" and self.trong_li:
            t = self._xa()
            if t:
                dau = "1." if (self.kieu_ds and self.kieu_ds[-1] == "ol") else "-"
                self._them(f"{dau} {t}")
            self.trong_li = False
        elif tag in ("ul", "ol") and self.kieu_ds:
            self.kieu_ds.pop()
        elif tag in ("td", "th"):
            self.hang.append(self._xa().replace("|", "\\|"))
            self.trong_o = False
        elif tag == "tr" and self.hang:
            self.bang.append(self.hang)
            self.hang = []
        elif tag == "table" and self.bang:
            self._them(bang_markdown(self.bang))
            self.bang = []
        elif tag == "a":
            self.link = None
        elif tag in ("p", "div") and self.trong_khoi and not self.trong_o and not self.trong_li:
            self._them(self._xa())
            if "zfr3Q" in (self.get_starttag_text() or ""):
                pass
            self.trong_khoi = max(0, self.trong_khoi - 1)

    def handle_data(self, d):
        if self.sau_bo_qua:
            return
        # Chỉ nhận chữ khi đang ở trong khối nội dung / tiêu đề / list / ô bảng.
        if self.trong_khoi or self.heading or self.trong_li or self.trong_o:
            self.buf.append(d)

    def ket_qua(self) -> str:
        self._them(self._xa())
        return "\n\n".join(x for x in self.ra if x.strip())


def bang_markdown(rows: list[list[str]]) -> str:
    if not rows:
        return ""
    n = max(len(r) for r in rows)
    rows = [r + [""] * (n - len(r)) for r in rows]
    dau = "| " + " | ".join(rows[0]) + " |"
    ngan = "|" + "|".join(["---"] * n) + "|"
    than = ["| " + " | ".join(r) + " |" for r in rows[1:]]
    return "\n".join([dau, ngan] + than)


# Chân trang Google Sites lặp ở mọi trang — không phải nội dung.
RAC_CHAN_TRANG = ("Báo cáo lạm dụng", "Chi tiết trang", "Đã cập nhật trang",
                  "Page updated", "Report abuse", "Google Sites", "Embedded Files",
                  "Search this site", "Skip to main content", "Skip to navigation",
                  "Thêm Tiêu đề và tiêu đề sẽ xuất hiện trong phần mục lục.")

# Tên miền dính liền đuôi câu — Sites nhét chú thích nguồn vào giữa chữ:
# "…đến hộ gia đìnhqcvn.com.vnfptshop.com.vn". Tách ra thành ghi chú.
#
# `(?<![\w.@-])` NGAY TRƯỚC tên miền là BẮT BUỘC — nếu không thì địa chỉ email cũng bị băm:
# "bellanguyent@gwt.vn" thành "bellanguyent@g *(nguồn: wt.vn)*". Đã dính đúng lỗi này
# 31/08/2026, làm hỏng email trong tài liệu "Công cụ làm việc".
#
# ⚠️ GIỚI HẠN ĐÃ BIẾT: phép tách này là phỏng đoán, không chính xác tuyệt đối. Nó không
# biết tên miền bắt đầu ở đâu nên có khi ăn lẹm 1–2 chữ cuối của từ đứng trước
# ("gia đìnhqcvn.com.vn" → "gia d *(nguồn: inhqcvn.com.vn)*"). Chấp nhận được vì đầu vào
# vốn đã hỏng sẵn, VÀ vì mọi trang hút về đều phải qua người biên tập trước khi lên wiki —
# đừng dựa vào nó để ra bản dùng được ngay.
TEN_MIEN_DINH = re.compile(
    r"(?<=[a-zà-ỹ])((?:[a-z0-9-]+\.)+(?:com|vn|org|net|gov|edu)(?:\.[a-z]{2})?)+")


def don(md: str) -> str:
    """Dọn rác đặc trưng của Google Sites."""
    def tach(m):
        # Bỏ qua nếu đang nằm trong một địa chỉ email / tên miền đầy đủ.
        truoc = m.string[:m.start()]
        if re.search(r"[@\w.-]$", truoc) and "@" in truoc.split()[-1]:
            return m.group(0)
        return f" *(nguồn: {m.group(0)})*"

    md = TEN_MIEN_DINH.sub(tach, md)
    md = "\n".join(d for d in md.split("\n") if d.strip() not in RAC_CHAN_TRANG)
    md = re.sub(r"\n{3,}", "\n\n", md)
    md = re.sub(r"[ \t]+\n", "\n", md)
    return md.strip()


EMBED = re.compile(r"atari-embeds\.googleusercontent\.com/embeds/([a-f0-9]{16,})")


def dem_khoi_nhung(h: str) -> int:
    """Đếm khối "Nhúng" (Embed) trên trang.

    QUAN TRỌNG: nội dung khối nhúng nằm trong iframe KHÁC ORIGIN, tải qua bắt tay
    postMessage — `urllib` lẫn `innerText` của trình duyệt đều KHÔNG thấy. Trang chỉ
    có khối nhúng sẽ ra 0 ký tự và trông y như trang rỗng.

    Đã báo nhầm đúng lỗi này 28/08/2026: kết luận 11/24 trang "rỗng thật", trong khi
    có trang chứa nguyên một tài liệu nhúng. Nên phải đếm và ghi rõ ra.
    """
    return len(set(EMBED.findall(h)))


def slug(s: str) -> str:
    s = urllib.parse.unquote(s).strip("/").split("/")[-1]
    s = s.replace("đ", "d").replace("Đ", "D")
    import unicodedata
    s = "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s or "trang"


def tim_trang(html_goc: str, goc_path: str) -> list[str]:
    """Lấy mọi đường dẫn trang trong site từ thanh điều hướng."""
    duong = re.findall(r'href="(/[^"]*%s[^"]*)"' % re.escape(goc_path.strip("/").split("/")[-1]), html_goc)
    return sorted({urllib.parse.unquote(d) for d in duong if "#" not in d})


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("ra")
    ap.add_argument("--ten", default="")
    ap.add_argument("--nghi", type=float, default=0.7, help="giây nghỉ giữa 2 lượt tải")
    args = ap.parse_args()

    goc = urllib.parse.urlparse(args.url)
    trang_chu = tai(args.url)
    duong = tim_trang(trang_chu, goc.path)
    if not duong:
        print("Không tìm thấy trang con nào — kiểm tra lại URL.", file=sys.stderr)
        sys.exit(1)

    os.makedirs(args.ra, exist_ok=True)
    muc_luc = []
    print(f"Tìm thấy {len(duong)} trang.")

    for i, d in enumerate(duong, 1):
        url = f"{goc.scheme}://{goc.netloc}{urllib.parse.quote(d)}"
        try:
            h = tai(url)
        except Exception as e:  # noqa: BLE001
            print(f"  ✗ {d} — {e}", file=sys.stderr)
            continue

        p = BocNoiDung()
        p.feed(h)
        noi_dung = don(p.ket_qua())

        tieu_de = re.search(r"<title>(.*?)</title>", h, re.S)
        tieu_de = html.unescape(tieu_de.group(1)).strip() if tieu_de else d
        tieu_de = re.sub(r"^.*?\s-\s", "", tieu_de).strip() or d

        # Bỏ khoản đường dẫn gốc để tên file phản ánh cây trang.
        nhanh = [x for x in urllib.parse.unquote(d).strip("/").split("/") if x][2:]
        ten = "__".join(slug(x) for x in nhanh) or "home"
        f = os.path.join(args.ra, f"{ten}.md")

        nhung = dem_khoi_nhung(h)
        fm = {
            "tieuDe": tieu_de,
            "nguon": url,
            "duongDanGoc": urllib.parse.unquote(d),
            "hutLuc": time.strftime("%Y-%m-%d %H:%M"),
            "soKyTu": len(noi_dung),
            "khoiNhung": nhung,
            # Rỗng THẬT khác với "chỉ có khối nhúng nên hút không ra chữ".
            "trangThai": ("co-noi-dung" if len(noi_dung) >= 60
                          else "chi-co-khoi-nhung" if nhung else "rong-that"),
        }
        with open(f, "w", encoding="utf-8") as fh:
            fh.write("---\n")
            for k, v in fm.items():
                fh.write(f"{k}: {json.dumps(v, ensure_ascii=False)}\n")
            fh.write("---\n\n")
            fh.write(noi_dung + "\n")

        muc_luc.append({**fm, "file": os.path.basename(f)})
        ghi = {"co-noi-dung": "", "chi-co-khoi-nhung": f"  ⚠️ {nhung} khối nhúng — KHÔNG hút được",
               "rong-that": "  (rỗng)"}[fm["trangThai"]]
        print(f"  [{i}/{len(duong)}] {tieu_de[:48]:<48} {len(noi_dung):>7} ký tự{ghi}")
        time.sleep(args.nghi)

    with open(os.path.join(args.ra, "_muc-luc.json"), "w", encoding="utf-8") as fh:
        json.dump({"site": args.ten or args.url, "url": args.url, "trang": muc_luc}, fh,
                  ensure_ascii=False, indent=2)
    tong = sum(m["soKyTu"] for m in muc_luc)
    nhung = [m for m in muc_luc if m["trangThai"] == "chi-co-khoi-nhung"]
    rong = [m for m in muc_luc if m["trangThai"] == "rong-that"]
    print(f"\n✓ {len(muc_luc)} trang · {tong:,} ký tự → {args.ra}")
    if nhung:
        print(f"\n⚠️  {len(nhung)} trang CHỈ có khối nhúng — nội dung nằm trong iframe khác")
        print("   origin, script không lấy được. Phải xin file gốc từ người soạn trang:")
        for m in nhung:
            print(f"     · {m['tieuDe']}")
    if rong:
        print(f"\n   {len(rong)} trang rỗng thật (chưa viết gì): "
              + ", ".join(m["tieuDe"] for m in rong[:6])
              + (" …" if len(rong) > 6 else ""))


if __name__ == "__main__":
    main()
