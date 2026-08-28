import type { IconName } from "./icons";

export type NavItem = { href: string; label: string; icon: IconName; badgeKey?: "analyses" | "ideas" };
export type NavGroup = { heading: string; items: NavItem[] };

/** Sidebar phụ của khu Marketing (nằm dưới TopNav chung của GWT-App). */
export const NAV: NavGroup[] = [
  { heading: "Bắt đầu", items: [{ href: "/marketing", label: "Trang chủ", icon: "home" }] },
  {
    heading: "Khung làm việc",
    items: [
      { href: "/marketing/khung/5a", label: "Chiến lược 5A", icon: "layers" },
      { href: "/marketing/khung/paast", label: "Khung PAAST", icon: "grid" },
      { href: "/marketing/khung/luat-sua", label: "Luật sửa content", icon: "edit" },
      { href: "/marketing/khung/quy-trinh", label: "Quy trình sản xuất", icon: "film" },
      { href: "/marketing/khung/seci", label: "SECI playbook", icon: "refresh" },
    ],
  },
  { heading: "Luật & tuân thủ", items: [{ href: "/marketing/luat", label: "Luật QC & nguồn", icon: "shield" }] },
  {
    heading: "Dữ liệu",
    items: [
      { href: "/marketing/du-lieu/phan-tich-video", label: "Phân tích video", icon: "chart", badgeKey: "analyses" },
      { href: "/marketing/du-lieu/video-ideas", label: "Video Ideas", icon: "bulb", badgeKey: "ideas" },
    ],
  },
  { heading: "Học hỏi", items: [{ href: "/marketing/kho-case", label: "Kho case WIN / FAIL", icon: "book" }] },
];

/** Breadcrumb: khớp đường dẫn dài nhất (để /marketing/luat/<slug> vẫn nhận nhóm Luật QC). */
export function crumbFor(pathname: string): string {
  const all = NAV.flatMap((g) => g.items);
  const exact = all.find((i) => i.href === pathname);
  if (exact) return exact.label;
  const prefix = all
    .filter((i) => i.href !== "/marketing" && pathname.startsWith(i.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return prefix?.label ?? "";
}
