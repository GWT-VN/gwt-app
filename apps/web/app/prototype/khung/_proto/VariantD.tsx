'use client'
// PROTOTYPE — Phương án D/E (theo ảnh mẫu người dùng gửi 18/11): thanh icon chọn khu + panel menu phẳng của khu.
// D: Bắp là một icon trên thanh — bấm thì panel menu đổi thành khung chat.
// E: cùng khung, Bắp mở thành panel riêng bên phải, menu giữ nguyên.
import { useEffect, useState } from 'react'
// Icon: Phosphor (chốt 18/11) — bản thường "regular", mục đang chọn trên thanh icon dùng bản "fill" như ChatGPT
import {
  ChartBar as BarChart3, Bell, BookOpen, CalendarCheck, CalendarBlank as CalendarDays, CheckSquare as Check, CaretLeft as ChevronLeft,
  Clock, Funnel as Filter, Headset as Headphones, Tray as Inbox, SquaresFour as LayoutGrid, ListChecks, List as Menu, Package, Plus,
  Repeat, MagnifyingGlass as Search, GearSix as Settings, ShieldCheck, ShoppingCart, Sparkle as Sparkles, Ticket, Users, Wrench, X,
  SealCheck as BadgeCheck, User as UserRound, Receipt as ReceiptText, Cpu, type Icon as LucideIcon,
} from '@phosphor-icons/react'
import { KHU, KHU_SAP_CO, PANEL_THEO_KHU, GAN_DAY } from './data'
import { NoiDung } from './NoiDung'
import { KhungChat } from './Agent'

export const TEN_D = 'Icon + panel menu · Bắp trong panel'
export const TEN_E = 'Icon + panel menu · Bắp bên phải'

const ICON_KHU: Record<string, LucideIcon> = { viec: ListChecks, cskh: Headphones, sales: ShoppingCart, kho: Package, wiki: BookOpen }
const ICON_MUC: Record<string, LucideIcon> = {
  check: Check, users: Users, badge: BadgeCheck, chart: BarChart3, repeat: Repeat, today: CalendarCheck, ticket: Ticket,
  shield: ShieldCheck, calendar: CalendarDays, wrench: Wrench, book: BookOpen, cart: ShoppingCart, inbox: Inbox, package: Package,
}
const ICON_GAN_DAY: Record<string, LucideIcon> = { ticket: Ticket, khach: UserRound, don: ReceiptText, may: Cpu }

