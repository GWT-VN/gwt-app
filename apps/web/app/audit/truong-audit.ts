// Trường lọc + tab của Nhật ký thao tác /audit (khuôn Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). `cot` =
// cột audit_log lọc ở DB (bang/locDb). Kết quả chỉ có hai giá trị ghi bởi `ghiAudit` (lib/nen-tang/nhat-ky.ts).
import type { KieuTruong } from '@/bang/locTruong'

export const TRUONG_AUDIT: { id: string; ten: string; kieu: KieuTruong; cot: string }[] = [
  { id: 'kq', ten: 'Kết quả', kieu: 'chon', cot: 'ket_qua' },
  { id: 'luc', ten: 'Lúc', kieu: 'ngay', cot: 'luc' },
]
export const KET_QUA_AUDIT = [
  { giaTri: 'ok', nhan: 'ok' },
  { giaTri: 'loi', nhan: 'loi' },
]
export const KHOA_LOC_AUDIT = ['q', ...TRUONG_AUDIT.map((x) => x.id)]
export const TAB_AUDIT = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  { v: 'loi', ten: 'Lỗi', loc: 'kq=loi', nguy: true },
]
