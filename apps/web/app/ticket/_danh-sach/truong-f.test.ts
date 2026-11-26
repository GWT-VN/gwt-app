import { describe, expect, it } from 'vitest'
import { maMayNgan } from './truong-f'

// Tên lấy đúng dạng product_name trên prod (đo 26/11, v_installed_base).
describe('maMayNgan', () => {
  it.each([
    ['Máy lọc nước GE GN610', 'GPUN-4000XEN-G', 'GN610'],
    ['Máy lọc nước GE CTS10 (màu trắng)', 'CTS10NW', 'CTS10'],
    ['Máy lọc nước GE CTS20', 'CTS20NG', 'CTS20'],
    ['Thiết bị tiền lọc GE GTEP-50A01-G', 'GTEP-50A01-G', 'GTEP-50A01-G'],
    ['Máy lạ không theo mẫu', 'X1', 'X1'],
    [null, null, '—'],
  ])('%s → %s', (product_name, internal_code, mong) => {
    expect(maMayNgan({ product_name, internal_code })).toBe(mong)
  })
})
