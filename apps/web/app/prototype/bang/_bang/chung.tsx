'use client'
// PROTOTYPE — phần dùng chung của các phương án bảng: state, bộ lọc, ô hiển thị, menu chọn, toast hoàn tác.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowCounterClockwise, ArrowDown, ArrowUp, ArrowUpRight, CaretDown, Check, Drop, Cpu, DeviceMobile, Flask, Funnel, FunnelSimple, MagnifyingGlass, Question,
  WarningCircle, X,
  type Icon,
} from '@phosphor-icons/react'
import { HOM_NAY, NHAN_VIEN, TICKETS, TT_LIST, UU_LIST, type NhomLoi, type Ticket, type TrangThai, type UuTien } from './data'

// ---------- định dạng ----------
export const bo = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()
export const TEN_TT: Partial<Record<TrangThai, string>> = { 'Chờ khách xác nhận': 'Chờ KH xác nhận' }
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
// sắp xếp chỉ cho cột có thứ tự hoặc số lượng; cột nhãn (loại lỗi, chủ, khách, trạng thái) chỉ lọc
export type Cot = 'ma' | 'uu' | 'han' | 'moNgay'
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
  const [locNhom, setLocNhom] = useState<NhomLoi[]>([])
  const [sap, setSap] = useState<{ cot: Cot; chieu: 'tang' | 'giam' }>({ cot: 'uu', chieu: 'tang' })
  const [chon, setChon] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ chu: string; hoan?: () => void } | null>(null)

  const thay = useMemo(() => {
    const k = bo(q.trim())
    const loc = NHOM_TAB.find((x) => x.id === tab)!.loc
    const r = rows.filter((t) => loc(t)
      && (!k || bo(`${t.ma} ${t.khach} ${t.viecTiep} ${t.serial ?? ''} ${t.may}`).includes(k))
      && (!locUu.length || locUu.includes(t.uu))
      && (!locChu.length || locChu.includes(t.chu))
      && (!locNhom.length || locNhom.includes(t.nhom)))
    const dau = sap.chieu === 'tang' ? 1 : -1
    const gt = (t: Ticket): string | number => sap.cot === 'uu' ? THU_TU_UU[t.uu] * 1e13 + new Date(t.han.replace(' ', 'T')).getTime()
      : sap.cot === 'han' ? new Date(t.han.replace(' ', 'T')).getTime()
      : sap.cot === 'moNgay' ? t.moNgay : t.ma
    // khoá phụ duy nhất = mã ticket (spec 8.3)
    return [...r].sort((a, b) => { const x = gt(a), y = gt(b); return (x < y ? -1 : x > y ? 1 : a.ma.localeCompare(b.ma)) * dau })
  }, [rows, tab, q, locUu, locChu, locNhom, sap])

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
    rows, thay, tab, setTab: boChon(setTab), q, setQ: boChon(setQ), locUu, setLocUu: boChon(setLocUu), locChu, setLocChu: boChon(setLocChu), locNhom, setLocNhom: boChon(setLocNhom),
    sap, setSap, chon, setChon, toast, setToast, sua, suaNhieu, demTab,
  }
}
export type Bang = ReturnType<typeof useBang>

