import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { cheThongTin, docFileDuyet, taoFileChuyenGia, COT_PA, type DuLieuChuyenGia } from './xuatChuyenGia'
import type { LoiDanhMuc } from './kieu'

const loi = (x: Partial<LoiDanhMuc>): LoiDanhMuc => ({
  code: 'X', nhom: null, ten: 'X', aliases: [], ma_may: [], dau_hieu: null, huong_xu_ly: null, nguon: null,
  trang_thai: 'da_duyet', duyet_boi: null, duyet_luc: null, thu_tu: 10, ...x,
})

const duLieu: DuLieuChuyenGia = {
  danhMuc: [
    loi({ code: 'CTS20-RO-DAY', nhom: 'RO-RI-NUOC', ten: 'CTS20: rò nước dưới đáy máy', dau_hieu: 'Nước đọng dưới đáy',
      huong_xu_ly: 'Tạm thời: rút điện, lau khô, theo dõi', huong_duyet: false }),
    loi({ code: 'MUI-LA', nhom: 'CHAT-LUONG-NUOC', ten: 'Nước có mùi lạ', huong_xu_ly: 'Súc rửa bình', huong_duyet: true }),
    loi({ code: 'CU-BO', ten: 'Mã cũ', trang_thai: 'ngung' }),
  ],
  nhom: [{ code: 'RO-RI-NUOC', ten: 'Rò rỉ nước' }, { code: 'CHAT-LUONG-NUOC', ten: 'Chất lượng nước' }],
  dongTicket: [
    { ticket_code: 'GWT-260053', loi_code: 'CTS20-RO-DAY', internal_code: 'CTS20NG', trang_thai: 'dang_xu_ly',
      mo_ta: 'Khách gọi 0900 000 001: nước chảy thành vũng', huong_xu_ly: 'Đã hướng dẫn tắt chế độ lạnh', huong_xu_ly_nguon: 'cs',
      lan: [{ lan: 1, mo_ta: 'Chảy nước đáy', xu_ly: 'Gửi mail a@b.vn hỏi hãng' }] },
    { ticket_code: 'GWT-260054', loi_code: 'CTS20-RO-DAY', internal_code: 'CTS20NG', trang_thai: 'da_xu_ly',
      mo_ta: 'Rò đáy', huong_xu_ly: null, huong_xu_ly_nguon: null, lan: [] },
  ],
  ngayXuat: '2026-11-18',
}

const docLai = (buf: Buffer) => {
  const wb = XLSX.read(buf, { type: 'buffer' })
  return { wb, rows: (t: string) => XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[t], { defval: '' }) }
}
const coSan = new Map([
  ['CTS20-RO-DAY', { huong_xu_ly: 'Tạm thời: rút điện, lau khô, theo dõi', huong_duyet: false }],
  ['MUI-LA', { huong_xu_ly: 'Súc rửa bình', huong_duyet: true }],
])

describe('cheThongTin', () => {
  it('che SĐT (liền, có cách, +84) và email; giữ phần còn lại', () => {
    expect(cheThongTin('gọi 0900000001 hoặc 0900 000 002, +84 900 000 003, mail test@example.com nhé'))
      .toBe('gọi [SĐT] hoặc [SĐT], [SĐT], mail [email] nhé')
  })
  it('không che serial / số tiền / mã máy / ngày', () => {
    const s = 'Serial F00000266V9400030067, phí 350.000đ, máy CTS20NG, 13/09/2026'
    expect(cheThongTin(s)).toBe(s)
  })
  it('null → ""', () => expect(cheThongTin(null)).toBe(''))
})

