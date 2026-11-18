'use client'
// PROTOTYPE — khung trang chi tiết (PageHeader · PropertyList · Timeline · Composer · DetailLayout) dựng từ class DS
// khối "BỔ SUNG DS TRANG CHI TIẾT" (khung/_proto/ui.css). Nội dung ticket chỉ minh hoạ — trang chi tiết ticket CHƯA chốt.
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import {
  ArrowCounterClockwise, ArrowRight, ArrowUp, CalendarBlank, CaretDown, CaretLeft, CaretRight, ChatCircleText, Copy, DotsThree,
  GitMerge, Moon, Paperclip, Phone, Plus, Sun, UserSwitch, WarningCircle, X, XCircle, type Icon,
} from '@phosphor-icons/react'
import { Avatar, ChipTT, MenuTrangThai, NguonTag, Noi, Toast, UuTag, useBang, type Bang } from '../../bang/_bang/chung'
import { OTruong } from '../../bang/_bang/PhuongAn'
import { HOM_NAY, type Ticket } from '../../bang/_bang/data'
import { Khoi } from '../../form/_form/FormDemo'
import { isoNgay } from '../../../../bang/ngay'

const TOI = 'Kiều Trang' // người đang đăng nhập (minh hoạ)
type Su = { id: string; ai: string; viec: ReactNode; luc: string; noi?: string; tep?: string[]; icon?: Icon; mau?: 'danger' | 'success' }

const SEED: Su[] = [
  { id: 's1', ai: 'Hiền', viec: 'tạo ticket từ Zalo', luc: '2026-11-15 09:12', icon: Plus },
  { id: 's2', ai: 'Khách', viec: 'báo qua Zalo', luc: '2026-11-15 09:12', icon: ChatCircleText, noi: 'Rò nước dưới đáy máy, đọng vũng nhỏ. Máy vẫn chạy.', tep: ['day-may-1.jpg', 'day-may-2.jpg'] },
  { id: 's3', ai: 'Hiền', viec: <>đặt ưu tiên <UuTag u="P1" /></>, luc: '2026-11-15 09:40', icon: WarningCircle, mau: 'danger' },
  { id: 's4', ai: 'Hiền', viec: 'ghi chú', luc: '2026-11-16 14:05', noi: 'Gọi hướng dẫn khách tắt van cấp, chụp đáy máy.' },
  { id: 's5', ai: 'Hiền', viec: 'đặt hạn 18/11 10:00', luc: '2026-11-17 08:30', icon: CalendarBlank },
  { id: 's6', ai: 'Hiền', viec: 'ghi chú', luc: '2026-11-17 16:20', noi: 'Báo KT trưởng, xếp lịch trong ngày.' },
  { id: 's7', ai: 'Khách', viec: 'hỏi lại qua Zalo (lần 1)', luc: '2026-11-18 08:05', icon: ArrowCounterClockwise, mau: 'danger', noi: 'Bao giờ KT qua vậy em? Nước vẫn rò.' },
]
const seedChung = (t: Ticket): Su[] => [
  { id: t.ma + '1', ai: t.chu, viec: `tạo ticket từ ${t.nguon}`, luc: '2026-11-17 10:00', icon: Plus },
  { id: t.ma + '2', ai: t.chu, viec: 'ghi chú', luc: '2026-11-17 10:05', noi: t.viecTiep + '.' },
]

const THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const homQua = (() => { const d = new Date(HOM_NAY + 'T00:00'); d.setDate(d.getDate() - 1); return isoNgay(d) })() // giờ địa phương — toISOString lệch 1 ngày ở UTC+7
function tenNgay(iso: string) {
  if (iso === HOM_NAY) return 'Hôm nay'
  if (iso === homQua) return 'Hôm qua'
  const d = new Date(iso + 'T00:00')
  return `${THU[d.getDay()]}, ${iso.slice(8, 10)}/${iso.slice(5, 7)}`
}
const bayGio = () => `${HOM_NAY} ${new Date().toTimeString().slice(0, 5)}`

