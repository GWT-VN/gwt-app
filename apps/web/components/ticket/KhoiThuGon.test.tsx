import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { KhoiThuGon, tomTatNhatKy } from './KhoiThuGon'

// Mặc định `hienNgay` (CEO 26/11): cùng năm dd/MM, khác năm dd/MM/yy — khoá "bây giờ" ở 26/11/2026 để chữ ngày trong
// test không đổi theo năm chạy.
beforeAll(() => vi.useFakeTimers({ now: new Date('2026-11-26T03:00:00Z'), toFake: ['Date'] }))
afterAll(() => vi.useRealTimers())

describe('tomTatNhatKy', () => {
  it('rỗng → "chưa có"', () => {
    expect(tomTatNhatKy([])).toBe('chưa có ghi chú')
  })
  it('đếm + trích dòng mới nhất (theo thời gian, không theo thứ tự mảng), gọn 1 dòng', () => {
    const s = tomTatNhatKy([
      { noi_dung: 'cũ', created_at: '2026-09-16T04:55:00Z' },
      { noi_dung: 'Khách  nhắn lại:\nmáy vẫn chảy nước ở đáy, rất nhiều nữa ' + 'x'.repeat(100), created_at: '2026-10-14T03:00:00Z' },
    ])
    expect(s.startsWith('2 dòng · mới nhất 14/10: Khách nhắn lại: máy vẫn chảy nước')).toBe(true)
    expect(s.endsWith('…')).toBe(true)
    expect(s.length).toBeLessThan(120)
  })
})

describe('KhoiThuGon', () => {
  it('mặc định ĐÓNG: có tiêu đề + tóm tắt, nội dung nằm trong details', () => {
    const h = renderToStaticMarkup(<KhoiThuGon tieuDe="Nhật ký trao đổi" tomTat="2 dòng"><p>NOI_DUNG</p></KhoiThuGon>)
    expect(h).toMatch(/^<details(?![^>]*\sopen)/)
    for (const t of ['<summary', 'Nhật ký trao đổi', '2 dòng', 'NOI_DUNG']) expect(h).toContain(t)
  })
  it('moSan → mở', () => {
    const h = renderToStaticMarkup(<KhoiThuGon tieuDe="A" moSan><p>x</p></KhoiThuGon>)
    expect(h).toMatch(/^<details[^>]*\sopen/)
  })
})
