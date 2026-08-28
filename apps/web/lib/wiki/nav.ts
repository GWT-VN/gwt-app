import type { IconName } from "../marketing/icons";
import { NAV as NAV_MARKETING } from "../marketing/nav";
import { SAN_PHAM } from "./data/san-pham";
import { NHOM, phanCuaNhom } from "./kieu";

export type NavItem = { href: string; label: string; icon: IconName; badgeKey?: "analyses" | "ideas" };
export type NavGroup = { heading: string; items: NavItem[] };

/** Hai nhánh của khu Wiki. Thanh chuyển nhánh nằm ngay dưới logo ở sidebar. */
export type MaNhanh = "marketing" | "san-pham";
export const NHANH: { ma: MaNhanh; ten: string; href: string; icon: string; moTa: string }[] = [
  {
    ma: "marketing",
    ten: "Marketing",
    href: "/wiki/marketing",
    icon: "🎬",
    moTa: "Cách team làm video: khung chiến lược, luật sửa content, quy trình sản xuất, kho case.",
  },
  {
    ma: "san-pham",
    ten: "Sản phẩm",
    href: "/wiki/san-pham",
    icon: "💧",
    moTa: "Sự thật về từng máy: thông số, an toàn, lỗi, hỏi–đáp, quy tắc được nói gì với khách.",
  },
];

/** Đường dẫn hiện tại thuộc nhánh nào (null = trang chủ Wiki). */
export function nhanhCua(pathname: string): MaNhanh | null {
  if (pathname.startsWith("/wiki/marketing")) return "marketing";
  if (pathname.startsWith("/wiki/san-pham")) return "san-pham";
  return null;
}

/** Sidebar nhánh Sản phẩm: mỗi máy một nhóm, bên trong là 4 nhóm thông tin. */
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

export function navCuaNhanh(nhanh: MaNhanh | null): NavGroup[] {
  if (nhanh === "marketing") return NAV_MARKETING;
  if (nhanh === "san-pham") return navSanPham();
  return [];
}

/** Breadcrumb: khớp đường dẫn dài nhất, để trang con vẫn nhận đúng nhóm cha. */
export function crumbFor(pathname: string): string {
  const all = navCuaNhanh(nhanhCua(pathname)).flatMap((g) => g.items);
  const exact = all.find((i) => i.href === pathname);
  if (exact) return exact.label;
  const prefix = all
    .filter((i) => pathname.startsWith(i.href) && i.href.split("/").length > 3)
    .sort((a, b) => b.href.length - a.href.length)[0];
  return prefix?.label ?? "";
}
