/**
 * Màn nào có hàng tab tự tạo (khuôn bảng Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md): khoá `bang_view.bang`
 * → tham số URL thuộc "bộ lọc" của tab (lọc + tìm + sắp; cột luôn kèm `KHOA_COT`) + đường dẫn cần làm mới.
 * Server action chỉ nhận khoá có ở đây (chặn ghi `bang_view` tuỳ ý) và chỉ lưu đúng các tham số này.
 * Thêm một màn = thêm một dòng.
 */
import { KHOA_LOC_KHACH } from '@/app/khach-hang/truong-khach'
import { KHOA_LOC_CHO_DUYET, KHOA_LOC_LICH_SU, KHOA_LOC_NHAT_KY, KHOA_LOC_TON } from '@/app/kho/truong-kho'
import { KHOA_LOC_NV } from '@/app/nhan-vien/truong-nhan-vien'
import { KHOA_LOC_AUDIT } from '@/app/audit/truong-audit'
import { KHOA_LOC_MAY } from '@/app/may/truong-may'
import { KHOA_LOC_LOI } from '@/app/loi/truong-loi'
import { KHOA_LOC_BAO_TRI } from '@/app/bao-tri/truong-bao-tri'
import { KHOA_LOC_CTKM, KHOA_LOC_DON, KHOA_LOC_GIA, KHOA_LOC_KHACH_SALES } from '@/app/sales/truong-sales'
import { KHOA_LOC as KHOA_LOC_TICKET } from '@/app/ticket/_danh-sach/truong-f'
import { KHOA_LOC_HOOK, KHOA_LOC_VIDEO, KHOA_LOC_Y_TUONG } from '@/app/wiki/marketing/du-lieu/truong-mkt'
import { KHOA_LOC_SERIAL } from '@/app/serial/truong-serial'
import { KHOA_LOC_BH } from '@/app/bh-cho-kich-hoat/truong-bh'
import { KHOA_LOC_NHOM_LOI } from '@/app/nhom-loi/truong-nhom-loi'
import { KHOA_LOC_DANH_MUC_LOI } from '@/app/danh-muc-loi/truong-danh-muc-loi'
import { KHOA_LOC_KHACH_DON } from '@/app/khach/truong-khach-don'
import { KHOA_LOC_KENH } from '@/app/khach/kenh/truong-kenh'
import { KHOA_LOC_NUOC } from '@/app/nuoc/truong-nuoc'

export const TAB_VIEW = {
  ticket_tab: { khoaLoc: KHOA_LOC_TICKET, duongDan: '/ticket' },
  khach_tab: { khoaLoc: KHOA_LOC_KHACH, duongDan: '/khach-hang' },
  kho_ton_tab: { khoaLoc: KHOA_LOC_TON, duongDan: '/kho' },
  kho_nhat_ky_tab: { khoaLoc: KHOA_LOC_NHAT_KY, duongDan: '/kho/nhat-ky' },
  kho_cho_duyet_tab: { khoaLoc: KHOA_LOC_CHO_DUYET, duongDan: '/kho/cho-duyet' },
  kho_lich_su_tab: { khoaLoc: KHOA_LOC_LICH_SU, duongDan: '/kho/lich-su-sua' },
  nhan_vien_tab: { khoaLoc: KHOA_LOC_NV, duongDan: '/nhan-vien' },
  audit_tab: { khoaLoc: KHOA_LOC_AUDIT, duongDan: '/audit' },
  may_tab: { khoaLoc: KHOA_LOC_MAY, duongDan: '/' },
  loi_tab: { khoaLoc: KHOA_LOC_LOI, duongDan: '/loi' },
  bao_tri_tab: { khoaLoc: KHOA_LOC_BAO_TRI, duongDan: '/bao-tri' },
  sales_don_tab: { khoaLoc: KHOA_LOC_DON, duongDan: '/sales' },
  sales_khach_tab: { khoaLoc: KHOA_LOC_KHACH_SALES, duongDan: '/sales/khach' },
  sales_gia_tab: { khoaLoc: KHOA_LOC_GIA, duongDan: '/sales/gia' },
  sales_ctkm_tab: { khoaLoc: KHOA_LOC_CTKM, duongDan: '/sales/ctkm' },
  mkt_video_tab: { khoaLoc: KHOA_LOC_VIDEO, duongDan: '/wiki/marketing/du-lieu/phan-tich-video' },
  mkt_hook_tab: { khoaLoc: KHOA_LOC_HOOK, duongDan: '/wiki/marketing/du-lieu/kho-hook' },
  mkt_y_tuong_tab: { khoaLoc: KHOA_LOC_Y_TUONG, duongDan: '/wiki/marketing/du-lieu/video-ideas' },
  serial_tab: { khoaLoc: KHOA_LOC_SERIAL, duongDan: '/serial' },
  bh_cho_tab: { khoaLoc: KHOA_LOC_BH, duongDan: '/bh-cho-kich-hoat' },
  nhom_loi_tab: { khoaLoc: KHOA_LOC_NHOM_LOI, duongDan: '/nhom-loi' },
  danh_muc_loi_tab: { khoaLoc: KHOA_LOC_DANH_MUC_LOI, duongDan: '/danh-muc-loi' },
  khach_don_tab: { khoaLoc: KHOA_LOC_KHACH_DON, duongDan: '/khach' },
  kenh_tab: { khoaLoc: KHOA_LOC_KENH, duongDan: '/khach/kenh' },
  nuoc_tab: { khoaLoc: KHOA_LOC_NUOC, duongDan: '/nuoc' },
} satisfies Record<string, { khoaLoc: string[]; duongDan: string }>

export type BangTab = keyof typeof TAB_VIEW
export const laBangTab = (x: unknown): x is BangTab => typeof x === 'string' && Object.hasOwn(TAB_VIEW, x)
