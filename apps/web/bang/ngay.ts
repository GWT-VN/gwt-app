/**
 * Khoảng ngày cho preset lọc. Hàm THUẦN — không React, không DB, test được.
 *
 * ⚠️ KHÔNG dùng `toISOString()`: nó trả giờ UTC, nên từ 00:00–07:00 giờ VN sẽ ra
 * NGÀY HÔM TRƯỚC. Preset "Hôm nay" khi đó sai âm thầm, không ai phát hiện.
 * `ngay.test.ts` có một test chứng minh đúng cái bẫy này.
 */
import { hienNgay as hienNgayLib } from '../lib/dinh-dang-ngay'

export type MaPreset = 'homnay' | 'tuannay' | 'thangnay' | 'ngay30'

export const PRESETS: { ma: MaPreset; nhan: string }[] = [
  { ma: 'homnay', nhan: 'Hôm nay' },
  { ma: 'tuannay', nhan: 'Tuần này' },
  { ma: 'thangnay', nhan: 'Tháng này' },
  { ma: 'ngay30', nhan: '30 ngày' },
]

/** Date -> 'YYYY-MM-DD' theo giờ MÁY. */
export function isoNgay(d: Date): string {
  const th = String(d.getMonth() + 1).padStart(2, '0')
  const ng = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${th}-${ng}`
}

/**
 * 'YYYY-MM-DD' -> Date 00:00 theo giờ MÁY. KHÔNG dùng `new Date('YYYY-MM-DD')`: chuỗi chỉ có ngày bị đọc là UTC →
 * ở múi giờ âm ra ngày hôm trước.
 * Chuỗi dài hơn (timestamp 'YYYY-MM-DDTHH:mm…') chỉ lấy 10 ký tự đầu — CẮT, không đổi múi giờ: timestamp UTC ('…Z')
 * phải đổi sang giờ VN trước khi đưa vào.
 */
export function ngayTuIso(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * 'YYYY-MM-DD' -> chữ hiện theo mặc định toàn app (`lib/dinh-dang-ngay`: dd/MM cùng năm, dd/MM/yy khác năm — CEO 26/11).
 * Chuỗi dài hơn: lấy 10 ký tự đầu như `ngayTuIso` (CẮT, không đổi múi giờ). Ô GÕ ngày không dùng hàm này — chữ gõ phải
 * đọc lại được bằng `docNgay`, dùng `hienNgayLib(iso, 'day-du')`.
 */
export const hienNgay = (iso: string): string => hienNgayLib(iso.slice(0, 10))

/**
 * Khoảng [tu, den] của một preset. Tuần bắt đầu THỨ 2.
 *
 * Dùng `new Date(y, m, d - n)` — Date tự dồn tháng/năm — chứ KHÔNG trừ mili-giây
 * (`- n * 864e5`): trừ mili-giây sai vào ngày đổi giờ. VN không đổi giờ, nhưng gói
 * `bang/` được thiết kế để chép nguyên sang project khác.
 */
export function khoangPreset(ma: MaPreset, homNay: Date): { tu: string; den: string } {
  const den = isoNgay(homNay)
  const y = homNay.getFullYear()
  const m = homNay.getMonth()
  const d = homNay.getDate()
  switch (ma) {
    case 'homnay':
      return { tu: den, den }
    case 'tuannay': {
      const lui = (homNay.getDay() + 6) % 7 // Thứ 2 = 0, Chủ nhật = 6
      return { tu: isoNgay(new Date(y, m, d - lui)), den }
    }
    case 'thangnay':
      return { tu: isoNgay(new Date(y, m, 1)), den }
    case 'ngay30':
      return { tu: isoNgay(new Date(y, m, d - 30)), den }
  }
}

/** 'YYYY-MM-DD' kẹp vào [min, max] (so chuỗi ISO = so ngày). DateRangePicker dùng lại. */
export const kepNgay = (iso: string, min?: string, max?: string) =>
  min && iso < min ? min : max && iso > max ? max : iso

/** Khoảng ngày 'YYYY-MM-DD' (tính cả 2 đầu) — giá trị của DateRangePicker. */
export type KhoangNgay = { tu: string; den: string }

/** "01/11/2026 – 18/11/2026"; khoảng 1 ngày chỉ hiện 1 ngày. */
export const hienKhoang = (k: KhoangNgay) => (k.tu === k.den ? hienNgay(k.tu) : `${hienNgay(k.tu)} – ${hienNgay(k.den)}`)
