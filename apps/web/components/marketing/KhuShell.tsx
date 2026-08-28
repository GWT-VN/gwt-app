"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/lib/marketing/icons";
import { NAV, crumbFor } from "@/lib/marketing/nav";
import Search, { type SearchItem } from "./Search";

type Counts = { analyses: number | null; ideas: number | null };

/**
 * Vỏ của khu Marketing: sidebar phụ + thanh phụ đề.
 *
 * KHÔNG có phần đăng nhập / đổi giao diện sáng-tối / app launcher — TopNav chung của
 * GWT-App đã lo, đặt thêm ở đây là hai thanh chồng nhau.
 */
export default function KhuShell({
  counts,
  searchIndex,
  children,
}: {
  counts: Counts;
  searchIndex: SearchItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // Điều hướng xong thì đóng drawer sidebar trên mobile.
  // Chỉnh state NGAY TRONG RENDER khi pathname đổi (khuôn "adjusting state when a prop
  // changes" của React) thay vì useEffect: bằng effect thì trang mới vẽ ra một nhịp với
  // menu còn mở rồi mới đóng — chớp một cái, và eslint chặn setState-trong-effect.
  const [duongCu, setDuongCu] = useState(pathname);
  if (duongCu !== pathname) {
    setDuongCu(pathname);
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar${menuOpen ? " open" : ""}`} id="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">💧</div>
          <div>
            <div className="brand-name">Marketing OS</div>
            <div className="brand-sub">Khung · luật · dữ liệu</div>
          </div>
        </div>
        <nav>
          {NAV.map((group) => (
            <div className="nav-group" key={group.heading}>
              <h4>{group.heading}</h4>
              {group.items.map((item) => {
                const active =
                  item.href === "/marketing" ? pathname === "/marketing" : pathname.startsWith(item.href);
                const Ic = Icon[item.icon];
                const badge = item.badgeKey ? counts[item.badgeKey] : null;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item${active ? " active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="ni-ic"><Ic /></span>
                    {item.label}
                    {badge != null && <span className="nav-badge">{badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {menuOpen && <div className="scrim on" onClick={() => setMenuOpen(false)} aria-hidden="true" style={{ zIndex: 55 }} />}

      <div className="main">
        <header className="topbar">
          <button className="hamburger" onClick={() => setMenuOpen((v) => !v)} aria-label="Mở menu khu Marketing">
            ☰
          </button>
          <div className="crumb">
            Marketing{crumbFor(pathname) && <> · <b>{crumbFor(pathname)}</b></>}
          </div>
          <div className="topbar-spacer" />
          <Search index={searchIndex} />
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
