// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import { DsRoot } from '@/components/ui/ds-root'
import { CtkmForm } from './ctkm/CtkmForm'
import { OrderActions } from './OrderActions'
import ChiTietDonPage from './don/[code]/page'
import TaoKhachPage from './khach/moi/page'

const { push, traSdtSales, taoKhach, xoaDon, luuNhap } = vi.hoisted(() => ({
  push: vi.fn(),
  luuNhap: vi.fn(async () => ({ ok: true, id: 'ctkm-1' })),
  xoaDon: vi.fn(async () => ({ ok: true })),
  traSdtSales: vi.fn(async () => ({
    khop: ['sales'], cs: null, quaSdtPhu: false, nhieuHoSo: false,
    sales: { customer_code: 'KH001', name: 'Khách cũ', phone: null, address: null, province: null, company_invoice: null, tax_code: null },
  })),
  taoKhach: vi.fn(async () => ({ ok: true, customer_code: 'KA001' })),
}))

vi.mock('next/navigation', () => ({ redirect: vi.fn(), notFound: vi.fn(), useRouter: () => ({ push, refresh: vi.fn() }) }))
vi.mock('@/lib/nen-tang/gac-cong', () => ({ coTheVaoSales: async () => true }))
vi.mock('@/lib/nen-tang/phien', () => ({ requireNhanSu: vi.fn() }))
vi.mock('./ctkm/actions', () => ({ luuNhap, banHanh: vi.fn(), timKhachChoCtkm: vi.fn() }))
vi.mock('./actions', () => ({
  kenhChonDuoc: async () => [], nhanVienChonDuoc: async () => [],
  taoKhach, traSdtSales, xoaDon, suaKhach: vi.fn(),
  chiTietDon: async () => ({
    order_code: 'ORD-002',
    source_tab: 'DON_POE',
    fulfillment_status: 'Đã giao',
    total_net: 200,
    total_vat_tien: 20,
    total_vat: 220,
    lines: [{
      key: 'sp-1', internal_code: 'MSP', product_name: 'Máy lọc', quantity: 2,
      unit_price_vat: 110, gia_niem_yet: 130, khuyen_mai: 40,
      vat_pct: 10, vat_loai: null, amount_vat: 220,
    }],
  }),
}))

afterEach(() => vi.unstubAllGlobals())

test('the Sales customer creation route uses the v2 form and keeps lookup and post-save navigation', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  const u = userEvent.setup()
  const { container } = render(await TaoKhachPage())
  expect(container.querySelector('[data-ds="v2"] form[data-slot="form-layout"]')).not.toBeNull()

  await u.type(screen.getByRole('textbox', { name: 'SĐT' }), '0900000000')
  await u.tab()
  expect(traSdtSales).toHaveBeenCalledWith('0900000000')
  expect((await screen.findByRole('link', { name: 'Mở hồ sơ Sales: Khách cũ' })).getAttribute('href')).toBe('/sales/khach/KH001')
  await u.type(screen.getByRole('textbox', { name: 'Tên khách' }), 'Khách mới')
  await u.click(screen.getByRole('button', { name: 'Tạo khách' }))
  expect(taoKhach).toHaveBeenCalledWith(expect.objectContaining({ name: 'Khách mới', phone: '0900000000' }))
  expect(push).toHaveBeenCalledWith('/sales/khach/KA001')
})

test('deleting an order waits for confirmation and returns to the order list', async () => {
  const u = userEvent.setup()
  render(<DsRoot><OrderActions orderCode="ORD-001" /></DsRoot>)
  expect(screen.getByRole('link', { name: 'Sửa' }).getAttribute('href')).toBe('/sales/don/ORD-001/sua')

  await u.click(screen.getByRole('button', { name: 'Xoá' }))
  const confirmation = screen.getByRole('alertdialog', { name: /Xoá đơn ORD-001/ })
  expect(xoaDon).not.toHaveBeenCalled()
  await u.click(within(confirmation).getByRole('button', { name: 'Huỷ' }))
  expect(xoaDon).not.toHaveBeenCalled()

  await u.click(screen.getByRole('button', { name: 'Xoá' }))
  await u.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Xoá đơn' }))
  await waitFor(() => expect(push).toHaveBeenCalledWith('/sales'))
  expect(xoaDon).toHaveBeenCalledExactlyOnceWith('ORD-001')
})

test('order detail shows the line quantities and VAT totals in the v2 layout', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  const { container } = render(await ChiTietDonPage({ params: Promise.resolve({ code: 'ORD-002' }) }))

  expect(container.querySelector('[data-ds="v2"] [data-slot="detail-layout"]')).not.toBeNull()
  expect(screen.getByRole('heading', { name: 'ORD-002' })).toBeTruthy()
  const table = screen.getByRole('table')
  expect(within(table).getByRole('row', { name: /Máy lọc MSP.*2 110 ₫.*10% 220 ₫/ })).toBeTruthy()
  expect(within(table).getByRole('row', { name: 'Tổng trước VAT 200 ₫' })).toBeTruthy()
  expect(within(table).getByRole('row', { name: 'Tiền VAT 20 ₫' })).toBeTruthy()
  expect(within(table).getByRole('row', { name: 'Tổng sau VAT 220 ₫' })).toBeTruthy()
})


test('campaign channel search preserves specific and whole-group selections', async () => {
  const user = userEvent.setup()
  const kenhDs = [
    ...Array.from({ length: 12 }, (_, i) => ({ id: i + 1, l1: 'Cửa hàng', l2: 'Địa điểm ' + (i + 1) })),
    ...Array.from({ length: 11 }, (_, i) => ({ id: i + 20, l1: 'Kênh ' + (i + 1), l2: 'Đối tác' })),
  ]
  render(<DsRoot><CtkmForm kenhDs={kenhDs} spDs={[]} coQuyenDuyet={false} /></DsRoot>)
  await user.type(screen.getByRole('textbox', { name: 'Tên chương trình' }), 'Khuyến mãi tháng 12')
  fireEvent.change(screen.getByLabelText(/Từ ngày/), { target: { value: '2026-12-01' } })

  await user.click(screen.getByRole('button', { name: 'Kênh cấp 2' }))
  await user.keyboard('dia diem 12')
  await user.click(await screen.findByRole('option', { name: 'Địa điểm 12' }))
  await user.click(screen.getByRole('button', { name: /Thêm kênh/ }))

  await user.click(screen.getByRole('button', { name: 'Kênh cấp 1 Cửa hàng' }))
  await user.keyboard('kenh 11')
  await user.click(await screen.findByRole('option', { name: 'Kênh 11' }))
  expect(screen.getByRole('combobox', { name: 'Kênh cấp 2' }).textContent).toContain('Toàn bộ Kênh 11')
  await user.click(screen.getByRole('button', { name: /Thêm kênh/ }))
  await user.click(screen.getByRole('button', { name: 'Lưu nháp' }))
  expect(luuNhap).toHaveBeenCalledWith(expect.objectContaining({ kenh: [12, 30] }))
})
