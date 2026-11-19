'use client'
// PROTOTYPE — `ThongBao`: chuông + hộp thông báo trong app. Cùng nguồn sự kiện với tin bot gửi Discord (spec v2-brief mục 6
// "Cấu hình thông báo": được giao việc · sắp tới hạn · quá hạn · được @nhắc · ticket Gấp · ticket mở quá lâu · bot tạo chờ nhận…).
// Hộp nổi không chặn (non-modal dialog) qua `Noi`; class DS ở khối "BỔ SUNG DS THÔNG BÁO" (ui.css). Dữ liệu giả.
import { useId, useRef, useState, type Dispatch, type FocusEvent, type SetStateAction } from 'react'
import {
  At, Bell, CheckSquare, Checks, Circle, Clock, GearSix, Hourglass, Robot, Siren, type Icon,
} from '@phosphor-icons/react'
import { Noi } from '../../bang/_bang/chung'

export type LoaiTB = 'giao' | 'xong' | 'nhac' | 'gap' | 'han' | 'lau' | 'bot'
export type TB = {
  id: string; loai: LoaiTB; ai?: string; noi: string; dt?: string; trich?: string
  khu: string; luc: string; lucDu: string; ngay: 'nay' | 'qua' | 'cu'; doc: boolean; ma?: string; quaDiscord?: boolean
}

const ICON: Record<LoaiTB, Icon> = { giao: CheckSquare, xong: Checks, nhac: At, gap: Siren, han: Clock, lau: Hourglass, bot: Robot }
const NGAY: { id: TB['ngay']; ten: string }[] = [{ id: 'nay', ten: 'Hôm nay' }, { id: 'qua', ten: 'Hôm qua' }, { id: 'cu', ten: 'Cũ hơn' }]

/** Thông báo mẫu cho người đang đăng nhập (Kiều Trang, CSKH) — mã ticket có thật trong dữ liệu bảng */
export const DS_TB: TB[] = [
  { id: 'tb1', loai: 'giao', ai: 'Hiền', noi: 'giao việc cho bạn:', dt: 'Gọi lại Khách sạn Sen Vàng chốt lịch thay lõi', khu: 'Việc', luc: '5 phút', lucDu: '18/11/2026 15:42', ngay: 'nay', doc: false, quaDiscord: true },
  { id: 'tb2', loai: 'nhac', ai: 'Hiệp', noi: 'nhắc bạn trong', dt: 'TK-2611-042', trich: 'Khách gửi ảnh đáy máy rồi, chị xem giúp em có phải rò ở van không', khu: 'CSKH', luc: '18 phút', lucDu: '18/11/2026 15:29', ngay: 'nay', doc: false, ma: 'TK-2611-042' },
  { id: 'tb3', loai: 'gap', noi: 'Ticket Gấp chưa ai nhận:', dt: 'TK-2611-045 · Khách sạn Sen Vàng', khu: 'CSKH', luc: '1 giờ', lucDu: '18/11/2026 14:47', ngay: 'nay', doc: false, ma: 'TK-2611-045' },
  { id: 'tb4', loai: 'han', noi: 'Việc tiếp theo tới hạn 17:00 hôm nay:', dt: 'Chờ CEO duyệt miễn phí thay bơm (TK-2611-039)', khu: 'CSKH', luc: '2 giờ', lucDu: '18/11/2026 13:00', ngay: 'nay', doc: true, ma: 'TK-2611-039' },
  { id: 'tb5', loai: 'bot', ai: 'Bắp', noi: 'tạo ticket từ tin Discord, đang chờ người nhận:', dt: 'TK-2611-031 · Đỗ Minh Khoa', khu: 'CSKH', luc: 'Hôm qua 16:20', lucDu: '17/11/2026 16:20', ngay: 'qua', doc: true, ma: 'TK-2611-031', quaDiscord: true },
  { id: 'tb6', loai: 'lau', noi: 'Ticket mở quá 7 ngày:', dt: 'TK-2611-028 · Vũ Lan Anh (12 ngày, chờ hãng)', khu: 'CSKH', luc: 'Hôm qua 08:00', lucDu: '17/11/2026 08:00', ngay: 'qua', doc: true, ma: 'TK-2611-028' },
  { id: 'tb7', loai: 'xong', ai: 'Tuyết Trang', noi: 'đã xong việc bạn giao:', dt: 'Gửi hướng dẫn xả nước cho khách Lý Thị Mai', khu: 'Việc', luc: '15/11', lucDu: '15/11/2026 10:12', ngay: 'cu', doc: true, ma: 'TK-2611-020' },
]
/** Thông báo "mới đến" để giả lập thời gian thực trên trang demo */
export const TB_MOI: Omit<TB, 'id'> = { loai: 'nhac', ai: 'Hiền', noi: 'nhắc bạn trong', dt: 'TK-2611-039', trich: 'CEO duyệt miễn phí rồi, chị báo khách giúp em', khu: 'CSKH', luc: 'Vừa xong', lucDu: '18/11/2026 15:47', ngay: 'nay', doc: false, ma: 'TK-2611-039' }

