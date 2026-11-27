// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import HookLibraryView from './HookLibraryView'
import { DsRoot } from '@/components/ui/ds-root'
import type { HookItem } from '@/lib/marketing/supabase-mkt'

const { push, replace, url } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), url: { q: '' } }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/wiki/marketing/du-lieu/kho-hook',
  useSearchParams: () => new URLSearchParams(url.q),
}))
vi.mock('@/app/actions', () => ({
  luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn(),
}))
beforeEach(() => { url.q = '' })

const common = {
  created_at: null, hook_style: null, source_url: null, source_channel: null,
  reuse_note: null, gwt_adapted: null, tags: null, added_by: null,
}
const rows: HookItem[] = [
  { ...common, id: 'h1', text: 'Bạn dùng máy nào?', kind: 'question' },
  { ...common, id: 'h2', text: 'Xem thêm tại GWT.', kind: 'cta' },
]

test('khuôn F: ô tìm + hàng tab trong thanh công cụ; tab loại = bộ lọc chọn sẵn có số đếm', async () => {
  const user = userEvent.setup()
  render(<DsRoot><HookLibraryView rows={rows} coTab /></DsRoot>)
  const toolbar = screen.getByRole('heading', { name: 'Câu mẫu' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm câu' })).toBeTruthy()
  expect(within(toolbar).getByRole('tablist', { name: 'Tab câu' })).toBeTruthy()
  expect(screen.getByRole('tab', { name: /Câu hỏi/ }).textContent).toContain('1')
  await user.click(screen.getByRole('tab', { name: /Kêu gọi/ }))
  expect(replace).toHaveBeenLastCalledWith('/wiki/marketing/du-lieu/kho-hook?loai=cta&view=cta', { scroll: false })
})

test('người ngoài khu CSKH (action tab gác requireStaff) không thấy hàng tab, vẫn có ô tìm', () => {
  render(<DsRoot><HookLibraryView rows={rows} /></DsRoot>)
  expect(screen.queryByRole('tablist')).toBeNull()
  expect(screen.getByRole('textbox', { name: 'Tìm câu' })).toBeTruthy()
})

test('lọc câu hỏi (URL) và mở chi tiết bằng bàn phím', async () => {
  url.q = 'loai=question'
  const user = userEvent.setup()
  render(<DsRoot><HookLibraryView rows={rows} /></DsRoot>)
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

test('tìm không dấu theo URL `q`', () => {
  url.q = 'q=may nao'
  render(<DsRoot><HookLibraryView rows={rows} /></DsRoot>)
  expect(screen.getByRole('button', { name: 'Bạn dùng máy nào?' })).toBeTruthy()
  expect(screen.queryByText('Xem thêm tại GWT.')).toBeNull()
})

test('kho trống hẳn thì báo chưa có dữ liệu, không báo "không khớp bộ lọc"', () => {
  render(<DsRoot><HookLibraryView rows={[]} /></DsRoot>)
  expect(screen.getByRole('heading', { name: 'Chưa có câu mẫu nào' })).toBeTruthy()
  expect(screen.queryByText(/khớp bộ lọc/)).toBeNull()
})
