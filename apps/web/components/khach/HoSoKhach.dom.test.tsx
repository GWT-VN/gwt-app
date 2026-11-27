// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
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

const ticket = (ticket_code: string, created_at: string) => ({ ticket_code, state: 'Open', created_at, product_name: 'CTS20' }) as Ticket
const dong = (ticket_code: string, ngay: string): DongLoiMay => ({
  ticket_code, state: 'Open', serial: 'S1', internal_code: 'CTS20', product_name: 'CTS20', loi_code: 'E3', loi_ten: 'Báo lỗi E3', ngay,
})

function mo() {
  return render(
    <HoSoKhach
      demo={false}
      khach={{ id: 'K1', ten: 'Khách thử', sdt: null, tinh: 'Hà Nội', diaChi: null, nguon: null, maKh: null, maSales: null, phuTrach: null }}
      may={[{ serial: 'S1', product_name: 'CTS20', internal_code: 'CTS20', warranty_activated: true, warranty_full_end: null }]}
      tickets={[ticket('T1', '2026-11-01T02:00:00Z'), ticket('T2', '2026-11-20T02:00:00Z')]}
      dongLoi={[dong('T1', '2026-11-01'), dong('T2', '2026-11-20')]}
      baoTri={[]}
    />,
  )
}

test('ba tab cố định; ?tab=ticket&ticket=T1 → tab Ticket chọn, ticket T1 mở sẵn, máy của T1 đánh dấu', () => {
  const { container } = mo()
  const tabs = screen.getByRole('tablist', { name: 'Phần hồ sơ khách' })
  expect(within(tabs).getAllByRole('tab').map((t) => t.textContent)).toEqual(['Ticket', 'Thông tin', 'Bảo trì & lõi'])
  expect(within(tabs).getByRole('tab', { name: 'Ticket' }).getAttribute('aria-selected')).toBe('true')
  expect(container.querySelector('[data-ticket="T1"]')!.getAttribute('data-state')).toBe('open')
  expect(container.querySelector('[data-ticket="T2"]')!.getAttribute('data-state')).toBe('closed')
  const mayLoi = container.querySelector('[data-module="may-loi"]')!
  expect(mayLoi.textContent).toContain('E3 ×2')
  expect(mayLoi.querySelector('[data-dang-bao]')).toBeTruthy()
  // Không còn ô chọn thứ tự xem cũ.
  expect(screen.queryByRole('button', { name: /trước/ })).toBeNull()
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
