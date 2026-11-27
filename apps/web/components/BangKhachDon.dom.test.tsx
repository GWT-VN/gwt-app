// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import type { Customer } from '@/app/actions'
import { KhungChon } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { BangKhachDon } from './BangKhachDon'

const { push, replace } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/khach',
  useSearchParams: () => new URLSearchParams('q=an'),
}))
vi.mock('@/app/actions', () => ({ luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn() }))

const khach = {
  id: 'k1', full_name: 'Khách mẫu', primary_phone: null, needs_phone: true, address: null, notes: 'gọi lại', machines: 2,
} as unknown as Customer & { machines: number }

test('Khách cần dọn theo khuôn F: tìm ở đầu, hàng tab, ô thiếu SĐT/địa chỉ, sắp theo tên đổi URL', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot><CauHinhBangDs><KhungChon khoaTrang={['k1']} tong={1} bat thamSo={{}}>
      <BangKhachDon rows={[khach]} tong={1} trang={1} soTrang={1} sapXep={{ cot: 'full_name', tang: true, macDinh: true }}
        choChon tabRieng={[]} quyenTabChung={false} />
    </KhungChon></CauHinhBangDs></DsRoot>,
  )
  const toolbar = screen.getByRole('heading', { name: 'Khách cần dọn dữ liệu' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm khách cần dọn' })).toBeTruthy()
  expect(within(toolbar).getByRole('tablist', { name: 'Tab khách' })).toBeTruthy()
  const table = screen.getByRole('table', { name: 'Khách cần dọn dữ liệu' })
  expect(within(table).getByRole('link', { name: 'Khách mẫu' }).getAttribute('href')).toBe('/khach/k1')
  expect(within(table).getAllByText('thiếu')).toHaveLength(2)
  expect(screen.getByText(/Trên trang này: 1 thiếu\/lỗi SĐT · 1 thiếu địa chỉ/)).toBeTruthy()
  await user.click(within(within(table).getByRole('columnheader', { name: /^Khách/ })).getByRole('button'))
  await user.click(screen.getByRole('menuitemradio', { name: 'Tên từ Z đến A' }))
  expect(push).toHaveBeenLastCalledWith('/khach?q=an&cot=full_name&chieu=desc', { scroll: false })
})
