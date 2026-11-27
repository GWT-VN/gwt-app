// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import type { BHChoKichHoat } from '@/app/actions'
import { KhungChon } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { BHChoKichHoatList, BangBHChoSerial } from './BHChoKichHoatList'

const { push, replace, kichHoatNhanh } = vi.hoisted(() => ({
  push: vi.fn(), replace: vi.fn(), kichHoatNhanh: vi.fn(async () => ({ ok: true as const })),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/bh-cho-kich-hoat',
  useSearchParams: () => new URLSearchParams('q=an'),
}))
vi.mock('@/app/actions', () => ({
  luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn(), kichHoatNhanh,
  searchSerials: vi.fn(async () => []), createSerialPending: vi.fn(),
}))

const dong = (p: Partial<BHChoKichHoat>): BHChoKichHoat => ({
  nguon: 'da_lap_chua_kich_hoat', serial: 'SN9', ma_noi_bo: 'M01', ten_noi_bo: 'Máy RO', customer_id: 'c1', ten_khach: 'Khách A',
  sdt_khach: null, dia_chi: 'HN', ngay_lap: '2026-11-01', ngay_dat_hang: null, ma_don: null, so_luong: 1, ...p,
})
const chung = { tabRieng: [], quyenTabChung: false }
const bao = (ui: ReactNode) => (
  <DsRoot><CauHinhBangDs><KhungChon khoaTrang={[]} tong={0} bat={false} thamSo={{}}>{ui}</KhungChon></CauHinhBangDs></DsRoot>
)

test('BH chờ kích hoạt theo khuôn F: tìm ở đầu, tab nguồn (không số — bộ đếm ở phân trang), kích hoạt gửi đúng dữ liệu cũ', async () => {
  const user = userEvent.setup()
  render(bao(
    <BHChoKichHoatList
      items={[dong({}), dong({ customer_id: null, serial: null, ma_don: 'DH1', ten_khach: 'Khách B', nguon: 'don_sales_chua_gan_may' })]}
      gioiHan={500}
      {...chung}
    />,
  ))
  const toolbar = screen.getByRole('heading', { name: 'Chờ kích hoạt BH' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm bảo hành chờ kích hoạt' })).toBeTruthy()
  expect(within(toolbar).getByRole('tablist', { name: 'Tab dòng' })).toBeTruthy()
  expect(screen.getByRole('tab', { name: /Đơn bán/ }).textContent).not.toMatch(/\d/)
  expect(screen.getByText('1–2 trên 2 dòng')).toBeTruthy()
  // Dòng chưa có hồ sơ CSKH → đẩy sang /dang-ky-bh (không kích hoạt tại chỗ).
  expect(screen.getByRole('link', { name: 'Chọn khách…' }).getAttribute('href')).toBe('/dang-ky-bh')
  await user.click(screen.getByRole('button', { name: 'Kích hoạt BH' }))
  expect(kichHoatNhanh).toHaveBeenCalledWith({ serial: 'SN9', customer_id: 'c1', install_date: '2026-11-01', install_address: 'HN' })
  await user.click(screen.getByRole('tab', { name: /Đã kích hoạt — chờ bổ sung serial/ }))
  expect(replace).toHaveBeenLastCalledWith('/bh-cho-kich-hoat?nguon=cho_serial&view=cho-serial', { scroll: false })
})

test('tab chờ bổ sung serial: bảng mã tạm, rỗng khi đang tìm thì báo không khớp', () => {
  render(bao(<BangBHChoSerial items={[]} {...chung} />))
  expect(screen.getByRole('table', { name: 'Chờ kích hoạt BH' })).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Không tìm thấy máy nào' })).toBeTruthy()
})
