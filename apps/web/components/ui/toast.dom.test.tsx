// @vitest-environment jsdom
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import { DsRoot } from './ds-root'
import { Toaster, thongBao } from './toast'
import { Z_TOAST } from './toast-styles'

function Mau() {
  return (
    <DsRoot>
      <p>Trang</p>
      <Toaster />
    </DsRoot>
  )
}

/**
 * Đồng hồ giả chạy từng nhịp 50ms, mỗi nhịp một `act` riêng: trong một `act` React giữ lại cập nhật tới cuối → chuỗi
 * rAF → setState → effect → hẹn giờ gỡ toast của Sonner không chạy hết nếu tua một lèo.
 */
async function troi(ms: number) {
  for (let t = 0; t < ms; t += 50) await act(() => vi.advanceTimersByTimeAsync(50))
}

// Sonner giữ danh sách toast toàn cục và phát lại toast còn sống cho Toaster mới → đóng hết giữa các test.
afterEach(async () => {
  vi.useRealTimers()
  thongBao.dong()
  await act(() => new Promise((r) => setTimeout(r, 300)))
})

test('Toaster nằm trong vùng DS, z 56, đáy giữa cách đáy 72 (cả điện thoại)', async () => {
  render(<Mau />)
  act(() => {
    thongBao.xong('Đã lưu vùng')
  })
  const li = await waitFor(() => {
    const el = document.querySelector('[data-sonner-toast]')
    if (!el) throw new Error('chưa có toast')
    return el
  })
  const ol = li.closest<HTMLElement>('[data-sonner-toaster]')!
  expect(ol.closest('[data-ds="v2"]')).not.toBeNull()
  expect(ol.style.zIndex).toBe(String(Z_TOAST))
  expect(Z_TOAST).toBe(56)
  expect(ol.getAttribute('data-y-position')).toBe('bottom')
  expect(ol.getAttribute('data-x-position')).toBe('center')
  expect(ol.style.getPropertyValue('--offset-bottom')).toBe('72px')
  expect(ol.style.getPropertyValue('--mobile-offset-bottom')).toBe('72px')
  // vùng thông báo đọc tiếng Việt
  expect(ol.closest('section')?.getAttribute('aria-label')).toMatch(/^Thông báo/)
})

test('xong → role status; bấm Hoàn tác gọi hàm và toast đóng', async () => {
  const user = userEvent.setup()
  const hoanTac = vi.fn()
  render(<Mau />)
  act(() => {
    thongBao.xong('TK-2611-045 → Đang xử lý', { hoanTac })
  })
  const the = await screen.findByRole('status')
  expect(the.textContent).toContain('TK-2611-045 → Đang xử lý')
  await user.click(screen.getByRole('button', { name: 'Hoàn tác' }))
  expect(hoanTac).toHaveBeenCalledTimes(1)
  await waitFor(() => expect(screen.queryByText('TK-2611-045 → Đang xử lý')).toBeNull(), { timeout: 3000 })
})

test('lỗi không tự tắt sau 6 giây (xong cùng lúc thì tắt), role alert, Thử lại + nút đóng', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  const thuLai = vi.fn()
  render(<Mau />)
  act(() => {
    thongBao.loi('Không lưu được — mất kết nối', { thuLai })
    thongBao.xong('Đã lưu đối chứng')
  })
  await troi(50)
  expect(screen.getByRole('alert').textContent).toContain('Không lưu được — mất kết nối')
  expect(screen.getByText('Đã lưu đối chứng')).toBeTruthy()

  await troi(6000)
  // đối chứng: xong (5 giây) đã tắt → đồng hồ giả thật sự chạy hẹn giờ của Sonner
  expect(screen.queryByText('Đã lưu đối chứng')).toBeNull()
  const alert = screen.getByRole('alert')
  expect(alert.textContent).toContain('Không lưu được — mất kết nối')

  await user.click(screen.getByRole('button', { name: 'Thử lại' }))
  expect(thuLai).toHaveBeenCalledTimes(1)
  await troi(500)
  expect(screen.queryByRole('alert')).toBeNull()

  act(() => {
    thongBao.loi('Vẫn chưa lưu được')
  })
  await troi(50)
  await user.click(screen.getByRole('button', { name: 'Đóng thông báo' }))
  await troi(500)
  expect(screen.queryByText('Vẫn chưa lưu được')).toBeNull()
})

test('đang chạy → progressbar aria-valuenow, cập nhật + đổi sang xong cùng id (một toast)', async () => {
  render(<Mau />)
  let id: string | number = ''
  act(() => {
    id = thongBao.dangChay('Đang xuất Báo cáo thu chi 11.2026.xlsx', { tienDo: 20 })
  })
  const thanh = await screen.findByRole('progressbar', { name: 'Tiến độ' })
  expect(thanh.getAttribute('aria-valuenow')).toBe('20')
  expect(screen.getByRole('status').textContent).toContain('Đang xuất')

  act(() => {
    thongBao.dangChay('Đang xuất Báo cáo thu chi 11.2026.xlsx', { id, tienDo: 60 })
  })
  await waitFor(() => expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('60'))

  act(() => {
    expect(thongBao.xong('Đã xuất 11.2026.xlsx', { id })).toBe(id)
  })
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Đã xuất 11.2026.xlsx'))
  expect(screen.queryByRole('progressbar')).toBeNull()
  expect(document.querySelectorAll('[data-sonner-toast]').length).toBe(1)
})

test('đang chạy rồi lỗi → toast lỗi MỚI (vùng alert chèn mới, không đổi role tại chỗ)', async () => {
  render(<Mau />)
  let id: string | number = ''
  act(() => {
    id = thongBao.dangChay('Đang lưu phiếu')
  })
  await screen.findByRole('status')
  let idLoi: string | number = ''
  act(() => {
    idLoi = thongBao.loi('Không lưu được phiếu', { id })
  })
  expect(idLoi).not.toBe(id)
  await screen.findByRole('alert')
  await waitFor(() => expect(screen.queryByText('Đang lưu phiếu')).toBeNull(), { timeout: 3000 })
})

test('giảm chuyển động → không trượt (Sonner tắt transition, DS cũng tắt)', async () => {
  render(<Mau />)
  act(() => {
    thongBao.xong('Đã lưu chuyển động')
  })
  await screen.findByText('Đã lưu chuyển động')
  const li = document.querySelector('[data-sonner-toast]')!
  expect(li.className).toContain('motion-reduce:transition-none!')
  const css = [...document.head.querySelectorAll('style')].map((s) => s.textContent).join('')
  expect(css).toMatch(/@media \(prefers-reduced-motion\)\{[^}]*\[data-sonner-toast\][^{]*\{transition:none!important;animation:none!important\}/)
})
