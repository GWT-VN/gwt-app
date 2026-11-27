// Trường lọc + tab của Danh mục lỗi (khuôn Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). File THƯỜNG:
// page (server) lọc trong bộ nhớ (danh mục tải trọn) bằng cùng định nghĩa, DanhMucLoiBang (client) dựng nút Lọc + tab.
import type { KieuTruong } from '@/bang/locTruong'

export const TT_LOI = [
  { giaTri: 'cho_duyet', nhan: 'Chờ duyệt' },
  { giaTri: 'da_duyet', nhan: 'Đã duyệt' },
  { giaTri: 'ngung', nhan: 'Ngừng dùng' },
]

/** `tt` — cùng tham số với ô "Trạng thái" (BoLocChon) cũ. */
export const TRUONG_DANH_MUC_LOI: { id: string; ten: string; kieu: KieuTruong }[] = [
  { id: 'tt', ten: 'Trạng thái', kieu: 'chon' },
]

export const KHOA_LOC_DANH_MUC_LOI = ['q', ...TRUONG_DANH_MUC_LOI.map((x) => x.id)]

/** Tab cố định: "Tất cả" + từng trạng thái (bộ lọc chọn sẵn của ô Trạng thái cũ). */
export const TAB_DANH_MUC_LOI = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  ...TT_LOI.map((t) => ({ v: t.giaTri, ten: t.nhan, loc: `tt=${t.giaTri}` })),
]
