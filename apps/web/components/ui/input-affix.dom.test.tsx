// @vitest-environment jsdom
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { InputGroup, InputGroupAddon, InputGroupInput, OTien } from './input-affix'

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
