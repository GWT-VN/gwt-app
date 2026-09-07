import { describe, it, expect } from 'vitest'
import ExcelJS from 'exceljs'
import { dienExcelHoaDon, timKhoiCotThem, COT_THEM_VAO, COT_THEM_RA, ghiChuMacDinh, type DongXuat } from './excel-hoa-don'

const H_VAO = ['Mẫu số HD', 'Ký hiệu hóa  đơn', 'Số hóa đơn', 'Tên hàng hóa, dịch vụ', 'Ghi chú 2', '', 'Ghi chú 2']
const H_RA = ['Mẫu số HD', 'Số hóa đơn', 'Tên hàng hóa, dịch vụ', 'Mã hàng']

/** Dựng file "gốc" giống file NEXIA kế toán gửi: có Sheet1 rác, độ rộng cột, header vàng, dòng trống giữa chừng. */
async function fileGoc(opts: { daCoCotThem?: boolean } = {}): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook()
  const s1 = wb.addWorksheet('Sheet1'); s1.getCell('A1').value = 'STT'; s1.getCell('B1').value = 'Chứng từ'
  const ws = wb.addWorksheet('HĐ đầu vào')
  const hdr = opts.daCoCotThem ? [...H_VAO, ...COT_THEM_VAO] : H_VAO
  ws.addRow(hdr)
  ws.getRow(1).eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } } })
  ws.getColumn(4).width = 67.9
  ws.addRow([1, 'C26', '487', 'Cơm trưa', null, null, 'x', ...(opts.daCoCotThem ? ['cu', 'cũ', '1', '2', '3', 'ghi chú cũ'] : [])])
  ws.addRow([])                                             // dòng trống — bộ đọc bỏ qua
  ws.addRow([1, 'C26', '', 'Chỉ có tên hàng', null, null, null]) // không có số HĐ nhưng có tên hàng → vẫn là dòng
  ws.addRow([1, 'C26', '999', 'Ống nước', null, null, null])
  ws.getCell(5, 4).numFmt = '#,##0'
  ws.autoFilter = 'A1:G5'
  const ra = wb.addWorksheet('HĐ Đầu ra')
  ra.addRow(H_RA); ra.addRow([1, '10', 'Máy lọc', null])
  return new Uint8Array(await wb.xlsx.writeBuffer())
}

function dong(rowOrder: number, soHd: string | null, phan: Partial<DongXuat> = {}): DongXuat {
  return { rowOrder, soHd, raw: [], code: 'cp.qc', codeName: 'CP quảng cáo', tkNo: '6427', tkCo: '331', vat1331: '1331', note: null, engineConf: 'cao', engineKind: 'kmcp', tuHdct: false, ...phan }
}

async function doc(buf: Uint8Array) {
  const wb = new ExcelJS.Workbook(); await wb.xlsx.load(Buffer.from(buf) as unknown as Parameters<typeof wb.xlsx.load>[0]); return wb
}
const fill = (c: ExcelJS.Cell) => (c.fill as ExcelJS.FillPattern)?.fgColor?.argb

describe('timKhoiCotThem', () => {
  it('thấy khối ở cuối header, không thấy khi thiếu/khác thứ tự', () => {
    expect(timKhoiCotThem([...H_VAO, ...COT_THEM_VAO], COT_THEM_VAO)).toBe(H_VAO.length + 1)
    expect(timKhoiCotThem(H_VAO, COT_THEM_VAO)).toBe(-1)
    expect(timKhoiCotThem([...H_VAO, 'Tên KMCP', 'Mã KMCP (đề xuất)'], COT_THEM_VAO)).toBe(-1)
  })
})

