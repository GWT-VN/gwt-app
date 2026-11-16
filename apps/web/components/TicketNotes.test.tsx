import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { TepNhatKy } from '@/lib/loi/tepNhatKy'

vi.mock('@/app/actions', () => ({ addTicketNote: vi.fn(), updateTicketNote: vi.fn(), deleteTicketNote: vi.fn() }))
vi.mock('@/app/ticket/tep-actions', () => ({ capLinkTaiLen: vi.fn(), donTepCuaNote: vi.fn(), themNhatKyKemTep: vi.fn(), xoaTepNhatKy: vi.fn() }))
vi.mock('@supabase/ssr', () => ({ createBrowserClient: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
import { DanhSachTep, TicketNotes } from './TicketNotes'

const note = { id: 'n1', noi_dung: 'Khách gửi ảnh rò nước', tac_gia: null, created_at: '2026-11-16T03:00:00Z' }
const tep = (p: Partial<TepNhatKy> = {}): TepNhatKy => ({
  id: 't1', note_id: 'n1', ten: 'ro-nuoc.jpg', loai: 'image/jpeg', kich_thuoc: 2 * 1024 * 1024, url: 'https://kho/x.jpg', ...p,
})

describe('TicketNotes đính kèm', () => {
  it('choTep: có nút Đính kèm + chỉ nhận ảnh/video/PDF', () => {
    const h = renderToStaticMarkup(<TicketNotes code="TK-1" notes={[]} choTep />)
    expect(h).toContain('Đính kèm')
    expect(h).toContain('accept="image/*,video/*,application/pdf"')
    expect(h).toContain('tối đa 50 MB')
  })
  it('không choTep: ẩn đính kèm, nhật ký chạy như cũ', () => {
    const h = renderToStaticMarkup(<TicketNotes code="TK-1" notes={[note]} />)
    expect(h).not.toContain('Đính kèm')
    expect(h).toContain('Khách gửi ảnh rò nước')
  })
  it('file hiện dưới đúng dòng nhật ký', () => {
    const h = renderToStaticMarkup(<TicketNotes code="TK-1" notes={[note]} teps={[tep(), tep({ id: 't2', note_id: 'khac', ten: 'khong-hien.pdf' })]} choTep />)
    expect(h).toContain('https://kho/x.jpg')
    expect(h).not.toContain('khong-hien.pdf')
  })
})

describe('DanhSachTep', () => {
  it('ảnh → thumbnail mở tab mới; video/PDF → thẻ tên + dung lượng', () => {
    const h = renderToStaticMarkup(<DanhSachTep teps={[tep(), tep({ id: 't2', ten: 'bien-ban.pdf', loai: 'application/pdf', url: 'https://kho/b.pdf' }), tep({ id: 't3', ten: 'clip.mp4', loai: 'video/mp4' })]} />)
    expect(h).toContain('<img')
    expect(h).toContain('target="_blank"')
    expect(h).toContain('📄 PDF')
    expect(h).toContain('bien-ban.pdf')
    expect(h).toContain('🎬 Video')
    expect(h).toContain('2,0 MB')
    expect(h).not.toContain('Xoá ')
  })
  it('có onXoa → nút × từng file', () => {
    expect(renderToStaticMarkup(<DanhSachTep teps={[tep()]} onXoa={() => {}} />)).toContain('Xoá ro-nuoc.jpg')
  })
})