const chuTB = (t: TB) => `${t.ai ? t.ai + ' ' : ''}${t.noi}${t.dt ? ' ' + t.dt : ''}`

export function ThongBao({ ds, setDs, mo: moTB, cauHinh, nut = 'icon-sm' }: {
  ds: TB[]; setDs: Dispatch<SetStateAction<TB[]>>; mo: (t: TB) => void; cauHinh: () => void; nut?: 'icon-sm' | 'icon'
}) {
  const [mo, setMo] = useState(false)
  const [tab, setTab] = useState<'tat' | 'chua'>('tat')
  // tab "Chưa đọc" giữ nguyên danh sách lúc mở tab: đánh dấu đã đọc không làm dòng biến mất dưới tay (mất focus, nhảy dòng)
  const [giu, setGiu] = useState<string[]>([])
  const id = useId()
  const chua = ds.filter((t) => !t.doc).length
  const dsHien = tab === 'tat' ? ds : ds.filter((t) => giu.includes(t.id) || !t.doc) // + thông báo mới đến khi đang mở tab
  const doiTab = (v: 'tat' | 'chua') => { if (v === 'chua') setGiu(ds.filter((t) => !t.doc).map((t) => t.id)); setTab(v) }
  const danhDau = (i: string, doc: boolean) => setDs((d) => d.map((t) => (t.id === i ? { ...t, doc } : t)))
  const dong = () => setMo(false)
  const roiRa = (e: FocusEvent<HTMLDivElement>) => { if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) dong() } // Tab ra ngoài hộp → đóng (APG non-modal)
  const TABS = [{ v: 'tat' as const, ten: 'Tất cả' }, { v: 'chua' as const, ten: 'Chưa đọc', dem: chua }]
  const moi = ds.find((t) => !t.doc && t.luc === 'Vừa xong')
  const chuong = useRef<HTMLButtonElement>(null)
  // Hộp vẽ qua portal ở cuối trang → chặn 2 đầu (focus guard, như Floating UI modal=false): Shift+Tab ở đầu về chuông,
  // Tab ở cuối sang phần tử kế sau chuông — thứ tự Tab như thể hộp nằm ngay sau nút
  const raDau = () => { dong(); chuong.current?.focus() }
  const raCuoi = () => {
    const b = chuong.current
    const ds2 = [...document.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter((e) => !e.closest('.ui-notif') && e.getClientRects().length > 0)
    const sau = b ? ds2[ds2.indexOf(b) + 1] : undefined
    dong(); (sau ?? b)?.focus()
  }

  return (
    <span className="ui-notif-neo">
      <button ref={chuong} type="button" className="ui-btn ui-tip" data-variant="ghost" data-size={nut} data-shape="rounded"
        aria-label={chua ? `Thông báo, ${chua} chưa đọc` : 'Thông báo'} data-tip="Thông báo" aria-haspopup="dialog" aria-expanded={mo}
        onClick={() => { if (!mo) doiTab(tab); setMo(!mo) }}>
        <Bell aria-hidden />{chua > 0 && <span className="ui-count" aria-hidden>{chua > 9 ? '9+' : chua}</span>}
      </button>
      {/* người dùng trình đọc màn hình nghe được thông báo mới đến khi hộp đang đóng */}
      <span role="status" className="ui-sr-only">{moi ? `Thông báo mới: ${chuTB(moi)}` : ''}</span>
      <Noi mo={mo} dong={dong} role="dialog" nhan="Thông báo" className="ui-notif">
        <div className="ui-notif-khung" onBlur={roiRa}>
          <span tabIndex={0} onFocus={raDau} />
          <div className="ui-notif-head">
            <h2 className="ui-notif-title" id={id + '-t'}>Thông báo</h2>
            <button type="button" className="ui-btn" data-variant="ghost" data-size="sm" disabled={!chua}
              onClick={(e) => { const hien = new Set(ds.map((t) => t.id)); setDs((d) => d.map((t) => (hien.has(t.id) ? { ...t, doc: true } : t))); /* chỉ loại đang hiện — loại tắt Trong app không bị đọc hộ */ e.currentTarget.closest('.ui-notif-khung')?.querySelector<HTMLElement>('[role=tab][aria-selected=true]')?.focus() }}><Checks aria-hidden />Đọc hết</button>{/* nút sắp tắt → dời focus sang tab đang chọn, không rơi về body */}
            <button type="button" className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label="Cấu hình thông báo" data-tip="Cấu hình"
              onClick={() => { dong(); cauHinh() }}><GearSix aria-hidden /></button>
          </div>
          <div className="ui-tabs-list ui-notif-tabs" data-variant="pill" role="tablist" aria-label="Lọc thông báo">
            {TABS.map((x, i) => (
              <button key={x.v} type="button" role="tab" id={`${id}-tab-${x.v}`} aria-controls={`${id}-pn`} className="ui-tabs-trigger"
                aria-selected={tab === x.v} tabIndex={tab === x.v ? 0 : -1} data-autofocus={tab === x.v || undefined} onClick={() => doiTab(x.v)}
                onKeyDown={(e) => {
                  const j = e.key === 'ArrowRight' || e.key === 'ArrowLeft' ? 1 - i : e.key === 'Home' ? 0 : e.key === 'End' ? 1 : -1
                  if (j < 0) return
                  e.preventDefault(); doiTab(TABS[j].v); e.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role=tab]')[j]?.focus()
                }}>
                {x.ten}{x.dem ? <span className="ui-tabs-count">{x.dem}</span> : null}
              </button>
            ))}
          </div>
          <div className="ui-notif-list" role="tabpanel" id={`${id}-pn`} aria-labelledby={`${id}-tab-${tab}`} tabIndex={dsHien.length ? undefined : 0}>
            {dsHien.length === 0 ? (
              <div className="ui-empty">
                <Checks className="ui-empty-icon" aria-hidden />
                <p className="ui-empty-title">{tab === 'chua' ? 'Đã đọc hết' : 'Chưa có thông báo'}</p>
                <p className="ui-empty-desc">Thông báo mới hiện ở đây, và gửi cả lên Discord nếu bạn bật trong Cấu hình.</p>
              </div>
            ) : NGAY.map((n) => {
              const nhom = dsHien.filter((t) => t.ngay === n.id)
              if (!nhom.length) return null
              return (
                <div key={n.id} role="group" aria-labelledby={`${id}-n-${n.id}`}>
                  <h3 className="ui-menu-label" id={`${id}-n-${n.id}`}>{n.ten}</h3>
                  <ul className="ui-notif-ul">
                    {nhom.map((t) => {
                      const I = ICON[t.loai]
                      return (
                        <li key={t.id} className="ui-notif-item" data-unread={!t.doc || undefined}>
                          <button type="button" className="ui-notif-main" onClick={() => { danhDau(t.id, true); dong(); moTB(t) }}>
                            <span className="ui-notif-icon" data-loai={t.loai} aria-hidden><I /></span>
                            <span className="ui-notif-body">
                              <span className="ui-notif-text">{!t.doc && <span className="ui-sr-only">Chưa đọc. </span>}{t.ai && <b>{t.ai} </b>}{t.noi}{t.dt && <> <b>{t.dt}</b></>}</span>
                              {t.trich && <span className="ui-notif-quote">“{t.trich}”</span>}
                              <span className="ui-notif-meta">{t.khu} · <time title={t.lucDu}>{t.luc}</time>{t.quaDiscord && ' · qua Discord'}</span>
                            </span>
                          </button>
                          <button type="button" className="ui-btn ui-notif-mark" data-variant="ghost" data-size="icon-sm"
                            aria-label={t.doc ? `Đánh dấu chưa đọc: ${chuTB(t)}` : `Đánh dấu đã đọc: ${chuTB(t)}`} title={t.doc ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                            onClick={() => danhDau(t.id, !t.doc)}>
                            {t.doc ? <Circle aria-hidden /> : <span className="ui-dot" data-color="info" />}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
          <span tabIndex={0} onFocus={raCuoi} />
        </div>
      </Noi>
    </span>
  )
}
