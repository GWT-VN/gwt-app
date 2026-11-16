import { describe, expect, it } from 'vitest'
import { GIOI_HAN_TEP, SO_TEP_TOI_DA, docKichThuoc, duongDanTep, kieuTep, kiemTep, thuocTicket } from './tepNhatKy'

describe('kiemTep', () => {
  it('nhận ảnh / video / PDF trong giới hạn', () => {
    expect(kiemTep({ ten: 'a.jpg', loai: 'image/jpeg', kich_thuoc: 1000 }).ok).toBe(true)
    expect(kiemTep({ ten: 'v.mp4', loai: 'video/mp4', kich_thuoc: GIOI_HAN_TEP }).ok).toBe(true)
    expect(kiemTep({ ten: 'bb.pdf', loai: 'application/pdf', kich_thuoc: 5 }).ok).toBe(true)
  })
  it('chặn loại khác, quá 50 MB, rỗng, tên trống', () => {
    expect(kiemTep({ ten: 'x.xlsx', loai: 'application/vnd.ms-excel', kich_thuoc: 5 }).ok).toBe(false)
    expect(kiemTep({ ten: 'v.mp4', loai: 'video/mp4', kich_thuoc: GIOI_HAN_TEP + 1 }).ok).toBe(false)
    expect(kiemTep({ ten: 'a.jpg', loai: 'image/jpeg', kich_thuoc: 0 }).ok).toBe(false)
    expect(kiemTep({ ten: ' ', loai: 'image/jpeg', kich_thuoc: 5 }).ok).toBe(false)
  })
  it('giới hạn số file mỗi lần', () => {
    expect(SO_TEP_TOI_DA).toBeGreaterThan(0)
  })
})

describe('duongDanTep', () => {
  it('thư mục theo ticket, tên bỏ dấu + ký tự lạ, giữ đuôi', () => {
    const p = duongDanTep('TK-2611-003', 'abc', 'Ảnh lỗi máy (1).JPG')
    expect(p).toBe('TK-2611-003/abc-Anh-loi-may-1.JPG')
    expect(thuocTicket(p, 'TK-2611-003')).toBe(true)
    expect(thuocTicket(p, 'TK-2611-004')).toBe(false)
  })
  it('chặn leo thư mục trong mã ticket / đường dẫn', () => {
    expect(duongDanTep('../x', 'id', 'a.png').startsWith('..')).toBe(false)
    expect(thuocTicket('TK-1/../TK-2/a.png', 'TK-1')).toBe(false)
  })
})

describe('kieuTep + docKichThuoc', () => {
  it('phân loại hiển thị', () => {
    expect(kieuTep('image/png')).toBe('anh')
    expect(kieuTep('video/quicktime')).toBe('video')
    expect(kieuTep('application/pdf')).toBe('pdf')
  })
  it('đọc kích thước', () => {
    expect(docKichThuoc(900)).toBe('900 B')
    expect(docKichThuoc(2048)).toBe('2 KB')
    expect(docKichThuoc(5 * 1024 * 1024)).toBe('5,0 MB')
  })
})
