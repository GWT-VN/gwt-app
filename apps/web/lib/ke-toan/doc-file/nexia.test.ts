import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import ExcelJS from 'exceljs'
import { docNexia, docHoaDon, timCot } from './nexia'

async function wb(sheets: Record<string, unknown[][]>): Promise<Uint8Array> {
  const w = new ExcelJS.Workbook()
  for (const [ten, aoa] of Object.entries(sheets)) { const ws = w.addWorksheet(ten); for (const r of aoa) ws.addRow(r) }
  return new Uint8Array(await w.xlsx.writeBuffer())
}
const HDR = ['Mẫu số HD', 'Ký hiệu hóa  đơn', 'Số hóa đơn', 'Ngày lập hóa đơn', 'Ngày người bán ký số', 'MCCQT',
  'Ngày CQT ký số', 'Đơn vị tiền tệ', 'Tỷ giá', 'Tên người bán', 'MST người bán', 'Địa chỉ người bán',
  'Tên người mua', 'MST người mua', 'Địa chỉ người mua', 'Mã VT', 'Tên hàng hóa, dịch vụ', 'Đơn vị tính',
  'Số lượng', 'Đơn giá', 'Chiết khấu', 'Thuế suất', 'Thành tiền chưa thuế', 'Tiền thuế', 'Tổng tiền CKTM',
  'Tổng tiền phí', 'Tổng tiền thanh toán', 'Trạng thái hóa đơn', 'Ghi chú 2', 'Số lô', null, 'Ghi chú 2', 'Tính chất']
const DONG = [1, 'C26MTS', ' 487', '23/08/2026', '23/08/2026', 'M1-26-X', '23/08/2026', 'VND', 1, 'CÔNG TY A', '0100000001', 'HN',
  'CÔNG TY B', '0100000002', 'HN', 0, 'Má giòn mù tạt', 'Phần', 3, 29000, 0, 0.08, 87000, 6960, null, null, 93960,
  'Hóa đơn mới', null, null, null, 'ghi ở cột 32', 'TM/CK']

describe('docNexia', () => {
  it('đọc 2 tab, header giữ vị trí kể cả trùng tên và rỗng', async () => {
    const f = await docNexia(await wb({ Sheet1: [['ghi chú']], 'HĐ đầu vào': [HDR, DONG], 'HĐ Đầu ra': [HDR] }))
    expect(f.vao?.headers).toHaveLength(33)
    expect(f.vao?.headers[30]).toBe('')
    expect(f.vao?.headers[28]).toBe('Ghi chú 2'); expect(f.vao?.headers[31]).toBe('Ghi chú 2')
    expect(f.ra?.dong).toHaveLength(0)
  })
  it('trường nghiệp vụ tìm theo tên cột; raw giữ đúng vị trí', async () => {
    const f = await docNexia(await wb({ 'HĐ đầu vào': [HDR, DONG] }))
    const d = f.vao!.dong[0]
    expect(d.rowOrder).toBe(1)
    expect(d.truong).toMatchObject({ kyHieu: 'C26MTS', soHd: '487', ngayLap: '2026-08-23', tenBan: 'CÔNG TY A',
      tenHang: 'Má giòn mù tạt', thanhTien: 87000, tienThue: 6960, tongThanhToan: 93960, trangThai: 'Hóa đơn mới', tinhChat: 'TM/CK' })
    expect(d.raw[31]).toBe('ghi ở cột 32'); expect(d.raw[30]).toBeNull(); expect(d.raw[0]).toBe(1)
  })
  it('bỏ dòng trống, cột thiếu không ném lỗi', async () => {
    const hdrThieu = HDR.filter((h) => h !== 'Tính chất' && h !== 'MCCQT')
    const dongThieu = DONG.filter((_, i) => HDR[i] !== 'Tính chất' && HDR[i] !== 'MCCQT')
    const f = await docNexia(await wb({ 'HĐ đầu vào': [hdrThieu, dongThieu, [null, null, null], []] }))
    expect(f.vao!.dong).toHaveLength(1)
    expect(f.vao!.dong[0].truong.tinhChat).toBe(''); expect(f.vao!.dong[0].truong.mccqt).toBe('')
  })
  it('ngày dạng Date của Excel cũng ra YYYY-MM-DD', async () => {
    const dong: unknown[] = [...DONG]; dong[3] = new Date(2026, 7, 5)
    const f = await docNexia(await wb({ 'HĐ đầu vào': [HDR, dong] }))
    expect(f.vao!.dong[0].truong.ngayLap).toBe('2026-08-05')
  })
  it('ô công thức / rich text đọc ra giá trị hiển thị', async () => {
    const dong: unknown[] = [...DONG]
    dong[22] = { formula: '19*20', result: 87000 }
    dong[16] = { richText: [{ text: 'Má giòn ' }, { text: 'mù tạt', font: { bold: true } }] }
    const f = await docNexia(await wb({ 'HĐ đầu vào': [HDR, dong] }))
    expect(f.vao!.dong[0].truong.thanhTien).toBe(87000)
    expect(f.vao!.dong[0].truong.tenHang).toBe('Má giòn mù tạt')
  })
  it('timCot khớp mảnh, không phân biệt hoa thường/khoảng trắng đôi', () => {
    expect(timCot(HDR as string[], 'ký hiệu', 'hóa')).toBe(1)
    expect(timCot(HDR as string[], 'không có')).toBe(-1)
  })
})

describe('docHoaDon — file HDCT/HDTQ một sheet, chọn hướng từ ngoài', () => {
  const fx = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/hdct-t8-vao.json', import.meta.url)), 'utf8')) as { headers: string[]; rows: unknown[][] }
  it('sheet không tên "đầu vào" vẫn đọc theo huong; số HĐ + tên hàng + thành tiền ra đúng', async () => {
    const t = await docHoaDon(await wb({ Sheet1: [fx.headers, ...fx.rows] }), { huong: 'vao' })
    expect(t.ten).toBe('vao'); expect(t.dong).toHaveLength(fx.rows.length)
    expect(t.dong[0].truong.soHd).not.toBe(''); expect(typeof t.dong[0].truong.thanhTien).toBe('number')
  })
  it('file không có cột Số hóa đơn/Tên hàng → lỗi rõ', async () => {
    await expect(docHoaDon(await wb({ Sheet1: [['a', 'b'], [1, 2]] }), { huong: 'ra' })).rejects.toThrow(/không đúng khuôn/)
  })
})
