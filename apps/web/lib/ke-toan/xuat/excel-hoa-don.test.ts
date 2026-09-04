import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import ExcelJS from 'exceljs'
import { dungExcelHoaDon, COT_THEM_VAO, type DongXuat } from './excel-hoa-don'
import { taoEngineDauVao } from '../engine/dau-vao'
import type { Luat, MucCatalog, MucKmcp } from '../engine/kieu'

const H = ['Mẫu số HD', 'Ký hiệu hóa  đơn', 'Số hóa đơn', 'Ghi chú 2', '', 'Ghi chú 2']
describe('dungExcelHoaDon', () => {
  it('header thô giữ nguyên + 6 cột thêm; màu theo nguồn/loại', async () => {
    const buf = await dungExcelHoaDon({
      headersVao: H, headersRa: ['A'], ra: [],
      vao: [
        { raw: [1, 'C26', '1', null, null, 'x'], code: 'cp.qc', codeName: 'CP quảng cáo', tkNo: '6427', tkCo: '331', vat1331: '1331', note: null, engineConf: 'cao', engineKind: 'kmcp', tuHdct: false },
        { raw: [1, 'C26', '2', null, null, null], code: 'T25VB', codeName: 'VẬT TƯ (NVL)', tkNo: '152', tkCo: '331', vat1331: '', note: 'kho', engineConf: 'cao', engineKind: 'goods', tuHdct: true },
        { raw: [1, 'C26', '3', null, null, null], code: null, codeName: null, tkNo: null, tkCo: null, vat1331: '1331', note: null, engineConf: 'khong ro', engineKind: 'unknown', tuHdct: false },
      ],
    })
    const wb = new ExcelJS.Workbook(); await wb.xlsx.load(Buffer.from(buf) as unknown as Parameters<typeof wb.xlsx.load>[0])
    const ws = wb.getWorksheet('HĐ đầu vào')!
    expect(ws.getRow(1).values).toEqual([undefined, ...H, ...COT_THEM_VAO])
    expect(ws.getCell(2, 7).value).toBe('cp.qc'); expect(ws.getCell(2, 9).value).toBe('6427')
    expect((ws.getCell(3, 3).fill as ExcelJS.FillPattern).fgColor?.argb).toBe('FFFFE699')   // dòng HDCT
    expect((ws.getCell(3, 7).fill as ExcelJS.FillPattern).fgColor?.argb).toBe('FFDDEBF7')   // goods ở cột thêm
    expect((ws.getCell(4, 7).fill as ExcelJS.FillPattern).fgColor?.argb).toBe('FFFFF2CC')   // chưa khớp
    expect(ws.getCell(3, 12).value).toBe('kho')
    expect(wb.getWorksheet('HĐ Đầu ra')!.getRow(1).values).toEqual([undefined, 'A', 'Mã nội bộ (đề xuất)', 'Mã khách hàng'])
  })
})

// --- Dữ liệu T8 thật (đã che PII) chạy qua engine thật rồi xuất Excel — kiểm số dòng/cột không
// phụ thuộc vào bộ giá trị dựng tay ở trên. Không đọc thư mục data/ (có PII chưa che).
type Golden = { rows: { i: number; kyHieu: string; soHd: string; seller: string; desc: string; thue: number; thanhTien: number }[] }
const golden = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/t8-dau-vao.json', import.meta.url)), 'utf8')) as Golden
const catalog = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/catalog-t8.json', import.meta.url)), 'utf8')) as MucCatalog[]
const kmcp = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/kmcp.json', import.meta.url)), 'utf8')) as MucKmcp[]

/** Luật lấy từ chính SQL seed (nguồn sự thật) — cùng cách parse với engine/dau-vao.test.ts. */
function luatTuSeed(): Luat[] {
  const sql = readFileSync(fileURLToPath(new URL('../../../../../supabase/migrations/20260904040100_ke_toan_01_luat_seed.sql', import.meta.url)), 'utf8')
  const re = /^\s*\('(supplier|keyword|product_name)', '((?:[^']|'')*)', '((?:[^']|'')*)', (null|'(?:[^']|'')*'), (\d+), '(\w+)'\)/gm
  const out: Luat[] = []; let m: RegExpExecArray | null
  const un = (s: string) => s.replace(/''/g, "'")
  while ((m = re.exec(sql))) out.push({ kind: m[1] as Luat['kind'], pattern: un(m[2]), targetCode: un(m[3]), condition: m[4] === 'null' ? null : un(m[4].slice(1, -1)), priority: Number(m[5]), origin: m[6] as Luat['origin'], active: true })
  return out
}

describe('dungExcelHoaDon với lô T8 thật (đã che PII) qua engine', () => {
  const eng = taoEngineDauVao({ luat: luatTuSeed(), catalog, kmcp })
  const H2 = ['STT', 'Ký hiệu', 'Số HD', 'Người bán', 'Diễn giải', 'Thuế', 'Thành tiền']
  const vao: DongXuat[] = golden.rows.map((r) => {
    const kq = eng.phanLoai(r.seller, r.desc, r.thue)
    return { raw: [r.i, r.kyHieu, r.soHd, r.seller, r.desc, r.thue, r.thanhTien], code: kq.code || null, codeName: kq.codeName || null, tkNo: kq.tkNo || null, tkCo: kq.tkCo || null, vat1331: kq.vat1331 || null, note: null, engineConf: kq.conf, engineKind: kq.kind, tuHdct: false }
  })

  it('xuất đủ số dòng + header thô/cột thêm cho cả lô', async () => {
    const buf = await dungExcelHoaDon({ headersVao: H2, vao, headersRa: [], ra: [] })
    const wb = new ExcelJS.Workbook(); await wb.xlsx.load(Buffer.from(buf) as unknown as Parameters<typeof wb.xlsx.load>[0])
    const ws = wb.getWorksheet('HĐ đầu vào')!
    expect(ws.rowCount).toBe(golden.rows.length + 1)
    expect(ws.getRow(1).values).toEqual([undefined, ...H2, ...COT_THEM_VAO])
  })

  it('mã cột thêm của dòng đầu khớp kết quả engine, tab đầu ra không có dòng vẫn có 2 cột thêm rỗng', async () => {
    const buf = await dungExcelHoaDon({ headersVao: H2, vao, headersRa: ['Cột ra'], ra: [] })
    const wb = new ExcelJS.Workbook(); await wb.xlsx.load(Buffer.from(buf) as unknown as Parameters<typeof wb.xlsx.load>[0])
    const ws = wb.getWorksheet('HĐ đầu vào')!
    const first = golden.rows[0]
    const kqFirst = eng.phanLoai(first.seller, first.desc, first.thue)
    expect(ws.getCell(2, H2.length + 1).value).toBe(kqFirst.code || null)
    const wsRa = wb.getWorksheet('HĐ Đầu ra')!
    expect(wsRa.getRow(1).values).toEqual([undefined, 'Cột ra', 'Mã nội bộ (đề xuất)', 'Mã khách hàng'])
    expect(wsRa.rowCount).toBe(1)
  })
})
