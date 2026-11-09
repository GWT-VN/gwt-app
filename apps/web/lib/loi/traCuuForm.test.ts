import { describe, expect, it } from 'vitest'
import { dongThem, dongBo, ngayVN, mucTuKetQuaKhach, dongDuDieuKien, SO_DONG_TOI_DA } from './traCuuForm'
import type { KhachVaMay } from './kieu'

const S1 = 'A12345678ABC12345678'
describe('ngayVN', () => {
  it('yyyy-mm-dd -> dd/mm/yyyy, rỗng -> —', () => {
    expect(ngayVN('2026-03-07')).toBe('07/03/2026')
    expect(ngayVN(null)).toBe('—')
  })
})
describe('dòng máy', () => {
  it('thêm tới 20 thì dừng', () => {
    let d = [{}]
    for (let i = 0; i < 30; i++) d = dongThem(d)
    expect(d).toHaveLength(SO_DONG_TOI_DA)
  })
  it('bỏ dòng nhưng luôn còn ít nhất 1', () => {
    expect(dongBo([{ serial: 'a' }, { serial: 'b' }], 0)).toEqual([{ serial: 'b' }])
    expect(dongBo([{ serial: 'a' }], 0)).toEqual([{ serial: 'a' }])
  })
})
describe('mucTuKetQuaKhach', () => {
  const ds: KhachVaMay[] = [
    { id: 'k1', full_name: 'An', primary_phone: '0901', may: [
      { serial: S1, internal_code: 'M1', product_name: 'Máy A', install_date: null, warranty_activated: true },
      { serial: 'Z', internal_code: 'M2', product_name: null, install_date: null, warranty_activated: false }] },
    { id: 'k2', full_name: 'Bình', primary_phone: null, may: [] },
  ]
  it('mỗi máy một mục + khách chưa có máy một mục', () => {
    const m = mucTuKetQuaKhach(ds)
    expect(m.map((x) => x.gt)).toEqual([`k1|${S1}`, 'k1|Z', 'k2|'])
    expect(m[0].nhan).toBe(`An — Máy A · ${S1}`)
    expect(m[1].nhan).toBe('An — M2 · Z')
    expect(m[1].phu).toContain('chưa kích hoạt')
    expect(m[2].nhan).toBe('Bình — chưa có máy')
  })
})
describe('dongDuDieuKien', () => {
  it('cần ≥1 dòng có serial hợp lệ hoặc tra cứu ≠ sai_dang; không dòng nào sai dạng', () => {
    expect(dongDuDieuKien([{ serial: S1 }], {})).toBe(true)
    expect(dongDuDieuKien([{ serial: '' }], {})).toBe(false)
    expect(dongDuDieuKien([{ serial: 'Z1234' }], {})).toBe(false)
    expect(dongDuDieuKien([{ serial: 'Z1234' }], { Z1234: 'da_lap' })).toBe(true)
    expect(dongDuDieuKien([{ serial: 'Z1234' }], { Z1234: 'sai_dang' })).toBe(false)
    expect(dongDuDieuKien([{ serial: S1 }, { serial: 'Z1234' }], {})).toBe(false)
    expect(dongDuDieuKien([{ serial: S1 }, { serial: '' }], {})).toBe(true)
  })
})

import { duongDanSauTao, dongLechKhach } from './traCuuForm'
describe('duongDanSauTao', () => {
  it('luôn đi tới trang ticket, kèm cảnh báo (mã hoá) nếu có', () => {
    expect(duongDanSauTao('TK-2611-001')).toBe('/ticket/TK-2611-001')
    expect(duongDanSauTao('TK-2611-001', 'dong_may_chua_luu')).toBe('/ticket/TK-2611-001?canhBao=dong_may_chua_luu')
  })
})
describe('dongLechKhach', () => {
  const kq = { [S1]: { loai: 'da_lap' as const, serial: S1, internal_code: null, product_name: null, customer_id: 'kA', customer_name: 'A', install_date: null, warranty_activated: true } }
  it('báo serial đã lắp cho khách khác', () => {
    expect(dongLechKhach([{ serial: S1 }], kq, 'kB')).toEqual([{ serial: S1, khach: 'A' }])
    expect(dongLechKhach([{ serial: S1 }], kq, 'kA')).toEqual([])
    expect(dongLechKhach([{ serial: S1 }], kq, '')).toEqual([])
  })
})
