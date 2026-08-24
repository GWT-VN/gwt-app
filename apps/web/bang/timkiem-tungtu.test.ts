import { describe, it, expect } from 'vitest'
import { dieuKienTungTu } from './timkiem'

/**
 * `dieuKienTungTu()` trả về MỘT chuỗi `.or()` cho MỖI TỪ. Gọi bên ngoài phải áp lần lượt
 * — PostgREST AND các `.or()` liên tiếp lại, nên thành "mọi từ đều phải khớp".
 */
describe('dieuKienTungTu', () => {
  it('mỗi từ một điều kiện, không gộp cả câu vào một mẫu', () => {
    const dk = dieuKienTungTu('Nguyễn Văn', ['ten_kd'], ['primary_phone'])
    expect(dk).toHaveLength(2)
    expect(dk[0]).toBe('ten_kd.imatch.\\mnguyen,primary_phone.ilike.%nguyen%')
    expect(dk[1]).toBe('ten_kd.imatch.\\mvan,primary_phone.ilike.%van%')
  })

  it('bỏ dấu — gõ có dấu hay không đều ra cùng điều kiện', () => {
    expect(dieuKienTungTu('Phượng', ['ten_kd'])).toEqual(dieuKienTungTu('phuong', ['ten_kd']))
  })

  it('gõ ĐẢO thứ tự ra cùng bộ điều kiện, chỉ khác thứ tự -> cùng kết quả sau khi AND', () => {
    const a = dieuKienTungTu('linh sg', ['ten_kd']).sort()
    const b = dieuKienTungTu('sg linh', ['ten_kd']).sort()
    expect(a).toEqual(b)
  })

  it('khoảng trắng thừa không đẻ ra điều kiện rỗng (rỗng = khớp mọi dòng)', () => {
    expect(dieuKienTungTu('  linh   sg  ', ['ten_kd'])).toHaveLength(2)
  })

  it('câu rỗng -> không lọc gì', () => {
    expect(dieuKienTungTu('', ['ten_kd'])).toEqual([])
    expect(dieuKienTungTu('   ', ['ten_kd'])).toEqual([])
  })

  it('ký tự phá cú pháp .or() bị dọn, ký tự regex bị thoát', () => {
    // Người dùng gõ "[" từng làm PostgREST trả HTTP 400 và vỡ trang, không phải ra rỗng.
    const dk = dieuKienTungTu('a[b', ['ten_kd'])
    expect(dk.join()).not.toContain(',a[')
    expect(dk.join()).toContain('\\[')
    // Dấu phẩy là cú pháp của .or() -> phải biến mất khỏi từ khoá.
    expect(dieuKienTungTu('a,b', ['ten_kd'])).toHaveLength(2)
  })

  it('cột chuỗi con dùng ilike, cột tên dùng khớp ĐẦU TỪ', () => {
    const dk = dieuKienTungTu('15a', ['ten_kd'], ['serial'])[0]
    expect(dk).toContain('ten_kd.imatch.\\m15a')
    expect(dk).toContain('serial.ilike.%15a%')
  })
})
