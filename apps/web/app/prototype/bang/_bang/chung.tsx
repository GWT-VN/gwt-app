'use client'
// PROTOTYPE — phần dùng chung của các phương án bảng: state, bộ lọc, ô hiển thị, menu chọn, toast hoàn tác.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowCounterClockwise, ArrowDown, ArrowUp, ArrowUpRight, CaretDown, Check, Drop, Cpu, DeviceMobile, Flask, Funnel, MagnifyingGlass, Question,
  WarningCircle, X, CaretLeft, CaretRight, BookmarkSimple, ArrowLeft,
  type Icon,
} from '@phosphor-icons/react'
import { HOM_NAY, LY_DO_CHO, NHAN_VIEN, TICKETS, TT_LIST, UU_LIST, type NhomLoi, type Ticket, type TrangThai, type UuTien } from './data'
type LyDoCho = (typeof LY_DO_CHO)[number]

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
export const MOI_TRANG = 15

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
  const [trang, setTrang] = useState(1)

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

  // phân trang như bang/PhanTrang: MOI_TRANG dòng/trang, đổi lọc/sắp → về trang 1
  const soTrang = Math.max(1, Math.ceil(thay.length / MOI_TRANG))
  const trangThat = Math.min(trang, soTrang)
  const hien = thay.slice((trangThat - 1) * MOI_TRANG, trangThat * MOI_TRANG)

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
  const boChon = <T,>(f: (v: T) => void) => (v: T) => { f(v); setChon(new Set()); setTrang(1) }

  return {
    rows, thay, tab, setTab: boChon(setTab), q, setQ: boChon(setQ), locUu, setLocUu: boChon(setLocUu), locChu, setLocChu: boChon(setLocChu), locNhom, setLocNhom: boChon(setLocNhom),
    sap, setSap: (v: typeof sap) => { setSap(v); setTrang(1) }, chon, setChon, toast, setToast, sua, suaNhieu, demTab,
    hien, trang: trangThat, setTrang, soTrang,
  }
}
export type Bang = ReturnType<typeof useBang>

// ---------- ô hiển thị ----------
export function ChipTT({ t, nho, mui }: { t: Ticket; nho?: boolean; mui?: boolean }) {
  return (
    <span className="ui-badge b-chip" data-color={TONE_TT[t.tt]} data-nho={nho || undefined}>
      {TEN_TT[t.tt] ?? t.tt}{t.tt === 'Chờ' && t.lyDoCho ? <span className="b-chip-phu">· {t.lyDoCho}</span> : null}
      {mui && <CaretDown className="ui-caret" weight="bold" aria-hidden />}
    </span>
  )
}
export function UuTag({ u }: { u: UuTien }) {
  // DS Badge: P1 solid đỏ · P2 cam nhạt · P3 xám (mặc định) · P4 viền
  const v = u === 'P1' ? { 'data-variant': 'solid', 'data-color': 'danger' } : u === 'P2' ? { 'data-color': 'warning' } : u === 'P4' ? { 'data-variant': 'outline' } : {}
  return <span className="ui-badge" {...v} title={`${u} · ${NHOM_UU[u]}`}>{TEN_UU_NGAN[u]}</span>
}
/** Nhãn ưu tiên theo độ gấp (chuẩn Linear: Urgent/High/Medium/Low). Spec v2-mo-ta-app: mức đặt theo nhóm lỗi
 *  (an toàn → P1 …), mục 743 chốt "việc gấp = P1". Mã P + nhóm lỗi ở tooltip/menu. */
