'use client'
// PROTOTYPE — Phương án B: thanh trên 2 tầng (đúng spec mục 5) + agent nằm trong thanh lệnh ⌘K (tìm và hỏi chung một ô).
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, CornerDownLeft, LayoutGrid, Search, Settings, Sparkles, Bell, ArrowRight } from 'lucide-react'
import { KHU, KHU_SAP_CO, TRANG_CSKH, VIEC_HOM_NAY, GOI_Y_BAP, traLoiMau, type Tin } from './data'
import { NoiDung } from './NoiDung'
import { TheTraLoi } from './Agent'

export const TEN_B = 'Thanh trên 2 tầng + Bắp trong ⌘K'

const bo = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()

export function VariantB() {
  const [lenh, setLenh] = useState(false)
  const [q, setQ] = useState('')
  const [traLoi, setTraLoi] = useState<{ cau: string; tin: Tin } | null>(null)
  const [launcher, setLauncher] = useState(false)
  const [xo, setXo] = useState<string | null>(null)
  const oRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setLenh(true) }
      if (e.key === 'Escape') { setLenh(false); setLauncher(false); setXo(null) }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])
  useEffect(() => { if (lenh) { setTraLoi(null); setTimeout(() => oRef.current?.focus(), 0) } }, [lenh])

  const ketQua = useMemo(() => {
    if (!q.trim()) return []
    const k = bo(q)
    const dong = VIEC_HOM_NAY.flatMap((x) => x.dong).filter((d) => d.ma.startsWith('TK'))
    const uniq = [...new Map(dong.map((d) => [d.ma, d])).values()]
    return uniq.filter((d) => bo(d.ma + ' ' + d.khach + ' ' + d.viec).includes(k)).slice(0, 4)
  }, [q])

  const hoi = (cau: string) => setTraLoi({ cau, tin: traLoiMau(cau) })

  return (
    <div className="proto pB">
      <header className="pB-t1">
        <span className="ui-sidebar-mark" aria-hidden>GWT</span>
        <nav className="pB-khu" aria-label="Khu">
          {KHU.map((k) => (
            <button key={k.id} className="pB-khu-muc" aria-current={k.id === 'cskh' ? 'true' : undefined} style={{ ['--khu' as string]: k.mau }}>
              {k.ten}{k.soGap ? <span className="pB-dem">{k.soGap}</span> : null}
            </button>
          ))}
        </nav>
        <button className="pB-o-lenh" onClick={() => setLenh(true)}>
          <Search className="ui-icon" aria-hidden />
          <span className="pB-o-lenh-chu">Tìm SĐT, serial, mã… hoặc hỏi Bắp</span>
          <kbd className="p-kbd tren-toi">⌘K</kbd>
        </button>
        <div style={{ position: 'relative' }}>
          <button className="pB-icon" aria-label="Tất cả khu" aria-expanded={launcher} onClick={() => setLauncher((v) => !v)}><LayoutGrid aria-hidden /></button>
          {launcher && (
            <div className="ui-menu pB-launcher">
              <div className="ui-menu-label">Tất cả khu</div>
              <div className="pB-luoi">
                {[...KHU, ...KHU_SAP_CO].map((k) => (
                  <button key={k.id} className="pB-luoi-o" disabled={k.sapCo}>
                    <span className="pB-luoi-mau" style={{ background: k.sapCo ? 'var(--gray-200)' : k.mau }} aria-hidden />
                    {k.ten}{k.sapCo ? <span className="ui-caption">sắp có</span> : null}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button className="pB-icon" aria-label="Thông báo"><Bell aria-hidden /></button>
        <button className="pB-icon" aria-label="Quản trị"><Settings aria-hidden /></button>
        <span className="p-avatar tren-toi" aria-label="Kiều Trang (demo)">KT</span>
      </header>
      <nav className="pB-t2" aria-label="Trang của CSKH">
        {TRANG_CSKH.map((t) => (
          <div key={t.ten} style={{ position: 'relative' }}>
            <button className="pB-trang" aria-current={t.ten === 'Việc hôm nay' ? 'page' : undefined} aria-expanded={t.con ? xo === t.ten : undefined} onClick={() => t.con && setXo(xo === t.ten ? null : t.ten)}>
              {t.ten}{t.dem ? <span className="ui-badge">{t.dem}</span> : null}{t.con ? <ChevronDown className="ui-icon" aria-hidden /> : null}
            </button>
            {t.con && xo === t.ten && (
              <div className="ui-menu pB-xo">{t.con.map((c) => <button key={c} className="ui-menu-item">{c}</button>)}</div>
            )}
          </div>
        ))}
      </nav>
      <main className="pB-noidung"><NoiDung /></main>

      {lenh && (
        <div className="pB-lenh-nen" onClick={() => setLenh(false)}>
          <div className="ui-menu pB-lenh" role="dialog" aria-label="Tìm hoặc hỏi Bắp" onClick={(e) => e.stopPropagation()}>
            <form className="ui-menu-search" onSubmit={(e) => { e.preventDefault(); if (q.trim()) hoi(q) }}>
              <Search className="ui-icon" aria-hidden />
              <input ref={oRef} value={q} onChange={(e) => { setQ(e.target.value); setTraLoi(null) }} placeholder="Gõ mã ticket, tên khách, SĐT… hoặc câu nhờ Bắp" aria-label="Tìm hoặc hỏi Bắp" />
              <kbd className="p-kbd">Esc</kbd>
            </form>
            {traLoi ? (
              <div className="pB-traloi">
                <div className="ui-menu-label"><Sparkles size={12} aria-hidden /> Bắp trả lời “{traLoi.cau}”</div>
                <div className="p-tin bap"><div className="p-tin-noidung">{traLoi.tin.noiDung}</div>{traLoi.tin.the && <TheTraLoi tin={traLoi.tin} />}</div>
                <button className="ui-btn" data-variant="ghost" data-size="sm" onClick={() => setTraLoi(null)}>← Quay lại kết quả</button>
              </div>
            ) : (
              <div className="ui-menu-list" style={{ maxHeight: 360 }}>
                {q.trim() ? (
                  <>
                    <div className="ui-menu-label">Ticket</div>
                    {ketQua.length ? ketQua.map((d, i) => (
                      <button key={d.ma} className="ui-menu-item" data-highlighted={i === 0 ? '' : undefined}>
                        <span className="ui-code">{d.ma}</span>{d.khach}<span className="ui-menu-shortcut">{d.viec.slice(0, 28)}…</span>
                      </button>
                    )) : <div className="ui-menu-empty">Không có ticket nào khớp “{q}”.</div>}
                    <div className="ui-menu-sep" />
                    <button className="ui-menu-item" onClick={() => hoi(q)}>
                      <Sparkles className="ui-icon" aria-hidden />Hỏi Bắp: “{q}”<span className="ui-menu-shortcut"><CornerDownLeft size={12} aria-hidden /></span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="ui-menu-label">Nhờ Bắp</div>
                    {GOI_Y_BAP.map((g) => (
                      <button key={g} className="ui-menu-item" onClick={() => { setQ(g); hoi(g) }}><Sparkles className="ui-icon" aria-hidden />{g}</button>
                    ))}
                    <div className="ui-menu-sep" />
                    <div className="ui-menu-label">Đi tới</div>
                    {['Danh sách ticket', 'Tạo ticket', 'Lịch bảo trì', 'Việc của tôi'].map((g) => (
                      <button key={g} className="ui-menu-item"><ArrowRight className="ui-icon" aria-hidden />{g}</button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
