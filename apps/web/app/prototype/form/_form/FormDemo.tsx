'use client'
// PROTOTYPE — nhóm Form của DS: Radio · Switch · InputAffix (ô tiền) · DatePicker · DateRange · FileUpload · FormLayout.
// Dùng lại: Field/Label/Help/Error/Textarea/Select/Checkbox/Button/Menu của DS; `Noi` (popover) của bảng;
// `isoNgay`/`PRESETS`/`khoangPreset` của apps/web/bang/ngay.ts; `fmtVnd`/`fmtDate` của app/sales/_ui.tsx.
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { CalendarBlank, CaretDown, CaretLeft, CaretRight, FileText, Image as ImageIcon, Moon, Sun, UploadSimple, X } from '@phosphor-icons/react'
import { MenuChon, Noi } from '../../bang/_bang/chung'
import { isoNgay, khoangPreset, PRESETS } from '../../../../bang/ngay'
import { fmtDate, fmtVnd } from '../../../sales/_ui'

// ---------------- ngày ----------------
const THU = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const thangNam = (d: Date) => `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`
const tuIso = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const congNgay = (s: string, n: number) => { const d = tuIso(s); return isoNgay(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)) }
const congThang = (s: string, n: number) => { const d = tuIso(s); return isoNgay(new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), 28))) }
const dauThang = (s: string) => s.slice(0, 8) + '01'
/** 42 ô (6 tuần) bắt đầu Thứ 2 — giống ngay.ts: tuần VN bắt đầu T2 */
function luoiThang(thang: string): string[] {
  const d = tuIso(dauThang(thang)); const lui = (d.getDay() + 6) % 7
  return Array.from({ length: 42 }, (_, i) => isoNgay(new Date(d.getFullYear(), d.getMonth(), 1 - lui + i)))
}

type Khoang = { tu: string; den: string }