// ---------- Timeline ----------
function DongThoiGian({ ds, hien = 99 }: { ds: Su[]; hien?: number }) {
  const [moHet, setMoHet] = useState(false)
  const ol = useRef<HTMLOListElement>(null)
  const an = moHet ? 0 : Math.max(0, ds.length - hien)
  const xem = ds.slice(an)
  return (
    <ol ref={ol} className="ui-timeline" aria-label="Hoạt động">
      {an > 0 && <li className="ui-timeline-more"><button type="button" className="ui-btn" data-variant="ghost" data-size="sm"
        onClick={() => { setMoHet(true); requestAnimationFrame(() => ol.current?.querySelector<HTMLElement>('.ui-timeline-item')?.focus()) }}>Hiện {an} hoạt động cũ hơn</button></li>}{/* nút biến mất → đưa focus vào mục cũ nhất vừa hiện, không rơi về body */}
      {xem.flatMap((s, k) => {
        const d = s.luc.slice(0, 10), out: ReactNode[] = []
        if (d !== xem[k - 1]?.luc.slice(0, 10)) out.push(<li key={'d' + d} className="ui-timeline-day">{tenNgay(d)}</li>)
        out.push(
          <li key={s.id} className="ui-timeline-item" tabIndex={-1}>
            {s.icon ? <span className="ui-timeline-mark" data-color={s.mau} aria-hidden><s.icon /></span> : <Avatar ten={s.ai} lop="ui-timeline-mark" />}
            <div className="ui-timeline-head"><b>{s.ai}</b><span>{s.viec}</span><time dateTime={s.luc.replace(' ', 'T')} title={`${tenNgay(d)} · ${s.luc.slice(11)}`}>{s.luc.slice(11)}</time></div>
            {s.noi && <div className="ui-timeline-body">{s.noi}</div>}
            {s.tep && <div className="ui-timeline-files">{s.tep.map((f) => <a key={f} href="#" className="ui-chip" onClick={(e) => e.preventDefault()}><Paperclip className="ui-icon" aria-hidden /><span>{f}</span></a>)}</div>}
          </li>,
        )
        return out
      })}
    </ol>
  )
}

