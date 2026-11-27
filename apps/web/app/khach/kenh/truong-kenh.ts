// Tab của "Soát kênh khách" (khuôn Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). File THƯỜNG.

/** Tham số URL thuộc "bộ lọc" của tab: tìm + nhóm kênh. */
export const KHOA_LOC_KENH = ['q', 'nhom']

/**
 * Tab cố định = ba nhóm CEO chốt 31/08 ("113 máy điền, 74 người điền và 240 trống thành 3 tab"). KHÔNG có "Tất cả":
 * ba nhóm là ba mức tin cậy phải soát riêng, và URL không `nhom` = "Máy điền" (mặc định cũ của trang).
 */
export const TAB_KENH = [
  { v: 'may', ten: 'Máy điền', loc: '' },
  { v: 'nguoi', ten: 'Người điền', loc: 'nhom=nguoi' },
  { v: 'trong', ten: 'Còn trống', loc: 'nhom=trong' },
]
