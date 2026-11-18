'use client'
// PROTOTYPE — Phương án A: Sidebar trái (shadcn Sidebar) + agent là panel chat bên phải.
import { useEffect, useState } from 'react'
import { Bell, ChevronDown, ChevronRight, Menu, Search, Settings, Sparkles, X } from 'lucide-react'
import { KHU, KHU_SAP_CO, TRANG_CSKH } from './data'
import { NoiDung } from './NoiDung'
import { KhungChat } from './Agent'

export const TEN_A = 'Sidebar + panel Bắp bên phải'

export function VariantA() {
  const [menuMo, setMenuMo] = useState(false)
  const [bapMo, setBapMo] = useState(false)
  const [mo, setMo] = useState<string | null>('Ticket & lỗi')
  // Màn rộng: panel Bắp mở sẵn bên cạnh. Màn hẹp: panel đè nội dung → để đóng, bấm "Bắp" mới mở.
  useEffect(() => { setBapMo(window.matchMedia('(min-width: 1181px)').matches) }, [])
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') { e.preventDefault(); setBapMo((v) => !v) } }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  return (
    <div className="proto pA" data-bap={bapMo ? 'mo' : 'dong'}>
      <nav className="ui-sidebar pA-side" data-mo={menuMo} aria-label="Điều hướng chính">
        <div className="ui-sidebar-header">
          <span className="ui-sidebar-mark" aria-hidden>GWT</span>
          <div style={{ flex: 1 }}><div className="ui-sidebar-title">GWT App</div><div className="ui-sidebar-sub">Nội bộ</div></div>
          <button className="ui-btn pA-chi-mobile" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Đóng menu" onClick={() => setMenuMo(false)}><X aria-hidden /></button>
        </div>
        <div style={{ padding: '0 8px 8px' }}>
          <button className="ui-select-trigger" style={{ fontWeight: 400 }}>
            <span className="ui-row" style={{ gap: 8, color: 'var(--muted-foreground)' }}><Search className="ui-icon" aria-hidden />Tìm SĐT, serial, mã…</span>
            <kbd className="p-kbd">⌘K</kbd>
          </button>
        </div>
        <div className="ui-sidebar-content">
          <div className="ui-sidebar-group">
            <button className="ui-sidebar-item" onClick={() => { setBapMo(true); setMenuMo(false) }}>
              <Sparkles className="ui-icon" aria-hidden /> Hỏi Bắp <kbd className="p-kbd" style={{ marginLeft: 'auto' }}>⌘J</kbd>
            </button>
          </div>
          <div className="ui-sidebar-group">
            <div className="ui-sidebar-label">Khu</div>
            {KHU.map((k) => (
              <div key={k.id}>
                <button className="ui-sidebar-item" aria-current={k.id === 'cskh' ? 'true' : undefined}>
                  <span className="p-cham" style={{ background: k.mau }} aria-hidden />
                  {k.ten}
                  {k.soGap ? <span className="ui-badge" data-color="danger" title="việc gấp">{k.soGap}</span> : null}
                  {k.id === 'cskh' ? <ChevronDown className="ui-icon" style={{ marginLeft: k.soGap ? 0 : 'auto' }} aria-hidden /> : null}
                </button>
                {k.id === 'cskh' && (
                  <div className="pA-con">
                    {TRANG_CSKH.map((t) => (
                      <div key={t.ten}>
                        <button
                          className="ui-sidebar-item"
                          aria-current={t.ten === 'Việc hôm nay' ? 'page' : undefined}
                          aria-expanded={t.con ? mo === t.ten : undefined}
                          onClick={() => t.con && setMo(mo === t.ten ? null : t.ten)}
                        >
                          {t.ten}
                          {t.dem ? <span className="ui-badge">{t.dem}</span> : null}
                          {t.con ? (mo === t.ten ? <ChevronDown className="ui-icon" style={{ marginLeft: 'auto' }} aria-hidden /> : <ChevronRight className="ui-icon" style={{ marginLeft: 'auto' }} aria-hidden />) : null}
                        </button>
                        {t.con && mo === t.ten && (
                          <div className="pA-con2">{t.con.map((c) => <button key={c} className="ui-sidebar-item">{c}</button>)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="ui-sidebar-group">
            <div className="ui-sidebar-label">Sắp có</div>
            {KHU_SAP_CO.map((k) => (
              <div key={k.id} className="ui-sidebar-item" aria-disabled="true" style={{ color: 'var(--color-text-disabled)', cursor: 'default' }}>
                <span className="p-cham" style={{ background: 'var(--gray-250)' }} aria-hidden />{k.ten}
              </div>
            ))}
          </div>
        </div>
        <div className="ui-sidebar-footer">
          <button className="ui-sidebar-item"><Settings className="ui-icon" aria-hidden />Quản trị</button>
          <button className="ui-sidebar-item"><span className="p-avatar" aria-hidden>KT</span>Kiều Trang (demo)</button>
        </div>
      </nav>
      {menuMo && <div className="ui-overlay pA-phu" onClick={() => setMenuMo(false)} />}

      <div className="pA-main">
        <header className="pA-top">
          <button className="ui-btn pA-chi-mobile" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Mở menu" onClick={() => setMenuMo(true)}><Menu aria-hidden /></button>
          <nav className="p-vet" aria-label="Vị trí"><span className="p-cham" style={{ background: '#b5642a' }} aria-hidden />CSKH <ChevronRight className="ui-icon" aria-hidden /> <b>Việc hôm nay</b></nav>
          <span style={{ flex: 1 }} />
          <button className="ui-btn" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Thông báo"><Bell aria-hidden /></button>
          <button className="ui-btn" data-variant={bapMo ? 'secondary' : 'outline'} data-size="sm" aria-pressed={bapMo} onClick={() => setBapMo((v) => !v)}>
            <Sparkles aria-hidden /> Bắp
          </button>
        </header>
        <main className="pA-noidung"><NoiDung /></main>
      </div>

      {bapMo && (
        <aside className="pA-bap" aria-label="Trợ lý Bắp">
          <div className="pA-bap-dau">
            <Sparkles className="ui-icon" aria-hidden /><b>Bắp</b><span className="ui-caption">trợ lý trong app</span>
            <span style={{ flex: 1 }} />
            <button className="ui-btn" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Thu gọn Bắp" onClick={() => setBapMo(false)}><X aria-hidden /></button>
          </div>
          <KhungChat boiCanh="CSKH · Việc hôm nay — 1 ca khẩn, 2 việc quá hạn" />
        </aside>
      )}
    </div>
  )
}
