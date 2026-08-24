/**
 * Ô số thập phân — CEO hỏi 24/08/2026: "7.9 hay 7,9?". Chốt: cả hai.
 *
 * Ghim luôn cái tệ nhất của bản cũ: `Number('7,9')` = NaN và số đo bị BỎ THẦM.
 */
import { describe, expect, it } from 'vitest'
import { docBoSo, docSo } from './so'

const so = (s: string) => {
  const r = docSo(s)
  return r.ok ? r.so : `LỖI: ${r.loi}`
}

describe('docSo — chấp cả dấu chấm lẫn dấu phẩy', () => {
  it('7.9 và 7,9 ra cùng một số', () => {
    expect(so('7.9')).toBe(7.9)
    expect(so('7,9')).toBe(7.9)
  })

  it('số nguyên, số 0, số âm', () => {
    expect(so('120')).toBe(120)
    expect(so('0')).toBe(0)
    expect(so('0,0')).toBe(0)
    expect(so('-1,5')).toBe(-1.5)
  })

  it('bỏ TRỐNG là hợp lệ — trả undefined chứ không phải lỗi', () => {
    expect(so('')).toBeUndefined()
    expect(so('   ')).toBeUndefined()
    expect(docSo(undefined)).toEqual({ ok: true, so: undefined })
    expect(docSo(null)).toEqual({ ok: true, so: undefined })
  })

  it('gõ dở "7." hay ",5" vẫn đọc được — người ta gõ tới đâu ô hiện tới đó', () => {
    expect(so('7.')).toBe(7)
    expect(so('7,')).toBe(7)
    expect(so(',5')).toBe(0.5)
    expect(so('.5')).toBe(0.5)
  })

  it('khoảng trắng bên trong không làm hỏng', () => {
    expect(so(' 7,9 ')).toBe(7.9)
    expect(so('1 234,5')).toBe(1234.5)
  })

  it('có CẢ hai dấu: dấu sau cùng là dấu thập phân', () => {
    expect(so('1.234,5')).toBe(1234.5)   // kiểu Việt Nam
    expect(so('1,234.5')).toBe(1234.5)   // kiểu Anh Mỹ
  })

  it('gõ bậy thì BÁO LỖI, không nuốt thành null như bản cũ', () => {
    for (const bay of ['abc', '7,9,5', '7..9', '--3', '1e5', '0x1f', '7 9 x']) {
      const r = docSo(bay)
      expect(r.ok, `"${bay}" đáng lẽ phải bị chặn`).toBe(false)
    }
  })

  it('câu báo lỗi nói luôn kiểu gõ đúng', () => {
    const r = docSo('bảy phẩy chín')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.loi).toContain('7,9')
  })
})

describe('docBoSo — cả bộ ô của form kết quả đo', () => {
  it('trả về đúng các ô CÓ gõ, ô trống thì không có mặt', () => {
    const r = docBoSo({ tds_truoc: '120', tds_sau: '7,9', ph_truoc: '', ph_sau: undefined })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.so).toEqual({ tds_truoc: 120, tds_sau: 7.9 })
  })

  it('một ô sai là cả bộ bị chặn — không lưu nửa vời', () => {
    const r = docBoSo({ tds_truoc: '120', ph_sau: 'abc' })
    expect(r.ok).toBe(false)
  })
})
