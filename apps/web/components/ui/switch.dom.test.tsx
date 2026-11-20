// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test, vi } from 'vitest'
import { Switch, SwitchRow } from './switch'

function Hang({ disabled, moTa }: { disabled?: boolean; moTa?: string }) {
  const [bat, setBat] = useState(false)
  return (
    <SwitchRow nhan="Gửi email tóm tắt hằng ngày" moTa={moTa}>
      <Switch checked={bat} onCheckedChange={setBat} disabled={disabled} />
    </SwitchRow>
  )
}

test('bấm chữ của SwitchRow đổi trạng thái; aria-checked theo đúng', async () => {
  const u = userEvent.setup()
  render(<Hang moTa="Tắt nếu chỉ lưu nháp." />)
  const sw = screen.getByRole('switch')
  expect(sw.getAttribute('aria-checked')).toBe('false')
  await u.click(screen.getByText('Gửi email tóm tắt hằng ngày'))
  expect(sw.getAttribute('aria-checked')).toBe('true')
  await u.click(screen.getByText('Tắt nếu chỉ lưu nháp.'))
  expect(sw.getAttribute('aria-checked')).toBe('false')
})

test('bấm thẳng công tắc chỉ đổi một lần (label bọc không bấm lặp)', async () => {
  const u = userEvent.setup()
  render(<Hang />)
  const sw = screen.getByRole('switch')
  await u.click(sw)
  expect(sw.getAttribute('aria-checked')).toBe('true')
})

test('Space bật/tắt khi đang focus', async () => {
  const u = userEvent.setup()
  render(<Hang />)
  const sw = screen.getByRole('switch')
  await u.tab()
  expect(document.activeElement).toBe(sw)
  await u.keyboard(' ')
  expect(sw.getAttribute('aria-checked')).toBe('true')
  await u.keyboard(' ')
  expect(sw.getAttribute('aria-checked')).toBe('false')
})

test('tên đọc được = nhãn (không lẫn mô tả); mô tả qua aria-describedby', () => {
  render(<Hang moTa="Tắt nếu chỉ lưu nháp." />)
  const sw = screen.getByRole('switch', {
    name: 'Gửi email tóm tắt hằng ngày',
    description: 'Tắt nếu chỉ lưu nháp.',
  })
  expect(sw).toBeTruthy()
})

test('aria-describedby: của người gọi (câu lỗi) TRƯỚC, mô tả của hàng SAU — cùng thứ tự với Checkbox/Radio', () => {
  render(
    <>
      <SwitchRow nhan="Tự gửi" moTa="Gửi lúc 7:00.">
        <Switch aria-describedby="sw-loi" />
      </SwitchRow>
      <p id="sw-loi">Cần email người nhận.</p>
    </>,
  )
  screen.getByRole('switch', { name: 'Tự gửi', description: 'Cần email người nhận. Gửi lúc 7:00.' })
})

test('không mô tả → không gắn aria-describedby', () => {
  render(<Hang />)
  expect(screen.getByRole('switch').hasAttribute('aria-describedby')).toBe(false)
})

test('disabled: bấm chữ / Space không đổi', async () => {
  const u = userEvent.setup()
  const doi = vi.fn()
  render(
    <SwitchRow nhan="Đồng bộ kho (quản trị khoá)">
      <Switch defaultChecked disabled onCheckedChange={doi} />
    </SwitchRow>,
  )
  const sw = screen.getByRole('switch')
  await u.click(screen.getByText('Đồng bộ kho (quản trị khoá)'))
  await u.click(sw)
  sw.focus()
  await u.keyboard(' ')
  expect(doi).not.toHaveBeenCalled()
  expect(sw.getAttribute('aria-checked')).toBe('true')
})

test('Switch đứng riêng (không SwitchRow) vẫn là role switch, nhận aria-label', () => {
  render(<Switch aria-label="Bật thông báo" />)
  expect(screen.getByRole('switch', { name: 'Bật thông báo' }).getAttribute('aria-checked')).toBe('false')
})
