'use client'

// PROTOTYPE vứt đi — vỏ chọn phương án trang chi tiết ticket (?variant=A–F) + thanh đổi phương án dưới đáy.
import { dvTrang } from '@/components/ui/data-view-styles'
import { ThanhPhuongAn } from '@/app/prototype/_chung/ThanhPhuongAn'
import { BangPrototype, PA, type DuLieuCt } from './chung'
import { CtA } from './ct-a'
import { CtB } from './ct-b'
import { CtC } from './ct-c'
import { CtD } from './ct-d'
import { CtE } from './ct-e'
import { CtF } from './ct-f'

const CACH: Record<string, string> = {
  A: 'Thuộc tính ở cột phải, bấm Trạng thái / Khẩn / CS / Kỹ thuật để sửa thử. Dưới 960 cột thuộc tính lên trên.',
  B: 'Cuộn một dòng hoạt động; ô ghi chú bám đáy — gõ rồi Ctrl+Enter thêm vào cuối.',
  C: 'Bấm các tab để xem từng phần; số trên tab là số mục.',
  D: 'Đọc như chat: khách bên trái, xử lý bên phải, ghi chú nội bộ có khoá + nhãn Nội bộ. Bấm "Chi tiết" để mở thuộc tính đầy đủ.',
  E: 'Đọc trước: thẻ lớn về máy + khách (thanh bảo hành còn bao lâu), các thẻ tóm tắt bên dưới. Lịch sử máy là Demo.',
  F: 'Mỗi lần lỗi một hàng: Khách báo ↔ Xử lý ngang nhau; bấm "Lần N" ở trục trái để nhảy; lần chưa xử lý có nút Ghi xử lý. Lần 2–3 là Demo.',
}

export function CtPrototype({ variant, d }: { variant: string; d: DuLieuCt }) {
  const C = { B: CtB, C: CtC, D: CtD, E: CtE, F: CtF }[variant] ?? CtA
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
