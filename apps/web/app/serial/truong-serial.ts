// Trường lọc + tab của Kho serial (khuôn Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). File THƯỜNG:
// page (server) + actions lọc ở DB, BangSerial (client) dựng nút Lọc + tab.
import type { KieuTruong } from '@/bang/locTruong'

/** `tt` = trạng thái (serial_registry.trang_thai) — cùng tham số URL với hàng chip "Tất cả | trạng thái…" cũ. */
export const TRUONG_SERIAL: { id: string; ten: string; kieu: KieuTruong; cot: string }[] = [
  { id: 'tt', ten: 'Trạng thái', kieu: 'chon', cot: 'trang_thai' },
]

/** Tham số URL thuộc "bộ lọc" của tab (kho serial luôn sắp theo serial — không có cot/chieu). */
export const KHOA_LOC_SERIAL = ['q', ...TRUONG_SERIAL.map((x) => x.id)]

/** Tab cố định = hàng chip trạng thái cũ: "Tất cả" + mỗi trạng thái trong danh mục serial_trang_thai. */
export const tabSerial = (ds: { code: string; nhan: string }[]) => [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  ...ds.map((t) => ({ v: t.code, ten: t.nhan, loc: new URLSearchParams({ tt: t.code }).toString() })),
]
