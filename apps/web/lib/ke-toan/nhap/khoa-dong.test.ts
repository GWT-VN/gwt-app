import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ganKhoaDong } from './khoa-dong'
import { khoaDong } from '../chuan-hoa'
import type { DongTho } from '../doc-file/nexia'

/** File golden T8 thật (che PII, xem tools/scripts/ke_toan_sinh_golden.py) — 415 dòng, trong đó
 * có 12 nhóm dòng trùng hệt cùng khoá tự nhiên trong cùng hoá đơn (vd 1 món ăn liệt kê 4 lần). */
type FixtureRow = { i: number; kyHieu: string; soHd: string; seller: string; desc: string; thue: number; thanhTien: number }
const fixture = JSON.parse(
  readFileSync(fileURLToPath(new URL('../__fixtures__/t8-dau-vao.json', import.meta.url)), 'utf8'),
) as { rows: FixtureRow[] }

/** Dựng DongTho tối thiểu từ 1 dòng fixture — chỉ cần các trường ganKhoaDong() đọc tới
 * (rowOrder, kyHieu, soHd, tenHang, thanhTien); rowOrder = thứ tự xuất hiện trong file (1-based),
 * đúng quy ước docTab() trong lib/ke-toan/doc-file/nexia.ts. */
function toDongTho(r: FixtureRow, i: number): DongTho {
  return {
    rowOrder: i + 1,
    raw: [],
    truong: {
      kyHieu: r.kyHieu, soHd: r.soHd, ngayLap: null, mccqt: '',
      tenBan: r.seller, mstBan: '', tenMua: '', mstMua: '',
      tenHang: r.desc, dvt: '', soLuong: null, donGia: null, thueSuat: '',
      thanhTien: r.thanhTien, tienThue: r.thue, tongThanhToan: null, trangThai: '', tinhChat: '',
    },
  }
}

describe('ganKhoaDong — chống trùng line_key trong cùng hoá đơn', () => {
  const dongs = fixture.rows.map(toDongTho)
  const keys = ganKhoaDong(dongs, 'vao')

  it('415 dòng → 415 key duy nhất', () => {
    expect(keys).toHaveLength(415)
    expect(new Set(keys).size).toBe(415)
  })

  it('nhóm C26MAC/1062/"Sua - Clear Jellyfish Tart"/200000 có 4 dòng, lan 0..3', () => {
    const idx = fixture.rows
      .map((r, i) => ({ r, i }))
      .filter(
        ({ r }) =>
          r.kyHieu === 'C26MAC' && r.soHd === '1062' && r.desc === 'Sua - Clear Jellyfish Tart' && r.thanhTien === 200000,
      )
      .map(({ i }) => i)
    expect(idx).toHaveLength(4)
    // 4 key khác nhau, đúng bằng khoaDong(..., lan) với lan = 0,1,2,3 theo thứ tự rowOrder
    const nhomKeys = idx.map((i) => keys[i])
    expect(new Set(nhomKeys).size).toBe(4)
    idx.forEach((i, lan) => {
      const r = fixture.rows[i]
      expect(keys[i]).toBe(khoaDong('vao', r.kyHieu, r.soHd, r.desc, r.thanhTien, lan))
    })
  })
})
