'use client'

// PROTOTYPE vứt đi — /ticket?variant=A–F, T: các phương án danh sách ticket dựng từ DS v2 + thanh đổi phương án.
// F = CHÍNH màn thật (_danh-sach/ds-f.tsx), chỉ thêm dòng mô tả phương án.
import { ThanhPhuongAn } from '@/app/prototype/_chung/ThanhPhuongAn'
import { ManV2 } from '@/components/khung/ManV2'
import { TicketF } from '../_danh-sach/ds-f'
import { DauPrototype, PHUONG_AN, type DuLieuTicket } from './chung'
import { TOI_DEMO } from './demo'
import { TicketA } from './ds-a'
import { TicketB } from './ds-b'
import { TicketC } from './ds-c'
import { TicketD } from './ds-d'
import { TicketE } from './ds-e'
import { TicketT } from './ds-t'

const PA = { A: TicketA, B: TicketB, C: TicketC, D: TicketD, E: TicketE, T: TicketT }

const CACH_F = `Đề xuất theo nghiên cứu — CHÍNH màn /ticket (dữ liệu thật). Bấm tab view; nút "Lọc" (cạnh ⚙): chọn trường → điều kiện → giá trị = một chip (bấm chip sửa, × gỡ; DB lọc theo URL) — hoặc bấm tiêu đề cột → "Lọc…" mở đúng trường đó; bấm TÊN khách mở Xem nhanh; tick ô đầu dòng → thanh hàng loạt. Sửa tại chỗ chưa lưu. Ticket Demo: "Của tôi" = ${TOI_DEMO}.`

export function TrangTicketPrototype({ variant, ...du }: DuLieuTicket & { variant: string }) {
  const C = PA[variant as keyof typeof PA] ?? TicketA
  return (
    <ManV2>
      {variant === 'F' ? <TicketF {...du} dau={<DauPrototype ma="F" demo={du.demo} cach={CACH_F} />} /> : <C {...du} />}
      <ThanhPhuongAn ds={PHUONG_AN} hienTai={variant} />
    </ManV2>
  )
}
