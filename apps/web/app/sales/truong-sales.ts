// Trường lọc + tab của các danh sách khu Sales (khuôn Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). File THƯỜNG:
// page (server) lọc bằng cùng định nghĩa, bảng (client) dựng nút Lọc + tab. Tên trường = tên tham số URL cũ (`tt`, `kenh`, `sp`…)
// để link cũ một giá trị vẫn đọc được (chọn "là" không tiền tố).
import type { KieuTruong } from '@/bang/locTruong'

type Truong = { id: string; ten: string; kieu: KieuTruong }

/** Đơn hàng. `ngay` thay cặp `ngtu`/`ngden` cũ (page tự đổi link cũ). */
export const TRUONG_DON: Truong[] = [
  { id: 'ngay', ten: 'Ngày đơn', kieu: 'ngay' },
  { id: 'tt', ten: 'Tình trạng', kieu: 'chon' },
  { id: 'tp', ten: 'Thanh toán', kieu: 'chon' },
  { id: 'kenh', ten: 'Kênh', kieu: 'chon' },
  { id: 'kenh2', ten: 'Kênh chi tiết', kieu: 'chon' },
  { id: 'sp', ten: 'Sản phẩm', kieu: 'chon' },
]
/** `nhom` = tab nguồn đơn (POE/POU/Khác/Tặng) — trước là `?tab=DON_…`, nay `tab` thuộc tab tự tạo. */
export const KHOA_LOC_DON = ['q', 'nhom', ...TRUONG_DON.map((x) => x.id), 'cot', 'chieu']
export const TAB_DON = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  { v: 'poe', ten: 'POE', loc: 'nhom=DON_POE' },
  { v: 'pou', ten: 'POU', loc: 'nhom=DON_POU' },
  { v: 'khac', ten: 'Khác', loc: 'nhom=DON_OTHERS' },
  { v: 'tang', ten: 'Tặng', loc: 'nhom=DON_TANG' },
]

/** Khách Sales. */
export const TRUONG_KHACH_SALES: Truong[] = [
  { id: 'tinh', ten: 'Tỉnh/TP', kieu: 'chon' },
  { id: 'kenh', ten: 'Kênh', kieu: 'chon' },
]
export const KHOA_LOC_KHACH_SALES = ['q', 'trung_sdt', ...TRUONG_KHACH_SALES.map((x) => x.id), 'cot', 'chieu']
/** "Trùng SĐT" = cảnh báo nhiều hồ sơ cùng số (CEO 22/08: đếm và nói ra) thành bộ lọc chọn sẵn, xếp theo SĐT cho cặp trùng đứng cạnh. */
export const TAB_KHACH_SALES = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  { v: 'trung-sdt', ten: 'Trùng SĐT', loc: 'trung_sdt=1&cot=phone&chieu=asc', nguy: true },
]

/** Bảng giá niêm yết: chỉ tìm (màn cũ không có bộ lọc khác). */
export const KHOA_LOC_GIA = ['q', 'cot', 'chieu']
export const TAB_GIA = [{ v: 'tat-ca', ten: 'Tất cả', loc: '' }]

/** Chương trình khuyến mãi. `ngay` = thời gian chạy (giao nhau hai khoảng), thay `ngtu`/`ngden`. */
export const TRUONG_CTKM: Truong[] = [
  { id: 'ngay', ten: 'Thời gian chạy', kieu: 'ngay' },
  { id: 'sp', ten: 'Sản phẩm', kieu: 'chon' },
  { id: 'kenh', ten: 'Kênh', kieu: 'chon' },
  { id: 'tt', ten: 'Trạng thái', kieu: 'chon' },
]
export const KHOA_LOC_CTKM = ['q', ...TRUONG_CTKM.map((x) => x.id), 'cot', 'chieu']
export const TAB_CTKM = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  { v: 'dang-chay', ten: 'Đang chạy', loc: 'tt=ban_hanh' },
  { v: 'nhap', ten: 'Nháp', loc: 'tt=nhap' },
]
export const NHAN_TT_CTKM: Record<string, string> = { ban_hanh: 'Đang chạy', nhap: 'Nháp', ket_thuc: 'Đã kết thúc' }

/** Link cũ (`ngtu`/`ngden`, ngden tính cả ngày đó) → giá trị trường ngày mới; null = không có. */
export function ngayTuLinkCu(ngtu?: string, ngden?: string): string | null {
  const ok = (d?: string) => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d)
  if (ok(ngtu) && ok(ngden)) return `khoang~${ngtu}..${ngden}`
  if (ok(ngtu)) return `sau~${ngtu}`
  if (ok(ngden)) return `khoang~1900-01-01..${ngden}`
  return null
}
