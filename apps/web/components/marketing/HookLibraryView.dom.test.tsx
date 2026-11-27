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
  // Mở bằng nút tên trong ô (Enter/Space tự nhiên của <button>), không phải dòng tabIndex.
  const nut = screen.getByRole('button', { name: 'Bạn dùng máy nào?' })
  nut.focus()
  await user.keyboard('{Enter}')
  // Tên hộp thoại = tiêu đề thật của câu, không phải nhãn chung.
  const dialog = screen.getByRole('dialog', { name: 'Bạn dùng máy nào?' })
  expect(within(dialog).getByRole('heading', { name: 'Bạn dùng máy nào?' })).toBeTruthy()
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(nut)
})

test('kho trống hẳn thì báo chưa có dữ liệu, không báo "không khớp bộ lọc"', () => {
  render(<DsRoot><HookLibraryView rows={[]} /></DsRoot>)
  expect(screen.getByRole('heading', { name: 'Chưa có câu mẫu nào' })).toBeTruthy()
  expect(screen.queryByText(/khớp bộ lọc/)).toBeNull()
})
