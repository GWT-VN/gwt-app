import { describe, expect, it } from 'vitest'
import { VAI_TRO_SUA_DANH_SACH, duocSuaDanhSach } from './sua-danh-sach'
import { laVaiTroHopLe, apDungLoaiTruCapBac } from './vai-tro'

describe('duocSuaDanhSach — theo vai trò "Sửa danh sách người" (Hiệp 19/11)', () => {
  it('vai trò hợp lệ, có trong danh sách vai trò toàn công ty', () => {
    expect(laVaiTroHopLe(VAI_TRO_SUA_DANH_SACH)).toBe(true)
  })
  it('giữ vai trò → được (kèm vai trò khác cũng được)', () => {
    expect(duocSuaDanhSach(['cs_manager', 'sales_manager', 'sua_ds_nguoi'])).toBe(true)
    expect(duocSuaDanhSach(['admin', 'sua_ds_nguoi'])).toBe(true)
  })
  it('không giữ vai trò → không, kể cả Toàn quyền, Trưởng CSKH, CEO; rỗng → không', () => {
    for (const v of [['admin'], ['cs_manager'], ['ceo'], [], null, undefined, 'admin']) expect(duocSuaDanhSach(v)).toBe(false)
  })
  it('kiêm với Trưởng CSKH không bị luật loại trừ cấp bậc gỡ mất', () => {
    expect(apDungLoaiTruCapBac(['cs_manager', 'sua_ds_nguoi'])).toEqual(['cs_manager', 'sua_ds_nguoi'])
    expect(apDungLoaiTruCapBac(['cs', 'sua_ds_nguoi'])).toEqual(['cs', 'sua_ds_nguoi'])
  })
})
