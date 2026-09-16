import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as XLSX from 'xlsx'
import { saoKeTuBangVcb, docVcb } from './vcb'
const fx = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/vcb63-t8.json', import.meta.url)), 'utf8')) as { rows: string[][] }
describe('docVcb — sao kê VCB .xls (BIFF)', () => {
  const sk = saoKeTuBangVcb(fx.rows, 'VCB63')
  it('đọc header: kỳ, số dư đầu, tài khoản', () => {
    expect(sk.taiKhoan).toBe('VCB63'); expect(sk.tu).toBe('2026-08-01'); expect(sk.den).toBe('2026-08-31'); expect(sk.soDuDau).toBe(393025120)
    expect(sk.headers[0]).toMatch(/^STT/)
  })
  it('45 dòng giao dịch, 43 nợ / 2 có, dòng đầu đúng ngày/số CT/tiền/số dư', () => {
    expect(sk.dong).toHaveLength(45)
    expect(sk.dong.filter((d) => d.no > 0)).toHaveLength(43); expect(sk.dong.filter((d) => d.co > 0)).toHaveLength(2)
    expect(sk.dong[0]).toMatchObject({ rowOrder: 1, ngay: '2026-08-07', soCt: '5224-17669', no: 4659560, co: 0, soDu: 388365560 })
    expect(sk.dong[0].noiDung).toMatch(/^IBBIZ/)
  })
  it('tổng nợ/có tính từ dòng; số dư cuối = số dư dòng cuối', () => {
    expect(sk.tongNo).toBe(sk.dong.reduce((s, d) => s + d.no, 0)); expect(sk.soDuCuoi).toBe(sk.dong.at(-1)!.soDu)
  })
  it('docVcb đọc buffer BIFF thật (dựng bằng xlsx từ fixture) ra cùng kết quả', () => {
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(fx.rows), 'Sheet1')
    const buf = XLSX.write(wb, { type: 'array', bookType: 'biff8' }) as ArrayBuffer
    expect(docVcb(buf, 'VCB63').dong).toHaveLength(45)
  })
  it('file không có hàng STT → lỗi rõ', () => expect(() => saoKeTuBangVcb([['a', 'b']], 'VCB21')).toThrow(/không đúng khuôn sao kê VCB/))
})
