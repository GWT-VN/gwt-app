// Trường lọc + tab của Hồ sơ chất lượng nước (khuôn Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md).
// File THƯỜNG: page + hoSoNuoc (server) lọc bằng cùng định nghĩa, BangNuoc (client) dựng nút Lọc + tab.
import type { KieuTruong } from '@/bang/locTruong'

/**
 * `tinh` — tỉnh/TP của khách (cùng tham số ô chọn tỉnh cũ; lọc TRONG TRANG vì tỉnh nằm ở bảng khác).
 * `ngay` — ngày đo (maintenance_visit.completed_at), lọc ở DB; thay cặp `ngtu`/`ngden` của LocNgay cũ.
 */
export const TRUONG_NUOC: { id: string; ten: string; kieu: KieuTruong }[] = [
  { id: 'tinh', ten: 'Tỉnh/TP', kieu: 'chon' },
  { id: 'ngay', ten: 'Ngày đo', kieu: 'ngay' },
]

export const KHOA_LOC_NUOC = ['q', ...TRUONG_NUOC.map((x) => x.id)]

export const TAB_NUOC = [{ v: 'tat-ca', ten: 'Tất cả', loc: '' }]
