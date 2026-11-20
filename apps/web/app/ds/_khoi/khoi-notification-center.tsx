'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { NotificationCenter, type ThongBaoMuc } from '@/components/ui/notification-center'
import { thongBao as toast } from '@/components/ui/toast'
import { BienThe, KhoiHang } from '../_khung/tam'

/*
 * Demo dùng chung cho `KhoiNotificationCenter` (/ds/tron, cổng so khớp) và `KhoiNotificationCenterHang` (/ds) — dữ liệu demo,
 * mốc giờ cố định 18/11/2026 15:47 giờ VN, tên công ty giả. Khối client: giữ trạng thái đã đọc. `data-so` = khoá so khớp.
 */

const BAY_GIO = '2026-11-18T15:47:00+07:00'

const DS: ThongBaoMuc[] = [
  { id: 'tb1', loai: 'giao', ai: 'Minh', noi: 'giao việc cho bạn:', dt: 'Gọi lại Công ty Demo An Phát chốt lịch thay lõi', khu: 'Việc', luc: '2026-11-18T15:42:00+07:00', doc: false, quaDiscord: true },
  { id: 'tb2', loai: 'nhac', ai: 'Lan', noi: 'nhắc bạn trong', dt: 'TK-2611-042', trich: 'Khách gửi ảnh đáy máy rồi, chị xem giúp em có phải rò ở van không', khu: 'CSKH', luc: '2026-11-18T15:29:00+07:00', doc: false },
  { id: 'tb3', loai: 'gap', noi: 'Ticket Gấp chưa ai nhận:', dt: 'TK-2611-045 · Công ty Demo An Phát', khu: 'CSKH', luc: '2026-11-18T14:47:00+07:00', doc: false },
  { id: 'tb4', loai: 'han', noi: 'Việc tiếp theo tới hạn 17:00 hôm nay:', dt: 'Chờ CEO duyệt miễn phí thay bơm (TK-2611-039)', khu: 'CSKH', luc: '2026-11-18T13:00:00+07:00', doc: true },
  { id: 'tb5', loai: 'bot', ai: 'Bắp', noi: 'tạo ticket từ tin Discord, đang chờ người nhận:', dt: 'TK-2611-031 · Khách Demo B', khu: 'CSKH', luc: '2026-11-17T16:20:00+07:00', doc: true, quaDiscord: true },
  { id: 'tb6', loai: 'lau', noi: 'Ticket mở quá 7 ngày:', dt: 'TK-2611-028 · Khách Demo C (12 ngày, chờ hãng)', khu: 'CSKH', luc: '2026-11-17T08:00:00+07:00', doc: true },
  { id: 'tb7', loai: 'xong', ai: 'Hà', noi: 'đã xong việc bạn giao:', dt: 'Gửi hướng dẫn xả nước cho Khách Demo D', khu: 'Việc', luc: '2026-11-15T10:12:00+07:00', doc: true },
]

const MOI: Omit<ThongBaoMuc, 'id'> = {
  loai: 'nhac',
  ai: 'Minh',
  noi: 'nhắc bạn trong',
  dt: 'TK-2611-039',
  trich: 'CEO duyệt miễn phí rồi, chị báo khách giúp em',
  khu: 'CSKH',
  luc: BAY_GIO,
  doc: false,
}

/** Chuông demo: tự giữ danh sách; "Cấu hình" / mở dòng chỉ báo bằng toast (trang demo không có bản ghi thật). */
function Demo({ dau = DS, moiDen = false }: { dau?: ThongBaoMuc[]; moiDen?: boolean }) {
  const [ds, setDs] = useState(dau)
  return (
    <div className="flex flex-wrap items-center gap-3 border-none border-current">
      <NotificationCenter
        thongBao={ds}
        bayGio={BAY_GIO}
        align="start"
        onDoc={(id, doc) => setDs((d) => d.map((t) => (t.id === id ? { ...t, doc } : t)))}
        onDocHet={(ids) => setDs((d) => d.map((t) => (ids.includes(t.id) ? { ...t, doc: true } : t)))}
        onCauHinh={() => toast.xong('Mở màn Cấu hình thông báo (demo)')}
        onMo={(t) => toast.xong(`Mở bản ghi: ${t.dt ?? t.noi} (demo)`)}
      />
      {moiDen && (
        <Button variant="outline" size="sm" onClick={() => setDs((d) => [{ ...MOI, id: `moi-${d.length}` }, ...d])}>
          Giả lập thông báo mới
        </Button>
      )}
    </div>
  )
}

/** #notification-center — ds/nguon/components/NotificationCenter/preview.html: bấm chuông mở hộp (preview vẽ hộp tĩnh). */
export function KhoiNotificationCenter() {
  return (
    <section id="notification-center" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#notification-center">NotificationCenter</a>
      </h2>
      <Demo />
    </section>
  )
}

/** #notification-center dạng hàng cho /ds. */
export function KhoiNotificationCenterHang() {
  return (
    <KhoiHang neo="notification-center">
      <BienThe
        ten="Chuông có số"
        moTa="Bấm chuông mở hộp không chặn trang. Dòng chưa đọc chữ đậm và có chấm xanh; bấm dòng là đã đọc và mở bản ghi. Ở tab Chưa đọc, dòng vừa đọc ở yên chỗ tới khi đổi tab. Esc hoặc Tab ra ngoài thì hộp đóng, con trỏ về chuông."
      >
        <Demo />
      </BienThe>
      <BienThe ten="Thông báo mới đến" moTa="Số trên chuông tăng và trình đọc màn hình đọc câu thông báo mới, kể cả khi hộp đang đóng.">
        <Demo moiDen />
      </BienThe>
      <BienThe ten="Không có thông báo" moTa="Hộp trống nói rõ thông báo sẽ hiện ở đây.">
        <Demo dau={[]} />
      </BienThe>
    </KhoiHang>
  )
}
