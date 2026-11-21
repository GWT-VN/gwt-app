// @vitest-environment jsdom
import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupTextarea, OTien } from './input-group'

function Mau({ dau = null, onDoi }: { dau?: number | null; onDoi?: (v: number | null) => void }) {
  const [v, setV] = useState<number | null>(dau)
  return (
    <OTien
      aria-label="Đơn giá"
      value={v}
      onValueChange={(n) => {
        setV(n)
        onDoi?.(n)
      }}
    />
  )
}

const o = () => screen.getByRole('textbox', { name: 'Đơn giá' }) as HTMLInputElement

test('gõ 1250000 → ô hiện 1.250.000, giá trị cuối là số 1250000', async () => {
  const doi = vi.fn()
  render(<Mau onDoi={doi} />)
  await userEvent.type(o(), '1250000')
  expect(o().value).toBe('1.250.000')
  expect(doi).toHaveBeenLastCalledWith(1250000)
})

test('gõ chữ cái bị bỏ, giá trị không đổi', async () => {
  const doi = vi.fn()
  render(<Mau dau={125000} onDoi={doi} />)
  await userEvent.type(o(), 'a')
  expect(o().value).toBe('125.000')
  expect(doi).not.toHaveBeenCalled()
})

test('xoá hết → null (không phải 0), ô trống', async () => {
  const doi = vi.fn()
  render(<Mau dau={125000} onDoi={doi} />)
  await userEvent.clear(o())
  expect(o().value).toBe('')
  expect(doi).toHaveBeenLastCalledWith(null)
})

test('dán "1.250.000 ₫" → 1250000', async () => {
  const doi = vi.fn()
  render(<Mau onDoi={doi} />)
  await userEvent.click(o())
  await userEvent.paste('1.250.000 ₫')
  expect(o().value).toBe('1.250.000')
  expect(doi).toHaveBeenLastCalledWith(1250000)
})

test('chèn số giữa: con trỏ sau chữ số thứ 2 của 125.000, gõ 9 → 1.295.000, con trỏ ngay sau 9', async () => {
  render(<Mau dau={125000} />)
  await userEvent.type(o(), '9', { initialSelectionStart: 2, initialSelectionEnd: 2 })
  expect(o().value).toBe('1.295.000')
  expect(o().selectionStart).toBe(4)
  expect(o().selectionEnd).toBe(4)
})

test('Backspace ngay sau dấu chấm xoá chữ số đứng trước dấu, không kẹt ở dấu', async () => {
  render(<Mau dau={1250000} />)
  // con trỏ sau dấu chấm đầu: "1.|250.000"
  await userEvent.type(o(), '{Backspace}', { initialSelectionStart: 2, initialSelectionEnd: 2 })
  expect(o().value).toBe('250.000')
  expect(o().selectionStart).toBe(0)
})

test.each([
  ['1.250.000,00', 1250000, '1.250.000'],
  ['1,250,000.00', 1250000, '1.250.000'],
  ['12,5', 13, '13'],
  ['-500.000', 500000, '500.000'],
])('dán "%s" vào ô trống → %d (phần lẻ làm tròn, dấu âm bỏ)', async (dan, so, hien) => {
  const doi = vi.fn()
  render(<Mau onDoi={doi} />)
  await userEvent.click(o())
  await userEvent.paste(dan)
  expect(o().value).toBe(hien)
  expect(doi).toHaveBeenLastCalledWith(so)
})

test('vượt MAX_SAFE_INTEGER → bỏ (dán lẫn gõ), giá trị giữ nguyên', async () => {
  const doi = vi.fn()
  render(<Mau dau={900719925474099} onDoi={doi} />)
  await userEvent.click(o())
  await userEvent.paste('99999999999999999')
  await userEvent.type(o(), '9')
  expect(o().value).toBe('900.719.925.474.099')
  expect(doi).not.toHaveBeenCalled()
})

test('gõ chữ cái giữa số: con trỏ giữ nguyên chỗ', async () => {
  render(<Mau dau={125000} />)
  await userEvent.type(o(), 'a', { initialSelectionStart: 2, initialSelectionEnd: 2 })
  expect(o().value).toBe('125.000')
  expect(o().selectionStart).toBe(2)
})

test('Delete ngay trước dấu chấm xoá chữ số đứng sau dấu', async () => {
  render(<Mau dau={1250000} />)
  // "1|.250.000"
  await userEvent.type(o(), '{Delete}', { initialSelectionStart: 1, initialSelectionEnd: 1 })
  expect(o().value).toBe('150.000')
  expect(o().selectionStart).toBe(1)
})