describe('taoFileChuyenGia — file duyệt PHƯƠNG ÁN XỬ LÝ', () => {
  const { wb, rows } = docLai(taoFileChuyenGia(duLieu))

  it('3 trang: Hướng dẫn · Phương án xử lý · Ticket tham khảo', () => {
    expect(wb.SheetNames).toEqual(['Hướng dẫn', 'Phương án xử lý', 'Ticket tham khảo'])
  })
  it('mỗi mã lỗi đang dùng một dòng (bỏ mã ngừng), đủ cột, cột chuyên gia để trống', () => {
    const pa = rows('Phương án xử lý')
    expect(pa.map((r) => r['Mã lỗi'])).toEqual(['CTS20-RO-DAY', 'MUI-LA'])
    expect(Object.keys(pa[0])).toEqual([...COT_PA])
    expect(pa[0]['Phương án đề xuất']).toBe('Tạm thời: rút điện, lau khô, theo dõi')
    expect(pa[0]['Đang hiện trên ticket']).toBe('Chưa — chờ duyệt')
    expect(pa[1]['Đang hiện trên ticket']).toBe('Có')
    expect([pa[0]['Chuyên gia duyệt'], pa[0]['Phương án chuyên gia sửa'], pa[0]['Ý kiến chuyên gia']]).toEqual(['', '', ''])
  })
  it('tham khảo: số ticket, ví dụ khách báo + cách CS đã xử lý thật — đã che SĐT / email', () => {
    const d = rows('Phương án xử lý')[0]
    expect(d['Số ticket']).toBe(2)
    expect(String(d['Ví dụ khách báo'])).toContain('GWT-260053')
    expect(String(d['CS đã xử lý thực tế'])).toContain('Đã hướng dẫn tắt chế độ lạnh')
    expect(JSON.stringify(rows('Phương án xử lý')) + JSON.stringify(rows('Ticket tham khảo'))).not.toMatch(/0900|a@b\.vn/)
  })
  it('Ticket tham khảo: mỗi máy trong ticket một dòng, có các lần lỗi', () => {
    const t = rows('Ticket tham khảo')
    expect(t).toHaveLength(2)
    expect(String(t[0]['Các lần lỗi'])).toContain('Lần 1')
  })
})

describe('docFileDuyet — nhập file chuyên gia đã duyệt', () => {
  const sua = (f: (pa: Record<string, unknown>[]) => void) => {
    const { rows } = docLai(taoFileChuyenGia(duLieu))
    const pa = rows('Phương án xử lý'); f(pa)
    return docFileDuyet(pa, coSan)
  }

  it('không ai đánh dấu → không đổi gì', () => {
    const r = sua(() => {})
    expect(r).toEqual({ duyet: [], boDuyet: [], loi: [], chuaDanhDau: 0 })
  })
  it('x → duyệt phương án đề xuất; có "Phương án chuyên gia sửa" thì dùng bản sửa; kèm ý kiến', () => {
    const r = sua((pa) => {
      pa[0]['Chuyên gia duyệt'] = 'x'
      pa[1]['Chuyên gia duyệt'] = 'X'; pa[1]['Phương án chuyên gia sửa'] = ' Súc rửa bình + thay lõi than '; pa[1]['Ý kiến chuyên gia'] = 'Bổ sung lõi'
    })
    expect(r.loi).toEqual([])
    expect(r.duyet).toEqual([
      { code: 'CTS20-RO-DAY', huong_xu_ly: 'Tạm thời: rút điện, lau khô, theo dõi', y_kien: null },
      { code: 'MUI-LA', huong_xu_ly: 'Súc rửa bình + thay lõi than', y_kien: 'Bổ sung lõi' },
    ])
  })
  it('"bỏ" / "không" → thôi hiện trên ticket', () => {
    const r = sua((pa) => { pa[1]['Chuyên gia duyệt'] = 'bỏ'; pa[1]['Ý kiến chuyên gia'] = 'Sai hướng' })
    expect(r.boDuyet).toEqual([{ code: 'MUI-LA', y_kien: 'Sai hướng' }])
  })
  it('chuyên gia viết phương án cho mã chưa có + x → duyệt bản viết', () => {
    const r = docFileDuyet([{ 'Mã lỗi': 'MUI-LA', 'Chuyên gia duyệt': 'x', 'Phương án đề xuất': '', 'Phương án chuyên gia sửa': 'Viết mới' }], coSan)
    expect(r.duyet[0].huong_xu_ly).toBe('Viết mới')
  })
  it('duyệt mà không có phương án nào → lỗi dòng', () => {
    const r = docFileDuyet([{ 'Mã lỗi': 'MUI-LA', 'Chuyên gia duyệt': 'x', 'Phương án đề xuất': '', 'Phương án chuyên gia sửa': '' }], coSan)
    expect(r.loi).toEqual([{ dong: 2, loi: 'MUI-LA: duyệt nhưng chưa có phương án.' }])
  })
  it('mã không có trong danh mục / giá trị Duyệt lạ → lỗi dòng', () => {
    const r = docFileDuyet([
      { 'Mã lỗi': 'KHONG-CO', 'Chuyên gia duyệt': 'x', 'Phương án chuyên gia sửa': 'a' },
      { 'Mã lỗi': 'MUI-LA', 'Chuyên gia duyệt': 'có lẽ' },
    ], coSan)
    expect(r.loi.map((l) => l.dong)).toEqual([2, 3])
  })
  it('có sửa / ý kiến mà chưa đánh x → đếm để nhắc ở màn xem trước, không ghi', () => {
    const r = sua((pa) => { pa[0]['Phương án chuyên gia sửa'] = 'Bản mới' })
    expect(r.chuaDanhDau).toBe(1)
    expect(r.duyet).toEqual([])
  })
})