// ---------- Composer ----------
type Tep = { id: number; ten: string }
let soTep = 0
/** field-sizing: content chỉ có ở Chrome/Edge 123+, Safari mới → trình duyệt khác tự đặt chiều cao theo nội dung (max-height CSS vẫn chặn) */
const tuCao = (el: HTMLTextAreaElement | null) => {
  if (!el || CSS.supports('field-sizing', 'content')) return
  el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`
}
function Composer({ gui, trangThai }: { gui?: (noi: string, tep: string[]) => void; trangThai?: 'loi' | 'khoa' }) {
  const loi = trangThai === 'loi', khoa = trangThai === 'khoa'
  const [noi, setNoi] = useState(loi ? 'Đã hẹn KT tới 14:00, khách đồng ý.' : '')
  const [tep, setTep] = useState<Tep[]>(loi ? [{ id: ++soTep, ten: 'bien-ban-hen.pdf' }] : [])
  const file = useRef<HTMLInputElement>(null)
  const o = useRef<HTMLTextAreaElement>(null)
  const idLoi = useId()
  const rong = !noi.trim() && !tep.length
  useEffect(() => tuCao(o.current), [noi])
  const guiDi = () => { if (rong || khoa) return; gui?.(noi.trim(), tep.map((f) => f.ten)); if (!loi) { setNoi(''); setTep([]) } }
  return (
    <div className="ui-field">
      <div className="ui-composer" aria-invalid={loi || undefined} aria-disabled={khoa || undefined}>
        <textarea ref={o} className="ui-composer-input" rows={1} aria-label="Viết ghi chú" disabled={khoa} value={noi}
          placeholder={khoa ? 'Ticket đã đóng — mở lại để ghi tiếp' : 'Ghi lại việc vừa làm, khách nói gì…'}
          aria-describedby={loi ? idLoi : undefined} onChange={(e) => setNoi(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); guiDi() } }} />
        {tep.length > 0 && (
          <div className="ui-composer-files">
            {tep.map((f) => (
              <span key={f.id} className="ui-chip"><Paperclip className="ui-icon" aria-hidden /><span>{f.ten}</span>
                <button type="button" className="ui-chip-x" aria-label={`Bỏ tệp ${f.ten}`} onClick={() => setTep(tep.filter((x) => x.id !== f.id))}><X aria-hidden /></button></span>
            ))}
          </div>
        )}
        <div className="ui-composer-bar">
          <button type="button" className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label="Đính kèm tệp" data-tip="Đính kèm" disabled={khoa} onClick={() => file.current?.click()}><Paperclip aria-hidden /></button>
          <input ref={file} type="file" multiple hidden onChange={(e) => { setTep([...tep, ...Array.from(e.target.files ?? []).map((f) => ({ id: ++soTep, ten: f.name }))]); e.target.value = '' }} />
          <span className="ui-caption">Ctrl + Enter để gửi</span>
          <button type="button" className="ui-btn ui-tip" data-size="icon-sm" aria-label={loi ? 'Gửi lại' : 'Gửi'} data-tip={loi ? 'Gửi lại' : 'Gửi (Ctrl + Enter)'} disabled={rong || khoa} onClick={guiDi}><ArrowUp weight="bold" aria-hidden /></button>
        </div>
      </div>
      {loi && <span className="ui-error" id={idLoi} role="alert">Chưa gửi được — mất kết nối. Nội dung vẫn giữ nguyên, bấm gửi lại.</span>}
    </div>
  )
}

// ---------- PageHeader ----------
function NutMenu({ nhan, nut, children, phai }: { nhan: string; nut: (mo: boolean, bat: () => void) => ReactNode; children: (dong: () => void) => ReactNode; phai?: boolean }) {
  const [mo, setMo] = useState(false)
  return (
    <span style={{ display: 'inline-flex' }}>
      {nut(mo, () => setMo(!mo))}
      <Noi mo={mo} dong={() => setMo(false)} nhan={nhan} className={phai ? 'b-noi-phai' : undefined}>{children(() => setMo(false))}</Noi>
    </span>
  )
}
function DauTrang({ t, b, i, n, chuyen }: { t: Ticket; b: Bang; i: number; n: number; chuyen: (d: number) => void }) {
  return (
    <header className="ui-page-header">
      <div className="ui-page-header-top">
        <nav aria-label="Vị trí trang">
          <ol className="ui-breadcrumb">
            <li><a href="/prototype/bang?variant=A">CSKH</a></li>
            <li><a href="/prototype/bang?variant=A">Ticket</a></li>
            <li><span aria-current="page">{t.ma}</span></li>
          </ol>
        </nav>
        <div className="ui-page-header-nav">
          <span className="ui-caption" aria-label={`Ticket thứ ${i + 1} trong ${n}`}>{i + 1} / {n}</span>
          <button type="button" className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label="Ticket trước" data-tip="Ticket trước" disabled={i <= 0} onClick={() => chuyen(-1)}><CaretLeft aria-hidden /></button>
          <button type="button" className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label="Ticket sau" data-tip="Ticket sau" disabled={i >= n - 1} onClick={() => chuyen(1)}><CaretRight aria-hidden /></button>
        </div>
      </div>
      <div className="ui-page-header-main">
        <div className="ui-page-header-text">
          <h1 className="ui-page-header-title">{t.khach}</h1>
          <div className="ui-page-header-meta"><span>{t.may}</span><span>{t.serial ?? 'chưa có serial'}</span><span>{t.moNgay ? `mở ${t.moNgay} ngày` : 'mở hôm nay'}</span><span>cập nhật {t.capNhat}</span></div>
        </div>
        <div className="ui-page-header-actions">
          <button type="button" className="ui-btn" data-variant="outline"><Phone aria-hidden /> Gọi khách</button>
          <NutMenu nhan="Đổi trạng thái" nut={(mo, bat) => <button type="button" className="ui-btn" aria-haspopup="menu" aria-expanded={mo} onClick={bat}>Đổi trạng thái <CaretDown aria-hidden /></button>}>
            {(dong) => <MenuTrangThai gt={t.tt} lyDo={t.lyDoCho} chon={(v, l) => { b.sua(t.ma, { tt: v, lyDoCho: l }, `${t.ma} → ${v}${l ? ' ' + l : ''}`); dong() }} />}
          </NutMenu>
          <NutMenu phai nhan="Thao tác khác" nut={(mo, bat) => <button type="button" className="ui-btn ui-tip" data-variant="ghost" data-size="icon" aria-label="Thao tác khác" data-tip="Thao tác khác" aria-haspopup="menu" aria-expanded={mo} onClick={bat}><DotsThree weight="bold" aria-hidden /></button>}>
            {(dong) => (<>
              <button type="button" className="ui-menu-item" role="menuitem" onClick={() => { navigator.clipboard?.writeText(location.href); dong() }}><Copy className="ui-icon" aria-hidden /> Sao chép link</button>
              <button type="button" className="ui-menu-item" role="menuitem" onClick={dong}><GitMerge className="ui-icon" aria-hidden /> Gộp vào ticket khác…</button>
              <div className="ui-menu-sep" role="separator" />
              <button type="button" className="ui-menu-item" data-variant="destructive" role="menuitem" onClick={dong}><XCircle className="ui-icon" aria-hidden /> Huỷ ticket…</button>
            </>)}
          </NutMenu>
        </div>
      </div>
    </header>
  )
}

// ---------- PropertyList ----------
function ThuocTinh({ t, b }: { t: Ticket; b: Bang }) {
  return (
    <>
      <h3 className="ui-props-title">Xử lý</h3>
      <dl className="ui-props">
        <dt>Trạng thái</dt><dd><OTruong id="tt" t={t} b={b} /></dd>
        <dt>Ưu tiên</dt><dd><OTruong id="uu" t={t} b={b} /></dd>
        <dt>Loại lỗi</dt><dd><OTruong id="nhom" t={t} b={b} /></dd>
        <dt>Chủ ticket</dt><dd><OTruong id="chu" t={t} b={b} /></dd>
        <dt>Người đang làm</dt><dd><OTruong id="lam" t={t} b={b} /></dd>
        <dt>Việc tiếp theo</dt><dd><OTruong id="viec" t={t} b={b} /></dd>
        <dt>Hạn</dt><dd><OTruong id="han" t={t} b={b} /></dd>
      </dl>
      <h3 className="ui-props-title">Khách &amp; máy</h3>
      <dl className="ui-props">
        <dt>Khách</dt><dd><a href="#" className="b-link" onClick={(e) => e.preventDefault()}>{t.khach}</a></dd>
        <dt>Máy</dt><dd>{t.may}</dd>
        <dt>Serial</dt><dd>{t.serial ?? <span className="ui-props-empty">Chưa có</span>}</dd>
        <dt>Nguồn</dt><dd><NguonTag t={t} /></dd>
      </dl>
    </>
  )
}

export function ChiTietDemo({ toi, maDau }: { toi?: boolean; maDau?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(toi ? 'dark' : 'light') // ?theme=dark đọc ở server
  const b = useBang()
  const [ma, setMa] = useState(() => (maDau && b.rows.some((x) => x.ma === maDau) ? maDau : 'TK-2611-045')) // ?ma= từ ô tìm toàn cục
  const t = b.rows.find((x) => x.ma === ma)!
  // ‹ › đi trên danh sách CHỤP lúc mở trang (như Linear) — ticket đổi sang Đóng/Huỷ rơi khỏi tab vẫn giữ vị trí
  const [dsMa] = useState(() => { const d = b.thay.map((x) => x.ma); return d.includes(ma) ? d : [ma, ...d] }) // mở từ ô tìm một ticket ngoài tab → vẫn có vị trí
  const i = dsMa.indexOf(ma)
  const [su, setSu] = useState<Record<string, Su[]>>({ 'TK-2611-045': SEED })
  const ds = su[ma] ?? seedChung(t)
  // id = mã ticket + thứ tự trong nhật ký của ticket đó (tính trong hàm cập nhật → không trùng, không cần ref)
  const noiVao = (cu: Record<string, Su[]>, t2: Ticket, ds2: Omit<Su, 'id' | 'ai' | 'luc'>[]) => {
    const goc = cu[t2.ma] ?? seedChung(t2)
    return { ...cu, [t2.ma]: [...goc, ...ds2.map((x, k) => ({ id: `${t2.ma}-${goc.length + k}`, ai: TOI, luc: bayGio(), ...x }))] }
  }
  const them = (x: Omit<Su, 'id' | 'ai' | 'luc'>) => setSu((cu) => noiVao(cu, t, [x]))

  // mọi thay đổi dữ liệu (đầu trang, PropertyList của BẤT KỲ ticket, Hoàn tác trên toast) → ghi Timeline của đúng ticket đó.
  // Mẫu React "điều chỉnh state khi dữ liệu đổi": so b.rows với bản trước NGAY trong render, không dùng effect.
  const [rowsTruoc, setRowsTruoc] = useState(b.rows)
  if (rowsTruoc !== b.rows) {
    const cu = new Map(rowsTruoc.map((x) => [x.ma, x]))
    setRowsTruoc(b.rows)
    const moi: [Ticket, Omit<Su, 'id' | 'ai' | 'luc'>[]][] = []
    for (const t2 of b.rows) {
      const a = cu.get(t2.ma); if (!a || a === t2) continue
      const d: Omit<Su, 'id' | 'ai' | 'luc'>[] = []
      if (a.tt !== t2.tt || a.lyDoCho !== t2.lyDoCho) d.push({ icon: ArrowRight, viec: <>đổi trạng thái <ChipTT t={a} nho /> → <ChipTT t={t2} nho /></> })
      if (a.uu !== t2.uu) d.push({ icon: WarningCircle, mau: t2.uu === 'P1' ? 'danger' : undefined, viec: <>đổi ưu tiên <UuTag u={a.uu} /> → <UuTag u={t2.uu} /></> })
      if (a.chu !== t2.chu) d.push({ icon: UserSwitch, viec: `đổi chủ ticket ${a.chu} → ${t2.chu}` })
      if (a.nguoiLam !== t2.nguoiLam) d.push({ icon: UserSwitch, viec: `giao cho ${t2.nguoiLam}` })
      if (a.han !== t2.han) d.push({ icon: CalendarBlank, viec: `đổi hạn → ${t2.han.slice(8, 10)}/${t2.han.slice(5, 7)} ${t2.han.slice(11)}` })
      if (a.viecTiep !== t2.viecTiep) d.push({ icon: ArrowRight, viec: `đổi việc tiếp theo: “${t2.viecTiep}”` })
      if (a.nhom !== t2.nhom) d.push({ icon: ArrowRight, viec: `đổi loại lỗi ${a.nhom} → ${t2.nhom}` })
      if (d.length) moi.push([t2, d])
    }
    if (moi.length) setSu((cu0) => moi.reduce((cu, [t2, d]) => noiVao(cu, t2, d), cu0))
  }

  const tDai: Ticket = { ...t, khach: 'Công ty TNHH Thương mại Dịch vụ Kỹ thuật Môi trường Nước Sạch Minh Phát — chi nhánh Bình Dương, xưởng số 3', serial: undefined }
  return (
    <div className="proto fm ct" data-theme={theme}>
      <header className="fm-dau">
        <div>
          <h1 className="fm-h1">Trang chi tiết — component DS</h1>
          <p className="ui-caption" style={{ margin: 0 }}>Prototype · dữ liệu minh hoạ · không lưu · nội dung ticket chưa chốt, chỉ dùng để thử khung</p>
        </div>
        <button type="button" className="ui-btn ui-tip" data-variant="outline" data-size="icon" aria-label="Đổi giao diện sáng/tối" data-tip={theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon /> : <Sun />}</button>
      </header>

      <Khoi id="trang" ten="Trang mẫu (ghép đủ)" mo="Đổi trạng thái / ưu tiên / người làm ở đầu trang hoặc cột phải → dòng hoạt động tự ghi. Viết ghi chú rồi Ctrl + Enter. ‹ › chuyển ticket.">
        <div className="ct-trang">
          <DauTrang t={t} b={b} i={i} n={dsMa.length} chuyen={(d) => { const n = dsMa[i + d]; if (n) setMa(n) }} />
          {/* cảnh báo phải đọc nằm trên lưới — điện thoại không bị cột thuộc tính đẩy xuống */}
          {t.luuY && (
            <div className="ui-alert" data-color="danger" role="note">
              <WarningCircle className="ui-icon" weight="fill" aria-hidden />
              <div><div className="ui-alert-title">Lưu ý khách — phải đọc</div><div className="ui-alert-desc">Khách khó tính, đã từng phàn nàn chậm phản hồi. Gọi trước khi KT tới.</div></div>
            </div>
          )}
          <div className="ui-detail">
            <div className="ui-detail-main">
              <section aria-labelledby="ct-hd">
                <h2 className="ui-detail-heading" id="ct-hd" style={{ marginBottom: 12 }}>Hoạt động</h2>
                <DongThoiGian key={'tl-' + ma} ds={ds} hien={6} />
                <Composer key={'nhap-' + ma} gui={(noi, tep) => them({ viec: 'ghi chú', noi, tep: tep.length ? tep : undefined })} />{/* key: bản nháp không đi theo sang ticket khác */}
              </section>
            </div>
            <aside className="ui-detail-aside" aria-label="Thuộc tính ticket"><ThuocTinh t={t} b={b} /></aside>
          </div>
        </div>
      </Khoi>

      <Khoi id="page-header" ten="PageHeader" mo="Breadcrumb + vị trí trong danh sách (‹ ›) · tiêu đề tối đa 2 dòng rồi cắt … · meta · hành động. Điện thoại: hành động xuống dòng, chia đôi bề ngang.">
        <div className="ct-cot">
          <DauTrang t={tDai} b={b} i={0} n={1} chuyen={() => {}} />
        </div>
      </Khoi>

      <div className="fm-luoi">
        <Khoi id="property-list" ten="PropertyList" mo="Bấm giá trị để sửa tại chỗ. Ô trống hiện “Chưa có” màu nhạt.">
          <ThuocTinh t={b.rows.find((x) => x.ma === 'TK-2611-044')!} b={b} />
        </Khoi>
        <Khoi id="property-list-stack" ten="PropertyList — xếp dọc" mo="data-layout=&quot;stack&quot;: cho cột hẹp / thẻ xem nhanh.">
          <dl className="ui-props" data-layout="stack">
            <dt>Địa chỉ lắp</dt><dd>Tầng 2, 18 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM</dd>
            <dt>Ngày lắp</dt><dd>12/03/2025</dd>
            <dt>Hạn bảo hành</dt><dd>12/03/2027</dd>
            <dt>Ghi chú lắp đặt</dt><dd><span className="ui-props-empty">Chưa có</span></dd>
          </dl>
        </Khoi>
        <Khoi id="timeline" ten="Timeline" mo="Nhóm theo ngày · bình luận có khung, sự kiện 1 dòng · rê lên giờ để xem ngày đủ · cũ quá thì gập lại.">
          <DongThoiGian ds={SEED} hien={4} />
        </Khoi>
      </div>

      <Khoi id="composer" ten="Composer" mo="Ô tự cao theo nội dung (tối đa 240px rồi cuộn) · 📎 đính tệp · nút gửi tắt khi trống · Ctrl + Enter gửi.">
        <div className="ct-cot" style={{ display: 'grid', gap: 16 }}>
          <Composer gui={(noi) => b.setToast({ chu: `Đã gửi: ${noi.slice(0, 40)}` })} />
          <Composer trangThai="loi" />
          <Composer trangThai="khoa" />
        </div>
      </Khoi>
      <Toast b={b} />
    </div>
  )
}
