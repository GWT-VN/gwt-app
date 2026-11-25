'use client'

// PROTOTYPE vứt đi — PA A "Hai cột kiểu Linear": DetailLayout DS, cột chính = các lần lỗi + máy & lỗi + nhật ký,
// cột phải 280 = thuộc tính (Xử lý · Khách · Máy · Nhóm lỗi) + chi phí.
import { DetailHeading, DetailLayout } from '@/components/ui/detail-layout'
import { PageHeader } from '@/components/ui/page-header'
import { Timeline } from '@/components/ui/timeline'
import {
  CacLanLoi,
  CanhBao,
  ChiPhiGon,
  DongMayLoi,
  DuongDan,
  meta,
  mucGhiChu,
  NhomLoi,
  NutLichKT,
  tieuDe,
  TTKhachMay,
  TTXuLy,
  useGhiChuMoi,
  type DuLieuCt,
} from './chung'

export function CtA({ d }: { d: DuLieuCt }) {
  const { moi, composer } = useGhiChuMoi()
  const muc = mucGhiChu(d, moi)
  const chinh = (
    <>
      <CanhBao d={d} />
      <section aria-labelledby="ct-lan" className="border-none border-current">
        <DetailHeading id="ct-lan" className="mb-3">
          Các lần lỗi
        </DetailHeading>
        <CacLanLoi d={d} />
      </section>
      <section aria-labelledby="ct-may" className="border-none border-current">
        <DetailHeading id="ct-may" className="mb-3">
          Máy &amp; lỗi
        </DetailHeading>
        <DongMayLoi d={d} />
      </section>
      <section aria-labelledby="ct-nk" className="border-none border-current">
        <DetailHeading id="ct-nk" className="mb-3">
          Nhật ký trao đổi
        </DetailHeading>
        {muc.length > 0 && <Timeline muc={muc} hien={6} aria-label="Nhật ký trao đổi" />}
        {composer}
      </section>
    </>
  )
  const ben = (
    <>
      <TTXuLy d={d} />
      <TTKhachMay d={d} />
      <NhomLoi d={d} />
      <ChiPhiGon d={d} />
    </>
  )
  return (
    <div className="flex flex-col gap-6 border-none border-current">
      <PageHeader duongDan={<DuongDan ma={d.t.ticket_code} />} tieuDe={tieuDe(d)} meta={meta(d)} hanhDong={<NutLichKT d={d} />} />
      <DetailLayout chinh={chinh} ben={ben} nhanBen="Thuộc tính ticket" />
    </div>
  )
}
