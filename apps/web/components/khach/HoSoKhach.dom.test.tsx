// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import type { Ticket } from '@/app/actions'
import type { DongLoiMay } from '@/lib/khach/thong-ke-loi'
import { duongHoSoKhach, HoSoKhach } from './HoSoKhach'

const { replace, sp } = vi.hoisted(() => ({ replace: vi.fn(), sp: { v: 'tab=ticket&ticket=T1' } }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace, refresh: vi.fn() }),
  usePathname: () => '/khach/K1',
  useSearchParams: () => new URLSearchParams(sp.v),
}))
// Phần thân lần lỗi kéo server action — test này chỉ soi khung hồ sơ.
vi.mock('@/app/ticket/_danh-sach/ds-f', () => ({ TT: [] }))
vi.mock('@/app/ticket/_danh-sach/the-lan', () => ({ DsTheLan: () => null }))
vi.mock('@/app/ticket/_danh-sach/the-tab', () => ({ LanLoiThat: () => null }))

const ticket = (ticket_code: string, created_at: string, serial: string | null = null) =>
  ({ ticket_code, state: 'Open', created_at, product_name: 'CTS20', serial }) as Ticket
const dong = (ticket_code: string, ngay: string, serial: string | null = 'S1'): DongLoiMay => ({
  ticket_code, state: 'Open', serial, internal_code: 'CTS20', product_name: 'CTS20', loi_code: 'E3', loi_ten: 'Báo lỗi E3', ngay,
})
const MAY = [
  { serial: 'S1', product_name: 'CTS20', internal_code: 'CTS20', warranty_activated: true, warranty_full_end: null },
  { serial: 'S2', product_name: 'GN610', internal_code: 'GN610', warranty_activated: false, warranty_full_end: null },
]

function mo(p: { tickets?: Ticket[]; dongLoi?: DongLoiMay[] } = {}) {
  return render(
    <HoSoKhach
      demo={false}
      khach={{ id: 'K1', ten: 'Khách thử', sdt: null, tinh: 'Hà Nội', diaChi: null, nguon: null, maKh: null, maSales: null, phuTrach: null }}
      may={MAY}
      tickets={p.tickets ?? [ticket('T1', '2026-11-01T02:00:00Z'), ticket('T2', '2026-11-20T02:00:00Z')]}
      dongLoi={p.dongLoi ?? [dong('T1', '2026-11-01'), dong('T2', '2026-11-20')]}
      baoTri={[]}
    />,
  )
}
const theMay = (c: HTMLElement, serial: string) => c.querySelector(`[data-module="may-ticket"][data-may="${serial}"]`)!

test('ba tab cố định; tab Ticket = một thẻ cho mỗi máy, không còn module Máy & lỗi / Ticket riêng', () => {
  const { container } = mo()
  const tabs = screen.getByRole('tablist', { name: 'Phần hồ sơ khách' })
  expect(within(tabs).getAllByRole('tab').map((t) => t.textContent)).toEqual(['Ticket', 'Thông tin', 'Bảo trì & lõi'])
  expect(within(tabs).getByRole('tab', { name: 'Ticket' }).getAttribute('aria-selected')).toBe('true')
  const the = container.querySelectorAll('[data-module="may-ticket"]')
  expect(the).toHaveLength(2)
  expect(theMay(container, 'S1').textContent).toContain('CTS20')
  expect(theMay(container, 'S1').textContent).toContain('E3 ×2')
  expect(theMay(container, 'S2').textContent).toContain('GN610')
  expect(theMay(container, 'S2').textContent).toContain('Chưa kích hoạt')
  expect(container.querySelector('[data-module="may-loi"]')).toBeNull()
  expect(container.querySelector('[data-module="ticket"]')).toBeNull()
  // Không có ticket không máy → không có thẻ "Chưa rõ máy".
  expect(container.querySelector('[data-module="may-ticket"][data-may=""]')).toBeNull()
  // Không còn ô chọn thứ tự xem cũ.
  expect(screen.queryByRole('button', { name: /trước/ })).toBeNull()
})

