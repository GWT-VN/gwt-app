// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MagnifyingGlass } from '@phosphor-icons/react/ssr'
import { expect, test } from 'vitest'
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldMeta, FieldSet } from './field'
import { Input } from './input'
import { Textarea } from './textarea'

const dom = (html: string) => {
  const d = document.createElement('div')
  d.innerHTML = html
  return d
}

test('FieldLabel required → dấu * đỏ aria-hidden sau chữ', () => {
  const d = dom(renderToStaticMarkup(<FieldLabel htmlFor="x" required>Tên khách hàng</FieldLabel>))
  const nhan = d.querySelector('label')!
  expect(nhan.getAttribute('for')).toBe('x')
  const sao = nhan.querySelector('[aria-hidden="true"]')!
  expect(sao.textContent).toBe('*')
  expect(sao.className).toContain('--color-text-danger')
  expect(nhan.textContent).toBe('Tên khách hàng *')
})

test('FieldLabel không required → không có *', () => {
  // Đọc chữ của nhãn (class của FieldLabel theo shadcn có ký tự * trong biến thể con trực tiếp).
  const nhan = dom(renderToStaticMarkup(<FieldLabel htmlFor="x">Mã đơn</FieldLabel>)).querySelector('label')!
  expect(nhan.textContent).toBe('Mã đơn')
  expect(nhan.querySelector('[aria-hidden="true"]')).toBeNull()
})

test('Input aria-invalid giữ thuộc tính; không icon thì không bọc', () => {
  const d = dom(renderToStaticMarkup(<Input id="sdt" aria-invalid defaultValue="09x" />))
  const o = d.firstElementChild!
  expect(o.tagName).toBe('INPUT')
  expect(o.getAttribute('aria-invalid')).toBe('true')
  expect(o.id).toBe('sdt')
})

test('Input icon → icon aria-hidden trong khung bọc, input vẫn nhận id', () => {
  const d = dom(renderToStaticMarkup(<Input id="tim" type="search" icon={<MagnifyingGlass />} />))
  const khung = d.firstElementChild!
  expect(khung.tagName).toBe('DIV')
  const icon = khung.querySelector('svg')!
  expect(icon.closest('[aria-hidden="true"]')).not.toBeNull()
  expect(khung.querySelector('input')!.id).toBe('tim')
  expect(d.querySelector('#tim')!.tagName).toBe('INPUT')
})

test('FieldMeta dem/toiDa → "12/500", gợi ý bên trái', () => {
  const d = dom(
    renderToStaticMarkup(
      <FieldMeta dem={12} toiDa={500}>
        <FieldDescription id="gc-h">Không ghi mật khẩu.</FieldDescription>
      </FieldMeta>,
    ),
  )
  const meta = d.firstElementChild!
  expect(meta.firstElementChild!.id).toBe('gc-h')
  expect(meta.lastElementChild!.textContent).toBe('12/500')
  expect(meta.lastElementChild!.className).toContain('tabular-nums')
})

test('Textarea có cao tối thiểu 80 (min-h-20)', () => {
  const d = dom(renderToStaticMarkup(<Textarea id="gc" />))
  expect(d.querySelector('textarea')!.className).toContain('min-h-20')
})

test('FieldError là chữ thường (không role) — gắn vào ô qua aria-describedby', () => {
  const d = dom(renderToStaticMarkup(<FieldError id="e">Số điện thoại phải có 10 chữ số.</FieldError>))
  expect(d.firstElementChild!.getAttribute('role')).toBeNull()
  expect(d.firstElementChild!.id).toBe('e')
})

test('FieldSet orientation ngang → data-orientation; legend có * khi required', () => {
  const d = dom(
    renderToStaticMarkup(
      <FieldSet orientation="horizontal">
        <FieldLegend required>Mức độ</FieldLegend>
      </FieldSet>,
    ),
  )
  const fs = d.querySelector('fieldset')!
  expect(fs.getAttribute('data-orientation')).toBe('horizontal')
  expect(fs.querySelector('legend [aria-hidden="true"]')!.textContent).toBe('*')
})

test('jsdom: bấm nhãn focus đúng ô (cả ô có icon); tên đọc được bỏ dấu *, gợi ý nối qua aria-describedby', async () => {
  const user = userEvent.setup()
  render(
    <>
      <Field>
        <FieldLabel htmlFor="ten" required>
          Tên khách hàng
        </FieldLabel>
        <Input id="ten" aria-describedby="ten-h" />
        <FieldDescription id="ten-h">Dữ liệu minh hoạ (demo).</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="tim">Tìm kiếm</FieldLabel>
        <Input id="tim" type="search" icon={<MagnifyingGlass />} />
      </Field>
    </>,
  )
  const ten = screen.getByRole('textbox', { name: 'Tên khách hàng' })
  expect(ten).toHaveProperty('id', 'ten')
  expect(screen.getByRole('textbox', { name: 'Tên khách hàng', description: 'Dữ liệu minh hoạ (demo).' })).toBe(ten)
  await user.click(screen.getByText('Tìm kiếm'))
  expect(document.activeElement).toBe(screen.getByRole('searchbox', { name: 'Tìm kiếm' }))
  await user.click(screen.getByText('Tên khách hàng'))
  expect(document.activeElement).toBe(ten)
})
