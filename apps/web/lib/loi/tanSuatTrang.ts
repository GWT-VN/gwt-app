/** Hàm thuần cho trang /bao-cao-loi: khoảng tháng mặc định (giờ VN), chuẩn hoá tham số URL, lọc, định dạng. */
import type { DongCa } from './tanSuat'

export const TOI_DA_THANG = 36
const RE_THANG = /^(\d{4})-(0[1-9]|1[0-2])$/

export function chuanThang(v: string | undefined | null): string | null {
  return typeof v === 'string' && RE_THANG.test(v) ? v : null
}

const thangStr = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}`

/** 6 tháng gần nhất (gồm tháng hiện tại) theo giờ Việt Nam (UTC+7). */
export function khoangMacDinh(now: Date): { tu: string; den: string } {
  const vn = new Date(now.getTime() + 7 * 3_600_000)
  const y = vn.getUTCFullYear(), m = vn.getUTCMonth() + 1
  const t = y * 12 + (m - 1) - 5
  return { tu: thangStr(Math.floor(t / 12), (t % 12) + 1), den: thangStr(y, m) }
}

/** Liệt kê tháng tu..den; rỗng nếu đảo ngược; chặn tối đa 36 tháng (lấy các tháng cuối). */
export function danhSachThang(tu: string, den: string): string[] {
  if (tu > den) return []
  const [y1, m1] = tu.split('-').map(Number), [y2, m2] = den.split('-').map(Number)
  const dau = y1 * 12 + (m1 - 1), cuoi = y2 * 12 + (m2 - 1)
  const bat = Math.max(dau, cuoi - TOI_DA_THANG + 1)
  const ra: string[] = []
  for (let t = bat; t <= cuoi; t++) ra.push(thangStr(Math.floor(t / 12), (t % 12) + 1))
  return ra
}

export function locCa<T extends Pick<DongCa, 'nhom' | 'internal_code' | 'loi_code'>>(ca: T[], f: { nhom?: string; may?: string; loi?: string }): T[] {
  return ca.filter((c) => (!f.nhom || c.nhom === f.nhom) && (!f.may || c.internal_code === f.may) && (!f.loi || c.loi_code === f.loi))
}

const so = (n: number) => String(n).replace('.', ',')
export const hienTyLe = (n: number | null) => (n == null ? '—' : `${so(n)}%`)
export const hienNgayChay = (n: number | null) => (n == null ? '—' : `${so(Math.round(n * 10) / 10)} ngày`)
