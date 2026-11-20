'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  At,
  Bell,
  CheckSquare,
  Checks,
  Circle,
  Clock,
  GearSix,
  Hourglass,
  Robot,
  Siren,
} from '@phosphor-icons/react/ssr'
import type { Icon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Count, CountNeo } from './count'
import { EmptyState } from './empty-state'
import { menuContent, menuLabel } from './menu-styles'
import {
  notifBody,
  notifBox,
  notifDot,
  notifHead,
  notifIcon,
  notifItem,
  notifKhung,
  notifList,
  notifMain,
  notifMark,
  notifMeta,
  notifNhom,
  notifQuote,
  notifRong,
  notifTabs,
  notifText,
  notifTitle,
  notifUl,
} from './notif-styles'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Tabs, TabsContent, TabsCount, TabsList, TabsTrigger } from './tabs'
import { tabsContent } from './tabs-styles'

/** Loại thông báo (icon + màu nền icon). Cùng nguồn sự kiện với tin bot gửi Discord. */
export type LoaiThongBaoMuc = 'giao' | 'xong' | 'nhac' | 'gap' | 'han' | 'lau' | 'bot'

/**
 * Một thông báo. Câu đọc = `ai` (đậm) + `noi` + `dt` (đậm): "Minh giao việc cho bạn: Gọi lại …".
 * `luc` = ISO có múi giờ (timestamptz) — nhóm ngày + chữ "5 phút / Hôm qua 16:20 / 15/11" tính theo giờ VN.
 */
export type ThongBaoMuc = {
  id: string
  loai: LoaiThongBaoMuc
  ai?: string
  noi: string
  dt?: string
  /** Trích lời nhắc (2 dòng, kẻ trái). */
  trich?: string
  /** Khu phát sinh: "Việc", "CSKH"… */
  khu: string
  luc: string
  doc: boolean
  quaDiscord?: boolean
}

const ICON: Record<LoaiThongBaoMuc, Icon> = {
  giao: CheckSquare,
  xong: Checks,
  nhac: At,
  gap: Siren,
  han: Clock,
  lau: Hourglass,
  bot: Robot,
}

// ponytail: giờ VN cố định UTC+7 (như timeline.tsx) → cộng 7 giờ rồi đọc phần UTC; cần múi khác thì đổi sang Intl.
const VN = 7 * 3600e3
const isoVN = (ms: number) => new Date(ms + VN).toISOString()
const ngayTruoc = (ngay: string) => new Date(Date.parse(`${ngay}T00:00:00Z`) - 864e5).toISOString().slice(0, 10)
const dmy = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

type Nhom = 'nay' | 'qua' | 'cu'
const NHOM: { id: Nhom; ten: string }[] = [
  { id: 'nay', ten: 'Hôm nay' },
  { id: 'qua', ten: 'Hôm qua' },
  { id: 'cu', ten: 'Cũ hơn' },
]

/** Nhóm ngày + chữ thời gian ngắn + chữ đủ (title) của một thông báo, so với `bay` (ms) — theo giờ VN. */
function thoiGian(luc: string, bay: number): { nhom: Nhom; chu: string; du: string } {
  const t = Date.parse(luc)
  const v = isoVN(t)
  const ngay = v.slice(0, 10)
  const gio = v.slice(11, 16)
  const homNay = isoVN(bay).slice(0, 10)
  const du = `${dmy(v)}/${v.slice(0, 4)} ${gio}`
  if (ngay >= homNay) {
    const phut = Math.max(0, Math.floor((bay - t) / 6e4))
    return { nhom: 'nay', chu: phut < 1 ? 'Vừa xong' : phut < 60 ? `${phut} phút` : `${Math.floor(phut / 60)} giờ`, du }
  }
  if (ngay === ngayTruoc(homNay)) return { nhom: 'qua', chu: `Hôm qua ${gio}`, du }
  return { nhom: 'cu', chu: dmy(v), du }
}

const chuTB = (t: ThongBaoMuc) => `${t.ai ? t.ai + ' ' : ''}${t.noi}${t.dt ? ' ' + t.dt : ''}`

