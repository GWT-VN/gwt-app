'use client'
// PROTOTYPE — nhóm Phản hồi của DS (ConfirmDialog · EmptyState · Skeleton · Banner · Toast · nút đang tải), class ở khối
// "BỔ SUNG DS PHẢN HỒI" (khung/_proto/ui.css). Dữ liệu giả, không lưu.
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowClockwise, Check, CloudSlash, Flask, GitMerge, Info, LockSimple, MagnifyingGlass, Moon, Sun, Trash, Tray, WarningCircle, X,
} from '@phosphor-icons/react'
import { Khoi } from '../../form/_form/FormDemo'

const ngu = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ---------- Toast (vùng aria-live luôn có mặt → trình đọc màn hình đọc được khi nội dung đổi) ----------
type ToastT = { loai: 'ok' | 'loi' | 'chay'; chu: string; nut?: { ten: string; lam: () => void }; p?: number }
function VungToast({ t, dong }: { t: ToastT | null; dong: () => void }) {
  const [dungCho, setDungCho] = useState<ToastT | null>(null) // rê chuột / focus vào toast → dừng hẹn giờ (WCAG 2.2.1: kịp bấm Hoàn tác)
  const dung = !!t && dungCho === t // gắn với đúng toast đó — toast sau không thừa hưởng
  useEffect(() => { if (t?.loai !== 'ok' || dung) return; const id = setTimeout(dong, 5000); return () => clearTimeout(id) }, [t, dong, dung]) // lỗi + đang chạy: không tự tắt
  const the = t && (
        <div className="ui-toast" data-color={t.loai === 'loi' ? 'danger' : undefined}
          onMouseEnter={() => setDungCho(t)} onMouseLeave={() => setDungCho(null)} onFocus={() => setDungCho(t)} onBlur={() => setDungCho(null)}>
          {t.loai === 'chay' ? <span className="ui-spinner" aria-hidden /> : t.loai === 'loi' ? <WarningCircle weight="fill" aria-hidden /> : <Check aria-hidden />}
          {t.chu}
          {t.p != null && <span className="ui-progress" role="progressbar" aria-valuenow={t.p} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ"><span style={{ ['--p' as string]: `${t.p}%` }} /></span>}
          {t.nut && <button type="button" onClick={t.nut.lam}>{t.nut.ten}</button>}
          {t.loai !== 'ok' && t.loai !== 'chay' && <button type="button" className="ui-toast-x" aria-label="Đóng thông báo" onClick={dong}><X aria-hidden /></button>}
        </div>
  )
  // 2 vùng live LUÔN có mặt, không đổi role theo nội dung (đổi role cùng lúc với nội dung → NVDA/JAWS hay bỏ qua)
  return (
    <>
      <div role="status" aria-live="polite">{t?.loai !== 'loi' && the}</div>
      <div role="alert" aria-live="assertive">{t?.loai === 'loi' && the}</div>
    </>
  )
}

// ---------- ConfirmDialog trên thẻ <dialog> gốc ----------
type Hop = { dong: () => void; setBan: (v: boolean) => void; idTen: string; idMoTa: string }
/** nội dung hộp bị gỡ khi hộp đóng (Esc / bấm nền) → việc đang chạy xong thì kiểm cờ này, không báo "đã xong" cho việc người dùng đã bỏ */
function useConSong() {
  const song = useRef(true)
  useEffect(() => { song.current = true; return () => { song.current = false } }, [])
  return song
}
function HopXacNhan({ mo, dong, children }: { mo: boolean; dong: () => void; children: (h: Hop) => ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [ban, setBan] = useState(false) // đang chạy việc → Esc / bấm nền không đóng
  const nhanNen = useRef(false)
  const id = useId(), idTen = id + 't', idMoTa = id + 'd'
  useLayoutEffect(() => { // layout: đóng trước khi vẽ → không chớp khung rỗng
    const d = ref.current; if (!d) return
    if (mo && !d.open) { d.showModal(); d.querySelector<HTMLElement>('[data-autofocus]')?.focus() } // autoFocus của React chạy lúc hộp còn đóng → không ăn
    if (!mo && d.open) d.close()
  }, [mo])
  // bấm nền = điểm bấm NẰM NGOÀI khung hộp, cả lúc nhấn lẫn lúc thả (kéo chọn chữ rồi thả ra ngoài không tính)
  const ngoai = (e: { clientX: number; clientY: number; target: EventTarget; currentTarget: HTMLDialogElement }) => {
    if (e.target !== e.currentTarget) return false
    const r = e.currentTarget.getBoundingClientRect()
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
  }
  return (
    <dialog ref={ref} className="ui-dialog" role="alertdialog" aria-labelledby={idTen} aria-describedby={idMoTa} onClose={() => { setBan(false); dong() }}
      onCancel={(e) => { if (ban) e.preventDefault() }}
      onPointerDown={(e) => { nhanNen.current = ngoai(e) }}
      onClick={(e) => { if (nhanNen.current && ngoai(e) && !ban) dong(); nhanNen.current = false }}>
      {mo && children({ dong, setBan, idTen, idMoTa })}
    </dialog>
  )
}

function DongTicket({ h, xong }: { h: Hop; xong: (t: ToastT) => void }) {
  const [dang, setDang] = useState(false)
  const { dong } = h
  const song = useConSong()
  return (
    <>
      <h2 className="ui-dialog-title" id={h.idTen}>Đóng ticket TK-2611-045?</h2>
      <p className="ui-dialog-desc" id={h.idMoTa}>Ticket chuyển sang “Đóng”. Khách báo lại trong 7 ngày thì ticket tự mở lại.</p>
      <div className="ui-dialog-footer">
        <button type="button" className="ui-btn" data-variant="outline" onClick={dong} disabled={dang}>Huỷ</button>
        <button type="button" className="ui-btn" data-loading={dang || undefined} aria-busy={dang} data-autofocus
          onClick={async () => { if (dang) return; setDang(true); h.setBan(true); await ngu(900); if (!song.current) return; dong(); xong({ loai: 'ok', chu: 'Đã đóng TK-2611-045', nut: { ten: 'Hoàn tác', lam: () => xong({ loai: 'ok', chu: 'Đã mở lại TK-2611-045' }) } }) }}>
          <span>Đóng ticket</span>{dang && <span className="ui-spinner" aria-hidden />}
        </button>
      </div>
    </>
  )
}

function XoaPhieu({ h, xong }: { h: Hop; xong: (t: ToastT) => void }) {
  const { dong } = h
  const song = useConSong()
  const o = useRef<HTMLTextAreaElement>(null)
  const [lyDo, setLyDo] = useState('')
  const [thu, setThu] = useState(false)
  const [dang, setDang] = useState(false)
  const id = useId()
  const loi = thu && !lyDo.trim()
  return (
    <form onSubmit={async (e) => {
      e.preventDefault(); if (dang) return; setThu(true)
      if (!lyDo.trim()) { o.current?.focus(); return } // lỗi → đưa focus vào ô để trình đọc màn hình đọc lỗi
      setDang(true); h.setBan(true); await ngu(900); if (!song.current) return; dong(); xong({ loai: 'ok', chu: 'Đã xoá phiếu chi PC-2611-018' })
    }} noValidate>
      <div className="ui-dialog-icon" data-color="danger" aria-hidden><Trash /></div>
      <h2 className="ui-dialog-title" id={h.idTen}>Xoá phiếu chi PC-2611-018?</h2>
      <p className="ui-dialog-desc">Không hoàn tác được. Sẽ xảy ra:</p>
      <div className="ui-dialog-body">
        <ul className="ui-dialog-list" id={h.idMoTa}>
          <li>Phiếu biến mất khỏi Báo cáo thu chi tháng 11.</li>
          <li>Số dư quỹ tiền mặt tăng lại 1.250.000 ₫.</li>
          <li>Lịch sử phiếu vẫn giữ trong nhật ký kiểm toán.</li>
        </ul>
        <div className="ui-field ph-lydo">
          <label className="ui-label" htmlFor={id}>Lý do xoá <span className="req" aria-hidden>*</span></label>
          <textarea ref={o} id={id} className="ui-textarea" rows={2} value={lyDo} onChange={(e) => setLyDo(e.target.value)} placeholder="VD: nhập trùng với PC-2611-017"
            aria-invalid={loi || undefined} aria-describedby={loi ? id + 'e' : undefined} />
          {loi && <span className="ui-error" id={id + 'e'}>Ghi lý do để người đối soát hiểu vì sao phiếu mất.</span>}
        </div>
      </div>
      <div className="ui-dialog-footer">
        <button type="button" className="ui-btn" data-variant="outline" onClick={dong} disabled={dang} data-autofocus>Quay lại</button>
        <button type="submit" className="ui-btn" data-variant="destructive" data-loading={dang || undefined} aria-busy={dang}><span>Xoá phiếu</span>{dang && <span className="ui-spinner" aria-hidden />}</button>
      </div>
    </form>
  )
}

function GopKhach({ h, xong }: { h: Hop; xong: (t: ToastT) => void }) {
  const { dong } = h
  const MA = 'KH-00231'
  const [go, setGo] = useState('')
  const id = useId()
  const dung = go.trim().toUpperCase() === MA
  return (
    <>
      <div className="ui-dialog-icon" data-color="danger" aria-hidden><GitMerge /></div>
      <h2 className="ui-dialog-title" id={h.idTen}>Gộp “Nguyễn Văn An” vào khách KH-00198?</h2>
      <p className="ui-dialog-desc" id={h.idMoTa}>Ticket, máy, lịch bảo trì của KH-00231 chuyển sang KH-00198, rồi KH-00231 bị xoá. Không tách lại được.</p>
      <div className="ui-dialog-body">
        <div className="ui-field">
          <label className="ui-label" htmlFor={id}>Gõ <b>{MA}</b> để xác nhận</label>
          <input id={id} className="ui-input" value={go} onChange={(e) => setGo(e.target.value)} autoComplete="off" spellCheck={false} data-autofocus />
        </div>
      </div>
      <div className="ui-dialog-footer">
        <button type="button" className="ui-btn" data-variant="outline" onClick={dong}>Huỷ</button>
        <button type="button" className="ui-btn" data-variant="destructive" disabled={!dung} onClick={() => { dong(); xong({ loai: 'ok', chu: `Đã gộp ${MA} vào KH-00198` }) }}>Gộp khách</button>
      </div>
    </>
  )
}

// ---------- Skeleton ----------
function DsTai() {
  const [tai, setTai] = useState(true)
  useEffect(() => { if (!tai) return; const id = setTimeout(() => setTai(false), 1600); return () => clearTimeout(id) }, [tai])
  const DONG = [['Gấp', 'Khách sạn Sen Vàng', 'Báo KT trưởng, xếp lịch'], ['Cao', 'Nhà hàng Bếp Quê', 'Hẹn lấy mẫu nước'], ['Thường', 'Lê Quốc Huy', 'Gọi khách xác nhận lỗi'], ['Thường', 'Phan Văn Tài', 'Phân loại lỗi'], ['Thấp', 'Hoàng Gia Bảo', 'Hướng dẫn kết nối wifi']]
  return (
    <>
      <button type="button" className="ui-btn" data-variant="outline" data-size="sm" onClick={() => setTai(true)} disabled={tai}><ArrowClockwise aria-hidden /> Tải lại</button>
      <div className="ph-ds" aria-busy={tai} aria-live="polite">
        {tai ? (
          <div aria-label="Đang tải danh sách">{DONG.map((_, i) => (
            <div key={i} className="ui-skeleton-row" aria-hidden><span className="ui-skeleton" data-shape="pill" /><span className="ui-skeleton" data-w="1/3" /><span className="ui-skeleton" /><span className="ui-skeleton" data-shape="circle" /></div>
          ))}</div>
        ) : DONG.map(([u, k, v]) => (
          <div key={k} className="ui-skeleton-row"><span className="ui-badge ph-u">{u}</span><span className="ph-k">{k}</span><span className="ui-caption ph-v">{v}</span><span className="ui-avatar">H</span></div>
        ))}
      </div>
    </>
  )
}

export function PhanHoiDemo({ toi }: { toi?: boolean }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(toi ? 'dark' : 'light') // ?theme=dark đọc ở server
  const [hop, setHop] = useState<'' | 'dong' | 'xoa' | 'gop'>('')
  const [toast, setToast] = useState<ToastT | null>(null)
  const [dangLuu, setDangLuu] = useState(false)
  const [thuLai, setThuLai] = useState(false)
  const [banner, setBanner] = useState(true)
  const dongHop = () => setHop('')
  const phien = useRef(0) // toast mới → việc xuất đang chạy dừng lại, không đè lên sau
  const bao = useCallback((t: ToastT | null) => { phien.current++; setToast(t) }, [])
  const chay = async () => {
    const toi = ++phien.current
    for (let p = 0; p <= 100; p += 20) { if (phien.current !== toi) return; setToast({ loai: 'chay', chu: 'Đang xuất Báo cáo thu chi 11.2026.xlsx', p }); await ngu(400) }
    if (phien.current === toi) bao({ loai: 'ok', chu: 'Đã xuất 11.2026.xlsx', nut: { ten: 'Mở', lam: () => bao(null) } })
  }
  const tatToast = useCallback(() => bao(null), [bao]) // ổn định → hẹn giờ tự tắt không bị đặt lại mỗi lần render

  return (
    <div className="proto fm" data-theme={theme}>
      <header className="fm-dau">
        <div>
          <h1 className="fm-h1">Phản hồi — component DS</h1>
          <p className="ui-caption" style={{ margin: 0 }}>Prototype · dữ liệu minh hoạ · không lưu</p>
        </div>
        <button type="button" className="ui-btn ui-tip" data-variant="outline" data-size="icon" aria-label="Đổi giao diện sáng/tối" data-tip={theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon /> : <Sun />}</button>
      </header>

      <Khoi id="chon" ten="Chọn kiểu phản hồi nào" mo="Một luật để mọi màn giống nhau.">
        <table className="ui-table ph-luat">
          <thead><tr><th>Tình huống</th><th>Dùng</th><th>Ví dụ</th></tr></thead>
          <tbody>
            <tr><td>Làm xong một việc, lùi lại được</td><td>Toast + Hoàn tác — <b>không hỏi trước</b></td><td>Đổi trạng thái, đóng ticket</td></tr>
            <tr><td>Việc KHÔNG lùi được</td><td>ConfirmDialog nói rõ hậu quả</td><td>Xoá phiếu chi, gộp khách</td></tr>
            <tr><td>Lỗi / cảnh báo gắn với một khối nội dung</td><td>Alert tại chỗ</td><td>Lưu ý khách, form gửi lỗi</td></tr>
            <tr><td>Trạng thái của cả trang / app</td><td>Banner</td><td>Mất mạng, dữ liệu thử, bản mới</td></tr>
            <tr><td>Đang tải nội dung</td><td>Skeleton (tải &gt; 300 ms); bấm nút → nút xoay</td><td>Mở danh sách, Lưu</td></tr>
            <tr><td>Không có gì để hiện</td><td>EmptyState đúng 1 trong 4 lý do</td><td>Chưa có · không khớp lọc · lỗi · không có quyền</td></tr>
          </tbody>
        </table>
      </Khoi>

      <Khoi id="confirm" ten="ConfirmDialog" mo="Thẻ <dialog> gốc: tự giữ focus trong hộp, Esc / bấm nền để đóng. Việc nguy hiểm: focus mặc định vào nút an toàn.">
        <div className="ph-nut">
          <button type="button" className="ui-btn" data-variant="outline" onClick={() => setHop('dong')}>Đóng ticket…</button>
          <button type="button" className="ui-btn" data-variant="outline" onClick={() => setHop('xoa')}><Trash aria-hidden /> Xoá phiếu chi…</button>
          <button type="button" className="ui-btn" data-variant="outline" onClick={() => setHop('gop')}><GitMerge aria-hidden /> Gộp khách…</button>
        </div>
        <p className="ui-caption ph-ghi">Đóng ticket lùi được → thực tế dùng Toast Hoàn tác; ở đây để so sánh hộp thường với hộp nguy hiểm.</p>
      </Khoi>

      <Khoi id="empty" ten="EmptyState — 4 lý do" mo="Luôn nói vì sao trống + việc làm tiếp.">
        <div className="ph-luoi">
          <div className="ui-empty" data-size="sm">
            <div className="ui-empty-icon" aria-hidden><Tray /></div>
            <div className="ui-empty-title">Chưa có phiếu chi nào</div>
            <div className="ui-empty-desc">Phiếu chi tháng này sẽ hiện ở đây.</div>
            <div className="ui-empty-actions"><button type="button" className="ui-btn" data-size="sm">Tạo phiếu chi</button><button type="button" className="ui-btn" data-variant="outline" data-size="sm">Nhập từ Excel</button></div>
          </div>
          <div className="ui-empty" data-size="sm">
            <div className="ui-empty-icon" aria-hidden><MagnifyingGlass /></div>
            <div className="ui-empty-title">Không có ticket nào khớp bộ lọc</div>
            <div className="ui-empty-desc">Thử bỏ bớt điều kiện hoặc từ khoá “sen vang” — tìm không cần gõ dấu.</div>
            <div className="ui-empty-actions"><button type="button" className="ui-btn" data-variant="outline" data-size="sm">Xoá lọc</button></div>
          </div>
          <div className="ui-empty" data-size="sm">
            <div className="ui-empty-icon" data-color="danger" aria-hidden><CloudSlash /></div>
            <div className="ui-empty-title">Không tải được danh sách</div>
            <div className="ui-empty-desc">Mạng chập chờn hoặc máy chủ đang bận. Dữ liệu không bị mất.</div>
            <div className="ui-empty-actions">
              <button type="button" className="ui-btn" data-variant="outline" data-size="sm" data-loading={thuLai || undefined} aria-busy={thuLai}
                onClick={async () => { if (thuLai) return; setThuLai(true); await ngu(1200); setThuLai(false); bao({ loai: 'loi', chu: 'Vẫn chưa tải được', nut: { ten: 'Thử lại', lam: () => bao(null) } }) }}>
                <ArrowClockwise aria-hidden /><span>Thử lại</span>{thuLai && <span className="ui-spinner" aria-hidden />}
              </button>
            </div>
          </div>
          <div className="ui-empty" data-size="sm">
            <div className="ui-empty-icon" aria-hidden><LockSimple /></div>
            <div className="ui-empty-title">Bạn chưa có quyền xem Kế toán</div>
            <div className="ui-empty-desc">Nhờ quản trị cấp vai “Kế toán” rồi tải lại trang.</div>
          </div>
        </div>
      </Khoi>

      <div className="fm-luoi ph-2cot">
        <Khoi id="skeleton" ten="Skeleton" mo="Giữ đúng hình dòng thật → nội dung về không nhảy chỗ. Vùng đang tải có aria-busy.">
          <DsTai />
        </Khoi>
        <Khoi id="loading" ten="Nút đang chạy" mo="Giữ nguyên bề rộng, chữ ẩn, vòng xoay ở giữa; chặn bấm 2 lần.">
          <div className="ph-nut">
            <button type="button" className="ui-btn" data-loading={dangLuu || undefined} aria-busy={dangLuu} onClick={async () => { if (dangLuu) return; setDangLuu(true); await ngu(1400); setDangLuu(false); bao({ loai: 'ok', chu: 'Đã lưu' }) }}>
              <span>Lưu thay đổi</span>{dangLuu && <span className="ui-spinner" aria-hidden />}
            </button>
            <button type="button" className="ui-btn" data-variant="outline" data-loading aria-busy><span>Đang gửi</span><span className="ui-spinner" aria-hidden /></button>
          </div>
        </Khoi>
      </div>

      <Khoi id="banner" ten="Banner" mo="Dải trên cùng cho trạng thái cả app. Tối đa 1 banner một lúc; mất mạng ưu tiên cao nhất.">
        <div className="ph-banner">
          <div className="ui-banner" data-color="warning" role="status"><CloudSlash className="ui-icon" aria-hidden /><span className="ui-banner-text"><b>Mất kết nối.</b> Thay đổi đang chờ, sẽ tự lưu khi có mạng lại.</span><button type="button" className="ui-btn" data-variant="ghost" data-size="sm">Thử lại</button></div>
          <div className="ui-banner" role="status"><Flask className="ui-icon" aria-hidden /><span className="ui-banner-text">Đang xem <b>dữ liệu thử (local)</b> — không phải dữ liệu thật.</span></div>
          {banner && <div className="ui-banner" role="status"><Info className="ui-icon" aria-hidden /><span className="ui-banner-text">Có bản cập nhật mới của GWT App.</span><button type="button" className="ui-btn" data-variant="outline" data-size="sm">Tải lại</button><button type="button" className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label="Ẩn thông báo" data-tip="Ẩn" onClick={() => setBanner(false)}><X aria-hidden /></button></div>}
          <div className="ui-banner" data-color="danger" role="alert"><WarningCircle className="ui-icon" weight="fill" aria-hidden /><span className="ui-banner-text">Phiên đăng nhập hết hạn sau <b>2 phút</b>. Lưu việc đang làm.</span><button type="button" className="ui-btn" data-variant="outline" data-size="sm">Gia hạn</button></div>
        </div>
      </Khoi>

      <Khoi id="toast" ten="Toast" mo="Thành công tự tắt sau 5 giây. Lỗi và đang chạy KHÔNG tự tắt.">
        <div className="ph-nut">
          <button type="button" className="ui-btn" data-variant="outline" onClick={() => bao({ loai: 'ok', chu: 'TK-2611-045 → Đang xử lý', nut: { ten: 'Hoàn tác', lam: () => bao(null) } })}>Thành công + Hoàn tác</button>
          <button type="button" className="ui-btn" data-variant="outline" onClick={() => bao({ loai: 'loi', chu: 'Không lưu được — mất kết nối', nut: { ten: 'Thử lại', lam: () => bao(null) } })}>Lỗi + Thử lại</button>
          <button type="button" className="ui-btn" data-variant="outline" onClick={chay}>Đang chạy (xuất Excel)</button>
        </div>
      </Khoi>

      <HopXacNhan mo={hop === 'dong'} dong={dongHop}>{(h) => <DongTicket h={h} xong={bao} />}</HopXacNhan>
      <HopXacNhan mo={hop === 'xoa'} dong={dongHop}>{(h) => <XoaPhieu h={h} xong={bao} />}</HopXacNhan>
      <HopXacNhan mo={hop === 'gop'} dong={dongHop}>{(h) => <GopKhach h={h} xong={bao} />}</HopXacNhan>
      <VungToast t={toast} dong={tatToast} />
    </div>
  )
}
