import { describe, expect, it } from 'vitest'
import { tinhTanSuat, trungVi, type DongCa } from './tanSuat'

const ca = (p: Partial<DongCa>): DongCa => ({ ticket_code: 'T', loi_code: 'L1', loi_ten: 'Rò nước đáy', nhom: 'ro_nuoc', nhom_ten: 'Rò nước',
  internal_code: 'CTS20NG', may: null, ngay_bao: '2026-10-10', thang: '2026-10', install_date: null, ...p })

describe('lib/loi/tanSuat', () => {
  it('trung vị', () => {
    expect(trungVi([])).toBeNull(); expect(trungVi([5, 1, 3])).toBe(3); expect(trungVi([1, 2, 3, 10])).toBe(2.5)
  })
  it('gom theo lỗi × model, đếm theo tháng, tỷ lệ theo bán lũy kế, ngày chạy, lặp lại', () => {
    const r = tinhTanSuat([
      ca({ ticket_code: 'A', may: 'S1', install_date: '2026-09-10', ngay_bao: '2026-10-10' }),
      ca({ ticket_code: 'B', may: 'S1', thang: '2026-11', ngay_bao: '2026-11-01', install_date: '2026-09-10' }),
      ca({ ticket_code: 'C', may: 'S2' }),
      ca({ ticket_code: 'D', loi_code: 'L2', loi_ten: 'E5', internal_code: 'GTUN', nhom: null, nhom_ten: null }),
    ], [{ internal_code: 'CTS20NG', thang: '2026-08', so: 100 }, { internal_code: 'CTS20NG', thang: '2026-12', so: 999 }],
       [], { tu: '2026-10', den: '2026-11' })
    expect(r[0]).toMatchObject({ loi_code: 'L1', internal_code: 'CTS20NG', so_ca: 3, theo_thang: { '2026-10': 2, '2026-11': 1 },
      ban_luy_ke: 100, ty_le_ban: 3, nhap_luy_ke: null, ty_le_nhap: null, trung_vi_ngay_chay: 41, so_may_lap_lai: 1 })
    expect(r[1]).toMatchObject({ loi_code: 'L2', nhom_ten: '(chưa gắn nhóm)', so_ca: 1, ty_le_ban: null })
  })
  it('lọc tháng ngoài khoảng', () => {
    expect(tinhTanSuat([ca({ thang: '2026-01' })], [], [], { tu: '2026-10' })).toEqual([])
  })
  it('mẫu số 0 hoặc thiếu → tỷ lệ null (không Infinity/NaN)', () => {
    const r = tinhTanSuat([ca({})], [{ internal_code: 'CTS20NG', thang: '2026-08', so: 0 }], [{ internal_code: 'KHAC', thang: '2026-08', so: 5 }], {})
    expect(r[0]).toMatchObject({ ban_luy_ke: null, ty_le_ban: null, nhap_luy_ke: null, ty_le_nhap: null })
  })
  it('không có "den" thì mẫu số tính mọi tháng; tỷ lệ làm tròn 2 số lẻ', () => {
    const r = tinhTanSuat([ca({})], [{ internal_code: 'CTS20NG', thang: '2026-08', so: 3 }, { internal_code: 'CTS20NG', thang: '2027-01', so: 0 }], [], {})
    expect(r[0].ty_le_ban).toBe(33.33)
  })
  it('bỏ ngày chạy âm; cùng ticket báo hai dòng không tính là lặp lại', () => {
    const r = tinhTanSuat([
      ca({ ticket_code: 'A', may: 'S1', install_date: '2026-11-01', ngay_bao: '2026-10-10' }),
      ca({ ticket_code: 'A', may: 'S1' }),
    ], [], [], {})
    expect(r[0].trung_vi_ngay_chay).toBeNull()
    expect(r[0].so_may_lap_lai).toBe(0)
  })
  it('sắp xếp: số ca giảm dần, rồi tên lỗi, rồi model', () => {
    const r = tinhTanSuat([
      ca({ loi_code: 'B', loi_ten: 'B' }), ca({ loi_code: 'A', loi_ten: 'A', internal_code: 'Y' }),
      ca({ loi_code: 'A', loi_ten: 'A', internal_code: 'X' }),
    ], [], [], {})
    expect(r.map((x) => `${x.loi_code}/${x.internal_code}`)).toEqual(['A/X', 'A/Y', 'B/CTS20NG'])
  })
})
