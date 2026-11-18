'use client'
// PROTOTYPE — phần dùng chung của các phương án bảng: state, bộ lọc, ô hiển thị, menu chọn, toast hoàn tác.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowCounterClockwise, ArrowUpRight, CaretDown, Check, Drop, Cpu, DeviceMobile, Flask, MagnifyingGlass, Question, WarningCircle, X,
  type Icon,
} from '@phosphor-icons/react'
import { HOM_NAY, NHAN_VIEN, TICKETS, TT_LIST, UU_LIST, type NhomLoi, type Ticket, type TrangThai, type UuTien } from './data'

// ---------- định dạng ----------
const bo = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()
export const TONE_TT: Record<TrangThai, string | undefined> = {
  'Mới': 'discovery', 'Đang xử lý': 'info', 'Chờ': 'warning', 'Chờ khách xác nhận': undefined, 'Đóng': 'success', 'Huỷ': undefined,
}
export const ICON_NHOM: Record<NhomLoi, Icon> = { Main: Cpu, 'Rò rỉ nước': Drop, 'Chất lượng nước': Flask, App: DeviceMobile, 'Chưa phân loại': Question }
export const MO = (t: Ticket) => t.tt !== 'Đóng' && t.tt !== 'Huỷ'

/** Hạn: "11:00" (hôm nay), "Mai 09:30", "20/11", quá hạn → "Quá 1 ngày" */
export function hanChu(t: Ticket): { chu: string; tre: boolean; homNay: boolean } {
  const [ngay, gio] = t.han.split(' ')
  if (!MO(t)) return { chu: ngay.slice(8, 10) + '/' + ngay.slice(5, 7), tre: false, homNay: false }
  const d = (new Date(ngay).getTime() - new Date(HOM_NAY).getTime()) / 864e5
  if (d < 0) return { chu: `Quá ${-d} ngày`, tre: true, homNay: false }
  if (d === 0) return { chu: gio, tre: false, homNay: true }
  if (d === 1) return { chu: `Mai ${gio}`, tre: false, homNay: false }
  return { chu: ngay.slice(8, 10) + '/' + ngay.slice(5, 7), tre: false, homNay: false }
}

// ---------- state bảng ----------
export type Cot = 'ma' | 'khach' | 'tt' | 'uu' | 'han' | 'chu' | 'moNgay'
export const NHOM_TAB = [
  { id: 'mo', ten: 'Đang mở', loc: MO },
  { id: 'cua-toi', ten: 'Của tôi', loc: (t: Ticket) => MO(t) && t.chu === 'Hiệp' },
  { id: 'qua-han', ten: 'Quá hạn', loc: (t: Ticket) => hanChu(t).tre },
  { id: 'cho', ten: 'Đang chờ', loc: (t: Ticket) => t.tt === 'Chờ' },
  { id: 'dong', ten: 'Đã đóng', loc: (t: Ticket) => !MO(t) },
  { id: 'tat-ca', ten: 'Tất cả', loc: () => true },
]
const THU_TU_UU: Record<UuTien, number> = { P1: 0, P2: 1, P3: 2, P4: 3 }

