import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { docNexia, timCot } from './nexia'

function wb(sheets: Record<string, unknown[][]>): ArrayBuffer {
  const w = XLSX.utils.book_new()
  for (const [ten, aoa] of Object.entries(sheets)) XLSX.utils.book_append_sheet(w, XLSX.utils.aoa_to_sheet(aoa), ten)
  return XLSX.write(w, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
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
  it('đọc 2 tab, header giữ vị trí kể cả trùng tên và rỗng', () => {
    const f = docNexia(wb({ Sheet1: [['ghi chú']], 'HĐ đầu vào': [HDR, DONG], 'HĐ Đầu ra': [HDR] }))
    expect(f.vao?.headers).toHaveLength(33)
    expect(f.vao?.headers[30]).toBe('')
    expect(f.vao?.headers[28]).toBe('Ghi chú 2'); expect(f.vao?.headers[31]).toBe('Ghi chú 2')
    expect(f.ra?.dong).toHaveLength(0)
  })
  it('trường nghiệp vụ tìm theo tên cột; raw giữ đúng vị trí', () => {
    const f = docNexia(wb({ 'HĐ đầu vào': [HDR, DONG] }))
    const d = f.vao!.dong[0]
    expect(d.rowOrder).toBe(1)
    expect(d.truong).toMatchObject({ kyHieu: 'C26MTS', soHd: '487', ngayLap: '2026-08-23', tenBan: 'CÔNG TY A',
      tenHang: 'Má giòn mù tạt', thanhTien: 87000, tienThue: 6960, tongThanhToan: 93960, trangThai: 'Hóa đơn mới', tinhChat: 'TM/CK' })
    expect(d.raw[31]).toBe('ghi ở cột 32'); expect(d.raw[30]).toBeNull()
  })
  it('bỏ dòng trống, cột thiếu không ném lỗi', () => {
    const hdrThieu = HDR.filter((h) => h !== 'Tính chất' && h !== 'MCCQT')
    const dongThieu = DONG.filter((_, i) => HDR[i] !== 'Tính chất' && HDR[i] !== 'MCCQT')
    const f = docNexia(wb({ 'HĐ đầu vào': [hdrThieu, dongThieu, [null, null, null], []] }))
    expect(f.vao!.dong).toHaveLength(1)
    expect(f.vao!.dong[0].truong.tinhChat).toBe(''); expect(f.vao!.dong[0].truong.mccqt).toBe('')
  })
  it('ngày dạng Date của Excel cũng ra YYYY-MM-DD', () => {
    const dong: unknown[] = [...DONG]; dong[3] = new Date(2026, 7, 5)
    const f = docNexia(wb({ 'HĐ đầu vào': [HDR, dong] }))
    expect(f.vao!.dong[0].truong.ngayLap).toBe('2026-08-05')
  })
  it('timCot khớp mảnh, không phân biệt hoa thường/khoảng trắng đôi', () => {
    expect(timCot(HDR as string[], 'ký hiệu', 'hóa')).toBe(1)
    expect(timCot(HDR as string[], 'không có')).toBe(-1)
  })
})
