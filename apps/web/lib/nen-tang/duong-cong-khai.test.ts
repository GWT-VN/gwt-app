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
  expect(laDuongCongKhai('/ds-x', 'development')).toBe(false)
})

test('/login, /auth chỉ khớp đúng đoạn — không cho qua /login-foo, /authority (CEO chốt siết 19/11)', () => {
  expect(laDuongCongKhai('/login-foo', 'production')).toBe(false)
  expect(laDuongCongKhai('/loginx', 'production')).toBe(false)
  expect(laDuongCongKhai('/authority', 'production')).toBe(false)
  expect(laDuongCongKhai('/auth-x', 'production')).toBe(false)
  expect(laDuongCongKhai('/auth', 'production')).toBe(true)
  expect(laDuongCongKhai('/auth/doi-mat-khau', 'production')).toBe(true)
  expect(laDuongCongKhai('/login/', 'production')).toBe(true)
})
