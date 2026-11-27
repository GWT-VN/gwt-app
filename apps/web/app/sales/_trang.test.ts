import { expect, test } from 'vitest'
import { catTrang, soSanh } from './_trang'
import { ngayTuLinkCu } from './truong-sales'

test('sắp: trống luôn xuống cuối dù tăng hay giảm; chuỗi theo tiếng Việt', () => {
  const ds = [{ v: null }, { v: 'b' }, { v: 'Ă' }, { v: 'a' }] as { v: string | null }[]
  expect([...ds].sort(soSanh((r) => r.v, true)).map((r) => r.v)).toEqual(['a', 'Ă', 'b', null])
  expect([...ds].sort(soSanh((r) => r.v, false)).map((r) => r.v)).toEqual(['b', 'Ă', 'a', null])
  expect([{ n: 2 }, { n: 10 }].sort(soSanh((r) => r.n, true)).map((r) => r.n)).toEqual([2, 10])
})

test('cắt trang 50 dòng; trang quá số trang → trang cuối', () => {
  const ds = Array.from({ length: 120 }, (_, i) => i)
  expect(catTrang(ds, 1)).toMatchObject({ tong: 120, soTrang: 3, rows: ds.slice(0, 50) })
  expect(catTrang(ds, 9).rows).toEqual(ds.slice(100))
  expect(catTrang([], 1)).toEqual({ rows: [], tong: 0, soTrang: 1 })
})

test('link cũ ngtu/ngden → trường ngày (ngden tính cả ngày đó)', () => {
  expect(ngayTuLinkCu('2026-11-01', '2026-11-20')).toBe('khoang~2026-11-01..2026-11-20')
  expect(ngayTuLinkCu('2026-11-01')).toBe('sau~2026-11-01')
  expect(ngayTuLinkCu(undefined, '2026-11-20')).toBe('khoang~1900-01-01..2026-11-20')
  expect(ngayTuLinkCu('xau')).toBeNull()
})