export function useBang() {
  const [rows, setRows] = useState<Ticket[]>(TICKETS)
  const [tab, setTab] = useState('mo')
  const [q, setQ] = useState('')
  const [locUu, setLocUu] = useState<UuTien[]>([])
  const [locChu, setLocChu] = useState<string[]>([])
  const [sap, setSap] = useState<{ cot: Cot; chieu: 'tang' | 'giam' }>({ cot: 'uu', chieu: 'tang' })
  const [chon, setChon] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ chu: string; hoan?: () => void } | null>(null)

  const thay = useMemo(() => {
    const k = bo(q.trim())
    const loc = NHOM_TAB.find((x) => x.id === tab)!.loc
    const r = rows.filter((t) => loc(t)
      && (!k || bo(`${t.ma} ${t.khach} ${t.viecTiep} ${t.serial ?? ''} ${t.may}`).includes(k))
      && (!locUu.length || locUu.includes(t.uu))
      && (!locChu.length || locChu.includes(t.chu)))
    const dau = sap.chieu === 'tang' ? 1 : -1
    const gt = (t: Ticket): string | number => sap.cot === 'uu' ? THU_TU_UU[t.uu] * 1e13 + new Date(t.han.replace(' ', 'T')).getTime()
      : sap.cot === 'han' ? new Date(t.han.replace(' ', 'T')).getTime()
      : sap.cot === 'moNgay' ? t.moNgay : sap.cot === 'tt' ? TT_LIST.indexOf(t.tt) : t[sap.cot]
    // khoá phụ duy nhất = mã ticket (spec 8.3)
    return [...r].sort((a, b) => { const x = gt(a), y = gt(b); return (x < y ? -1 : x > y ? 1 : a.ma.localeCompare(b.ma)) * dau })
  }, [rows, tab, q, locUu, locChu, sap])

  const demTab = (id: string) => rows.filter(NHOM_TAB.find((x) => x.id === id)!.loc).length

  const sua = (ma: string, patch: Partial<Ticket>, chu: string) => {
    const cu = rows.find((t) => t.ma === ma)!
    const truoc: Partial<Ticket> = Object.fromEntries(Object.keys(patch).map((k) => [k, cu[k as keyof Ticket]]))
    setRows((rs) => rs.map((t) => (t.ma === ma ? { ...t, ...patch, capNhat: 'vừa xong' } : t)))
    setToast({ chu, hoan: () => setRows((rs) => rs.map((t) => (t.ma === ma ? { ...t, ...truoc } : t))) })
  }
  const suaNhieu = (mas: string[], patch: Partial<Ticket>, chu: string) => {
    const truoc = new Map(rows.filter((t) => mas.includes(t.ma)).map((t) => [t.ma, t]))
    setRows((rs) => rs.map((t) => (mas.includes(t.ma) ? { ...t, ...patch, capNhat: 'vừa xong' } : t)))
    setChon(new Set())
    setToast({ chu, hoan: () => setRows((rs) => rs.map((t) => truoc.get(t.ma) ?? t)) })
  }
  // đổi bộ lọc → bỏ chọn (spec 8.3)
  const boChon = <T,>(f: (v: T) => void) => (v: T) => { f(v); setChon(new Set()) }

  return {
    rows, thay, tab, setTab: boChon(setTab), q, setQ: boChon(setQ), locUu, setLocUu: boChon(setLocUu), locChu, setLocChu: boChon(setLocChu),
    sap, setSap, chon, setChon, toast, setToast, sua, suaNhieu, demTab,
  }
}
export type Bang = ReturnType<typeof useBang>

// ---------- ô hiển thị ----------
export function ChipTT({ t, nho }: { t: Ticket; nho?: boolean }) {
  return (
    <span className="ui-badge b-chip" data-color={TONE_TT[t.tt]} data-nho={nho || undefined}>
      {t.tt}{t.tt === 'Chờ' && t.lyDoCho ? <span className="b-chip-phu">· {t.lyDoCho}</span> : null}
    </span>
  )
}
export function UuTag({ u }: { u: UuTien }) {
  return <span className="b-uu" data-u={u}>{u}</span>
}
export function Avatar({ ten, nho }: { ten: string; nho?: boolean }) {
  if (ten === '—') return <span className="b-mo">—</span>
  const chu = ten.replace(/^anh /, '').split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()
  return <span className="b-av" data-nho={nho || undefined} aria-hidden>{chu}</span>
}
export function Nguoi({ ten }: { ten: string }) {
  return <span className="b-nguoi"><Avatar ten={ten} /><span className="b-cat">{ten}</span></span>
}
export function Han({ t }: { t: Ticket }) {
  const h = hanChu(t)
  return <span className="b-han" data-tre={h.tre || undefined} data-homnay={h.homNay || undefined}>{h.chu}</span>
}
export function OIcon({ t }: { t: Ticket }) {
  const I = ICON_NHOM[t.nhom]
  return <span className="b-oicon" data-nhom={t.nhom} title={t.nhom}><I aria-hidden /></span>
}
export function NguonTag({ t }: { t: Ticket }) {
  return t.nguon === 'Discord' ? <a href="#" className="b-link" onClick={(e) => e.preventDefault()}>Discord <ArrowUpRight aria-hidden /></a> : <span className="b-mo">{t.nguon}</span>
}
export function Khach({ t }: { t: Ticket }) {
  return (
    <span className="b-khach">
      <span className="b-cat">{t.khach}</span>
      {t.luuY && <span className="b-luuy" title="Khách có thẻ lưu ý — phải đọc" aria-label="Khách có lưu ý"><WarningCircle weight="fill" aria-hidden /></span>}
      {t.hoiLai > 0 && <span className="b-hoilai" title={`Khách đã hỏi lại ${t.hoiLai} lần`} aria-label={`Khách hỏi lại ${t.hoiLai} lần`}><ArrowCounterClockwise aria-hidden />{t.hoiLai}</span>}
    </span>
  )
}

