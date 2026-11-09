import type { DongMay, LoiDanhMuc } from './kieu'

export const CHUA_PHAN_LOAI = 'CHUA_PHAN_LOAI'

export function nhanDongMay(d: { internal_code: string | null; loi_code: string; loi_ten: string | null }): string {
  const may = d.internal_code?.trim() || 'Chưa rõ máy'
  const loi = d.loi_ten?.trim() || (d.loi_code === CHUA_PHAN_LOAI ? 'Chưa phân loại' : d.loi_code)
  return `${may} · ${loi}`
}

/**
 * Nội dung "Hướng xử lý đề xuất (theo danh mục lỗi)" — null = không hiện khối gợi ý.
 * Không bao giờ đổi trạng thái ticket. `loiCode` (tuỳ chọn): CHUA_PHAN_LOAI không bao giờ có gợi ý.
 */
export function goiYHuongXuLy(
  dong: Pick<DongMay, 'huong_xu_ly_nguon'>,
  loi: Pick<LoiDanhMuc, 'trang_thai' | 'huong_xu_ly'> | null,
  loiCode?: string,
): string | null {
  if (loiCode === CHUA_PHAN_LOAI) return null
  if (!loi || loi.trang_thai !== 'da_duyet') return null
  const nd = loi.huong_xu_ly?.trim()
  if (!nd) return null
  if (dong.huong_xu_ly_nguon) return null
  return nd
}

/** Dòng máy rút gọn cho cột "Máy" ở bảng ticket (giữ thứ tự dòng). */
export function tomTatMayTicket(
  dong: Pick<DongMay, 'internal_code' | 'loi_code' | 'loi_ten' | 'serial' | 'source_serial'>[],
): { nhan: string; serial: string | null }[] {
  return dong.map((d) => ({ nhan: nhanDongMay(d), serial: d.serial ?? d.source_serial ?? null }))
}
