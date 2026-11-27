// Trường lọc + tab của lịch bảo trì `/bao-tri` (khuôn Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). File
// THƯỜNG: maintenanceDue (server) lọc ở DB, BangBaoTri (client) dựng nút Lọc + tab. `tt` giữ tên + giá trị cũ.
import type { DieuKienLoc, KieuTruong } from '@/bang/locTruong'
import { chon, homNayVN, ngay } from '@/bang/locDb'
import { SAP } from '@/app/loi/truong-loi'

export { SAP }

/** Giá trị `tinh_trang` của v_maintenance_due (migration 07) + nhãn. */
export const TT_BAO_TRI = [
  { giaTri: SAP, nhan: 'Sắp đến hạn' },
  { giaTri: 'QUÁ HẠN', nhan: 'Quá hạn' },
  { giaTri: 'còn hạn', nhan: 'Còn hạn' },
  { giaTri: 'đã xong', nhan: 'Đã xong' },
  { giaTri: 'không rõ hạn', nhan: 'Không rõ hạn' },
]

export const TRUONG_BAO_TRI: { id: string; ten: string; kieu: KieuTruong; cot: string }[] = [
  { id: 'tt', ten: 'Tình trạng', kieu: 'chon', cot: 'tinh_trang' },
  { id: 'han', ten: 'Đến hạn', kieu: 'ngay', cot: 'due_date' },
]

export const KHOA_LOC_BAO_TRI = ['q', ...TRUONG_BAO_TRI.map((x) => x.id), 'cot', 'chieu']

/** Tab "Lịch tháng" không phải bộ lọc: `?view=lich` đổi bảng sang lịch tháng (LichBaoTriThang). */
export const VIEW_LICH = 'lich'

const tt = (v: string) => new URLSearchParams({ tt: v }).toString()
/** Tab cố định = các tab của màn cũ (Tất cả lên đầu theo khuôn F). */
export const TAB_BAO_TRI = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  { v: 'sap', ten: 'Sắp đến hạn', loc: tt(SAP) },
  { v: 'qua-han', ten: 'Quá hạn', loc: tt('QUÁ HẠN') },
  { v: 'con-han', ten: 'Còn hạn', loc: tt('còn hạn') },
  { v: 'xong', ten: 'Đã xong', loc: tt('đã xong') },
  { v: VIEW_LICH, ten: 'Lịch tháng', loc: '' },
]

/** Điều kiện lọc → nhóm `.or()` PostgREST trên v_maintenance_due. HÀM THUẦN. */
export function dieuKienBaoTri(d: DieuKienLoc, homNay = homNayVN()): string[] {
  const t = TRUONG_BAO_TRI.find((x) => x.id === d.truong)
  if (!t) return []
  return t.kieu === 'ngay' ? ngay(t.cot, d, homNay) : chon(t.cot, d)
}
