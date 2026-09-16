import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { saoKeTuMucChu, type MucChu } from './tcb-pdf'
const fx = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/tcb-t8-muc-chu.json', import.meta.url)), 'utf8')) as { items: MucChu[] }
describe('docTcbPdf — bóc bảng giao dịch TCB theo toạ độ chữ', () => {
  const sk = saoKeTuMucChu(fx.items)
  it('header: kỳ, số dư đầu/cuối, tổng nợ/có', () => {
    expect(sk).toMatchObject({ taiKhoan: 'TCB', tu: '2026-08-01', den: '2026-08-31', soDuDau: 508219466, soDuCuoi: 1424164833, tongNo: 500000000, tongCo: 1415945367 })
  })
  it('55 dòng: 1 nợ 500.000.000, 54 có; tổng có = header', () => {
    expect(sk.dong).toHaveLength(55)
    expect(sk.dong.filter((d) => d.no > 0)).toEqual([expect.objectContaining({ no: 500000000 })])
    expect(sk.dong.reduce((s, d) => s + d.co, 0)).toBe(1415945367)
  })
  it('dòng có thứ tự theo file (mới nhất trước): dòng 1 ngày 29/08 có 72.733 số dư 1.424.164.833; dòng 55 ngày 03/08 có 1.000.000', () => {
    expect(sk.dong[0]).toMatchObject({ rowOrder: 1, ngay: '2026-08-29', co: 72733, soDu: 1424164833 })
    expect(sk.dong[54]).toMatchObject({ rowOrder: 55, ngay: '2026-08-03', co: 1000000 })
    expect(sk.dong[54].noiDung).toMatch(/dat coc may/)
  })
  it('SĐT bị tách chữ được nối lại trong noiDung (0900000nnn liền)', () => {
    expect(sk.dong.some((d) => /0900000\d{3}/.test(d.noiDung.replace(/\s/g, '')))).toBe(true)
  })
  // Fixture thật (pdfjs) gộp nhãn header thành 1 mục 'Nợ/ Debit' chứ không tách rời 'Nợ/' — lọc theo tiền tố.
  it('thiếu header cột Nợ/Có → lỗi khuôn', () => expect(() => saoKeTuMucChu(fx.items.filter((m) => !m.chu.startsWith('Nợ/')))).toThrow(/khuôn TCB/))

  // R9 Critical 2: đoạn diễn giải nhiều dòng của dòng 6 (trang 1, x=429) in CAO HƠN (y nhỏ hơn) chính dòng
  // STT của nó — mô hình "dòng đang mở tuần tự" cũ từng gán nhầm đoạn này vào dòng 5 (dòng liền trước). Gán
  // theo neo-gần-nhất (2 lượt) phải đưa đúng về dòng 6, để lại dòng 5 sạch.
  it('dòng diễn giải nhiều dòng in TRÊN dòng STT của nó vẫn gán đúng giao dịch, không lọt sang dòng trước', () => {
    expect(sk.dong[4].rowOrder).toBe(5)
    expect(sk.dong[4].noiDung).not.toMatch(/chuyen khoan nhanh qua Zalo/)
    expect(sk.dong[5].rowOrder).toBe(6)
    expect(sk.dong[5].noiDung).toMatch(/chuyen khoan nhanh qua Zalo/)
    expect(sk.dong[6].rowOrder).toBe(7)
    expect(sk.dong[6].noiDung).not.toMatch(/chuyen khoan nhanh qua Zalo/)
  })
})

// R9 Important: fixture thật đã có sẵn placeholder SĐT liền (được che lúc sinh fixture) nên test trên không
// thực sự chạy qua regex nối SĐT tách 3-3-4 trong saoKeTuMucChu — dựng bộ items tối thiểu (header + 1 dòng
// STT có 3 mục '090'/'000'/'0123' trong dải diễn giải, cùng y) để tự thân regex '(0\d{2}) (\d{3}) (\d{4})'
// phải chạy và nối thành '0900000123'.
describe('saoKeTuMucChu — nối SĐT tách 3-3-4 (đơn vị, không qua fixture)', () => {
  it('3 mục 090/000/0123 trong dải diễn giải được nối liền thành 0900000123', () => {
    const hdrY = 100, rowY = 200
    const items: MucChu[] = [
      { trang: 1, x: 174, y: hdrY, chu: 'Số bút toán/' },
      { trang: 1, x: 229, y: hdrY, chu: 'Ngân hàng đối ứng /' },
      { trang: 1, x: 364, y: hdrY, chu: 'Tên tài khoản đối ứng/' },
      { trang: 1, x: 451, y: hdrY, chu: 'Diễn giải/ Description' },
      { trang: 1, x: 547, y: hdrY, chu: 'Nợ/ Debit' },
      { trang: 1, x: 607, y: hdrY, chu: 'Có/ Credit' },
      { trang: 1, x: 655, y: hdrY, chu: 'Phí - Lãi /' },
      { trang: 1, x: 757, y: hdrY, chu: 'Số dư/ Running balance' },
      { trang: 1, x: 36, y: rowY, chu: '1' },
      { trang: 1, x: 429, y: rowY, chu: 'goi' },
      { trang: 1, x: 436, y: rowY, chu: '090' },
      { trang: 1, x: 443, y: rowY, chu: '000' },
      { trang: 1, x: 450, y: rowY, chu: '0123' },
    ]
    const sk = saoKeTuMucChu(items)
    expect(sk.dong[0].noiDung).toContain('0900000123')
  })
})
