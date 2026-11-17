import { describe, expect, it } from 'vitest'
import { chuanLoaiMoi, laViecBaoTri, loaiChoChon } from './loaiTicket'

const DS = ['Khác', 'Rò rỉ nước', 'Yêu cầu bảo trì', 'Yêu cầu thay lõi lọc', 'hỏng bơm']

describe('laViecBaoTri', () => {
  it('bảo trì / thay lõi / thay ống lọc không phải lỗi', () => {
    for (const s of ['Yêu cầu bảo trì', 'Yêu cầu thay lõi lọc', 'thay ong loc', 'Bảo trì định kỳ']) expect(laViecBaoTri(s)).toBe(true)
    for (const s of ['Rò rỉ nước', 'Khác', 'Lõi lọc bị nứt']) expect(laViecBaoTri(s)).toBe(false)
  })
})

describe('loaiChoChon', () => {
  it('bỏ bảo trì / thay lõi khỏi danh sách chọn', () => {
    expect(loaiChoChon(DS)).toEqual(['Khác', 'Rò rỉ nước', 'hỏng bơm'])
  })
})

describe('chuanLoaiMoi', () => {
  it('trùng loại đã có (hoa thường, dấu, khoảng trắng) → dùng loại đã có', () => {
    expect(chuanLoaiMoi('  ro ri   NUOC ', DS)).toEqual({ ok: true, loai: 'Rò rỉ nước', daCo: true })
    expect(chuanLoaiMoi('Hỏng Bơm', DS)).toEqual({ ok: true, loai: 'hỏng bơm', daCo: true })
  })
  it('loại mới → gọn khoảng trắng', () => {
    expect(chuanLoaiMoi('  Máy  kêu to khi lọc ', DS)).toEqual({ ok: true, loai: 'Máy kêu to khi lọc', daCo: false })
  })
  it('chặn rỗng, quá 80 ký tự, việc bảo trì/thay lõi', () => {
    expect(chuanLoaiMoi('   ', DS).ok).toBe(false)
    expect(chuanLoaiMoi('x'.repeat(81), DS).ok).toBe(false)
    const r = chuanLoaiMoi('yeu cau bao tri', DS)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain('Bảo trì')
  })
})