/** Lịch một tháng (kiểu Airbnb: ô tròn, không hiện ngày tháng khác) — role="grid", phím theo APG Date Picker Dialog */
function Lich({ thang, chon, khoang, xemTruoc, homNay, toiThieu, onChon, onRe, focus, setFocus, an }: {
  thang: string; chon?: string; khoang?: Partial<Khoang>; xemTruoc?: string; homNay: string; toiThieu?: string
  onChon: (s: string) => void; onRe?: (s: string | null) => void; focus: string; setFocus: (s: string) => void
  an?: { truoc?: boolean; sau?: boolean; doi: (n: number) => void }
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.querySelector<HTMLButtonElement>(`[data-iso="${focus}"]`)?.focus({ preventScroll: true }) }, [focus])
  const phim = (e: KeyboardEvent) => {
    const m: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    let toi: string | null = null
    if (e.key in m) toi = congNgay(focus, m[e.key])
    else if (e.key === 'PageUp') toi = congThang(focus, -1)
    else if (e.key === 'PageDown') toi = congThang(focus, 1)
    else if (e.key === 'Home') toi = congNgay(focus, -((tuIso(focus).getDay() + 6) % 7))
    else if (e.key === 'End') toi = congNgay(focus, 6 - ((tuIso(focus).getDay() + 6) % 7))
    if (toi) { e.preventDefault(); setFocus(toi) }
  }
  const t = tuIso(thang)
  const tu = khoang?.tu
  const den = khoang?.den ?? xemTruoc // chưa chọn ngày cuối: dải xem trước tới ô đang rê
  return (
    <div className="ui-cal">
      <div className="ui-cal-head">
        {an?.truoc !== false
          ? <button type="button" className="ui-btn" data-variant="ghost" data-size="icon-sm" aria-label="Tháng trước" onClick={() => an?.doi(-1)}><CaretLeft /></button>
          : <span />}
        <span className="ui-cal-title" aria-live="polite">{thangNam(t)}</span>
        {an?.sau !== false
          ? <button type="button" className="ui-btn" data-variant="ghost" data-size="icon-sm" aria-label="Tháng sau" onClick={() => an?.doi(1)}><CaretRight /></button>
          : <span />}
      </div>
      <div className="ui-cal-grid" role="grid" aria-label={thangNam(t)} ref={ref} onKeyDown={phim} onMouseLeave={() => onRe?.(null)}>
        <div role="row" style={{ display: 'contents' }}>{THU.map((x) => <span key={x} role="columnheader" className="ui-cal-wd">{x}</span>)}</div>
        {Array.from({ length: 6 }, (_, w) => (
          <div role="row" key={w} style={{ display: 'contents' }}>
            {luoiThang(thang).slice(w * 7, w * 7 + 7).map((s) => {
              if (s.slice(0, 7) !== thang.slice(0, 7)) return <span key={s} role="gridcell" aria-hidden />
              const dau = s === tu, cuoi = s === den
              const giua = !!tu && !!den && s > tu && s < den
              const range = dau && cuoi ? 'one' : dau && den ? 'start' : cuoi && tu ? 'end' : giua ? 'mid' : undefined
              const dc = s === chon || dau || s === khoang?.den
              return (
                <button key={s} type="button" role="gridcell" className="ui-cal-day" data-iso={s}
                  tabIndex={s === focus ? 0 : -1} aria-selected={dc || undefined}
                  aria-label={`${fmtDate(s)}${s === homNay ? ', hôm nay' : ''}`}
                  data-today={s === homNay || undefined} data-range={range} data-preview={(cuoi && !khoang?.den && !dau) || undefined}
                  disabled={!!toiThieu && s < toiThieu}
                  onMouseEnter={() => onRe?.(s)} onClick={() => onChon(s)}>{tuIso(s).getDate()}</button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/** DatePicker — trigger dùng ui-select-trigger; bảng nổi dùng Noi (role=dialog) */
export function DatePicker({ id, gt, doi, homNay, toiThieu, loi, placeholder = 'Chọn ngày', disabled }: {
  id: string; gt: string; doi: (s: string) => void; homNay: string; toiThieu?: string; loi?: boolean; placeholder?: string; disabled?: boolean
}) {
  const [mo, setMo] = useState(false)
  const [thang, setThang] = useState(dauThang(gt || homNay))
  const [focus, setFocus] = useState(gt || homNay)
  const btn = useRef<HTMLButtonElement>(null)
  const dong = () => { setMo(false); btn.current?.focus() }
  const mo1 = () => { setThang(dauThang(gt || homNay)); setFocus(gt || homNay); setMo(true) }
  const setF = (s: string) => { setFocus(s); if (s.slice(0, 7) !== thang.slice(0, 7)) setThang(dauThang(s)) }
  return (
    <span style={{ position: 'relative', display: 'block' }}>
      <button ref={btn} id={id} type="button" className="ui-select-trigger" aria-haspopup="dialog" aria-expanded={mo}
        aria-invalid={loi || undefined} data-placeholder={gt ? undefined : ''} disabled={disabled} onClick={() => (mo ? setMo(false) : mo1())}>
        <CalendarBlank className="ui-icon" aria-hidden />
        <span className="ui-select-value">{gt ? fmtDate(gt) : placeholder}</span>
      </button>
      <Noi mo={mo} dong={dong} role="dialog" nhan="Chọn ngày" className="ui-cal-pop">
        <Lich thang={thang} chon={gt} homNay={homNay} toiThieu={toiThieu} focus={focus} setFocus={setF}
          an={{ doi: (n) => { const t = congThang(thang, n); setThang(t); setFocus(t) } }}
          onChon={(s) => { doi(s); dong() }} />
        <div className="ui-cal-foot" style={{ marginTop: 12 }}>
          {gt ? <button type="button" className="ui-btn" data-variant="ghost" data-size="sm" onClick={() => { doi(''); dong() }}>Xoá ngày</button> : <span />}
          <button type="button" className="ui-btn" data-variant="outline" data-size="sm" onClick={() => { doi(homNay); dong() }}>Hôm nay</button>
        </div>
      </Noi>
    </span>
  )
}

/** DateRangePicker (kiểu Airbnb) — đầu bảng: số ngày + 2 ô Từ/Đến · 2 tháng · chip mốc nhanh (PRESETS của ngay.ts) · Xoá ngày / Áp dụng */
export function DateRangePicker({ id, gt, doi, homNay }: { id: string; gt: Khoang; doi: (k: Khoang) => void; homNay: string }) {
  const [mo, setMo] = useState(false)
  const [nhap, setNhap] = useState<Partial<Khoang>>(gt)
  const [re, setRe] = useState<string | null>(null)
  const [thang, setThang] = useState(congThang(dauThang(gt.den || homNay), -1))
  const [focus, setFocus] = useState(gt.tu || homNay)
  const btn = useRef<HTMLButtonElement>(null)
  const dong = () => { setMo(false); btn.current?.focus() }
  const chon = (s: string) => setNhap((k) => (!k.tu || k.den || s < k.tu ? { tu: s, den: undefined } : { tu: k.tu, den: s }))
  const thang2 = congThang(thang, 1)
  // khổ hẹp (≤ 640px): 1 tháng = tháng thứ 2 (chứa ngày cuối), đủ nút ‹ ›
  const [hep, setHep] = useState(false)
  useEffect(() => { const m = matchMedia('(max-width: 640px)'); const f = () => setHep(m.matches); f(); m.addEventListener('change', f); return () => m.removeEventListener('change', f) }, [])
  // phím đưa focus ra ngoài tháng đang xem → lật tháng theo
  const setF = (x: string) => { setFocus(x); if (x < (hep ? thang2 : thang)) setThang(congThang(dauThang(x), hep ? -1 : 0)); else if (x >= congThang(thang, 2)) setThang(congThang(dauThang(x), -1)) }
  const soNgay = nhap.tu && nhap.den ? Math.round((tuIso(nhap.den).getTime() - tuIso(nhap.tu).getTime()) / 864e5) + 1 : 0
  const nhanGt = gt.tu && gt.den ? (gt.tu === gt.den ? fmtDate(gt.tu) : `${fmtDate(gt.tu)} – ${fmtDate(gt.den)}`) : ''
  const dangChon: 'tu' | 'den' = nhap.tu && !nhap.den ? 'den' : 'tu'
  const xemTruoc = nhap.tu && !nhap.den && re && re > nhap.tu ? re : undefined
  const lich = (th: string, a: { truoc?: boolean; sau?: boolean }) => (
    <Lich thang={th} khoang={nhap} xemTruoc={xemTruoc} homNay={homNay} focus={focus} setFocus={setF} onChon={chon} onRe={setRe}
      an={{ ...a, doi: (n) => setThang(congThang(thang, n)) }} />
  )
  return (
    <span style={{ position: 'relative', display: 'block' }}>
      <button ref={btn} id={id} type="button" className="ui-select-trigger" aria-haspopup="dialog" aria-expanded={mo} data-placeholder={nhanGt ? undefined : ''}
        onClick={() => { setNhap(gt); setThang(congThang(dauThang(gt.den || homNay), -1)); setFocus(gt.tu || homNay); setMo(!mo) }}>
        <CalendarBlank className="ui-icon" aria-hidden />
        <span className="ui-select-value">{nhanGt || 'Chọn khoảng ngày'}</span>
      </button>
      <Noi mo={mo} dong={dong} role="dialog" nhan="Chọn khoảng ngày" className="ui-cal-pop">
        <div className="ui-cal-range">
          <div className="ui-cal-top">
            <div>
              <p className="ui-cal-top-title" aria-live="polite">{soNgay ? `${soNgay} ngày` : dangChon === 'tu' ? 'Chọn ngày bắt đầu' : 'Chọn ngày kết thúc'}</p>
              <span className="ui-caption">{nhap.tu && nhap.den ? `${fmtDate(nhap.tu)} – ${fmtDate(nhap.den)}` : 'Bấm ngày đầu rồi ngày cuối'}</span>
            </div>
            <div className="ui-cal-fields" role="group" aria-label="Khoảng đang chọn">
              <button type="button" className="ui-cal-field" aria-pressed={dangChon === 'tu'} data-trong={!nhap.tu || undefined}
                onClick={() => { setNhap({}); setFocus(nhap.tu ?? homNay) }}><span>Từ ngày</span><span>{nhap.tu ? fmtDate(nhap.tu) : 'Chọn ngày'}</span></button>
              <button type="button" className="ui-cal-field" aria-pressed={dangChon === 'den'} data-trong={!nhap.den || undefined}
                onClick={() => { if (nhap.tu) { setNhap({ tu: nhap.tu }); setFocus(nhap.den ?? nhap.tu) } }}><span>Đến ngày</span><span>{nhap.den ? fmtDate(nhap.den) : 'Chọn ngày'}</span></button>
            </div>
          </div>
          <div className="ui-cal-months">
            {!hep && lich(thang, { sau: false })}
            {lich(thang2, { truoc: hep })}
          </div>
          <div className="ui-cal-presets" role="group" aria-label="Mốc nhanh">
            {PRESETS.map((p) => {
              const k = khoangPreset(p.ma, tuIso(homNay))
              return <button key={p.ma} type="button" className="ui-btn" data-variant="outline" data-size="sm" aria-pressed={nhap.tu === k.tu && nhap.den === k.den}
                onClick={() => { setNhap(k); setThang(congThang(dauThang(k.den), -1)); setFocus(k.tu) }}>{p.nhan}</button>
            })}
          </div>
          <div className="ui-cal-foot">
            <button type="button" className="ui-btn" data-variant="ghost" data-size="sm" disabled={!nhap.tu} onClick={() => setNhap({})}>Xoá ngày</button>
            <span className="ui-row">
              <button type="button" className="ui-btn" data-variant="outline" data-size="sm" onClick={dong}>Huỷ</button>
              <button type="button" className="ui-btn" data-size="sm" disabled={!nhap.tu || !nhap.den} onClick={() => { doi({ tu: nhap.tu!, den: nhap.den! }); dong() }}>Áp dụng</button>
            </span>
          </div>
        </div>
      </Noi>
    </span>
  )
}

/** Ô tiền VND — gõ số, tự chèn dấu chấm nghìn (Intl vi-VN như fmtVnd), lưu giá trị số */
const vnd = new Intl.NumberFormat('vi-VN')
export function MoneyInput({ id, gt, doi, loi, moTa, ...r }: { id: string; gt: number | null; doi: (n: number | null) => void; loi?: boolean; moTa?: string; disabled?: boolean; placeholder?: string }) {
  return (
    <div className="ui-input-affix">
      <input id={id} className="ui-input" inputMode="numeric" data-align="end" autoComplete="off"
        value={gt == null ? '' : vnd.format(gt)} aria-invalid={loi || undefined} aria-describedby={moTa}
        onChange={(e) => { const so = e.target.value.replace(/\D/g, ''); doi(so ? Math.min(Number(so), 999_999_999_999) : null) }} {...r} />
      <span className="ui-affix" aria-hidden>₫</span>
    </div>
  )
}

/** FileUpload — vùng thả (input file thật bên trong, bàn phím Enter/Space mở hộp chọn) + danh sách tệp */
type Tep = { id: number; ten: string; co: number; loai: string; anh?: string; tienDo: number; loi?: string; dung?: boolean }
const kb = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} MB`)
export function FileUpload({ id, tep, setTep, toiDaMB = 10, accept = 'image/*,.pdf,.xlsx,.docx', disabled }: {
  id: string; tep: Tep[]; setTep: (f: (t: Tep[]) => Tep[]) => void; toiDaMB?: number; accept?: string; disabled?: boolean
}) {
  const [qua, setQua] = useState(false)
  const inp = useRef<HTMLInputElement>(null)
  const them = (ds: FileList | null) => {
    if (!ds) return
    const moi = [...ds].map((f, i): Tep => ({
      id: Date.now() + i, ten: f.name, co: f.size, loai: f.type, tienDo: 0,
      anh: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
      loi: f.size > toiDaMB * 1024 * 1024 ? `Quá ${toiDaMB} MB — nén lại hoặc chọn tệp khác` : undefined,
    }))
    setTep((t) => [...t, ...moi])
  }
  // ponytail: tiến độ giả bằng setInterval — khi code thật lấy từ upload Supabase Storage (onUploadProgress)
  useEffect(() => {
    if (!tep.some((t) => !t.loi && !t.dung && t.tienDo < 100)) return
    const h = setInterval(() => setTep((ts) => ts.map((t) => (t.loi || t.dung || t.tienDo >= 100 ? t : { ...t, tienDo: Math.min(100, t.tienDo + 20) }))), 250)
    return () => clearInterval(h)
  }, [tep, setTep])
  return (
    <div className="ui-stack" style={{ gap: 8 }}>
      <label className="ui-drop" htmlFor={id} data-over={qua || undefined} aria-disabled={disabled || undefined}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setQua(true) }} onDragLeave={() => setQua(false)}
        onDrop={(e) => { e.preventDefault(); setQua(false); if (!disabled) them(e.dataTransfer.files) }}>
        <input ref={inp} id={id} type="file" multiple accept={accept} disabled={disabled} onChange={(e) => { them(e.target.files); e.target.value = '' }} />
        <UploadSimple className="ui-icon" aria-hidden />
        <span className="ui-drop-title">{qua ? 'Thả tệp vào đây' : <>Kéo thả tệp hoặc <u>chọn từ máy</u></>}</span>
        <span className="ui-help">Ảnh, PDF, Excel, Word · tối đa {toiDaMB} MB mỗi tệp</span>
      </label>
      {tep.length > 0 && (
        <ul className="ui-file-list" aria-label="Tệp đã chọn">
          {tep.map((t) => (
            <li key={t.id} className="ui-file" data-state={t.loi ? 'error' : t.tienDo < 100 ? 'uploading' : 'done'}>
              <span className="ui-file-thumb">{t.anh ? <img src={t.anh} alt="" /> : t.loai.startsWith('image/') ? <ImageIcon className="ui-icon" /> : <FileText className="ui-icon" />}</span>
              <span style={{ minWidth: 0 }}>
                <span className="ui-file-name" style={{ display: 'block' }}>{t.ten}</span>
                <span className="ui-file-meta">{t.loi ?? (t.tienDo < 100 ? `${kb(t.co)} · đang tải ${t.tienDo}%` : `${kb(t.co)} · đã tải lên`)}</span>
                {!t.loi && t.tienDo < 100 && <span className="ui-progress" role="progressbar" aria-label={`Đang tải ${t.ten}`} aria-valuenow={t.tienDo} aria-valuemin={0} aria-valuemax={100}><span style={{ ['--p' as string]: `${t.tienDo}%` }} /></span>}
              </span>
              <button type="button" className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label={`Bỏ ${t.ten}`} data-tip="Bỏ tệp"
                onClick={() => setTep((ts) => ts.filter((x) => x.id !== t.id))}><X /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Select DS (≤ 10 mục): trigger ui-select-trigger + Noi + MenuChon của bảng — không dùng <select> trần */
function ChonLoai({ gt, doi, loi }: { gt: string; doi: (s: string) => void; loi?: boolean }) {
  const [mo, setMo] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'block' }}>
      <button id="f-loai" type="button" className="ui-select-trigger" aria-haspopup="listbox" aria-expanded={mo} aria-invalid={loi || undefined}
        data-placeholder={gt ? undefined : ''} onClick={() => setMo(!mo)}>
        <span className="ui-select-value">{gt || 'Chọn loại'}</span><CaretDown className="ui-icon" aria-hidden />
      </button>
      <Noi mo={mo} dong={() => setMo(false)} theoNeo>
        <MenuChon ds={['Lắp đặt', 'Bảo dưỡng', 'Sửa chữa'] as const} gt={gt as 'Lắp đặt'} chon={(v) => { doi(v); setMo(false) }} />
      </Noi>
    </span>
  )
}

// ---------------- trang demo ----------------
function Khoi({ id, ten, mo, children }: { id: string; ten: string; mo?: string; children: ReactNode }) {
  return (
    <section id={id} className="ui-card ui-card-pad fm-khoi" aria-labelledby={'k-' + ten}>
      <h2 className="ui-form-title" id={'k-' + ten} style={mo ? undefined : { marginBottom: 16 }}>{ten}</h2>
      {mo && <p className="ui-caption" style={{ margin: '0 0 16px' }}>{mo}</p>}
      {children}
    </section>
  )
}

export function FormDemo() {
  const homNay = useMemo(() => isoNgay(new Date()), [])
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  useEffect(() => { const t = new URLSearchParams(location.search).get('theme'); if (t === 'dark') setTheme('dark') }, [])
  const [ten, setTen] = useState('')
  const [loai, setLoai] = useState('')
  const [ngay, setNgay] = useState('')
  const [tien, setTien] = useState<number | null>(null)
  const [mucDo, setMucDo] = useState('thuong')
  const [kenh, setKenh] = useState<string[]>(['app'])
  const [baoNgay, setBaoNgay] = useState(true)
  const [ghiChu, setGhiChu] = useState('')
  const [tep, setTep] = useState<Tep[]>([])
  const [daGui, setDaGui] = useState(false)
  const [khoang, setKhoang] = useState<Khoang>(khoangPreset('thangnay', new Date()))
  const [ngay2, setNgay2] = useState('')
  const [tien2, setTien2] = useState<number | null>(1250000)
  const [tep2, setTep2] = useState<Tep[]>([
    { id: 1, ten: 'bien-ban-ban-giao.pdf', co: 248000, loai: 'application/pdf', tienDo: 100 },
    { id: 2, ten: 'anh-hien-truong-01.jpg', co: 2_400_000, loai: 'image/jpeg', tienDo: 60, dung: true },
    { id: 3, ten: 'video-goc-quay-man-hinh.mov', co: 48_000_000, loai: 'video/quicktime', tienDo: 0, loi: 'Quá 10 MB — nén lại hoặc chọn tệp khác' },
  ])
  const loiTen = daGui && !ten.trim(), loiNgay = daGui && !ngay, loiLoai = daGui && !loai
  const max = 500
  return (
    <div className="proto fm" data-theme={theme}>
      <header className="fm-dau">
        <div>
          <h1 className="fm-h1">Form — component DS</h1>
          <p className="ui-caption" style={{ margin: 0 }}>Prototype · dữ liệu minh hoạ · không lưu</p>
        </div>
        <button type="button" className="ui-btn ui-tip" data-variant="outline" data-size="icon" aria-label="Đổi giao diện sáng/tối" data-tip={theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon /> : <Sun />}</button>
      </header>

      <Khoi id="form" ten="Form mẫu" mo="Ghép từ component có sẵn + mới. Bấm Lưu khi để trống để xem trạng thái lỗi.">
        <form className="ui-form" noValidate onSubmit={(e) => { e.preventDefault(); setDaGui(true); const f = e.currentTarget; setTimeout(() => f.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()) }}>
          <div className="ui-form-section">
            <h3 className="ui-form-title">Thông tin chung</h3>
            <p className="ui-form-desc">Trường có dấu * là bắt buộc.</p>
            <div className="ui-form-grid">
              <div className="ui-field">
                <label className="ui-label" htmlFor="f-ten">Tiêu đề <span className="req" aria-hidden>*</span></label>
                <input id="f-ten" className="ui-input" placeholder="VD: Bảo dưỡng định kỳ" value={ten} onChange={(e) => setTen(e.target.value)} aria-invalid={loiTen || undefined} aria-describedby={loiTen ? 'f-ten-e' : undefined} />
                {loiTen && <span className="ui-error" id="f-ten-e">Nhập tiêu đề để người khác biết việc gì.</span>}
              </div>
              <div className="ui-field">
                <label className="ui-label" htmlFor="f-loai">Loại <span className="req" aria-hidden>*</span></label>
                <ChonLoai gt={loai} doi={setLoai} loi={loiLoai} />
                {loiLoai && <span className="ui-error">Chọn một loại.</span>}
              </div>
              <div className="ui-field">
                <label className="ui-label" htmlFor="f-ngay">Ngày hẹn <span className="req" aria-hidden>*</span></label>
                <DatePicker id="f-ngay" gt={ngay} doi={setNgay} homNay={homNay} toiThieu={homNay} loi={loiNgay} />
                {loiNgay ? <span className="ui-error">Chọn ngày hẹn từ hôm nay trở đi.</span> : <span className="ui-help">Không chọn được ngày đã qua.</span>}
              </div>
              <div className="ui-field">
                <label className="ui-label" htmlFor="f-tien">Chi phí dự kiến</label>
                <MoneyInput id="f-tien" gt={tien} doi={setTien} placeholder="0" moTa="f-tien-h" />
                <span className="ui-help" id="f-tien-h">{tien ? `= ${fmtVnd(tien)}` : 'Gõ số, dấu chấm tự thêm.'}</span>
              </div>
              <fieldset className="ui-choices" data-orientation="horizontal">
                <legend className="ui-label">Mức độ</legend>
                {[['thap', 'Thấp'], ['thuong', 'Thường'], ['gap', 'Gấp']].map(([v, n]) => (
                  <label key={v} className="ui-checkbox-label"><input type="radio" className="ui-radio" name="muc" value={v} checked={mucDo === v} onChange={() => setMucDo(v)} />{n}</label>
                ))}
              </fieldset>
              <fieldset className="ui-choices" data-orientation="horizontal">
                <legend className="ui-label">Báo qua</legend>
                {[['app', 'Trong app'], ['email', 'Email'], ['zalo', 'Zalo']].map(([v, n]) => (
                  <label key={v} className="ui-checkbox-label"><input type="checkbox" className="ui-checkbox" checked={kenh.includes(v)} onChange={(e) => setKenh(e.target.checked ? [...kenh, v] : kenh.filter((x) => x !== v))} />{n}</label>
                ))}
              </fieldset>
              <div className="ui-field" data-span="full">
                <label className="ui-label" htmlFor="f-gc">Ghi chú</label>
                <textarea id="f-gc" className="ui-textarea" placeholder="Nội dung cần lưu ý…" maxLength={max} value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} aria-describedby="f-gc-h" />
                <div className="ui-field-meta"><span className="ui-help" id="f-gc-h">Không ghi số điện thoại, mật khẩu.</span><span className="ui-help">{ghiChu.length}/{max}</span></div>
              </div>
              <div className="ui-field" data-span="full">
                <span className="ui-label" id="f-tep-l">Đính kèm</span>
                <FileUpload id="f-tep" tep={tep} setTep={setTep} />
              </div>
            </div>
          </div>
          <div className="ui-form-section">
            <h3 className="ui-form-title">Thông báo</h3>
            <label className="ui-switch-row" htmlFor="f-bao">
              <span><span className="ui-label" style={{ display: 'block' }}>Báo người phụ trách ngay khi lưu</span><span className="ui-help">Tắt nếu chỉ lưu nháp.</span></span>
              <input id="f-bao" type="checkbox" role="switch" className="ui-switch" checked={baoNgay} onChange={(e) => setBaoNgay(e.target.checked)} />
            </label>
          </div>
          <div className="ui-form-footer">
            <span className="ui-caption">{daGui && (loiTen || loiNgay || loiLoai) ? 'Còn trường bắt buộc chưa điền.' : 'Chưa lưu'}</span>
            <button type="button" className="ui-btn" data-variant="outline" onClick={() => setDaGui(false)}>Huỷ</button>
            <button type="submit" className="ui-btn">Lưu</button>
          </div>
        </form>
      </Khoi>

      <div className="fm-luoi">
        <Khoi id="datepicker" ten="DatePicker" mo="Trigger = Select · bảng nổi = Menu · phím mũi tên / PageUp / PageDown / Home / End">
          <div className="ui-stack" style={{ gap: 16 }}>
            <div className="ui-field"><label className="ui-label" htmlFor="d1">Trống</label><DatePicker id="d1" gt={ngay2} doi={setNgay2} homNay={homNay} /></div>
            <div className="ui-field"><label className="ui-label" htmlFor="d2">Đã chọn</label><DatePicker id="d2" gt={congNgay(homNay, 3)} doi={() => {}} homNay={homNay} /></div>
            <div className="ui-field"><label className="ui-label" htmlFor="d3">Lỗi</label><DatePicker id="d3" gt="" doi={() => {}} homNay={homNay} loi /><span className="ui-error">Chọn ngày giao.</span></div>
            <div className="ui-field"><label className="ui-label" htmlFor="d4">Tắt</label><DatePicker id="d4" gt={homNay} doi={() => {}} homNay={homNay} disabled /></div>
          </div>
        </Khoi>
        <Khoi id="daterange" ten="DateRange" mo="Mốc nhanh lấy từ PRESETS (bang/ngay.ts) · 2 tháng · Áp dụng mới đổi giá trị">
          <div className="ui-field"><label className="ui-label" htmlFor="r1">Khoảng ngày</label><DateRangePicker id="r1" gt={khoang} doi={setKhoang} homNay={homNay} /></div>
          <p className="ui-caption" style={{ margin: '12px 0 0' }}>Giá trị: {khoang.tu} → {khoang.den}</p>
        </Khoi>
        <Khoi id="o-tien" ten="Ô tiền · đơn vị" mo="InputAffix — căn phải, số thẳng cột, đơn vị mờ trong ô">
          <div className="ui-stack" style={{ gap: 16 }}>
            <div className="ui-field"><label className="ui-label" htmlFor="m1">Đơn giá</label><MoneyInput id="m1" gt={tien2} doi={setTien2} /></div>
            <div className="ui-field"><label className="ui-label" htmlFor="m2">Chiết khấu</label>
              <div className="ui-input-affix"><input id="m2" className="ui-input" inputMode="decimal" data-align="end" defaultValue="5" /><span className="ui-affix">%</span></div></div>
            <div className="ui-field"><label className="ui-label" htmlFor="m3">Số tiền</label><MoneyInput id="m3" gt={0} doi={() => {}} loi moTa="m3e" /><span className="ui-error" id="m3e">Số tiền phải lớn hơn 0.</span></div>
            <div className="ui-field"><label className="ui-label" htmlFor="m4">Đã thu</label><MoneyInput id="m4" gt={3500000} doi={() => {}} disabled /></div>
          </div>
        </Khoi>
        <Khoi id="radio-switch" ten="Radio · Checkbox · Switch">
          <div className="ui-stack" style={{ gap: 20 }}>
            <fieldset className="ui-choices">
              <legend className="ui-label">Hình thức thanh toán</legend>
              <label className="ui-checkbox-label"><input type="radio" className="ui-radio" name="tt" defaultChecked /><span>Chuyển khoản<span className="ui-choice-desc">Đối soát tự động theo sao kê.</span></span></label>
              <label className="ui-checkbox-label"><input type="radio" className="ui-radio" name="tt" /><span>Tiền mặt</span></label>
              <label className="ui-checkbox-label"><input type="radio" className="ui-radio" name="tt" disabled /><span>Thẻ (chưa hỗ trợ)</span></label>
            </fieldset>
            <div className="ui-stack" style={{ gap: 12 }}>
              <label className="ui-switch-row"><span className="ui-label">Bật</span><input type="checkbox" role="switch" className="ui-switch" defaultChecked /></label>
              <label className="ui-switch-row"><span className="ui-label">Tắt</span><input type="checkbox" role="switch" className="ui-switch" /></label>
              <label className="ui-switch-row"><span className="ui-label" style={{ color: 'var(--color-text-disabled)' }}>Không đổi được</span><input type="checkbox" role="switch" className="ui-switch" defaultChecked disabled /></label>
            </div>
          </div>
        </Khoi>
        <Khoi id="fileupload" ten="FileUpload" mo="Đang tải · xong · lỗi quá dung lượng · kéo tệp vào vùng để thấy trạng thái thả">
          <FileUpload id="u1" tep={tep2} setTep={setTep2} />
          <div style={{ marginTop: 16 }}><FileUpload id="u2" tep={[]} setTep={() => {}} disabled /></div>
        </Khoi>
      </div>
    </div>
  )
}
