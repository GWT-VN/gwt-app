'use client'

// PROTOTYPE vứt đi — vỏ trang chi tiết ticket bản gọn (một phương án, CEO duyệt 26/11). Không thanh đổi phương án.
import { Badge } from '@/components/ui/badge'
import { dvTrang } from '@/components/ui/data-view-styles'
import type { DuLieuCt } from './chung'
import { CtGon } from './ct-gon'

export function CtPrototype({ d }: { d: DuLieuCt }) {
  return (
    <div className={dvTrang}>
      <div className="mb-6 flex flex-wrap items-center gap-2 border-none border-current">
        <Badge variant="soft" color="warning">
          Prototype
        </Badge>
        <span className="ds-text-sm text-muted-foreground">
          Bấm nhãn trạng thái để đổi (sang Đã xong thì cờ Khẩn ẩn); lần lỗi mới nhất mở sẵn, bấm lần cũ để mở; nhật ký · chi
          phí · thông tin khác thu gọn ở cuối. Không lưu gì thật.
        </span>
      </div>
      <CtGon d={d} />
    </div>
  )
}
