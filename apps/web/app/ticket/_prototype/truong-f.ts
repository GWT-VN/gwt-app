// PROTOTYPE vứt đi — trường lọc của PA F (bộ lọc theo trường, docs/rework/2026-11-26-f-hoc-hanh-vi-twenty.md mục D). File
// THƯỜNG (không 'use client'): page.tsx (server) lọc thật dữ liệu demo bằng cùng định nghĩa này, ds-f.tsx dựng bộ lọc.
import type { Ticket } from '@/app/actions'
import type { TruongDuLieu } from '@/bang/locTruong'

/** "Của tôi" / "Tôi" = CS này (prototype chưa nối người đang đăng nhập). */
export const TOI_F = 'CS Demo Lan'
/** Giá trị "Chưa giao" của Phụ trách (tên người không bao giờ là "-"). */
export const CHUA_GIAO = '-'
const NGAY = 86_400_000
/** Hạn xử lý = ngày tạo + 3 ngày (khẩn: + 1 ngày). */
export const han = (t: Ticket) => new Date(t.created_at).getTime() + (t.khan ? 1 : 3) * NGAY
/** "Máy · lỗi": dòng máy đầu tiên (ticket_may), không có thì tên máy. */
export const mayLoi = (t: Ticket) => t.dong_may?.[0]?.nhan ?? t.product_name ?? '—'

/** Thứ tự = thứ tự trong danh sách "Tìm trường". `id` = tên tham số URL (CHUAN-FILTER: `tt`, `cs`, `loai`, `tinh` dùng lại). */
export const TRUONG_F: (TruongDuLieu<Ticket> & { ten: string })[] = [
  { id: 'tt', ten: 'Trạng thái', kieu: 'chon', lay: (t) => t.state },
  { id: 'cs', ten: 'Phụ trách', kieu: 'nguoi', lay: (t) => t.cs_ten ?? CHUA_GIAO },
  { id: 'loi', ten: 'Loại lỗi', kieu: 'chon', lay: (t) => t.dong_may?.[0]?.nhan },
  { id: 'loai', ten: 'Loại', kieu: 'chon', lay: (t) => t.ticket_type },
  { id: 'tinh', ten: 'Tỉnh/TP', kieu: 'chon', lay: (t) => t.province },
  { id: 'han', ten: 'Hạn', kieu: 'ngay', lay: (t) => (t.state === 'Open' ? new Date(han(t)).toISOString() : null) },
  { id: 'tao', ten: 'Ngày tạo', kieu: 'ngay', lay: (t) => t.created_at },
  { id: 'khach', ten: 'Khách', kieu: 'chu', lay: (t) => t.customer_name },
  { id: 'may', ten: 'Máy · serial', kieu: 'chu', lay: (t) => [t.product_name, t.source_serial].filter(Boolean).join(' ') },
]

/** Giá trị có trong dữ liệu (CHƯA lọc) cho trường chọn — danh sách giá trị không co lại theo chính bộ lọc đang bật. */
export function tuyChonF(rows: Ticket[]): Record<string, string[]> {
  return Object.fromEntries(
    TRUONG_F.filter((x) => x.kieu === 'chon' || x.kieu === 'nguoi').map((x) => [
      x.id,
      // "Chưa giao" cuối danh sách (sau tên người).
      [...new Set(rows.map((r) => x.lay(r)).filter((v): v is string => !!v))].sort(
        (a, b) => Number(a === CHUA_GIAO) - Number(b === CHUA_GIAO) || a.localeCompare(b, 'vi'),
      ),
    ]),
  )
}