function Khung({ che }: { che: 'panel' | 'phai' | 'dock' }) {
  const bapTrongPanel = che === 'panel'
  const [khu, setKhu] = useState('cskh')
  const [bap, setBap] = useState(false)
  const [menuMo, setMenuMo] = useState(false)
  const [xemThem, setXemThem] = useState(false)
  const [launcher, setLauncher] = useState(false)
  const k = KHU.find((x) => x.id === khu)!
  const p = PANEL_THEO_KHU[khu]

  // ?bap=mo → mở sẵn Bắp (gửi link xem trạng thái đang mở)
  useEffect(() => { if (new URLSearchParams(location.search).get('bap') === 'mo') setBap(true) }, [])
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') { e.preventDefault(); setBap((v) => !v) }
      if (e.key === 'Escape') setLauncher(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const chonKhu = (id: string) => { setKhu(id); if (bapTrongPanel) setBap(false) }
  const panelLaBap = bapTrongPanel && bap

  return (
    <div className="proto pD" data-bap-phai={!bapTrongPanel && bap ? 'mo' : undefined}>
      <div className="pD-trai" data-mo={menuMo}>
        <nav className="pD-rail" aria-label="Khu">
          <span className="ui-sidebar-mark pD-logo" aria-hidden>GWT</span>
          {KHU.map((x) => {
            const I = ICON_KHU[x.id]
            const dangChon = x.id === khu && !panelLaBap
            return (
              <button key={x.id} className="pD-icon" aria-label={x.ten} data-tip={x.ten} aria-current={dangChon ? 'true' : undefined} style={{ ['--khu' as string]: x.mau }} onClick={() => chonKhu(x.id)}>
                <I aria-hidden weight={dangChon ? 'fill' : 'regular'} />
                {x.soGap ? <span className="pD-cham" aria-label={`${x.soGap} việc gấp`} /> : null}
              </button>
            )
          })}
          <div className="pD-ngan" />
          {che !== 'dock' && (
            <button className="pD-icon" aria-label="Bắp (⌘J)" data-tip="Bắp (⌘J)" aria-pressed={bap} aria-current={panelLaBap ? 'true' : undefined} onClick={() => { setBap((v) => !v); setMenuMo(bapTrongPanel ? menuMo : false) }}>
              <Sparkles aria-hidden weight={panelLaBap ? 'fill' : 'regular'} />
            </button>
          )}
          <div style={{ position: 'relative' }}>
            <button className="pD-icon" aria-label="Tất cả khu" data-tip="Tất cả khu" aria-expanded={launcher} onClick={() => setLauncher((v) => !v)}><LayoutGrid aria-hidden /></button>
            {launcher && (
              <div className="ui-menu pD-launcher">
                <div className="ui-menu-label">Tất cả khu</div>
                {[...KHU, ...KHU_SAP_CO].map((x) => (
                  <button key={x.id} className="ui-menu-item" aria-disabled={x.sapCo || undefined} onClick={() => { if (!x.sapCo) { chonKhu(x.id); setLauncher(false) } }}>
                    <span className="p-cham" style={{ background: x.sapCo ? 'var(--gray-250)' : x.mau }} aria-hidden />{x.ten}
                    {x.sapCo ? <span className="ui-menu-shortcut">sắp có</span> : null}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span style={{ flex: 1 }} />
          <button className="pD-icon" aria-label="Quản trị" data-tip="Quản trị"><Settings aria-hidden /></button>
          <span className="p-avatar pD-avatar" title="Kiều Trang (demo)">KT</span>
        </nav>

        <aside className="pD-panel" aria-label={panelLaBap ? 'Bắp' : `Menu ${k.ten}`}>
          {panelLaBap ? (
            <>
              <div className="pD-dau">
                <button className="ui-btn" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label={`Về menu ${k.ten}`} onClick={() => setBap(false)}><ChevronLeft aria-hidden /></button>
                <span className="pD-tieude"><Sparkles className="ui-icon" aria-hidden /> Bắp</span>
              </div>
              <KhungChat boiCanh={khu === 'cskh' ? 'CSKH · Việc hôm nay — 1 ca khẩn, 2 việc quá hạn' : `Khu ${k.ten}`} />
            </>
          ) : (
            <>
              <div className="pD-dau">
                <span className="pD-tieude"><span className="p-cham" style={{ background: k.mau }} aria-hidden />{k.ten}</span>
                <span style={{ flex: 1 }} />
                <button className="ui-btn" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Thông báo"><Bell aria-hidden /></button>
                <button className="ui-btn" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Tìm (⌘K)"><Search aria-hidden /></button>
                <button className="ui-btn pD-chi-mobile" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Đóng menu" onClick={() => setMenuMo(false)}><X aria-hidden /></button>
              </div>
              <div className="pD-cuon">
                {p.tao && <button className="ui-sidebar-item"><Plus className="ui-icon" aria-hidden />{p.tao}</button>}
                <div className="pD-nhom">
                  {p.muc.map((m, i) => {
                    const I = ICON_MUC[m.icon] ?? BookOpen
                    return (
                      <button key={m.ten} className="ui-sidebar-item" aria-current={khu === 'cskh' && i === 0 ? 'page' : undefined}>
                        <I className="ui-icon" aria-hidden />{m.ten}{m.dem ? <span className="pD-so">{m.dem}</span> : null}
                      </button>
                    )
                  })}
                </div>
                {p.daLuu.length > 0 && (
                  <div className="pD-nhom">
                    <div className="pD-nhan">Bộ lọc đã lưu</div>
                    {p.daLuu.map((t) => <button key={t} className="ui-sidebar-item"><Filter className="ui-icon" aria-hidden />{t}</button>)}
                  </div>
                )}
                <div className="pD-nhom">
                  <div className="pD-nhan">Gần đây</div>
                  {(xemThem ? [...GAN_DAY, ...GAN_DAY.slice(0, 3)] : GAN_DAY).map((g, i) => {
                    const I = ICON_GAN_DAY[g.loai] ?? Clock
                    return <button key={i} className="ui-sidebar-item pD-gan"><I className="ui-icon" aria-hidden /><span className="pD-cat">{g.ten}</span></button>
                  })}
                  <button className="pD-xemthem" onClick={() => setXemThem((v) => !v)}>{xemThem ? 'Thu gọn' : 'Xem thêm'}</button>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
      {menuMo && <div className="ui-overlay pD-phu" onClick={() => setMenuMo(false)} />}

      <div className="pD-main">
        <header className="pD-top">
          <button className="ui-btn" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Mở menu" onClick={() => setMenuMo(true)}><Menu aria-hidden /></button>
          <b>{k.ten}</b>
          <span style={{ flex: 1 }} />
          {che !== 'dock' && <button className="ui-btn" data-variant="outline" data-size="sm" onClick={() => setBap(true)}><Sparkles aria-hidden /> Bắp</button>}
        </header>
        <main className="pD-noidung"><NoiDung /></main>
      </div>

      {/* D: panel Bắp bên phải chỉ dùng trên điện thoại (toàn màn); desktop Bắp nằm trong panel menu */}
      {/* F: Bắp là nút dock góc dưới phải; bấm mở khung chat nổi phía trên nút. Số trên nút = gợi ý Bắp chủ động đưa ra. */}
      {che === 'dock' && (
        <>
          {bap && (
            <div className="pF-pop" role="dialog" aria-label="Bắp">
              <div className="pA-bap-dau">
                <Sparkles className="ui-icon" aria-hidden /><b>Bắp</b><span className="ui-caption">trợ lý trong app · ⌘J</span>
                <span style={{ flex: 1 }} />
                <button className="ui-btn" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Đóng Bắp" onClick={() => setBap(false)}><X aria-hidden /></button>
              </div>
              <KhungChat
                boiCanh={khu === 'cskh' ? 'CSKH · Việc hôm nay — 1 ca khẩn, 2 việc quá hạn' : `Khu ${k.ten}`}
                tinDau={khu === 'cskh' ? [{ ai: 'bap', noiDung: '2 việc nên để ý: TK-2611-043 quá hạn 1 ngày (Kiều Trang chưa cập nhật) · đã hứa gọi lại anh An trước 16:00. Mình nhắc giúp nhé?' }] : []}
              />
            </div>
          )}
          <button className="pF-dock" aria-label={bap ? 'Đóng Bắp' : 'Mở Bắp (⌘J) — 2 gợi ý'} title="Bắp (⌘J)" aria-expanded={bap} onClick={() => setBap((v) => !v)}>
            {bap ? <X aria-hidden /> : <Sparkles aria-hidden />}
            {!bap && khu === 'cskh' && <span className="pF-dock-so" aria-hidden>2</span>}
          </button>
        </>
      )}

      {bap && che !== 'dock' && (
        <aside className={'pD-bap' + (bapTrongPanel ? ' chi-mobile' : '')} aria-label="Bắp">
          <div className="pA-bap-dau">
            <Sparkles className="ui-icon" aria-hidden /><b>Bắp</b><span className="ui-caption">trợ lý trong app</span>
            <span style={{ flex: 1 }} />
            <button className="ui-btn" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Đóng Bắp" onClick={() => setBap(false)}><X aria-hidden /></button>
          </div>
          <KhungChat boiCanh={khu === 'cskh' ? 'CSKH · Việc hôm nay — 1 ca khẩn, 2 việc quá hạn' : `Khu ${k.ten}`} />
        </aside>
      )}
    </div>
  )
}

export const TEN_F = 'Icon + panel menu · Bắp dock góc phải · bảng nhẹ'
export function VariantD() { return <Khung che="panel" /> }
export function VariantE() { return <Khung che="phai" /> }
export function VariantF() { return <Khung che="dock" /> }
