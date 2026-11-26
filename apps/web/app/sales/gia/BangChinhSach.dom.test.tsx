// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { BangChinhSach } from './BangChinhSach'

const { luuOChinhSach, refresh } = vi.hoisted(() => ({
  luuOChinhSach: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('./actions', () => ({ luuOChinhSach, luuHangLoat: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

test('focus rồi rời ô không ghi giá, vẫn thử lại được lỗi lưu với bản nháp giữ nguyên', async () => {
  luuOChinhSach
    .mockResolvedValueOnce({ ok: false, error: 'Chưa kết nối được.' })
    .mockResolvedValueOnce({ ok: true })
  const user = userEvent.setup()
  render(<BangChinhSach ds={[{
    ma: 'QA-01', ten: 'Máy QA', niem_yet: 1000000,
    bac: { NPP: null, DAI_LY: null, GIOI_THIEU: null },
  }]} lichSu={[]} coQuyenSoan />)
  const oGiam = screen.getByRole<HTMLInputElement>('spinbutton', { name: /QA-01.*Cấp 2.*% giảm/ })
  await user.click(oGiam)
  await user.tab()
  expect(luuOChinhSach).not.toHaveBeenCalled()

  await user.click(oGiam)
  await user.type(oGiam, '15')
  await user.tab()
  await screen.findByText(/Chưa kết nối được.*thử lại/)
  expect(oGiam.value).toBe('15')
  await user.click(oGiam)
  await user.tab()

  await waitFor(() => expect(refresh).toHaveBeenCalledOnce())
  expect(luuOChinhSach).toHaveBeenCalledTimes(2)
  expect(luuOChinhSach).toHaveBeenLastCalledWith('DAI_LY', 'QA-01', 'PCT', 15, 1000000)
})
