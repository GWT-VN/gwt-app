import { describe, expect, it } from 'vitest'
import { CS_THEO_DOI, GHI_CHU_TOI_DA, kiemCsTheoDoi, kiemGhiChu, kiemNgay, ngayCuaLan, ngayVNHomNay, soNgayMo } from './ngayTicket'

describe('ngayVNHomNay', () => {
  it('lấy ngày theo giờ VN (UTC+7)', () => {
    expect(ngayVNHomNay(new Date('2026-11-17T18:30:00Z'))).toBe('2026-11-18')
    expect(ngayVNHomNay(new Date('2026-11-17T03:00:00Z'))).toBe('2026-11-17')
  })
})

describe('kiemNgay', () => {
  const homNay = '2026-11-17'
  it('trống → null (dùng ngày tạo)', () => {
    expect(kiemNgay('', homNay)).toEqual({ ok: true, ngay: null })
    expect(kiemNgay(undefined, homNay)).toEqual({ ok: true, ngay: null })
  })
  it('nhận ngày lùi và hôm nay', () => {
    expect(kiemNgay('2026-10-14', homNay)).toEqual({ ok: true, ngay: '2026-10-14' })
    expect(kiemNgay('2026-11-17', homNay)).toEqual({ ok: true, ngay: '2026-11-17' })
  })
  it('chặn ngày tương lai, sai định dạng, ngày không có thật, trước 2020', () => {
    expect(kiemNgay('2026-11-18', homNay).ok).toBe(false)
    expect(kiemNgay('14/10/2026', homNay).ok).toBe(false)
    expect(kiemNgay('2026-02-30', homNay).ok).toBe(false)
    expect(kiemNgay('2019-12-31', homNay).ok).toBe(false)
    expect(kiemNgay(20261014, homNay).ok).toBe(false)
  })
})

describe('kiemCsTheoDoi', () => {
  it('đúng 4 tên', () => {
    expect(CS_THEO_DOI).toEqual(['Hiệp', 'Kiều Trang', 'Hiền', 'Tuyết Trang'])
    expect(kiemCsTheoDoi('Kiều Trang')).toEqual({ ok: true, ten: 'Kiều Trang' })
    expect(kiemCsTheoDoi('')).toEqual({ ok: true, ten: null })
  })
  it('chặn tên lạ', () => {
    expect(kiemCsTheoDoi('AI').ok).toBe(false)
    expect(kiemCsTheoDoi('tk@gwt.vn').ok).toBe(false)
  })
})

describe('ngayCuaLan', () => {
  it('có ngày khách báo → dùng; không có → ngày tạo theo giờ VN', () => {
    expect(ngayCuaLan('2026-10-14', '2026-11-17T08:00:00Z')).toBe('2026-10-14')
    expect(ngayCuaLan(null, '2026-11-16T20:00:00Z')).toBe('2026-11-17')
    expect(ngayCuaLan(undefined, null)).toBeNull()
  })
})

describe('soNgayMo', () => {
  it('đếm số ngày giữa 2 ngày', () => {
    expect(soNgayMo('2026-09-13', '2026-11-17')).toBe(65)
    expect(soNgayMo('2026-11-17', '2026-11-17')).toBe(0)
  })
})

describe('kiemGhiChu', () => {
  it('rỗng / chỉ khoảng trắng → null (xoá ghi chú)', () => {
    expect(kiemGhiChu('')).toEqual({ ok: true, note: null })
    expect(kiemGhiChu('  \n ')).toEqual({ ok: true, note: null })
    expect(kiemGhiChu(null)).toEqual({ ok: true, note: null })
  })
  it('giữ nguyên xuống dòng bên trong, chỉ cắt khoảng trắng hai đầu, CRLF → LF', () => {
    expect(kiemGhiChu('  dòng 1\r\n\r\ndòng 2  ')).toEqual({ ok: true, note: 'dòng 1\n\ndòng 2' })
  })
  it('chặn quá giới hạn và kiểu sai', () => {
    expect(kiemGhiChu('a'.repeat(GHI_CHU_TOI_DA)).ok).toBe(true)
    expect(kiemGhiChu('a'.repeat(GHI_CHU_TOI_DA + 1)).ok).toBe(false)
    expect(kiemGhiChu(123).ok).toBe(false)
  })
})
