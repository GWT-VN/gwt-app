import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { taoEngineDauVao } from './dau-vao'
import type { Luat, MucCatalog, MucKmcp } from './kieu'

type Golden = { rows: { i: number; seller: string; desc: string; thue: number; expected: { nguon: string; kmcp: string; ten: string; tkno: string; tkco: string; vat: string; kind: string } }[] }
const golden = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/t8-dau-vao.json', import.meta.url)), 'utf8')) as Golden

/** Luật lấy từ chính SQL seed (nguồn sự thật) — parse đơn giản từng dòng `(kind, pattern, target, condition, priority, origin)`. */
function luatTuSeed(): Luat[] {
  const sql = readFileSync(fileURLToPath(new URL('../../../../../supabase/migrations/20260904040100_ke_toan_01_luat_seed.sql', import.meta.url)), 'utf8')
  const re = /^\s*\('(supplier|keyword|product_name)', '((?:[^']|'')*)', '((?:[^']|'')*)', (null|'(?:[^']|'')*'), (\d+), '(\w+)'\)/gm
  const out: Luat[] = []; let m: RegExpExecArray | null
  const un = (s: string) => s.replace(/''/g, "'")
  while ((m = re.exec(sql))) out.push({ kind: m[1] as Luat['kind'], pattern: un(m[2]), targetCode: un(m[3]), condition: m[4] === 'null' ? null : un(m[4].slice(1, -1)), priority: Number(m[5]), origin: m[6] as Luat['origin'], active: true })
  return out
}
/** Catalog & KMCP: bản chụp nhỏ đủ cho T8 — lấy từ fixture riêng để test không cần DB. */
const catalog = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/catalog-t8.json', import.meta.url)), 'utf8')) as MucCatalog[]
const kmcp = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/kmcp.json', import.meta.url)), 'utf8')) as MucKmcp[]

const TANG_LAT_1 = new Set(['override_ncc', 'override_kw', 'rule_ncc', 'rule_kw', 'goods'])

// Ngoại lệ đo được 04/09: 2 luật NCC (2/66 dòng "2.Rule theo NCC") bị che tên bằng chỉ số dòng khi
// sinh seed SQL (tools/scripts/ke_toan_sinh_luat_sql.py, xem CA_NHAN) — pattern trong DB đổi thành
// "ncc ca nhan {i} (che ten — nhap lai qua app)" nên không còn khớp tên NCC thật trong fixture T8.
// Đối chiếu golden: 0 dòng T8 có expected.nguon === 'rule_ncc' với kmcp ∈ {cp.thuekho, cp.vanhanhchung}
// (2 mã của 2 luật bị che) — hai NCC cá nhân này không phát sinh giao dịch (hoặc bị override khác che)
// trong T8, nên NGOAI_LE rỗng cho batch này; giữ Map để lát sau có dữ liệu thì bổ sung.
const NGOAI_LE = new Map<number, string>()

describe('engine đầu vào khớp Python trên T8', () => {
  const eng = taoEngineDauVao({ luat: luatTuSeed(), catalog, kmcp })
  const lech: string[] = []; const themDuoc: string[] = []; let soSanh = 0
  for (const r of golden.rows) {
    const kq = eng.phanLoai(r.seller, r.desc, r.thue)
    if (!TANG_LAT_1.has(r.expected.nguon)) { if (kq.code && !r.expected.kmcp) themDuoc.push(`#${r.i} ${r.desc} → ${kq.code} (${kq.nguon})`); continue }
    if (NGOAI_LE.has(r.i)) continue
    soSanh++
    const got = [kq.code, kq.tkNo, kq.tkCo, kq.vat1331, kq.kind].join('|')
    const exp = [r.expected.kmcp, r.expected.tkno, r.expected.tkco, r.expected.vat, r.expected.kind].join('|')
    if (got !== exp) lech.push(`#${r.i} [${r.expected.nguon}] ${r.seller} / ${r.desc}\n     python=${exp}\n     ts    =${got} (${kq.nguon}: ${kq.reason})`)
  }
  it('so sánh ít nhất 250 dòng tầng 0/A/B/goods', () => expect(soSanh).toBeGreaterThanOrEqual(250))
  it('khớp 100% dòng Python đã gán ở tầng 0/A/B/goods', () => expect(lech, lech.join('\n')).toEqual([]))
  it('liệt kê dòng TS điền thêm (không fail)', () => { console.log(`TS điền thêm ${themDuoc.length} dòng:\n` + themDuoc.join('\n')) })
})

describe('luật cứng ngoài fixture', () => {
  const eng = taoEngineDauVao({ luat: [], catalog: [{ ma: 'T25VB', ten: 'Tê Vesbo 25mm', tinhChat: 'Nguyên vật liệu' }], kmcp: [{ ma: 'cp.muahang', ten: 'x', tkNoDefault: '' }] })
  it('hàng hoá trong catalog → mã nội bộ + TK theo tính chất, TK Có 331', () => {
    expect(eng.phanLoai('X', 'Tê Vesbo 25mm', 100)).toMatchObject({ kind: 'goods', code: 'T25VB', tkNo: '152', tkCo: '331', vat1331: '1331', codeName: 'VẬT TƯ (NVL)' })
  })
  it('có chữ "phí " thì không phải hàng hoá', () => {
    expect(eng.phanLoai('X', 'Phí tê Vesbo 25mm', 0).kind).not.toBe('goods')
  })
  it('không thuế → vat1331 rỗng; không khớp gì → unknown', () => {
    expect(eng.phanLoai('X', 'abc xyz', 0)).toMatchObject({ kind: 'unknown', code: '', vat1331: '', conf: 'khong ro' })
  })
})

/** Luật origin 'app' lấy từ chính migration 08 (nguồn sự thật) — parse dòng `('kind', 'pattern', 'code', cond, priority)`. */
function luatApp(): Luat[] {
  const sql = readFileSync(fileURLToPath(new URL('../../../../../supabase/migrations/20260915090000_ke_toan_08_luat_ky08.sql', import.meta.url)), 'utf8')
  const re = /^\s*\('(supplier|keyword)',\s*'([^']*)',\s*'([^']*)',\s*(null|'[^']*'),\s*(\d+)\)/gm
  const out: Luat[] = []; let m: RegExpExecArray | null
  while ((m = re.exec(sql))) out.push({ kind: m[1] as Luat['kind'], pattern: m[2], targetCode: m[3], condition: m[4] === 'null' ? null : m[4].slice(1, -1), priority: Number(m[5]), origin: 'app', active: true })
  return out
}

describe('luật origin app (CEO chốt 15/09, migration 08) — kw: và khong_phai_hang', () => {
  const app = luatApp()
  const co = taoEngineDauVao({ luat: [...luatTuSeed(), ...app], catalog, kmcp })
  const khong = taoEngineDauVao({ luat: luatTuSeed(), catalog, kmcp })
  const GSM = 'CÔNG TY CỔ PHẦN DI CHUYỂN XANH VÀ THÔNG MINH GSM'
  it('migration 08 đọc được ≥ 12 luật', () => expect(app.length).toBeGreaterThanOrEqual(12))
  it('nhà hàng: khong_phai_hang chặn tầng hàng hoá — "Lẩu vị muối" không còn thành muối viên MUOIAD', () => {
    expect(khong.phanLoai('CÔNG TY TNHH STR TSUITERU - CHI NHÁNH SỐ 1', 'Lẩu vị muối', 1).code).toBe('MUOIAD') // bug cũ, để ghi nhận
    expect(co.phanLoai('CÔNG TY TNHH STR TSUITERU - CHI NHÁNH SỐ 1', 'Lẩu vị muối', 1)).toMatchObject({ code: 'cp.vanhanhchung', tkNo: '6428', conf: 'cao' })
    expect(co.phanLoai('Công ty TNHH DragonCello Việt Nam', 'Mỳ Ý Vongole', 1).code).toBe('cp.vanhanhchung')
  })
  it('kw: tách Xanh SM theo diễn giải — chở hàng → DVVC, đi lại/phí nền tảng/phí quản lý → cp.dichuyen', () => {
    expect(co.phanLoai(GSM, 'Cước phí vận chuyển mã 01KZ; Tên hàng hóa: Đồ điện gia dụng; Tên người gửi: A', 1)).toMatchObject({ code: 'DVVC', tkNo: '6417' })
    expect(co.phanLoai(GSM, 'Phí nền tảng mã 01KZ; Tên hàng hóa: Quần áo', 1).code).toBe('DVVC')
    expect(co.phanLoai(GSM, 'Cước phí vận chuyển mã 01KZ; Điểm đi: Lieu Giai Gate; Điểm đến: X', 1)).toMatchObject({ code: 'cp.dichuyen', tkNo: '6427' })
    expect(co.phanLoai(GSM, 'Phí quản lý', 1).code).toBe('cp.dichuyen')
    expect(khong.phanLoai(GSM, 'Phí quản lý', 1).kind).toBe('unknown')
  })
  it('Viettel kho vận tách vận hành kho / chuyển phát; vật tư ống nước → cp.vattukho', () => {
    const VT = 'CÔNG TY TNHH MỘT THÀNH VIÊN DỊCH VỤ KHO VẬN VIETTEL'
    expect(co.phanLoai(VT, 'Phí vận hành kho tháng 08 theo bảng kê', 1).code).toBe('cp.thuekho')
    expect(co.phanLoai(VT, 'Phí chuyển phát tháng 08 theo bảng kê', 1).code).toBe('DVVC')
    expect(co.phanLoai('CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ XÂY DỰNG XUÂN LÀNH 01', 'Tê đều Vesbo 25mm', 1).code).toBe('cp.vattukho')
  })
})

describe('tầng C — học từ corrections (ke_toan_thong_ke_hoc)', () => {
  const thongKe = { ncc: { 'cong ty tnhh hoc thu': 'cp.qc' }, prefix: { 'phi quang cao facebook thang': 'cp.qc' } }
  const co = taoEngineDauVao({ luat: luatTuSeed(), catalog, kmcp, thongKe })
  const khong = taoEngineDauVao({ luat: luatTuSeed(), catalog, kmcp })
  it('NCC từng được sửa ≥70% về một mã → mã đó, trung bình, nguon hoc_ncc', () => {
    expect(khong.phanLoai('CÔNG TY TNHH HỌC THỬ', 'dich vu abc', 1).kind).toBe('unknown')
    expect(co.phanLoai('CÔNG TY TNHH HỌC THỬ', 'dich vu abc', 1)).toMatchObject({ code: 'cp.qc', conf: 'trung binh', nguon: 'hoc_ncc' })
  })
  it('tiền tố 5 từ diễn giải ≥80% → mã đó, nguon hoc_prefix; NCC < 6 ký tự không học', () => {
    expect(co.phanLoai('X', 'Phí quảng cáo Facebook tháng 8 chiến dịch A', 1)).toMatchObject({ code: 'cp.qc', nguon: 'hoc_prefix' })
    expect(co.phanLoai('ABC', 'khong khop gi', 1).kind).toBe('unknown')
  })
  it('luật (override/rule) vẫn thắng học', () => {
    expect(co.phanLoai('CÔNG TY TNHH LALAMOVE VIETNAM', 'Phí quảng cáo Facebook tháng 8', 1).nguon).toBe('rule_ncc')
  })
})
