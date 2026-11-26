// File THƯỜNG (không 'use client'): hàm thuần của TimeInput / DateTimePicker — màn server render ô hạn dùng được.
// Không `toISOString()` (UTC → lệch ngày giờ VN), xem bang/ngay.ts.
import { hienNgay, isoNgay, ngayTuIso } from '@/bang/ngay'

// Giá trị ngày giờ có HAI dạng (CEO 22/11 — "chọn ngày không thì chỉ hiển thị ngày, không tự chọn giờ"; thay R13 17:30):
// chỉ ngày `YYYY-MM-DD` (không giờ, không múi) · có giờ = ISO có múi `YYYY-MM-DDTHH:mm:00+07:00`.

/** Mục sáng sẵn của danh sách gợi ý khi ô giờ trống — chỉ là chỗ đứng để ↑/↓, KHÔNG tự gán vào giá trị. */
export const GIO_GOI_Y_DAU = '17:30'
export const MUI_VN = '+07:00'

/** Giá trị chỉ có ngày ("YYYY-MM-DD")? */
export const laChiNgay = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v)

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
 * Giá trị → ngày + giờ theo múi `mui`; chỉ ngày → `gio: null` (không đổi múi — ngày lịch không có múi). ISO bất kỳ múi
 * (DB trả `…Z` / `+00:00`) được đổi về `mui`: cắt chuỗi thẳng thì 07:30Z hiện thành 07:30 thay vì 14:30 giờ VN.
 */
export function tachIso(v: string, mui = MUI_VN): { ngay: string; gio: string | null } {
  if (laChiNgay(v)) return { ngay: v, gio: null }
  const d = new Date(Date.parse(v) + phutMui(mui) * 60_000)
  return {
    ngay: `${d.getUTCFullYear()}-${hai(d.getUTCMonth() + 1)}-${hai(d.getUTCDate())}`,
    gio: `${hai(d.getUTCHours())}:${hai(d.getUTCMinutes())}`,
  }
}

/** "YYYY-MM-DD" + "HH:mm" → "YYYY-MM-DDTHH:mm:00+07:00" (ghép chuỗi); không giờ → giữ nguyên "YYYY-MM-DD". */
export const ghepIso = (ngay: string, gio: string | null, mui = MUI_VN) => (gio ? `${ngay}T${gio}:00${mui}` : ngay)

/** "21/11 · 17:30" — ô form; chỉ ngày → "21/11"; khác năm → "21/11/25 · 17:30" (mặc định `hienNgay`, CEO 26/11). */
export const hienNgayGio = (v: string, mui = MUI_VN) => {
  const t = tachIso(v, mui)
  return t.gio ? `${hienNgay(t.ngay)} · ${t.gio}` : hienNgay(t.ngay)
}
/** "21/11 17:30" — ô bảng hẹp; chỉ ngày → "21/11"; khác năm → "21/11/25 17:30". */
export const hienNgayGioGon = (v: string, mui = MUI_VN) => {
  const t = tachIso(v, mui)
  const n = hienNgay(t.ngay)
  return t.gio ? `${n} ${t.gio}` : n
}
