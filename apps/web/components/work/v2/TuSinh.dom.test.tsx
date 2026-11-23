// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const m = vi.hoisted(() => ({
  sp: new URLSearchParams(),
  replace: vi.fn(),
  refresh: vi.fn(),
  batTatLuat: vi.fn(),
  batTatTuSinh: vi.fn(),
  thuLuat: vi.fn(),
  chayTuSinh: vi.fn(),
  hangLoat: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: m.replace, refresh: m.refresh, push: vi.fn() }),
  usePathname: () => '/work/tu-sinh',
  useSearchParams: () => m.sp,
}))
vi.mock('@/app/work/actions', () => ({
  batTatLuat: m.batTatLuat,
  batTatTuSinh: m.batTatTuSinh,
  thuLuat: m.thuLuat,
  chayTuSinh: m.chayTuSinh,
  hangLoat: m.hangLoat,
  doiNguoiNhan: vi.fn(),
  doiTrangThai: vi.fn(),
  suaLuat: vi.fn(),
}))

import type { LuatTuSinh, ManTuSinh, NenTang } from '@/app/work/actions'
import { DsRoot } from '@/components/ui/ds-root'
import { thongBao } from '@/components/ui/sonner'
import { TuSinh } from './TuSinh'

const NEN: NenTang = {
  me: null,
  teams: [],
  nhan_su: [{ id: 'u1', ten: 'Demo An', email: 'demo.an@example.test' }],
  projects: [],
}
const LUAT: LuatTuSinh = {
  key: 'ticket_khong_nguoi',
  name: 'Ticket chưa ai nhận',
  mo_ta: 'Ticket mở lâu mà chưa có người phụ trách',
  nguon: 'CSKH',
  active: true,
  priority: 2,
  team_key: null,
  han_ngay: 1,
  max_moi_lan: 15,
  last_run_at: null,
  last_created: 0,
  nguoi_nhan: null,
  nguoi_nhan_ten: null,
  nguong_gio: 24,
  cua_so_ngay: null,
}
const du = (p: Partial<ManTuSinh> = {}): ManTuSinh => ({
  luat: [LUAT],
  la_quan_ly: true,
  cong_tac_bat: true,
  nhan_su: [],
  gan_day: [],
  tong_auto: 0,
  ...p,
})
const man = (d = du()) => render(<DsRoot><TuSinh duLieu={d} nenTang={NEN} duocSuaLuat /></DsRoot>)

beforeEach(() => {
  m.sp = new URLSearchParams()
  for (const f of [m.replace, m.refresh, m.batTatLuat, m.batTatTuSinh, m.thuLuat, m.chayTuSinh, m.hangLoat]) {
    f.mockReset()
  }
})
afterEach(() => thongBao.dong())

test('tắt một luật gọi batTatLuat(key, false), báo xong, không mở hộp Sửa', async () => {
  m.batTatLuat.mockResolvedValue({ ok: true, duLieu: undefined })
  const xong = vi.spyOn(thongBao, 'xong')
  const user = userEvent.setup()
  man()
  const cong = screen.getByRole('switch', { name: 'Bật luật Ticket chưa ai nhận' })
  expect(cong.getAttribute('aria-checked')).toBe('true')
  await user.click(cong)
  expect(m.batTatLuat).toHaveBeenCalledWith('ticket_khong_nguoi', false)
  await vi.waitFor(() => expect(xong).toHaveBeenCalledWith('Ticket chưa ai nhận: đã tắt'))
  expect(screen.queryByRole('dialog')).toBeNull()
  xong.mockRestore()
})

