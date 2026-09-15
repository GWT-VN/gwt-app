import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { taoEngineDauRa, nhomSpCua } from './dau-ra'
import type { MucCatalog } from './kieu'
import { luatTuSeed } from '../__fixtures__/luat-tu-seed'

type GoldenRa = { rows: { i: number; desc: string; mst: string; buyer: string; expected: { ma: string; conf: string; makh: string } }[] }
const golden = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/t8-dau-ra.json', import.meta.url)), 'utf8')) as GoldenRa
const catalog = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/catalog-t8.json', import.meta.url)), 'utf8')) as MucCatalog[]

describe('engine đầu ra — parity Python classify_output_row trên T8', () => {
  const eng = taoEngineDauRa({ luat: luatTuSeed(), catalog, kenh: [] })
  const lech: string[] = []; const themDuoc: string[] = []
  for (const r of golden.rows) {
    const kq = eng.phanLoaiRa(r.desc, r.mst, r.buyer)
    if (r.expected.ma) { if (kq.code !== r.expected.ma) lech.push(`#${r.i} ${r.desc}: python=${r.expected.ma} ts=${kq.code}`) }
    else if (kq.code) themDuoc.push(`#${r.i} ${r.desc} → ts=${kq.code} (${kq.conf})`)
    if (kq.customerCode !== r.expected.makh) lech.push(`#${r.i} mã khách: python=${r.expected.makh} ts=${kq.customerCode}`)
  }
  it('mã nội bộ + mã khách khớp Python trên mọi dòng Python đã gán', () => {
    expect(lech, lech.join('\n')).toEqual([])
  })
  it('liệt kê dòng Python trống mà TS điền thêm (không fail)', () => {
    console.log(`TS điền thêm ${themDuoc.length} dòng:\n` + themDuoc.join('\n'))
  })
  it('nhóm SP theo danh mục cấp 2/3', () => {
    expect(nhomSpCua({ ma: 'CTD50NG', ten: '', tinhChat: 'Hàng hóa', capHai: 'POU', capBa: 'Countertop' })).toBe('POU-Countertop')
    expect(nhomSpCua({ ma: 'GTUN-8500VNDS', ten: '', tinhChat: 'Hàng hóa', capHai: 'POU', capBa: 'Undersink' })).toBe('POU-Undersink')
    expect(nhomSpCua({ ma: 'WH15A', ten: '', tinhChat: 'Thành phẩm', capHai: 'POE', capBa: 'System' })).toBe('POE')
    expect(nhomSpCua({ ma: 'GEUS-00X06', ten: '', tinhChat: 'Thành phẩm', capHai: 'Others', capBa: 'Showerhead' })).toBe('Others')
    expect(nhomSpCua(undefined)).toBe('')
  })
  it('kênh: Shopee → Ecom/Shopee; MST khớp dim_channel → kênh + đại lý', () => {
    const e2 = taoEngineDauRa({ luat: [], catalog, kenh: [{ mst: '0100000009', companyName: 'X', channelL1: 'Đại lý', channelL2: 'Vinsols' }] })
    expect(e2.phanLoaiRa('x', '', 'Cẩm Ly (shopee)')).toMatchObject({ customerCode: 'KHSP', channelL1: 'Ecom', channelL2: 'Shopee' })
    expect(e2.phanLoaiRa('x', '0100000009', 'CÔNG TY X')).toMatchObject({ customerCode: '0100000009', channelL1: 'Đại lý', dealerName: 'Vinsols' })
    expect(e2.phanLoaiRa('x', '', 'Nguyễn Văn A').customerCode).toBe('KHL')
  })
})
