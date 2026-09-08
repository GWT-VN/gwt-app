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

  it('tên tab lệch ("Hoá đơn đầu vào T8") vẫn nhận; thiếu tab đầu ra mà kỳ có dòng ra → lỗi rõ, không có dòng ra → OK', async () => {
    const wb0 = new ExcelJS.Workbook()
    const ws0 = wb0.addWorksheet('Hoá đơn đầu vào T8'); ws0.addRow(H_VAO); ws0.addRow([1, 'C26', '487', 'x', null, null, null])
    const goc = new Uint8Array(await wb0.xlsx.writeBuffer())
    const wb = await doc(await dienExcelHoaDon({ goc, vao: [dong(1, '487')], ra: [] }))
    expect(wb.getWorksheet('Hoá đơn đầu vào T8')!.getCell(2, 8).value).toBe('cp.qc')
    await expect(dienExcelHoaDon({ goc, vao: [dong(1, '487')], ra: [dong(1, '10', { code: null })] })).rejects.toThrow(/không có tab "HĐ Đầu ra"/)
  })

  it('cột cuối không có tên header nhưng có dữ liệu → giữ nguyên, khối cột thêm nối SAU nó', async () => {
    const wb0 = new ExcelJS.Workbook()
    const ws0 = wb0.addWorksheet('HĐ đầu vào'); ws0.addRow([...H_VAO, null]); ws0.addRow([1, 'C26', '487', 'x', null, null, null, 'giá trị cột không tên'])
    const goc = new Uint8Array(await wb0.xlsx.writeBuffer())
    const wb = await doc(await dienExcelHoaDon({ goc, vao: [dong(1, '487')], ra: [] }))
    const ws = wb.getWorksheet('HĐ đầu vào')!
    expect(ws.getCell(2, 8).value).toBe('giá trị cột không tên')
    expect(ws.getCell(1, 9).value).toBe(COT_THEM_VAO[0]); expect(ws.getCell(2, 9).value).toBe('cp.qc')
  })

  it('dòng 1 không có cột Số hóa đơn/Tên hàng (header không ở dòng 1) → lỗi rõ, không nối mọi dòng xuống đáy', async () => {
    const wb0 = new ExcelJS.Workbook()
    const ws0 = wb0.addWorksheet('HĐ đầu vào'); ws0.addRow([]); ws0.addRow(H_VAO); ws0.addRow([1, 'C26', '487', 'x'])
    const goc = new Uint8Array(await wb0.xlsx.writeBuffer())
    await expect(dienExcelHoaDon({ goc, vao: [dong(1, '487')], ra: [] })).rejects.toThrow(/không có cột "Số hóa đơn"/)
  })

  it('file có HAI khối cột đề xuất (Python chạy 2 lần) → ghi vào khối đầu, cắt khối sau; header lệch dấu/khoảng trắng vẫn nhận', async () => {
    const wb0 = new ExcelJS.Workbook()
    const ws0 = wb0.addWorksheet('HĐ đầu vào')
    const khoiLech = ['Mã KMCP (đề xuất) ', 'Tên KMCP', 'TK  Nợ', 'TK Có', 'Nợ 1331 (VAT)', 'Ghi chú'] // dấu cách thừa
    ws0.addRow([...H_VAO, ...khoiLech, ...COT_THEM_VAO])
    ws0.addRow([1, 'C26', '487', 'x', null, null, null, 'cu1', 'cũ', '1', '2', '3', null, 'cu2', 'cũ', '1', '2', '3', null])
    const goc = new Uint8Array(await wb0.xlsx.writeBuffer())
    const wb = await doc(await dienExcelHoaDon({ goc, vao: [dong(1, '487')], ra: [] }))
    const ws = wb.getWorksheet('HĐ đầu vào')!
    expect(ws.columnCount).toBe(H_VAO.length + COT_THEM_VAO.length)
    expect(ws.getCell(2, 8).value).toBe('cp.qc'); expect(ws.getCell(1, 14).value).toBeNull()
  })

  it('khối cột cũ có dòng không còn trong DB → xoá số liệu cũ của dòng đó', async () => {
    const wb = await doc(await dienExcelHoaDon({ goc: await fileGoc({ daCoCotThem: true }), vao: [dong(3, '999')], ra: [] }))
    const ws = wb.getWorksheet('HĐ đầu vào')!
    expect(ws.getCell(2, 8).value).toBeNull(); expect(ws.getCell(2, 13).value).toBeNull() // dòng 487 từng có 'cu'
    expect(ws.getCell(5, 8).value).toBe('cp.qc')
  })

  it('tab đầu ra đã có khối 2 cột → ghi đè, không nối thêm', async () => {
    const wb0 = new ExcelJS.Workbook()
    wb0.addWorksheet('HĐ đầu vào').addRow(H_VAO)
    const ra0 = wb0.addWorksheet('HĐ Đầu ra'); ra0.addRow([...H_RA, ...COT_THEM_RA]); ra0.addRow([1, '10', 'Máy lọc', null, 'CU', 'KH1'])
    const goc = new Uint8Array(await wb0.xlsx.writeBuffer())
    const wb = await doc(await dienExcelHoaDon({ goc, vao: [], ra: [dong(1, '10', { code: 'MOI' })] }))
    const ra = wb.getWorksheet('HĐ Đầu ra')!
    expect(ra.columnCount).toBe(H_RA.length + 2)
    expect(ra.getCell(2, 5).value).toBe('MOI'); expect(ra.getCell(2, 6).value).toBeNull()
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