describe('dienExcelHoaDon — điền vào file gốc', () => {
  const vao = [
    dong(1, '487'),
    dong(2, '', { code: null, codeName: null, tkNo: null, tkCo: null, engineConf: 'khong ro', engineKind: 'unknown' }),
    dong(3, '999', { code: 'ONN25', codeName: 'VẬT TƯ (NVL)', tkNo: '152', engineKind: 'goods' }),
  ]

  it('file chưa có cột thêm: nối 6 cột sau cột cuối, giữ Sheet1/độ rộng/header vàng/định dạng số/bộ lọc, bỏ dòng trống đúng chỗ', async () => {
    const wb = await doc(await dienExcelHoaDon({ goc: await fileGoc(), vao, ra: [dong(1, '10', { code: null, engineKind: null })] }))
    expect(wb.worksheets.map((w) => w.name)).toEqual(['Sheet1', 'HĐ đầu vào', 'HĐ Đầu ra'])
    const ws = wb.getWorksheet('HĐ đầu vào')!
    expect(ws.getRow(1).values).toEqual([undefined, ...H_VAO, ...COT_THEM_VAO])
    expect(ws.getColumn(4).width).toBeCloseTo(67.9, 1)
    expect(fill(ws.getCell(1, 1))).toBe('FFFFFF00')
    expect(fill(ws.getCell(1, 8))).toBe('FF305496')
    expect(ws.getColumn(8).width).toBe(16)
    expect(ws.getCell(5, 4).numFmt).toBe('#,##0')
    expect(ws.autoFilter).toBeTruthy()
    // dòng 2 = row_order 1; dòng 3 trống bị bỏ; dòng 4 = row_order 2 (chỉ có tên hàng); dòng 5 = row_order 3
    expect(ws.getCell(2, 8).value).toBe('cp.qc'); expect(ws.getCell(2, 10).value).toBe('6427'); expect(ws.getCell(2, 13).value).toBeNull()
    expect(ws.getCell(3, 8).value).toBeNull()
    expect(ws.getCell(4, 8).value).toBeNull(); expect(ws.getCell(4, 13).value).toBe('⚠ chưa khớp — cần gán tay'); expect(fill(ws.getCell(4, 8))).toBe('FFFFF2CC')
    expect(ws.getCell(5, 8).value).toBe('ONN25'); expect(ws.getCell(5, 13).value).toBe('Mua vào (mã nội bộ) — không phải chi phí'); expect(fill(ws.getCell(5, 12))).toBe('FFDDEBF7')
    expect(ws.rowCount).toBe(5)
    const ra = wb.getWorksheet('HĐ Đầu ra')!
    expect(ra.getRow(1).values).toEqual([undefined, ...H_RA, ...COT_THEM_RA])
    expect(ra.getCell(2, 5).value).toBeNull(); expect(fill(ra.getCell(2, 5))).toBeUndefined() // tab ra lát 1: không tô
  })

  it('file ĐÃ có 6 cột thêm (bản Python cũ / xuất lần 2): ghi đè vào khối đó, không nối bộ thứ hai, xoá tô cũ khi hết cảnh báo', async () => {
    const wb = await doc(await dienExcelHoaDon({ goc: await fileGoc({ daCoCotThem: true }), vao, ra: [] }))
    const ws = wb.getWorksheet('HĐ đầu vào')!
    expect(ws.getRow(1).values).toEqual([undefined, ...H_VAO, ...COT_THEM_VAO])
    expect(ws.columnCount).toBe(H_VAO.length + COT_THEM_VAO.length)
    expect(ws.getCell(2, 8).value).toBe('cp.qc'); expect(ws.getCell(2, 9).value).toBe('CP quảng cáo'); expect(ws.getCell(2, 13).value).toBeNull()
    expect(fill(ws.getCell(2, 8))).toBeUndefined()
  })

  it('ô cùng kiểu định dạng sau khi load dùng chung style — tô cột đề xuất không được làm mất màu cam cột B (bẫy exceljs)', async () => {
    const wb0 = new ExcelJS.Workbook()
    const ws0 = wb0.addWorksheet('HĐ đầu vào')
    ws0.addRow([...H_VAO, ...COT_THEM_VAO])
    const cam: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE699' } }
    ws0.addRow([1, 'C26', '487', 'Có mã', null, null, null, 'cu', 'cũ', '1', '2', '3', null]).eachCell({ includeEmpty: true }, (c) => { c.fill = cam })
    ws0.addRow([1, 'C26', '488', 'Chưa mã', null, null, null, null, null, null, null, null, null]).eachCell({ includeEmpty: true }, (c) => { c.fill = cam })
    const goc = new Uint8Array(await wb0.xlsx.writeBuffer())
    const wb = await doc(await dienExcelHoaDon({ goc, vao: [dong(1, '487'), dong(2, '488', { code: null, engineKind: 'unknown' })], ra: [] }))
    const ws = wb.getWorksheet('HĐ đầu vào')!
    expect(fill(ws.getCell(2, 2))).toBe('FFFFE699'); expect(fill(ws.getCell(3, 2))).toBe('FFFFE699')   // cột B giữ cam
    expect(fill(ws.getCell(2, 8))).toBeUndefined()                                                   // có mã → bỏ tô
    expect(fill(ws.getCell(3, 8))).toBe('FFFFF2CC'); expect(fill(ws.getCell(3, 13))).toBe('FFFFF2CC') // chưa mã → vàng
  })

  it('ghi chú người dùng thắng ghi chú mặc định', () => {
    expect(ghiChuMacDinh(dong(1, '1', { note: 'kế toán xem lại', engineKind: 'goods' }))).toBe('kế toán xem lại')
    expect(ghiChuMacDinh(dong(1, '1', { engineKind: 'muahang' }))).toBe('Tính vào giá vốn hàng NK (156)')
    expect(ghiChuMacDinh(dong(1, '1'))).toBe('')
  })

  it('dòng không có trong file gốc (HDCT bổ sung) nối cuối và tô cam', async () => {
    const wb = await doc(await dienExcelHoaDon({ goc: await fileGoc(), vao: [...vao, dong(4, '555', { raw: [1, 'HDCT', '555', 'Combo'], tuHdct: true })], ra: [] }))
    const ws = wb.getWorksheet('HĐ đầu vào')!
    expect(ws.rowCount).toBe(6)
    expect(ws.getCell(6, 3).value).toBe('555'); expect(fill(ws.getCell(6, 1))).toBe('FFFFE699'); expect(ws.getCell(6, 8).value).toBe('cp.qc')
  })

  it('Số HĐ trong file khác DB → từ chối xuất (không ghi sai dòng)', async () => {
    await expect(dienExcelHoaDon({ goc: await fileGoc(), vao: [dong(1, '488')], ra: [] })).rejects.toThrow(/Số HĐ trong file gốc/)
  })

  it('file gốc không có tab HĐ đầu vào → báo lỗi rõ', async () => {
    const wb = new ExcelJS.Workbook(); wb.addWorksheet('Khac').addRow(['a'])
    const goc = new Uint8Array(await wb.xlsx.writeBuffer())
    await expect(dienExcelHoaDon({ goc, vao: [], ra: [] })).rejects.toThrow(/HĐ đầu vào/)
  })
})