// ---------- ô hiển thị ----------
export function ChipTT({ t, nho, mui }: { t: Ticket; nho?: boolean; mui?: boolean }) {
  return (
    <span className="ui-badge b-chip" data-color={TONE_TT[t.tt]} data-nho={nho || undefined}>
      {TEN_TT[t.tt] ?? t.tt}{t.tt === 'Chờ' && t.lyDoCho ? <span className="b-chip-phu">· {t.lyDoCho}</span> : null}
      {mui && <CaretDown className="b-chip-mui" weight="bold" aria-hidden />}
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
  return <span className="b-nguoi" title={ten}><Avatar ten={ten} /><span className="b-cat">{ten}</span></span>
}
export function Han({ t }: { t: Ticket }) {
  const h = hanChu(t)
  return <span className="b-han" data-tre={h.tre || undefined} data-homnay={h.homNay || undefined}>{h.chu}</span>
}
/** Nhãn loại lỗi (4 nhóm danh mục lỗi 18/11 + Chưa phân loại): icon màu + chữ, viền mảnh. */
export function NhanLoi({ n }: { n: NhomLoi }) {
  return <span className="b-nhan-loi" data-nhom={n} title={`Loại lỗi: ${n}`}><span className="b-nhan-cham" aria-hidden /><span className="b-cat">{n}</span></span>
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
// 18/11: menu nổi vẽ qua portal ra lớp trên cùng (position: fixed) — không bị vùng cuộn ngang của bảng cắt, không bị
// tiêu đề cột dính đè. Định vị theo ô đã bấm (phần tử cha của <span> neo); thiếu chỗ bên dưới thì lật lên trên.
export function Noi({ mo, dong, children, className }: { mo: boolean; dong: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const neo = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const a = neo.current?.parentElement, m = ref.current
    if (!mo || !a || !m) return
    const r = a.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight
    const x = className?.includes('b-noi-phai') ? Math.max(8, r.right - w) : Math.max(8, Math.min(r.left, innerWidth - w - 8))
    const duoi = r.bottom + 4 + h <= innerHeight - 8 || r.top - 4 - h < 8
    m.style.setProperty('--noi-x', `${x}px`); m.style.setProperty('--noi-y', `${duoi ? r.bottom + 4 : r.top - 4 - h}px`)
    m.style.visibility = 'visible'
  }, [mo, className])
  useEffect(() => {
    if (!mo) return
    const trong = (n: EventTarget | null) => !!ref.current?.contains(n as Node) || !!neo.current?.parentElement?.contains(n as Node)
    const h = (e: MouseEvent) => { if (!trong(e.target)) dong() }
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') dong() }
    const cuon = (e: Event) => { if (!ref.current?.contains(e.target as Node)) dong() } // cuộn bảng → menu sẽ lệch ô, đóng luôn
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k)
    document.addEventListener('scroll', cuon, true); window.addEventListener('resize', dong)
    return () => {
      document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k)
      document.removeEventListener('scroll', cuon, true); window.removeEventListener('resize', dong)
    }
  }, [mo, dong])
  if (!mo) return null
  return (
    <>
      <span ref={neo} hidden />
      {createPortal(<div ref={ref} className={'ui-menu b-noi ' + (className ?? '')} role="menu" style={{ visibility: 'hidden' }}>{children}</div>, document.querySelector('.proto') ?? document.body)}
    </>
  )
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
// 18/11: lọc + sắp xếp chuyển vào tiêu đề cột (menu ở nhãn cột) → hàng tab sạch, chỉ còn tab + tóm tắt "đang lọc".
const TEN_UU = { P1: 'An toàn', P2: 'Nghiêm trọng', P3: 'Thường', P4: 'Nhẹ / không lỗi' } as const
const bat = <T,>(ds: T[], v: T) => (ds.includes(v) ? ds.filter((x) => x !== v) : [...ds, v])
export type Loc = 'uu' | 'chu' | 'nhom'
export const NHOM_LIST: NhomLoi[] = ['Main', 'Rò rỉ nước', 'Chất lượng nước', 'App', 'Chưa phân loại']

/** Danh sách tick để lọc một trường — dùng trong menu tiêu đề cột và nút lọc gọn. */
export function DsLoc({ b, loc }: { b: Bang; loc: Loc }) {
  if (loc === 'uu') return (
    <>
      {UU_LIST.map((u) => (
        <button key={u} className="ui-menu-item" role="menuitemcheckbox" aria-checked={b.locUu.includes(u)} onClick={() => b.setLocUu(bat(b.locUu, u))}>
          <UuTag u={u} /> {TEN_UU[u]}{b.locUu.includes(u) && <Check className="b-tick" aria-hidden />}
        </button>
      ))}
    </>
  )
  if (loc === 'nhom') return (
    <>
      {NHOM_LIST.map((n) => (
        <button key={n} className="ui-menu-item" role="menuitemcheckbox" aria-checked={b.locNhom.includes(n)} onClick={() => b.setLocNhom(bat(b.locNhom, n))}>
          <NhanLoi n={n} />{b.locNhom.includes(n) && <Check className="b-tick" aria-hidden />}
        </button>
      ))}
    </>
  )
  return (
    <>
      {NHAN_VIEN.slice(0, 4).map((n) => (
        <button key={n} className="ui-menu-item" role="menuitemcheckbox" aria-checked={b.locChu.includes(n)} onClick={() => b.setLocChu(bat(b.locChu, n))}>
          <Avatar ten={n} nho /> {n}{b.locChu.includes(n) && <Check className="b-tick" aria-hidden />}
        </button>
      ))}
    </>
  )
}
const dangLocCot = (b: Bang, loc?: Loc) => (loc === 'uu' ? b.locUu.length : loc === 'chu' ? b.locChu.length : loc === 'nhom' ? b.locNhom.length : 0)

