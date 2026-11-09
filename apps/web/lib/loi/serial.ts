/** Khuôn serial GWT — trùng khuôn bot_dong_bo_cts20_ghi (20 ký tự). */
export const MAU_SERIAL = /^[A-Z][0-9]{8}[A-Z0-9]{3}[0-9]{8}$/

export function chuanHoaSerial(s: string): string {
  return (s ?? '').toUpperCase().replace(/\s+/g, '')
}

/**
 * `daCo: true` = serial này đã có sẵn trong hệ thống (serial cũ có thể sai khuôn) → luôn chấp nhận.
 */
export function kiemDangSerial(
  s: string,
  opts: { daCo?: boolean } = {},
): { chuan: string; hopLe: boolean; loi: string | null } {
  const chuan = chuanHoaSerial(s)
  if (!chuan) return { chuan, hopLe: false, loi: null }
  if (opts.daCo) return { chuan, hopLe: true, loi: null }
  if (chuan.length !== 20) return { chuan, hopLe: false, loi: `Serial phải đủ 20 ký tự (đang có ${chuan.length}).` }
  if (!MAU_SERIAL.test(chuan)) return { chuan, hopLe: false, loi: 'Sai dạng: 1 chữ + 8 số + 3 chữ/số + 8 số.' }
  return { chuan, hopLe: true, loi: null }
}
