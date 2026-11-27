// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import { DsRoot } from '@/components/ui/ds-root'
import { OrderForm } from './OrderForm'

const { timKhachChoDon } = vi.hoisted(() => ({
  timKhachChoDon: vi.fn(async () => [
    { customer_code: 'KH042', name: 'Nguyễn Văn A', phone: '0901', phone_chuan: '0901234567', province: 'Hà Nội', province_moi: null },
  ]),
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
vi.mock('./actions', () => ({
  taoDon: vi.fn(), suaDon: vi.fn(), timKhachChoDon,
  boiCanhGia: vi.fn(async () => ({ bac: null, ctkm: null, soCtkmKhac: 0 })),
}))

afterEach(() => vi.unstubAllGlobals())

// Lỗi cũ: danh sách "Khách cũ" tự vẽ đóng bằng onBlur + relatedTarget — Safari/iOS không focus nút khi bấm nên danh sách
// đóng trước khi click tới, không chọn được khách. Nay là Combobox DS (pop portal): bấm mục là chọn.
test('Khách cũ: gõ tìm trong Combobox rồi bấm mục → hiện khách đã chọn, nút Đổi quay lại ô tìm', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  const u = userEvent.setup()
  render(<DsRoot><OrderForm catalog={[]} channels={[]} /></DsRoot>)

  await u.click(screen.getByRole('button', { name: /Tìm khách hàng/ }))
  await u.keyboard('Nguy')
  await u.click(await screen.findByRole('option', { name: /Nguyễn Văn A/ }))

  expect(timKhachChoDon).toHaveBeenCalledWith('Nguy')
  expect(await screen.findByText('Nguyễn Văn A')).toBeTruthy()
  expect(screen.getByText('KH042')).toBeTruthy()
  await u.click(screen.getByRole('button', { name: 'Đổi' }))
  expect(screen.getByRole('button', { name: /Tìm khách hàng/ })).toBeTruthy()
})
