import type { IconName } from "../marketing/icons";
import { NAV as NAV_MARKETING } from "../marketing/nav";
import { SAN_PHAM } from "./data/san-pham";
import { NHOM, phanCuaNhom } from "./kieu";

export type NavItem = { href: string; label: string; icon: IconName; badgeKey?: "analyses" | "ideas" };
export type NavGroup = { heading: string; items: NavItem[] };

/**
 * Các KHU của wiki — mỗi phòng ban / mảng nghiệp vụ một khu.
 *
 * Cố ý là một danh sách phẳng mở rộng được, KHÔNG phải hai tab Marketing/Sản phẩm:
 * còn vận hành, CSKH, sales, tài chính… đều sẽ có wiki riêng. Khu chưa có nội dung vẫn
 * hiện (mờ, không bấm được) để mọi người thấy chỗ đó đã có người nhận và đang trống —
 * giấu đi thì ai cũng tưởng chưa ai nghĩ tới và lại đẻ ra một file Google Docs nữa.
 *
 * Thêm khu mới: thêm một dòng ở đây + dựng route dưới `/wiki/<ma>`.
 *
 * Đào tạo KHÔNG tách thành khu riêng: tài liệu đào tạo sale nằm trong khu Sales, đào tạo
 * CSKH nằm trong khu CSKH. Tách ra thì cùng một quy trình bán hàng lại có hai bản — một
 * bản "để làm" và một bản "để dạy" — rồi hai bản lệch nhau, đúng thứ wiki sinh ra để chặn.
 */
export type TrangThaiKhu = "co-noi-dung" | "chua-co";
export type Khu = {
  ma: string;
  ten: string;
  icon: string;
  moTa: string;
  /** Chỉ khu đã có nội dung mới có đường dẫn. */
  href?: string;
  trangThai: TrangThaiKhu;
};

export const KHU: Khu[] = [
  {
    ma: "san-pham",
    ten: "Sản phẩm",
    icon: "💧",
    href: "/wiki/san-pham",
    trangThai: "co-noi-dung",
    moTa: "Sự thật về từng máy: thông số, an toàn, lỗi, hỏi–đáp, và được nói gì với khách.",
  },
  {
    ma: "marketing",
    ten: "Marketing video",
    icon: "🎬",
    href: "/wiki/marketing",
    trangThai: "co-noi-dung",
    moTa: "Cách team làm video: khung 5A/PAAST, luật sửa content, quy trình sản xuất, kho case.",
  },
  {
    ma: "cong-viec-chung",
    ten: "Công việc chung",
    icon: "🧭",
    trangThai: "chua-co",
    moTa: "Cách làm việc chung toàn công ty: quy trình, họp, bàn giao, công cụ nội bộ.",
  },
  {
    ma: "sales",
    ten: "Sales",
    icon: "🛒",
    trangThai: "chua-co",
    moTa: "Đào tạo sale mới, quy trình bán, bảng giá, chính sách chiết khấu, hợp đồng.",
  },
  {
    ma: "cskh",
    ten: "CSKH",
    icon: "🎧",
    trangThai: "chua-co",
    moTa: "Đào tạo CSKH, kịch bản tổng đài, quy trình ticket, bảo hành, xử lý khiếu nại.",
  },
  {
    ma: "van-hanh",
    ten: "Vận hành",
    icon: "⚙️",
    trangThai: "chua-co",
    moTa: "Lắp đặt, bảo trì, kho vận, điều phối kỹ thuật.",
  },
  {
    ma: "tai-chinh",
    ten: "Tài chính",
    icon: "📊",
    trangThai: "chua-co",
    moTa: "Hạch toán, công nợ, quy định chi, đối soát.",
  },
];

/** Đường dẫn hiện tại thuộc khu nào (null = trang chủ wiki). */
export function khuCua(pathname: string): Khu | null {
  return (
    KHU.find((k) => k.href && (pathname === k.href || pathname.startsWith(`${k.href}/`))) ?? null
  );
}

/** Sidebar khu Sản phẩm: mỗi máy một nhóm, bên trong là các nhóm thông tin. */
export function navSanPham(): NavGroup[] {
  return SAN_PHAM.map((sp) => ({
    heading: sp.ten,
    items: [
      { href: `/wiki/san-pham/${sp.ma}`, label: "Tổng quan", icon: "home" as IconName },
      { href: `/wiki/san-pham/${sp.ma}/tra-cuu`, label: "Tra cứu dữ kiện", icon: "grid" as IconName },
      ...NHOM.filter((n) => phanCuaNhom(sp, n.ma).length > 0).map((n) => ({
        href: `/wiki/san-pham/${sp.ma}/nhom/${n.ma}`,
        label: n.ten,
        icon: iconCuaNhom(n.ma),
      })),
    ],
  }));
}

function iconCuaNhom(ma: string): IconName {
  if (ma === "ky-thuat") return "shield";
  if (ma === "san-pham") return "layers";
  if (ma === "truyen-thong") return "edit";
  return "book";
}

export function navCuaKhu(khu: Khu | null): NavGroup[] {
  if (khu?.ma === "marketing") return NAV_MARKETING;
  if (khu?.ma === "san-pham") return navSanPham();
  return [];
}

/** Breadcrumb: khớp đường dẫn dài nhất, để trang con vẫn nhận đúng mục cha. */
export function crumbFor(pathname: string): string {
  const khu = khuCua(pathname);
  const all = navCuaKhu(khu).flatMap((g) => g.items);
  const exact = all.find((i) => i.href === pathname);
  if (exact) return exact.label;
  // Bỏ qua mục gốc của khu (`/wiki/<ma>`) để nó không thành breadcrumb của mọi trang con.
  const prefix = all
    .filter((i) => i.href !== khu?.href && pathname.startsWith(i.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return prefix?.label ?? "";
}
