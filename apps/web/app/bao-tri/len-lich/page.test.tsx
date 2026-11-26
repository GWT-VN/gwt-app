import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import Page from './page'

const { gate, khach } = vi.hoisted(() => ({
  gate: vi.fn(),
  khach: vi.fn(async () => ({ ten: 'Khách mẫu' })),
}))
vi.mock('@/lib/nen-tang/kiem-quyen', () => ({ chanNeuThieuQuyen: gate }))
vi.mock('@/app/actions', () => ({ baoTriDaMap: vi.fn(async () => []), baoTriSapHet: vi.fn(async () => []), boiCanhKhach: khach }))
vi.mock('@/components/BaoTriQuanLy', () => ({
  BaoTriQuanLy: ({ moTaoKhach }: { moTaoKhach?: { id: string } }) => <p>{moTaoKhach?.id}</p>,
}))

it('shows the maintenance scheduling page in the DS with the permitted quick-link customer', async () => {
  const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ kh: 'KH-1' }) }))
  expect(gate).toHaveBeenCalledWith('cs.bao_tri.tao_plan', 'QUANLY')
  expect(khach).toHaveBeenCalledWith('KH-1')
  expect(html).toContain('data-slot="page-header"')
  expect(html).toContain('KH-1')
})
