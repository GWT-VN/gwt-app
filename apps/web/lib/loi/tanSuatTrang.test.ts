import { describe, expect, it } from 'vitest'
import { khoangMacDinh, chuanThang, danhSachThang, locCa, hienTyLe, hienNgayChay } from './tanSuatTrang'

describe('tanSuatTrang', () => {
  it('mặc định 6 tháng gần nhất theo giờ VN (cuối tháng UTC đã sang tháng sau ở VN)', () => {
    expect(khoangMacDinh(new Date('2026-11-09T05:00:00Z'))).toEqual({ tu: '2026-06', den: '2026-11' })
    expect(khoangMacDinh(new Date('2026-10-31T18:00:00Z'))).toEqual({ tu: '2026-06', den: '2026-11' })
    expect(khoangMacDinh(new Date('2026-03-15T00:00:00Z'))).toEqual({ tu: '2025-10', den: '2026-03' })
  })
  it('chuanThang chỉ nhận YYYY-MM hợp lệ', () => {
    expect(chuanThang('2026-09')).toBe('2026-09')
    for (const x of ['2026-13', '2026-9', 'abc', '', undefined, '2026-00']) expect(chuanThang(x)).toBeNull()
  })
  it('danhSachThang liệt kê đủ, đảo ngược thì rỗng, chặn tối đa 36 tháng', () => {
    expect(danhSachThang('2025-11', '2026-02')).toEqual(['2025-11', '2025-12', '2026-01', '2026-02'])
    expect(danhSachThang('2026-05', '2026-01')).toEqual([])
    expect(danhSachThang('2000-01', '2026-01')).toHaveLength(36)
  })
  it('locCa theo nhóm / máy / lỗi', () => {
    const ca = [
      { nhom: 'g1', internal_code: 'A', loi_code: 'L1' }, { nhom: 'g2', internal_code: 'A', loi_code: 'L2' },
      { nhom: null, internal_code: 'B', loi_code: 'L1' },
    ] as never[]
    expect(locCa(ca, { nhom: 'g1' })).toHaveLength(1)
    expect(locCa(ca, { may: 'A' })).toHaveLength(2)
    expect(locCa(ca, { loi: 'L1', may: 'B' })).toHaveLength(1)
    expect(locCa(ca, {})).toHaveLength(3)
  })
  it('hiển thị: null -> "—", số có % và dấu phẩy VN', () => {
    expect(hienTyLe(null)).toBe('—')
    expect(hienTyLe(3)).toBe('3%')
    expect(hienTyLe(33.33)).toBe('33,33%')
    expect(hienNgayChay(null)).toBe('—')
    expect(hienNgayChay(41)).toBe('41 ngày')
    expect(hienNgayChay(2.5)).toBe('2,5 ngày')
  })
})
