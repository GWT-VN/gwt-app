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

test('đổi dạng xem: Danh sách (mặc định, bảng dòng) → Gọn (ListView) → Bảng (kẻ viền) → Kanban', async () => {
  m.hangLoat.mockResolvedValue({ ok: true, duLieu: { da_sua: 1, bo_qua: 0 } })
  const user = userEvent.setup()
  man()
  expect(screen.getByRole('radio', { name: 'Danh sách' }).getAttribute('aria-checked')).toBe('true')
  // Danh sách = bảng dạng dòng khuôn F (CEO 27/11): sắp mặc định theo hạn gần nhất — VIEC-2 (mai) trước VIEC-1.
  const bang = screen.getByRole('table')
  expect(bang.closest('[data-luoi]')).toBeNull()
  expect(within(bang).getAllByRole('button', { name: /^Mở VIEC-/ }).map((b) => b.textContent)).toEqual(['VIEC-2', 'VIEC-1'])
  // Ô tick CHỈ để chọn dòng (CEO 23/11) — không còn "đánh dấu xong".
  expect(screen.queryByRole('checkbox', { name: /Đánh dấu xong/ })).toBeNull()
  await user.click(screen.getByRole('checkbox', { name: 'Chọn việc VIEC-1' }))
  expect(m.replace).not.toHaveBeenCalled() // bấm ô chọn không mở Xem nhanh (?xem=)
  const thanh = screen.getByRole('toolbar', { name: 'Thao tác hàng loạt' })
  await user.click(within(thanh).getByRole('button', { name: 'Đánh dấu xong' }))
  expect(m.hangLoat).toHaveBeenCalledWith([1], { status: 'done' })

  // Gọn = ListView (role table, tên "Việc của tôi"), không nhóm theo hạn (phân loại ở tab).
  await user.click(screen.getByRole('radio', { name: 'Gọn' }))
  expect(screen.getByRole('table', { name: 'Việc của tôi' })).toBeTruthy()
  expect(document.querySelector('[data-nhom]')).toBeNull()

  // Bảng = bảng kẻ viền (`TableWrap luoi`).
  await user.click(screen.getByRole('radio', { name: 'Bảng' }))
  expect(screen.queryByRole('table', { name: 'Việc của tôi' })).toBeNull()
  expect(screen.getByRole('table').closest('[data-luoi]')).not.toBeNull()

  await user.click(screen.getByRole('radio', { name: 'Kanban' }))
  expect(screen.queryAllByRole('table')).toHaveLength(0)
  expect(within(screen.getByRole('region', { name: 'Cần làm' })).getByText('Việc demo 1')).toBeTruthy()
  expect(within(screen.getByRole('region', { name: 'Đang làm' })).getByText('Việc demo 2')).toBeTruthy()
})
