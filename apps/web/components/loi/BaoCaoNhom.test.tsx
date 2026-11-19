import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TheoMay, TheoNhom } from './BaoCaoNhom'
import type { CaBaoCao } from '@/lib/loi/baoCaoNhom'

const ca = (p: Partial<CaBaoCao>): CaBaoCao => ({
  ticket_code: 'GWT-1', loi_code: 'CTS20-RO-DAY', loi_ten: 'CTS20 rò đáy', nhom: 'RO-RI-NUOC', nhom_ten: 'Rò rỉ nước',
  internal_code: 'CTS20NG', may: 'S1', ngay_bao: '2026-09-13', thang: '2026-09', install_date: null, state: 'Open', ...p,
})
const DS = [ca({}), ca({ ticket_code: 'GWT-2', may: 'S2', state: 'Done' }), ca({ ticket_code: 'GWT-3', nhom: 'MAIN', loi_ten: 'E4', internal_code: 'CTD50NG' })]
const href = (d: Record<string, string | null>) => '/bao-cao-loi?' + new URLSearchParams(Object.entries(d).filter(([, v]) => v) as [string, string][]).toString()

describe('TheoNhom', () => {
  it('chưa chọn nhóm: đủ 4 ô + lời nhắc bấm nhóm', () => {
    const h = renderToStaticMarkup(<TheoNhom ca={DS} n={null} s={null} href={href} />)
    for (const t of ['Main', 'Rò rỉ nước', 'Chất lượng nước', 'App', 'Bấm vào một nhóm lỗi']) expect(h).toContain(t)
  })
  it('chọn nhóm + máy: bảng máy và danh sách ticket có link mở ticket', () => {
    const h = renderToStaticMarkup(<TheoNhom ca={DS} n="RO-RI-NUOC" s="CTS20NG" href={href} />)
    expect(h).toContain('Rò rỉ nước: máy nào gặp lỗi này')
    expect(h).toContain('href="/ticket/GWT-2"')
    expect(h).toContain('Đã xong')
    expect(h).not.toContain('GWT-3')
  })
})

describe('TheoMay', () => {
  it('tỷ lệ máy lỗi / đang chạy; chọn máy → serial', () => {
    const h = renderToStaticMarkup(<TheoMay ca={DS} dangChay={{ CTS20NG: 47 }} m="CTS20NG" mn={null} href={href} />)
    expect(h).toContain('47')
    expect(h).toContain('4%')
    expect(h).toContain('S1')
    expect(h).toContain('href="/ticket/GWT-1"')
  })
})
