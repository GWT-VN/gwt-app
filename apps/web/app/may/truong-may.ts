// Trường lọc + tab của danh sách máy đã lắp `/` (khuôn Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). File
// THƯỜNG: searchMachines (server) lọc ở DB bằng `dieuKienMay`, BangMay (client) dựng nút Lọc + tab.
// Tham số URL giữ tên cũ `sp` / `bh` (link cũ `?sp=GN610`, `?bh=chua_kich_hoat` vẫn đúng — chọn "là" không tiền tố).
import { docDieuKien, type DieuKienLoc, type KieuTruong } from '@/bang/locTruong'
import { chon, homNayVN, ngay } from '@/bang/locDb'
import { NHAN_TINH_TRANG_BH, TINH_TRANG_BH, type TinhTrangBH } from '@/lib/danhSach'

export const TRUONG_MAY: { id: string; ten: string; kieu: KieuTruong }[] = [
  { id: 'sp', ten: 'Sản phẩm', kieu: 'chon' },
  { id: 'bh', ten: 'Bảo hành', kieu: 'chon' },
  { id: 'lap', ten: 'Ngày lắp', kieu: 'ngay' },
]

/** Tham số URL thuộc "bộ lọc" của tab: tìm + lọc trường + sắp. */
export const KHOA_LOC_MAY = ['q', ...TRUONG_MAY.map((x) => x.id), 'cot', 'chieu']

/** Màn cũ không có bộ lọc chọn sẵn → chỉ "Tất cả" (+ tab tự tạo). */
export const TAB_MAY = [{ v: 'tat-ca', ten: 'Tất cả', loc: '' }]

export const BH_MAY = TINH_TRANG_BH.map((k) => ({ giaTri: k, nhan: NHAN_TINH_TRANG_BH[k] }))

/** Bảo hành — cùng 4 nhánh của searchMachines cũ / WarrantyBadge. `khong` = phủ định ("không là"). */
const DK_BH: Record<TinhTrangBH, { co: string; khong: string }> = {
  chua_kich_hoat: { co: 'warranty_activated.eq.false', khong: 'warranty_activated.eq.true' },
  con_han_may: {
    co: 'and(warranty_activated.eq.true,co_chinh_sach_bh.eq.true,con_han_may.eq.true)',
    khong: 'not.and(warranty_activated.eq.true,co_chinh_sach_bh.eq.true,con_han_may.eq.true)',
  },
  het_may_con_loi: {
    co: 'and(warranty_activated.eq.true,co_chinh_sach_bh.eq.true,con_han_may.eq.false,con_han_loi.eq.true)',
    khong: 'not.and(warranty_activated.eq.true,co_chinh_sach_bh.eq.true,con_han_may.eq.false,con_han_loi.eq.true)',
  },
  het_ca_hai: {
    co: 'and(warranty_activated.eq.true,co_chinh_sach_bh.eq.true,con_han_may.eq.false,con_han_loi.eq.false)',
    khong: 'not.and(warranty_activated.eq.true,co_chinh_sach_bh.eq.true,con_han_may.eq.false,con_han_loi.eq.false)',
  },
}

/** Giá trị lạ trên URL bị bỏ (whitelist TINH_TRANG_BH như bản cũ). "Trống" = không máy nào (máy luôn có tình trạng BH). */
function baoHanh(d: DieuKienLoc): string[] {
  const gt = d.giaTri.filter((g): g is TinhTrangBH => g in DK_BH)
  if (d.phep === 'la') return gt.length ? [gt.map((g) => DK_BH[g].co).join(',')] : []
  // ponytail: "không là" = NOT(and(...)) — dòng có con_han_* NULL bị loại (SQL NULL); đổi sang phần bù nếu gặp ca đó.
  if (d.phep === 'khong-la') return gt.map((g) => DK_BH[g].khong)
  return d.phep === 'trong' ? ['serial.is.null'] : []
}

/** Điều kiện lọc → nhóm `.or()` PostgREST trên v_installed_base (nhiều nhóm = VÀ). HÀM THUẦN. */
export function dieuKienMay(d: DieuKienLoc, homNay = homNayVN()): string[] {
  if (d.truong === 'sp') return chon('internal_code', d)
  if (d.truong === 'bh') return baoHanh(d)
  if (d.truong === 'lap') return ngay('install_date', d, homNay)
  return []
}

const truocMotNgay = (d: string) => new Date(Date.parse(`${d}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10)

/**
 * Trường ngày (`lap` / `han`) → `ngtu`/`ngden` của các nút Xuất cũ (xuatMay / xuatLoi / xuatBaoTri giữ nguyên chữ ký).
 * Dùng chung 3 màn đợt 2 (Máy, Lõi, Bảo trì). ponytail: phép "trống" không có ở ngtu/ngden → xuất không lọc ngày.
 */
export function khoangXuat(gt: string | undefined, homNay = homNayVN()): { ngtu?: string; ngden?: string } {
  const d = docDieuKien(gt, 'ngay')
  if (!d) return {}
  const [a, b] = d.giaTri
  if (d.phep === 'khoang') return { ngtu: a, ngden: b }
  if (d.phep === 'hom-nay') return { ngtu: homNay, ngden: homNay }
  if (d.phep === 'sau') return { ngtu: a }
  if (d.phep === 'truoc') return { ngden: truocMotNgay(a) }
  return {}
}
