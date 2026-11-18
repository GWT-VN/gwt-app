import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/may/huy-lap-actions', () => ({ huyLapMay: vi.fn(), suaNgayBaoHanhBo: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }))
import { QuanLyLap } from './QuanLyLap'
import type { ThongTinLap } from '@/app/may/huy-lap-actions'

const bo: ThongTinLap = {
  la_bo: true, bo_cha: null, install_date: '2026-11-15', huy_duoc: true,
  con: [
    { serial: 'F00000214AW1N00040039', internal_code: 'GTEC-30A01-G', cho_serial: false, full_end: '2027-11-15' },
    { serial: 'TAM202611004', internal_code: 'GTEP-00X00', cho_serial: true, full_end: null },
  ],
}

describe('QuanLyLap', () => {
  it('bộ: danh sách thiết bị + hạn BH, nút sửa ngày cả bộ, nút huỷ', () => {
    const h = renderToStaticMarkup(<QuanLyLap serial="WH30AECO202611002" tt={bo} choSua />)
    for (const t of ['Thiết bị trong bộ (2)', 'F00000214AW1N00040039', '15/11/2027', 'chưa có hạn', 'chờ bổ sung serial',
      'Sửa ngày bảo hành cả bộ (đang 15/11/2026)', 'Huỷ bộ (nhập nhầm)']) expect(h).toContain(t)
  })
  it('huy_duoc = false (thiết bị trong bộ) → không có nút huỷ', () => {
    const h = renderToStaticMarkup(<QuanLyLap serial="B" tt={{ ...bo, huy_duoc: false }} choSua />)
    expect(h).not.toContain('Huỷ bộ')
    expect(h).toContain('Sửa ngày bảo hành cả bộ')
  })
  it('không quyền → chỉ xem danh sách', () => {
    const h = renderToStaticMarkup(<QuanLyLap serial="B" tt={bo} choSua={false} />)
    expect(h).toContain('Thiết bị trong bộ')
    expect(h).not.toContain('<button')
  })
  it('thiết bị trong bộ → trỏ về trang bộ', () => {
    const h = renderToStaticMarkup(<QuanLyLap serial="F1" tt={{ ...bo, la_bo: false, con: [], bo_cha: 'WH30AECO202611002', huy_duoc: false }} choSua />)
    expect(h).toContain('/may/WH30AECO202611002')
    expect(h).not.toContain('Huỷ')
  })
  it('thiết bị lẻ không huỷ được, không bộ → không hiện gì', () => {
    expect(renderToStaticMarkup(<QuanLyLap serial="X" tt={{ ...bo, la_bo: false, con: [], huy_duoc: false }} choSua />)).toBe('')
  })
})
