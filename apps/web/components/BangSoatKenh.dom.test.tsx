// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import type { DongSoatKenh } from '@/app/actions'
import { KhungChon } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { BangSoatKenh } from './BangSoatKenh'

const { push, replace } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/khach/kenh',
  useSearchParams: () => new URLSearchParams('q=an'),
}))
vi.mock('@/app/actions', () => ({
  luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn(), ganKenh: vi.fn(),
}))

const dong: DongSoatKenh = {
  id: 'k1', ten: 'Khách mẫu', sdt: '0901', ma_kh: 'KH1', tinh: 'HN', channel_id: 1, kenh: 'Facebook', tu_dong: true, so_may: 1,
}

test('Soát kênh theo khuôn F: ba tab có số, tab đầu là "Máy điền", sửa kênh tại dòng', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot><CauHinhBangDs><KhungChon khoaTrang={[]} tong={0} bat={false} thamSo={{}}>
      <BangSoatKenh rows={[dong]} tong={1} trang={1} soTrang={1} kenh={[]} tabRieng={[]} quyenTabChung={false}
        demTab={{ may: 113, nguoi: 74, trong: 240 }} moTaNhom="Hệ tự suy từ đơn/khách — cần anh duyệt" />
    </KhungChon></CauHinhBangDs></DsRoot>,
  )
  const toolbar = screen.getByRole('heading', { name: 'Soát kênh khách' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm khách để soát kênh' })).toBeTruthy()
  const tabs = within(within(toolbar).getByRole('tablist', { name: 'Tab khách' })).getAllByRole('tab')
  expect(tabs[0].textContent).toContain('Máy điền')
  expect(tabs[0].textContent).toContain('113')
  const table = screen.getByRole('table', { name: 'Soát kênh khách' })
  expect(within(table).getByText('máy điền')).toBeTruthy()
  expect(within(table).getByRole('button', { name: 'đúng rồi' })).toBeTruthy()
  expect(screen.getByText('Hệ tự suy từ đơn/khách — cần anh duyệt')).toBeTruthy()
  await user.click(screen.getByRole('tab', { name: /Còn trống/ }))
  expect(replace).toHaveBeenLastCalledWith('/khach/kenh?nhom=trong&view=trong', { scroll: false })
})