// ---------- menu chọn nổi (dùng cho sửa tại chỗ + lọc) ----------
export function Noi({ mo, dong, children, className }: { mo: boolean; dong: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!mo) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.parentElement?.contains(e.target as Node)) dong() }
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') dong() }
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k)
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k) }
  }, [mo, dong])
  if (!mo) return null
  return <div ref={ref} className={'ui-menu b-noi ' + (className ?? '')} role="menu">{children}</div>
}

export function MenuChon<T extends string>({ ds, gt, chon, tim, nhan }: { ds: readonly T[]; gt: T; chon: (v: T) => void; tim?: boolean; nhan?: (v: T) => ReactNode }) {
  const [k, setK] = useState('')
  const loc = ds.filter((v) => !k || bo(v).includes(bo(k)))
  return (
    <>
      {tim && (
        <div className="ui-menu-search b-tim-menu">
          <MagnifyingGlass aria-hidden />
          <input autoFocus value={k} onChange={(e) => setK(e.target.value)} placeholder="Gõ để tìm…" aria-label="Tìm" />
        </div>
      )}
      {loc.map((v) => (
        <button key={v} className="ui-menu-item" role="menuitemradio" aria-checked={v === gt} onClick={() => chon(v)}>
          {nhan ? nhan(v) : v}
          {v === gt && <Check className="b-tick" aria-hidden />}
        </button>
      ))}
      {!loc.length && <div className="ui-menu-empty">Không có ai khớp “{k}”</div>}
    </>
  )
}

// ---------- thanh công cụ chung ----------
export function ThanhLoc({ b, tieuDe = 'Ticket', phai }: { b: Bang; tieuDe?: string; phai?: ReactNode }) {
  const [mo, setMo] = useState<'' | 'uu' | 'chu'>('')
  const dangLoc = b.locUu.length + b.locChu.length > 0 || b.q
  const bat = <T,>(ds: T[], v: T) => (ds.includes(v) ? ds.filter((x) => x !== v) : [...ds, v])
  return (
    <div className="b-dau-wrap">
      <header className="b-dau">
        <h1 className="b-h1">{tieuDe}</h1>
        <span className="b-dem">đang thấy {b.thay.length} / {b.rows.length}</span>
        <span style={{ flex: 1 }} />
        <label className="b-tim">
          <MagnifyingGlass aria-hidden />
          <input value={b.q} onChange={(e) => b.setQ(e.target.value)} placeholder="Tìm mã, khách, serial…" aria-label="Tìm ticket" />
          {b.q && <button className="b-xoa" onClick={() => b.setQ('')} aria-label="Xoá tìm"><X aria-hidden /></button>}
        </label>
        <button className="ui-btn">Tạo ticket</button>
      </header>
      <div className="b-thanh">
        <div className="b-tabs" role="tablist" aria-label="Nhóm ticket">
          {NHOM_TAB.map((x) => (
            <button key={x.id} role="tab" className="b-tab" aria-selected={b.tab === x.id} onClick={() => b.setTab(x.id)}>
              {x.ten} <span className="b-tab-so" data-gap={x.id === 'qua-han' ? '' : undefined}>{b.demTab(x.id)}</span>
            </button>
          ))}
        </div>
        <div className="b-loc">
          <div className="b-loc-o">
            <button className="b-chip-loc" aria-expanded={mo === 'uu'} data-on={b.locUu.length > 0 || undefined} onClick={() => setMo(mo === 'uu' ? '' : 'uu')}>
              Ưu tiên{b.locUu.length ? `: ${b.locUu.join(', ')}` : ''} <CaretDown aria-hidden />
            </button>
            <Noi mo={mo === 'uu'} dong={() => setMo('')}>
              {UU_LIST.map((u) => (
                <button key={u} className="ui-menu-item" role="menuitemcheckbox" aria-checked={b.locUu.includes(u)} onClick={() => b.setLocUu(bat(b.locUu, u))}>
                  <UuTag u={u} /> {({ P1: 'An toàn', P2: 'Nghiêm trọng', P3: 'Thường', P4: 'Nhẹ / không lỗi' } as const)[u]}
                  {b.locUu.includes(u) && <Check className="b-tick" aria-hidden />}
                </button>
              ))}
            </Noi>
          </div>
          <div className="b-loc-o">
            <button className="b-chip-loc" aria-expanded={mo === 'chu'} data-on={b.locChu.length > 0 || undefined} onClick={() => setMo(mo === 'chu' ? '' : 'chu')}>
              Chủ ticket{b.locChu.length ? `: ${b.locChu.join(', ')}` : ''} <CaretDown aria-hidden />
            </button>
            <Noi mo={mo === 'chu'} dong={() => setMo('')}>
              {NHAN_VIEN.slice(0, 4).map((n) => (
                <button key={n} className="ui-menu-item" role="menuitemcheckbox" aria-checked={b.locChu.includes(n)} onClick={() => b.setLocChu(bat(b.locChu, n))}>
                  <Avatar ten={n} nho /> {n}{b.locChu.includes(n) && <Check className="b-tick" aria-hidden />}
                </button>
              ))}
            </Noi>
          </div>
          {dangLoc && <button className="b-xoaloc" onClick={() => { b.setLocUu([]); b.setLocChu([]); b.setQ('') }}>Xoá lọc</button>}
          <span style={{ flex: 1 }} />
          {phai}
        </div>
      </div>
    </div>
  )
}

