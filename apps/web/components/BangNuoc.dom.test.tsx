// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import type { DongNuoc } from '@/app/actions'
import { KhungChon } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { BangNuoc } from './BangNuoc'

const { push, replace } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/nuoc',
  useSearchParams: () => new URLSearchParams('tinh=Hà Nội&ngay=khoang~2026-11-01..2026-11-20'),
}))
vi.mock('@/app/actions', () => ({ luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn() }))

const dong = {
  visit_id: 'v1', ngay: '2026-11-05', lan_thu: 2, customer_id: 'k1', ten_khach: 'Khách mẫu', tinh: 'Hà Nội', dia_chi: 'Ba Đình',
  bo_may: 'RO-9', do_nuoc: { tds_truoc: 300, tds_sau: 10, ph_truoc: null, ph_sau: null, do_cung_truoc: null, do_cung_sau: null, clo_truoc: null, clo_sau: null },
} as unknown as DongNuoc

test('Hồ sơ nước theo khuôn F: tìm + tab + Lọc; chip Tỉnh/Ngày đo từ URL; cảnh báo lọc trong trang', () => {
  render(
    <DsRoot><CauHinhBangDs><KhungChon khoaTrang={[]} tong={0} bat={false} thamSo={{}}>
      <BangNuoc rows={[dong]} tong={5} trang={1} soTrang={1} dsTinh={['Hà Nội']} tabRieng={[]} quyenTabChung={false} locTrongTrang />
    </KhungChon></CauHinhBangDs></DsRoot>,
  )
  const toolbar = screen.getByRole('heading', { name: 'Hồ sơ chất lượng nước' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm lượt đo nước' })).toBeTruthy()
  expect(within(toolbar).getByRole('tablist', { name: 'Tab lượt đo' })).toBeTruthy()
  const dangLoc = screen.getByRole('region', { name: 'Điều kiện đang áp dụng' })
  expect(within(dangLoc).getByText(/Tỉnh\/TP/)).toBeTruthy()
  expect(within(dangLoc).getByText(/Ngày đo/)).toBeTruthy()
  expect(within(dangLoc).getByText('Lọc tên/tỉnh chỉ áp dụng trong trang đang xem')).toBeTruthy()
  const table = screen.getByRole('table', { name: 'Hồ sơ chất lượng nước' })
  expect(within(table).getByRole('link', { name: 'Khách mẫu' }).getAttribute('href')).toBe('/khach/k1')
  expect(within(table).getByText(/TDS 300→10/)).toBeTruthy()
  // Tab cố định duy nhất "Tất cả" đang chọn; bộ lọc đang áp khác tab → bấm "+" lưu thành tab mới.
  expect(screen.getByRole('tab', { name: /Tất cả/ }).getAttribute('aria-selected')).toBe('true')
  expect(within(toolbar).getByRole('button', { name: 'Thêm tab' })).toBeTruthy()
  expect(within(toolbar).getByRole('button', { name: /Lọc/ })).toBeTruthy()
})