const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * NotificationCenter — chuông + hộp thông báo trong app (README NotificationCenter), giá trị `.ui-notif*` của
 * ds/nguon/bundle.css. Hành vi chép từ prototype `ThongBao` (đã duyệt).
 * - Bên gọi đưa `thongBao` ĐÃ LỌC theo cột "Trong app" của `NotificationMatrix` — "Đọc hết" chỉ đánh dấu những gì đang
 *   hiện (`onDocHet(ids)`), loại tắt Trong app không bị đọc hộ.
 * - Hộp: Popover `modal={false}` (non-modal dialog, `aria-label="Thông báo"`). Mở → focus tab đang chọn. Esc → đóng,
 *   focus về chuông. Chốt focus hai đầu (hộp nằm ở portal cuối trang): Shift+Tab ở đầu → đóng, về chuông; Tab ở cuối →
 *   đóng, sang phần tử kế sau chuông — thứ tự Tab như thể hộp đứng ngay sau nút.
 * - Tab pill Tất cả · Chưa đọc + số (←/→, Home/End do Radix Tabs). Tab Chưa đọc giữ dòng vừa đọc ở yên chỗ tới khi đổi tab.
 * - Nhóm Hôm nay / Hôm qua / Cũ hơn theo giờ VN (`bayGio` cố định mốc cho demo/test; bỏ trống = lúc render).
 * - Bấm dòng → `onDoc(id, true)`, đóng hộp, `onMo(t)` (mở bản ghi). Nút đánh dấu: "Đánh dấu đã đọc: …" / "… chưa đọc: …".
 * - Thông báo mới đến (id chưa từng thấy, chưa đọc): số trên chuông tăng + câu đọc qua `role="status"` (cả khi hộp đóng).
 */
export function NotificationCenter({
  thongBao,
  onDoc,
  onDocHet,
  onCauHinh,
  onMo,
  bayGio,
  size = 'icon-sm',
  align = 'end',
}: {
  thongBao: ThongBaoMuc[]
  onDoc(id: string, doc: boolean): void
  onDocHet(ids: string[]): void
  onCauHinh(): void
  onMo?(t: ThongBaoMuc): void
  bayGio?: string
  /** Cỡ nút chuông (Button `icon-sm` trên thanh trên, `icon` khi cần to hơn). */
  size?: 'icon-sm' | 'icon'
  align?: 'start' | 'center' | 'end'
}) {
  const [mo, setMo] = useState(false)
  const [tab, setTab] = useState<'tat' | 'chua'>('tat')
  const [giu, setGiu] = useState<string[]>([])
  const [moi, setMoi] = useState('')
  // Mốc "bây giờ" chụp lúc MỞ hộp (danh sách chỉ hiện khi mở) — không gọi Date.now() trong render (hàm không thuần).
  const [luc, setLuc] = useState(() => Date.now())
  const da = useRef<Set<string> | null>(null)
  const chuong = useRef<HTMLButtonElement>(null)
  const hop = useRef<HTMLDivElement>(null)
  const dich = useRef<HTMLElement | null>(null)
  const id = useId()

  const chua = thongBao.filter((t) => !t.doc)
  const bay = bayGio ? Date.parse(bayGio) : luc
  const hien = tab === 'tat' ? thongBao : thongBao.filter((t) => !t.doc || giu.includes(t.id))

  // Thông báo mới đến: id chưa từng thấy + chưa đọc → đọc câu của cái mới nhất. Lần nạp đầu chỉ ghi nhớ.
  useEffect(() => {
    const cu = da.current
    da.current = new Set(thongBao.map((t) => t.id))
    if (!cu) return
    const den = thongBao.filter((t) => !t.doc && !cu.has(t.id))
    if (den.length) setMoi(`Thông báo mới: ${chuTB(den[0])}`)
  }, [thongBao])

  const doiTab = (v: string) => {
    if (v === 'chua') setGiu(chua.map((t) => t.id))
    setTab(v as 'tat' | 'chua')
  }
  const focusTab = () => hop.current?.querySelector<HTMLElement>('[role="tab"][data-state="active"]')?.focus()
  const dong = (sau?: HTMLElement | null) => {
    dich.current = sau ?? null
    setMo(false)
  }
  const raCuoi = () => {
    const b = chuong.current
    const ds = [...document.querySelectorAll<HTMLElement>(TABBABLE)].filter(
      (e) => !hop.current?.contains(e) && (e.checkVisibility?.() ?? true),
    )
    dong((b && ds[ds.indexOf(b) + 1]) || b)
  }

  return (
    <CountNeo>
      <Popover
        modal={false}
        open={mo}
        onOpenChange={(m) => {
          if (m) {
            doiTab(tab)
            setLuc(Date.now())
          }
          setMo(m)
        }}
      >
        <PopoverTrigger asChild>
          <Button
            ref={chuong}
            variant="ghost"
            size={size}
            shape="rounded"
            aria-label={chua.length ? `Thông báo, ${chua.length} chưa đọc` : 'Thông báo'}
            aria-haspopup="dialog"
          >
            <Bell aria-hidden="true" />
            <Count so={chua.length} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          ref={hop}
          data-slot="notif"
          aria-label="Thông báo"
          align={align}
          className={cn(menuContent, notifBox)}
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            focusTab()
          }}
          onCloseAutoFocus={(e) => {
            if (!dich.current) return
            e.preventDefault()
            dich.current.focus()
            dich.current = null
          }}
        >
          <div className={notifKhung}>
            <span tabIndex={0} data-slot="notif-chot" onFocus={() => dong(chuong.current)} />
            <div className={notifHead}>
              <h2 id={`${id}-t`} className={notifTitle}>
                Thông báo
              </h2>
              <Button
                variant="ghost"
                size="sm"
                disabled={!chua.length}
                onClick={() => {
                  onDocHet(chua.map((t) => t.id))
                  focusTab() // nút sắp tắt → focus sang tab đang chọn, không rơi về body
                }}
              >
                <Checks aria-hidden="true" />
                Đọc hết
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Cấu hình thông báo"
                onClick={() => {
                  dong(chuong.current)
                  onCauHinh()
                }}
              >
                <GearSix aria-hidden="true" />
              </Button>
            </div>
            <Tabs value={tab} onValueChange={doiTab} className="contents">
              <div className={notifTabs}>
                <TabsList variant="pill" aria-label="Lọc thông báo">
                  <TabsTrigger value="tat">Tất cả</TabsTrigger>
                  <TabsTrigger value="chua">
                    Chưa đọc
                    {chua.length > 0 && (
                      <>
                        {' '}
                        <TabsCount>{chua.length}</TabsCount>
                      </>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>
              {(['tat', 'chua'] as const).map((v) => (
                <TabsContent
                  key={v}
                  value={v}
                  data-slot="notif-list"
                  tabIndex={hien.length ? undefined : 0}
                  className={cn(tabsContent, notifList)}
                >
                  {hien.length === 0 ? (
                    <EmptyState
                      size="sm"
                      icon={<Checks />}
                      tieuDe={tab === 'chua' ? 'Đã đọc hết' : 'Chưa có thông báo'}
                      moTa="Thông báo mới hiện ở đây, và gửi cả lên Discord nếu bạn bật trong Cấu hình."
                      className={notifRong}
                    />
                  ) : (
                    <DanhSach ds={hien} bay={bay} id={id} onDoc={onDoc} onBam={(t) => {
                      onDoc(t.id, true)
                      dong()
                      onMo?.(t)
                    }} />
                  )}
                </TabsContent>
              ))}
            </Tabs>
            <span tabIndex={0} data-slot="notif-chot" onFocus={raCuoi} />
          </div>
        </PopoverContent>
      </Popover>
      {/* Người dùng trình đọc màn hình nghe được thông báo mới đến khi hộp đang đóng. */}
      <span role="status" className="sr-only">
        {moi}
      </span>
    </CountNeo>
  )
}

