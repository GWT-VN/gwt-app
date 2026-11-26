// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { DuyetList } from './DuyetList'
import { DsRoot } from './ui/ds-root'

const { duyetNhieuYeuCau } = vi.hoisted(() => ({
  duyetNhieuYeuCau: vi.fn().mockResolvedValue({ da_duyet: 1, loi: [] }),
}))
vi.mock('@/app/actions', () => ({ duyetNhieuYeuCau }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

test('duyệt hàng loạt yêu cầu đã chọn sau xác nhận', async () => {
  const user = userEvent.setup()
  render(<DsRoot><DuyetList items={[{
    id: 'yc1', doi_tuong: 'cs_customers', ban_ghi_id: 'kh1', loai: 'sua',
    payload: { full_name: 'Khách mẫu' }, ly_do: null, nguoi_gui: null, created_at: '2026-11-26',
  }]} /></DsRoot>)
  await user.click(screen.getByRole('checkbox', { name: /Chọn tất cả/ }))
  await user.click(screen.getByRole('button', { name: 'Duyệt 1 mục đã chọn' }))
  const dialog = screen.getByRole('alertdialog', { name: 'Duyệt 1 yêu cầu đã chọn?' })
  expect(duyetNhieuYeuCau).not.toHaveBeenCalled()
  await user.click(within(dialog).getByRole('button', { name: 'Duyệt yêu cầu' }))
  expect(duyetNhieuYeuCau).toHaveBeenCalledWith(['yc1'])
})