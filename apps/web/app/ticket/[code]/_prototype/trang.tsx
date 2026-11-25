'use client'

// PROTOTYPE vứt đi — vỏ chọn phương án trang chi tiết ticket (?variant=A|B|C) + thanh đổi phương án dưới đáy.
import { dvTrang } from '@/components/ui/data-view-styles'
import { ThanhPhuongAn } from '@/app/prototype/_chung/ThanhPhuongAn'
import { BangPrototype, PA, type DuLieuCt } from './chung'
import { CtA } from './ct-a'
import { CtB } from './ct-b'
import { CtC } from './ct-c'

const CACH: Record<string, string> = {
  A: 'Thuộc tính ở cột phải, bấm Trạng thái / Khẩn / CS / Kỹ thuật để sửa thử. Dưới 960 cột thuộc tính lên trên.',
  B: 'Cuộn một dòng hoạt động; ô ghi chú bám đáy — gõ rồi Ctrl+Enter thêm vào cuối.',
  C: 'Bấm các tab để xem từng phần; số trên tab là số mục.',
}

export function CtPrototype({ variant, d }: { variant: string; d: DuLieuCt }) {
  const C = variant === 'B' ? CtB : variant === 'C' ? CtC : CtA
  return (
    <div className={dvTrang}>
      <div className="mb-6 border-none border-current">
        <BangPrototype pa={variant} cach={`${CACH[variant]} Đổi phương án: thanh dưới đáy hoặc phím ← →. Không lưu gì thật.`} />
      </div>
      <C d={d} />
      <ThanhPhuongAn ds={PA} hienTai={variant} />
    </div>
  )
}
