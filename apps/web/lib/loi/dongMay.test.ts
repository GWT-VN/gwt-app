import { describe, expect, it } from 'vitest'
import { nhanDongMay, goiYHuongXuLy, tomTatMayTicket, locLoiHopLe, CHUA_PHAN_LOAI } from './dongMay'

describe('lib/loi/dongMay', () => {
  it('nhãn "MÃ MÁY · Tên lỗi"', () => {
    expect(nhanDongMay({ internal_code: 'CTS20NG', loi_code: 'CTS20-RO-NUOC-DAY', loi_ten: 'Rò nước đáy' })).toBe('CTS20NG · Rò nước đáy')
  })
  it('chưa rõ máy / chưa phân loại', () => {
    expect(nhanDongMay({ internal_code: null, loi_code: CHUA_PHAN_LOAI, loi_ten: 'Chưa phân loại' })).toBe('Chưa rõ máy · Chưa phân loại')
  })
  it('gợi ý khi mục đã duyệt có hướng xử lý và dòng chưa xác nhận', () => {
    expect(goiYHuongXuLy({ huong_xu_ly_nguon: null }, { trang_thai: 'da_duyet', huong_xu_ly: 'Thay gioăng' })).toBe('Thay gioăng')
  })
  it('không gợi ý: mục chưa duyệt, rỗng, hoặc CS đã xác nhận/sửa', () => {
    expect(goiYHuongXuLy({ huong_xu_ly_nguon: null }, { trang_thai: 'cho_duyet', huong_xu_ly: 'x' })).toBeNull()
    expect(goiYHuongXuLy({ huong_xu_ly_nguon: null }, { trang_thai: 'da_duyet', huong_xu_ly: '  ' })).toBeNull()
    expect(goiYHuongXuLy({ huong_xu_ly_nguon: 'cs' }, { trang_thai: 'da_duyet', huong_xu_ly: 'x' })).toBeNull()
    expect(goiYHuongXuLy({ huong_xu_ly_nguon: null }, null)).toBeNull()
  })
  it('không bao giờ gợi ý cho CHUA_PHAN_LOAI', () => {
    expect(goiYHuongXuLy({ huong_xu_ly_nguon: null }, { trang_thai: 'da_duyet', huong_xu_ly: 'x' }, CHUA_PHAN_LOAI)).toBeNull()
  })
  it('tóm tắt dòng máy cho bảng ticket, giữ thứ tự, serial ưu tiên serial đã gắn', () => {
    expect(tomTatMayTicket([
      { internal_code: 'CTS20NG', loi_code: 'A', loi_ten: 'Rò nước đáy', serial: null, source_serial: 'Z1' },
      { internal_code: null, loi_code: CHUA_PHAN_LOAI, loi_ten: 'Chưa phân loại', serial: 'Z2', source_serial: 'Z2' },
    ])).toEqual([{ nhan: 'CTS20NG · Rò nước đáy', serial: 'Z1', chuaPhanLoai: false }, { nhan: 'Chưa rõ máy · Chưa phân loại', serial: 'Z2', chuaPhanLoai: true }])
  })
  it('locLoiHopLe: mã hợp lệ giữ nguyên (chuẩn hoá), rỗng = không lọc, sai dạng = chặn', () => {
    expect(locLoiHopLe('')).toEqual({ loc: false })
    expect(locLoiHopLe(undefined)).toEqual({ loc: false })
    expect(locLoiHopLe(' cts20-ro-nuoc-day ')).toEqual({ loc: true, ma: 'CTS20-RO-NUOC-DAY' })
    expect(locLoiHopLe(CHUA_PHAN_LOAI)).toEqual({ loc: true, ma: 'CHUA_PHAN_LOAI' })
    expect(locLoiHopLe('a,b);drop')).toEqual({ loc: true, ma: null })
  })
})
