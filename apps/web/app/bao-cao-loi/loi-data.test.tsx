import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, expect, it, vi } from 'vitest'
import BaoCaoLoiPage from './page'
import DanhMucLoiPage from '@/app/danh-muc-loi/page'

const { duLieuTanSuat, soMayDangChay } = vi.hoisted(() => ({
  duLieuTanSuat: vi.fn(async () => ({ ca: [], ban: [], nhap: [] })),
  soMayDangChay: vi.fn(async () => ({})),
}))

vi.mock('@/app/ticket/loi-actions', () => ({
  danhMucLoi: async () => { throw new Error('catalog unavailable') },
  duLieuTanSuat,
  soMayDangChay,
}))
vi.mock('@/lib/nen-tang/kiem-quyen', () => ({
  hoiQuyen: async () => ({ sua: true }),
}))
vi.mock('@/app/actions', () => ({ nhomLoiChon: async () => [], listTabView: async () => [] }))

afterEach(() => vi.restoreAllMocks())

it('giữ khung Danh mục lỗi và cho tải lại nếu nguồn danh mục lỗi bị gián đoạn', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const page = await DanhMucLoiPage({ searchParams: Promise.resolve({ q: 'vòi', tt: 'da_duyet' }) })
  const html = renderToStaticMarkup(page)
  expect(html).toContain('<h1')
  expect(html).toContain('Danh mục lỗi')
  expect(html).toContain('Chưa tải được danh mục lỗi')
  expect(html).toContain('Tải lại')
  expect(html).toContain('q=v%C3%B2i')
  expect(html).not.toContain('0 mã lỗi')
})

it('giữ khung Báo cáo lỗi và lựa chọn tab khi dữ liệu báo cáo chưa tải được', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  duLieuTanSuat.mockRejectedValueOnce(new Error('report unavailable'))
  const page = await BaoCaoLoiPage({ searchParams: Promise.resolve({ tab: 'thang', tu: '2026-01' }) })
  const html = renderToStaticMarkup(page)
  expect(html).toContain('<h1')
  expect(html).toContain('Báo cáo lỗi')
  expect(html).toContain('Chưa tải được báo cáo lỗi')
  expect(html).toContain('tab=thang')
  expect(html).not.toContain('0 ca')
})

it('vẫn hiện bảng Theo máy nếu riêng số máy đang chạy chưa tải được', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  soMayDangChay.mockRejectedValueOnce(new Error('running counts unavailable'))
  const page = await BaoCaoLoiPage({ searchParams: Promise.resolve({ tab: 'may' }) })
  const html = renderToStaticMarkup(page)
  expect(html).toContain('Máy nào hay lỗi')
  expect(html).toContain('Chưa tải được số máy đang chạy')
  expect(html).not.toContain('Chưa tải được báo cáo lỗi')
})
