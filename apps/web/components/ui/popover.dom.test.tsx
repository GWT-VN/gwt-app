// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { Button } from './button'
import { DsRoot } from './ds-root'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

function Mau() {
  return (
    <DsRoot theme="dark">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Mở lịch</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Lịch demo">
          <button type="button">Hôm nay</button>
        </PopoverContent>
      </Popover>
    </DsRoot>
  )
}

const trigger = () => screen.getByRole('button', { name: 'Mở lịch' })

test('bấm trigger → nội dung nằm TRONG vùng [data-ds="v2"] (ô portal của DsRoot), có data-side, z-90', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  const pop = await screen.findByRole('dialog', { name: 'Lịch demo' })
  expect(pop.closest('[data-ds-portal]')).not.toBeNull()
  expect(pop.closest('[data-ds="v2"]')?.getAttribute('data-theme')).toBe('dark')
  expect(pop.getAttribute('data-side')).toBe('bottom')
  expect(pop.getAttribute('data-align')).toBe('start')
  expect(pop.className).toContain('z-90')
})

test('Esc đóng và trả focus về trigger', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  await screen.findByRole('dialog', { name: 'Lịch demo' })
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(trigger())
})

test('ngoài DsRoot (chưa có ô portal) → không render nội dung ra document.body', async () => {
  const user = userEvent.setup()
  render(
    <Popover>
      <PopoverTrigger>Mở</PopoverTrigger>
      <PopoverContent aria-label="Pop lạc">x</PopoverContent>
    </Popover>,
  )
  await user.click(screen.getByRole('button', { name: 'Mở' }))
  expect(screen.queryByRole('dialog')).toBeNull()
})
