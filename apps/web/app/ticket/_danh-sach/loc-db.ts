// Điều kiện lọc theo trường của F (bang/locTruong, TRUONG_F) → bộ lọc PostgREST trên v_tickets. HÀM THUẦN (test được):
// mỗi phần tử trả về là MỘT nhóm `.or(...)`; nhiều nhóm = VÀ. Cùng nghĩa với `apLoc` trong bộ nhớ (giá trị rỗng/null:
// "không là"/"không chứa" vẫn giữ dòng trống). `loi` không ở đây — mảng loi_codes lọc bằng phép mảng (searchTickets).
import { TOI, type DieuKienLoc } from '@/bang/locTruong'
import { antoanChoOr, boDau } from '@/bang/timkiem'
import { BH_F, CHUA_GIAO, KHAN_CO, KHAN_KHONG } from './truong-f'

/** Trường chọn → cột v_tickets. */
const COT_CHON: Record<string, string> = { tt: 'state', loai: 'ticket_type', tinh: 'province' }
const UUID_RONG = '00000000-0000-0000-0000-000000000000'

/** Giá trị trong `.or()`: luôn bọc nháy kép (tên người/tỉnh có thể chứa phẩy, ngoặc). */
const nhay = (v: string) => `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
const ds = (vs: string[]) => `(${vs.map(nhay).join(',')})`

/** Hôm nay theo giờ VN, 'YYYY-MM-DD'. */
export const homNayVN = (bayGio = Date.now()) => new Date(bayGio + 7 * 3_600_000).toISOString().slice(0, 10)
const sauMotNgay = (d: string) => new Date(Date.parse(`${d}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10)
/** Đầu ngày VN của 'YYYY-MM-DD' (created_at là timestamptz). */
const dauNgay = (d: string) => `${d}T00:00:00+07:00`

function chon(cot: string, d: DieuKienLoc): string[] {
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

function nguoi(d: DieuKienLoc, toiId: string | undefined): string[] {
  const ten = d.giaTri.filter((g) => g !== TOI && g !== CHUA_GIAO)
  const chuaGiao = d.giaTri.includes(CHUA_GIAO)
  const toi = d.giaTri.includes(TOI) ? (toiId ?? UUID_RONG) : null
  if (d.phep === 'la') {
    const or = [...(ten.length ? [`cs_ten.in.${ds(ten)}`] : []), ...(chuaGiao ? ['cs_phu_trach.is.null'] : []), ...(toi ? [`cs_phu_trach.eq.${toi}`] : [])]
    return or.length ? [or.join(',')] : []
  }
  if (d.phep === 'khong-la')
    return [
      ...(ten.length ? [`cs_ten.is.null,cs_ten.not.in.${ds(ten)}`] : []),
      ...(chuaGiao ? ['cs_phu_trach.not.is.null'] : []),
      ...(toi ? [`cs_phu_trach.is.null,cs_phu_trach.neq.${toi}`] : []),
    ]
  return []
}

function ngay(cot: string, d: DieuKienLoc, homNay: string): string[] {
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
function chu(cot: string[], d: DieuKienLoc, khongDau: boolean): string[] {
  const kw = antoanChoOr(khongDau ? boDau(d.giaTri[0]) : d.giaTri[0])
  if (!kw) return []
  if (d.phep === 'chua') return [cot.map((c) => `${c}.ilike.%${kw}%`).join(',')]
  if (d.phep === 'khong-chua') return cot.map((c) => `${c}.is.null,${c}.not.ilike.%${kw}%`)
  return []
}

/** Khẩn (cột boolean): Có / Không. Chọn cả hai = không lọc; "trống"/"có giá trị" vô nghĩa (luôn có giá trị). */
function khan(d: DieuKienLoc): string[] {
  const co = d.giaTri.includes(KHAN_CO)
  const khong = d.giaTri.includes(KHAN_KHONG)
  if (co === khong || (d.phep !== 'la' && d.phep !== 'khong-la')) return []
  return [`khan.is.${co === (d.phep === 'la')}`]
}

/** Bảo hành (suy từ serial / warranty_activated / con_han_may, cùng nghĩa bhCua): mỗi giá trị một nhóm and(); "không là" =
 *  "là" phần bù; "trống" = chưa có serial, "có giá trị" = có serial. */
const DK_BH: Record<string, string> = {
  khong: 'serial.is.null',
  chua: 'and(serial.not.is.null,warranty_activated.not.is.true)',
  con: 'and(serial.not.is.null,warranty_activated.is.true,con_han_may.is.true)',
  het: 'and(serial.not.is.null,warranty_activated.is.true,or(con_han_may.is.false,con_han_may.is.null))',
}
function baoHanh(d: DieuKienLoc): string[] {
  const tat = BH_F.map((b) => b.gt as string)
  const gt =
    d.phep === 'la' ? d.giaTri : d.phep === 'khong-la' ? tat.filter((g) => !d.giaTri.includes(g)) : d.phep === 'trong' ? ['khong'] : ['con', 'het', 'chua']
  const ds = gt.filter((g) => g in DK_BH)
  if (ds.length === tat.length) return []
  // Không giá trị nào khớp (vd "không là" cả 4) → điều kiện luôn sai (mã ticket không bao giờ trống).
  return [ds.length ? ds.map((g) => DK_BH[g]).join(',') : 'ticket_code.is.null']
}

export function dieuKienOrTicket(dk: DieuKienLoc[], opts: { toiId?: string; homNay?: string } = {}): string[] {
  const homNay = opts.homNay ?? homNayVN()
  return dk.flatMap((d) => {
    if (d.truong in COT_CHON) return chon(COT_CHON[d.truong], d)
    if (d.truong === 'khan') return khan(d)
    if (d.truong === 'bh') return baoHanh(d)
    if (d.truong === 'cs') return nguoi(d, opts.toiId)
    if (d.truong === 'tao') return ngay('created_at', d, homNay)
    if (d.truong === 'khach') return chu(['ten_kd'], d, true)
    if (d.truong === 'may') return chu(['product_name', 'source_serial'], d, false)
    return []
  })
}