export const TEN_UU_NGAN = { P1: 'Gấp', P2: 'Cao', P3: 'Thường', P4: 'Thấp' } as const
export const NHOM_UU = { P1: 'lỗi an toàn', P2: 'lỗi nghiêm trọng', P3: 'lỗi thường', P4: 'nhẹ / không lỗi' } as const
export function Avatar({ ten, nho }: { ten: string; nho?: boolean }) {
  if (ten === '—') return <span className="b-mo">—</span>
  const chu = ten.replace(/^anh /, '').split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()
  return <span className="ui-avatar" data-size={nho ? 'sm' : undefined} aria-hidden>{chu}</span>
}
export function Nguoi({ ten }: { ten: string }) {
  return <span className="b-nguoi" title={ten}><Avatar ten={ten} /><span className="b-cat">{ten}</span></span>
}
export function Han({ t }: { t: Ticket }) {
  const h = hanChu(t)
  return <span className="b-han" data-tre={h.tre || undefined} data-homnay={h.homNay || undefined}>{h.chu}</span>
}
/** Nhãn loại lỗi (4 nhóm danh mục lỗi 18/11 + Chưa phân loại): icon màu + chữ, viền mảnh. */
const MAU_LOI: Partial<Record<NhomLoi, string>> = { Main: 'discovery', 'Rò rỉ nước': 'info', 'Chất lượng nước': 'success', App: 'warning' }
export function NhanLoi({ n }: { n: NhomLoi }) {
  // DS Badge viền + chấm màu theo nhóm lỗi
  return <span className="ui-badge" data-variant="outline" title={`Loại lỗi: ${n}`}><span className="ui-dot" data-color={MAU_LOI[n]} aria-hidden />{n}</span>
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
export function Noi({ mo, dong, children, className, role = 'menu', nhan, theoNeo }: { mo: boolean; dong: () => void; children: ReactNode; className?: string; role?: 'menu' | 'dialog'; nhan?: string; theoNeo?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const neo = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const a = neo.current?.parentElement, m = ref.current
    if (!mo || !a || !m) return
    const r = a.getBoundingClientRect()
    if (theoNeo) m.style.minWidth = `${r.width}px` // Select: menu rộng bằng ô
    const w = m.offsetWidth, h = m.offsetHeight
    const x = className?.includes('b-noi-phai') ? Math.max(8, r.right - w) : Math.max(8, Math.min(r.left, innerWidth - w - 8))
    const duoi = r.bottom + 4 + h <= innerHeight - 8 || r.top - 4 - h < 8
    m.style.setProperty('--noi-x', `${x}px`); m.style.setProperty('--noi-y', `${Math.max(8, Math.min(duoi ? r.bottom + 4 : r.top - 4 - h, innerHeight - h - 8))}px`) // không đủ chỗ cả 2 phía → ép vào trong màn
    m.style.visibility = 'visible'
    // autoFocus không ăn khi nội dung gắn lúc còn hidden → đưa focus vào ô nhập / mục đang chọn / mục đầu (APG menu)
    const f = requestAnimationFrame(() => { if (!m.contains(document.activeElement)) (m.querySelector<HTMLElement>('input, [aria-checked="true"], .ui-menu-item'))?.focus() })
    return () => cancelAnimationFrame(f)
  }, [mo, className, theoNeo])
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
      {createPortal(<div ref={ref} className={'ui-menu b-noi ' + (className ?? '')} role={role} aria-label={nhan} style={{ visibility: 'hidden' }}
        onClick={(e) => e.stopPropagation()}>{/* portal vẫn nổi bọt theo cây React → không để click lan lên thẻ/hàng chứa nó */}{children}</div>, document.querySelector('.proto') ?? document.body)}
    </>
  )
}

/** Menu trạng thái dùng chung (ô bảng, Kanban, thanh hàng loạt): chọn "Chờ" PHẢI chọn lý do — bước 2 "Chờ vì…"
 *  (cùng kiểu trang con của menu ⚙). Chỉ lưu khi đã đủ trạng thái + lý do. */