export function Rong({ b }: { b: Bang }) {
  return (
    <div className="b-rong">
      <div className="b-rong-tieude">Không có ticket nào khớp bộ lọc</div>
      <div className="b-rong-mo">Thử bỏ bớt điều kiện{b.q ? ` hoặc từ khoá “${b.q}”` : ''} — tìm không cần gõ dấu.</div>
      <button className="ui-btn" data-variant="outline" data-size="sm" onClick={() => { b.setLocUu([]); b.setLocChu([]); b.setQ(''); b.setTab('tat-ca') }}>Xoá lọc</button>
    </div>
  )
}

export function Toast({ b }: { b: Bang }) {
  useEffect(() => { if (!b.toast) return; const id = setTimeout(() => b.setToast(null), 5000); return () => clearTimeout(id) }, [b.toast, b])
  if (!b.toast) return null
  return (
    <div className="b-toast" role="status" aria-live="polite">
      <Check aria-hidden /> {b.toast.chu}
      {b.toast.hoan && <button onClick={() => { b.toast?.hoan?.(); b.setToast(null) }}>Hoàn tác</button>}
    </div>
  )
}

export function ThanhHangLoat({ b }: { b: Bang }) {
  const [mo, setMo] = useState<'' | 'tt' | 'chu'>('')
  if (!b.chon.size) return null
  const mas = [...b.chon]
  return (
    <div className="b-hangloat" role="toolbar" aria-label="Thao tác hàng loạt">
      <span><b>{b.chon.size}</b> đã chọn</span>
      <div className="b-loc-o">
        <button className="b-hl-nut" onClick={() => setMo(mo === 'tt' ? '' : 'tt')}>Đổi trạng thái</button>
        <Noi mo={mo === 'tt'} dong={() => setMo('')} className="b-noi-tren">
          <MenuChon ds={TT_LIST} gt={'' as TrangThai} chon={(v) => { b.suaNhieu(mas, { tt: v }, `Đã đổi ${mas.length} ticket sang “${v}”`); setMo('') }} />
        </Noi>
      </div>
      <div className="b-loc-o">
        <button className="b-hl-nut" onClick={() => setMo(mo === 'chu' ? '' : 'chu')}>Gán chủ</button>
        <Noi mo={mo === 'chu'} dong={() => setMo('')} className="b-noi-tren">
          <MenuChon ds={NHAN_VIEN.slice(0, 4)} gt={''} tim chon={(v) => { b.suaNhieu(mas, { chu: v }, `Đã gán ${mas.length} ticket cho ${v}`); setMo('') }} />
        </Noi>
      </div>
      <button className="b-hl-nut">Xuất Excel</button>
      <button className="b-hl-x" onClick={() => b.setChon(new Set())} aria-label="Bỏ chọn"><X aria-hidden /></button>
    </div>
  )
}

export function OChon({ b, ma }: { b: Bang; ma: string }) {
  return (
    <input type="checkbox" className="ui-checkbox" aria-label={`Chọn ${ma}`} checked={b.chon.has(ma)}
      onChange={() => { const s = new Set(b.chon); if (s.has(ma)) s.delete(ma); else s.add(ma); b.setChon(s) }}
      onClick={(e) => e.stopPropagation()} />
  )
}
export function OChonTatCa({ b }: { b: Bang }) {
  const tat = b.thay.length > 0 && b.thay.every((t) => b.chon.has(t.ma))
  const mot = !tat && b.thay.some((t) => b.chon.has(t.ma))
  return (
    <input type="checkbox" className="ui-checkbox" aria-label="Chọn tất cả theo bộ lọc" checked={tat}
      ref={(el) => { if (el) el.indeterminate = mot }}
      onChange={() => b.setChon(tat ? new Set() : new Set(b.thay.map((t) => t.ma)))} />
  )
}
