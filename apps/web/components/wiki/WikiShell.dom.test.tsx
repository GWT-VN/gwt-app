// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import WikiShell from './WikiShell'
import { DsRoot } from '@/components/ui/ds-root'

vi.mock('next/navigation', () => ({
  usePathname: () => '/wiki/marketing',
  useRouter: () => ({ push: vi.fn() }),
}))

test('menu Wiki trên màn hẹp có điều hướng và trả focus khi bấm Escape', async () => {
  const user = userEvent.setup()
  render(<DsRoot><WikiShell counts={{ analyses: null, ideas: null }} searchIndex={[]}>Nội dung</WikiShell></DsRoot>)
  const trigger = screen.getByRole('button', { name: 'Mở menu khu Wiki' })
  await user.click(trigger)
  const dialog = screen.getByRole('dialog', { name: 'Điều hướng Wiki' })
  expect(within(dialog).getByRole('link', { name: /Wiki GWT/ }).getAttribute('href')).toBe('/wiki')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(trigger)
})