// @vitest-environment jsdom
import { useState } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import type { MucChon } from '@/bang'
import { Combobox } from './combobox'
import { Dialog, DialogContent, DialogTitle } from './dialog'
import { DsRoot } from './ds-root'

// Dữ liệu demo: mã là số thứ tự.
const TINH: MucChon[] = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'An Giang', 'Bắc Giang', 'Bắc Ninh',
  'Bến Tre', 'Bình Định', 'Bình Dương', 'Cà Mau'].map((nhan, i) => ({ gt: String(i + 1).padStart(2, '0'), nhan }))

function ChonTinh({ onDoi = () => {}, max, dau = '01' }: { onDoi?: (v: string | null) => void; max?: number; dau?: string | null }) {
  const [v, setV] = useState<string | null>(dau)
  return (
    <Combobox
      aria-label="Tỉnh/thành"
      value={v}
      onValueChange={(x) => {
        setV(x)
        onDoi(x)
      }}
      options={TINH}
      max={max}
    />
  )
}

// Tên đọc = nhãn + mục đang chọn ("Tỉnh/thành Hà Nội") — khớp đầu nhãn.
const trigger = () => screen.getByRole('button', { name: /^Tỉnh\/thành( |$)/ })
const oTim = () => screen.getByRole('combobox')
const muc = () => screen.queryAllByRole('option')

test('bấm trigger → pop trong vùng DS, focus vào ô tìm, mục đầu sáng sẵn, mục đang chọn có ✓', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot theme="dark">
      <ChonTinh />
    </DsRoot>,
  )
  const nut = trigger()
  expect(nut.textContent).toContain('Hà Nội')
  await user.click(nut)
  const ds = await screen.findByRole('listbox')
  expect(ds.closest('[data-ds-portal]')).not.toBeNull()
  expect(ds.closest('[data-ds="v2"]')?.getAttribute('data-theme')).toBe('dark')
  expect(nut.getAttribute('aria-expanded')).toBe('true')
  await waitFor(() => expect(document.activeElement).toBe(oTim()))
  await waitFor(() => expect(muc()[0].getAttribute('aria-selected')).toBe('true'))
  await waitFor(() => expect(oTim().getAttribute('aria-activedescendant')).toBe(muc()[0].id))
  expect(muc()[0].getAttribute('data-checked')).toBe('true')
  expect(muc()[1].getAttribute('data-checked')).toBeNull()
})

test('gõ không dấu lọc theo tên lẫn mã; ↓ di chuyển, Enter chọn → onValueChange + đóng + focus về trigger', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <ChonTinh onDoi={onDoi} />
    </DsRoot>,
  )
  const nut = trigger()
  await user.click(nut)
  await user.keyboard('bac')
  await waitFor(() => expect(muc().map((m) => m.textContent)).toEqual(['07Bắc Giang', '08Bắc Ninh']))
  await user.keyboard('{ArrowDown}')
  await waitFor(() => expect(muc()[1].getAttribute('aria-selected')).toBe('true'))
  await user.keyboard('{ArrowUp}')
  await waitFor(() => expect(muc()[0].getAttribute('aria-selected')).toBe('true'))
  await user.keyboard('{ArrowDown}{Enter}')
  await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
  expect(onDoi).toHaveBeenLastCalledWith('08')
  expect(nut.textContent).toContain('Bắc Ninh')
  expect(document.activeElement).toBe(nut)
})

test('gõ mã "12" ra mục mã 12', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <ChonTinh />
    </DsRoot>,
  )
  await user.click(trigger())
  await user.keyboard('12')
  await waitFor(() => expect(muc().map((m) => m.textContent)).toEqual(['12Cà Mau']))
})

