import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import DoanhSoPage from './page'

vi.mock('@/lib/nen-tang/kiem-quyen', () => ({ chanNeuThieuQuyen: vi.fn() }))
vi.mock('@/app/actions', () => ({
  doanhSoCskh: async () => [
    { thang: '2026-11', catalog_code: 'MU-1', ten_hang_muc: 'Gioăng mẫu', so_luot: 2, tong_so_luong: 3, tong_tien: 250000 },
  ],
}))

describe('Doanh số CSKH', () => {
  it('hiển thị báo cáo theo tháng bằng bảng DS và giữ tổng tiền', async () => {
    const html = renderToStaticMarkup(await DoanhSoPage())
    expect(html).toContain('data-ds="v2"')
    expect(html).toContain('data-slot="table"')
    expect(html).toContain('Tháng 11/2026')
    expect(html).toContain('MU-1')
    expect(html).toContain('Gioăng mẫu')
    expect(html).toContain('250.000')
  })
})
