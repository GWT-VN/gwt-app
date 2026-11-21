// File THƯỜNG (không 'use client'): hàm thuần của TimeInput / DateTimePicker — màn server render ô hạn dùng được.
// Không `toISOString()` (UTC → lệch ngày giờ VN), xem bang/ngay.ts.
import { hienNgay, isoNgay, ngayTuIso } from '@/bang/ngay'

/** Giờ khi chỉ chọn ngày (R13 lát 7). CEO CHƯA chốt con số — đổi một chỗ ở đây. */
export const GIO_MAC_DINH = '17:30'
export const MUI_VN = '+07:00'

/** Gợi ý giờ mỗi 30 phút, 00:00 → 23:30. */
export const GOI_Y_GIO = Array.from({ length: 48 }, (_, i) => `${String(i >> 1).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)

const hai = (n: number) => String(n).padStart(2, '0')
const gioHopLe = (h: number, m: number) => (h >= 0 && h < 24 && m >= 0 && m < 60 ? `${hai(h)}:${hai(m)}` : null)

/**
 * Chữ gõ trong ô giờ → "HH:mm" | null. Nhận "1730", "17:30", "17h30", "17h", "17.30", "9" (→ 09:00), "930".
 * Phút một chữ số ("14:4") = chưa gõ xong → null.
 */
export function docGio(chu: string): string | null {
  const s = chu.trim().toLowerCase().replace(/\s+/g, '')
  let m = s.match(/^(\d{1,2})(?:[:h.](\d{2})?)?$/)
  if (m) return gioHopLe(Number(m[1]), Number(m[2] ?? 0))
  m = s.match(/^(\d{1,2})(\d{2})$/)
  if (m) return gioHopLe(Number(m[1]), Number(m[2]))
  return null
}

/**
 * Chữ gõ trong ô ngày → "YYYY-MM-DD" | null. Nhận "d/m", "d/m/yyyy" (dấu / - .). Thiếu năm: năm nay; đã qua thì năm
 * sau ("5/1" gõ tháng 11 = tháng 1 năm sau), TRỪ khi trùng `giu` (ngày của giá trị đang có). Ngày không có thật → null.
 */
export function docNgay(chu: string, nay: string, giu: string | null = null): string | null {
  const m = chu.trim().match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{4}))?$/)
  if (!m) return null
  let nam = m[3] ? Number(m[3]) : Number(nay.slice(0, 4))
  const ra = () => `${nam}-${hai(Number(m[2]))}-${hai(Number(m[1]))}`
  let iso = ra()
  if (!m[3] && iso < nay && iso !== giu) {
    nam++
    iso = ra()
  }
  return isoNgay(ngayTuIso(iso)) === iso ? iso : null // 31/02 → Date dồn sang 03/03 → khác chuỗi → null
}

/** "+07:00" → 420 (phút). */
const phutMui = (mui: string) => {
  const m = mui.match(/^([+-])(\d{2}):(\d{2})$/)
  return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0
}

/**
 * ISO bất kỳ múi (DB trả `…Z` / `+00:00`) → ngày + giờ theo múi `mui`. Cắt chuỗi thẳng sẽ sai khi giá trị không cùng múi
 * (07:30Z hiện thành 07:30 thay vì 14:30 giờ VN).
 */
export function tachIso(iso: string, mui = MUI_VN): { ngay: string; gio: string } {
  const d = new Date(Date.parse(iso) + phutMui(mui) * 60_000)
  return {
    ngay: `${d.getUTCFullYear()}-${hai(d.getUTCMonth() + 1)}-${hai(d.getUTCDate())}`,
    gio: `${hai(d.getUTCHours())}:${hai(d.getUTCMinutes())}`,
  }
}

/** "YYYY-MM-DD" + "HH:mm" → "YYYY-MM-DDTHH:mm:00+07:00" (ghép chuỗi). */
export const ghepIso = (ngay: string, gio: string, mui = MUI_VN) => `${ngay}T${gio}:00${mui}`

/** "21/11/2026 · 17:30" — ô form. */
export const hienNgayGio = (iso: string, mui = MUI_VN) => {
  const t = tachIso(iso, mui)
  return `${hienNgay(t.ngay)} · ${t.gio}`
}
/** "21/11 17:30" — ô bảng hẹp. */
export const hienNgayGioGon = (iso: string, mui = MUI_VN) => {
  const t = tachIso(iso, mui)
  return `${hienNgay(t.ngay).slice(0, 5)} ${t.gio}`
}
