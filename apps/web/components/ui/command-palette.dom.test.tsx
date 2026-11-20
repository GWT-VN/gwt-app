// @vitest-environment jsdom
import { useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import { CommandPalette, PhimMoLenh, usePhimMoLenh, type NhomLenh } from './command-palette'
import { DsRoot } from './ds-root'

// Dữ liệu demo — tên giả, SĐT giả.
const NHOM: NhomLenh[] = [
  {
    ten: 'Ticket',
    muc: [{ id: 'TK-2611-045', ten: 'TK-2611-045 · Khách sạn Sen Vàng', phu: 'Mới · xếp lịch trong ngày', truong: ['TK-2611-045', 'Khách sạn Sen Vàng'] }],
  },
  {
    ten: 'Khách hàng',
    muc: [
      { id: 'KH-01057', ten: 'Khách sạn Sen Vàng', phu: 'KH-01057 · SĐT •••3456', truong: ['Khách sạn Sen Vàng', 'KH-01057', '0909 123 456'] },
      ...[1, 2, 3, 4, 5, 6, 7].map((i) => ({ id: `KH-90${i}`, ten: `Cửa hàng Demo ${i}`, truong: [`Cửa hàng Demo ${i}`, `KH-90${i}`] })),
    ],
  },
]

function Khung({ onChon = () => {}, onHoiBap }: { onChon?: (id: string) => void; onHoiBap?: (q: string) => void }) {
  const [open, setOpen] = useState(false)
  usePhimMoLenh(setOpen)
  return (
    <DsRoot>
      <button type="button" onClick={() => setOpen(true)}>
        Tìm <PhimMoLenh />
      </button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        nhom={NHOM}
        onChon={(m) => onChon(m.id)}
        onHoiBap={onHoiBap}
        phamVi="ticket, khách"
      />
    </DsRoot>
  )
}

const oTim = () => screen.getByRole('combobox')
const muc = () => screen.queryAllByRole('option')
const trangThai = () => screen.getByRole('status')
const nutMo = () => screen.getByRole('button', { name: /^Tìm/ })

async function moVaGo(user: ReturnType<typeof userEvent.setup>, chu: string) {
  await user.click(nutMo())
  await waitFor(() => expect(document.activeElement).toBe(oTim()))
  if (chu) await user.keyboard(chu)
}

afterEach(() => vi.restoreAllMocks())

test('Ctrl+K mở (không phải Mac), ⌘K không mở; nút ghi đúng phím Ctrl K', async () => {
  vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32')
  render(<Khung />)
  expect(nutMo().textContent).toContain('Ctrl')
  expect(nutMo().textContent).not.toContain('⌘')
  fireEvent.keyDown(window, { key: 'k', metaKey: true })
  expect(screen.queryByRole('dialog')).toBeNull()
  fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
  const hop = await screen.findByRole('dialog', { name: 'Tìm toàn cục' })
  expect(hop.closest('[data-ds-portal]')).not.toBeNull()
  await waitFor(() => expect(document.activeElement).toBe(oTim()))
})

test('Mac giả lập: ⌘K mở, Ctrl+K không mở; nút ghi ⌘ K', async () => {
  vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
  render(<Khung />)
  await waitFor(() => expect(nutMo().textContent).toContain('⌘'))
  expect(nutMo().textContent).not.toContain('Ctrl')
  fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
  expect(screen.queryByRole('dialog')).toBeNull()
  fireEvent.keyDown(window, { key: 'k', metaKey: true })
  await screen.findByRole('dialog', { name: 'Tìm toàn cục' })
})

test('"sen vang" (không dấu) khớp "Sen Vàng" ở cả ticket lẫn khách; đoạn khớp bọc mark; mục đầu sáng + activedescendant', async () => {
  const user = userEvent.setup()
  render(<Khung />)
  await moVaGo(user, 'sen vang')
  await waitFor(() => expect(muc()).toHaveLength(2))
  expect(muc()[0].textContent).toContain('TK-2611-045')
  expect(muc()[1].textContent).toContain('Khách sạn Sen Vàng')
  expect([...muc()[1].querySelectorAll('mark')].map((m) => m.textContent)).toContain('Sen Vàng')
  await waitFor(() => expect(muc()[0].getAttribute('aria-selected')).toBe('true'))
  await waitFor(() => expect(oTim().getAttribute('aria-activedescendant')).toBe(muc()[0].id))
  expect(trangThai().textContent).toBe('2 kết quả')
})

test('SĐT gõ "0909.123" hoặc "0909-123" khớp "0909 123 456"', async () => {
  const user = userEvent.setup()
  render(<Khung />)
  await moVaGo(user, '0909.123')
  await waitFor(() => expect(muc().map((m) => m.textContent?.includes('KH-01057'))).toEqual([true]))
  await user.clear(oTim())
  await user.keyboard('0909-123')
  await waitFor(() => expect(muc().map((m) => m.textContent?.includes('KH-01057'))).toEqual([true]))
})

test('mỗi nhóm tối đa 5 dòng, tên nhóm ghi 5/7, tổng số khớp đọc qua role=status', async () => {
  const user = userEvent.setup()
  render(<Khung />)
  await moVaGo(user, 'demo')
  await waitFor(() => expect(muc()).toHaveLength(5))
  const nhom = screen.getByRole('group', { name: /Khách hàng/ })
  expect(nhom.getAttribute('aria-labelledby')).toBeTruthy()
  expect(document.getElementById(nhom.getAttribute('aria-labelledby')!)?.textContent).toContain('5/7')
  expect(trangThai().textContent).toBe('7 kết quả')
})

test('không thấy → câu gợi ý NGOÀI listbox + dòng "Hỏi Bắp" (Enter gọi onHoiBap)', async () => {
  const user = userEvent.setup()
  const onHoiBap = vi.fn()
  render(<Khung onHoiBap={onHoiBap} />)
  await moVaGo(user, 'zzz')
  await waitFor(() => expect(trangThai().textContent).toBe('Không thấy “zzz”'))
  const goiY = screen.getByText(/Thử bỏ bớt chữ, hoặc hỏi Bắp/)
  expect(goiY.textContent).toContain('trong ticket, khách')
  expect(screen.getByRole('listbox').contains(goiY)).toBe(false)
  expect(muc()).toEqual([screen.getByRole('option', { name: 'Hỏi Bắp: “zzz”' })])
  await waitFor(() => expect(muc()[0].getAttribute('aria-selected')).toBe('true'))
  await user.keyboard('{Enter}')
  expect(onHoiBap).toHaveBeenCalledWith('zzz')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})

test('bộ gõ đang ghép chữ: Enter / ↑↓ không chọn, không dời; ghép xong → Enter mở', async () => {
  const user = userEvent.setup()
  const onChon = vi.fn()
  render(<Khung onChon={onChon} />)
  await moVaGo(user, '')
  const o = oTim()
  fireEvent.compositionStart(o)
  fireEvent.change(o, { target: { value: 'dem' } })
  const sangDau = muc().find((m) => m.getAttribute('aria-selected') === 'true')
  fireEvent.keyDown(o, { key: 'ArrowDown' })
  fireEvent.keyDown(o, { key: 'ArrowUp' })
  fireEvent.keyDown(o, { key: 'ArrowDown' })
  expect(muc().find((m) => m.getAttribute('aria-selected') === 'true')).toBe(sangDau)
  fireEvent.keyDown(o, { key: 'Enter' })
  expect(onChon).not.toHaveBeenCalled()
  expect(screen.getByRole('dialog')).toBeTruthy()
  fireEvent.compositionEnd(o, { data: 'dem' })
  await waitFor(() => expect(muc()).toHaveLength(5))
  await waitFor(() => expect(muc()[0].getAttribute('aria-selected')).toBe('true'))
  await user.keyboard('{ArrowDown}{Enter}')
  expect(onChon).toHaveBeenCalledWith('KH-902')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})

test('Esc đóng, focus về nút mở', async () => {
  const user = userEvent.setup()
  render(<Khung />)
  await moVaGo(user, 'sen')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(nutMo())
})
