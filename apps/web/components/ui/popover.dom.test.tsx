// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { Button } from './button'
import { DsRoot } from './ds-root'
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from './popover'

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

test('khung shadcn: PopoverHeader/Title/Description đúng data-slot; mặt mặc định w-72 p-4, className người gọi đè phần trùng', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <Popover>
        <PopoverTrigger>Mở</PopoverTrigger>
        <PopoverContent aria-labelledby="tieu-de" className="w-auto">
          <PopoverHeader>
            <PopoverTitle id="tieu-de">Kích thước</PopoverTitle>
            <PopoverDescription>Đặt kích thước cho lớp.</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </DsRoot>,
  )
  await user.click(screen.getByRole('button', { name: 'Mở' }))
  const pop = await screen.findByRole('dialog', { name: 'Kích thước' })
  expect(pop.getAttribute('data-slot')).toBe('popover-content')
  expect(pop.className.split(' ')).toContain('w-auto')
  expect(pop.className.split(' ')).not.toContain('w-72')
  expect(pop.className.split(' ')).toContain('p-4')
  expect(pop.querySelector('[data-slot="popover-header"]')).not.toBeNull()
  expect(pop.querySelector('[data-slot="popover-title"]')?.textContent).toBe('Kích thước')
  expect(pop.querySelector('[data-slot="popover-description"]')?.tagName).toBe('P')
})
