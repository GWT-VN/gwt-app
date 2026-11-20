// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test, vi } from 'vitest'
import { Button } from './button'

/** Form lưu: bấm Lưu → loading (không tự hết, để kiểm trong lúc đang lưu). */
function FormLuu({ onGui }: { onGui(): void }) {
  const [dang, setDang] = useState(false)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onGui()
        setDang(true)
      }}
    >
      <input aria-label="Tên" />
      <Button type="submit" loading={dang}>
        Lưu
      </Button>
    </form>
  )
}

test('loading: aria-disabled + aria-busy, KHÔNG disabled (focus được)', () => {
  render(<Button loading>Lưu</Button>)
  const b = screen.getByRole('button')
  expect((b as HTMLButtonElement).disabled).toBe(false)
  expect(b.getAttribute('aria-disabled')).toBe('true')
  expect(b.getAttribute('aria-busy')).toBe('true')
})

test('bấm Lưu bằng phím → focus vẫn ở nút suốt lúc loading', async () => {
  const u = userEvent.setup()
  render(<FormLuu onGui={() => {}} />)
  const b = screen.getByRole('button', { name: 'Lưu' })
  b.focus()
  await u.keyboard('{Enter}')
  expect(b.getAttribute('aria-busy')).toBe('true')
  expect(document.activeElement).toBe(b)
})

test('bấm lần 2 trong lúc loading không gọi onClick', async () => {
  const u = userEvent.setup()
  const onClick = vi.fn()
  render(
    <Button loading onClick={onClick}>
      Lưu
    </Button>,
  )
  await u.click(screen.getByRole('button'))
  await u.keyboard('{Enter}')
  expect(onClick).not.toHaveBeenCalled()
})

test('submit form trong lúc loading không gửi lại (bấm nút, Enter trong ô)', async () => {
  const u = userEvent.setup()
  const onGui = vi.fn()
  render(<FormLuu onGui={onGui} />)
  const b = screen.getByRole('button', { name: 'Lưu' })
  await u.click(b)
  expect(onGui).toHaveBeenCalledTimes(1)
  await u.click(b)
  await u.type(screen.getByLabelText('Tên'), 'x{Enter}')
  expect(onGui).toHaveBeenCalledTimes(1)
})
