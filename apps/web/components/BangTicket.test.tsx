import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/actions', () => ({ luuBangView: vi.fn(), xoaBangView: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }), usePathname: () => '/ticket', useSearchParams: () => new URLSearchParams() }))
import { KhungChon } from '@/bang'
import { BangTicket, type TicketDong } from './BangTicket'

const t = (p: Partial<TicketDong>): TicketDong => ({
  ticket_code: 'TK-1', state: 'Open', ticket_type: null, description: null, last_note: null, khan: false, province: null,
  created_at: '2026-11-26T03:00:00Z', serial: null, source_serial: null, product_name: null, internal_code: null,
  may_khong_trong_he_thong: false, customer_id: null, customer_name: null, primary_phone: null, warranty_activated: null,
  warranty_full_end: null, con_han_may: null, con_han_loi: null, cs_phu_trach: null, ky_thuat: null, cs_ten: null, ky_thuat_ten: null, ...p,
})

describe('BangTicket cột Ghi chú', () => {
  it('mặc định hiện cột, ghi chú 1 dòng + title đủ nội dung', () => {
    const h = renderToStaticMarkup(
      <KhungChon khoaTrang={['TK-1', 'TK-2']} tong={2} bat={false} thamSo={{}} layTatCaKhoa={vi.fn()}>
        <BangTicket rows={[t({ note: 'Khách hẹn chiều thứ 6' }), t({ ticket_code: 'TK-2' })]} choViewChung={false} views={[]} />
      </KhungChon>,
    )
    expect(h).toContain('Ghi chú')
    expect(h).toContain('title="Khách hẹn chiều thứ 6"')
    expect(h).toContain('truncate')
    expect(h).toContain('whitespace-nowrap')
  })
})

describe('BangTicket cột Phụ trách', () => {
  it('avatar tròn một dòng, vai + tên ở tooltip', () => {
    const h = renderToStaticMarkup(
      <KhungChon khoaTrang={['TK-1']} tong={1} bat={false} thamSo={{}} layTatCaKhoa={vi.fn()}>
        <BangTicket rows={[t({ cs_ten: 'Dev CSKH', ky_thuat_ten: 'Dev Trưởng CSKH' })]} choViewChung={false} views={[]} />
      </KhungChon>,
    )
    expect(h).toContain('aria-label="CS: Dev CSKH"')
    expect(h).toContain('title="KT: Dev Trưởng CSKH"')
    expect(h).toContain('rounded-full')
    expect(h).not.toContain('<div>CS:')
  })
})
