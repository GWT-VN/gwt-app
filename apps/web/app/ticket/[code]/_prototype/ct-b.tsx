'use client'

// PROTOTYPE vứt đi — PA B "Hội thoại là chính": một cột đọc, thuộc tính dồn thành hàng gọn dưới tiêu đề, MỘT dòng hoạt
// động gộp theo thời gian (lần lỗi, ghi chú + tệp, dòng máy, chi phí), Composer bám đáy màn.
import { PageHeader } from '@/components/ui/page-header'
import { Timeline } from '@/components/ui/timeline'
import { CanhBao, DuongDan, HangThuocTinh, meta, mucGop, NutLichKT, tieuDe, useGhiChuMoi, type DuLieuCt } from './chung'

export function CtB({ d }: { d: DuLieuCt }) {
  const { moi, composer } = useGhiChuMoi()
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 border-none border-current">
      <PageHeader duongDan={<DuongDan ma={d.t.ticket_code} />} tieuDe={tieuDe(d)} meta={meta(d)} hanhDong={<NutLichKT d={d} />} />
      <HangThuocTinh d={d} khachMay />
      <CanhBao d={d} />
      <Timeline muc={mucGop(d, moi)} hien={12} />
      {/* Bám đáy: nền trang che phần hoạt động cuộn bên dưới. pb-16 chỉ để chừa thanh đổi phương án của prototype. */}
      <div className="sticky bottom-0 border-none border-current bg-background pt-2 pb-16">{composer}</div>
    </div>
  )
}
