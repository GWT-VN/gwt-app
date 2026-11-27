/** Hàm thuần cho khối "Máy & lỗi" ở chi tiết ticket (không đụng trạng thái ticket). */
import type { DongMay, LoiDanhMuc, TrangThaiDong } from './kieu'

export const CHIP_TRANG_THAI: Record<TrangThaiDong, { nhan: string; lop: string }> = {
  cho_xu_ly: { nhan: 'Chờ xử lý', lop: 'bg-(--color-background-info-surface) text-(--color-text-info)' },
  dang_xu_ly: { nhan: 'Đang xử lý', lop: 'bg-(--color-background-warning-surface) text-(--color-text-warning)' },
  da_xu_ly: { nhan: 'Đã xử lý', lop: 'bg-(--color-background-success-surface) text-(--color-text-success)' },
  khong_loi: { nhan: 'Không phải lỗi', lop: 'bg-muted text-muted-foreground' },
}
export const chipTrangThai = (t: TrangThaiDong) => CHIP_TRANG_THAI[t]

export const nhanNguonHuongXuLy = (n: DongMay['huong_xu_ly_nguon']): string => (n === 'danh_muc' ? 'theo danh mục' : 'CS ghi')

/** CSKH_NGUON=md: dòng máy là các lần lỗi MD (id của MD) → không ghi ticket_may ST (ghi vào là mất / "Không thấy dòng máy"). */
export const DONG_MAY_CHI_XEM_MD = 'Máy & lỗi đang lấy từ các lần lỗi (Masterdata) — chỉ xem. Sửa ở thẻ lần lỗi.'

export const DONG_CUOI = 'Ticket phải còn ít nhất một dòng máy.'
export const coTheBoDong = (soDong: number): { duocBo: boolean; goiY: string | null } =>
  soDong > 1 ? { duocBo: true, goiY: null } : { duocBo: false, goiY: DONG_CUOI }

/** Nội dung CS bấm Xác nhận: giữ nguyên gợi ý -> 'danh_muc'; sửa (hoặc không có gợi ý) -> 'cs'; trống -> null. */
export function quyetDinhXacNhan(nd: string, goiY: string | null): { noiDung: string; tuDanhMuc: boolean } | null {
  const t = nd.trim()
  if (!t) return null
  return { noiDung: t, tuDanhMuc: goiY != null && t === goiY.trim() }
}

/** Mã lỗi cho ô chọn: bỏ mã ngưng, trừ mã dòng đang dùng. */
export const dsLoiChon = (ds: LoiDanhMuc[], hienTai: string): LoiDanhMuc[] =>
  ds.filter((l) => l.trang_thai !== 'ngung' || l.code === hienTai)