function DanhSach({
  ds,
  bay,
  id,
  onDoc,
  onBam,
}: {
  ds: ThongBaoMuc[]
  bay: number
  id: string
  onDoc(id: string, doc: boolean): void
  onBam(t: ThongBaoMuc): void
}) {
  const tg = new Map(ds.map((t) => [t.id, thoiGian(t.luc, bay)]))
  return NHOM.map((n) => {
    const nhom = ds.filter((t) => tg.get(t.id)?.nhom === n.id)
    if (!nhom.length) return null
    return (
      <div key={n.id} role="group" aria-labelledby={`${id}-n-${n.id}`} className="border-none border-current">
        <h3 id={`${id}-n-${n.id}`} className={cn(menuLabel, notifNhom)}>
          {n.ten}
        </h3>
        <ul className={notifUl}>
          {nhom.map((t) => {
            const I = ICON[t.loai]
            const g = tg.get(t.id)!
            return (
              <li key={t.id} data-slot="notif-item" data-unread={!t.doc || undefined} className={notifItem}>
                <button type="button" data-slot="notif-main" className={notifMain} onClick={() => onBam(t)}>
                  <span data-slot="notif-icon" data-loai={t.loai} aria-hidden="true" className={notifIcon}>
                    <I />
                  </span>
                  <span className={notifBody}>
                    <span data-slot="notif-text" className={notifText}>
                      {!t.doc && <span className="sr-only">Chưa đọc. </span>}
                      {t.ai && <b>{t.ai} </b>}
                      {t.noi}
                      {t.dt && (
                        <>
                          {' '}
                          <b>{t.dt}</b>
                        </>
                      )}
                    </span>
                    {t.trich && <span data-slot="notif-quote" className={notifQuote}>“{t.trich}”</span>}
                    <span data-slot="notif-meta" className={notifMeta}>
                      {t.khu} · <time dateTime={t.luc} title={g.du}>{g.chu}</time>
                      {t.quaDiscord && ' · qua Discord'}
                    </span>
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  data-slot="notif-mark"
                  aria-label={`${t.doc ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}: ${chuTB(t)}`}
                  title={t.doc ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                  className={notifMark}
                  onClick={() => onDoc(t.id, !t.doc)}
                >
                  {t.doc ? <Circle aria-hidden="true" /> : <span aria-hidden="true" className={notifDot} />}
                </Button>
              </li>
            )
          })}
        </ul>
      </div>
    )
  })
}
