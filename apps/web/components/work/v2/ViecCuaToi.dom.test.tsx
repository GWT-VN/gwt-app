// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const m = vi.hoisted(() => ({ sp: new URLSearchParams(), replace: vi.fn(), refresh: vi.fn(), hangLoat: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: m.replace, refresh: m.refresh, push: vi.fn() }),
  usePathname: () => '/work',
  useSearchParams: () => m.sp,
}))
vi.mock('@/app/work/actions', () => ({
  hangLoat: m.hangLoat,
  doiTrangThai: vi.fn(),
  ganNguoi: vi.fn(),
  keoTha: vi.fn(),
  suaViec: vi.fn(),
  taoViec: vi.fn(),
  xemTruocXoa: vi.fn(),
  xoaHangLoat: vi.fn(),
}))

import type { NenTang, ViecRow } from '@/app/work/actions'
import { DsRoot } from '@/components/ui/ds-root'
import { thongBao } from '@/components/ui/sonner'
import { ViecCuaToi } from './ViecCuaToi'

const NEN: NenTang = {
  me: { id: 'u1', ten: 'Demo An', email: 'demo.an@example.test', vai_tro: [] },
  teams: [],
  nhan_su: [{ id: 'u1', ten: 'Demo An', email: 'demo.an@example.test' }],
  projects: [],
}
const ngay = (n: number) => new Date(Date.now() + n * 864e5).toISOString()
const viec = (id: number, p: Partial<ViecRow>): ViecRow => ({
  id, ref: `VIEC-${id}`, title: `Việc demo ${id}`, description: null, status: 'todo', priority: 3, start_at: null,
  due_at: null, team_id: null, team_name: null, team_color: null, my_role: 'owner', sub_n: 0, assignees: [], links: [],
  ...p,
})
const ROWS = [viec(1, { due_at: ngay(3) }), viec(2, { status: 'doing', due_at: ngay(1) })]

const man = () => render(<DsRoot><ViecCuaToi rows={ROWS} xongTuanNay={[]} nenTang={NEN} /></DsRoot>)

beforeEach(() => {
  m.sp = new URLSearchParams()
  m.replace.mockReset()
  m.refresh.mockReset()
  m.hangLoat.mockReset()
})
afterEach(() => thongBao.dong())

test('đổi dạng xem: Danh sách (mặc định) → Bảng (chọn dòng + thanh hàng loạt) → Kanban (cột theo trạng thái)', async () => {
  m.hangLoat.mockResolvedValue({ ok: true, duLieu: { da_sua: 1, bo_qua: 0 } })
  const user = userEvent.setup()
  man()
  expect(screen.getByRole('radio', { name: 'Danh sách' }).getAttribute('aria-checked')).toBe('true')
  // ListView (role table, tên "Việc của tôi") — không có ô chọn dòng.
  expect(screen.getByRole('table', { name: 'Việc của tôi' })).toBeTruthy()
  expect(screen.queryByRole('checkbox', { name: 'Chọn việc VIEC-1' })).toBeNull()

  await user.click(screen.getByRole('radio', { name: 'Bảng' }))
  expect(screen.queryByRole('table', { name: 'Việc của tôi' })).toBeNull()
  const bang = screen.getByRole('table')
  // Bảng sắp mặc định theo hạn gần nhất: VIEC-2 (mai) trước VIEC-1.
  expect(within(bang).getAllByRole('button', { name: /^Mở VIEC-/ }).map((b) => b.textContent)).toEqual([
    'VIEC-2',
    'VIEC-1',
  ])
  await user.click(screen.getByRole('checkbox', { name: 'Chọn việc VIEC-1' }))
  const thanh = screen.getByRole('toolbar', { name: 'Thao tác hàng loạt' })
  await user.click(within(thanh).getByRole('button', { name: 'Đánh dấu xong' }))
  expect(m.hangLoat).toHaveBeenCalledWith([1], { status: 'done' })

  await user.click(screen.getByRole('radio', { name: 'Kanban' }))
  expect(screen.queryAllByRole('table')).toHaveLength(0)
  expect(within(screen.getByRole('region', { name: 'Cần làm' })).getByText('Việc demo 1')).toBeTruthy()
  expect(within(screen.getByRole('region', { name: 'Đang làm' })).getByText('Việc demo 2')).toBeTruthy()
})
