'use client'

// PROTOTYPE vứt đi — vỏ trang chi tiết ticket: 2 phương án để so (CEO 26/11): "Gọn" (khung đã duyệt) · "Bố cục cũ · UI mới".
import { Badge } from '@/components/ui/badge'
import { dvTrang } from '@/components/ui/data-view-styles'
import { ThanhPhuongAn } from '@/app/prototype/_chung/ThanhPhuongAn'
import type { DuLieuCt } from './chung'
import { CtCu } from './ct-cu'
import { CtGon } from './ct-gon'

const PA = [
  { ma: 'gon', ten: 'Gọn' },
  { ma: 'cu', ten: 'Bố cục cũ · UI mới' },
]
const CACH: Record<string, string> = {
  gon: 'Bấm nhãn trạng thái để đổi (sang Đã xong thì cờ Khẩn ẩn); lần lỗi mới nhất mở sẵn, bấm lần cũ để mở; nhật ký · chi phí · thông tin khác thu gọn ở cuối.',
  cu: 'Bố cục y màn cũ, vỏ DS: Lần 1 ở trên, mọi lần mở sẵn, Khách báo | Xử lý ngang nhau; khách & máy, nhóm lỗi, chi phí ở cột phải (khác bản Gọn: lần mới nhất trên cùng, một cột, phần phụ thu gọn).',
}

export function CtPrototype({ d, variant }: { d: DuLieuCt; variant?: string }) {
  const pa = variant === 'cu' ? 'cu' : 'gon'
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
      {pa === 'cu' ? <CtCu d={d} /> : <CtGon d={d} />}
      <ThanhPhuongAn ds={PA} hienTai={pa} />
    </div>
  )
}
