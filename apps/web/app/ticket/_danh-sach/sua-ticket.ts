// Ghi thật của danh sách ticket F (ô bảng, Xem nhanh, kéo thẻ Kanban) — CHỈ gọi action có sẵn (updateTicket,
// suaDongMay / themDongMay). Lỗi → NÉM để ô InlineEdit trả giá trị cũ + báo (lưu lạc quan của DS). Ticket Demo (bộ nhớ)
// không lưu: ném "Demo — không lưu" thay vì gọi action.
import { updateTicket, type Ticket } from '@/app/actions'
import { suaDongMay, themDongMay } from '@/app/ticket/loi-actions'
import { DEMO_KHONG_LUU, laDemo } from './chung'
import { dongDau } from './truong-f'

export type SuaTruong = { state?: Ticket['state']; cs_phu_trach?: string | null; ticket_type?: string }

export async function luuTicket(ma: string, patch: SuaTruong): Promise<void> {
  if (laDemo(ma)) throw new Error(DEMO_KHONG_LUU)
  const r = await updateTicket(ma, patch)
  if (!r.ok) throw new Error(r.error)
}

/** Loại lỗi = lỗi của DÒNG MÁY ĐẦU (cặp với cột Máy). Chưa có dòng máy → thêm dòng (máy của ticket + lỗi). */
export async function luuLoi(t: Ticket, loiCode: string): Promise<void> {
  if (laDemo(t.ticket_code)) throw new Error(DEMO_KHONG_LUU)
  const d = dongDau(t)
  const r = d?.id
    ? await suaDongMay(d.id, { loi_code: loiCode })
    : !t.dong_may?.length
      ? await themDongMay(t.ticket_code, { loi_code: loiCode, ...(t.serial ? { serial: t.serial } : {}) })
      : { ok: false as const, error: 'Chưa đọc được dòng máy — sửa ở trang chi tiết.' }
  if (!r.ok) throw new Error(r.error)
}
