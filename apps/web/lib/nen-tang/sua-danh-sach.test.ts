import { describe, expect, it } from 'vitest'
import { EMAIL_SUA_DANH_SACH, duocSuaDanhSach } from './sua-danh-sach'

describe('duocSuaDanhSach', () => {
  it('giai đoạn hoàn thiện: chỉ admin@ và ai@', () => {
    expect([...EMAIL_SUA_DANH_SACH]).toEqual(['admin@gwt.vn', 'ai@gwt.vn'])
  })
  it('khớp không phân biệt hoa thường, bỏ khoảng trắng', () => {
    expect(duocSuaDanhSach(' Admin@GWT.vn ')).toBe(true)
    expect(duocSuaDanhSach('ai@gwt.vn')).toBe(true)
  })
  it('tài khoản khác (kể cả CEO, trưởng CSKH) / rỗng → không', () => {
    expect(duocSuaDanhSach('bella@gwt.vn')).toBe(false)
    expect(duocSuaDanhSach('tk@gwt.vn')).toBe(false)
    expect(duocSuaDanhSach('ai@gwt.vn.evil.com')).toBe(false)
    expect(duocSuaDanhSach(null)).toBe(false)
    expect(duocSuaDanhSach('')).toBe(false)
  })
})