test('bộ gõ đang ghép chữ (compositionstart): Enter KHÔNG chọn, chưa lọc theo chữ dở; compositionend → lọc, Enter chọn', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <ChonTinh onDoi={onDoi} />
    </DsRoot>,
  )
  await user.click(trigger())
  const o = oTim()
  await waitFor(() => expect(document.activeElement).toBe(o))
  fireEvent.compositionStart(o)
  fireEvent.change(o, { target: { value: 'cà m' } })
  expect(muc()).toHaveLength(12)
  await user.keyboard('{Enter}')
  expect(onDoi).not.toHaveBeenCalled()
  expect(screen.getByRole('listbox')).toBeTruthy()
  fireEvent.compositionEnd(o, { data: 'cà m' })
  await waitFor(() => expect(muc().map((m) => m.textContent)).toEqual(['12Cà Mau']))
  await waitFor(() => expect(muc()[0].getAttribute('aria-selected')).toBe('true'))
  await user.keyboard('{Enter}')
  expect(onDoi).toHaveBeenLastCalledWith('12')
})

test('Esc đóng, focus về trigger, giá trị giữ nguyên', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <ChonTinh onDoi={onDoi} />
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

test('Combobox trong Dialog: Esc lần 1 chỉ đóng pop (Dialog còn mở), lần 2 mới đóng Dialog', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <Dialog defaultOpen>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Sửa khách</DialogTitle>
          <ChonTinh />
        </DialogContent>
      </Dialog>
    </DsRoot>,
  )
  const nut = await screen.findByRole('button', { name: 'Tỉnh/thành Hà Nội' })
  await user.click(nut)
  await screen.findByRole('listbox')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
  expect(screen.getByRole('dialog', { name: 'Sửa khách' })).toBeTruthy()
  expect(document.activeElement).toBe(nut)
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})

test('ghi chú cuối (aria-live): cắt bớt → "Đang hiện N / M mục — gõ thêm để thu hẹp"; không cắt → "M mục"', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <ChonTinh max={5} />
    </DsRoot>,
  )
  await user.click(trigger())
  const note = await screen.findByText('Đang hiện 5 / 12 mục — gõ thêm để thu hẹp')
  expect(note.getAttribute('aria-live')).toBe('polite')
  expect(muc()).toHaveLength(5)
  await user.keyboard('bac')
  await waitFor(() => expect(note.textContent).toBe('2 mục'))
  await user.keyboard('zz')
  await waitFor(() => expect(note.textContent).toBe('Không có mục nào khớp "baczz".'))
  expect(muc()).toHaveLength(0)
})

test('nút ✕ trong trigger bỏ chọn → onValueChange(null), placeholder hiện lại; không có giá trị thì không có ✕', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <ChonTinh onDoi={onDoi} />
    </DsRoot>,
  )
  await user.click(screen.getByRole('button', { name: 'Bỏ chọn Hà Nội' }))
  expect(onDoi).toHaveBeenLastCalledWith(null)
  expect(trigger().hasAttribute('data-placeholder')).toBe(true)
  expect(trigger().textContent).toContain('Chọn…')
  expect(screen.queryByRole('button', { name: /^Bỏ chọn/ })).toBeNull()
  expect(screen.queryByRole('listbox')).toBeNull()
})

test('aria-invalid trên trigger; disabled → không mở, không có ✕', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <Combobox aria-label="Lỗi" aria-invalid value={null} onValueChange={() => {}} options={TINH} />
      <Combobox aria-label="Tắt" disabled value="01" onValueChange={() => {}} options={TINH} />
    </DsRoot>,
  )
  expect(screen.getByRole('button', { name: 'Lỗi' }).getAttribute('aria-invalid')).toBe('true')
  const tat = screen.getByRole('button', { name: 'Tắt Hà Nội' })
  await user.click(tat)
  expect(screen.queryByRole('listbox')).toBeNull()
  expect(screen.queryByRole('button', { name: /^Bỏ chọn/ })).toBeNull()
})

