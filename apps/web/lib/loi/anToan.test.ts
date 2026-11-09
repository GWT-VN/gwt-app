import { describe, expect, it, vi } from 'vitest'
import { redirect } from 'next/navigation'
import { docAnToan, kemDongMayAnToan, THIEU_DANH_MUC } from './anToan'
import type { DongMay } from './kieu'

const dong = (ticket_code: string): DongMay => ({
  id: 'x', ticket_code, thu_tu: 1, serial: null, source_serial: 'S1', internal_code: 'M1', loi_code: 'CHUA_PHAN_LOAI',
  loi_ten: 'Chưa phân loại', mo_ta: null, huong_xu_ly: null, huong_xu_ly_nguon: null, trang_thai: 'dang_xu_ly', nguon: 'tu_dong',
  created_at: '2026-11-09',
} as DongMay)

describe('docAnToan — bảng/migration chưa có thì trang vẫn chạy', () => {
  it('lỗi DB -> giá trị mặc định + cờ loi, log phía server', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const r = await docAnToan('danhMucLoi', async () => { throw new Error('relation "loi_danh_muc" does not exist') }, [])
    expect(r).toEqual({ data: [], loi: true })
    expect(log).toHaveBeenCalled()
    log.mockRestore()
  })
  it('thành công -> dữ liệu thật, loi=false', async () => {
    expect(await docAnToan('x', async () => [1], [])).toEqual({ data: [1], loi: false })
  })
  it('KHÔNG nuốt redirect của Next (doQuyen)', async () => {
    await expect(docAnToan('x', async () => redirect('/?loi=khong_du_quyen'), [])).rejects.toThrow()
  })
  it('có câu thông báo cho người dùng', () => {
    expect(THIEU_DANH_MUC).toMatch(/danh mục lỗi/i)
  })
})

describe('kemDongMayAnToan — cột Máy trong danh sách ticket', () => {
  const rows = [{ ticket_code: 'T1' }, { ticket_code: 'T2' }]
  it('đọc ticket_may lỗi -> trả nguyên dòng, không có dong_may, không ném', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const r = await kemDongMayAnToan(rows, async () => { throw new Error('PGRST205 ticket_may') })
    expect(r).toEqual(rows)
    expect(r[0]).not.toHaveProperty('dong_may')
    log.mockRestore()
  })
  it('đọc được -> gắn dong_may theo từng ticket', async () => {
    const r = await kemDongMayAnToan(rows, async () => ({ T1: [dong('T1')] }))
    expect(r[0].dong_may).toEqual([{ nhan: 'M1 · Chưa phân loại', serial: 'S1', chuaPhanLoai: true }])
    expect(r[1].dong_may).toEqual([])
  })
  it('không có dòng -> không gọi đọc', async () => {
    const doc = vi.fn()
    expect(await kemDongMayAnToan([], doc)).toEqual([])
    expect(doc).not.toHaveBeenCalled()
  })
})
