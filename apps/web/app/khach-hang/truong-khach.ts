// Trường lọc + tab của danh sách khách CSKH (khuôn Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). File THƯỜNG:
// page (server) lọc ở DB bằng cùng định nghĩa, BangKhach (client) dựng nút Lọc + tab.
import type { KieuTruong } from '@/bang/locTruong'

/** Trường lọc (Lọc ▸ trường): `cot` = cột cs_customers lọc ở DB. Danh sách giá trị lấy từ dữ liệu (tuyChonKhach). */
export const TRUONG_KHACH: { id: string; ten: string; kieu: KieuTruong; cot: string }[] = [
  { id: 'tinh', ten: 'Tỉnh/TP', kieu: 'chon', cot: 'province' },
  { id: 'nguon', ten: 'Nguồn', kieu: 'chon', cot: 'source' },
]

/** Tham số URL thuộc "bộ lọc" của tab: tìm + 2 cờ soát dữ liệu + lọc trường + sắp. */
export const KHOA_LOC_KHACH = ['q', 'thieu_sdt', 'kenh_tu_dong', ...TRUONG_KHACH.map((x) => x.id), 'cot', 'chieu']

/** Tab cố định: hai việc soát dữ liệu CEO đã chốt (22/08 xin lại SĐT · 24/08 soát kênh máy tự điền) thành bộ lọc chọn sẵn. */
export const TAB_KHACH = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  { v: 'thieu-sdt', ten: 'Cần xin SĐT', loc: 'thieu_sdt=1', nguy: true },
  { v: 'kenh', ten: 'Kênh cần soát', loc: 'kenh_tu_dong=1' },
]