test('?ticket= của máy thứ 2 → thẻ máy 2 mở, máy 1 đóng, ticket đó mở', () => {
  sp.v = 'tab=ticket&ticket=T3'
  const { container } = mo({
    tickets: [ticket('T1', '2026-11-20T02:00:00Z'), ticket('T3', '2026-11-01T02:00:00Z')],
    dongLoi: [dong('T1', '2026-11-20'), dong('T3', '2026-11-01', 'S2')],
  })
  expect(theMay(container, 'S2').getAttribute('data-state')).toBe('open')
  expect(theMay(container, 'S1').getAttribute('data-state')).toBe('closed')
  expect(theMay(container, 'S2').querySelector('[data-ticket="T3"]')!.getAttribute('data-state')).toBe('open')
  sp.v = 'tab=ticket&ticket=T1'
})

test('không ?ticket → thẻ máy đầu mở, ticket mới nhất của nó mở', () => {
  sp.v = 'tab=ticket'
  const { container } = mo()
  expect(theMay(container, 'S1').getAttribute('data-state')).toBe('open')
  expect(theMay(container, 'S2').getAttribute('data-state')).toBe('closed')
  expect(theMay(container, 'S1').querySelector('[data-ticket="T2"]')!.getAttribute('data-state')).toBe('open')
  expect(theMay(container, 'S1').querySelector('[data-ticket="T1"]')!.getAttribute('data-state')).toBe('closed')
  sp.v = 'tab=ticket&ticket=T1'
})

test('ticket báo 2 máy có ở cả hai thẻ; ticket không máy → thẻ "Chưa rõ máy" cuối', () => {
  const { container } = mo({
    tickets: [ticket('T1', '2026-11-01T02:00:00Z'), ticket('T9', '2026-11-25T02:00:00Z')],
    dongLoi: [dong('T1', '2026-11-01'), dong('T1', '2026-11-01', 'S2')],
  })
  // Thẻ gập không render thân → bấm đầu thẻ để mở.
  const moThe = (el: Element) => el.getAttribute('data-state') === 'closed' && fireEvent.click(el.querySelector('button')!)
  const the = [...container.querySelectorAll('[data-module="may-ticket"]')]
  the.forEach(moThe)
  expect(theMay(container, 'S1').querySelector('[data-ticket="T1"]')).toBeTruthy()
  expect(theMay(container, 'S2').querySelector('[data-ticket="T1"]')).toBeTruthy()
  const chuaRo = the.at(-1)!
  expect(chuaRo.getAttribute('data-may')).toBe('')
  expect(chuaRo.textContent).toContain('Chưa rõ máy')
  expect(chuaRo.querySelector('[data-ticket="T9"]')).toBeTruthy()
})

test('thẻ Khách: cột phải khi ≥ 1200; gọn ở tab Ticket, đầy đủ ở tab Thông tin', () => {
  const { container, unmount } = mo()
  const khach = container.querySelector('[data-module="khach"]')!
  expect(khach.closest('[class*="min-[1200px]:col-start-2"]')).toBeTruthy()
  expect(khach.textContent).toContain('Phụ trách')
  expect(khach.textContent).not.toContain('Mã Sales')
  unmount()
  sp.v = 'tab=thong-tin'
  const r = mo()
  expect(r.container.querySelector('[data-module="khach"]')!.textContent).toContain('Mã Sales')
  expect(r.container.querySelector('[data-module="may"]')).toBeTruthy()
  expect(r.container.querySelector('[data-module="ticket"]')).toBeNull()
  sp.v = 'tab=ticket&ticket=T1'
})

test('tab Bảo trì & lõi: Bảo trì + Lõi lọc chưa nối dữ liệu', () => {
  sp.v = 'tab=bao-tri'
  const { container } = mo()
  expect(container.querySelector('[data-module="baotri"]')).toBeTruthy()
  expect(container.querySelector('[data-module="loi-loc"]')!.textContent).toContain('Chưa nối dữ liệu lõi')
  sp.v = 'tab=ticket&ticket=T1'
})

test('duongHoSoKhach → tab Ticket, ticket đang xem', () => {
  expect(duongHoSoKhach('K 1', 'T1')).toBe('/khach/K%201?tab=ticket&ticket=T1')
  expect(duongHoSoKhach('K1')).toBe('/khach/K1?tab=ticket')
})
