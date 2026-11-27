// Tab của danh sách Nhóm lỗi (khuôn Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). File THƯỜNG.

/** Tham số URL thuộc "bộ lọc" của tab. `nguong` (ngưỡng gợi ý gom nhóm) là của khối gợi ý, không thuộc tab. */
export const KHOA_LOC_NHOM_LOI = ['q', 'bh']

/** Tab cố định = hai nút cũ "Tất cả nhóm" / "Chỉ nhóm báo hãng" (cùng tham số `bh=1`). */
export const TAB_NHOM_LOI = [
  { v: 'tat-ca', ten: 'Tất cả nhóm', loc: '' },
  { v: 'bao-hang', ten: 'Chỉ nhóm báo hãng', loc: 'bh=1' },
]
