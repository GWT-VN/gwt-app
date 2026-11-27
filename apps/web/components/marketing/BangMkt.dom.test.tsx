// @vitest-environment jsdom
// Phân tích video + Ý tưởng video theo khuôn Ticket F (BangMkt). Kho hook: HookLibraryView.dom.test.tsx.
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import AnalysesView from './AnalysesView'
import IdeasView from './IdeasView'
import { DsRoot } from '@/components/ui/ds-root'
import type { AnalysisRow, IdeaRow } from '@/lib/marketing/supabase-mkt'

const { push, replace, url } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), url: { q: '' } }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/wiki/marketing/du-lieu/phan-tich-video',
  useSearchParams: () => new URLSearchParams(url.q),
}))
vi.mock('@/app/actions', () => ({
  luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn(),
}))
beforeEach(() => { url.q = '' })

const extract = { ctas: [], counts: { v: 0, t: 0 }, duration: 0 }
const video = (id: number, video_title: string, content_category: string, views: number) =>
  ({ id, video_title, channel_name: 'Kênh mẫu', platform: 'tiktok', content_category, hook_type: null, is_viral: false,
     metrics: { views }, extract }) as unknown as AnalysisRow

const videos = [video(1, 'Lọc nước giếng', 'A1', 50), video(2, 'Máy RO gia đình', 'A2', 900), video(3, 'Nước cứng', 'A2', 10)]

test('Phân tích video: tìm + tab tuyến 5A trong thanh công cụ, số đếm theo tuyến, bấm tab → URL', async () => {
  const user = userEvent.setup()
  render(<DsRoot><AnalysesView rows={videos} coTab /></DsRoot>)
  const toolbar = screen.getByRole('heading', { name: 'Video đã phân tích' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm video' })).toBeTruthy()
  expect(within(toolbar).getByRole('tablist', { name: 'Tab video' })).toBeTruthy()
  expect(screen.getByRole('tab', { name: /A2/ }).textContent).toContain('2')
  await user.click(screen.getByRole('tab', { name: /A2/ }))
  expect(replace).toHaveBeenLastCalledWith('/wiki/marketing/du-lieu/phan-tich-video?tuyen=A2&view=a2', { scroll: false })
  const table = screen.getByRole('table', { name: 'Video đã phân tích' })
  expect(table.getAttribute('data-layout')).toBe('fixed')
  expect(within(table).getByRole('columnheader', { name: /Video/ }).hasAttribute('data-ghim')).toBe(true)
})

test('Phân tích video: lọc tuyến + sắp chỉ số giảm dần theo URL (trong bộ nhớ)', () => {
  url.q = 'tuyen=A2&cot=chi_so&chieu=desc'
  render(<DsRoot><AnalysesView rows={videos} /></DsRoot>)
  const ten = within(screen.getByRole('table', { name: 'Video đã phân tích' })).getAllByRole('button', { name: /RO|cứng|giếng/ })
  expect(ten.map((b) => b.textContent)).toEqual(['Máy RO gia đình', 'Nước cứng'])
})

const idea = (id: string, gwt_idea: string, status: string | null) =>
  ({ id, idea_no: 1, gwt_idea, original_summary: null, source_platform: 'youtube', gwt_product_fit: null, hasTranscript: false,
     status, view_count: 100, extract }) as unknown as IdeaRow

test('Ý tưởng video: tab "Tất cả" + ô tìm; trạng thái cũ (nút lọc) thành Lọc ▸ Trạng thái qua URL', () => {
  url.q = 'trang_thai=done'
  render(<DsRoot><IdeasView rows={[idea('a', 'Quay test TDS', 'done'), idea('b', 'So sánh lõi lọc', null)]} coTab /></DsRoot>)
  const toolbar = screen.getByRole('heading', { name: 'Ý tưởng video' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm ý tưởng' })).toBeTruthy()
  expect(within(toolbar).getByRole('tab', { name: /Tất cả/ })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Quay test TDS' })).toBeTruthy()
  expect(screen.queryByText('So sánh lõi lọc')).toBeNull()
})
