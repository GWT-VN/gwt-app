// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { Checkbox, ChoiceDescription, ChoiceLabel } from './checkbox'
import { FieldError, FieldLegend, FieldSet } from './field'
import { RadioGroup, RadioGroupItem } from './radio-group'

test('Checkbox: bấm chữ nhãn bọc ngoài đổi trạng thái', async () => {
  render(
    <ChoiceLabel>
      <Checkbox /> Tôi đã kiểm tra số serial
    </ChoiceLabel>,
  )
  const o = screen.getByRole('checkbox', { name: 'Tôi đã kiểm tra số serial' })
  expect(o.getAttribute('aria-checked')).toBe('false')
  await userEvent.click(screen.getByText('Tôi đã kiểm tra số serial'))
  expect(o.getAttribute('aria-checked')).toBe('true')
  await userEvent.click(screen.getByText('Tôi đã kiểm tra số serial'))
  expect(o.getAttribute('aria-checked')).toBe('false')
})

test('Checkbox checked="indeterminate" → aria-checked="mixed"', () => {
  render(<Checkbox checked="indeterminate" aria-label="Chọn tất cả" />)
  expect(screen.getByRole('checkbox', { name: 'Chọn tất cả' }).getAttribute('aria-checked')).toBe('mixed')
})

test('Checkbox tắt: nhãn bấm không đổi, aria-invalid giữ nguyên', async () => {
  render(
    <>
      <ChoiceLabel>
        <Checkbox disabled /> Tắt
      </ChoiceLabel>
      <Checkbox aria-invalid aria-label="Lỗi" />
    </>,
  )
  const tat = screen.getByRole('checkbox', { name: 'Tắt' })
  await userEvent.click(screen.getByText('Tắt'))
  expect(tat.getAttribute('aria-checked')).toBe('false')
  expect(screen.getByRole('checkbox', { name: 'Lỗi' }).getAttribute('aria-invalid')).toBe('true')
})

function Nhom({ loi = false }: { loi?: boolean }) {
  return (
    <RadioGroup asChild defaultValue="ck">
      <FieldSet aria-describedby={loi ? 'ds-tt-e' : undefined}>
        <FieldLegend>Hình thức thanh toán</FieldLegend>
        <ChoiceLabel>
          <RadioGroupItem value="ck" aria-invalid={loi || undefined} />
          <span>
            Chuyển khoản<ChoiceDescription>Đối soát tự động theo sao kê.</ChoiceDescription>
          </span>
        </ChoiceLabel>
        <ChoiceLabel>
          <RadioGroupItem value="the" disabled />
          <span>Thẻ (chưa hỗ trợ)</span>
        </ChoiceLabel>
        <ChoiceLabel>
          <RadioGroupItem value="tm" aria-invalid={loi || undefined} />
          <span>Tiền mặt</span>
        </ChoiceLabel>
        {loi && <FieldError id="ds-tt-e">Chọn một lựa chọn.</FieldError>}
      </FieldSet>
    </RadioGroup>
  )
}

test('RadioGroup: Tab vào nhóm focus mục đang chọn, ↓ đổi lựa chọn và bỏ qua mục tắt', async () => {
  render(
    <>
      <button>trước</button>
      <Nhom />
    </>,
  )
  const ck = screen.getByRole('radio', { name: /Chuyển khoản/ })
  const tm = screen.getByRole('radio', { name: 'Tiền mặt' })
  screen.getByText('trước').focus()
  await userEvent.tab()
  expect(document.activeElement).toBe(ck)
  // Radix chuyển focus trong setTimeout và chỉ chọn khi phím mũi tên CÒN đang giữ (trình duyệt thật: keyup đến sau) →
  // giữ phím, chờ focus chuyển, rồi mới nhả.
  await userEvent.keyboard('{ArrowDown>}')
  await waitFor(() => expect(document.activeElement).toBe(tm))
  await userEvent.keyboard('{/ArrowDown}')
  expect(tm.getAttribute('aria-checked')).toBe('true')
  expect(ck.getAttribute('aria-checked')).toBe('false')
  expect(screen.getByRole('radio', { name: 'Thẻ (chưa hỗ trợ)' }).getAttribute('aria-checked')).toBe('false')
})

test('RadioGroup: bấm chữ nhãn chọn mục; asChild lên FieldSet → một phần tử fieldset role radiogroup', async () => {
  render(<Nhom />)
  const nhom = screen.getByRole('radiogroup')
  expect(nhom.tagName).toBe('FIELDSET')
  await userEvent.click(screen.getByText('Tiền mặt'))
  expect(screen.getByRole('radio', { name: 'Tiền mặt' }).getAttribute('aria-checked')).toBe('true')
})

test('RadioGroup lỗi: aria-invalid trên item giữ nguyên, FieldSet aria-describedby trỏ FieldError', () => {
  render(<Nhom loi />)
  for (const r of screen.getAllByRole('radio').filter((r) => !r.hasAttribute('disabled')))
    expect(r.getAttribute('aria-invalid')).toBe('true')
  const nhom = screen.getByRole('radiogroup')
  const id = nhom.getAttribute('aria-describedby')!
  expect(document.getElementById(id)?.textContent).toBe('Chọn một lựa chọn.')
  expect(nhom).toHaveProperty('tagName', 'FIELDSET')
})

test('RadioGroup orientation="horizontal" (asChild lên FieldSet): fieldset xếp ngang, ↓ vẫn đổi lựa chọn như radio gốc', async () => {
  render(
    <RadioGroup asChild orientation="horizontal" defaultValue="thap">
      <FieldSet>
        <FieldLegend>Mức độ</FieldLegend>
        <ChoiceLabel>
          <RadioGroupItem value="thap" />
          <span>Thấp</span>
        </ChoiceLabel>
        <ChoiceLabel>
          <RadioGroupItem value="thuong" />
          <span>Thường</span>
        </ChoiceLabel>
      </FieldSet>
    </RadioGroup>,
  )
  const nhom = screen.getByRole('radiogroup')
  expect(nhom.getAttribute('data-orientation')).toBe('horizontal')
  screen.getByRole('radio', { name: 'Thấp' }).focus()
  await userEvent.keyboard('{ArrowDown>}')
  const thuong = screen.getByRole('radio', { name: 'Thường' })
  await waitFor(() => expect(document.activeElement).toBe(thuong))
  await userEvent.keyboard('{/ArrowDown}')
  expect(thuong.getAttribute('aria-checked')).toBe('true')
})
