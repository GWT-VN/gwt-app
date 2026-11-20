'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { ArrowClockwise } from '@phosphor-icons/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { khongVien, skeletonRow, skeletonStack } from '@/components/ui/feedback-styles'
import { Skeleton, SkeletonDong } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Demo dùng chung cho KhoiSkeleton (/ds/tron, so khớp) và KhoiSkeletonHang (/ds) — dữ liệu demo. `data-so` = khoá so khớp. */

const DONG = [
  ['Gấp', 'Khách sạn Demo Sen Vàng', 'Báo KT trưởng, xếp lịch'],
  ['Cao', 'Nhà hàng Demo Bếp Quê', 'Hẹn lấy mẫu nước'],
  ['Thường', 'Công ty Demo An Phát', 'Gọi khách xác nhận lỗi'],
  ['Thường', 'Khách demo 04', 'Phân loại lỗi'],
  ['Thấp', 'Khách demo 05', 'Hướng dẫn kết nối wifi'],
] as const

/**
 * Danh sách ticket demo: bấm "Tải lại" → 1,6 giây đang tải (khối chờ hiện sau 300ms) → dữ liệu về đúng chỗ khối chờ
 * (dòng thật và dòng chờ cùng khung `skeletonRow`). Mặc định đã tải — như preview artifact.
 */
function DanhSach() {
  const [tai, setTai] = useState(false)
  useEffect(() => {
    if (!tai) return
    const id = setTimeout(() => setTai(false), 1600)
    return () => clearTimeout(id)
  }, [tai])
  return (
    <>
      <Button data-so="tai-lai" variant="outline" size="sm" loading={tai} onClick={() => setTai(true)}>
        <ArrowClockwise /> Tải lại
      </Button>
      <div data-so="vung" aria-busy={tai} className={khongVien}>
        {tai ? (
          <SkeletonDong so={DONG.length} nhan="Đang tải danh sách ticket" />
        ) : (
          DONG.map(([uuTien, khach, viec]) => (
            <div key={khach} data-so="dong" className={skeletonRow}>
              <Badge>{uuTien}</Badge>
              {/* Tên + việc chia đôi chỗ còn lại như hai khối chờ dòng chữ (giãn đều) → dữ liệu về không nhảy chỗ. */}
              <span className={`${khongVien} min-w-0 flex-1 truncate`}>{khach}</span>
              <span className={`${khongVien} min-w-0 flex-1 truncate text-[12px] leading-[18px] text-muted-foreground`}>{viec}</span>
              <Avatar>
                <AvatarFallback>H</AvatarFallback>
              </Avatar>
            </div>
          ))
        )}
      </div>
    </>
  )
}

const NUT = (
  <div data-so="nut" className={`${khongVien} flex flex-wrap gap-2`}>
    <Button data-so="luu">Lưu thay đổi</Button>
    <Button data-so="dang-gui" variant="outline" loading>
      Đang gửi
    </Button>
  </div>
)

/** `.ds-muc` + `.ds-nhan` của preview (khung trình bày, không phải component): cách dưới 28; nhãn 500 12/16 muted. */
function Muc({ nhan, children }: { nhan: string; children: ReactNode }) {
  return (
    <div className={`${khongVien} mb-7`}>
      <div className={`${khongVien} mb-2 text-[12px] leading-[16px] font-medium text-muted-foreground`}>{nhan}</div>
      {children}
    </div>
  )
}

/** #skeleton — tái tạo ds/nguon/components/Skeleton/preview.html (cột tối đa 720: danh sách đã tải + nút đang chạy). */
export function KhoiSkeleton() {
  return (
    <section id="skeleton" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#skeleton">Skeleton</a>
      </h2>
      <div className={`${khongVien} max-w-[720px]`}>
        <Muc nhan="Skeleton — đúng hình dòng bảng thật (aria-busy)">
          <DanhSach />
        </Muc>
        <Muc nhan="Nút đang chạy — giữ bề rộng, chữ ẩn, vòng xoay giữa">{NUT}</Muc>
      </div>
    </section>
  )
}

/** #skeleton dạng hàng cho /ds. */
export function KhoiSkeletonHang() {
  return (
    <KhoiHang neo="skeleton">
      <BienThe ten="Dòng bảng đang tải" moTa="Đúng hình dòng thật: nhãn, tên, mô tả, người phụ trách. Hiện sau 300ms để tải nhanh không nháy.">
        <div className={`${khongVien} max-w-[720px]`}>
          <SkeletonDong so={3} />
        </div>
      </BienThe>
      <BienThe ten="Tải lại" moTa="Bấm Tải lại: khối chờ thế chỗ, dữ liệu về đúng chỗ đó, trang không nhảy.">
        <div className={`${khongVien} flex max-w-[720px] flex-col gap-2 [&>button]:self-start`}>
          <DanhSach />
        </div>
      </BienThe>
      <BienThe ten="Hình" moTa="Dòng chữ, dòng tiêu đề, nhãn tròn dài, ảnh đại diện. Bề rộng theo bậc 1/4 tới 3/4.">
        <div className={`${skeletonStack} max-w-[360px]`}>
          <Skeleton shape="title" width="1/2" />
          <Skeleton width="3/4" />
          <Skeleton width="2/3" />
          <Skeleton width="1/4" />
          <div className={`${khongVien} flex items-center gap-3`}>
            <Skeleton shape="circle" />
            <Skeleton shape="pill" />
          </div>
        </div>
      </BienThe>
      <BienThe ten="Thẻ số liệu đang tải" moTa="Thẻ giữ nguyên khung, khối chờ cùng hình nhãn, số, biến động.">
        <div className={`${khongVien} max-w-[260px]`}>
          <StatCard nhan="Doanh thu tháng (demo)" giaTri={null} dangTai />
        </div>
      </BienThe>
      <BienThe ten="Nút đang chạy" moTa="Giữ bề rộng, chữ ẩn, vòng xoay giữa, không bấm lần hai. Dùng nút có trạng thái đang chạy, không dựng lại.">
        {NUT}
      </BienThe>
    </KhoiHang>
  )
}
