/**
 * Điều kiện lọc theo trường (bang/locTruong) → nhóm bộ lọc PostgREST. HÀM THUẦN (test được): mỗi phần tử trả về là MỘT
 * nhóm `.or(...)`; nhiều nhóm = VÀ. Cùng nghĩa với `apLoc` trong bộ nhớ ("không là"/"không chứa" vẫn giữ dòng trống).
 * Dùng chung cho mọi bảng khuôn Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md): màn khai trường → cột rồi gọi
 * `chon` / `ngay` / `chu`; trường đặc thù (người, khẩn, bảo hành của ticket) màn tự viết.
 */
import type { DieuKienLoc } from './locTruong'
import { antoanChoOr, boDau } from './timkiem'

/** Giá trị trong `.or()`: luôn bọc nháy kép (tên người/tỉnh có thể chứa phẩy, ngoặc). */
export const nhay = (v: string) => `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
export const ds = (vs: string[]) => `(${vs.map(nhay).join(',')})`

/** Hôm nay theo giờ VN, 'YYYY-MM-DD'. */
export const homNayVN = (bayGio = Date.now()) => new Date(bayGio + 7 * 3_600_000).toISOString().slice(0, 10)
export const sauMotNgay = (d: string) => new Date(Date.parse(`${d}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10)
/** Đầu ngày VN của 'YYYY-MM-DD' (created_at là timestamptz). */
export const dauNgay = (d: string) => `${d}T00:00:00+07:00`

export function chon(cot: string, d: DieuKienLoc): string[] {
  switch (d.phep) {
    case 'la':
      return [`${cot}.in.${ds(d.giaTri)}`]
    case 'khong-la':
      return [`${cot}.is.null,${cot}.not.in.${ds(d.giaTri)}`]
    case 'trong':
      return [`${cot}.is.null,${cot}.eq.""`]
    case 'co':
      return [`${cot}.not.is.null`, `${cot}.neq.""`]
    default:
      return []
  }
}

export function ngay(cot: string, d: DieuKienLoc, homNay: string): string[] {
  const [a, b] = d.giaTri
  switch (d.phep) {
    case 'hom-nay':
      return [`${cot}.gte.${dauNgay(homNay)}`, `${cot}.lt.${dauNgay(sauMotNgay(homNay))}`]
    case 'khoang':
      return [`${cot}.gte.${dauNgay(a)}`, `${cot}.lt.${dauNgay(sauMotNgay(b))}`]
    case 'truoc':
      return [`${cot}.lt.${dauNgay(a)}`]
    case 'sau':
      return [`${cot}.gte.${dauNgay(a)}`]
    case 'trong':
      return [`${cot}.is.null`]
    default:
      return []
  }
}

/** Chữ: `cot` đã bỏ dấu (ten_kd) thì bỏ dấu từ khoá; nhiều cột = chứa ở BẤT KỲ cột nào ("không chứa" = không cột nào). */
export function chu(cot: string[], d: DieuKienLoc, khongDau: boolean): string[] {
  const kw = antoanChoOr(khongDau ? boDau(d.giaTri[0]) : d.giaTri[0])
  if (!kw) return []
  if (d.phep === 'chua') return [cot.map((c) => `${c}.ilike.%${kw}%`).join(',')]
  if (d.phep === 'khong-chua') return cot.map((c) => `${c}.is.null,${c}.not.ilike.%${kw}%`)
  return []
}
