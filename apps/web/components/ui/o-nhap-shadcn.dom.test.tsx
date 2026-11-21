// @vitest-environment jsdom
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { Field, FieldError, FieldLabel } from './field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from './input-otp'
import { Label } from './label'
import { NativeSelect, NativeSelectOption } from './native-select'
import { Separator } from './separator'
import { Slider } from './slider'

// input-otp dò huy hiệu trình quản lý mật khẩu bằng elementFromPoint (jsdom không có) sau một nhịp hẹn giờ.
if (!document.elementFromPoint) document.elementFromPoint = () => null

test('Label: data-slot label, bấm nhãn focus ô (htmlFor)', async () => {
  render(
    <>
      <Label htmlFor="o">Tên khách</Label>
      <input id="o" />
    </>,
  )
  const nhan = screen.getByText('Tên khách')
  expect(nhan.getAttribute('data-slot')).toBe('label')
  await userEvent.click(nhan)
  expect(document.activeElement?.id).toBe('o')
})

test('Separator: mặc định trang trí (role none); decorative=false → separator dọc có aria-orientation', () => {
  const { container } = render(
    <>
      <Separator data-testid="a" />
      <Separator data-testid="b" orientation="vertical" decorative={false} />
    </>,
  )
  const a = screen.getByTestId('a')
  expect(a.getAttribute('role')).toBe('none')
  expect(a.getAttribute('data-orientation')).toBe('horizontal')
  const b = screen.getByRole('separator')
  expect(b.getAttribute('aria-orientation')).toBe('vertical')
  expect(container.querySelectorAll('[data-slot="separator"]').length).toBe(2)
})

test('Field theo shadcn: role group, FieldLabel ghép trên Label, FieldError rỗng không render, errors gộp trùng', () => {
  const { rerender } = render(
    <Field data-testid="f">
      <FieldLabel htmlFor="x" required>
        Số điện thoại
      </FieldLabel>
      <input id="x" />
      <FieldError data-testid="e" />
    </Field>,
  )
  expect(screen.getByTestId('f').getAttribute('role')).toBe('group')
  expect(screen.getByTestId('f').getAttribute('data-orientation')).toBe('vertical')
  expect(screen.getByText('Số điện thoại').getAttribute('data-slot')).toBe('field-label')
  expect(screen.queryByTestId('e')).toBeNull()
  rerender(
    <Field data-testid="f">
      <FieldError data-testid="e" errors={[{ message: 'Thiếu số' }, { message: 'Thiếu số' }]} />
    </Field>,
  )
  expect(screen.getByTestId('e').textContent).toBe('Thiếu số')
  // GWT: không role alert (ô lỗi nhận focus, câu lỗi đọc qua aria-describedby).
  expect(screen.getByTestId('e').getAttribute('role')).toBeNull()
})

test('NativeSelect: select gốc có tên, size đi vào data-size, đổi giá trị bằng chọn', async () => {
  render(
    <>
      <label htmlFor="k">Kênh bán</label>
      <NativeSelect id="k" size="sm" defaultValue="online">
        <NativeSelectOption value="online">Online</NativeSelectOption>
        <NativeSelectOption value="showroom">Showroom</NativeSelectOption>
      </NativeSelect>
    </>,
  )
  const o = screen.getByRole('combobox', { name: 'Kênh bán' }) as HTMLSelectElement
  expect(o.getAttribute('data-size')).toBe('sm')
  await userEvent.selectOptions(o, 'showroom')
  expect(o.value).toBe('showroom')
  expect(o.parentElement?.getAttribute('data-slot')).toBe('native-select-wrapper')
})

function Otp() {
  const [v, setV] = useState('')
  return (
    <>
      <InputOTP maxLength={6} value={v} onChange={setV} aria-label="Mã xác nhận">
        <InputOTPGroup>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <output data-testid="gt">{v}</output>
    </>
  )
}

test('InputOTP: một ô input thật có tên, gõ chữ số điền lần lượt từng ô', async () => {
  const { container } = render(<Otp />)
  const o = screen.getByRole('textbox', { name: 'Mã xác nhận' })
  await userEvent.click(o)
  await userEvent.keyboard('4829')
  expect(screen.getByTestId('gt').textContent).toBe('4829')
  const o2 = container.querySelectorAll('[data-slot="input-otp-slot"]')
  expect(o2.length).toBe(6)
  expect(o2[0].textContent).toBe('4')
  expect(o2[3].textContent).toBe('9')
})

test('Slider: núm có tên theo `nhan`, mũi tên đổi một bước', async () => {
  function Mau() {
    const [v, setV] = useState([2, 8])
    return <Slider value={v} onValueChange={setV} min={0} max={10} nhan={['Giá từ', 'Giá đến']} />
  }
  render(<Mau />)
  const tu = screen.getByRole('slider', { name: 'Giá từ' })
  const den = screen.getByRole('slider', { name: 'Giá đến' })
  expect(tu.getAttribute('aria-valuenow')).toBe('2')
  tu.focus()
  await userEvent.keyboard('{ArrowRight}')
  expect(tu.getAttribute('aria-valuenow')).toBe('3')
  expect(den.getAttribute('aria-valuenow')).toBe('8')
})
