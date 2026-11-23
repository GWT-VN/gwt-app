// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import type { ChiTietViec, NenTang } from '@/app/work/actions'
import { DsRoot } from '@/components/ui/ds-root'
import { XemNhanh } from './XemNhanh'

vi.mock('@/app/work/actions', () => {
  const ok = async () => ({ ok: true, duLieu: undefined })
  return {
    chiTietViec: vi.fn(),
    doiTrangThai: vi.fn(ok),
    suaViec: vi.fn(ok),
    ganNguoi: vi.fn(ok),
    boNguoi: vi.fn(ok),
    themBinhLuan: vi.fn(ok),
    taoViecCon: vi.fn(ok),
    themPhuThuoc: vi.fn(ok),
    boPhuThuoc: vi.fn(ok),
    ganErp: vi.fn(ok),
    boErp: vi.fn(ok),
    timErp: vi.fn(async () => ({ ok: true, duLieu: [] })),
    timViec: vi.fn(async () => ({ ok: true, duLieu: [] })),
  }
})
vi.mock('@/components/ui/sonner', () => ({ thongBao: { xong: vi.fn(), loi: vi.fn(), dangChay: vi.fn(), dong: vi.fn() } }))

const actions = await import('@/app/work/actions')
const chiTiet = vi.mocked(actions.chiTietViec)

const NEN: NenTang = {
  me: null,
  teams: [{ id: 1, key: 'cskh', name: 'Team Demo', color: null }],
  nhan_su: [
    { id: 'u1', ten: 'Demo Một', email: 'demo1@example.test' },
    { id: 'u2', ten: 'Demo Hai', email: 'demo2@example.test' },
  ],
  projects: [],
}

function ct(sua = true, chan: ChiTietViec['chan_boi'] = []): ChiTietViec {
  return {
    task: {
      id: 7, ref: 'VIEC-7', title: 'Việc demo', description: null, status: 'doing', priority: 1, visibility: 'team',
      start_at: null, due_at: null, completed_at: null, team_id: 1, parent_id: null, origin: 'manual',
      team_name: 'Team Demo', team_color: null, creator_ten: 'Demo Một', created_at: '2026-11-20T02:00:00Z',
      parent_ref: null, parent_title: null,
    },
    assignees: [{ staff_id: 'u1', ten: 'Demo Một', email: 'demo1@example.test', role: 'owner' }],
    co_the_sua: sua,
    links: [],
    comments: [{ id: 1, body: 'Chào @Demo Hai', ten: 'Demo Một', created_at: '2026-11-20T03:00:00Z', nhac_ten: ['Demo Hai'] }],
    activity: [{ id: 1, verb: 'created', payload: null, ten: 'Demo Một', created_at: '2026-11-20T02:00:00Z' }],
    subtasks: [{ id: 8, ref: 'VIEC-8', title: 'Việc con demo', status: 'todo' }],
    chan_boi: chan,
    dang_chan: [],
  }
}

const ve = (p: Partial<Parameters<typeof XemNhanh>[0]> = {}) => {
  const props = { taskId: 7, nenTang: NEN, onDong: vi.fn(), onMoViec: vi.fn(), onDoi: vi.fn(), ...p }
  render(
    <DsRoot>
      <XemNhanh {...props} />
    </DsRoot>,
  )
  return props
}

beforeEach(() => vi.clearAllMocks())

test('tải xong → tiêu đề, bình luận tô tên nhắc; Đánh dấu xong gọi action, tải lại, báo màn', async () => {
  chiTiet.mockResolvedValue({ ok: true, duLieu: ct() })
  const p = ve()
  expect(await screen.findByRole('heading', { level: 2, name: 'Việc demo' })).toBeTruthy()
  expect(screen.getByText('@Demo Hai').tagName).toBe('STRONG')
  await userEvent.click(screen.getByRole('button', { name: 'Đánh dấu xong' }))
  await waitFor(() => expect(p.onDoi).toHaveBeenCalledOnce())
  expect(actions.doiTrangThai).toHaveBeenCalledWith(7, 'done')
  expect(chiTiet).toHaveBeenCalledTimes(2)
  await userEvent.click(screen.getByRole('button', { name: 'Mở VIEC-8' }))
  expect(p.onMoViec).toHaveBeenCalledWith(8)
})

test('còn việc chặn chưa xong → cảnh báo + không đánh dấu xong được', async () => {
  chiTiet.mockResolvedValue({ ok: true, duLieu: ct(true, [{ id: 9, ref: 'VIEC-9', title: 'Chặn demo', status: 'todo' }]) })
  ve()
  expect(await screen.findByText('Chờ VIEC-9 xong trước')).toBeTruthy()
  expect((screen.getByRole('button', { name: 'Đánh dấu xong' }) as HTMLButtonElement).disabled).toBe(true)
})

test('chỉ xem → không có nút sửa tiêu đề / thêm người', async () => {
  chiTiet.mockResolvedValue({ ok: true, duLieu: ct(false) })
  ve()
  await screen.findByRole('heading', { level: 2, name: 'Việc demo' })
  expect(screen.queryByRole('button', { name: 'Sửa tiêu đề' })).toBeNull()
  expect(screen.queryByRole('button', { name: /Thêm người/ })).toBeNull()
  expect(screen.getByText(/Chỉ xem/)).toBeTruthy()
})

test('lỗi tải → Alert, Đóng gọi onDong', async () => {
  chiTiet.mockResolvedValue({ ok: false, loi: 'Không có quyền xem việc này' })
  const p = ve()
  expect(await screen.findByText('Không có quyền xem việc này')).toBeTruthy()
  await userEvent.click(screen.getByRole('button', { name: 'Đóng' }))
  expect(p.onDong).toHaveBeenCalledOnce()
})
