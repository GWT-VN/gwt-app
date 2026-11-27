import { expect, test } from 'vitest'
import { MA_LOI } from './kiemDauVao'
import { maDeXuat, timTrungTen } from './deXuat'

test('maDeXuat: bỏ dấu, viết hoa, gạch nối; trùng → hậu tố; luôn hợp MA_LOI', () => {
  expect(maDeXuat('Rò nước dưới tủ', [])).toBe('DX-RO-NUOC-DUOI-TU')
  expect(maDeXuat('Rò nước dưới tủ', ['DX-RO-NUOC-DUOI-TU'])).toBe('DX-RO-NUOC-DUOI-TU-2')
  expect(maDeXuat('Rò nước dưới tủ', ['DX-RO-NUOC-DUOI-TU', 'DX-RO-NUOC-DUOI-TU-2'])).toBe('DX-RO-NUOC-DUOI-TU-3')
  expect(maDeXuat('!!!', [])).toBe('DX-LOI')
  const dai = maDeXuat('a'.repeat(80), [])
  expect(dai.length).toBeLessThanOrEqual(40)
  expect(MA_LOI.test(maDeXuat('x'.repeat(80), ['DX-' + 'X'.repeat(34)]))).toBe(true)
})

test('timTrungTen: không dấu / hoa thường / khoảng trắng; bỏ qua lỗi đã ngừng', () => {
  const ds = [
    { code: 'A', ten: 'Rò nước  dưới tủ', trang_thai: 'da_duyet' },
    { code: 'B', ten: 'Kêu to', trang_thai: 'ngung' },
  ]
  expect(timTrungTen('ro nuoc duoi TU', ds)?.code).toBe('A')
  expect(timTrungTen('Kêu to', ds)).toBeUndefined()
})
