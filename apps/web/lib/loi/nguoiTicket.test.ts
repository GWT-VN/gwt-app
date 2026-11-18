import { describe, expect, it } from 'vitest'
import { chuanTenNguoi, dsChoChon, taiKhoanCuaTho, DAI_TOI_DA_TEN, type NguoiDs } from './nguoiTicket'

const ds: NguoiDs[] = [
  { id: 'a', ten: 'Hiệp', hoat_dong: true },
  { id: 'b', ten: 'Kiều Trang', hoat_dong: true },
  { id: 'c', ten: 'Hiền', hoat_dong: false },
]

describe('chuanTenNguoi', () => {
  it('gọn khoảng trắng, giữ nguyên dấu và hoa thường người gõ', () => {
    expect(chuanTenNguoi('  Tuyết   Trang ', ds)).toEqual({ ok: true, ten: 'Tuyết Trang', trung: null })
  })
  it('trống → lỗi', () => {
    expect(chuanTenNguoi('   ', ds)).toEqual({ ok: false, error: 'Nhập tên.' })
  })
  it('quá dài → lỗi', () => {
    const r = chuanTenNguoi('a'.repeat(DAI_TOI_DA_TEN + 1), ds)
    expect(r.ok).toBe(false)
  })
  it('trùng tên đã có (bỏ dấu, hoa thường) → trả người đã có, kể cả người đã ẩn', () => {
    expect(chuanTenNguoi('kieu trang', ds)).toEqual({ ok: true, ten: 'Kiều Trang', trung: ds[1] })
    expect(chuanTenNguoi('HIEN', ds)).toEqual({ ok: true, ten: 'Hiền', trung: ds[2] })
  })
  it('đổi tên: bỏ qua chính người đang đổi khi xét trùng', () => {
    expect(chuanTenNguoi('hiep', ds, 'a')).toEqual({ ok: true, ten: 'hiep', trung: null })
  })
  it('chặn ký tự điều khiển / xuống dòng', () => {
    expect(chuanTenNguoi('An\nBình', ds).ok).toBe(false)
  })
})

describe('dsChoChon', () => {
  it('chỉ người đang dùng', () => {
    expect(dsChoChon(ds, null).map((x) => x.id)).toEqual(['a', 'b'])
  })
  it('người đang gán dù đã ẩn vẫn có trong danh sách, đánh dấu an', () => {
    const r = dsChoChon(ds, 'c')
    expect(r.map((x) => x.id)).toEqual(['a', 'b', 'c'])
    expect(r.at(-1)?.an).toBe(true)
  })
  it('id lạ (đã xoá hẳn) → bỏ qua, không lỗi', () => {
    expect(dsChoChon(ds, 'zz').map((x) => x.id)).toEqual(['a', 'b'])
  })
})

describe('taiKhoanCuaTho', () => {
  const staff = [
    { id: 's1', email: 'binh@gwt.vn' },
    { id: 's2', email: null },
  ]
  it('khớp email không phân biệt hoa thường, bỏ khoảng trắng', () => {
    expect(taiKhoanCuaTho(' Binh@GWT.vn ', staff)).toBe('s1')
  })
  it('thợ không có email / không khớp → null (CTV không có tài khoản)', () => {
    expect(taiKhoanCuaTho(null, staff)).toBeNull()
    expect(taiKhoanCuaTho('son@gmail.com', staff)).toBeNull()
  })
})