export function MenuTrangThai({ gt, lyDo, chon, chiLyDo }: {
  gt?: TrangThai; lyDo?: LyDoCho; chon: (tt: TrangThai, lyDo?: LyDoCho) => void; chiLyDo?: boolean
}) {
  const [buoc2, setBuoc2] = useState(!!chiLyDo)
  if (buoc2) return (
    <>
      {chiLyDo ? <div className="ui-menu-label">Chờ vì…</div> : (
        <div className="b-cd-dau">
          <button className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label="Quay lại" onClick={() => setBuoc2(false)}><ArrowLeft aria-hidden /></button>
          Chờ vì…
        </div>
      )}
      {LY_DO_CHO.map((l) => (
        <button key={l} className="ui-menu-item" role="menuitemradio" aria-checked={gt === 'Chờ' && l === lyDo} autoFocus={l === (lyDo ?? LY_DO_CHO[0])} onClick={() => chon('Chờ', l)}>
          Chờ {l}{gt === 'Chờ' && l === lyDo && <Check className="b-tick" aria-hidden />}
        </button>
      ))}
    </>
  )
  return (
    <>
      {TT_LIST.map((v) => (
        <button key={v} className="ui-menu-item" role="menuitemradio" aria-checked={v === gt} aria-haspopup={v === 'Chờ' || undefined}
          onClick={() => (v === 'Chờ' ? setBuoc2(true) : chon(v))}>
          <ChipTT t={{ tt: v, lyDoCho: v === 'Chờ' && gt === 'Chờ' ? lyDo : undefined } as Ticket} nho />
          {v === 'Chờ' ? <CaretRight className="b-tick" aria-hidden /> : v === gt && <Check className="b-tick" aria-hidden />}
        </button>
      ))}
    </>
  )
}

