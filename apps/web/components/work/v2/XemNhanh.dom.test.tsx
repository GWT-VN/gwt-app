// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import type { ChiTietViec, NenTang } from '@/app/work/actions'
import { useState } from 'react'
import { DsRoot } from '@/components/ui/ds-root'
import { XemNhanh as KhungXemNhanh } from '@/components/ui/xem-nhanh'
import { useTheViec, type TabViec } from './XemNhanh'

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

type P = { onDong: () => void; onMoViec: (id: number) => void; onDoi: () => void }

/** Như KhungXemViec: khung DS + `the` từ useTheViec, tab giữ ở bên gọi. */
function Thu(p: P) {
  const [tab, setTab] = useState<TabViec>('tong')
  const the = useTheViec({ taskId: 7, ma: 'VIEC-7', nenTang: NEN, tab, onTab: setTab, ...p })
  return (
    <KhungXemNhanh the={the} onDong={p.onDong}>
      <p>màn</p>
    </KhungXemNhanh>
  )
}

const ve = () => {
  const props = { onDong: vi.fn(), onMoViec: vi.fn(), onDoi: vi.fn() }
  render(
    <DsRoot>
      <Thu {...props} />
    </DsRoot>,
  )
  return props
}
const the = () => screen.getByRole('complementary', { name: 'Xem nhanh VIEC-7' })
const daTai = () => screen.findByRole('tab', { name: 'Tổng quan' })
const moTab = (ten: string) => userEvent.click(screen.getByRole('tab', { name: ten }))
/** Ô giá trị (`dd`) của dòng thuộc tính có nhãn `nhan`. */
const oCua = (nhan: string) => screen.getByText(nhan, { selector: 'dt' }).nextElementSibling as HTMLElement

beforeEach(() => vi.clearAllMocks())

