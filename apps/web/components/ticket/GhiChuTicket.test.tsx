import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/ticket/dau-ticket-actions', () => ({ datGhiChu: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
import { GhiChuTicket } from './GhiChuTicket'

describe('GhiChuTicket', () => {
  it('có ghi chú: hiện nguyên văn, giữ xuống dòng, có nút Sửa khi choSua', () => {
    const h = renderToStaticMarkup(<GhiChuTicket code="TK-1" note={'Dòng 1\nDòng 2'} choSua />)
    expect(h).toContain('Dòng 1\nDòng 2')
    expect(h).toContain('whitespace-pre-wrap')
    expect(h).toContain('Sửa ghi chú')
  })
  it('trống + không quyền sửa: báo chưa có, không có nút', () => {
    const h = renderToStaticMarkup(<GhiChuTicket code="TK-1" note={null} choSua={false} />)
    expect(h).toContain('Chưa có ghi chú.')
    expect(h).not.toContain('<button')
  })
})