test('tìm xa: chưa đủ ký tự → câu "Gõ thêm"; đang tìm → "Đang tìm…"; về → mục, chọn được; lỗi → câu lỗi tim ném ra', async () => {
  const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) })
  vi.useFakeTimers({ shouldAdvanceTime: true })
  try {
    let xong: (v: MucChon[]) => void = () => {}
    const tim = vi.fn((q: string) =>
      q === 'loi' ? Promise.reject(new Error('Mất kết nối')) : new Promise<MucChon[]>((r) => { xong = r }),
    )
    const onDoi = vi.fn()
    render(
      <DsRoot>
        <Combobox aria-label="Khách" value={null} onValueChange={onDoi} tim={tim} />
      </DsRoot>,
    )
    await user.click(screen.getByRole('button', { name: 'Khách' }))
    const note = await screen.findByText('Gõ thêm — cần ít nhất 2 ký tự để tìm.')
    await user.keyboard('ng')
    await waitFor(() => expect(note.textContent).toBe('Đang tìm…'))
    await act(async () => { await vi.advanceTimersByTimeAsync(250) })
    expect(tim).toHaveBeenCalledWith('ng')
    await act(async () => { xong([{ gt: 'KH01', nhan: 'Nguyễn Văn A (demo)', phu: '090xxx' }]) })
    await waitFor(() => expect(muc()).toHaveLength(1))
    expect(note.textContent).toBe('1 kết quả')
    await user.keyboard('{Backspace}{Backspace}loi')
    await act(async () => { await vi.advanceTimersByTimeAsync(250) })
    await waitFor(() => expect(note.textContent).toBe('Mất kết nối'))
    await user.keyboard('{Backspace}{Backspace}{Backspace}ng')
    await act(async () => { await vi.advanceTimersByTimeAsync(250) })
    await act(async () => { xong([{ gt: 'KH01', nhan: 'Nguyễn Văn A (demo)' }]) })
    await waitFor(() => expect(muc()).toHaveLength(1))
    await user.keyboard('{Enter}')
    expect(onDoi).toHaveBeenLastCalledWith('KH01')
  } finally {
    vi.useRealTimers()
  }
})

test('pop là dialog CÓ tên (không đè aria-haspopup thành listbox); tên lấy từ aria-label của trigger', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <ChonTinh />
    </DsRoot>,
  )
  expect(trigger().getAttribute('aria-haspopup')).toBe('dialog')
  await user.click(trigger())
  expect(await screen.findByRole('dialog', { name: 'Tỉnh/thành' })).toBeTruthy()
})

test('tìm xa + value có sẵn (form sửa): mucDangChon cho trigger hiện tên thay vì mã thô', () => {
  const tim = vi.fn(async () => [])
  render(
    <DsRoot>
      <Combobox
        aria-label="Khách"
        value="KH01"
        mucDangChon={{ gt: 'KH01', nhan: 'Nguyễn Văn A (demo)' }}
        onValueChange={() => {}}
        tim={tim}
      />
      <Combobox aria-label="Khách lệch" value="KH02" mucDangChon={{ gt: 'KH01', nhan: 'Sai' }} onValueChange={() => {}} tim={tim} />
    </DsRoot>,
  )
  const nut = screen.getByRole('button', { name: 'Khách Nguyễn Văn A (demo)' })
  expect(nut.textContent).toContain('Nguyễn Văn A (demo)')
  expect(nut.textContent).not.toContain('KH01')
  expect(screen.getByRole('button', { name: 'Bỏ chọn Nguyễn Văn A (demo)' })).toBeTruthy()
  // mucDangChon không khớp value → không bịa tên, hiện mã.
  expect(screen.getByRole('button', { name: 'Khách lệch KH02' }).textContent).toContain('KH02')
})

test('tìm xa: kết quả chạm trần max → "N kết quả đầu — gõ thêm để thu hẹp"', async () => {
  const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) })
  vi.useFakeTimers({ shouldAdvanceTime: true })
  try {
    const tim = vi.fn(async () => TINH.slice(0, 5))
    render(
      <DsRoot>
        <Combobox aria-label="Khách" value={null} onValueChange={() => {}} tim={tim} max={5} />
      </DsRoot>,
    )
    await user.click(screen.getByRole('button', { name: 'Khách' }))
    await user.keyboard('ng')
    await act(async () => { await vi.advanceTimersByTimeAsync(250) })
    await waitFor(() => expect(muc()).toHaveLength(5))
    expect(screen.getByText('5 kết quả đầu — gõ thêm để thu hẹp').getAttribute('aria-live')).toBe('polite')
  } finally {
    vi.useRealTimers()
  }
})