/** Nhãn cột bấm được: menu Sắp xếp + Lọc theo cột. Một cột có thể sắp theo nhiều khoá (vd Ticket: ưu tiên · loại lỗi · mã)
 *  và lọc nhiều trường (ưu tiên + loại lỗi). Không có cot/loc thì là nhãn thường. */
type KhoaSap = { cot: Cot; ten: string }
const TEN_LOC: Record<Loc, string> = { uu: 'Ưu tiên', nhom: 'Loại lỗi', chu: 'Chủ ticket' }
export function DauCot({ b, ten, cot, loc, phai, menuPhai, la = 'th' }: {
  b: Bang; ten: string; cot?: Cot | KhoaSap[]; loc?: Loc | Loc[]; phai?: boolean; menuPhai?: boolean; la?: 'th' | 'span' | 'o'
}) {
  const [mo, setMo] = useState(false)
  const khoa: KhoaSap[] = !cot ? [] : Array.isArray(cot) ? cot : [{ cot, ten: '' }]
  const locs: Loc[] = !loc ? [] : Array.isArray(loc) ? loc : [loc]
  const dangSap = khoa.find((k) => k.cot === b.sap.cot)
  const soLoc = locs.reduce((n, l) => n + dangLocCot(b, l), 0)
  const Tag = la === 'o' ? 'span' : la // 'o' = nằm trong <th> có sẵn (bảng kéo được cột)
  const role = la === 'span' ? 'columnheader' : undefined
  if (!khoa.length && !locs.length) return <Tag className={phai ? 'b-phai' : undefined} role={role}>{ten}</Tag>
  const ariaSort = la === 'o' ? undefined : dangSap && khoa.length === 1 ? (b.sap.chieu === 'tang' ? 'ascending' : 'descending') : khoa.length ? 'none' : undefined
  const chon = (c: Cot, chieu: 'tang' | 'giam') => { b.setSap({ cot: c, chieu }); setMo(false) }
  return (
    <Tag aria-sort={ariaSort} className={phai ? 'b-phai' : undefined} role={role}>
      <span className="b-loc-o">
        <button className="b-th-sap" aria-haspopup="menu" aria-expanded={mo} data-on={!!dangSap || soLoc > 0 || undefined} onClick={() => setMo(!mo)}>
          {ten}
          {dangSap && khoa.length > 1 && <span className="b-th-theo">· {dangSap.ten.toLowerCase()}</span>}
          {dangSap && (b.sap.chieu === 'tang' ? <ArrowUp aria-label="tăng dần" /> : <ArrowDown aria-label="giảm dần" />)}
          {soLoc > 0 && <span className="b-th-loc" aria-label={`đang lọc ${soLoc}`}><Funnel weight="fill" aria-hidden />{soLoc}</span>}
          <CaretDown className="b-th-an" aria-hidden />
        </button>
        <Noi mo={mo} dong={() => setMo(false)} className={phai || menuPhai ? 'b-noi-phai' : undefined}>
          {khoa.length === 1 && (
            <>
              <div className="ui-menu-label">Sắp xếp</div>
              {(['tang', 'giam'] as const).map((ch) => {
                const on = !!dangSap && b.sap.chieu === ch
                return (
                  <button key={ch} className="ui-menu-item" role="menuitemradio" aria-checked={on} onClick={() => chon(khoa[0].cot, ch)}>
                    {ch === 'tang' ? <ArrowUp aria-hidden /> : <ArrowDown aria-hidden />} {ch === 'tang' ? 'Tăng dần' : 'Giảm dần'}{on && <Check className="b-tick" aria-hidden />}
                  </button>
                )
              })}
            </>
          )}
          {khoa.length > 1 && (
            <>
              <div className="ui-menu-label">Sắp xếp theo</div>
              {khoa.map((k) => {
                const on = b.sap.cot === k.cot
                return (
                  <button key={k.cot} className="ui-menu-item" role="menuitemradio" aria-checked={on}
                    onClick={() => chon(k.cot, on && b.sap.chieu === 'tang' ? 'giam' : 'tang')}>
                    {k.ten}{on && (b.sap.chieu === 'tang' ? <ArrowUp className="b-tick" aria-label="tăng dần" /> : <ArrowDown className="b-tick" aria-label="giảm dần" />)}
                  </button>
                )
              })}
            </>
          )}
          {locs.map((l, i) => (
            <span key={l} style={{ display: 'contents' }}>
              {(khoa.length > 0 || i > 0) && <div className="ui-menu-sep" />}
              <div className="ui-menu-label">Lọc{locs.length > 1 || khoa.length > 1 ? ` · ${TEN_LOC[l].toLowerCase()}` : ''}</div>
              <DsLoc b={b} loc={l} />
            </span>
          ))}
          {soLoc > 0 && (
            <button className="ui-menu-item b-menu-xoa" onClick={() => locs.forEach((l) => (l === 'uu' ? b.setLocUu([]) : l === 'nhom' ? b.setLocNhom([]) : b.setLocChu([])))}>
              Bỏ lọc cột này
            </button>
          )}
        </Noi>
      </span>
    </Tag>
  )
}
export const SAP_TICKET: KhoaSap[] = [{ cot: 'uu', ten: 'Ưu tiên' }, { cot: 'ma', ten: 'Thứ tự tạo' }]

