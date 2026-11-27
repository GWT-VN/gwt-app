// @vitest-environment jsdom
// Phân tích video + Ý tưởng video theo khuôn Ticket F (BangMkt). Kho hook: HookLibraryView.dom.test.tsx.
import { fireEvent, render, screen, within } from '@testing-library/react'
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

test('Phân tích video: tìm + tab tuyến 5A trong thanh công cụ (không số — khuôn F), bấm tab → URL', async () => {
  const user = userEvent.setup()
  render(<DsRoot><AnalysesView rows={videos} coTab /></DsRoot>)
  const toolbar = screen.getByRole('heading', { name: 'Video đã phân tích' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm video' })).toBeTruthy()
  expect(within(toolbar).getByRole('tablist', { name: 'Tab video' })).toBeTruthy()
  expect(screen.getByRole('tab', { name: 'Tất cả', selected: true })).toBeTruthy()
  // Khuôn F 27/11: không số đếm trên tab — bộ đếm duy nhất ở PhanTrang dưới bảng.
  expect(screen.getByRole('tab', { name: /A2/ }).textContent).toBe('A2')
  expect(screen.getByText(/trên 3 video/)).toBeTruthy()
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
  // Điều kiện lọc hiện ở nhãn cột (không còn hàng chip); bộ đếm theo số dòng đang hiện.
  expect(screen.queryByRole('region', { name: 'Điều kiện đang áp dụng' })).toBeNull()
  expect(within(screen.getByRole('table', { name: 'Video đã phân tích' })).getByRole('columnheader', { name: /Tuyến: A2/ })).toBeTruthy()
  expect(screen.getByText(/trên 2 video/)).toBeTruthy()
})

test('Phân tích video: "Xoá bộ lọc" bỏ điều kiện trường, giữ từ khoá + sắp', async () => {
  url.q = 'q=nuoc&tuyen=A2&cot=chi_so&chieu=desc'
  const user = userEvent.setup()
  render(<DsRoot><AnalysesView rows={videos} /></DsRoot>)
  await user.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }))
  expect(push).toHaveBeenLastCalledWith('/wiki/marketing/du-lieu/phan-tich-video?q=nuoc&cot=chi_so&chieu=desc', { scroll: false })
})

test('Phân tích video: chuột phải dòng → Mở chi tiết / Xem nhanh / Sao chép mã / Sao chép đường dẫn', async () => {
  render(<DsRoot><AnalysesView rows={videos} /></DsRoot>)
  fireEvent.contextMenu(screen.getByRole('button', { name: 'Lọc nước giếng' }).closest('tr')!)
  expect(await screen.findByRole('menuitem', { name: 'Mở chi tiết' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Xem nhanh' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Sao chép mã video' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Sao chép đường dẫn' })).toBeTruthy()
  fireEvent.click(screen.getByRole('menuitem', { name: 'Mở chi tiết' }))
  expect(push).toHaveBeenLastCalledWith('/wiki/marketing/du-lieu/phan-tich-video/1')
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
  // Cột Trạng thái mang chip lọc.
  expect(screen.getByRole('columnheader', { name: /Trạng thái: done/ })).toBeTruthy()
})

test('Ý tưởng video: cột "Nguồn" ↔ trường lọc nen_tang — chip ở nhãn cột Nguồn', () => {
  url.q = 'nen_tang=youtube'
  render(<DsRoot><IdeasView rows={[idea('a', 'Quay test TDS', 'done')]} /></DsRoot>)
  expect(screen.getByRole('columnheader', { name: /Nguồn: YouTube/i })).toBeTruthy()
})
