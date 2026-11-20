'use client'

import { useState } from 'react'
import { CloudSlash, Flask } from '@phosphor-icons/react'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { khongVien } from '@/components/ui/feedback-styles'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Demo dùng chung cho KhoiBanner (/ds/tron, so khớp) và KhoiBannerHang (/ds) — dữ liệu demo. `data-so` = khoá so khớp. */

const MAT_MANG = (
  <Banner data-so="b-1" color="warning" icon={<CloudSlash />} hanhDong={<Button variant="ghost" size="sm">Thử lại</Button>}>
    <b>Mất kết nối.</b> Thay đổi đang chờ, sẽ tự lưu khi có mạng lại.
  </Banner>
)

const DU_LIEU_THU = (
  <Banner data-so="b-2" icon={<Flask />}>
    Đang xem <b>dữ liệu thử (local)</b> — không phải dữ liệu thật.
  </Banner>
)

const HET_PHIEN = (
  <Banner data-so="b-4" color="danger" hanhDong={<Button variant="outline" size="sm">Gia hạn</Button>}>
    Phiên đăng nhập hết hạn sau <b>2 phút</b>. Lưu việc đang làm.
  </Banner>
)

/** Bản mới: ✕ ẩn dải (focus sang phần tử kế tiếp). `hienLai` → nút "Hiện lại" cho người xem /ds thử lần nữa. */
function BanMoi({ hienLai = false }: { hienLai?: boolean }) {
  const [hien, setHien] = useState(true)
  if (!hien)
    return hienLai ? (
      <Button variant="link" size="sm" onClick={() => setHien(true)}>
        Hiện lại thông báo
      </Button>
    ) : null
  return (
    <Banner
      data-so="b-3"
      hanhDong={
        <Button variant="outline" size="sm">
          Tải lại
        </Button>
      }
      onDong={() => setHien(false)}
    >
      Có bản cập nhật mới của GWT App.
    </Banner>
  )
}

/** #banner — tái tạo ds/nguon/components/Banner/preview.html: cột tối đa 1000, bốn dải cách 12. */
export function KhoiBanner() {
  return (
    <section id="banner" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#banner">Banner</a>
      </h2>
      <div className={`${khongVien} max-w-[1000px]`}>
        <div className={`${khongVien} flex flex-col gap-3`}>
          {MAT_MANG}
          {DU_LIEU_THU}
          <BanMoi />
          {HET_PHIEN}
        </div>
      </div>
    </section>
  )
}

/** #banner dạng hàng cho /ds. */
export function KhoiBannerHang() {
  return (
    <KhoiHang neo="banner">
      <BienThe ten="Thông tin" moTa="Mặc định. Trạng thái chung của trang, vd đang xem dữ liệu thử.">
        {DU_LIEU_THU}
      </BienThe>
      <BienThe ten="Đóng được" moTa="Một nút hành động và nút ✕ ẩn dải. Đóng xong, con trỏ bàn phím sang phần tử kế tiếp.">
        <BanMoi hienLai />
      </BienThe>
      <BienThe ten="Cảnh báo" moTa="Mất kết nối, việc đang chờ lưu. Đổi biểu tượng theo tình huống.">
        {MAT_MANG}
      </BienThe>
      <BienThe ten="Lỗi" moTa="Đỏ, trình đọc màn hình đọc ngay (khẩn). Vd phiên đăng nhập sắp hết hạn.">
        {HET_PHIEN}
      </BienThe>
    </KhoiHang>
  )
}
