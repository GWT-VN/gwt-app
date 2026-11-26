import type { DongMay, LoiDanhMuc } from './kieu'
import { chuanMaLoi, MA_LOI } from './kiemDauVao'

export const CHUA_PHAN_LOAI = 'CHUA_PHAN_LOAI'

export function nhanDongMay(d: { internal_code: string | null; loi_code: string; loi_ten: string | null }): string {
  const may = d.internal_code?.trim() || 'Chưa rõ máy'
  return `${may} · ${tenLoiDong(d)}`
}

/**
 * Nội dung "Hướng xử lý đề xuất" — null = không hiện khối gợi ý. Chỉ hiện phương án CHUYÊN GIA ĐÃ DUYỆT
 * (huong_duyet, chị Trang 18/11) — mã lỗi đã duyệt thôi là chưa đủ.
 * Không bao giờ đổi trạng thái ticket. `loiCode` (tuỳ chọn): CHUA_PHAN_LOAI không bao giờ có gợi ý.
 */
export function goiYHuongXuLy(
  dong: Pick<DongMay, 'huong_xu_ly_nguon'>,
  loi: Pick<LoiDanhMuc, 'trang_thai' | 'huong_xu_ly' | 'huong_duyet'> | null,
  loiCode?: string,
): string | null {
  if (loiCode === CHUA_PHAN_LOAI) return null
  if (!loi || loi.trang_thai !== 'da_duyet' || loi.huong_duyet !== true) return null
  const nd = loi.huong_xu_ly?.trim()
  if (!nd) return null
  if (dong.huong_xu_ly_nguon) return null
  return nd
}

/** Tên lỗi để hiện (không kèm máy): tên danh mục, CHUA_PHAN_LOAI → "Chưa phân loại", không tên → mã. */
export const tenLoiDong = (d: { loi_code: string; loi_ten: string | null }) =>
  d.loi_ten?.trim() || (d.loi_code === CHUA_PHAN_LOAI ? 'Chưa phân loại' : d.loi_code)

/**
 * Dòng máy rút gọn cho bảng ticket (giữ thứ tự dòng). `nhan` = "máy · lỗi" (màn cũ, BangTicket); F dùng các trường
 * TÁCH RIÊNG (CEO 26/11 "tách loại lỗi ra khỏi mã máy"): `loi_ten` (cột Loại lỗi), `internal_code` (cột Máy cùng dòng),
 * `loi_code` (lọc / sửa tại ô), `id` (dòng máy để suaDongMay).
 */
export function tomTatMayTicket(
  dong: (Pick<DongMay, 'internal_code' | 'loi_code' | 'loi_ten' | 'serial' | 'source_serial'> & { id?: string })[],
): { nhan: string; serial: string | null; chuaPhanLoai: boolean; id?: string; loi_code: string; loi_ten: string; internal_code: string | null }[] {
  return dong.map((d) => ({
    nhan: nhanDongMay(d),
    serial: d.serial ?? d.source_serial ?? null,
    chuaPhanLoai: d.loi_code === CHUA_PHAN_LOAI,
    ...(d.id ? { id: d.id } : {}),
    loi_code: d.loi_code,
    loi_ten: tenLoiDong(d),
    internal_code: d.internal_code,
  }))
}

/** Chuẩn hoá tham số `?loi=`: loc=false -> không lọc; ma=null -> mã sai dạng (kết quả rỗng). */
export function locLoiHopLe(loiCode: string | undefined | null): { loc: false } | { loc: true; ma: string | null } {
  if (!loiCode || !loiCode.trim()) return { loc: false }
  const ma = chuanMaLoi(loiCode)
  return { loc: true, ma: MA_LOI.test(ma) ? ma : null }
}

/**
 * Vị trí dòng ĐẦU TIÊN có serial (chuỗi khác rỗng) — -1 nếu không có. Một định nghĩa duy nhất cho:
 * serial của ticket (tickets.serial/source_serial) VÀ dòng nào nhận vào dòng máy tự động (thu_tu 1).
 */
export function viTriDongCoSerial(dong: readonly ({ serial?: unknown } | null | undefined)[]): number {
  return dong.findIndex((d) => typeof d?.serial === 'string' && d.serial.trim() !== '')
}
