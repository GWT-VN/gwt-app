// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import type { MucChon } from '@/bang'
import { Combobox } from './combobox'
import { DatePicker } from './date-picker'
import { DateRangePicker } from './date-range-picker'
import { DsRoot } from './ds-root'
import { FieldLabel } from './field'
import type { TriggerChonProps } from './use-trigger-chon'

const TINH: MucChon[] = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'].map((nhan, i) => ({ gt: String(i + 1).padStart(2, '0'), nhan }))

/**
 * Ba trigger mở pop (Combobox, DatePicker, DateRangePicker) chung một hợp đồng a11y/form: tên đọc = nhãn + giá trị đang
 * chọn (nút thường — khác Select là role combobox, đọc giá trị riêng), `required`/`aria-invalid`/`name`/`onBlur` như ô nhập.
 */
const CA: { ten: string; hien: string; form: string; ve(co: boolean, p: TriggerChonProps): ReactNode }[] = [
  {
    ten: 'Combobox',
    hien: 'Hà Nội',
    form: '01',
    ve: (co, p) => <Combobox options={TINH} value={co ? '01' : null} onValueChange={() => {}} {...p} />,
  },
  {
    ten: 'DatePicker',
    hien: '21/11/24', // năm đã qua → dd/MM/yy (không phụ thuộc năm chạy test)
    form: '2024-11-21',
    ve: (co, p) => <DatePicker value={co ? '2024-11-21' : null} onValueChange={() => {}} {...p} />,
  },
  {
    ten: 'DateRangePicker',
    hien: '01/11/24 – 18/11/24',
    form: '2024-11-01/2024-11-18',
    ve: (co, p) => (
      <DateRangePicker value={co ? { tu: '2024-11-01', den: '2024-11-18' } : null} onValueChange={() => {}} {...p} />
    ),
  },
]

describe.each(CA)('$ten', ({ hien, form, ve }) => {
  test('FieldLabel htmlFor: tên đọc = nhãn + giá trị đang chọn; chưa chọn → chỉ nhãn', () => {
    const { unmount } = render(
      <DsRoot>
        <FieldLabel htmlFor="o">Nơi giao</FieldLabel>
        {ve(true, { id: 'o' })}
      </DsRoot>,
    )
    screen.getByRole('button', { name: `Nơi giao ${hien}` })
    unmount()
    render(
      <DsRoot>
        <FieldLabel htmlFor="o">Nơi giao</FieldLabel>
        {ve(false, { id: 'o' })}
      </DsRoot>,
    )
    screen.getByRole('button', { name: 'Nơi giao' })
  })

  test('aria-labelledby / aria-label của người gọi + giá trị', () => {
    render(
      <DsRoot>
        <span id="nhan-ngoai">Hạn chót</span>
        {ve(true, { 'aria-labelledby': 'nhan-ngoai' })}
        {ve(true, { 'aria-label': 'Kho nhận' })}
      </DsRoot>,
    )
    screen.getByRole('button', { name: `Hạn chót ${hien}` })
    screen.getByRole('button', { name: `Kho nhận ${hien}` })
  })

  test('required → aria-required; aria-invalid nhận boolean lẫn chuỗi ("false" = không lỗi)', () => {
    render(
      <DsRoot>
        {ve(false, { 'aria-label': 'A', required: true, 'aria-invalid': 'false' })}
        {ve(false, { 'aria-label': 'B', 'aria-invalid': 'true' })}
        {ve(false, { 'aria-label': 'C', 'aria-invalid': true })}
      </DsRoot>,
    )
    const a = screen.getByRole('button', { name: 'A' })
    expect(a.getAttribute('aria-required')).toBe('true')
    expect(a.hasAttribute('aria-invalid')).toBe(false)
    expect(screen.getByRole('button', { name: 'B' }).getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('button', { name: 'C' }).getAttribute('aria-invalid')).toBe('true')
  })

  test('name → input ẩn mang giá trị, form submit thật nhận được', () => {
    const { container } = render(
      <DsRoot>
        <form>
          {ve(true, { 'aria-label': 'Có', name: 'co' })}
          {ve(false, { 'aria-label': 'Trống', name: 'trong' })}
        </form>
      </DsRoot>,
    )
    const du = new FormData(container.querySelector('form')!)
    expect(du.get('co')).toBe(form)
    expect(du.get('trong')).toBe('')
  })

  test('onBlur: gọi khi focus rời trigger lúc pop đóng; mở pop (focus vào pop) và Esc quay về thì chưa gọi', async () => {
    const user = userEvent.setup()
    const onBlur = vi.fn()
    render(
      <DsRoot>
        {ve(true, { 'aria-label': 'Ô', onBlur })}
        <button type="button">Sau</button>
      </DsRoot>,
    )
    const nut = screen.getByRole('button', { name: `Ô ${hien}` })
    await user.click(nut)
    await waitFor(() => expect(document.activeElement).not.toBe(nut))
    await user.keyboard('{Escape}')
    await waitFor(() => expect(document.activeElement).toBe(nut))
    expect(onBlur).not.toHaveBeenCalled()
    await user.tab()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
