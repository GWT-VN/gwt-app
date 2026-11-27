/**
 * Màn nào có hàng tab tự tạo (khuôn bảng Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md): khoá `bang_view.bang`
 * → tham số URL thuộc "bộ lọc" của tab (lọc + tìm + sắp; cột luôn kèm `KHOA_COT`) + đường dẫn cần làm mới.
 * Server action chỉ nhận khoá có ở đây (chặn ghi `bang_view` tuỳ ý) và chỉ lưu đúng các tham số này.
 * Thêm một màn = thêm một dòng.
 */
import { KHOA_LOC_KHACH } from '@/app/khach-hang/truong-khach'
import { KHOA_LOC as KHOA_LOC_TICKET } from '@/app/ticket/_danh-sach/truong-f'

export const TAB_VIEW = {
  ticket_tab: { khoaLoc: KHOA_LOC_TICKET, duongDan: '/ticket' },
  khach_tab: { khoaLoc: KHOA_LOC_KHACH, duongDan: '/khach-hang' },
} satisfies Record<string, { khoaLoc: string[]; duongDan: string }>

export type BangTab = keyof typeof TAB_VIEW
export const laBangTab = (x: unknown): x is BangTab => typeof x === 'string' && Object.hasOwn(TAB_VIEW, x)
