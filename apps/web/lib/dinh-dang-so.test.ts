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

test('docSo: cuối chuỗi là dấu + 1–2 chữ số → phần lẻ, làm tròn về số nguyên VND', () => {
  expect(docSo('1.250.000,00')).toBe(1250000)
  expect(docSo('1,250,000.00')).toBe(1250000)
  expect(docSo('1.250.000,50')).toBe(1250001)
  expect(docSo('12,5')).toBe(13)
  expect(docSo('12.4')).toBe(12)
})

test('docSo: đúng 3 chữ số sau dấu → phân cách hàng nghìn', () => {
  expect(docSo('1,250,000')).toBe(1250000)
  expect(docSo('12.500')).toBe(12500)
})

test('docSo: số âm bỏ dấu âm (ô tiền không âm)', () => {
  expect(docSo('-500.000')).toBe(500000)
})
