// @vitest-environment jsdom
// Focus đến từ chuột mang cờ data-focus-chuot (DsRoot tắt vòng focus); gõ phím gỡ cờ (CEO 26/11 "Nhớ sửa trạng thái focus").
import { expect, test } from 'vitest'
import { TAT_VIEN_FOCUS_CHUOT } from './focus-chuot'

const nut = () => {
  const b = document.createElement('button')
  document.body.appendChild(b)
  return b
}

test('chuột rồi focus (vd Radix trả focus khi đóng menu) → có cờ; rời focus → gỡ cờ', () => {
  const b = nut()
  window.dispatchEvent(new Event('pointerdown'))
  b.focus()
  expect(b.hasAttribute('data-focus-chuot')).toBe(true)
  b.blur()
  expect(b.hasAttribute('data-focus-chuot')).toBe(false)
})

test('đang mang cờ mà gõ phím → gỡ cờ ngay (vòng focus hiện lại)', () => {
  const b = nut()
  window.dispatchEvent(new Event('pointerdown'))
  b.focus()
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
  expect(b.hasAttribute('data-focus-chuot')).toBe(false)
})

test('lần nhập cuối là phím → focus không mang cờ', () => {
  const b = nut()
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
  b.focus()
  expect(b.hasAttribute('data-focus-chuot')).toBe(false)
  expect(TAT_VIEN_FOCUS_CHUOT).toContain('[data-focus-chuot]:focus-visible')
})
