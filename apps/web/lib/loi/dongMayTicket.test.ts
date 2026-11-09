import { describe, expect, it } from 'vitest'
import { chipTrangThai, coTheBoDong, dsLoiChon, nhanNguonHuongXuLy, quyetDinhXacNhan } from './dongMayTicket'
import type { LoiDanhMuc } from './kieu'

const loi = (code: string, trang_thai: LoiDanhMuc['trang_thai']): LoiDanhMuc => ({
  code, nhom: null, ten: code, aliases: [], ma_may: [], dau_hieu: null, huong_xu_ly: null, nguon: null,
  trang_thai, duyet_boi: null, duyet_luc: null, thu_tu: 1,
})

describe('dongMayTicket', () => {
  it('chip trạng thái', () => {
    expect(chipTrangThai('dang_xu_ly').nhan).toBe('Đang xử lý')
    expect(chipTrangThai('da_xu_ly').nhan).toBe('Đã xử lý')
    expect(chipTrangThai('khong_loi').nhan).toBe('Không phải lỗi')
  })
  it('nhãn nguồn hướng xử lý', () => {
    expect(nhanNguonHuongXuLy('danh_muc')).toBe('theo danh mục')
    expect(nhanNguonHuongXuLy('cs')).toBe('CS ghi')
    expect(nhanNguonHuongXuLy(null)).toBe('CS ghi')
  })
  it('dòng cuối không được bỏ, có tooltip', () => {
    expect(coTheBoDong(1)).toEqual({ duocBo: false, goiY: 'Ticket phải còn ít nhất một dòng máy.' })
    expect(coTheBoDong(2)).toEqual({ duocBo: true, goiY: null })
  })
  it('xác nhận: giữ nguyên gợi ý -> danh mục; sửa -> cs; trống -> null', () => {
    expect(quyetDinhXacNhan('Thay van', 'Thay van')).toEqual({ noiDung: 'Thay van', tuDanhMuc: true })
    expect(quyetDinhXacNhan('  Thay van ', 'Thay van')).toEqual({ noiDung: 'Thay van', tuDanhMuc: true })
    expect(quyetDinhXacNhan('Thay bơm', 'Thay van')).toEqual({ noiDung: 'Thay bơm', tuDanhMuc: false })
    expect(quyetDinhXacNhan('   ', 'Thay van')).toBeNull()
  })
  it('sửa hướng đã xác nhận luôn là cs', () => {
    expect(quyetDinhXacNhan('Thay van', null)).toEqual({ noiDung: 'Thay van', tuDanhMuc: false })
  })
  it('ds lỗi chọn: bỏ ngưng nhưng giữ mã đang dùng', () => {
    const ds = [loi('A', 'da_duyet'), loi('B', 'ngung'), loi('C', 'ngung')]
    expect(dsLoiChon(ds, 'B').map((l) => l.code)).toEqual(['A', 'B'])
    expect(dsLoiChon(ds, 'A').map((l) => l.code)).toEqual(['A'])
  })
})
