import "server-only";
import { buildSearchIndex as buildMarketing } from "../marketing/search-index";
import type { SearchItem } from "@/components/marketing/Search";
import { SAN_PHAM } from "./data/san-pham";
import { NHOM, phanCuaNhom } from "./kieu";

/**
 * Chỉ mục tìm kiếm chung cho cả khu Wiki: nhánh Marketing (giữ nguyên) + nhánh Sản phẩm.
 *
 * Nhánh Sản phẩm đưa vào cả **mã dữ kiện `F-xxx`** — đó là cách tra thật sự của tài liệu
 * ("mọi câu nói phải truy được về một mã"), nên gõ `F-C17` phải ra ngay.
 *
 * ⚠️ Chỉ mục này đi vào bundle client. Chỉ nhét TIÊU ĐỀ và mã, **không nhét giá trị dữ kiện** —
 * mục K (doanh thu, tồn kho, chiết khấu) và các dòng 🔴 không được rò ra ngoài chỉ mục.
 */
export function buildSearchIndex(): SearchItem[] {
  const sanPham: SearchItem[] = SAN_PHAM.flatMap((sp) => [
    { href: `/wiki/san-pham/${sp.ma}`, title: sp.ten, kind: `Sản phẩm · ${sp.maNoiBo}` },
    { href: `/wiki/san-pham/${sp.ma}/tra-cuu`, title: `Tra cứu dữ kiện — ${sp.ten}`, kind: "Sản phẩm" },
    ...NHOM.filter((n) => phanCuaNhom(sp, n.ma).length > 0).map((n) => ({
      href: `/wiki/san-pham/${sp.ma}/nhom/${n.ma}`,
      title: `${n.ten} — ${sp.ten}`,
      kind: `Sản phẩm · ${n.vai.join(" · ")}`,
    })),
    ...sp.phan
      .filter((p) => p.coNoiDung)
      .map((p) => ({
        href: `/wiki/san-pham/${sp.ma}/phan/${p.slug}`,
        title: `Phần ${p.so} — ${p.ten}`,
        kind: `Sản phẩm · ${sp.ten}`,
      })),
    // Mã dữ kiện: gõ "F-C17" ra thẳng dòng đó trong trang Tra cứu.
    ...sp.facts.map((f) => ({
      href: `/wiki/san-pham/${sp.ma}/tra-cuu#${f.ma}`,
      title: `${f.ma} — ${boDauMd(f.duKien)}`,
      kind: `Dữ kiện · ${f.tenNhom}`,
    })),
  ]);

  return [...buildMarketing(), ...sanPham];
}

/** Bỏ cú pháp markdown thô để tiêu đề trong ô tìm kiếm không lộ ra `**`, `` ` ``. */
function boDauMd(s: string): string {
  return s.replace(/[*`_]/g, "").replace(/\s+/g, " ").trim();
}
