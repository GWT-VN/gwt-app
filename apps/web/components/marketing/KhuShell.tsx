"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  useEffect(() => setMenuOpen(false), [pathname]);

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