export function MenuChon<T extends string>({ ds, gt, chon, tim, nhan }: { ds: readonly T[]; gt: T; chon: (v: T) => void; tim?: boolean; nhan?: (v: T) => ReactNode }) {
  const [k, setK] = useState('')
  const loc = ds.filter((v) => !k || bo(v).includes(bo(k)))
  return (
    <>
      {tim && (
        <div className="ui-menu-search">
          <MagnifyingGlass className="ui-icon" aria-hidden />
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
const bat = <T,>(ds: T[], v: T) => (ds.includes(v) ? ds.filter((x) => x !== v) : [...ds, v])
export type Loc = 'uu' | 'chu' | 'nhom'
export const NHOM_LIST: NhomLoi[] = ['Main', 'Rò rỉ nước', 'Chất lượng nước', 'App', 'Chưa phân loại']

/** Danh sách tick để lọc một trường — dùng trong menu tiêu đề cột và nút lọc gọn. */
export function DsLoc({ b, loc }: { b: Bang; loc: Loc }) {
  if (loc === 'uu') return (
    <>
      {UU_LIST.map((u) => (
        <button key={u} className="ui-menu-item" role="menuitemcheckbox" aria-checked={b.locUu.includes(u)} onClick={() => b.setLocUu(bat(b.locUu, u))}>
          <UuTag u={u} /> <span className="b-mo">{u} · {NHOM_UU[u]}</span>{b.locUu.includes(u) && <Check className="b-tick" aria-hidden />}
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
        <button className="ui-th-sort" aria-haspopup="menu" aria-expanded={mo} data-on={!!dangSap || soLoc > 0 || undefined} onClick={() => setMo(!mo)}>
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

export function ThanhLoc({ b, tieuDe = 'Ticket', phai }: { b: Bang; tieuDe?: string; phai?: ReactNode }) {
  return (
    <div className="b-dau-wrap">
      <header className="b-dau">
        <h1 className="b-h1">{tieuDe}</h1>
        <span className="ui-caption">đang thấy {b.thay.length} / {b.rows.length}</span>
        <span style={{ flex: 1 }} />
        <div className="ui-input-wrap b-tim">
          <MagnifyingGlass className="ui-icon" aria-hidden />
          <input className="ui-input" type="search" value={b.q} onChange={(e) => b.setQ(e.target.value)} placeholder="Tìm mã, khách, serial…" aria-label="Tìm ticket" />
        </div>
        <button className="ui-btn">Tạo ticket</button>
      </header>
      <div className="b-thanh">
        <div className="b-tabs-cuon">
          <div className="ui-tabs-list" data-variant="pill" role="tablist" aria-label="Nhóm ticket">
            {NHOM_TAB.map((x) => (
              <button key={x.id} role="tab" className="ui-tabs-trigger" aria-selected={b.tab === x.id} onClick={() => b.setTab(x.id)}>
                {x.ten} <span className="ui-tabs-count" data-color={x.id === 'qua-han' ? 'danger' : undefined}>{b.demTab(x.id)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="b-thanh-phai">
          {phai}
        </div>
      </div>
      <ThanhDangLoc b={b} />
    </div>
  )
}

// ---------- FilterBar (DS) — cấu trúc như bang/ThanhDangLoc + ChipSapXep ----------
const NGHIA_SAP: Record<Cot, [string, string]> = { uu: ['khẩn trước', 'thấp trước'], han: ['sớm nhất trước', 'muộn nhất trước'], moNgay: ['mở lâu nhất trước', 'mới mở trước'], ma: ['cũ nhất trước', 'mới nhất trước'] }
const TEN_COT_SAP: Record<Cot, string> = { uu: 'Ưu tiên', han: 'Hạn', moNgay: 'Số ngày mở', ma: 'Thứ tự tạo' }
const SAP_MAC_DINH = { cot: 'uu' as Cot, chieu: 'tang' as const }
function Chip({ nhan, gt, bo }: { nhan: string; gt: string; bo?: () => void }) {
  return (
    <span className="ui-chip">
      <span>{nhan}: <strong>{gt}</strong></span>
      {bo && <button type="button" className="ui-chip-x" aria-label={`Bỏ lọc ${nhan}`} onClick={bo}><X weight="bold" aria-hidden /></button>}
    </span>
  )
}
export function ThanhDangLoc({ b }: { b: Bang }) {
  const [luu, setLuu] = useState(false)
  const macDinh = b.sap.cot === SAP_MAC_DINH.cot && b.sap.chieu === SAP_MAC_DINH.chieu
  const coLoc = b.locUu.length + b.locNhom.length + b.locChu.length > 0 || !!b.q.trim()
  if (!coLoc && macDinh) return null
  const dieuKien = [
    b.q.trim() && { nhan: 'Tìm', gt: `“${b.q.trim()}”`, bo: () => b.setQ('') },
    b.locUu.length && { nhan: 'Ưu tiên', gt: b.locUu.join(', '), bo: () => b.setLocUu([]) },
    b.locNhom.length && { nhan: 'Loại lỗi', gt: b.locNhom.join(', '), bo: () => b.setLocNhom([]) },
    b.locChu.length && { nhan: 'Chủ', gt: b.locChu.join(', '), bo: () => b.setLocChu([]) },
  ].filter(Boolean) as { nhan: string; gt: string; bo: () => void }[]
  const dem = b.hien.length < b.thay.length ? `Hiện ${b.hien.length} trên ${b.thay.length} ticket` : `${b.thay.length} ticket`
  return (
    <div className="ui-filterbar b-filterbar" role="region" aria-label="Điều kiện đang áp dụng">
      {dieuKien.map((d) => <Chip key={d.nhan} {...d} />)}
      {!macDinh && (
        <span className="ui-chip">
          {b.sap.chieu === 'tang' ? <ArrowUp className="ui-icon" aria-hidden /> : <ArrowDown className="ui-icon" aria-hidden />}
          <span>Sắp xếp: <strong>{TEN_COT_SAP[b.sap.cot]}</strong> · {NGHIA_SAP[b.sap.cot][b.sap.chieu === 'tang' ? 0 : 1]}</span>
          <button type="button" className="ui-chip-x" aria-label="Bỏ sắp xếp, về thứ tự mặc định" onClick={() => b.setSap(SAP_MAC_DINH)}><X weight="bold" aria-hidden /></button>
        </span>
      )}
      <span className="ui-filterbar-count" aria-live="polite">{dem}</span>
      <span className="ui-filterbar-end">
        {coLoc && (
          <span className="b-loc-o">
            <button type="button" className="ui-btn" data-variant="ghost" data-size="sm" aria-haspopup="dialog" aria-expanded={luu} onClick={() => setLuu(!luu)}>
              <BookmarkSimple aria-hidden /> Lưu bộ lọc
            </button>
            <Noi mo={luu} dong={() => setLuu(false)} role="dialog" nhan="Lưu bộ lọc" className="ui-saveview b-noi-phai">
              <LuuLoc dieuKien={dieuKien} dong={() => setLuu(false)} luu={(ten) => b.setToast({ chu: `Đã lưu “${ten}” vào Bộ lọc đã lưu` })} />
            </Noi>
          </span>
        )}
        {coLoc && <button type="button" className="ui-btn" data-variant="ghost" data-size="sm" onClick={() => { b.setLocUu([]); b.setLocChu([]); b.setLocNhom([]); b.setQ('') }}>Xoá lọc</button>}
      </span>
    </div>
  )
}

/** SavedView — đặt tên + phạm vi chia sẻ; lưu xong hiện ở mục "Bộ lọc đã lưu" của sidebar */
function LuuLoc({ dieuKien, dong, luu }: { dieuKien: { nhan: string; gt: string }[]; dong: () => void; luu: (ten: string) => void }) {
  const [ten, setTen] = useState('')
  const [chung, setChung] = useState(false)
  const [loi, setLoi] = useState(false)
  const o = useRef<HTMLInputElement>(null)
  // Noi gắn nội dung lúc còn visibility:hidden (đo vị trí xong mới hiện) → autoFocus không ăn; focus sau 1 khung hình
  useEffect(() => { const id = requestAnimationFrame(() => o.current?.focus()); return () => cancelAnimationFrame(id) }, [])
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!ten.trim()) { setLoi(true); return } luu(ten.trim()); dong() }} style={{ display: 'contents' }}>
      <h2 className="ui-saveview-title">Lưu bộ lọc</h2>
      <div className="ui-saveview-sum">{dieuKien.map((d) => <span key={d.nhan} className="ui-chip">{d.nhan}: <strong>{d.gt}</strong></span>)}</div>
      <div className="ui-field">
        <label className="ui-label" htmlFor="luu-ten">Tên bộ lọc</label>
        <input ref={o} id="luu-ten" className="ui-input" placeholder="VD: P1 rò rỉ chưa xử lý" value={ten} maxLength={40}
          onChange={(e) => { setTen(e.target.value); setLoi(false) }} aria-invalid={loi || undefined} aria-describedby={loi ? 'luu-ten-e' : undefined} />
        {loi && <span className="ui-error" id="luu-ten-e">Đặt tên để tìm lại trong sidebar.</span>}
      </div>
      <label className="ui-checkbox-label"><input type="checkbox" className="ui-checkbox" checked={chung} onChange={(e) => setChung(e.target.checked)} /><span>Chia sẻ cho cả khu CSKH<span className="ui-choice-desc">Tắt thì chỉ mình bạn thấy.</span></span></label>
      <div className="ui-saveview-foot">
        <button type="button" className="ui-btn" data-variant="outline" data-size="sm" onClick={dong}>Huỷ</button>
        <button type="submit" className="ui-btn" data-size="sm">Lưu</button>
      </div>
    </form>
  )
}

// ---------- Pagination (DS) — như bang/PhanTrang: ẩn khi chỉ 1 trang ----------
export function ChanTrang({ b }: { b: Bang }) {
  if (b.soTrang <= 1) return null
  const dau = (b.trang - 1) * MOI_TRANG + 1, cuoi = dau + b.hien.length - 1
  return (
    <nav className="ui-table-foot b-chantrang" aria-label="Phân trang">
      <span>{dau}–{cuoi} trên {b.thay.length} ticket</span>
      <span className="ui-pagination">
        <button type="button" className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label="Trang trước" data-tip="Trang trước" disabled={b.trang <= 1} onClick={() => b.setTrang(b.trang - 1)}><CaretLeft aria-hidden /></button>
        <span className="ui-pagination-page" aria-current="page">Trang {b.trang} / {b.soTrang}</span>
        <button type="button" className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label="Trang sau" data-tip="Trang sau" disabled={b.trang >= b.soTrang} onClick={() => b.setTrang(b.trang + 1)}><CaretRight aria-hidden /></button>
      </span>
    </nav>
  )
}

export function Rong({ b }: { b: Bang }) {
  return (
    <div className="ui-empty">
      <div className="ui-empty-title">Không có ticket nào khớp bộ lọc</div>
      <div className="ui-empty-desc">Thử bỏ bớt điều kiện{b.q ? ` hoặc từ khoá “${b.q}”` : ''} — tìm không cần gõ dấu.</div>
      <button className="ui-btn" data-variant="outline" data-size="sm" onClick={() => { b.setLocUu([]); b.setLocChu([]); b.setLocNhom([]); b.setQ(''); b.setTab('tat-ca') }}>Xoá lọc</button>
    </div>
  )
}

export function Toast({ b }: { b: Bang }) {
  useEffect(() => { if (!b.toast) return; const id = setTimeout(() => b.setToast(null), 5000); return () => clearTimeout(id) }, [b.toast, b])
  if (!b.toast) return null
  return (
    <div className="ui-toast" role="status" aria-live="polite">
      <Check aria-hidden /> {b.toast.chu}
      {b.toast.hoan && <button onClick={() => { b.toast?.hoan?.(); b.setToast(null) }}>Hoàn tác</button>}
    </div>
  )
}

export function ThanhHangLoat({ b }: { b: Bang }) {
  const [mo, setMo] = useState<'' | 'tt' | 'chu'>('')
  if (!b.chon.size) return null
  const mas = [...b.chon]
  // như bang/ThanhDaChon: lựa chọn vượt trang đang xem PHẢI nói ra; chọn hết trang mà còn trang khác → mời chọn toàn bộ
  const trenTrang = b.hien.filter((t) => b.chon.has(t.ma)).length
  const vuotTrang = b.chon.size > trenTrang
  const moiToanBo = trenTrang === b.hien.length && b.thay.length > b.hien.length && b.chon.size < b.thay.length
  return (
    <div className="ui-bulkbar b-hangloat" role="toolbar" aria-label="Thao tác hàng loạt">
      <span className="ui-bulkbar-count">Đã chọn <strong>{b.chon.size}</strong> ticket{vuotTrang && <span className="ui-bulkbar-sub"> (gồm cả trang khác)</span>}</span>
      {moiToanBo && <button type="button" className="ui-btn" data-variant="link" data-size="sm" onClick={() => b.setChon(new Set(b.thay.map((t) => t.ma)))}>Chọn tất cả {b.thay.length} ticket khớp bộ lọc</button>}
      <span className="ui-bulkbar-sep" aria-hidden />
      <div className="b-loc-o">
        <button className="ui-btn" data-variant="ghost" data-size="sm" aria-haspopup="menu" aria-expanded={mo === 'tt'} onClick={() => setMo(mo === 'tt' ? '' : 'tt')}>Đổi trạng thái</button>
        <Noi mo={mo === 'tt'} dong={() => setMo('')} className="b-noi-tren">
          <MenuTrangThai chon={(v, l) => { b.suaNhieu(mas, { tt: v, lyDoCho: l }, `Đã đổi ${mas.length} ticket sang “${v}${l ? ' ' + l : ''}”`); setMo('') }} />
        </Noi>
      </div>
      <div className="b-loc-o">
        <button className="ui-btn" data-variant="ghost" data-size="sm" aria-haspopup="menu" aria-expanded={mo === 'chu'} onClick={() => setMo(mo === 'chu' ? '' : 'chu')}>Gán chủ</button>
        <Noi mo={mo === 'chu'} dong={() => setMo('')} className="b-noi-tren">
          <MenuChon ds={NHAN_VIEN.slice(0, 4)} gt={''} tim chon={(v) => { b.suaNhieu(mas, { chu: v }, `Đã gán ${mas.length} ticket cho ${v}`); setMo('') }} />
        </Noi>
      </div>
      <button className="ui-btn" data-variant="ghost" data-size="sm" onClick={() => b.setToast({ chu: `Đang xuất ${mas.length} ticket…` })}>Xuất Excel</button>
      <span className="ui-bulkbar-sep" aria-hidden />
      <button className="ui-btn ui-tip ui-bulkbar-close" data-variant="ghost" data-size="icon-sm" onClick={() => b.setChon(new Set())} aria-label="Bỏ chọn" data-tip="Bỏ chọn (Esc)"><X aria-hidden /></button>
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
  const tat = b.hien.length > 0 && b.hien.every((t) => b.chon.has(t.ma))
  const mot = !tat && b.hien.some((t) => b.chon.has(t.ma))
  return (
    <input type="checkbox" className="ui-checkbox" aria-label="Chọn tất cả ticket trên trang này" checked={tat}
      ref={(el) => { if (el) el.indeterminate = mot }}
      onChange={() => b.setChon(tat ? new Set() : new Set(b.hien.map((t) => t.ma)))} />
  )
}
