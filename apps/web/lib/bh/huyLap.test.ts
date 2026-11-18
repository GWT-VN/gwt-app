import { describe, expect, it } from 'vitest'
import { kiemLyDoHuy, kiemNgayBo } from './huyLap'

describe('kiemLyDoHuy', () => {
  it('bắt buộc, gọn khoảng trắng', () => {
    expect(kiemLyDoHuy('  nhập   nhầm khách ')).toEqual({ ok: true, lyDo: 'nhập nhầm khách' })
    expect(kiemLyDoHuy('sai').ok).toBe(false)
    expect(kiemLyDoHuy(undefined).ok).toBe(false)
    expect(kiemLyDoHuy('x'.repeat(301)).ok).toBe(false)
  })
})

describe('kiemNgayBo', () => {
  const now = new Date('2026-11-18T09:00:00Z')
  it('ngày hợp lệ', () => expect(kiemNgayBo('2026-11-15', now)).toEqual({ ok: true, ngay: '2026-11-15' }))
  it('tương lai (theo giờ VN) → chặn; hôm nay giờ VN → được', () => {
    expect(kiemNgayBo('2026-11-19', now).ok).toBe(false)
    expect(kiemNgayBo('2026-11-19', new Date('2026-11-18T18:00:00Z')).ok).toBe(true)
  })
  it('sai dạng / không có thật / quá xa → chặn', () => {
    expect(kiemNgayBo('15/11/2026', now).ok).toBe(false)
    expect(kiemNgayBo('2026-02-30', now).ok).toBe(false)
    expect(kiemNgayBo('2010-01-01', now).ok).toBe(false)
  })
})
