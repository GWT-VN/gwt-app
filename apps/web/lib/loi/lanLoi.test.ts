import { describe, expect, it } from 'vitest'
import { GIOI_HAN_LAN_LOI, lamSachLanLoi, lanTiepTheo } from './lanLoi'

describe('lamSachLanLoi', () => {
  it('cắt khoảng trắng; xử lý trống → null', () => {
    expect(lamSachLanLoi({ mo_ta: '  Lại báo E4  ', xu_ly: '   ' })).toEqual({ ok: true, row: { mo_ta: 'Lại báo E4', xu_ly: null } })
  })
  it('giữ xử lý khi có chữ', () => {
    expect(lamSachLanLoi({ mo_ta: 'Rò nước', xu_ly: ' Thay gioăng ' })).toEqual({ ok: true, row: { mo_ta: 'Rò nước', xu_ly: 'Thay gioăng' } })
  })
  it('mô tả trống / không phải chữ → lỗi', () => {
    expect(lamSachLanLoi({ mo_ta: '  ', xu_ly: 'x' }).ok).toBe(false)
    expect(lamSachLanLoi({ mo_ta: 5 as unknown as string }).ok).toBe(false)
  })
  it('quá dài → lỗi', () => {
    expect(lamSachLanLoi({ mo_ta: 'a'.repeat(GIOI_HAN_LAN_LOI + 1) }).ok).toBe(false)
    expect(lamSachLanLoi({ mo_ta: 'a', xu_ly: 'b'.repeat(GIOI_HAN_LAN_LOI + 1) }).ok).toBe(false)
  })
})

describe('lanTiepTheo', () => {
  it('chưa có lần nào thêm → 2 (lần 1 nằm ở ticket)', () => {
    expect(lanTiepTheo([])).toBe(2)
  })
  it('lấy số lớn nhất + 1, kể cả khi có lỗ hổng do xoá', () => {
    expect(lanTiepTheo([{ lan: 2 }, { lan: 4 }])).toBe(5)
  })
})
