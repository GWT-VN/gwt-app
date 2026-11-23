// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const m = vi.hoisted(() => ({ sp: new URLSearchParams(), replace: vi.fn(), refresh: vi.fn(), hangLoat: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: m.replace, refresh: m.refresh, push: vi.fn() }),
  usePathname: () => '/work/team',
  useSearchParams: () => m.sp,
}))
vi.mock('@/app/work/actions', () => ({
  hangLoat: m.hangLoat,
  doiTrangThai: vi.fn(),
  ganNguoi: vi.fn(),
  keoTha: vi.fn(),
  suaViec: vi.fn(),
}))

import type { NenTang, ViecTeamRow } from '@/app/work/actions'
import { DsRoot } from '@/components/ui/ds-root'
import { thongBao } from '@/components/ui/sonner'
import { BangTeam } from './BangTeam'

const NEN: NenTang = {
  me: null,
  teams: [],
  nhan_su: [
    { id: 'u1', ten: 'Demo An', email: 'demo.an@example.test' },
    { id: 'u2', ten: 'Demo Bình', email: 'demo.binh@example.test' },
  ],
  projects: [],
}
const ngay = (n: number) => new Date(Date.now() + n * 864e5).toISOString()
const viec = (id: number, p: Partial<ViecTeamRow>): ViecTeamRow => ({
  id, ref: `VIEC-${id}`, title: `Việc demo ${id}`, status: 'todo', priority: 3, due_at: null, team_id: null, team_name: null,
  team_color: null, sub_n: 0, assignees: [], links: [], creator_ten: null, sort_order: 0, ...p,
})
const AN = { staff_id: 'u1', ten: 'Demo An', email: 'demo.an@example.test', role: 'owner' }
const ROWS = [
  viec(1, { priority: 1, assignees: [AN] }), // gấp vì P1
  viec(2, { due_at: ngay(-2) }), // gấp vì quá hạn
  viec(3, { due_at: ngay(5), priority: 2 }), // không gấp
  viec(4, { priority: 1, status: 'done' }), // đã xong → không gấp
]

const ma = () => screen.getAllByRole('button', { name: /^Mở VIEC-/ }).map((b) => b.textContent)
const man = () => render(<DsRoot><BangTeam rows={ROWS} nenTang={NEN} /></DsRoot>)

beforeEach(() => {
  m.sp = new URLSearchParams()
  m.replace.mockReset()
  m.refresh.mockReset()
  m.hangLoat.mockReset()
})
afterEach(() => thongBao.dong())

test('mặc định: mọi việc, sắp theo ưu tiên (gấp trước, khoá phụ id)', () => {
  man()
  expect(ma()).toEqual(['VIEC-1', 'VIEC-4', 'VIEC-3', 'VIEC-2'])
})

test('tab Gấp = chưa xong và (P1 hoặc quá hạn/hôm nay), sắp theo hạn; chip Gấp có link bỏ', () => {
  m.sp = new URLSearchParams('tab=gap')
  man()
  expect(ma()).toEqual(['VIEC-2', 'VIEC-1'])
  expect(screen.getByRole('link', { name: 'Bỏ lọc Gấp' }).getAttribute('href')).toBe('/work/team')
})

test('lọc người từ URL: chỉ việc có người đó, chip ghi tên', () => {
  m.sp = new URLSearchParams('nguoi=u1')
  man()
  expect(ma()).toEqual(['VIEC-1'])
  expect(within(screen.getByRole('region', { name: 'Điều kiện đang áp dụng' })).getByText('Demo An')).toBeTruthy()
})

test('chọn 2 dòng → Đánh dấu xong gọi hangLoat một lượt, báo số bỏ qua', async () => {
  m.hangLoat.mockResolvedValue({ ok: true, duLieu: { da_sua: 1, bo_qua: 1, bi_chan: 0 } })
  const xong = vi.spyOn(thongBao, 'xong')
  const user = userEvent.setup()
  man()
  await user.click(screen.getByRole('checkbox', { name: 'Chọn việc VIEC-1' }))
  await user.click(screen.getByRole('checkbox', { name: 'Chọn việc VIEC-3' }))
  await user.click(screen.getByRole('button', { name: 'Đánh dấu xong' }))
  expect(m.hangLoat).toHaveBeenCalledWith([1, 3], { status: 'done' })
  await vi.waitFor(() => expect(m.refresh).toHaveBeenCalled())
  expect(xong).toHaveBeenCalledWith('Đã đánh dấu xong: 1 việc · bỏ qua 1 việc bạn không có quyền sửa')
  xong.mockRestore()
})