/** Nhãn đầu ticket: Ưu tiên → Loại lỗi (theo yêu cầu 18/11). */
export function NhanDau({ t }: { t: Ticket }) {
  return <span className="b-nhan-dau"><UuTag u={t.uu} /><NhanLoi n={t.nhom} /></span>
}

/** Cho phương án không có tiêu đề cột (danh sách 2 dòng, Kanban): một nút lọc gọn gom cả hai trường. */
export function NutLoc({ b }: { b: Bang }) {
  const [mo, setMo] = useState(false)
  const so = b.locUu.length + b.locChu.length + b.locNhom.length
  return (
    <span className="b-loc-o">
      <button className="b-nut-icon" aria-label={so ? `Bộ lọc (${so})` : 'Bộ lọc'} data-tip="Lọc" aria-expanded={mo} data-on={so > 0 || undefined} onClick={() => setMo(!mo)}>
        <FunnelSimple aria-hidden />
      </button>
      <Noi mo={mo} dong={() => setMo(false)} className="b-noi-phai">
        <div className="ui-menu-label">Ưu tiên</div><DsLoc b={b} loc="uu" />
        <div className="ui-menu-sep" />
        <div className="ui-menu-label">Loại lỗi</div><DsLoc b={b} loc="nhom" />
        <div className="ui-menu-sep" />
        <div className="ui-menu-label">Chủ ticket</div><DsLoc b={b} loc="chu" />
      </Noi>
    </span>
  )
}

export function ThanhLoc({ b, tieuDe = 'Ticket', phai }: { b: Bang; tieuDe?: string; phai?: ReactNode }) {
  const tom = [...b.locUu, ...b.locNhom, ...b.locChu]
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
        <div className="b-thanh-phai">
          {tom.length > 0 && (
            <span className="b-dangloc">
              Lọc: {tom.join(', ')}
              <button className="b-xoaloc" onClick={() => { b.setLocUu([]); b.setLocChu([]); b.setLocNhom([]) }}>Xoá lọc</button>
            </span>
          )}
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
      <button className="ui-btn" data-variant="outline" data-size="sm" onClick={() => { b.setLocUu([]); b.setLocChu([]); b.setLocNhom([]); b.setQ(''); b.setTab('tat-ca') }}>Xoá lọc</button>
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
