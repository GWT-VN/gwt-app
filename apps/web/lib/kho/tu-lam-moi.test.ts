import { describe, expect, it } from 'vitest'
import { nenLamMoi } from './tu-lam-moi'

describe('lib/kho/tu-lam-moi — tự làm mới trang Kho', () => {
  it('chỉ làm mới khi tab đang hiện, không gõ, không mở hộp sửa', () => {
    expect(nenLamMoi({ hien: true, dangGo: false, coHop: false })).toBe(true)
    expect(nenLamMoi({ hien: false, dangGo: false, coHop: false })).toBe(false)
    expect(nenLamMoi({ hien: true, dangGo: true, coHop: false })).toBe(false)
    expect(nenLamMoi({ hien: true, dangGo: false, coHop: true })).toBe(false)
  })
})
