"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/lib/marketing/icons";
import { KHU, crumbFor, khuCua, navCuaKhu } from "@/lib/wiki/nav";
import Search, { type SearchItem } from "@/components/marketing/Search";

type Counts = { analyses: number | null; ideas: number | null };

/**
 * Vỏ của wiki: danh sách khu (Sản phẩm · Marketing video · Vận hành · CSKH · Sales ·
 * Tài chính…) + sidebar của khu đang mở.
 *
 * KHÔNG có phần đăng nhập / đổi giao diện sáng-tối / app launcher — TopNav chung của
 * GWT-App đã lo, đặt thêm ở đây là hai thanh chồng nhau.
 */
export default function WikiShell({
  counts,
  searchIndex,
  children,
}: {
  counts: Counts;
  searchIndex: SearchItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const khu = khuCua(pathname);
  const nav = navCuaKhu(khu);
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
        <Link href="/wiki" className="sidebar-brand" style={{ textDecoration: "none" }}>
          <div className="brand-mark">📚</div>
          <div>
            <div className="brand-name">Wiki GWT</div>
            <div className="brand-sub">Tri thức nội bộ</div>
          </div>
        </Link>

        {/* Danh sách khu — luôn hiện, kể cả ở trang chủ wiki. Khu chưa có nội dung
            vẫn hiện (mờ, không bấm được) để mọi người biết chỗ đó đang trống. */}
        <div className="wiki-khu-ds">
          <h4>Khu wiki</h4>
          {KHU.map((k) =>
            k.href ? (
              <Link
                key={k.ma}
                href={k.href}
                className={`wiki-khu-nut${khu?.ma === k.ma ? " active" : ""}`}
                aria-current={khu?.ma === k.ma ? "page" : undefined}
              >
                <span aria-hidden="true">{k.icon}</span>
                {k.ten}
              </Link>
            ) : (
              <span key={k.ma} className="wiki-khu-nut trong" title={`${k.moTa} — chưa có nội dung`}>
                <span aria-hidden="true">{k.icon}</span>
                {k.ten}
                <em>chưa có</em>
              </span>
            ),
          )}
        </div>

        <nav>
          {nav.map((group) => (
            <div className="nav-group" key={group.heading}>
              <h4>{group.heading}</h4>
              {group.items.map((item) => {
                // Mục "gốc" của khu chỉ active khi khớp ĐÚNG, để nó không sáng trên
                // mọi trang con bên dưới.
                const active = item.href === khu?.href ? pathname === item.href : pathname.startsWith(item.href);
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
          <button className="hamburger" onClick={() => setMenuOpen((v) => !v)} aria-label="Mở menu khu Wiki">
            ☰
          </button>
          <div className="crumb">
            Wiki
            {khu && <> · {khu.ten}</>}
            {crumbFor(pathname) && <> · <b>{crumbFor(pathname)}</b></>}
          </div>
          <div className="topbar-spacer" />
          <Search index={searchIndex} />
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
