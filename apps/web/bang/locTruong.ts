/**
 * Lọc THEO TRƯỜNG (học hành vi Twenty, docs/rework/2026-11-26-f-hoc-hanh-vi-twenty.md mục D) — HÀM THUẦN: đọc/ghi tham số
 * URL, áp điều kiện lên dòng, dựng nhãn chip. Không React → Server Component gọi được (lọc thật phía server).
 *
 * Mỗi trường một tham số URL mang tên `id` của trường; giá trị `[phép~]giá trị` (ngữ pháp ở docs/CHUAN-FILTER.md):
 *   tt=Open,Done            chọn/người "là" — KHÔNG tiền tố (tương thích `tt`/`cs` cũ)
 *   tt=khong-la~Open        tt=trong~        tt=co~
 *   han=hom-nay~            han=khoang~2026-11-01..2026-11-20      han=truoc~2026-11-20      han=sau~2026-11-20
 *   khach=chua~an phat      khach=khong-chua~demo                  (chữ luôn có tiền tố, giữ nguyên dấu phẩy)
 * Nhiều trường = VÀ. Không có nhóm AND/OR lồng (cố ý — "Không làm" của kế hoạch).
 */
import { hienKhoang, hienNgay, isoNgay } from './ngay'
import { boDau } from './timkiem'

export type KieuTruong = 'chon' | 'nguoi' | 'ngay' | 'chu'
export type PhepLoc = 'la' | 'khong-la' | 'trong' | 'co' | 'hom-nay' | 'khoang' | 'truoc' | 'sau' | 'chua' | 'khong-chua'
export type DieuKienLoc = { truong: string; phep: PhepLoc; giaTri: string[] }
/** Trường phía dữ liệu: `lay` trả giá trị thô (chọn/người = mã, ngày = 'YYYY-MM-DD' hoặc timestamp ISO, chữ = chuỗi). */
export type TruongDuLieu<T> = { id: string; kieu: KieuTruong; lay: (r: T) => string | null | undefined }

/** Giá trị đặc biệt "Tôi" của trường người — server thay bằng người đang đăng nhập (`apLoc` `toi`). */
export const TOI = '@toi'

/** Phép theo kiểu, đúng thứ tự menu. */
export const PHEP: Record<KieuTruong, PhepLoc[]> = {
  chon: ['la', 'khong-la', 'trong', 'co'],
  nguoi: ['la', 'khong-la'],
  ngay: ['hom-nay', 'khoang', 'truoc', 'sau', 'trong'],
  chu: ['chua', 'khong-chua'],
}
export const TEN_PHEP: Record<PhepLoc, string> = {
  la: 'là',
  'khong-la': 'không là',
  trong: 'trống',
  co: 'có giá trị',
  'hom-nay': 'hôm nay',
  khoang: 'trong khoảng',
  truoc: 'trước ngày',
  sau: 'từ ngày',
  chua: 'chứa',
  'khong-chua': 'không chứa',
}

const KHONG_GIA_TRI: PhepLoc[] = ['trong', 'co', 'hom-nay']
export const canGiaTri = (p: PhepLoc) => !KHONG_GIA_TRI.includes(p)
/**
 * Phép khi vừa chọn trường = phép ĐẦU cần giá trị (Twenty: phép đầu danh sách). Ngày bỏ qua "hôm nay" để chọn trường
 * xong rồi đóng không đẻ chip ngoài ý muốn (chip chỉ có khi có giá trị).
 */
export const PHEP_MAC_DINH = Object.fromEntries(
  Object.entries(PHEP).map(([k, ds]) => [k, ds.find(canGiaTri)!]),
) as Record<KieuTruong, PhepLoc>

/** Thiếu giá trị mà phép cần → coi như chưa có điều kiện (đóng popover thì gỡ). */
export function laRong(d: Pick<DieuKienLoc, 'phep' | 'giaTri'>): boolean {
  if (!canGiaTri(d.phep)) return false
  const g = d.giaTri.filter((x) => x.trim())
  return d.phep === 'khoang' ? g.length < 2 : g.length === 0
}

const NGAY = /^\d{4}-\d{2}-\d{2}$/

/** Một tham số URL → điều kiện (null = không có / không hợp lệ). */
export function docDieuKien(gt: string | null | undefined, kieu: KieuTruong): Omit<DieuKienLoc, 'truong'> | null {
  if (!gt) return null
  const i = gt.indexOf('~')
  const op = i >= 0 ? (gt.slice(0, i) as PhepLoc) : null
  const phep = op && PHEP[kieu].includes(op) ? op : PHEP_MAC_DINH[kieu]
  const con = phep === op ? gt.slice(i + 1) : gt
  let giaTri: string[] = []
  if (!canGiaTri(phep)) giaTri = []
  else if (kieu === 'chu') giaTri = [con.trim()]
  else if (kieu === 'ngay') {
    giaTri = con.split('..').filter((x) => NGAY.test(x))
    giaTri = phep === 'khoang' ? giaTri.slice(0, 2).sort() : giaTri.slice(0, 1)
  } else giaTri = con.split(',').filter(Boolean)
  const d = { phep, giaTri }
  return laRong(d) ? null : d
}

