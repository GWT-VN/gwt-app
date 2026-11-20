import { expect, test } from 'vitest'
import { dinhDangSo, docSo } from './dinh-dang-so'

test('docSo: bỏ mọi ký tự không phải số (dán "1.250.000 ₫")', () => {
  expect(docSo('1.250.000 ₫')).toBe(1250000)
  expect(docSo(' 12a3 ')).toBe(123)
})

test('docSo: rỗng / không có chữ số → null (không phải 0)', () => {
  expect(docSo('')).toBeNull()
  expect(docSo('abc')).toBeNull()
  expect(docSo('₫')).toBeNull()
})

test('docSo: "0" là số 0, không phải null', () => {
  expect(docSo('0')).toBe(0)
})

test('dinhDangSo: dấu chấm hàng nghìn vi-VN', () => {
  expect(dinhDangSo(1250000)).toBe('1.250.000')
  expect(dinhDangSo(0)).toBe('0')
  expect(dinhDangSo(999)).toBe('999')
})
