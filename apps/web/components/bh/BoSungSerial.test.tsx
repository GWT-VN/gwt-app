import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/actions', () => ({ serialsTheoMay: vi.fn() }))
vi.mock('@/app/may/chua-serial-actions', () => ({ boSungSerial: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }))
import { BoSungSerial } from './BoSungSerial'

describe('BoSungSerial', () => {
  it('khung vàng: nói rõ chờ bổ sung serial + mã tạm + nút Bổ sung serial', () => {
    const h = renderToStaticMarkup(<BoSungSerial maTam="TAM202611001" internalCode="CTS20NG" choSua />)
    for (const t of ['Chờ bổ sung serial', 'TAM202611001', 'Bổ sung serial', 'bảo hành, ticket, lịch bảo trì giữ nguyên']) expect(h).toContain(t)
  })
  it('không quyền → chỉ thông báo, không có nút', () => {
    const h = renderToStaticMarkup(<BoSungSerial maTam="TAM202611001" internalCode="CTS20NG" choSua={false} />)
    expect(h).toContain('Chờ bổ sung serial')
    expect(h).not.toContain('<button')
  })
})
