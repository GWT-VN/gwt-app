import type { IconName } from "./icons";

export type NavItem = { href: string; label: string; icon: IconName; badgeKey?: "analyses" | "ideas" };
export type NavGroup = { heading: string; items: NavItem[] };

/** Sidebar phụ của khu Marketing (nằm dưới TopNav chung của GWT-App). */
export const NAV: NavGroup[] = [
  { heading: "Bắt đầu", items: [{ href: "/wiki/marketing", label: "Trang chủ", icon: "home" }] },
  {
    heading: "Khung làm việc",
    items: [
      { href: "/wiki/marketing/khung/5a", label: "Chiến lược 5A", icon: "layers" },
      { href: "/wiki/marketing/khung/paast", label: "Khung PAAST", icon: "grid" },
      { href: "/wiki/marketing/khung/luat-sua", label: "Luật sửa content", icon: "edit" },
      { href: "/wiki/marketing/khung/quy-trinh", label: "Quy trình sản xuất", icon: "film" },
      { href: "/wiki/marketing/khung/seci", label: "SECI playbook", icon: "refresh" },
    ],
  },
  { heading: "Luật & tuân thủ", items: [{ href: "/wiki/marketing/luat", label: "Luật QC & nguồn", icon: "shield" }] },
  {
    heading: "Dữ liệu",
    items: [
      { href: "/wiki/marketing/du-lieu/phan-tich-video", label: "Phân tích video", icon: "chart", badgeKey: "analyses" },
      { href: "/wiki/marketing/du-lieu/video-ideas", label: "Video Ideas", icon: "bulb", badgeKey: "ideas" },
    ],
  },
  { heading: "Học hỏi", items: [{ href: "/wiki/marketing/kho-case", label: "Kho case WIN / FAIL", icon: "book" }] },
];

/** Breadcrumb: khớp đường dẫn dài nhất (để /marketing/luat/<slug> vẫn nhận nhóm Luật QC). */
export function crumbFor(pathname: string): string {
  const all = NAV.flatMap((g) => g.items);
  const exact = all.find((i) => i.href === pathname);
  if (exact) return exact.label;
  const prefix = all
    .filter((i) => i.href !== "/wiki/marketing" && pathname.startsWith(i.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return prefix?.label ?? "";
}
