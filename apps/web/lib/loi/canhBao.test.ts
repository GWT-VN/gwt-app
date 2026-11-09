import { describe, expect, it } from 'vitest'
import { CANH_BAO, canhBaoTuQuery } from './canhBao'

describe('canhBaoTuQuery', () => {
  it('mã biết -> câu tiếng Việt cố định', () => {
    expect(canhBaoTuQuery('dong_may_chua_luu')).toBe(CANH_BAO.dong_may_chua_luu)
    expect(canhBaoTuQuery(['dong_may_chua_luu', 'x'])).toBe(CANH_BAO.dong_may_chua_luu)
  })
  it('giá trị lạ / văn bản tuỳ ý / khoá nguyên mẫu -> bỏ qua', () => {
    for (const v of [undefined, '', 'Đã tạo ticket nhưng <b>x</b>', 'toString', '__proto__', 'constructor', 'DONG_MAY_CHUA_LUU'])
      expect(canhBaoTuQuery(v)).toBeNull()
  })
})

describe('I1: chức năng dòng máy chưa bật (thiếu bảng) khi tạo ticket', () => {
  it('có mã cảnh báo riêng', () => {
    expect(canhBaoTuQuery('dong_may_tam_tat')).toMatch(/dòng máy/)
  })
})
