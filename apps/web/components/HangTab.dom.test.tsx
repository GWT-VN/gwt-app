// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { DsRoot } from '@/components/ui/ds-root'
import { useHangTab } from './HangTab'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/khach-hang',
  useSearchParams: () => new URLSearchParams('tab=x1'),
}))
vi.mock('@/app/actions', () => ({
  luuTabView: vi.fn(), capNhatTabView: vi.fn(async () => ({ ok: true })), doiTenTabView: vi.fn(), xoaTabView: vi.fn(),
}))

function Hang() {
  const { tabs } = useHangTab({
    bang: 'khach_tab',
    coDinh: [{ v: 'tat-ca', ten: 'Tất cả', loc: '' }],
    tabRieng: [{ id: 'x1', ten: 'E3', chung: false, loc: '', suaDuoc: true }],
    dieuKien: [],
    nhan: 'khách',
    khu: 'CSKH',
    viDuTen: 'VD',
  })
  return tabs
}

test('tab tự tạo đang chọn mang kiểu active (menu chuột phải không đè data-state) + "+" sau tab', () => {
  render(
    <DsRoot>
      <Hang />
    </DsRoot>,
  )
  const e3 = screen.getByRole('tab', { name: /E3/ })
  expect(e3.getAttribute('aria-selected')).toBe('true')
  expect(e3.getAttribute('data-state')).toBe('active')
  // "+" và "…" nằm trong khe cuối hàng tab (ngay sau tab cuối), không tách sang phải.
  const cuoi = document.querySelector('[data-slot="tabs-cuoi"]')!
  expect(cuoi.querySelector('[aria-label="Thêm tab"]')).not.toBeNull()
  expect(cuoi.querySelector('[aria-label="Thao tác tab E3"]')).not.toBeNull()
})
