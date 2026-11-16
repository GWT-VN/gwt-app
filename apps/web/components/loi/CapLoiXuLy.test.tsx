import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { LanLoi } from '@/lib/loi/lanLoi'

vi.mock('@/app/ticket/lan-loi-actions', () => ({ themLanLoi: vi.fn(), suaLanLoi: vi.fn(), xoaLanLoi: vi.fn() }))
vi.mock('@/app/actions', () => ({ updateTicket: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
import { KhungCap, LanLoiTiepTheo } from './CapLoiXuLy'
import { TicketEditor } from '@/components/TicketEditor'

const lan = (p: Partial<LanLoi> = {}): LanLoi => ({
  id: '11111111-1111-4111-8111-111111111111', ticket_code: 'TK-2611-003', lan: 2,
  mo_ta: 'Lại báo E4 sau khi hãng trả máy', xu_ly: 'Thay bo mạch', tao_boi: null, created_at: '2026-11-16T03:00:00Z', ...p,
})

describe('KhungCap', () => {
  it('hiện Lần N + ngày, khách báo và xử lý cạnh nhau', () => {
    const h = renderToStaticMarkup(<KhungCap lan={2} ngay="2026-11-16T03:00:00Z" moTa="Rò nước đáy" xuLy="Thay gioăng" />)
    expect(h).toContain('Lần 2')
    expect(h).toContain('16/11/2026')
    expect(h).toContain('Khách báo')
    expect(h).toContain('Rò nước đáy')
    expect(h).toContain('Thay gioăng')
    expect(h).toContain('sm:grid-cols-2')
  })
  it('chưa có xử lý → "chưa có"', () => {
    expect(renderToStaticMarkup(<KhungCap lan={1} ngay={null} moTa="E4" xuLy={null} />)).toContain('chưa có')
  })
})

describe('LanLoiTiepTheo', () => {
  it('có quyền: hiện từng lần + Sửa/Xoá + nút thêm lần mới', () => {
    const h = renderToStaticMarkup(<LanLoiTiepTheo code="TK-2611-003" ds={[lan(), lan({ id: '22222222-2222-4222-8222-222222222222', lan: 3, xu_ly: null })]} choSua lanKe={4} />)
    expect(h).toContain('Lần 2')
    expect(h).toContain('Lần 3')
    expect(h).toContain('Thay bo mạch')
    expect(h).toContain('>Sửa<')
    expect(h).toContain('>Xoá<')
    expect(h).toContain('+ Thêm lần lỗi mới')
  })
  it('không có quyền: chỉ xem', () => {
    const h = renderToStaticMarkup(<LanLoiTiepTheo code="c" ds={[lan()]} choSua={false} lanKe={3} />)
    expect(h).toContain('Lại báo E4')
    for (const t of ['>Sửa<', '>Xoá<', 'Thêm lần lỗi mới']) expect(h).not.toContain(t)
  })
})

describe('TicketEditor (chế độ xem)', () => {
  it('Lần 1 là cặp mô tả ↔ tóm tắt xử lý, các lần sau nằm ngay dưới', () => {
    const h = renderToStaticMarkup(
      <TicketEditor code="TK-2611-003" state="Open" khan={false} lastNote="Đã gửi hãng" ticketType="Khác"
        description="Lỗi E4" staff={[]} csId={null} ktId={null} ngayTao="2026-11-15T17:00:00Z">
        <p>LAN_SAU</p>
      </TicketEditor>,
    )
    expect(h).toContain('Lần 1')
    expect(h.indexOf('Lỗi E4')).toBeLessThan(h.indexOf('Đã gửi hãng'))
    expect(h.indexOf('Đã gửi hãng')).toBeLessThan(h.indexOf('LAN_SAU'))
    expect(h).not.toContain('Tóm tắt xử lý (hiện tại)')
  })
})
