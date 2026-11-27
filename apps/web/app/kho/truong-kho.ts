// Trường lọc + tab của các bảng danh sách khu Kho (khuôn Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). File
// THƯỜNG: page (server) lọc bằng cùng định nghĩa, BangKho (client) dựng nút Lọc + tab. Chỉ các bộ lọc màn cũ đã có
// (tìm, danh mục, cảnh báo, loại, trạng thái, ngày, nguồn, hành động) — không thêm mới.
import type { DieuKienLoc, KieuTruong } from '@/bang/locTruong'
import { homNayVN } from '@/bang/locDb'

type Truong = { id: string; ten: string; kieu: KieuTruong }

// ---- Tồn kho /kho (RPC trả đủ mọi mã → lọc trong bộ nhớ như màn cũ)
export const TRUONG_TON: Truong[] = [
  { id: 'dm', ten: 'Danh mục', kieu: 'chon' },
  { id: 'cb', ten: 'Cảnh báo', kieu: 'chon' },
]
export const KHOA_LOC_TON = ['q', 'dm', 'cb']
export const TAB_TON = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  { v: 'sap-het', ten: 'Sắp hết', loc: 'cb=sap_het' },
  { v: 'am', ten: 'Tồn âm', loc: 'cb=am', nguy: true },
]

// ---- Nhật ký nhập / xuất /kho/nhat-ky (RPC wh_app_nhat_ky lọc + phân trang ở DB)
export const TRUONG_NHAT_KY: Truong[] = [
  { id: 'loai', ten: 'Loại', kieu: 'chon' },
  { id: 'tt', ten: 'Trạng thái', kieu: 'chon' },
  { id: 'ngay', ten: 'Ngày nghiệp vụ', kieu: 'ngay' },
]
export const KHOA_LOC_NHAT_KY = ['q', 'loai', 'tt', 'ngay']
export const TAB_NHAT_KY = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  { v: 'nhap', ten: 'Nhập', loc: 'loai=Nhập' },
  { v: 'xuat', ten: 'Xuất', loc: 'loai=Xuất' },
  { v: 'dieu-chinh', ten: 'Điều chỉnh', loc: 'loai=Điều chỉnh' },
]
export const TRANG_THAI_SO = [
  { giaTri: 'approved', nhan: 'Đã vào sổ' },
  { giaTri: 'need_review', nhan: 'Chờ duyệt mã' },
  { giaTri: 'rejected', nhan: 'Bỏ qua' },
]

// ---- Chờ duyệt mã /kho/cho-duyet (RPC trả đủ → lọc trong bộ nhớ)
export const TRUONG_CHO_DUYET: Truong[] = [{ id: 'loai', ten: 'Loại', kieu: 'chon' }]
export const KHOA_LOC_CHO_DUYET = ['q', 'loai']
export const TAB_CHO_DUYET = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  { v: 'nhap', ten: 'Nhập', loc: 'loai=Nhập' },
  { v: 'xuat', ten: 'Xuất', loc: 'loai=Xuất' },
]

// ---- Lịch sử sửa /kho/lich-su-sua (RPC wh_app_lich_su_sua lọc + phân trang ở DB; RPC không có tìm chữ)
export const TRUONG_LICH_SU: Truong[] = [
  { id: 'nguon', ten: 'Nguồn', kieu: 'chon' },
  { id: 'hd', ten: 'Hành động', kieu: 'chon' },
]
export const KHOA_LOC_LICH_SU = ['nguon', 'hd']
export const TAB_LICH_SU = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  { v: 'huy', ten: 'Huỷ dòng', loc: 'hd=huy' },
  { v: 'kiem-ke', ten: 'Kiểm kê', loc: 'hd=kiem_ke' },
]

/**
 * RPC sổ kho (`wh_app_*`) lọc được đúng MỘT giá trị mỗi trường (`= p->>'loai'`). Điều kiện "chọn" của Lọc ▸ trường quy về
 * tập giá trị trong `tatCa`: đủ cả tập → không lọc · rỗng → không dòng nào · đúng một → gửi RPC · từ hai trở lên → 'nhieu'
 * (màn báo chưa lọc được, KHÔNG lặng lẽ lọc sai). ponytail: muốn nhiều giá trị → migration Masterdata cho RPC nhận mảng.
 */
export function motGiaTri(d: DieuKienLoc | undefined, tatCa: readonly string[]): { gt?: string } | 'rong' | 'nhieu' {
  if (!d) return {}
  const con =
    d.phep === 'la' ? tatCa.filter((x) => d.giaTri.includes(x))
      : d.phep === 'khong-la' ? tatCa.filter((x) => !d.giaTri.includes(x))
        : d.phep === 'co' ? [...tatCa]
          : []
  if (con.length === tatCa.length) return {}
  if (!con.length) return 'rong'
  return con.length === 1 ? { gt: con[0] } : 'nhieu'
}

const lui1Ngay = (d: string) => new Date(Date.parse(`${d}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10)

/** Điều kiện ngày → `tu_ngay` / `den_ngay` (cả hai TÍNH CẢ ngày đó) của RPC; 'rong' = "trống" (cột ngày luôn có giá trị). */
export function khoangNgay(d: DieuKienLoc | undefined, homNay = homNayVN()): { tu?: string; den?: string } | 'rong' {
  if (!d) return {}
  const [a, b] = d.giaTri
  switch (d.phep) {
    case 'hom-nay': return { tu: homNay, den: homNay }
    case 'khoang': return { tu: a, den: b }
    case 'sau': return { tu: a }
    case 'truoc': return { den: lui1Ngay(a) }
    case 'trong': return 'rong'
    default: return {}
  }
}
