import { ArrowCounterClockwise, CalendarBlank, ChatCircleText, Plus, WarningCircle } from '@phosphor-icons/react/ssr'
import { Timeline, type MucTimeline } from '@/components/ui/timeline'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Demo dùng chung cho `KhoiTimeline` (/ds/tron) và `KhoiTimelineHang` (/ds) — dữ liệu demo, ngày mẫu cố định 18/11/2026. */

const HOM_NAY = '2026-11-18'

const MUC: MucTimeline[] = [
  { id: 's1', ai: 'Hiền', loai: 'tạo ticket từ Zalo', luc: '2026-11-15T09:12:00+07:00', icon: <Plus aria-hidden="true" /> },
  {
    id: 's2',
    ai: 'Khách',
    loai: 'báo qua Zalo',
    luc: '2026-11-15T09:12:00+07:00',
    icon: <ChatCircleText aria-hidden="true" />,
    noiDung: 'Rò nước dưới đáy máy, đọng vũng nhỏ. Máy vẫn chạy.',
    tep: [{ ten: 'day-may-demo-1.jpg' }, { ten: 'day-may-demo-2.jpg' }],
  },
  {
    id: 's3',
    ai: 'Hiền',
    loai: 'đặt ưu tiên Gấp',
    luc: '2026-11-15T09:40:00+07:00',
    icon: <WarningCircle aria-hidden="true" />,
    color: 'danger',
  },
  { id: 's4', ai: 'Hiền', loai: 'ghi chú', luc: '2026-11-16T14:05:00+07:00', noiDung: 'Gọi hướng dẫn khách tắt van cấp, chụp đáy máy.' },
  { id: 's5', ai: 'Hiền', loai: 'đặt hạn 18/11 10:00', luc: '2026-11-17T08:30:00+07:00', icon: <CalendarBlank aria-hidden="true" /> },
  { id: 's6', ai: 'Hiền', loai: 'ghi chú', luc: '2026-11-17T16:20:00+07:00', noiDung: 'Báo KT trưởng, xếp lịch trong ngày.' },
  {
    id: 's7',
    ai: 'Khách',
    loai: 'hỏi lại qua Zalo (lần 1)',
    luc: '2026-11-18T08:05:00+07:00',
    icon: <ArrowCounterClockwise aria-hidden="true" />,
    color: 'danger',
    noiDung: 'Bao giờ KT qua vậy em? Nước vẫn rò.',
  },
]

/**
 * #timeline — tái tạo ds/nguon/components/Timeline/preview.html (rộng tối đa 640): 4 mục mới nhất, 3 mục cũ gập sau
 * "Hiện 3 hoạt động cũ hơn". Timeline là client component; khối này server, chỉ truyền dữ liệu (không hàm).
 */
export function KhoiTimeline() {
  return (
    <section id="timeline" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#timeline">Timeline</a>
      </h2>
      <div className="max-w-[640px] border-none border-current">
        <Timeline muc={MUC} hien={4} homNay={HOM_NAY} />
      </div>
    </section>
  )
}

/** #timeline dạng hàng cho /ds. */
export function KhoiTimelineHang() {
  return (
    <KhoiHang neo="timeline">
      <BienThe
        ten="Gập phần cũ"
        moTa="Chỉ hiện các hoạt động mới nhất. Bấm nút để mở phần cũ hơn, con trỏ bàn phím nhảy vào hoạt động cũ nhất vừa mở."
      >
        <div className="max-w-[640px] border-none border-current">
          <Timeline muc={MUC} hien={4} homNay={HOM_NAY} />
        </div>
      </BienThe>
      <BienThe
        ten="Mở hết"
        moTa="Nhóm theo ngày giờ Việt Nam. Ghi chú có khung, sự kiện hệ thống một dòng, tệp đính kèm dạng thẻ. Rê lên giờ để xem ngày giờ đủ."
      >
        <div className="max-w-[640px] border-none border-current">
          <Timeline muc={MUC} homNay={HOM_NAY} aria-label="Hoạt động (mở hết)" />
        </div>
      </BienThe>
    </KhoiHang>
  )
}
