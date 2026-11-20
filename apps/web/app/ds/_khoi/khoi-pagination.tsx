'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PhanTrang } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { BienThe, KhoiHang } from '../_khung/tam'
import { docDemo, Nhan } from './khoi-filter-bar'

/** Bấm thử: trang đọc từ URL (`trang`), cùng bộ lọc `loai` với khối FilterBar — 10 dòng mỗi trang. */
function ThuThat() {
  const d = docDemo(useSearchParams())
  return d.soTrang > 1 ? (
    <PhanTrang trang={d.trang} soTrang={d.soTrang} tong={d.tong} moiTrang={10} nhan="ticket" />
  ) : (
    <p className="m-0 text-[12px] leading-[18px] text-muted-foreground">
      Lọc còn {d.tong} ticket — một trang, chân phân trang ẩn. Bỏ lọc ở khối FilterBar để thấy lại.
    </p>
  )
}

/**
 * #pagination — tái tạo ds/nguon/components/Pagination/preview.html bằng `PhanTrang` THẬT của bang/ (giao diện DS qua
 * `CauHinhBangDs`): trang 1/2 ("Trang trước" tắt) và 2/2 ("Trang sau" tắt), 15 dòng mỗi trang như preview. Nút còn
 * dùng được là link giữ mọi tham số URL khác, chỉ đổi `trang`.
 */
export function KhoiPagination() {
  return (
    <section id="pagination" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#pagination">Pagination</a>
      </h2>
      <div className="max-w-[1100px] border-none border-current">
        <CauHinhBangDs>
          <Suspense>
            <div data-so="dau" className="mb-7 border-none border-current">
              <Nhan>Trang 1 / 2 — &quot;Trang trước&quot; tắt</Nhan>
              <PhanTrang trang={1} soTrang={2} tong={19} moiTrang={15} nhan="ticket" />
            </div>
            <div data-so="cuoi" className="mb-7 border-none border-current">
              <Nhan>Trang 2 / 2 — &quot;Trang sau&quot; tắt</Nhan>
              <PhanTrang trang={2} soTrang={2} tong={19} moiTrang={15} nhan="ticket" />
            </div>
          </Suspense>
        </CauHinhBangDs>
      </div>
    </section>
  )
}

/** #pagination dạng hàng (/ds). */
export function KhoiPaginationHang() {
  return (
    <KhoiHang neo="pagination">
      <CauHinhBangDs>
        <Suspense>
          <BienThe ten="Trang đầu" moTa="Nút lùi tắt nhưng vẫn giữ chỗ — cụm nút không nhảy khi sang trang.">
            <PhanTrang trang={1} soTrang={2} tong={19} moiTrang={15} nhan="ticket" />
          </BienThe>
          <BienThe ten="Trang cuối" moTa="Nút tới tắt. Bên trái luôn nói đang xem dòng nào trên tổng bao nhiêu.">
            <PhanTrang trang={2} soTrang={2} tong={19} moiTrang={15} nhan="ticket" />
          </BienThe>
          <BienThe ten="Bấm thử" moTa="Sang trang giữ nguyên bộ lọc đang chọn ở khối FilterBar; đổi lọc thì về trang 1.">
            <ThuThat />
          </BienThe>
          <BienThe ten="Chỉ một trang" moTa="Không hiện gì — ít dòng thì không cần chân phân trang.">
            <p className="m-0 text-[12px] leading-[18px] text-muted-foreground">(trống)</p>
          </BienThe>
        </Suspense>
      </CauHinhBangDs>
    </KhoiHang>
  )
}
