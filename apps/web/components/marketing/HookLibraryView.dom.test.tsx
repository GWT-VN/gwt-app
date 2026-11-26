// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import HookLibraryView from './HookLibraryView'
import { DsRoot } from '@/components/ui/ds-root'
import type { HookItem } from '@/lib/marketing/supabase-mkt'

const common = {
  created_at: null, hook_style: null, source_url: null, source_channel: null,
  reuse_note: null, gwt_adapted: null, tags: null, added_by: null,
}
const rows: HookItem[] = [
  { ...common, id: 'h1', text: 'Bạn dùng máy nào?', kind: 'question' },
  { ...common, id: 'h2', text: 'Xem thêm tại GWT.', kind: 'cta' },
]

test('lọc câu hỏi và mở chi tiết bằng bàn phím', async () => {
  const user = userEvent.setup()
  render(<DsRoot><HookLibraryView rows={rows} /></DsRoot>)
  await user.click(screen.getByRole('button', { name: 'Câu hỏi 1' }))
  expect(screen.queryByText('Xem thêm tại GWT.')).toBeNull()
  const row = screen.getByRole('row', { name: /Bạn dùng máy nào/ })
  row.focus()
  await user.keyboard('{Enter}')
  const dialog = screen.getByRole('dialog', { name: 'Chi tiết câu mẫu' })
  expect(within(dialog).getByText('Bạn dùng máy nào?')).toBeTruthy()
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(row)
})