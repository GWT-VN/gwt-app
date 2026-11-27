import { afterEach, expect, test, vi } from 'vitest'
import { cskhNguon } from './nguon'

afterEach(() => vi.unstubAllEnvs())

test('cskhNguon: chỉ đúng "md" mới là MD; trống / giá trị lạ → st (app chạy như cũ)', () => {
  vi.stubEnv('CSKH_NGUON', '')
  expect(cskhNguon()).toBe('st')
  vi.stubEnv('CSKH_NGUON', 'xyz')
  expect(cskhNguon()).toBe('st')
  vi.stubEnv('CSKH_NGUON', 'md')
  expect(cskhNguon()).toBe('md')
})

test('cskhNguon: không đặt biến → st', () => {
  vi.stubEnv('CSKH_NGUON', undefined)
  expect(cskhNguon()).toBe('st')
})
