import type { ReactNode } from 'react'
import { khongVien } from '@/components/ui/feedback-styles'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Demo dùng chung cho KhoiStatCard (/ds/tron, so khớp) và KhoiStatCardHang (/ds) — số liệu demo. `data-so` = khoá so khớp. */

const DANG_MO = (
  <StatCard
    data-so="s-1"
    nhan="Ticket đang mở"
    giaTri={19}
    bienDong={{ so: 3, soVoi: 'so với hôm qua', tot: 'giam' }}
    chan="Xem 19 ticket"
    href="#stat-card"
  />
)
const QUA_HAN = (
  <StatCard
    data-so="s-2"
    nhan="Quá hạn"
    giaTri={2}
    bienDong={{ so: -1, soVoi: 'so với hôm qua', tot: 'giam' }}
    chan="Xem ticket quá hạn"
    href="#stat-card"
  />
)
const PHAN_HOI = (
  <StatCard
    data-so="s-3"
    nhan="Phản hồi đầu trung bình"
    giaTri={42}
    donVi="phút"
    bienDong={{ so: -8, donVi: 'phút', soVoi: 'so với tuần trước', tot: 'giam' }}
  />
)
const HOI_LAI = (
  <StatCard
    data-so="s-4"
    nhan="Khách phải hỏi lại (tuần này)"
    giaTri={7}
    donVi="lần"
    bienDong={{ so: 2, soVoi: 'so với tuần trước', tot: 'giam' }}
  />
)
const GIU_HEN = (
  <StatCard data-so="s-5" nhan="Giữ lời hẹn" giaTri={92} donVi="%" bienDong={{ so: 0, soVoi: 'so với tuần trước', tot: 'tang' }} />
)
const CHUA_CO = (
  <StatCard data-so="s-6" nhan="Báo cáo sau dịch vụ đã gửi" giaTri={null} trong="Chưa có dữ liệu — tính năng Đợt 2" />
)
const DANG_TAI = <StatCard data-so="s-7" nhan="Doanh thu tháng" giaTri={null} dangTai />

/** #stat-card — tái tạo ds/nguon/components/StatCard/preview.html: cột tối đa 1100, lưới ô tối thiểu 200, bảy thẻ. */
export function KhoiStatCard() {
  return (
    <section id="stat-card" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#stat-card">StatCard</a>
      </h2>
      <div className={`${khongVien} max-w-[1100px]`}>
        <StatGrid>
          {DANG_MO}
          {QUA_HAN}
          {PHAN_HOI}
          {HOI_LAI}
          {GIU_HEN}
          {CHUA_CO}
          {DANG_TAI}
        </StatGrid>
      </div>
    </section>
  )
}

/** #stat-card dạng hàng cho /ds. */
export function KhoiStatCardHang() {
  const hai = (a: ReactNode, b: ReactNode) => (
    <StatGrid className="max-w-[560px]">
      {a}
      {b}
    </StatGrid>
  )
  return (
    <KhoiHang neo="stat-card">
      <BienThe ten="Có liên kết" moTa="Bấm cả thẻ mở danh sách đã lọc. Rê chuột: viền đậm, mũi tên chân thẻ nhích sang phải.">
        {hai(DANG_MO, QUA_HAN)}
      </BienThe>
      <BienThe ten="Màu theo nghĩa" moTa="Quá hạn giảm là tốt (xanh), khách hỏi lại tăng là xấu (đỏ) — theo nghĩa, không theo chiều mũi tên.">
        {hai(PHAN_HOI, HOI_LAI)}
      </BienThe>
      <BienThe ten="Không đổi · chưa có dữ liệu" moTa="Không đổi: màu xám. Chưa có số: ghi lý do, không hiện 0.">
        {hai(GIU_HEN, CHUA_CO)}
      </BienThe>
      <BienThe ten="Đang tải" moTa="Giữ khung thẻ, khối chờ cùng hình. Trình đọc màn hình nghe Đang tải.">
        {hai(DANG_TAI, <StatCard key="dt" nhan="Doanh thu năm" giaTri={1250000000} donVi="₫" bienDong={{ so: 12, donVi: '%', soVoi: 'so với năm trước', tot: 'tang' }} />)}
      </BienThe>
    </KhoiHang>
  )
}
