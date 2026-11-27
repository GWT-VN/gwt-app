// Trường lọc + tab của bảng Nhân viên (khuôn Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). Danh sách nhân sự
// nhỏ (vài chục người) → page lọc trong bộ nhớ bằng `apLoc`; hai trường = hai cột đang hiện (Trạng thái, Vai trò).
import type { KieuTruong } from '@/bang/locTruong'

export const TRUONG_NV: { id: string; ten: string; kieu: KieuTruong }[] = [
  { id: 'tt', ten: 'Trạng thái', kieu: 'chon' },
  { id: 'vt', ten: 'Vai trò', kieu: 'chon' },
]
export const TRANG_THAI_NV = [
  { giaTri: 'hoat-dong', nhan: 'Đang hoạt động' },
  { giaTri: 'khoa', nhan: 'Đã khoá' },
]
export const KHOA_LOC_NV = ['q', 'tt', 'vt']
/** "Chưa gán vai trò" = người mới đăng nhập @gwt.vn lần đầu (đang khoá, chưa tích vai trò) — việc admin phải làm. */
export const TAB_NV = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  { v: 'hoat-dong', ten: 'Đang hoạt động', loc: 'tt=hoat-dong' },
  { v: 'khoa', ten: 'Đã khoá', loc: 'tt=khoa' },
  { v: 'chua-vai-tro', ten: 'Chưa gán vai trò', loc: 'vt=trong~', nguy: true },
]
