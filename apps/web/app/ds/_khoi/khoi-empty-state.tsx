'use client'

import { useState, type ReactNode } from 'react'
import { ArrowClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { khongVien } from '@/components/ui/feedback-styles'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Demo dùng chung cho KhoiEmptyState (/ds/tron, so khớp) và KhoiEmptyStateHang (/ds) — dữ liệu demo. `data-so` = khoá. */

const CHUA_CO = (
  <EmptyState data-so="e-1" size="sm" kieu="that" tieuDe="Chưa có phiếu chi nào" moTa="Phiếu chi tháng này sẽ hiện ở đây.">
    <Button size="sm">Tạo phiếu chi</Button>
    <Button variant="outline" size="sm">
      Nhập từ Excel
    </Button>
  </EmptyState>
)

const KHONG_KHOP = (
  <EmptyState
    data-so="e-2"
    size="sm"
    kieu="loc"
    tieuDe="Không có ticket nào khớp bộ lọc"
    moTa="Thử bỏ bớt điều kiện hoặc từ khoá “sen vang” — tìm không cần gõ dấu."
  >
    <Button variant="outline" size="sm">
      Xoá lọc
    </Button>
  </EmptyState>
)

/** Lỗi tải: "Thử lại" chạy 1,2 giây (nút giữ bề rộng, vòng xoay) — demo, không gọi máy chủ. */
function LoiTai() {
  const [dang, setDang] = useState(false)
  return (
    <EmptyState
      data-so="e-3"
      size="sm"
      kieu="loi"
      tieuDe="Không tải được danh sách"
      moTa="Mạng chập chờn hoặc máy chủ đang bận. Dữ liệu không bị mất."
    >
      <Button
        variant="outline"
        size="sm"
        loading={dang}
        onClick={() => {
          setDang(true)
          setTimeout(() => setDang(false), 1200)
        }}
      >
        <ArrowClockwise />
        Thử lại
      </Button>
    </EmptyState>
  )
}

const KHONG_QUYEN = (
  <EmptyState
    data-so="e-4"
    size="sm"
    kieu="quyen"
    tieuDe="Bạn chưa có quyền xem Kế toán"
    moTa="Nhờ quản trị cấp vai “Kế toán” rồi tải lại trang."
  />
)

/** #empty-state — tái tạo ds/nguon/components/EmptyState/preview.html: lưới ô tối thiểu 300, cách 16, bốn lý do trống. */
export function KhoiEmptyState() {
  return (
    <section id="empty-state" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#empty-state">EmptyState</a>
      </h2>
      <div className={`${khongVien} max-w-[1000px]`}>
        <div className={`${khongVien} grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4`}>
          {CHUA_CO}
          {KHONG_KHOP}
          <LoiTai />
          {KHONG_QUYEN}
        </div>
      </div>
    </section>
  )
}

/** #empty-state dạng hàng cho /ds. */
export function KhoiEmptyStateHang() {
  const o = (x: ReactNode) => <div className={`${khongVien} max-w-[480px]`}>{x}</div>
  return (
    <KhoiHang neo="empty-state">
      <BienThe ten="Chưa có dữ liệu" moTa="Nói thứ gì sẽ hiện ở đây, kèm nút tạo nếu người xem có quyền.">
        {o(CHUA_CO)}
      </BienThe>
      <BienThe ten="Không khớp lọc" moTa="Nêu điều kiện đang lọc, kèm nút Xoá lọc.">
        {o(KHONG_KHOP)}
      </BienThe>
      <BienThe ten="Lỗi tải" moTa="Biểu tượng đỏ. Nói không tải được, kèm Thử lại. Không đổ lỗi người dùng.">
        {o(<LoiTai />)}
      </BienThe>
      <BienThe ten="Không có quyền" moTa="Nói cần quyền gì và hỏi ai. Không có nút.">
        {o(KHONG_QUYEN)}
      </BienThe>
      <BienThe ten="Cỡ thường" moTa="Đệm rộng hơn, dùng khi vùng trống chiếm cả trang hay cả bảng.">
        <EmptyState tieuDe="Chưa có ticket nào" moTa="Ticket khách gửi qua Zalo, điện thoại sẽ hiện ở đây.">
          <Button size="sm">Tạo ticket</Button>
        </EmptyState>
      </BienThe>
    </KhoiHang>
  )
}
