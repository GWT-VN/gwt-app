// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import WikiShell from './WikiShell'
import { DsRoot } from '@/components/ui/ds-root'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

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

// jsdom KHÔNG nạp wiki.css → test trên chỉ chứng minh nút + Sheet chạy, không chứng minh nút HIỆN trên màn hẹp
// (lỗi 26/11: `.wiki-menu-trigger{display:none}` ở mọi khổ, điện thoại mất lối vào mục con). Chốt luật CSS bằng chữ:
// trong khối ≤860 (đo theo bề rộng vùng wiki) sidebar ẩn VÀ nút menu hiện; ngoài khối đó nút ẩn.
test('wiki.css: ≤860 ẩn sidebar thì phải hiện nút menu', () => {
  const css = readFileSync(join(process.cwd(), 'app/wiki/wiki.css'), 'utf8').replace(/\s+/g, '')
  const khoi = css.match(/@container\(max-width:860px\)\{((?:[^{}]*\{[^{}]*\})*)\}/)?.[1] ?? ''
  expect(khoi).toContain('[data-khu="wiki"].sidebar{display:none}')
  expect(khoi).toMatch(/\[data-khu="wiki"\]\.wiki-menu-trigger\{display:inline-flex\}/)
  expect(css.replace(khoi, '')).not.toMatch(/\.wiki-menu-trigger\{display:(?!none)/)
  expect(css).toContain('[data-khu="wiki"].mkt-root{container-type:inline-size}')
})
