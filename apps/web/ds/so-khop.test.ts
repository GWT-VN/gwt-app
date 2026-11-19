import { expect, test } from 'vitest'
import { docThamSo, timLyDo } from './so-khop.mjs'

test('docThamSo: không --url thì dùng mặc định localhost:3401', () => {
  expect(docThamSo(['Button'])).toEqual({ comp: 'Button', url: 'http://localhost:3401' })
})
test('docThamSo: --url trước hay sau tên component đều được, bỏ / cuối', () => {
  expect(docThamSo(['Button', '--url', 'http://127.0.0.1:3401/'])).toEqual({ comp: 'Button', url: 'http://127.0.0.1:3401' })
  expect(docThamSo(['--url', 'http://127.0.0.1:3401', 'Button'])).toEqual({ comp: 'Button', url: 'http://127.0.0.1:3401' })
})
test('docThamSo: thiếu component / --url rỗng / cờ lạ / thừa tham số → lỗi', () => {
  expect(() => docThamSo([])).toThrow(/thiếu tên component/)
  expect(() => docThamSo(['--url', 'http://x'])).toThrow(/thiếu tên component/)
  expect(() => docThamSo(['Button', '--url'])).toThrow(/--url thiếu giá trị/)
  expect(() => docThamSo(['Button', '--x'])).toThrow(/cờ lạ/)
  expect(() => docThamSo(['Button', 'Badge'])).toThrow(/thừa tham số/)
})
test('timLyDo: khoá trần áp mọi theme/khổ; khoá @phạm vi chỉ áp đúng chỗ', () => {
  const ly = { 'color': 'a', 'hover.backgroundColor@toi': 'b', 'opacity@toi 390': 'c' }
  expect(timLyDo(ly, 'color', 'sang 1440')).toBe('color')
  expect(timLyDo(ly, 'hover.backgroundColor', 'toi 1440')).toBe('hover.backgroundColor@toi')
  expect(timLyDo(ly, 'hover.backgroundColor', 'sang 1440')).toBeUndefined()
  expect(timLyDo(ly, 'opacity', 'toi 390')).toBe('opacity@toi 390')
  expect(timLyDo(ly, 'opacity', 'toi 1440')).toBeUndefined()
  expect(timLyDo(undefined, 'color', 'sang 1440')).toBeUndefined()
})
