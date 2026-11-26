// Trường lọc + tab của danh sách ticket F (bộ lọc theo trường, docs/rework/2026-11-26-f-hoc-hanh-vi-twenty.md mục D).
// File THƯỜNG (không 'use client'): page.tsx (server) dùng cùng định nghĩa — DB lọc qua loc-db.ts, ticket Demo (dev)
// lọc trong bộ nhớ bằng `lay`; ds-f.tsx dựng bộ lọc + tab.
import type { Ticket } from '@/app/actions'
import type { TruongDuLieu } from '@/bang/locTruong'

/** Giá trị "Chưa giao" của Phụ trách (tên người không bao giờ là "-"). */
export const CHUA_GIAO = '-'
/** "Máy · lỗi": dòng máy đầu tiên (ticket_may), không có thì tên máy. */
export const mayLoi = (t: Ticket) => t.dong_may?.[0]?.nhan ?? t.product_name ?? '—'
/** Mã máy ngắn cho bảng (CEO 26/11: "chỉ cần mã máy ngắn gọn" — CTS20, GN610…). DB không có cột này (đo prod 26/11:
 *  internal_code = GPUN-4000XEN-G, serial_registry.model = mã kho) — mã thương mại nằm ngay sau "GE " trong tên.
 *  ponytail: suy từ tên; catalog có cột mã ngắn thì đọc cột đó. */
export const maMayNgan = (t: Pick<Ticket, 'product_name' | 'internal_code'>) =>
  t.product_name?.match(/\bGE\s+([A-Z0-9][\w-]*)/)?.[1] ?? t.internal_code ?? t.product_name ?? '—'

/** Thứ tự = thứ tự trong danh sách "Tìm trường". `id` = tên tham số URL (CHUAN-FILTER: `tt`, `cs`, `loai`, `tinh` dùng lại).
 *  `loi` ở DB = mã loại lỗi (v_tickets_loi.loi_codes); `lay` của nó (nhãn dòng máy) chỉ còn cho ticket Demo. */
export const TRUONG_F: (TruongDuLieu<Ticket> & { ten: string })[] = [
  { id: 'tt', ten: 'Trạng thái', kieu: 'chon', lay: (t) => t.state },
  { id: 'cs', ten: 'Phụ trách', kieu: 'nguoi', lay: (t) => t.cs_ten ?? CHUA_GIAO },
  { id: 'loi', ten: 'Loại lỗi', kieu: 'chon', lay: (t) => t.dong_may?.[0]?.nhan },
  { id: 'loai', ten: 'Loại', kieu: 'chon', lay: (t) => t.ticket_type },
  { id: 'tinh', ten: 'Tỉnh/TP', kieu: 'chon', lay: (t) => t.province },
  { id: 'tao', ten: 'Ngày tạo', kieu: 'ngay', lay: (t) => t.created_at },
  { id: 'khach', ten: 'Khách', kieu: 'chu', lay: (t) => t.customer_name },
  { id: 'may', ten: 'Máy · serial', kieu: 'chu', lay: (t) => [t.product_name, t.source_serial].filter(Boolean).join(' ') },
]

/**
 * Tab (view mặc định, URL `view`; mặc định `cua-toi` không ghi). CEO 26/11: bỏ "Quá hạn" (hạn theo dõi ở Việc đã gắn,
 * bước 4) và "Chờ vật tư" (DB không có trạng thái chờ); thêm "Khẩn". Điều kiện từng tab: page.tsx (DB) + demo.
 */
export const VIEW_F = [
  { v: 'cua-toi', ten: 'Của tôi' },
  { v: 'chua-giao', ten: 'Chưa giao' },
  { v: 'khan', ten: 'Khẩn' },
  { v: 'mo', ten: 'Tất cả đang mở' },
  { v: 'hen-nay', ten: 'Hẹn hôm nay' },
] as const
export type ViewF = (typeof VIEW_F)[number]['v']
export const docViewF = (v: string | null | undefined): ViewF => VIEW_F.find((x) => x.v === v)?.v ?? 'cua-toi'

/** Giá trị có trong dữ liệu (CHƯA lọc) cho trường chọn — danh sách giá trị không co lại theo chính bộ lọc đang bật. */
export function tuyChonF(rows: Pick<Ticket, 'state' | 'cs_ten' | 'ticket_type' | 'province'>[]): Record<string, string[]> {
  return Object.fromEntries(
    TRUONG_F.filter((x) => (x.kieu === 'chon' || x.kieu === 'nguoi') && x.id !== 'loi').map((x) => [
      x.id,
      // "Chưa giao" cuối danh sách (sau tên người).
      [...new Set(rows.map((r) => x.lay(r as Ticket)).filter((v): v is string => !!v))].sort(
        (a, b) => Number(a === CHUA_GIAO) - Number(b === CHUA_GIAO) || a.localeCompare(b, 'vi'),
      ),
    ]),
  )
}
