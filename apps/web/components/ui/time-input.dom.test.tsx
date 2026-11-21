// @vitest-environment jsdom
import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { DsRoot } from './ds-root'
import { TimeInput } from './time-input'

function Gio({ dau = null, onDoi }: { dau?: string | null; onDoi?: (g: string) => void }) {
  const [v, setV] = useState<string | null>(dau)
  return (
    <TimeInput
      aria-label="Giờ"
      value={v}
      onValueChange={(g) => {
        setV(g)
        onDoi?.(g)
      }}
    />
  )
}

const o = () => screen.getByRole('combobox', { name: 'Giờ' }) as HTMLInputElement

test.each([
  ['1430', '14:30'],
  ['14:30', '14:30'],
  ['9', '09:00'],
  ['14:45', '14:45'],
])('gõ "%s" + Enter → chốt %s', async (go, ra) => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <Gio onDoi={onDoi} />
    </DsRoot>,
  )
  await user.click(o())
  await user.keyboard(`${go}{Enter}`)
  expect(onDoi).toHaveBeenLastCalledWith(ra)
  expect(o().value).toBe(ra)
})

test('phút lẻ 14:45 không có trong gợi ý → đứng đầu danh sách, ghi "đã gõ"', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <Gio />
    </DsRoot>,
  )
  await user.click(o())
  await user.keyboard('14:45')
  const ds = await screen.findByRole('listbox', { name: 'Gợi ý giờ' })
  const dau = ds.querySelector('[role=option]')!
  expect(dau.textContent).toContain('14:45')
  expect(dau.textContent).toContain('đã gõ')
  expect(o().getAttribute('aria-activedescendant')).toBe(dau.id)
  // Danh sách gợi ý không bọc trong một dialog không tên (Radix Popover mặc định role=dialog) — trong DateTimePicker
  // trình đọc màn hình sẽ thấy hai dialog lồng nhau.
  expect(screen.queryByRole('dialog')).toBeNull()
})

test('↓ dời mục sáng trong gợi ý, Enter chốt mục sáng', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <Gio dau="09:00" onDoi={onDoi} />
    </DsRoot>,
  )
  await user.click(o())
  await user.keyboard('{ArrowDown}{Enter}')
  expect(onDoi).toHaveBeenLastCalledWith('09:30')
})

test('Enter khi bộ gõ đang ghép chữ (isComposing) → KHÔNG chốt', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <Gio onDoi={onDoi} />
    </DsRoot>,
  )
  await user.click(o())
  await user.keyboard('1430')
  fireEvent.keyDown(o(), { key: 'Enter', isComposing: true })
  expect(onDoi).not.toHaveBeenCalled()
})

test('gõ sai → aria-invalid; rời ô trả về giá trị cũ, không gọi', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <Gio dau="17:30" onDoi={onDoi} />
      <button type="button">khác</button>
    </DsRoot>,
  )
  await user.click(o())
  await user.keyboard('25')
  expect(o().getAttribute('aria-invalid')).toBe('true')
  await user.click(screen.getByRole('button', { name: 'khác' }))
  expect(onDoi).not.toHaveBeenCalled()
  expect(o().value).toBe('17:30')
})

test('placeholder truyền vào hiện ở ô trống (giờ mặc định của DateTimePicker)', () => {
  render(
    <DsRoot>
      <TimeInput aria-label="Giờ" value={null} onValueChange={() => {}} placeholder="17:30" />
    </DsRoot>,
  )
  expect(o().placeholder).toBe('17:30')
})
