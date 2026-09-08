import { describe, it, expect } from 'vitest'
import { kiemTraThan, timPii, KHU_HOP_LE, type ItemIngest } from './kiem-tra'

const item = (phan: Partial<ItemIngest> = {}): ItemIngest => ({
  message_id: '1486224918499692654', thread_id: null, cau_hoi: 'Lõi CTD50 ở đâu?', tra_loi: 'Trên cùng, dưới nắp.',
  nguoi_tra_loi: 'Minh Ánh', tra_loi_luc: '2026-09-07T03:10:00Z', jump_link: 'https://discord.com/channels/1484009253831315456/1484057657043189860/1486224918499692654',
  nguon_ids: ['1486224918499692654'], khu_goi_y: 'sales', do_tin_cay: 0.82, ...phan,
})
const than = (phan: Record<string, unknown> = {}) => ({ kenh_id: '1484057657043189860', watermark_moi: '1486224918499692654', items: [item()], ...phan })

describe('kiemTraThan', () => {
  it('thân hợp lệ → ok, giữ nguyên giá trị, chuẩn hoá trường thiếu', () => {
    const kq = kiemTraThan(than({ items: [{ ...item(), thread_id: undefined, nguon_ids: undefined, khu_goi_y: 'linh-tinh', do_tin_cay: '0.5' }] }))
    expect(kq.ok).toBe(true)
    if (!kq.ok) return
    expect(kq.than.kenh_id).toBe('1484057657043189860')
    expect(kq.than.items[0].thread_id).toBeNull()
    expect(kq.than.items[0].nguon_ids).toEqual([])
    expect(kq.than.items[0].khu_goi_y).toBeNull()     // khu lạ → null (app không tin routine)
    expect(kq.than.items[0].do_tin_cay).toBeNull()    // chuỗi → không phải số
  })
  it.each([
    ['không phải object', 'x'],
    ['thiếu kenh_id', than({ kenh_id: undefined })],
    ['kenh_id không phải chuỗi số', than({ kenh_id: 'abc' })],
    ['items không phải mảng', than({ items: {} })],
    ['item thiếu cau_hoi', than({ items: [{ ...item(), cau_hoi: '' }] })],
    ['message_id sai dạng', than({ items: [item({ message_id: '12' })] })],
    ['jump_link không phải discord', than({ items: [item({ jump_link: 'https://evil.example/x' })] })],
    ['tra_loi quá dài', than({ items: [item({ tra_loi: 'a'.repeat(8001) })] })],
    ['quá 200 item', than({ items: Array.from({ length: 201 }, (_, i) => item({ message_id: String(1000000000000000000 + i) })) })],
  ])('từ chối: %s', (_ten, x) => {
    const kq = kiemTraThan(x)
    expect(kq.ok).toBe(false)
    if (!kq.ok) expect(kq.loi.length).toBeGreaterThan(0)
  })
  it('watermark_moi thiếu → null; items rỗng vẫn hợp lệ (routine chỉ dời watermark)', () => {
    const kq = kiemTraThan(than({ watermark_moi: undefined, items: [] }))
    expect(kq.ok && kq.than.watermark_moi === null && kq.than.items.length === 0).toBe(true)
  })
  it('KHU_HOP_LE là 7 khu wiki', () => expect(KHU_HOP_LE).toEqual(['cong-viec-chung', 'sales', 'cskh', 'van-hanh', 'tai-chinh', 'kien-thuc-nen', 'san-pham']))
})

describe('timPii', () => {
  it.each([
    ['SĐT liền', 'gọi 0912345678 nhé', ['0912345678']],
    ['SĐT có dấu cách/chấm', 'sđt 0912 345 678 hoặc 038.123.4567', ['0912 345 678', '038.123.4567']],
    ['+84', 'zalo +84912345678', ['+84912345678']],
    ['email', 'gửi về khach@gmail.com', ['khach@gmail.com']],
  ])('bắt %s', (_t, s, kq) => expect(timPii(s)).toEqual(kq))
  it.each([
    ['số hoá đơn 10 số bắt đầu 1', 'HĐ số 1234567890'],
    ['mã máy', 'CTD50 giá 5.490.000đ'],
    ['số 9 chữ số', '091234567'],
    ['dải giả 0900000xxx', 'test 0900000123'],
  ])('không bắt %s', (_t, s) => expect(timPii(s)).toEqual([]))
})
