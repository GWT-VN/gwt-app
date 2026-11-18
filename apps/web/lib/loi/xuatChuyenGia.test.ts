import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { cheThongTin, taoFileChuyenGia, type DuLieuChuyenGia } from './xuatChuyenGia'
import { docDanhMuc, docGanTicket } from './danhMucNhap'
import type { LoiDanhMuc } from './kieu'

const loi = (x: Partial<LoiDanhMuc>): LoiDanhMuc => ({
  code: 'X', nhom: null, ten: 'X', aliases: [], ma_may: [], dau_hieu: null, huong_xu_ly: null, nguon: null,
  trang_thai: 'cho_duyet', duyet_boi: null, duyet_luc: null, thu_tu: 10, ...x,
})

const duLieu: DuLieuChuyenGia = {
  danhMuc: [
    loi({ code: 'CTS20-RO-DAY', nhom: 'RO-RI-NUOC', ten: 'CTS20: rò nước dưới đáy máy', aliases: ['ro day', 'chảy nước đáy'],
      ma_may: ['CTS20%'], dau_hieu: 'Nước đọng dưới đáy', huong_xu_ly: 'Rút điện, lau khô, theo dõi', trang_thai: 'da_duyet' }),
    loi({ code: 'MUI-LA', nhom: 'CHAT-LUONG-NUOC', ten: 'Nước có mùi lạ', trang_thai: 'cho_duyet' }),
    loi({ code: 'CU-BO', nhom: null, ten: 'Mã cũ', trang_thai: 'ngung' }),
  ],
  nhom: [{ code: 'RO-RI-NUOC', ten: 'Rò rỉ nước' }, { code: 'CHAT-LUONG-NUOC', ten: 'Chất lượng nước' }],
  dongTicket: [
    { ticket_code: 'GWT-260053', loi_code: 'CTS20-RO-DAY', internal_code: 'CTS20NG', trang_thai: 'dang_xu_ly',
      mo_ta: 'Khách gọi 0900 000 001: nước chảy thành vũng', huong_xu_ly: 'Đã hướng dẫn tắt chế độ lạnh', huong_xu_ly_nguon: 'cs',
      lan: [{ lan: 1, mo_ta: 'Chảy nước đáy', xu_ly: 'Gửi mail a@b.vn hỏi hãng' }] },
    { ticket_code: 'GWT-260054', loi_code: 'CTS20-RO-DAY', internal_code: 'CTS20NG', trang_thai: 'da_xu_ly',
      mo_ta: 'Rò đáy', huong_xu_ly: 'Rút điện, lau khô, theo dõi', huong_xu_ly_nguon: 'danh_muc', lan: [] },
  ],
  ngayXuat: '2026-11-18',
}

function docLai(buf: Buffer) {
  const wb = XLSX.read(buf, { type: 'buffer' })
  const rows = (t: string) => XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[t], { defval: '' })
  return { wb, rows }
}

describe('cheThongTin', () => {
  it('che SĐT (liền, có cách, +84) và email; giữ phần còn lại', () => {
    expect(cheThongTin('gọi 0900000001 hoặc 0900 000 002, +84 900 000 003, mail test@example.com nhé'))
      .toBe('gọi [SĐT] hoặc [SĐT], [SĐT], mail [email] nhé')
  })
  it('không che serial / số tiền / mã máy', () => {
    const s = 'Serial F00000266V9400030067, phí 350.000đ, máy CTS20NG, 13/09/2026'
    expect(cheThongTin(s)).toBe(s)
  })
  it('null → ""', () => expect(cheThongTin(null)).toBe(''))
})

describe('taoFileChuyenGia', () => {
  const { wb, rows } = docLai(taoFileChuyenGia(duLieu))

  it('3 trang: Hướng dẫn, Danh mục lỗi, Gán ticket', () => {
    expect(wb.SheetNames).toEqual(['Hướng dẫn', 'Danh mục lỗi', 'Gán ticket'])
  })

  it('NHẬP LẠI được bằng bộ đọc của "Nhập từ Sheet": không lỗi, giữ nguyên mã / tên / cách ghi / phương án / trạng thái', () => {
    const r = docDanhMuc(rows('Danh mục lỗi'), new Set(['RO-RI-NUOC', 'CHAT-LUONG-NUOC']))
    expect(r.loi).toEqual([])
    expect(r.hopLe.map((x) => [x.code, x.ten, x.aliases, x.ma_may, x.dau_hieu, x.huong_xu_ly, x.trang_thai])).toEqual([
      ['CTS20-RO-DAY', 'CTS20: rò nước dưới đáy máy', ['ro day', 'chảy nước đáy'], ['CTS20%'], 'Nước đọng dưới đáy', 'Rút điện, lau khô, theo dõi', 'da_duyet'],
      ['MUI-LA', 'Nước có mùi lạ', [], [], null, null, 'cho_duyet'],
      ['CU-BO', 'Mã cũ', [], [], null, null, 'ngung'],
    ])
  })

  it('Danh mục: thêm số ticket, tên nhóm, ví dụ đã che SĐT, cách CS tự sửa trên ticket để chuyên gia tham khảo', () => {
    const d = rows('Danh mục lỗi')[0]
    expect(d['Số ticket']).toBe(2)
    expect(d['Tên nhóm']).toBe('Rò rỉ nước')
    expect(String(d['Ví dụ ticket'])).toContain('GWT-260053')
    expect(String(d['Ví dụ ticket'])).not.toContain('0900')
    expect(String(d['CS đã xử lý khác phương án (tham khảo)'])).toContain('Đã hướng dẫn tắt chế độ lạnh')
    expect(d['Ý kiến chuyên gia']).toBe('')
  })

  it('Gán ticket: mỗi dòng máy một dòng, Duyệt để TRỐNG (nhập lại không đổi gì nếu chuyên gia không đánh x)', () => {
    const g = rows('Gán ticket')
    expect(g).toHaveLength(2)
    expect(g.every((x) => x['Duyệt'] === '')).toBe(true)
    expect(docGanTicket(g, new Set(['CTS20-RO-DAY'])).hopLe).toEqual([])
    expect(String(g[0]['Các lần lỗi'])).toContain('Lần 1')
    expect(JSON.stringify(g)).not.toMatch(/0900|a@b\.vn/)
  })

  it('chuyên gia sửa mã + đánh x → bộ đọc nhận dòng gán', () => {
    const g = rows('Gán ticket')
    g[1]['Mã lỗi'] = 'MUI-LA'; g[1]['Duyệt'] = 'x'
    expect(docGanTicket(g, new Set(['CTS20-RO-DAY', 'MUI-LA'])).hopLe).toEqual([{ ticket_code: 'GWT-260054', loi_code: 'MUI-LA' }])
  })
})
