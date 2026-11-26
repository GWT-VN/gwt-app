import { describe, expect, it } from 'vitest'
import { locCua, maMayNgan, queryTab } from './truong-f'

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

describe('tab = bộ lọc chọn sẵn', () => {
  it('locCua: chỉ khoá lọc, sắp theo khoá, bỏ rỗng', () => {
    expect(locCua(new URLSearchParams('view=khan&tt=Open&khan=co&q=&cot_rong=a&xem=X'))).toBe('khan=co&tt=Open')
  })
  it('queryTab: thay bộ lọc bằng loc của tab, giữ dạng xem/cột, bỏ trang/xem', () => {
    expect(queryTab(new URLSearchParams('tt=Done&q=an&bo_cuc=kanban&cot_an=tinh&trang=2&xem=T1'), 'tt=Open&khan=co', 'khan')).toBe(
      'bo_cuc=kanban&cot_an=tinh&tt=Open&khan=co&view=khan',
    )
    expect(queryTab(new URLSearchParams('tt=Done'), '', null)).toBe('')
  })
})
