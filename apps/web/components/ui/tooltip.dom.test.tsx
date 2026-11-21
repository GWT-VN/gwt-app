// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import { Button } from './button'
import { DsRoot } from './ds-root'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'
import { Tooltip, TooltipContent, TooltipNhanh, TooltipProvider, TooltipTrigger } from './tooltip'

/**
 * Đồng hồ giả cho test chạm ngưỡng 300ms (đồng hồ thật trên máy chậm/CI dễ lệch ngưỡng). `delay: null`: user-event không
 * hẹn giờ giữa các thao tác. KHÔNG `shouldAdvanceTime` (đo thật: thời gian thật trôi ~40ms lúc chạy làm tooltip hiện ở
 * "290ms") → test dùng nó không gọi waitFor/findBy. `xong()`: asyncWrapper của Testing Library chờ một setTimeout(0)
 * sau mỗi thao tác user-event (chỉ tự đẩy dưới jest) → đẩy 0ms để thao tác kết thúc.
 */
function dongHoGia() {
  vi.useFakeTimers()
  return userEvent.setup({ delay: null })
}
async function xong(p: Promise<void>) {
  await vi.advanceTimersByTimeAsync(0)
  await p
}
const toi = (ms: number) => act(async () => void vi.advanceTimersByTime(ms))
afterEach(() => vi.useRealTimers())

function Mau({ expanded }: { expanded?: boolean }) {
  return (
    <DsRoot theme="dark">
      <TooltipNhanh content="Cài đặt hiển thị">
        <Button variant="ghost" size="icon" aria-label="Cài đặt" aria-expanded={expanded}>
          ⚙
        </Button>
      </TooltipNhanh>
    </DsRoot>
  )
}

test('Tab tới nút → tooltip hiện đúng chữ, nằm TRONG vùng [data-ds="v2"] (portal vào ô của DsRoot)', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.tab()
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cài đặt' }))
  const tip = await screen.findByRole('tooltip')
  expect(tip.textContent).toBe('Cài đặt hiển thị')
  expect(tip.closest('[data-ds-portal]')).not.toBeNull()
  expect(tip.closest('[data-ds="v2"]')?.getAttribute('data-theme')).toBe('dark')
})

test('rê chuột → hiện sau delay 300ms, không hiện ngay', async () => {
  const user = dongHoGia()
  render(<Mau />)
  await xong(user.hover(screen.getByRole('button', { name: 'Cài đặt' })))
  await toi(290)
  expect(screen.queryByRole('tooltip')).toBeNull()
  await toi(20)
  expect(screen.getByRole('tooltip').textContent).toBe('Cài đặt hiển thị')
})

test('Esc đóng tooltip', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.tab()
  await screen.findByRole('tooltip')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
})

test('nút đang aria-expanded="true" (đang mở menu) → hover lẫn focus phím đều không hiện tooltip', async () => {
  const user = dongHoGia()
  render(<Mau expanded />)
  await xong(user.tab())
  await xong(user.hover(screen.getByRole('button', { name: 'Cài đặt' })))
  await toi(1000)
  expect(screen.queryByRole('tooltip')).toBeNull()
})

test('focus phím rồi trang cuộn (Tab tới nút ngoài khung nhìn → trình duyệt tự cuộn) → tooltip vẫn mở như :focus-visible', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.tab()
  await screen.findByRole('tooltip')
  vi.useFakeTimers({ shouldAdvanceTime: true })
  fireEvent.scroll(document)
  await toi(50)
  expect(screen.queryByRole('tooltip')).not.toBeNull()
  // Esc vẫn đóng được khi đang focus phím.
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
})

test('rê chuột (không focus) rồi cuộn → đóng như Radix mặc định', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.hover(screen.getByRole('button', { name: 'Cài đặt' }))
  await screen.findByRole('tooltip')
  fireEvent.scroll(document)
  await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
})

test('đang mở mà trigger chuyển aria-expanded false → true (menu vừa mở) → tooltip đóng', async () => {
  const user = userEvent.setup()
  const { rerender } = render(<Mau expanded={false} />)
  await user.tab()
  await screen.findByRole('tooltip')
  rerender(<Mau expanded />)
  await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
})

test('ghép thật với DropdownMenuTrigger: focus phím hiện tooltip; mở menu → tooltip ẩn', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <DropdownMenu>
        <TooltipNhanh content="Mở thao tác cho đơn">
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Thao tác">
              ⋯
            </Button>
          </DropdownMenuTrigger>
        </TooltipNhanh>
        <DropdownMenuContent>
          <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </DsRoot>,
  )
  await user.tab()
  expect((await screen.findByRole('tooltip')).textContent).toBe('Mở thao tác cho đơn')
  await user.keyboard('{Enter}')
  await screen.findByRole('menu')
  await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
})

test('khung shadcn 4 phần (Provider + Root + Trigger + Content): Tab tới nút → tooltip trong vùng DS, đúng data-slot, side bottom', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              Xuất Excel
            </Button>
          </TooltipTrigger>
          <TooltipContent>Xuất theo bộ lọc đang chọn</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </DsRoot>,
  )
  await user.tab()
  const nut = screen.getByRole('button', { name: 'Xuất Excel' })
  expect(nut.getAttribute('data-slot')).toBe('tooltip-trigger')
  const tip = await screen.findByRole('tooltip')
  expect(tip.textContent).toBe('Xuất theo bộ lọc đang chọn')
  const noi = document.querySelector('[data-slot="tooltip-content"]')
  expect(noi?.closest('[data-ds-portal]')).not.toBeNull()
  expect(noi?.getAttribute('data-side')).toBe('bottom')
  expect(noi?.className).toContain('z-80')
})
