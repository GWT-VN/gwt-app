// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { DsRoot } from './ds-root'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'

function Mau({ trongDs = true }: { trongDs?: boolean }) {
  const the = (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger href="#kh">KH-0412</HoverCardTrigger>
      <HoverCardContent>Công ty TNHH Minh Phát</HoverCardContent>
    </HoverCard>
  )
  return trongDs ? <DsRoot theme="dark">{the}</DsRoot> : the
}

test('Tab tới mã → thẻ hiện TRONG vùng [data-ds="v2"] (ô portal DsRoot), đúng data-slot, z-90; rời focus → đóng', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  const ma = screen.getByText('KH-0412')
  expect(ma.getAttribute('data-slot')).toBe('hover-card-trigger')
  await user.tab()
  expect(document.activeElement).toBe(ma)
  await screen.findByText('Công ty TNHH Minh Phát')
  const the = document.querySelector('[data-slot="hover-card-content"]')
  expect(the?.closest('[data-ds-portal]')).not.toBeNull()
  expect(the?.closest('[data-ds="v2"]')?.getAttribute('data-theme')).toBe('dark')
  expect(the?.className).toContain('z-90')
  expect(the?.getAttribute('data-side')).toBe('bottom')
  await user.tab()
  await waitFor(() => expect(screen.queryByText('Công ty TNHH Minh Phát')).toBeNull())
})

test('ngoài DsRoot (chưa có ô portal) → không render thẻ ra document.body', async () => {
  const user = userEvent.setup()
  render(<Mau trongDs={false} />)
  await user.tab()
  await new Promise((r) => setTimeout(r, 50))
  expect(screen.queryByText('Công ty TNHH Minh Phát')).toBeNull()
})
