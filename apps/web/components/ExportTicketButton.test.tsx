import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'

const h = vi.hoisted(() => ({ xuatTicket: vi.fn<(...a: unknown[]) => Promise<{ ok: true; csv: string }>>(async () => ({ ok: true, csv: "" })) }))
vi.mock('@/app/actions', () => ({ xuatTicket: h.xuatTicket }))
import { ExportTicketButton } from './ExportTicketButton'

describe('M7: xuất ticket theo đúng bộ lọc đang xem', () => {
  it('truyền cả loai (Loại ticket) và loi (Loại lỗi)', async () => {
    const el = ExportTicketButton({ q: 'x', state: 'Open', khan: false, mine: false, ngtu: '2026-11-01', ngden: undefined, loai: 'Bảo hành', loi: 'CTS20-RO' }) as ReactElement<{ onXuat: (cot: string[]) => unknown }>
    await el.props.onXuat(['ticket_code'])
    expect(h.xuatTicket).toHaveBeenCalledWith('x', 'Open', false, false, ['ticket_code'], '2026-11-01', undefined, 'Bảo hành', 'CTS20-RO')
  })
})
