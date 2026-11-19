import { expect, test } from 'vitest'
import { laDuongCongKhai } from './duong-cong-khai'

test('/login, /auth luôn công khai (kể cả production)', () => {
  expect(laDuongCongKhai('/login', 'production')).toBe(true)
  expect(laDuongCongKhai('/auth/callback', 'production')).toBe(true)
})

test('/ds công khai chỉ ngoài production', () => {
  expect(laDuongCongKhai('/ds', 'development')).toBe(true)
  expect(laDuongCongKhai('/ds/button', undefined)).toBe(true)
  expect(laDuongCongKhai('/ds', 'production')).toBe(false)
  expect(laDuongCongKhai('/ds/button', 'production')).toBe(false)
})

test('đường khác không công khai; /ds chỉ khớp đúng đoạn (không khớp /dsx)', () => {
  expect(laDuongCongKhai('/ticket', 'development')).toBe(false)
  expect(laDuongCongKhai('/dsx', 'development')).toBe(false)
})
