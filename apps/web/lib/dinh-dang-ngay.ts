/**
 * Định dạng NGÀY dùng chung toàn app (CEO 26/11: "Đổi luôn sang dd/MM/yy cho toàn app" + "cho phép chọn định dạng date ở
 * ô label cột" + "mặc định dd/mm đi"). Mọi chỗ hiện ngày gọi `hienNgay` — không `toLocaleDateString` / ghép chuỗi rải rác.
 * Giờ Việt Nam (Asia/Ho_Chi_Minh) cố định, không theo máy người xem. Chuỗi ngày thuần 'YYYY-MM-DD' là NGÀY LỊCH (không
 * đổi múi giờ); chuỗi có giờ / Date là một thời điểm → quy về giờ VN.
 * File thường (không 'use client'): server lẫn client dùng được.
 */
export type KieuNgay = 'ngay-thang' | 'ngan' | 'day-du' | 'gio' | 'tuong-doi'

/** Thứ tự = thứ tự trong menu "Định dạng ngày" của tiêu đề cột. `vd` = ví dụ hiện cạnh tên. */
export const KIEU_NGAY: { kieu: KieuNgay; nhan: string; vd: string }[] = [
  { kieu: 'ngay-thang', nhan: 'Ngày/tháng', vd: '14/08' },
  { kieu: 'ngan', nhan: 'Ngày ngắn', vd: '14/08/24' },
  { kieu: 'day-du', nhan: 'Ngày đủ năm', vd: '14/08/2024' },
  { kieu: 'gio', nhan: 'Ngày giờ', vd: '14/08/24 09:05' },
  { kieu: 'tuong-doi', nhan: 'Tương đối', vd: '3 ngày trước' },
]
export const KIEU_NGAY_MAC_DINH: KieuNgay = 'ngay-thang'
export const laKieuNgay = (x: string): x is KieuNgay => KIEU_NGAY.some((k) => k.kieu === x)

const VN = 'Asia/Ho_Chi_Minh'
const NGAY_THUAN = /^\d{4}-\d{2}-\d{2}$/
const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: VN,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

type Phan = { y: string; m: string; d: string; h: string | null; p: string | null }

function tach(v: string | Date): Phan | null {
  if (typeof v === 'string' && NGAY_THUAN.test(v)) {
    const [y, m, d] = v.split('-')
    return { y, m, d, h: null, p: null }
  }
  const t = typeof v === 'string' ? new Date(v) : v
  if (Number.isNaN(t.getTime())) return null
  const o = Object.fromEntries(fmt.formatToParts(t).map((x) => [x.type, x.value]))
  return { y: o.year, m: o.month, d: o.day, h: o.hour, p: o.minute }
}

/** Số ngày lịch (giờ VN) từ `v` tới `bayGio`: 0 = hôm nay, 1 = hôm qua, -1 = ngày mai. */
function cachNgay(a: Phan, bayGio: Date): number {
  const b = tach(bayGio)!
  const ngay = (x: Phan) => Date.UTC(Number(x.y), Number(x.m) - 1, Number(x.d))
  return Math.round((ngay(b) - ngay(a)) / 86_400_000)
}

/**
 * Hiện ngày theo `kieu` (mặc định dd/MM; KHÁC năm hiện tại thì dd/MM/yy để không nhầm năm — như Gmail). Trống / không
 * đọc được → `rong` ('—').
 * 'gio' với ngày thuần (không có giờ) → như 'ngan'. 'tuong-doi' quá 30 ngày → như 'ngan' (con số tương đối xa vô nghĩa).
 */
export function hienNgay(
  v: string | Date | null | undefined,
  kieu: KieuNgay = KIEU_NGAY_MAC_DINH,
  { rong = '—', bayGio = new Date() }: { rong?: string; bayGio?: Date } = {},
): string {
  if (v == null || v === '') return rong
  const x = tach(v)
  if (!x) return rong
  const ngan = `${x.d}/${x.m}/${x.y.slice(2)}`
  if (kieu === 'ngay-thang') return x.y === tach(bayGio)!.y ? `${x.d}/${x.m}` : ngan
  if (kieu === 'day-du') return `${x.d}/${x.m}/${x.y}`
  if (kieu === 'gio') return x.h ? `${ngan} ${x.h}:${x.p}` : ngan
  if (kieu === 'tuong-doi') {
    const n = cachNgay(x, bayGio)
    if (Math.abs(n) > 30) return ngan
    if (n === 0) return 'Hôm nay'
    if (n === 1) return 'Hôm qua'
    if (n === -1) return 'Ngày mai'
    return n > 0 ? `${n} ngày trước` : `${-n} ngày nữa`
  }
  return ngan
}
