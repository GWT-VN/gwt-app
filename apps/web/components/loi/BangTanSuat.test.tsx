import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { DongTanSuat } from '@/lib/loi/tanSuat'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
import { BangTanSuat } from './BangTanSuat'

const dong = (p: Partial<DongTanSuat>): DongTanSuat => ({ nhom_ten: 'Rò nước', loi_code: 'L1', loi_ten: 'Rò đáy', internal_code: 'CTS20NG',
  theo_thang: { '2026-10': 2 }, so_ca: 2, ban_luy_ke: 100, nhap_luy_ke: null, ty_le_ban: 2, ty_le_nhap: null, trung_vi_ngay_chay: 41, so_may_lap_lai: 1, ...p })

describe('BangTanSuat', () => {
  it('cột tháng, tổng, tỷ lệ, "—" khi null, liên kết sang ticket', () => {
    const h = renderToStaticMarkup(<BangTanSuat rows={[dong({})]} thang={['2026-10', '2026-11']} />)
    expect(h).toContain('10/2026'); expect(h).toContain('11/2026')
    expect(h).toContain('Rò đáy'); expect(h).toContain('CTS20NG')
    expect(h).toContain('2%'); expect(h).toContain('41 ngày')
    expect(h).toContain('—')
    expect(h).toContain('/ticket?loi=L1')
  })
  it('tháng 0 để trống, không in "0"', () => {
    const h = renderToStaticMarkup(<BangTanSuat rows={[dong({ theo_thang: { '2026-10': 2 } })]} thang={['2026-10', '2026-11']} />)
    expect(h).not.toMatch(/>0</)
  })
  it('có chân bảng tổng và chú thích định nghĩa', () => {
    const h = renderToStaticMarkup(<BangTanSuat rows={[dong({}), dong({ loi_code: 'L2', so_ca: 3, theo_thang: { '2026-10': 3 } })]} thang={['2026-10']} />)
    expect(h).toContain('Tổng cộng')
    expect(h).toContain('>5<')
    expect(h).toContain('một ca cho mỗi dòng máy')
    expect(h).toContain('lũy kế')
  })
  it('rỗng: báo không có dữ liệu', () => {
    expect(renderToStaticMarkup(<BangTanSuat rows={[]} thang={[]} />)).toContain('Không có ca lỗi')
  })
})
