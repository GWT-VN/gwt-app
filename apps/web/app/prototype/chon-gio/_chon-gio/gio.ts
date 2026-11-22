// PROTOTYPE vứt đi — hàm thuần cho 3 cách chọn ngày + giờ. Không `toISOString()` (UTC → lệch ngày giờ VN).
import { hienNgay, isoNgay, ngayTuIso } from '@/bang/ngay'
import { boDau } from '@/bang/timkiem'

/** Chỉ chọn ngày, chưa chọn giờ → giờ này. Tạm — chờ CEO chốt. */
export const GIO_MAC_DINH = '17:30'

/** Gợi ý giờ mỗi 30 phút, 00:00 → 23:30. */
export const GOI_Y_GIO = Array.from({ length: 48 }, (_, i) => `${String(i >> 1).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)

const hai = (n: number) => String(n).padStart(2, '0')
const gioHopLe = (h: number, m: number) => (h >= 0 && h < 24 && m >= 0 && m < 60 ? `${hai(h)}:${hai(m)}` : null)

/** "YYYY-MM-DD" + "HH:mm" → "YYYY-MM-DDTHH:mm:00+07:00" (giờ VN, ghép chuỗi). */
export const ghepIso = (ngay: string, gio: string) => `${ngay}T${gio}:00+07:00`
export const ngayCua = (iso: string) => iso.slice(0, 10)
export const gioCua = (iso: string) => iso.slice(11, 16)

/** Hôm nay / cộng n ngày, dạng "YYYY-MM-DD" theo giờ máy. */
export function congNgay(iso: string, n: number) {
  const d = ngayTuIso(iso)
  return isoNgay(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n))
}
export const homNay = () => isoNgay(new Date())

/** Cột giờ A2: 07:00 → 21:00 mỗi 30 phút. */
export const GIO_COT = GOI_Y_GIO.slice(14, 43)

/** Lịch: tắt ngày trước hôm nay, TRỪ ngày của hạn đang có (hạn cũ đã qua vẫn hiện + chọn lại được). */
export const chanQua = (nay: string, giu: string | null) => (d: Date) => {
  const s = isoNgay(d)
  return s < nay && s !== giu
}

const THU = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
export const tenThu = (ngay: string) => THU[ngayTuIso(ngay).getDay()]

/** T2…T7, CN. */
export const thuNgan = (ngay: string) => {
  const t = ngayTuIso(ngay).getDay()
  return t === 0 ? 'CN' : `T${t + 1}`
}
/** Kết quả mốc (A5): hôm nay → "17:30"; trong 6 ngày → "T7 09:00"; xa hơn → "27/11 17:30". */
export const hienMoc = (iso: string, nay: string) =>
  ngayCua(iso) === nay ? gioCua(iso) : ngayCua(iso) <= congNgay(nay, 6) ? `${thuNgan(ngayCua(iso))} ${gioCua(iso)}` : hienGon(iso)

/** Hạn chỉ có ngày ("YYYY-MM-DD", CEO 22/11 — DateTimePicker không tự gán giờ). */
const chiNgay = (iso: string) => iso.length === 10
/** "21/11/2026 · 17:30"; chỉ ngày → "21/11/2026". */
export const hienDay = (iso: string) => (chiNgay(iso) ? hienNgay(iso) : `${hienNgay(iso)} · ${gioCua(iso)}`)
/** "Thứ Sáu 21/11/2026 · 17:30" */
export const hienThu = (iso: string) => `${tenThu(ngayCua(iso))} ${hienDay(iso)}`
/** "21/11 17:30" — ô bảng hẹp; chỉ ngày → "21/11". */
export const hienGon = (iso: string) => (chiNgay(iso) ? hienNgay(iso).slice(0, 5) : `${hienNgay(iso).slice(0, 5)} ${gioCua(iso)}`)

/** Thứ (0 = CN … 6 = T7) kế tiếp, SAU hôm nay (hôm nay là Thứ Hai → Thứ Hai tuần sau). */
export function thuToi(tu: string, thu: number) {
  const n = (thu - ngayTuIso(tu).getDay() + 7) % 7 || 7
  return congNgay(tu, n)
}

/**
 * Chữ giờ gõ trong ô giờ → "HH:mm" | null. Nhận "1730", "17:30", "17h30", "17h", "17.30", "9" (→ 09:00), "930".
 * Phút một chữ số ("14:4") = chưa gõ xong → null.
 */
export function docGio(chu: string): string | null {
  const s = chu.trim().toLowerCase().replace(/\s+/g, '').replace(/gio$/, 'h')
  let m = s.match(/^(\d{1,2})(?:[:h.](\d{2})?)?$/)
  if (m) return gioHopLe(Number(m[1]), Number(m[2] ?? 0))
  m = s.match(/^(\d{1,2})(\d{2})$/)
  if (m) return gioHopLe(Number(m[1]), Number(m[2]))
  return null
}

const SO_THU: Record<string, number> = { hai: 1, ba: 2, tu: 3, nam: 4, sau: 5, bay: 6 }

/**
 * Bộ đọc chữ tự do (biến thể C) → ISO +07:00 | null. Không phân biệt dấu. Ngày: "hôm nay", "mai"/"ngày mai",
 * "mốt"/"ngày kia", "thứ 2…7"/"thứ hai…bảy"/"t2…t7", "cn"/"chủ nhật", "25/11", "25/11/2026". Giờ: "15h", "15h30", "15:30",
 * "9 giờ", kèm "sáng/trưa/chiều/tối/đêm". Thiếu giờ → GIO_MAC_DINH; thiếu ngày → hôm nay (giờ đã qua → mai).
 * ponytail: bộ đọc regex, đủ các mẫu đã thử; cần "cuối tuần", "2 ngày nữa"… thì thêm mẫu.
 */
export function docChu(chu: string, bayGio = new Date()): string | null {
  const nay = isoNgay(bayGio)
  let s = ` ${boDau(chu).replace(/[·,]/g, ' ').replace(/\s+/g, ' ').trim()} `
  let ngay: string | null = null
  let gio: string | null = null
  let hong = false // khớp mẫu nhưng số sai (31/02, 25h) → không đoán, trả null
  const an = (re: RegExp, f: (m: RegExpMatchArray) => string | null) => {
    const m = s.match(re)
    if (!m) return null
    s = s.replace(m[0], ' ')
    const v = f(m)
    if (!v) hong = true
    return v
  }

  ngay =
    an(/ (\d{1,2})[/-](\d{1,2})(?:[/-](\d{4}))? /, (m) => {
      const [d, th] = [Number(m[1]), Number(m[2])]
      if (th < 1 || th > 12 || d < 1 || d > 31) return null
      let nam = m[3] ? Number(m[3]) : bayGio.getFullYear()
      let iso = `${nam}-${hai(th)}-${hai(d)}`
      if (!m[3] && iso < nay) iso = `${++nam}-${hai(th)}-${hai(d)}`
      return isoNgay(ngayTuIso(iso)) === iso ? iso : null // 31/02 → null
    }) ??
    an(/ (?:ngay )?(?:mai) /, () => congNgay(nay, 1)) ??
    an(/ (?:ngay )?(?:mot|kia) /, () => congNgay(nay, 2)) ??
    an(/ hom nay | nay /, () => nay) ??
    an(/ (?:thu |t)([2-7]) /, (m) => thuToi(nay, Number(m[1]) - 1)) ??
    an(/ thu (hai|ba|tu|nam|sau|bay) /, (m) => thuToi(nay, SO_THU[m[1]])) ??
    an(/ (?:cn|chu nhat) /, () => thuToi(nay, 0))

  gio = an(
    / (\d{1,2})(?:(?:h|:| gio ?)(\d{2})?| gio)(?: (sang|trua|chieu|toi|dem))? /,
    (m) => {
      let h = Number(m[1])
      const buoi = m[3]
      if ((buoi === 'chieu' || buoi === 'toi') && h < 12) h += 12
      if (buoi === 'trua' && h < 3) h += 12
      if (buoi === 'dem' && h >= 6 && h < 12) h += 12
      return gioHopLe(h, Number(m[2] ?? 0))
    },
  )
  // Buổi đứng tách ("3h chiều mai" đã ăn ở trên; "chiều mai 3h" thì buổi còn sót lại) → áp lên giờ đã đọc.
  const buoiSot = s.match(/ (chieu|toi) /)
  if (buoiSot && gio && Number(gio.slice(0, 2)) < 12) {
    gio = `${hai(Number(gio.slice(0, 2)) + 12)}${gio.slice(2)}`
    s = s.replace(buoiSot[0], ' ')
  }
  s = s.replace(/\b(luc|vao|ngay|han|sang|trua)\b/g, ' ')

  if (hong || s.trim() || (!ngay && !gio)) return null
  if (!gio) gio = GIO_MAC_DINH
  if (!ngay) ngay = ghepIso(nay, gio) <= ghepIso(nay, `${hai(bayGio.getHours())}:${hai(bayGio.getMinutes())}`) ? congNgay(nay, 1) : nay
  return ghepIso(ngay, gio)
}

/** Tự kiểm nhanh: `npx tsx app/prototype/chon-gio/_chon-gio/gio.ts` (cwd apps/web). */
export function tuKiem() {
  const luc = new Date(2026, 10, 20, 10, 0) // Thứ Sáu 20/11/2026 10:00
  const ca: [string, string | null][] = [
    ['mai 15h', '2026-11-21T15:00:00+07:00'],
    ['ngay mai 15h30', '2026-11-21T15:30:00+07:00'],
    ['ngày mai', '2026-11-21T17:30:00+07:00'],
    ['thứ 2 9h', '2026-11-23T09:00:00+07:00'],
    ['thu 2 9h', '2026-11-23T09:00:00+07:00'],
    ['t2 9:00', '2026-11-23T09:00:00+07:00'],
    ['thứ hai 9h', '2026-11-23T09:00:00+07:00'],
    ['25/11 14:30', '2026-11-25T14:30:00+07:00'],
    ['25/11/2026 14:45', '2026-11-25T14:45:00+07:00'],
    ['3h chiều mai', '2026-11-21T15:00:00+07:00'],
    ['chiều mai 3h', '2026-11-21T15:00:00+07:00'],
    ['15h', '2026-11-20T15:00:00+07:00'],
    ['9h', '2026-11-21T09:00:00+07:00'],
    ['hôm nay 9 giờ tối', '2026-11-20T21:00:00+07:00'],
    ['21/11/2026 · 17:30', '2026-11-21T17:30:00+07:00'],
    ['1/1', '2027-01-01T17:30:00+07:00'],
    ['31/02', null],
    ['abc', null],
    ['mai 25h', null],
    ['', null],
  ]
  const sai = ca.filter(([vao, ra]) => docChu(vao, luc) !== ra).map(([vao, ra]) => `${vao}: ${docChu(vao, luc)} ≠ ${ra}`)
  const gio: [string, string | null][] = [
    ['1730', '17:30'], ['17:30', '17:30'], ['9', '09:00'], ['930', '09:30'], ['14:45', '14:45'], ['17h', '17:00'],
    ['14:4', null], ['25', null], ['abc', null],
  ]
  sai.push(...gio.filter(([v, r]) => docGio(v) !== r).map(([v, r]) => `docGio ${v}: ${docGio(v)} ≠ ${r}`))
  const moc: [string, string][] = [
    ['2026-11-20T17:30:00+07:00', '17:30'], ['2026-11-21T09:00:00+07:00', 'T7 09:00'],
    ['2026-11-23T09:00:00+07:00', 'T2 09:00'], ['2026-11-27T17:30:00+07:00', '27/11 17:30'],
  ]
  sai.push(...moc.filter(([v, r]) => hienMoc(v, '2026-11-20') !== r).map(([v, r]) => `hienMoc ${v}: ${hienMoc(v, '2026-11-20')} ≠ ${r}`))
  return sai
}

export type PropsHan = {
  /** ISO có múi +07:00, vd 2026-11-21T17:30:00+07:00; null = chưa có hạn. */
  value: string | null
  onValueChange(v: string | null): void
  /** id cho FieldLabel htmlFor (ngữ cảnh form). */
  id?: string
  /** true = ô hẹp trong dòng bảng (vẻ InlineEdit). */
  gon?: boolean
  /** Mã ticket — tên đọc của ô bảng. */
  ma?: string
}
