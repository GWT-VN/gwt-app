'use client'

// PROTOTYPE vứt đi — vỏ trang chi tiết ticket: 2 phương án để so (CEO 26/11): "Gọn" (khung đã duyệt) · "Bố cục cũ · UI mới".
import { Badge } from '@/components/ui/badge'
import { dvTrang } from '@/components/ui/data-view-styles'
import { ThanhPhuongAn } from '@/app/prototype/_chung/ThanhPhuongAn'
import type { DuLieuCt } from './chung'
import { CtCu } from './ct-cu'
import { CtGon } from './ct-gon'
import { CtRef } from './ct-ref'

const PA = [
  { ma: 'gon', ten: 'Gọn' },
  { ma: 'cu', ten: 'Bố cục cũ · UI mới' },
  { ma: 'ref', ten: 'Theo ref Shopify + Intercom' },
]
const CACH: Record<string, string> = {
  ref: 'Theo ref Shopify + Intercom: trạng thái góc phải hàng tiêu đề, ‹ › sang ticket kề; cột chính = lần lỗi · chi phí · nhật ký (đầu khối có số + nút); cột phải = người · máy · khách · ticket khác · phân loại.',
  gon: 'Bấm nhãn trạng thái để đổi (sang Đã xong thì cờ Khẩn ẩn); lần lỗi mới nhất mở sẵn, bấm lần cũ để mở; nhật ký · chi phí · thông tin khác thu gọn ở cuối.',
  cu: 'Bố cục y màn cũ, vỏ DS: Lần 1 ở trên, mọi lần mở sẵn, Khách báo | Xử lý ngang nhau; khách & máy, nhóm lỗi, chi phí ở cột phải (khác bản Gọn: lần mới nhất trên cùng, một cột, phần phụ thu gọn).',
}

export function CtPrototype({ d, variant }: { d: DuLieuCt; variant?: string }) {
  const pa = variant === 'cu' || variant === 'ref' ? variant : 'gon'
  return (
    <div className={dvTrang}>
      <div className="mb-6 flex flex-wrap items-center gap-2 border-none border-current">
        <Badge variant="soft" color="warning">
          Prototype
        </Badge>
        <span className="ds-text-sm text-muted-foreground">
          {CACH[pa]} Đổi bản: thanh dưới đáy hoặc phím ← →. Không lưu gì thật.
        </span>
      </div>
      {pa === 'cu' ? <CtCu d={d} /> : pa === 'ref' ? <CtRef d={d} /> : <CtGon d={d} />}
      <ThanhPhuongAn ds={PA} hienTai={pa} />
    </div>
  )
}
