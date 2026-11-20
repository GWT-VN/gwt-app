// @vitest-environment jsdom
import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Dialog, DialogContent, DialogTitle } from './dialog'
import { DsRoot } from './ds-root'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, selectTrigger } from './select'

function KenhBan({ onDoi = () => {}, invalid }: { onDoi?: (v: string) => void; invalid?: boolean }) {
  const [v, setV] = useState('showroom')
  return (
    <Select
      value={v}
      onValueChange={(x) => {
        setV(x)
        onDoi(x)
      }}
    >
      <SelectTrigger aria-label="Kênh bán" aria-invalid={invalid}>
        <SelectValue placeholder="Chọn kênh bán" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="online">Online</SelectItem>
        <SelectItem value="showroom">Showroom</SelectItem>
        <SelectItem value="dai-ly">Đại lý</SelectItem>
        <SelectItem value="san" disabled>
          Sàn TMĐT (chưa mở)
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

const trigger = () => screen.getByRole('combobox', { name: 'Kênh bán' })

test('bấm trigger → listbox nằm TRONG vùng [data-ds="v2"] (ô portal của DsRoot), theme tối', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot theme="dark">
      <KenhBan />
    </DsRoot>,
  )
  const nut = trigger()
  await user.click(nut)
  const ds = await screen.findByRole('listbox')
  expect(ds.closest('[data-ds-portal]')).not.toBeNull()
  expect(ds.closest('[data-ds="v2"]')?.getAttribute('data-theme')).toBe('dark')
  expect(nut.getAttribute('aria-expanded')).toBe('true')
})

test.each(['{Enter}', ' ', '{ArrowDown}'])('mở bằng phím %s → ↓ → Enter chọn, onValueChange nhận đúng giá trị, focus về trigger', async (phim) => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <KenhBan onDoi={onDoi} />
    </DsRoot>,
  )
  const nut = trigger()
  nut.focus()
  await user.keyboard(phim)
  await screen.findByRole('listbox')
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Showroom'))
  await user.keyboard('{ArrowDown}')
  await user.keyboard('{Enter}')
  await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
  expect(onDoi).toHaveBeenLastCalledWith('dai-ly')
  expect(nut.textContent).toContain('Đại lý')
  expect(document.activeElement).toBe(nut)
})

test('mục disabled: aria-disabled, ↓ bỏ qua (hành vi Radix Select), không chọn được', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <KenhBan onDoi={onDoi} />
    </DsRoot>,
  )
  trigger().focus()
  await user.keyboard('{Enter}')
  const tat = await screen.findByRole('option', { name: 'Sàn TMĐT (chưa mở)' })
  expect(tat.getAttribute('aria-disabled')).toBe('true')
  await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
  expect(document.activeElement?.textContent).toBe('Đại lý')
  await user.click(tat)
  expect(onDoi).not.toHaveBeenCalled()
})

test('mục đang chọn có ✓ (aria-selected), mục khác không', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <KenhBan />
    </DsRoot>,
  )
  await user.click(trigger())
  const chon = await screen.findByRole('option', { name: 'Showroom' })
  expect(chon.getAttribute('aria-selected')).toBe('true')
  expect(chon.querySelector('svg')).not.toBeNull()
  expect(screen.getByRole('option', { name: 'Online' }).querySelector('svg')).toBeNull()
})

test('mở bằng chuột → mục tắt vòng focus (chỉ nền sáng như preview); ↓ sau đó → vòng hiện lại; mở bằng phím → có vòng', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <KenhBan />
    </DsRoot>,
  )
  const tatVong = (ten: string) => screen.getByRole('option', { name: ten }).className.includes('[outline:none]!')
  await user.click(trigger())
  await screen.findByRole('listbox')
  expect(tatVong('Showroom')).toBe(true)
  await user.keyboard('{ArrowDown}')
  expect(tatVong('Đại lý')).toBe(false)
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
  await user.keyboard('{Enter}')
  await screen.findByRole('listbox')
  expect(tatVong('Showroom')).toBe(false)
})

test('Esc đóng, focus về trigger, không đổi giá trị', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <KenhBan onDoi={onDoi} />
    </DsRoot>,
  )
  const nut = trigger()
  await user.click(nut)
  await screen.findByRole('listbox')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
  expect(document.activeElement).toBe(nut)
  expect(onDoi).not.toHaveBeenCalled()
})

test('aria-invalid trên trigger giữ nguyên; placeholder → data-placeholder trên trigger', () => {
  render(
    <DsRoot>
      <KenhBan invalid />
      <Select>
        <SelectTrigger aria-label="Tình trạng hàng">
          <SelectValue placeholder="Chọn tình trạng hàng" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="con">Còn hàng</SelectItem>
        </SelectContent>
      </Select>
    </DsRoot>,
  )
  expect(trigger().getAttribute('aria-invalid')).toBe('true')
  const ph = screen.getByRole('combobox', { name: 'Tình trạng hàng' })
  expect(ph.hasAttribute('data-placeholder')).toBe(true)
  expect(ph.textContent).toContain('Chọn tình trạng hàng')
})

test('selectTrigger đã gộp sẵn: gắn thô (không qua cn) vẫn chỉ một độ đậm gốc là medium', () => {
  const lop = selectTrigger.split(' ')
  expect(lop).toContain('font-medium')
  expect(lop).not.toContain('font-normal')
})

test('selectTrigger xuất ra là chuỗi class dùng lại được, SelectTrigger mang nó', () => {
  render(
    <DsRoot>
      <KenhBan />
    </DsRoot>,
  )
  expect(typeof selectTrigger).toBe('string')
  for (const c of selectTrigger.split(' ').slice(0, 5)) expect(trigger().classList).toContain(c)
})

test('Select trong Dialog: Esc lần 1 chỉ đóng Select (Dialog còn mở), lần 2 mới đóng Dialog', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <Dialog defaultOpen>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Sửa đơn</DialogTitle>
          <KenhBan />
        </DialogContent>
      </Dialog>
    </DsRoot>,
  )
  const nut = await screen.findByRole('combobox', { name: 'Kênh bán' })
  await user.click(nut)
  await screen.findByRole('listbox')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
  expect(screen.getByRole('dialog', { name: 'Sửa đơn' })).toBeTruthy()
  expect(document.activeElement).toBe(nut)
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})
