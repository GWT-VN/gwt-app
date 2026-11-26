// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { KhachTabs } from './KhachTabs'

it('đổi mục hồ sơ bằng mũi tên và giữ dữ liệu đang nhập khi quay lại', async () => {
  const user = userEvent.setup()
  render(<KhachTabs tabs={[
    { khoa: 'ho-so', nhan: 'Hồ sơ', noiDung: <input aria-label="Nội dung đang nhập" /> },
    { khoa: 'may', nhan: 'Máy', noiDung: <p>Máy đã lắp</p> },
  ]} />)

  await user.type(screen.getByRole('textbox', { name: 'Nội dung đang nhập' }), 'Bản nháp')
  const hoSo = screen.getByRole('tab', { name: 'Hồ sơ' })
  const may = screen.getByRole('tab', { name: 'Máy' })
  hoSo.focus()
  await user.keyboard('{ArrowRight}')
  expect(may.getAttribute('aria-selected')).toBe('true')
  await user.keyboard('{ArrowLeft}')
  expect(hoSo.getAttribute('aria-selected')).toBe('true')
  expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Nội dung đang nhập' }).value).toBe('Bản nháp')
})
