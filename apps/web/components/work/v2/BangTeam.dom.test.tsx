// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const m = vi.hoisted(() => ({
  sp: new URLSearchParams(),
  replace: vi.fn(),
  refresh: vi.fn(),
  hangLoat: vi.fn(),
  xemTruocXoa: vi.fn(),
  xoaHangLoat: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: m.replace, refresh: m.refresh, push: vi.fn() }),
  usePathname: () => '/work/team',
  useSearchParams: () => m.sp,
}))
vi.mock('@/app/work/actions', () => ({
  hangLoat: m.hangLoat,
  xemTruocXoa: m.xemTruocXoa,
  xoaHangLoat: m.xoaHangLoat,
  doiTrangThai: vi.fn(),
  ganNguoi: vi.fn(),
  keoTha: vi.fn(),
  suaViec: vi.fn(),
}))

import type { NenTang, ViecTeamRow } from '@/app/work/actions'
import { DsRoot } from '@/components/ui/ds-root'
import { thongBao } from '@/components/ui/sonner'
import { hienNgay } from '@/lib/dinh-dang-ngay'
import { BangTeam } from './BangTeam'

const NEN: NenTang = {
  me: null,
  teams: [
    { id: 10, key: 'demo-a', name: 'Team A', color: null },
    { id: 20, key: 'demo-b', name: 'Team B', color: null },
  ],
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
  viec(1, { priority: 1, assignees: [AN], team_id: 10, team_name: 'Team A' }), // gấp vì P1
  viec(2, { due_at: ngay(-2) }), // gấp vì quá hạn
  viec(3, { due_at: ngay(5), priority: 2, team_id: 20, team_name: 'Team B' }), // không gấp
  viec(4, { priority: 1, status: 'done' }), // đã xong → không gấp
]

const ma = () => screen.getAllByRole('button', { name: /^Mở VIEC-/ }).map((b) => b.textContent)
const man = () => render(<DsRoot><BangTeam rows={ROWS} nenTang={NEN} /></DsRoot>)

beforeEach(() => {
  m.sp = new URLSearchParams()
  m.replace.mockReset()
  m.refresh.mockReset()
  m.hangLoat.mockReset()
  m.xemTruocXoa.mockReset()
  m.xoaHangLoat.mockReset()
})
afterEach(() => thongBao.dong())

test('mặc định: mọi việc, sắp theo ưu tiên (gấp trước, khoá phụ id)', () => {
  man()
  expect(ma()).toEqual(['VIEC-1', 'VIEC-4', 'VIEC-3', 'VIEC-2'])
})

test('tab Gấp = chưa xong và (P1 hoặc quá hạn/hôm nay), sắp theo hạn; tab Gấp đang chọn, không số đếm trên tab (khuôn F)', () => {
  m.sp = new URLSearchParams('tab=gap')
  man()
  expect(ma()).toEqual(['VIEC-2', 'VIEC-1'])
  expect(screen.getByRole('tab', { name: 'Gấp', selected: true })).toBeTruthy()
  // Bộ đếm duy nhất ở phân trang.
  expect(screen.getByText(/trên 2 việc/)).toBeTruthy()
})

