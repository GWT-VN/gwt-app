'use client'

import { useState } from 'react'
import {
  BellSimple,
  BookOpen,
  CalendarBlank,
  CalendarCheck,
  ChartBar,
  Cpu,
  Headset,
  ListChecks,
  MagnifyingGlass,
  Package,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Ticket,
  User,
  Users,
  Wrench,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { KhungApp, type Khu, type MucMenu } from '@/components/ui/sidebar'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Demo dùng chung cho `KhoiSidebar` (/ds/tron, cổng so khớp) và `KhoiSidebarHang` (/ds) — dữ liệu demo, không PII.
 * 'use client': khung có trạng thái (khu đang chọn) và icon Phosphor là component (không đi qua ranh giới server). */

const KHU: Khu[] = [
  { id: 'viec', ten: 'Việc', icon: ListChecks, mau: '#0e8c9a', gap: true },
  { id: 'cskh', ten: 'CSKH', icon: Headset, mau: '#b5642a', gap: true },
  { id: 'sales', ten: 'Sales', icon: ShoppingCart, mau: '#2f7d8a' },
  { id: 'kho', ten: 'Kho', icon: Package, mau: '#5560c9', gap: true },
  { id: 'wiki', ten: 'Wiki', icon: BookOpen, mau: '#8a52b8' },
  { id: 'nhan-su', ten: 'Nhân sự', icon: Users, mau: '#8a52b8', sapCo: true },
  { id: 'ke-toan', ten: 'Kế toán', icon: Receipt, mau: '#8a52b8', sapCo: true },
]

const MENU: Record<string, MucMenu[]> = {
  viec: [
    { id: 'hom-nay', ten: 'Việc hôm nay', href: '#sidebar', icon: CalendarCheck, dem: 4 },
    { id: 'cua-toi', ten: 'Việc của tôi', href: '#sidebar', icon: ListChecks },
  ],
  cskh: [
    { id: 'hom-nay', ten: 'Việc hôm nay', href: '#sidebar', icon: CalendarCheck, dem: 11 },
    { id: 'ticket', ten: 'Ticket', href: '#sidebar', icon: Ticket, dangO: true },
    { id: 'khach', ten: 'Khách hàng', href: '#sidebar', icon: Users },
    { id: 'may', ten: 'Máy & bảo hành', href: '#sidebar', icon: ShieldCheck },
    { id: 'bao-tri', ten: 'Bảo trì & thay lõi', href: '#sidebar', icon: CalendarBlank },
    { id: 'ky-thuat', ten: 'Kỹ thuật', href: '#sidebar', icon: Wrench },
    { id: 'bao-cao', ten: 'Báo cáo lỗi', href: '#sidebar', icon: ChartBar },
    { id: 'danh-muc', ten: 'Danh mục lỗi', href: '#sidebar', icon: BookOpen },
  ],
  sales: [
    { id: 'don', ten: 'Đơn hàng', href: '#sidebar', icon: Receipt, dem: 7 },
    { id: 'khach', ten: 'Khách hàng', href: '#sidebar', icon: Users },
  ],
  kho: [{ id: 'ton', ten: 'Tồn kho', href: '#sidebar', icon: Package, dem: 2 }],
  wiki: [{ id: 'bai', ten: 'Bài viết', href: '#sidebar', icon: BookOpen }],
}

const TAO: Record<string, { ten: string; href: string }> = {
  cskh: { ten: 'Tạo ticket', href: '#sidebar' },
  sales: { ten: 'Tạo đơn', href: '#sidebar' },
}

const LOC: MucMenu[] = [
  { id: 'qua-7', ten: 'Ticket mở quá 7 ngày', href: '#sidebar' },
  { id: 'thieu-serial', ten: 'Thiếu serial', href: '#sidebar' },
  { id: 'cua-toi', ten: 'Ticket của tôi', href: '#sidebar' },
]

const GAN_DAY: MucMenu[] = [
  { id: 'g1', ten: 'TK-2611-042 · Khách demo A', href: '#sidebar', icon: Ticket },
  { id: 'g2', ten: 'Công ty Demo An Phát', href: '#sidebar', icon: User },
  { id: 'g3', ten: 'TK-2611-043 · Khách demo B', href: '#sidebar', icon: Ticket },
  { id: 'g4', ten: 'Đơn 261118-E004 (demo)', href: '#sidebar', icon: Receipt },
  { id: 'g5', ten: 'Serial DEMO-0001', href: '#sidebar', icon: Cpu },
  { id: 'g6', ten: 'TK-2611-044 · Khách demo C', href: '#sidebar', icon: Ticket },
  { id: 'g7', ten: 'Công ty Demo Hoà Bình', href: '#sidebar', icon: User },
]

function CongCu() {
  return (
    <>
      <Button variant="ghost" size="icon-sm" shape="rounded" aria-label="Thông báo" data-so="nut-dau">
        <BellSimple aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon-sm" shape="rounded" aria-label="Tìm (Ctrl K)">
        <MagnifyingGlass aria-hidden="true" />
      </Button>
    </>
  )
}

function Demo({ day = true }: { day?: boolean }) {
  const [khu, setKhu] = useState('cskh')
  return (
    <KhungApp
      khu={KHU}
      khuDangChon={khu}
      onChonKhu={setKhu}
      menu={MENU[khu] ?? []}
      tao={day ? TAO[khu] : undefined}
      boLocDaLuu={day && khu === 'cskh' ? LOC : undefined}
      ganDay={day ? GAN_DAY : undefined}
      congCu={day ? <CongCu /> : undefined}
      quanTri={day ? '#sidebar' : undefined}
      nguoiDung={day ? { ten: 'Người dùng demo' } : undefined}
      bap={day ? <p className="m-0 p-4 text-muted-foreground">Thẻ chat Bắp — nội dung chưa chốt (demo).</p> : undefined}
      bapGoiY={day && khu === 'cskh' ? 2 : undefined}
    >
      <div className="p-6 text-muted-foreground">Vùng nội dung của màn (demo).</div>
    </KhungApp>
  )
}

/**
 * #sidebar — tái tạo ds/nguon/components/Sidebar/preview.html: khung F trong hộp cao 820 (số của preview), khu CSKH đang
 * chọn, Việc/CSKH/Kho có chấm gấp, "Ticket" đang ở, nút Bắp góc phải dưới. Hộp `relative` → khung, ngăn kéo đóng, nút
 * Bắp nằm gọn trong hộp; không chiếm cả trang. Menu "Tất cả khu" / tooltip mở bằng tương tác thật (preview vẽ tĩnh).
 */
export function KhoiSidebar() {
  return (
    <section id="sidebar" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#sidebar">Sidebar</a>
      </h2>
      <div className="relative h-[820px] overflow-hidden border-none border-current">
        <Demo />
      </div>
    </section>
  )
}

const hop = 'relative h-160 overflow-hidden rounded-xl border border-solid border-(--border)'

/** #sidebar dạng hàng cho /ds. */
export function KhoiSidebarHang() {
  return (
    <KhoiHang neo="sidebar">
      <BienThe
        ten="Khung đầy đủ"
        moTa='Bấm icon khu để đổi menu; Tab tới icon thấy tên khu bên phải. Ô lưới "Tất cả khu" mở danh sách khu (khu chưa mở ghi "sắp có"). Nút tròn góc phải dưới mở Bắp (Ctrl/⌘J). Cửa sổ hẹp dưới 768px: bấm nút ☰ trên thanh trên để mở menu dạng ngăn kéo.'
      >
        <div className={hop}>
          <Demo />
        </div>
      </BienThe>
      <BienThe ten="Tối giản" moTa="Chỉ thanh khu và menu của khu — không tạo nhanh, bộ lọc đã lưu, gần đây, Bắp.">
        <div className={hop}>
          <Demo day={false} />
        </div>
      </BienThe>
    </KhoiHang>
  )
}
