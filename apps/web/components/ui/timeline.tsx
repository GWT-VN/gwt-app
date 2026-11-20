'use client'

import { useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { Paperclip } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, chuCaiDau } from './avatar'
import { Button } from './button'
import {
  chip,
  timelineBody,
  timelineDay,
  timelineFiles,
  timelineHead,
  timelineItem,
  timelineList,
  timelineMark,
  timelineMarkAvatar,
  timelineMore,
} from './detail-styles'

export type TepTimeline = { ten: string; href?: string }

/** Một hoạt động. `luc` = ISO có múi giờ (timestamptz), hiện theo giờ VN. Có `noiDung` → bình luận có khung. */
export type MucTimeline = {
  id: string
  ai: string
  /** Việc đã làm, sau tên người: "ghi chú", "đặt hạn 18/11 10:00", "đổi trạng thái …". */
  loai: ReactNode
  luc: string
  /** Icon sự kiện (Phosphor, đặt sẵn `aria-hidden`); không có → Avatar chữ cái đầu của `ai`. */
  icon?: ReactNode
  color?: 'danger' | 'success'
  noiDung?: ReactNode
  tep?: TepTimeline[]
}

// ponytail: giờ VN cố định UTC+7 (không đổi giờ mùa hè) → cộng 7 giờ rồi đọc phần UTC; cần múi khác thì đổi sang Intl.
const VN = 7 * 3600e3
/** ISO giờ VN, hoặc '' khi `luc` không đọc được (dữ liệu hỏng không được làm sập cả trang). */
const tachVN = (luc: string) => {
  const t = Date.parse(luc)
  return Number.isNaN(t) ? '' : new Date(t + VN).toISOString()
}
const homNayVN = () => new Date(Date.now() + VN).toISOString().slice(0, 10)
const THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const thuNgay = (iso: string) => `${THU[new Date(`${iso}T00:00:00Z`).getUTCDay()]}, ${iso.slice(8, 10)}/${iso.slice(5, 7)}`
const homQua = (iso: string) => new Date(Date.parse(`${iso}T00:00:00Z`) - 864e5).toISOString().slice(0, 10)
const tenNgay = (iso: string, homNay: string) =>
  !iso ? 'Không rõ ngày' : iso === homNay ? 'Hôm nay' : iso === homQua(homNay) ? 'Hôm qua' : thuNgay(iso)

/** Nhãn ngày (`li`), thụt thẳng chữ nội dung. */
export function TimelineDay({ children }: { children: ReactNode }) {
  return (
    <li data-slot="timeline-day" className={timelineDay}>
      {children}
    </li>
  )
}

/**
 * Một mục: mốc (icon hoặc Avatar) · dòng đầu "<b>ai</b> loai <time>" · khung bình luận (`children`) · chip tệp.
 * Giờ là `<time datetime>`, rê lên thấy ngày giờ đủ (`title`). `tabIndex −1`: nhận focus bằng code sau "Xem thêm".
 */
export function TimelineItem({
  ai,
  loai,
  luc,
  icon,
  color,
  tep,
  children,
}: Omit<MucTimeline, 'id' | 'noiDung'> & { children?: ReactNode }) {
  const vn = tachVN(luc)
  const ngay = vn.slice(0, 10)
  const gio = vn.slice(11, 16)
  return (
    <li data-slot="timeline-item" tabIndex={-1} className={timelineItem}>
      {icon ? (
        <span className={timelineMark} data-color={color} aria-hidden="true">
          {icon}
        </span>
      ) : (
        <Avatar aria-hidden="true" className={cn(timelineMark, timelineMarkAvatar)}>
          <AvatarFallback>{chuCaiDau(ai)}</AvatarFallback>
        </Avatar>
      )}
      <div className={timelineHead}>
        <b>{ai}</b>
        <span>{loai}</span>
        {vn ? (
          <time dateTime={luc} title={`${thuNgay(ngay)}/${ngay.slice(0, 4)} · ${gio}`}>
            {gio}
          </time>
        ) : (
          <time title={luc}>không rõ giờ</time>
        )}
      </div>
      {children && (
        <div data-slot="timeline-body" className={timelineBody}>
          {children}
        </div>
      )}
      {tep && tep.length > 0 && (
        <div className={timelineFiles}>
          {tep.map((t, i) => {
            const noi = (
              <>
                <Paperclip aria-hidden="true" />
                <span>{t.ten}</span>
              </>
            )
            return t.href ? (
              <a key={`${i}-${t.ten}`} href={t.href} className={chip}>
                {noi}
              </a>
            ) : (
              <span key={`${i}-${t.ten}`} className={chip}>
                {noi}
              </span>
            )
          })}
        </div>
      )}
    </li>
  )
}

/**
 * Timeline — dòng hoạt động của bản ghi, giá trị từ `.ui-timeline*` của ds/nguon/bundle.css (README Timeline).
 * - `muc` xếp cũ → mới (mới nhất ở dưới, sát Composer); tự nhóm theo NGÀY GIỜ VN: "Hôm nay" / "Hôm qua" / "Thứ Hai, 16/11".
 *   `homNay` (YYYY-MM-DD giờ VN) cố định ngày cho demo/test; bỏ trống = hôm nay theo giờ VN.
 * - `hien` = số mục mới nhất hiện sẵn; phần cũ hơn gập sau nút "Hiện N hoạt động cũ hơn". Bấm → hiện hết, nút biến
 *   mất, focus vào mục cũ nhất vừa hiện (không rơi về body). Nhãn ngày tính lại trên phần đang hiện.
 * - `<ol aria-label="Hoạt động">`.
 */
export function Timeline({
  muc,
  hien,
  homNay,
  'aria-label': nhan = 'Hoạt động',
}: {
  muc: MucTimeline[]
  hien?: number
  homNay?: string
  'aria-label'?: string
}) {
  const [moHet, setMoHet] = useState(false)
  const ol = useRef<HTMLOListElement>(null)
  const an = moHet || hien === undefined ? 0 : Math.max(0, muc.length - hien)
  const hn = homNay ?? homNayVN()
  const xem = muc.slice(an)
  const ngay = xem.map((m) => tachVN(m.luc).slice(0, 10))
  return (
    <ol ref={ol} data-slot="timeline" aria-label={nhan} className={timelineList}>
      {an > 0 && (
        <li className={timelineMore}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              flushSync(() => setMoHet(true))
              ol.current?.querySelector<HTMLElement>('[data-slot="timeline-item"]')?.focus()
            }}
          >
            Hiện {an} hoạt động cũ hơn
          </Button>
        </li>
      )}
      {xem.flatMap((m, i) => [
        ngay[i] !== ngay[i - 1] && <TimelineDay key={`ngay-${ngay[i]}`}>{tenNgay(ngay[i], hn)}</TimelineDay>,
        <TimelineItem key={m.id} ai={m.ai} loai={m.loai} luc={m.luc} icon={m.icon} color={m.color} tep={m.tep}>
          {m.noiDung}
        </TimelineItem>,
      ])}
    </ol>
  )
}
