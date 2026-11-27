// Điều kiện lọc theo trường của F (bang/locTruong, TRUONG_F) → bộ lọc PostgREST trên v_tickets. HÀM THUẦN (test được):
// mỗi phần tử trả về là MỘT nhóm `.or(...)`; nhiều nhóm = VÀ. Cùng nghĩa với `apLoc` trong bộ nhớ (giá trị rỗng/null:
// "không là"/"không chứa" vẫn giữ dòng trống). `loi` không ở đây — mảng loi_codes lọc bằng phép mảng (searchTickets).
import { TOI, type DieuKienLoc } from '@/bang/locTruong'
import { chon, chu, ds, homNayVN, nhay, ngay } from '@/bang/locDb'
import { BH_F, CHUA_GIAO, KHAN_CO, KHAN_KHONG } from './truong-f'

export { homNayVN }

/** Trường chọn → cột v_tickets. */
const COT_CHON: Record<string, string> = { tt: 'state', loai: 'ticket_type', tinh: 'province' }
const UUID_RONG = '00000000-0000-0000-0000-000000000000'

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

/** Máy = mã ngắn suy từ tên (`maMayNgan`: chữ sau "GE " trong product_name, không có thì internal_code). Mã `m` khớp khi
 *  tên kết thúc bằng "GE m" hoặc chứa "GE m " (không ăn nhầm CTS200 khi chọn CTS20), hoặc internal_code = m. */
function khopMay(m: string): string {
  return [`product_name.ilike.${nhay(`*GE ${m}`)}`, `product_name.ilike.${nhay(`*GE ${m} *`)}`, `internal_code.eq.${nhay(m)}`].join(',')
}
function khongKhopMay(m: string): string {
  const ten = `or(product_name.is.null,and(product_name.not.ilike.${nhay(`*GE ${m}`)},product_name.not.ilike.${nhay(`*GE ${m} *`)}))`
  return `and(${ten},or(internal_code.is.null,internal_code.neq.${nhay(m)}))`
}
function may(d: DieuKienLoc): string[] {
  if (d.phep === 'la') return d.giaTri.length ? [d.giaTri.map(khopMay).join(',')] : []
  if (d.phep === 'khong-la') return d.giaTri.map(khongKhopMay)
  if (d.phep === 'trong') return ['and(product_name.is.null,internal_code.is.null)']
  if (d.phep === 'co') return ['product_name.not.is.null,internal_code.not.is.null']
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
    if (d.truong === 'ma') return chu(['ticket_code'], d, false)
    if (d.truong === 'may') return may(d)
    return []
  })
}