test('xoá ngay sau dấu chấm khi phím không nhận ra (Android Gboard: key Unidentified) vẫn ăn vào chữ số', async () => {
  render(<Mau dau={1250000} />)
  // Mô phỏng Android: keydown không mang key Backspace → trình duyệt xoá luôn dấu chấm ở "1.|250.000", chỉ báo
  // input deleteContentBackward.
  const el = o()
  el.focus()
  // Ghi qua setter gốc (bỏ qua bộ theo dõi giá trị của React) như trình duyệt thật đổi ô.
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, '1250.000')
  el.setSelectionRange(1, 1)
  fireEvent.input(el, { inputType: 'deleteContentBackward' })
  expect(o().value).toBe('250.000')
  expect(o().selectionStart).toBe(0)
})

test('value không nguyên (1250.5 từ cột numeric) → hiển thị làm tròn 1.251', () => {
  render(<OTien aria-label="Đơn giá" value={1250.5} onValueChange={() => {}} />)
  expect(o().value).toBe('1.251')
})

test('OTien: inputMode numeric, căn phải, đơn vị ₫ aria-hidden; donVi đổi được', () => {
  const { rerender } = render(<OTien aria-label="Đơn giá" value={null} onValueChange={() => {}} />)
  expect(o().getAttribute('inputmode')).toBe('numeric')
  expect(o().getAttribute('data-align')).toBe('end')
  expect(o().type).toBe('text')
  const dv = o().parentElement!.querySelector('[data-slot="input-group-addon"]')!
  expect(dv.textContent).toBe('₫')
  expect(dv.getAttribute('aria-hidden')).toBe('true')
  rerender(<OTien aria-label="Đơn giá" value={null} onValueChange={() => {}} donVi="đ/kg" />)
  expect(o().parentElement!.textContent).toBe('đ/kg')
})

test('InputGroup: addon inline-start đứng trước số (order), input nhận id/aria-invalid/disabled', () => {
  render(
    <InputGroup data-testid="khung">
      <InputGroupInput id="ck" aria-label="Chiết khấu" inputMode="decimal" data-align="end" aria-invalid disabled />
      <InputGroupAddon align="inline-start">%</InputGroupAddon>
    </InputGroup>,
  )
  const i = screen.getByRole('textbox', { name: 'Chiết khấu' })
  expect(i.id).toBe('ck')
  expect(i.getAttribute('aria-invalid')).toBe('true')
  expect((i as HTMLInputElement).disabled).toBe(true)
  const dv = screen.getByTestId('khung').querySelector('[data-slot="input-group-addon"]')!
  expect(dv.getAttribute('data-align')).toBe('inline-start')
  expect(dv.className).toContain('order-first')
})

test('InputGroup theo shadcn: khung + addon role group; addon mặc định inline-start; bấm addon (không phải nút) focus ô', async () => {
  const xoa = vi.fn()
  render(
    <InputGroup data-testid="khung">
      <InputGroupAddon data-testid="dau">#</InputGroupAddon>
      <InputGroupInput aria-label="Mã" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label="Xoá" onClick={xoa}>
          x
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>,
  )
  const khung = screen.getByTestId('khung')
  expect(khung.getAttribute('role')).toBe('group')
  const dau = screen.getByTestId('dau')
  expect(dau.getAttribute('data-align')).toBe('inline-start')
  await userEvent.click(dau)
  expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Mã' }))
  const nut = screen.getByRole('button', { name: 'Xoá' })
  expect(nut.getAttribute('type')).toBe('button')
  expect(nut.getAttribute('data-size')).toBe('icon-xs')
  await userEvent.click(nut)
  expect(xoa).toHaveBeenCalledTimes(1)
  // Bấm nút không kéo focus về ô (addon bỏ qua click trong button).
  expect(document.activeElement).toBe(nut)
})

test('InputGroupTextarea: cùng slot input-group-control, khung cao tự do', () => {
  render(
    <InputGroup data-testid="khung">
      <InputGroupTextarea aria-label="Ghi chú" />
    </InputGroup>,
  )
  const o = screen.getByRole('textbox', { name: 'Ghi chú' })
  expect(o.tagName).toBe('TEXTAREA')
  expect(o.getAttribute('data-slot')).toBe('input-group-control')
  expect(screen.getByTestId('khung').className).toContain('has-[>textarea]:h-auto')
})