test('Xem trước gọi thuLuat và hiện đúng danh sách se_sinh — không chạy bộ quét', async () => {
  m.thuLuat.mockResolvedValue({
    ok: true,
    duLieu: {
      luat: 'ticket_khong_nguoi',
      se_sinh: [
        { khoa: 'TK-101', mo_ta: 'Ticket demo 101 chưa ai nhận', moc: '20/11' },
        { khoa: 'TK-102', mo_ta: 'Ticket demo 102 chưa ai nhận', moc: '21/11' },
      ],
    },
  })
  const user = userEvent.setup()
  man()
  await user.click(screen.getByRole('button', { name: 'Xem trước luật Ticket chưa ai nhận' }))
  expect(m.thuLuat).toHaveBeenCalledWith('ticket_khong_nguoi')
  const hop = await screen.findByRole('dialog', { name: 'Chạy bây giờ sẽ sinh 2 việc' })
  const muc = within(within(hop).getByRole('list', { name: 'Việc sẽ sinh' })).getAllByRole('listitem')
  expect(muc.map((x) => x.textContent)).toEqual([
    'Ticket demo 101 chưa ai nhậnTK-101 · 20/11',
    'Ticket demo 102 chưa ai nhậnTK-102 · 21/11',
  ])
  expect(m.chayTuSinh).not.toHaveBeenCalled()
})

test('Xem trước không có gì khớp → trạng thái rỗng trong hộp', async () => {
  m.thuLuat.mockResolvedValue({ ok: true, duLieu: { luat: 'ticket_khong_nguoi', se_sinh: [] } })
  const user = userEvent.setup()
  man()
  await user.click(screen.getByRole('button', { name: 'Xem trước luật Ticket chưa ai nhận' }))
  const hop = await screen.findByRole('dialog', { name: 'Chạy bây giờ sẽ sinh 0 việc' })
  expect(within(hop).getByRole('heading', { name: 'Không có sự kiện nào khớp' })).toBeTruthy()
})

test('bật bộ quét hỏi trước; chỉ khi xác nhận mới gọi batTatTuSinh(true)', async () => {
  m.batTatTuSinh.mockResolvedValue({ ok: true, duLieu: { bat: true } })
  const user = userEvent.setup()
  man(du({ cong_tac_bat: false }))
  await user.click(screen.getByRole('switch', { name: 'Bộ quét tự động' }))
  expect(m.batTatTuSinh).not.toHaveBeenCalled()
  const hop = await screen.findByRole('alertdialog', { name: 'Bật bộ quét tự động?' })
  await user.click(within(hop).getByRole('button', { name: 'Bật bộ quét' }))
  expect(m.batTatTuSinh).toHaveBeenCalledWith(true)
})

test('rỗng: không có luật → EmptyState; tab Việc đã sinh không có việc → trạng thái chưa có dữ liệu', () => {
  const { unmount } = man(du({ luat: [] }))
  expect(screen.getByRole('heading', { name: 'Chưa có luật sinh việc nào' })).toBeTruthy()
  unmount()
  m.sp = new URLSearchParams('tab=viec')
  man(du({ luat: [] }))
  expect(screen.getByText('Chưa có việc nào được sinh tự động')).toBeTruthy()
  expect(screen.queryByRole('table')).toBeNull()
})

test('tab Việc đã sinh: chọn dòng → thanh hàng loạt gọi hangLoat một lượt; mã mở thẻ xem nhanh', async () => {
  m.sp = new URLSearchParams('tab=viec')
  m.hangLoat.mockResolvedValue({ ok: true, duLieu: { da_sua: 1, bo_qua: 0, bi_chan: 0 } })
  const viec = (id: number) => ({
    id, ref: `VIEC-${id}`, title: `Việc demo ${id}`, status: 'todo', priority: 3, due_at: null, team_id: null,
    team_name: null, team_color: null, sub_n: 0, assignees: [], links: [], creator_ten: null, sort_order: 0,
    origin_ref: `TK-${id}`, created_at: new Date().toISOString(),
  })
  const user = userEvent.setup()
  man(du({ gan_day: [viec(7), viec(8)], tong_auto: 5 }))
  expect(screen.getByText('Bạn xem được 2/5 việc tự sinh — phần còn lại thuộc team khác.')).toBeTruthy()
  await user.click(screen.getByRole('checkbox', { name: 'Chọn việc VIEC-8' }))
  await user.click(screen.getByRole('button', { name: 'Đánh dấu xong' }))
  expect(m.hangLoat).toHaveBeenCalledWith([8], { status: 'done' })
  await user.click(screen.getByRole('button', { name: 'Mở VIEC-7' }))
  expect(m.replace).toHaveBeenLastCalledWith('/work/tu-sinh?tab=viec&xem=7', { scroll: false })
})
