// Trường lọc + tab của lịch thay lõi `/loi` (khuôn Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). File THƯỜNG:
// coreForecast (server) lọc ở DB, BangLoi (client) dựng nút Lọc + tab. `tt` giữ tên + giá trị cũ (link `?tt=QUÁ HẠN` vẫn đúng).
import type { DieuKienLoc, KieuTruong } from '@/bang/locTruong'
import { chon, homNayVN, ngay } from '@/bang/locDb'

export const SAP = 'sắp đến hạn (≤30 ngày)'

/** Giá trị `tinh_trang` của v_core_forecast (migration 00_init) + nhãn. */
export const TT_LOI = [
  { giaTri: SAP, nhan: 'Sắp đến hạn' },
  { giaTri: 'QUÁ HẠN', nhan: 'Quá hạn' },
  { giaTri: 'còn hạn', nhan: 'Còn hạn' },
  { giaTri: 'không rõ (máy thiếu ngày lắp)', nhan: 'Không rõ (máy thiếu ngày lắp)' },
]

export const TRUONG_LOI: { id: string; ten: string; kieu: KieuTruong; cot: string }[] = [
  { id: 'tt', ten: 'Tình trạng', kieu: 'chon', cot: 'tinh_trang' },
  { id: 'han', ten: 'Đến hạn', kieu: 'ngay', cot: 'han_som' },
]

export const KHOA_LOC_LOI = ['q', ...TRUONG_LOI.map((x) => x.id), 'cot', 'chieu']

const tt = (v: string) => new URLSearchParams({ tt: v }).toString()
/** Tab cố định = 3 tab tình trạng của màn cũ (có số đếm). */
export const TAB_LOI = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  { v: 'sap', ten: 'Sắp đến hạn', loc: tt(SAP) },
  { v: 'qua-han', ten: 'Quá hạn', loc: tt('QUÁ HẠN') },
  { v: 'con-han', ten: 'Còn hạn', loc: tt('còn hạn') },
]

/** Điều kiện lọc → nhóm `.or()` PostgREST trên v_core_forecast. HÀM THUẦN. */
export function dieuKienLoi(d: DieuKienLoc, homNay = homNayVN()): string[] {
  const t = TRUONG_LOI.find((x) => x.id === d.truong)
  if (!t) return []
  return t.kieu === 'ngay' ? ngay(t.cot, d, homNay) : chon(t.cot, d)
}