test('tải xong → đầu thẻ là mã, tiêu đề LỚN trên hàng tab (học Notion); Đánh dấu xong (chân) gọi action, tải lại, báo màn; việc con mở được', async () => {
  chiTiet.mockResolvedValue({ ok: true, duLieu: ct() })
  const p = ve()
  await daTai()
  expect(the().textContent).toContain('VIEC-7')
  const tieuDe = the().querySelector('[data-slot="xem-nhanh-tieu-de"]')!
  expect(tieuDe.textContent).toContain('Việc demo')
  // Tiêu đề đứng TRƯỚC hàng tab.
  expect(tieuDe.compareDocumentPosition(screen.getByRole('tablist')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  // Tiêu đề kiểu Notion: chữ chính là ô sửa (không nút bút). Gõ + Enter → lưu.
  expect(screen.queryByRole('button', { name: 'Sửa tiêu đề' })).toBeNull()
  expect(screen.getByRole('textbox', { name: 'Tiêu đề việc' })).toBeTruthy()
  await userEvent.click(screen.getByRole('button', { name: 'Đánh dấu xong' }))
  await waitFor(() => expect(p.onDoi).toHaveBeenCalledOnce())
  expect(actions.doiTrangThai).toHaveBeenCalledWith(7, 'done')
  expect(chiTiet).toHaveBeenCalledTimes(2)
  await moTab('Việc con')
  expect(screen.getByText('0/1 xong')).toBeTruthy()
  await userEvent.click(screen.getByRole('button', { name: 'Mở VIEC-8' }))
  expect(p.onMoViec).toHaveBeenCalledWith(8)
})

test('tiêu đề kiểu Notion: gõ thẳng vào chữ, Enter lưu; Esc trả lại chữ cũ', async () => {
  chiTiet.mockResolvedValue({ ok: true, duLieu: ct() })
  ve()
  await daTai()
  const o = screen.getByRole('textbox', { name: 'Tiêu đề việc' }) as HTMLTextAreaElement
  expect(o.value).toBe('Việc demo')
  await userEvent.clear(o)
  await userEvent.type(o, 'Bỏ đi{Escape}')
  expect(o.value).toBe('Việc demo')
  expect(actions.suaViec).not.toHaveBeenCalled()
  await userEvent.clear(o)
  await userEvent.type(o, 'Việc mới đổi{Enter}')
  await waitFor(() => expect(actions.suaViec).toHaveBeenCalledWith(7, { title: 'Việc mới đổi' }))
})

test('tab: đủ 4 tab, chuyển tab đổi nội dung; Hoạt động tô tên nhắc, Liên kết có gắn khách', async () => {
  chiTiet.mockResolvedValue({ ok: true, duLieu: ct() })
  ve()
  await daTai()
  expect(screen.getAllByRole('tab').map((x) => x.textContent)).toEqual(['Tổng quan', 'Việc con', 'Hoạt động', 'Liên kết'])
  await moTab('Hoạt động')
  expect(screen.getByRole('tab', { name: 'Hoạt động' }).getAttribute('aria-selected')).toBe('true')
  expect(screen.getByText('@Demo Hai').tagName).toBe('STRONG')
  // Thuộc tính chính nằm TRÊN hàng tab (học Notion, CEO 27/11) → vẫn hiện khi đổi tab.
  expect(screen.getByText('Trạng thái', { selector: 'dt' })).toBeTruthy()
  await moTab('Liên kết')
  expect(screen.getByRole('button', { name: 'Gắn khách' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Thêm việc phải xong trước' })).toBeTruthy()
})

test('thuộc tính nằm giữa tiêu đề và hàng tab; nhóm Tổng quan thu/mở được: thu "Hệ thống" → ẩn dòng, mở lại → hiện', async () => {
  chiTiet.mockResolvedValue({ ok: true, duLieu: ct() })
  ve()
  await daTai()
  const thuocTinh = the().querySelector('[data-slot="xem-nhanh-thuoc-tinh"]')!
  expect(within(thuocTinh as HTMLElement).getByText('Trạng thái', { selector: 'dt' })).toBeTruthy()
  expect(thuocTinh.compareDocumentPosition(screen.getByRole('tablist')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  const nut = screen.getByRole('button', { name: 'Hệ thống' })
  expect(nut.getAttribute('aria-expanded')).toBe('true')
  expect(screen.getByText('Người tạo', { selector: 'dt' })).toBeTruthy()
  await userEvent.click(nut)
  expect(nut.getAttribute('aria-expanded')).toBe('false')
  expect(screen.queryByText('Người tạo', { selector: 'dt' })).toBeNull()
  // Nhóm khác không bị ảnh hưởng (type="multiple").
  expect(screen.getByRole('button', { name: 'Mô tả' }).getAttribute('aria-expanded')).toBe('true')
  await userEvent.click(nut)
  expect(screen.getByText('Người tạo', { selector: 'dt' })).toBeTruthy()
})

test('còn việc chặn chưa xong → cảnh báo ở Tổng quan + không đánh dấu xong được', async () => {
  chiTiet.mockResolvedValue({ ok: true, duLieu: ct(true, [{ id: 9, ref: 'VIEC-9', title: 'Chặn demo', status: 'todo' }]) })
  ve()
  expect(await screen.findByText('Chờ VIEC-9 xong trước')).toBeTruthy()
  expect((screen.getByRole('button', { name: 'Đánh dấu xong' }) as HTMLButtonElement).disabled).toBe(true)
})

test('chỉ xem → không có nút sửa tiêu đề / thêm người; trường trống hiện "—", không lặp tên nhãn', async () => {
  chiTiet.mockResolvedValue({ ok: true, duLieu: ct(false) })
  ve()
  await daTai()
  expect(screen.queryByRole('textbox', { name: 'Tiêu đề việc' })).toBeNull()
  expect(screen.queryByRole('button', { name: /Thêm người/ })).toBeNull()
  expect(screen.getByText(/Chỉ xem/)).toBeTruthy()
  for (const nhan of ['Hạn', 'Làm cùng', 'Theo dõi']) {
    const o = oCua(nhan)
    expect(o.querySelector('[aria-hidden="true"]')?.textContent, nhan).toBe('—')
    expect(o.textContent, nhan).not.toContain(nhan)
  }
})

test('lỗi tải → Alert, Đóng gọi onDong', async () => {
  chiTiet.mockResolvedValue({ ok: false, loi: 'Không có quyền xem việc này' })
  const p = ve()
  expect(await screen.findByText('Không có quyền xem việc này')).toBeTruthy()
  await userEvent.click(screen.getByRole('button', { name: 'Đóng' }))
  expect(p.onDong).toHaveBeenCalledOnce()
})

test('đổi người chính: bước hạ người cũ lỗi → trả người mới về như trước, không để 2 người chính', async () => {
  chiTiet.mockResolvedValue({ ok: true, duLieu: ct() })
  vi.mocked(actions.ganNguoi)
    .mockResolvedValueOnce({ ok: true, duLieu: undefined })
    .mockResolvedValueOnce({ ok: false, loi: 'Lỗi demo' })
  ve()
  await daTai()
  await userEvent.click(screen.getByRole('button', { name: 'Sửa người chính VIEC-7' }))
  await userEvent.click(await screen.findByRole('option', { name: /Demo Hai/ }))
  await waitFor(() => expect(actions.boNguoi).toHaveBeenCalledWith(7, 'u2'))
  expect(actions.ganNguoi).toHaveBeenNthCalledWith(1, 7, 'u2', 'owner')
  expect(actions.ganNguoi).toHaveBeenNthCalledWith(2, 7, 'u1', 'doer')
})
