'use client'
// PROTOTYPE — Phương án C: thanh icon hẹp (rê/focus mở trang con) + Bắp gắn vào chỗ đang làm:
// dải gợi ý đầu trang, nút "Hỏi Bắp" trên từng dòng, ô nhờ Bắp nổi góc phải.
import { useEffect, useState } from 'react'
import { BookOpen, Headset, ListChecks, Package, Search, Settings, ShoppingCart, Sparkles, X, Clock, Home, MoreHorizontal } from 'lucide-react'
import { KHU, TRANG_CSKH, type Dong, type Tin } from './data'
import { NoiDung } from './NoiDung'
import { KhungChat } from './Agent'

export const TEN_C = 'Thanh icon + Bắp gắn tại chỗ'

const ICON: Record<string, typeof Home> = { viec: ListChecks, cskh: Headset, sales: ShoppingCart, kho: Package, wiki: BookOpen }

export function VariantC() {
  const [bapMo, setBapMo] = useState(false)
  const [phien, setPhien] = useState(0)
  const [boiCanh, setBoiCanh] = useState('CSKH · Việc hôm nay')
  const [tinDau, setTinDau] = useState<Tin[]>([])
  const [goiY, setGoiY] = useState([true, true])

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') { e.preventDefault(); setBapMo((v) => !v) } }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const hoiBap = (d: Dong) => {
    setBoiCanh(`${d.ma} · ${d.khach}`)
    setTinDau([{ ai: 'bap', noiDung: `${d.ma} — ${d.viec}. Chủ: ${d.chu}, hạn ${d.han}. Muốn mình làm gì: nhắc chủ ticket, tóm tắt lịch sử, hay soạn tin cho khách?` }])
    setPhien((p) => p + 1)
    setBapMo(true)
  }

  return (
    <div className="proto pC">
      <nav className="pC-rail" aria-label="Điều hướng chính">
        <span className="ui-sidebar-mark" aria-hidden>GWT</span>
        {KHU.map((k) => {
          const I = ICON[k.id]
          return (
            <div key={k.id} className="pC-muc">
              <button className="pC-nut" aria-current={k.id === 'cskh' ? 'true' : undefined} style={{ ['--khu' as string]: k.mau }} aria-label={k.ten}>
                <I aria-hidden />
                <span className="pC-nhan">{k.ten}</span>
                {k.soGap ? <span className="pC-dem">{k.soGap}</span> : null}
              </button>
              <div className="ui-menu pC-bay" role="menu">
                <div className="ui-menu-label">{k.ten}</div>
                {(k.id === 'cskh' ? TRANG_CSKH.flatMap((t) => (t.con ? t.con : [t.ten])) : ['Tổng quan', 'Danh sách']).map((t) => (
                  <button key={t} className="ui-menu-item" role="menuitem">{t}</button>
                ))}
              </div>
            </div>
          )
        })}
        <span style={{ flex: 1 }} />
        <button className="pC-nut" aria-label="Tìm"><Search aria-hidden /><span className="pC-nhan">Tìm</span></button>
        <button className="pC-nut" aria-label="Quản trị"><Settings aria-hidden /><span className="pC-nhan">Quản trị</span></button>
        <span className="p-avatar" aria-label="Kiều Trang (demo)">KT</span>
      </nav>

      <main className="pC-noidung">
        <div className="pC-goiy" aria-label="Bắp gợi ý">
          {goiY[0] && (
            <div className="pC-goiy-o">
              <Sparkles className="ui-icon" aria-hidden />
              <span><b>TK-2611-043</b> quá hạn 1 ngày, Kiều Trang chưa cập nhật. Nhắc qua Discord?</span>
              <button className="ui-btn" data-size="sm">Nhắc</button>
              <button className="ui-btn" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Bỏ qua gợi ý" onClick={() => setGoiY(([, b]) => [false, b])}><X aria-hidden /></button>
            </div>
          )}
          {goiY[1] && (
            <div className="pC-goiy-o">
              <Clock className="ui-icon" aria-hidden />
              <span>Đã hứa gọi lại anh An trước <b>16:00</b>. Đặt lời nhắc 15:30?</span>
              <button className="ui-btn" data-size="sm" data-variant="outline">Đặt nhắc</button>
              <button className="ui-btn" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Bỏ qua gợi ý" onClick={() => setGoiY(([a]) => [a, false])}><X aria-hidden /></button>
            </div>
          )}
        </div>
        <NoiDung hoiBap={hoiBap} />
      </main>

      {bapMo ? (
        <div className="pC-bap" role="dialog" aria-label="Bắp">
          <div className="pA-bap-dau">
            <Sparkles className="ui-icon" aria-hidden /><b>Bắp</b>
            <span style={{ flex: 1 }} />
            <button className="ui-btn" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Đóng Bắp" onClick={() => setBapMo(false)}><X aria-hidden /></button>
          </div>
          <KhungChat key={phien} boiCanh={boiCanh} tinDau={tinDau} />
        </div>
      ) : (
        <button className="pC-mo-bap" onClick={() => { setBoiCanh('CSKH · Việc hôm nay'); setTinDau([]); setPhien((p) => p + 1); setBapMo(true) }}>
          <Sparkles aria-hidden /> Nhờ Bắp… <kbd className="p-kbd">⌘J</kbd>
        </button>
      )}

      <nav className="pC-tab" aria-label="Điều hướng điện thoại">
        <button aria-current="page"><Home aria-hidden />Hôm nay</button>
        <button><ListChecks aria-hidden />Ticket</button>
        <button><Headset aria-hidden />Khách</button>
        <button onClick={() => setBapMo(true)}><Sparkles aria-hidden />Bắp</button>
        <button><MoreHorizontal aria-hidden />Thêm</button>
      </nav>
    </div>
  )
}