/** Điều kiện → giá trị tham số URL (null = bỏ tham số). Chọn/người "là" không tiền tố. */
export function ghiDieuKien(d: Pick<DieuKienLoc, 'phep' | 'giaTri'> | null, kieu: KieuTruong): string | null {
  if (!d || laRong(d)) return null
  const g = !canGiaTri(d.phep) ? '' : kieu === 'ngay' ? d.giaTri.join('..') : kieu === 'chu' ? d.giaTri[0].trim() : d.giaTri.join(',')
  return (kieu === 'chon' || kieu === 'nguoi') && d.phep === 'la' ? g : `${d.phep}~${g}`
}

/** Mọi điều kiện của các trường (theo thứ tự trường). Nhận `URLSearchParams` hoặc `searchParams` của Server Component. */
export function docTatCa(
  sp: URLSearchParams | Record<string, string | string[] | undefined>,
  truong: { id: string; kieu: KieuTruong }[],
): DieuKienLoc[] {
  const lay = (k: string) => {
    if (sp instanceof URLSearchParams) return sp.get(k)
    const v = sp[k]
    return Array.isArray(v) ? v[0] : v
  }
  return truong.flatMap((t) => {
    const d = docDieuKien(lay(t.id), t.kieu)
    return d ? [{ truong: t.id, ...d }] : []
  })
}

/** Ngày của giá trị thô: 'YYYY-MM-DD' giữ nguyên; timestamp → ngày theo giờ máy (không `toISOString()`). */
const ngayCua = (v: string) => (v.length > 10 ? isoNgay(new Date(v)) : v.slice(0, 10))

function khop(v: string, kieu: KieuTruong, d: DieuKienLoc, toi: string | undefined, homNay: Date): boolean {
  if (d.phep === 'trong') return !v
  if (d.phep === 'co') return !!v
  if (kieu === 'chu') {
    const co = boDau(v).includes(boDau(d.giaTri[0].trim()))
    return d.phep === 'chua' ? co : !co
  }
  if (kieu === 'ngay') {
    if (!v) return false
    const n = ngayCua(v)
    if (d.phep === 'hom-nay') return n === isoNgay(homNay)
    if (d.phep === 'khoang') return n >= d.giaTri[0] && n <= d.giaTri[1]
    return d.phep === 'truoc' ? n < d.giaTri[0] : n >= d.giaTri[0]
  }
  const co = d.giaTri.some((g) => (g === TOI ? toi : g) === v)
  return d.phep === 'la' ? co : !co
}

/** Lọc dòng theo mọi điều kiện (VÀ). `toi`: tên/mã người đang đăng nhập (giá trị `TOI`). */
export function apLoc<T>(rows: T[], dk: DieuKienLoc[], truong: TruongDuLieu<T>[], opts: { toi?: string; homNay?: Date } = {}): T[] {
  const homNay = opts.homNay ?? new Date()
  const ap = dk.flatMap((d) => {
    const t = truong.find((x) => x.id === d.truong)
    return t ? [{ d, t }] : []
  })
  if (!ap.length) return rows
  return rows.filter((r) => ap.every(({ d, t }) => khop(t.lay(r) ?? '', t.kieu, d, opts.toi, homNay)))
}

/** Quá số này → "N lựa chọn" (Twenty `FieldMetadataMaxOptionsToDisplay`). */
export const TOI_DA_HIEN = 3

/**
 * Nhãn chip gọn: `truoc` (tên trường + phép rút gọn) + `giaTri` (in đậm). "Trạng thái: Đang mở" · "Trạng thái: Không
 * Đang mở" · "Tỉnh/TP: Trống" · "Hạn < 20/11/2026" · "Hạn ≥ …" · "Máy: Không chứa E3" · > 3 giá trị → "4 lựa chọn".
 */
export function nhanChip(d: Pick<DieuKienLoc, 'phep' | 'giaTri'>, ten: string, tenGiaTri: (g: string) => string) {
  const ds = (g: string[]) => (g.length > TOI_DA_HIEN ? `${g.length} lựa chọn` : g.map((x) => (x === TOI ? 'Tôi' : tenGiaTri(x))).join(', '))
  switch (d.phep) {
    case 'la':
      return { truoc: `${ten}:`, giaTri: ds(d.giaTri) }
    case 'khong-la':
      return { truoc: `${ten}: Không`, giaTri: ds(d.giaTri) }
    case 'trong':
      return { truoc: `${ten}:`, giaTri: 'Trống' }
    case 'co':
      return { truoc: `${ten}:`, giaTri: 'Có giá trị' }
    case 'hom-nay':
      return { truoc: `${ten}:`, giaTri: 'Hôm nay' }
    case 'khoang':
      return { truoc: `${ten}:`, giaTri: hienKhoang({ tu: d.giaTri[0], den: d.giaTri[1] }) }
    case 'truoc':
      return { truoc: `${ten} <`, giaTri: hienNgay(d.giaTri[0]) }
    case 'sau':
      return { truoc: `${ten} ≥`, giaTri: hienNgay(d.giaTri[0]) }
    case 'chua':
      return { truoc: `${ten}:`, giaTri: d.giaTri[0] }
    case 'khong-chua':
      return { truoc: `${ten}: Không chứa`, giaTri: d.giaTri[0] }
  }
}