test('lọc người từ URL: chỉ việc có người đó, nhãn cột Người thành chip ghi tên (khuôn F)', () => {
  m.sp = new URLSearchParams('nguoi=u1')
  man()
  expect(ma()).toEqual(['VIEC-1'])
  expect(screen.getByRole('columnheader', { name: /Demo An/ })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Xoá bộ lọc' })).toBeTruthy()
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

test('lọc team từ URL (link cũ `?team=`): chỉ việc thuộc team đó, chip Team bỏ được; nút Lọc → Team → tick thêm', async () => {
  m.sp = new URLSearchParams('team=10')
  const user = userEvent.setup()
  man()
  expect(ma()).toEqual(['VIEC-1'])
  // Team không có cột → chip ở thanh công cụ cạnh nút Xoá bộ lọc (khuôn F `NutLoc coCot`).
  expect(screen.getByText(/Team A/)).toBeTruthy()
  await user.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }))
  expect(m.replace).toHaveBeenLastCalledWith('/work/team', { scroll: false })
  // Nút Lọc (phễu) thay "Thêm team" · "Thêm người" (CEO 26/11 "Thay bằng nút Lọc").
  expect(screen.queryByRole('button', { name: 'Thêm team' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Thêm người' })).toBeNull()
  await user.click(screen.getByRole('button', { name: 'Lọc' }))
  await user.click(await screen.findByRole('option', { name: /^Team$/ }))
  await user.click(await screen.findByRole('option', { name: /Team B/ }))
  expect(m.replace).toHaveBeenLastCalledWith('/work/team?team=10%2C20', { scroll: false })
})

test('trường lọc mới: Ưu tiên "là Gấp", Tiêu đề chứa, Người làm "Chưa giao" (chưa có ai)', () => {
  m.sp = new URLSearchParams('uu=1')
  const { unmount } = man()
  expect(ma()).toEqual(['VIEC-1', 'VIEC-4'])
  unmount()
  m.sp = new URLSearchParams('ten=chua~demo 3')
  const r2 = man()
  expect(ma()).toEqual(['VIEC-3'])
  r2.unmount()
  m.sp = new URLSearchParams('nguoi=-')
  man()
  expect(ma()).toEqual(['VIEC-4', 'VIEC-3', 'VIEC-2'])
})

test('id team lạ trên URL bị bỏ qua (không lọc rỗng cả bảng)', () => {
  m.sp = new URLSearchParams('team=999')
  man()
  expect(ma()).toHaveLength(4)
})

const XEM_TRUOC = {
  se_xoa: 4, viec_con: 2, bo_qua: 1, binh_luan: 3, nhat_ky: 5, chip: 0, nguoi_lam: 2,
  tu_sinh: 1, luat_dang_bat: ['Ticket quá hạn'], dau_van: 'dv-demo',
}

test('xoá hai nhịp: đếm trước (xemTruocXoa), hộp nói rõ thứ mất; chỉ bấm xác nhận mới xoaHangLoat với dau_van', async () => {
  m.xemTruocXoa.mockResolvedValue({ ok: true, duLieu: XEM_TRUOC })
  m.xoaHangLoat.mockResolvedValue({ ok: true, duLieu: { da_xoa: 4, bo_qua: 1 } })
  const xong = vi.spyOn(thongBao, 'xong')
  const user = userEvent.setup()
  man()
  await user.click(screen.getByRole('checkbox', { name: 'Chọn việc VIEC-1' }))
  await user.click(screen.getByRole('checkbox', { name: 'Chọn việc VIEC-3' }))
  await user.click(screen.getByRole('button', { name: 'Xoá…' }))
  expect(m.xemTruocXoa).toHaveBeenCalledWith([1, 3])
  const hop = await screen.findByRole('alertdialog', { name: 'Xoá 4 việc? Không khôi phục được' })
  expect(m.xoaHangLoat).not.toHaveBeenCalled()
  const chu = hop.textContent ?? ''
  expect(chu).toContain('2 việc con bị xoá lây theo')
  expect(chu).toContain('Bỏ qua 1 việc bạn không có quyền xoá')
  expect(chu).toContain('3 bình luận · 5 dòng nhật ký')
  expect(chu).toContain('cron sẽ dựng lại')
  expect(chu).toContain('Ticket quá hạn')
  await user.click(within(hop).getByRole('button', { name: 'Xoá 4 việc' }))
  expect(m.xoaHangLoat).toHaveBeenCalledWith([1, 3], 'dv-demo')
  await vi.waitFor(() => expect(m.refresh).toHaveBeenCalled())
  expect(xong).toHaveBeenCalledWith('Đã xoá 4 việc · bỏ qua 1 việc bạn không có quyền xoá')
  xong.mockRestore()
})

test('xoá: Huỷ ở hộp xác nhận thì không xoá gì', async () => {
  m.xemTruocXoa.mockResolvedValue({ ok: true, duLieu: XEM_TRUOC })
  const user = userEvent.setup()
  man()
  await user.click(screen.getByRole('checkbox', { name: 'Chọn việc VIEC-1' }))
  await user.click(screen.getByRole('button', { name: 'Xoá…' }))
  const hop = await screen.findByRole('alertdialog', { name: /Xoá 4 việc/ })
  await user.click(within(hop).getByRole('button', { name: 'Huỷ' }))
  expect(m.xoaHangLoat).not.toHaveBeenCalled()
  expect(m.refresh).not.toHaveBeenCalled()
})

test('xoá: không có quyền xoá việc nào → nút xoá khoá', async () => {
  m.xemTruocXoa.mockResolvedValue({ ok: true, duLieu: { ...XEM_TRUOC, se_xoa: 0, viec_con: 0, bo_qua: 1, dau_van: null } })
  const user = userEvent.setup()
  man()
  await user.click(screen.getByRole('checkbox', { name: 'Chọn việc VIEC-1' }))
  await user.click(screen.getByRole('button', { name: 'Xoá…' }))
  const hop = await screen.findByRole('alertdialog', { name: 'Xoá việc đã chọn?' })
  await vi.waitFor(() => expect(hop.textContent).toContain('Bạn không có quyền xoá việc nào trong 1 việc đã chọn'))
  expect(within(hop).getByRole('button', { name: 'Xoá việc' }).hasAttribute('disabled')).toBe(true)
})

test('đổi hạn hàng loạt: "Xoá hạn" gửi xoa_due', async () => {
  m.hangLoat.mockResolvedValue({ ok: true, duLieu: { da_sua: 1, bo_qua: 0 } })
  const user = userEvent.setup()
  man()
  await user.click(screen.getByRole('checkbox', { name: 'Chọn việc VIEC-3' }))
  await user.click(screen.getByRole('button', { name: 'Đổi hạn' }))
  await user.click(await screen.findByRole('button', { name: 'Xoá hạn' }))
  expect(m.hangLoat).toHaveBeenCalledWith([3], { xoa_due: true })
})

test('gán người hàng loạt theo vai: Gán người → Duyệt → người → gan_vai reviewer', async () => {
  m.hangLoat.mockResolvedValue({ ok: true, duLieu: { da_sua: 1, bo_qua: 0 } })
  const user = userEvent.setup()
  man()
  await user.click(screen.getByRole('checkbox', { name: 'Chọn việc VIEC-3' }))
  await user.click(screen.getByRole('button', { name: 'Gán người' }))
  // Menu con Radix: mở bằng phím (→) như người dùng bàn phím; jsdom không có toạ độ cho đường rê chuột.
  ;(await screen.findByRole('menuitem', { name: 'Duyệt' })).focus()
  await user.keyboard('{ArrowRight}')
  await user.click(await screen.findByRole('menuitem', { name: 'Demo An' }))
  await vi.waitFor(() => expect(m.hangLoat).toHaveBeenCalledWith([3], { gan_ai: 'u1', gan_vai: 'reviewer' }))
})

test('tab Lâu không đụng: chưa xong và ≥ 14 ngày không cập nhật, cũ nhất trước; cột Cập nhật mặc định Tương đối (CEO 26/11 "Để Tương đối")', () => {
  m.sp = new URLSearchParams('tab=lau')
  render(
    <DsRoot>
      <BangTeam
        rows={[
          viec(1, { touched_at: ngay(-20) }), // lâu
          viec(2, { touched_at: ngay(-3) }), // mới đụng
          viec(3, { touched_at: ngay(-30), status: 'done' }), // đã xong → không tính
          viec(5, { touched_at: ngay(-40) }), // lâu nhất → đứng đầu
          viec(6, {}), // không có mốc → không tính
        ]}
        nenTang={NEN}
      />
    </DsRoot>,
  )
  expect(ma()).toEqual(['VIEC-5', 'VIEC-1'])
  expect(screen.getByRole('tab', { name: 'Lâu không đụng', selected: true })).toBeTruthy()
  // Cột Cập nhật mặc định Tương đối: 20 ngày → "20 ngày trước"; quá 30 ngày (40) → ngày ngắn.
  expect(screen.getByText('20 ngày trước')).toBeTruthy()
  expect(screen.getByText(hienNgay(ngay(-40), 'tuong-doi'))).toBeTruthy()
})

test('cột Cập nhật đổi định dạng ở menu tiêu đề (URL cot_ngay=cn:ngay-thang) → dd/MM', () => {
  m.sp = new URLSearchParams('tab=lau&cot_ngay=cn:ngay-thang')
  render(
    <DsRoot>
      <BangTeam rows={[viec(5, { touched_at: ngay(-20) })]} nenTang={NEN} />
    </DsRoot>,
  )
  expect(screen.getByText(hienNgay(ngay(-20)))).toBeTruthy()
})

test('bấm tiêu đề cột Hạn → pop lọc có chân "Định dạng ngày" (khuôn F: menu cột đã bỏ) — chọn kiểu → đổi ngay, pop vẫn mở', async () => {
  const user = userEvent.setup()
  man()
  await user.click(screen.getByRole('button', { name: /^Hạn/ }))
  const nhom = await screen.findByRole('group', { name: 'Định dạng ngày' })
  expect(within(nhom).getByRole('button', { name: 'Ngày/tháng', pressed: true })).toBeTruthy()
  await user.click(within(nhom).getByRole('button', { name: 'Ngày đủ năm' }))
  expect(await within(nhom).findByRole('button', { name: 'Ngày đủ năm', pressed: true })).toBeTruthy()
})
