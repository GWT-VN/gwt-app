import { describe, expect, it } from 'vitest'
import { docTatCa, TOI } from '@/bang/locTruong'
import { dieuKienOrTicket, homNayVN } from './loc-db'
import { TRUONG_F } from './truong-f'

const dk = (q: Record<string, string>) => docTatCa(new URLSearchParams(q), TRUONG_F)
const or = (q: Record<string, string>) => dieuKienOrTicket(dk(q), { toiId: 'u1', homNay: '2026-11-26' })

describe('dieuKienOrTicket — TRUONG_F → .or() của v_tickets', () => {
  it('chọn "là" / "không là" (giữ dòng trống) / trống / có giá trị', () => {
    expect(or({ tt: 'Open,Done' })).toEqual(['state.in.("Open","Done")'])
    expect(or({ tinh: 'khong-la~Hà Nội' })).toEqual(['province.is.null,province.not.in.("Hà Nội")'])
    expect(or({ loai: 'trong~' })).toEqual(['ticket_type.is.null,ticket_type.eq.""'])
    expect(or({ loai: 'co~' })).toEqual(['ticket_type.not.is.null', 'ticket_type.neq.""'])
  })

  it('giá trị có phẩy / ngoặc / nháy được bọc, không phá .or()', () => {
    expect(or({ tinh: 'A (B)' })).toEqual(['province.in.("A (B)")'])
    expect(dieuKienOrTicket([{ truong: 'tinh', phep: 'la', giaTri: ['a"b'] }])).toEqual(['province.in.("a\\"b")'])
  })

  it('Phụ trách: tên · Chưa giao · Tôi (= id người đăng nhập)', () => {
    expect(or({ cs: `Lan,-,${TOI}` })).toEqual(['cs_ten.in.("Lan"),cs_phu_trach.is.null,cs_phu_trach.eq.u1'])
    expect(or({ cs: `khong-la~Lan,-` })).toEqual(['cs_ten.is.null,cs_ten.not.in.("Lan")', 'cs_phu_trach.not.is.null'])
    expect(dieuKienOrTicket(dk({ cs: TOI }))[0]).toBe('cs_phu_trach.eq.00000000-0000-0000-0000-000000000000')
  })

  it('Ngày tạo theo giờ VN, "đến ngày" ôm hết ngày', () => {
    expect(or({ tao: 'hom-nay~' })).toEqual(['created_at.gte.2026-11-26T00:00:00+07:00', 'created_at.lt.2026-11-27T00:00:00+07:00'])
    expect(or({ tao: 'khoang~2026-11-01..2026-11-30' })).toEqual(['created_at.gte.2026-11-01T00:00:00+07:00', 'created_at.lt.2026-12-01T00:00:00+07:00'])
    expect(or({ tao: 'truoc~2026-11-20' })).toEqual(['created_at.lt.2026-11-20T00:00:00+07:00'])
  })

  it('Chữ: khách bỏ dấu (ten_kd); máy = tên HOẶC serial; ký tự phá .or() bị bỏ', () => {
    expect(or({ khach: 'chua~An Phát' })).toEqual(['ten_kd.ilike.%an phat%'])
    expect(or({ may: 'chua~CTS(20)' })).toEqual(['product_name.ilike.%CTS 20%,source_serial.ilike.%CTS 20%'])
    expect(or({ may: 'khong-chua~E3' })).toEqual(['product_name.is.null,product_name.not.ilike.%E3%', 'source_serial.is.null,source_serial.not.ilike.%E3%'])
  })

  it('Khẩn: Có / Không / cả hai = không lọc', () => {
    expect(or({ khan: 'co' })).toEqual(['khan.is.true'])
    expect(or({ khan: 'khong-la~co' })).toEqual(['khan.is.false'])
    expect(or({ khan: 'co,khong' })).toEqual([])
  })

  it('loi không dịch ở đây (mảng loi_codes)', () => {
    expect(or({ loi: 'E3' })).toEqual([])
  })

  it('homNayVN: 23:30 UTC = sáng hôm sau ở VN', () => {
    expect(homNayVN(Date.parse('2026-11-25T23:30:00Z'))).toBe('2026-11-26')
  })
})
