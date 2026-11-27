// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeEach, expect, test, vi } from 'vitest'
import { Badge } from './badge'
import { DsRoot } from './ds-root'
import { OSuaChu, OSuaHan, OSuaNguoi, OSuaNhan, OSuaTrangThai } from './inline-edit'
import { thongBao } from './sonner'

// Giờ VN cho cả file (ô hạn): đặt trước mọi import.
const tzCu = vi.hoisted(() => {
  const cu = process.env.TZ
  process.env.TZ = 'Asia/Ho_Chi_Minh'
  return cu
})
afterAll(() => {
  if (tzCu === undefined) delete process.env.TZ
  else process.env.TZ = tzCu
})

// Toast thật (Sonner) chạy hẹn giờ — ở đây chỉ cần biết ô GỌI đúng thongBao + bấm được Hoàn tác.
vi.mock('./sonner', () => ({ thongBao: { xong: vi.fn(), loi: vi.fn(), dangChay: vi.fn(), dong: vi.fn() } }))
const xong = vi.mocked(thongBao.xong)
const loi = vi.mocked(thongBao.loi)
beforeEach(() => {
  xong.mockClear()
  loi.mockClear()
})
afterEach(() => vi.useRealTimers())

/** Dòng bảng giả: bấm/Enter trên dòng = mở bản ghi. Ô sửa không được để sự kiện nổi lên đây. */
const moDong = vi.fn()
function Dong({ children }: { children: ReactNode }) {
  moDong.mockClear()
  return (
    <DsRoot>
      <div role="row" tabIndex={0} onClick={moDong} onKeyDown={(e) => e.key === 'Enter' && moDong()}>
        {children}
      </div>
    </DsRoot>
  )
}

const UU = [
  { gt: 'P1', nhan: <Badge variant="solid" color="danger">Gấp</Badge>, chu: 'Gấp' },
  { gt: 'P2', nhan: <Badge color="warning">Cao</Badge>, chu: 'Cao' },
  { gt: 'P3', nhan: <Badge>Thường</Badge>, chu: 'Thường' },
]
const TT = [
  { gt: 'moi', nhan: 'Mới', color: 'discovery' as const },
  { gt: 'xu-ly', nhan: 'Đang xử lý', color: 'info' as const },
  { gt: 'cho', nhan: 'Chờ', color: 'warning' as const, hoiLyDo: true },
  { gt: 'dong', nhan: 'Đóng', color: 'success' as const },
]
const NGUOI = ['Hiệp', 'Hiền', 'Kiều Trang', 'Tuyết Trang', 'Như', 'Tuấn', 'Lan', 'Mai', 'Nam', 'Oanh', 'Phúc', 'Quang'].map(
  (nhan, i) => ({ gt: `NV${String(i + 1).padStart(2, '0')}`, nhan }),
)

const nut = (ten: string) => screen.getByRole('button', { name: ten })
const choXong = () => new Promise<void>((r) => setTimeout(r, 0))

// ---------- OSuaNhan ----------

test('OSuaNhan: nút "Sửa ưu tiên <mã>" mở menu radio; chọn → lưu lạc quan, toast có Hoàn tác, đóng, focus về ô, không mở dòng', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  render(
    <Dong>
      <OSuaNhan ma="TK-1" truong="ưu tiên" value="P1" muc={UU} onLuu={onLuu} />
    </Dong>,
  )
  const o = nut('Sửa ưu tiên TK-1')
  expect(o.getAttribute('aria-haspopup')).toBe('menu')
  expect(o.getAttribute('aria-expanded')).toBe('false')
  expect(o.textContent).toBe('Gấp')
  // tên = trường + mã (README); giá trị đang có đọc qua mô tả (aria-label đè chữ bên trong nút)
  expect(screen.getByRole('button', { name: 'Sửa ưu tiên TK-1', description: 'Gấp' })).toBe(o)
  await user.click(o)
  const menu = await screen.findByRole('menu')
  expect(menu.closest('[data-ds="v2"]')).not.toBeNull()
  expect(o.getAttribute('aria-expanded')).toBe('true')
  const muc = screen.getAllByRole('menuitemradio')
  expect(muc.map((m) => m.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false'])
  await user.click(screen.getByRole('menuitemradio', { name: 'Cao' }))
  expect(onLuu).toHaveBeenCalledWith('P2')
  expect(o.textContent).toBe('Cao')
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  expect(document.activeElement).toBe(o)
  await waitFor(() => expect(xong).toHaveBeenCalledTimes(1))
  expect(xong.mock.calls[0][0]).toBe('TK-1: ưu tiên → Cao')
  expect(typeof xong.mock.calls[0][1]?.hoanTac).toBe('function')
  expect(moDong).not.toHaveBeenCalled()
})

test('OSuaNhan: Esc đóng menu, focus về ô, không lưu; Enter trên ô mở menu chứ không mở dòng', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  render(
    <Dong>
      <OSuaNhan ma="TK-1" truong="ưu tiên" value="P1" muc={UU} onLuu={onLuu} />
    </Dong>,
  )
  const o = nut('Sửa ưu tiên TK-1')
  o.focus()
  await user.keyboard('{Enter}')
  await screen.findByRole('menu')
  await user.keyboard('{ArrowDown}{Escape}')
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  expect(document.activeElement).toBe(o)
  expect(onLuu).not.toHaveBeenCalled()
  expect(xong).not.toHaveBeenCalled()
  expect(moDong).not.toHaveBeenCalled()
})

test('Hoàn tác: gọi onLuu với giá trị cũ, ô hiện lại giá trị cũ', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  render(
    <Dong>
      <OSuaNhan ma="TK-1" truong="ưu tiên" value="P1" muc={UU} onLuu={onLuu} />
    </Dong>,
  )
  const o = nut('Sửa ưu tiên TK-1')
  await user.click(o)
  await user.click(await screen.findByRole('menuitemradio', { name: 'Thường' }))
  await waitFor(() => expect(xong).toHaveBeenCalled())
  expect(o.textContent).toBe('Thường')
  await act(async () => {
    await xong.mock.calls[0][1]!.hoanTac!()
  })
  expect(onLuu).toHaveBeenLastCalledWith('P1')
  expect(o.textContent).toBe('Gấp')
})

test('lỗi khi lưu: ô trả giá trị cũ + thongBao.loi có Thử lại; không báo xong', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn().mockRejectedValue(new Error('mất mạng'))
  render(
    <Dong>
      <OSuaNhan ma="TK-1" truong="ưu tiên" value="P1" muc={UU} onLuu={onLuu} />
    </Dong>,
  )
  const o = nut('Sửa ưu tiên TK-1')
  await user.click(o)
  await user.click(await screen.findByRole('menuitemradio', { name: 'Cao' }))
  await waitFor(() => expect(loi).toHaveBeenCalledTimes(1))
  expect(o.textContent).toBe('Gấp')
  expect(loi.mock.calls[0][0]).toContain('TK-1')
  expect(loi.mock.calls[0][0]).toContain('mất mạng')
  expect(typeof loi.mock.calls[0][1]?.thuLai).toBe('function')
  expect(xong).not.toHaveBeenCalled()
})

test('giá trị từ ngoài đổi (dữ liệu tải lại) → ô theo giá trị mới', () => {
  const { rerender } = render(
    <Dong>
      <OSuaNhan ma="TK-1" truong="ưu tiên" value="P1" muc={UU} onLuu={() => {}} />
    </Dong>,
  )
  rerender(
    <Dong>
      <OSuaNhan ma="TK-1" truong="ưu tiên" value="P3" muc={UU} onLuu={() => {}} />
    </Dong>,
  )
  expect(nut('Sửa ưu tiên TK-1').textContent).toBe('Thường')
})

// ---------- OSuaTrangThai ----------

test('OSuaTrangThai: Badge soft theo màu + caret bên trong; chọn "Đang xử lý" → lưu, toast "TK-1 → Đang xử lý"', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  render(
    <Dong>
      <OSuaTrangThai ma="TK-1" value={{ tt: 'moi' }} muc={TT} onLuu={onLuu} />
    </Dong>,
  )
  const o = nut('Sửa trạng thái TK-1')
  const badge = o.querySelector('[data-slot="badge"]')!
  expect(badge.getAttribute('data-color')).toBe('discovery')
  expect(badge.getAttribute('data-variant')).toBe('soft')
  expect(badge.querySelector('[data-slot="badge-caret"]')).not.toBeNull()
  await user.click(o)
  await user.click(await screen.findByRole('menuitemradio', { name: 'Đang xử lý' }))
  expect(onLuu).toHaveBeenCalledWith({ tt: 'xu-ly' })
  await waitFor(() => expect(xong).toHaveBeenCalled())
  expect(xong.mock.calls[0][0]).toBe('TK-1 → Đang xử lý')
  expect(o.textContent).toBe('Đang xử lý')
  expect(moDong).not.toHaveBeenCalled()
})

test('OSuaTrangThai: chọn "Chờ" hỏi lý do (khách · KT · vật tư · hãng · duyệt), chọn "KT" → lưu cả lý do', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  render(
    <Dong>
      <OSuaTrangThai ma="TK-1" value={{ tt: 'moi' }} muc={TT} onLuu={onLuu} />
    </Dong>,
  )
  const o = nut('Sửa trạng thái TK-1')
  await user.click(o)
  await user.click(await screen.findByRole('menuitemradio', { name: /^Chờ/ }))
  expect(onLuu).not.toHaveBeenCalled()
  await waitFor(() =>
    expect(screen.getAllByRole('menuitemradio').map((m) => m.textContent)).toEqual([
      'Chờ khách',
      'Chờ KT',
      'Chờ vật tư',
      'Chờ hãng',
      'Chờ duyệt',
    ]),
  )
  // focus dời vào mục lý do đầu — bàn phím đi tiếp được
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Chờ khách'))
  await user.keyboard('{ArrowDown}{Enter}')
  expect(onLuu).toHaveBeenCalledWith({ tt: 'cho', lyDo: 'KT' })
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  expect(o.textContent).toBe('Chờ · KT')
  await waitFor(() => expect(xong).toHaveBeenCalled())
  expect(xong.mock.calls[0][0]).toBe('TK-1 → Chờ KT')
  expect(document.activeElement).toBe(o)
})

test('OSuaTrangThai: đang "Chờ vật tư" → bước lý do focus "Chờ vật tư" (đang chọn ✓); "Quay lại"; Esc huỷ, focus về ô', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  render(
    <Dong>
      <OSuaTrangThai ma="TK-1" value={{ tt: 'cho', lyDo: 'vật tư' }} muc={TT} onLuu={onLuu} />
    </Dong>,
  )
  const o = nut('Sửa trạng thái TK-1')
  expect(o.textContent).toBe('Chờ · vật tư')
  await user.click(o)
  await user.click(await screen.findByRole('menuitemradio', { name: /^Chờ/ }))
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Chờ vật tư'))
  expect(document.activeElement?.getAttribute('aria-checked')).toBe('true')
  await user.click(await screen.findByRole('menuitem', { name: 'Quay lại' }))
  await waitFor(() => expect(screen.getByRole('menuitemradio', { name: 'Đang xử lý' })).toBeTruthy())
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  expect(onLuu).not.toHaveBeenCalled()
  expect(document.activeElement).toBe(o)
})

// ---------- OSuaChu ----------

test('OSuaChu: bấm → ô nhập có sẵn chữ; Enter lưu (cắt khoảng trắng), focus về ô, không mở dòng', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  render(
    <Dong>
      <OSuaChu ma="TK-1" truong="việc tiếp theo" value="Gọi khách" onLuu={onLuu} />
    </Dong>,
  )
  await user.click(nut('Sửa việc tiếp theo TK-1'))
  const o = screen.getByRole('textbox', { name: 'Sửa việc tiếp theo TK-1' })
  expect(document.activeElement).toBe(o)
  expect((o as HTMLInputElement).value).toBe('Gọi khách')
  await user.clear(o)
  await user.type(o, '  Báo KT trưởng  {Enter}')
  expect(onLuu).toHaveBeenCalledWith('Báo KT trưởng')
  const sau = nut('Sửa việc tiếp theo TK-1')
  expect(sau.textContent).toBe('Báo KT trưởng')
  expect(document.activeElement).toBe(sau)
  await waitFor(() => expect(xong.mock.calls[0]?.[0]).toBe('TK-1: việc tiếp theo → Báo KT trưởng'))
  expect(moDong).not.toHaveBeenCalled()
})

test('OSuaChu: Esc huỷ (giữ chữ cũ, không lưu); rời ô thì lưu', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  render(
    <Dong>
      <OSuaChu ma="TK-1" truong="việc tiếp theo" value="Gọi khách" onLuu={onLuu} />
      <button type="button">khác</button>
    </Dong>,
  )
  await user.click(nut('Sửa việc tiếp theo TK-1'))
  await user.type(screen.getByRole('textbox'), ' lại{Escape}')
  expect(onLuu).not.toHaveBeenCalled()
  expect(nut('Sửa việc tiếp theo TK-1').textContent).toBe('Gọi khách')
  expect(document.activeElement).toBe(nut('Sửa việc tiếp theo TK-1'))
  expect(moDong).not.toHaveBeenCalled()

  await user.click(nut('Sửa việc tiếp theo TK-1'))
  await user.type(screen.getByRole('textbox'), ' lại')
  await user.click(nut('khác'))
  expect(onLuu).toHaveBeenCalledWith('Gọi khách lại')
  expect(nut('Sửa việc tiếp theo TK-1').textContent).toBe('Gọi khách lại')
})

test('OSuaChu: bộ gõ đang ghép chữ → Enter KHÔNG lưu; ghép xong Enter mới lưu', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  render(
    <Dong>
      <OSuaChu ma="TK-1" truong="việc tiếp theo" value="" onLuu={onLuu} />
    </Dong>,
  )
  await user.click(nut('Sửa việc tiếp theo TK-1'))
  const o = screen.getByRole('textbox')
  fireEvent.compositionStart(o)
  fireEvent.change(o, { target: { value: 'gọi kha' } })
  fireEvent.keyDown(o, { key: 'Enter', isComposing: true, keyCode: 229 })
  expect(onLuu).not.toHaveBeenCalled()
  expect(screen.getByRole('textbox')).toBe(o)
  fireEvent.compositionEnd(o, { data: 'gọi khách' })
  fireEvent.change(o, { target: { value: 'gọi khách' } })
  fireEvent.keyDown(o, { key: 'Enter' })
  expect(onLuu).toHaveBeenCalledWith('gọi khách')
})

test('OSuaChu: lỗi khi lưu → ô hiện lại chữ cũ + báo lỗi', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn().mockRejectedValue(new Error('hết phiên'))
  render(
    <Dong>
      <OSuaChu ma="TK-1" truong="việc tiếp theo" value="Gọi khách" onLuu={onLuu} />
    </Dong>,
  )
  await user.click(nut('Sửa việc tiếp theo TK-1'))
  await user.type(screen.getByRole('textbox'), ' gấp{Enter}')
  await waitFor(() => expect(loi).toHaveBeenCalled())
  expect(nut('Sửa việc tiếp theo TK-1').textContent).toBe('Gọi khách')
})

// ---------- OSuaHan ----------

test('OSuaHan (DateTimePicker gọn): chọn ngày giữ GIỜ cũ, đổi giờ được; chỉ lưu khi Xong; pop đóng, focus về ô, không mở dòng', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-20T09:00:00+07:00'))
  const user = userEvent.setup()
  const onLuu = vi.fn()
  render(
    <Dong>
      <OSuaHan ma="TK-1" value="2026-11-21 17:30" onLuu={onLuu} />
    </Dong>,
  )
  const o = screen.getByRole('button', { name: /^Sửa hạn TK-1/ })
  expect(o.textContent).toBe('21/11 17:30')
  await user.click(o)
  await screen.findByRole('dialog', { name: 'Chọn ngày giờ' })
  // Có ô GIỜ (CEO 27/11 "sao bảng chọn date ko có chỗ chọn giờ").
  expect(screen.getByLabelText('Giờ')).toBeTruthy()
  await user.click(screen.getByRole('button', { name: /^25\/11\/2026/ }))
  expect(onLuu).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Xong' }))
  expect(onLuu).toHaveBeenCalledWith('2026-11-25 17:30')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(o.textContent).toBe('25/11 17:30')
  expect(document.activeElement).toBe(o)
  await choXong()
  expect(moDong).not.toHaveBeenCalled()
})

test('OSuaHan: Esc huỷ, focus về ô, không lưu', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  render(
    <Dong>
      <OSuaHan ma="TK-1" value="2026-11-21T08:00:00+07:00" onLuu={onLuu} />
    </Dong>,
  )
  const o = screen.getByRole('button', { name: /^Sửa hạn TK-1/ })
  await user.click(o)
  await screen.findByRole('dialog', { name: 'Chọn ngày giờ' })
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(o)
  expect(onLuu).not.toHaveBeenCalled()
})

// ---------- OSuaNguoi ----------

test('OSuaNguoi: Combobox có tìm (>10 người); gõ không dấu, Enter chọn → lưu, toast, focus về ô', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  render(
    <Dong>
      <OSuaNguoi ma="TK-1" truong="người làm" value="NV01" options={NGUOI} onLuu={onLuu} />
    </Dong>,
  )
  const o = nut('Sửa người làm TK-1')
  expect(o.textContent).toContain('Hiệp')
  await user.click(o)
  const tim = await screen.findByRole('combobox')
  await waitFor(() => expect(document.activeElement).toBe(tim))
  await user.keyboard('kieu')
  await waitFor(() => expect(screen.getAllByRole('option').map((m) => m.textContent)).toEqual(['NV03Kiều Trang']))
  await user.keyboard('{Enter}')
  expect(onLuu).toHaveBeenCalledWith('NV03')
  await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
  expect(o.textContent).toContain('Kiều Trang')
  expect(document.activeElement).toBe(o)
  await waitFor(() => expect(xong.mock.calls[0]?.[0]).toBe('TK-1: người làm → Kiều Trang'))
  expect(moDong).not.toHaveBeenCalled()
})

test('OSuaNguoi gọn (ô < 112px): chỉ avatar, tên đọc qua mô tả; Esc huỷ, focus về ô', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  render(
    <Dong>
      <OSuaNguoi ma="TK-1" truong="chủ ticket" value="NV02" options={NGUOI} onLuu={onLuu} gon />
    </Dong>,
  )
  const o = screen.getByRole('button', { name: 'Sửa chủ ticket TK-1', description: 'Hiền' })
  expect(o.textContent).toBe('HHiền') // chữ cái avatar + tên ẩn nhìn (sr-only) làm mô tả
  expect(o.getAttribute('data-gon')).toBe('')
  await user.click(o)
  await screen.findByRole('combobox')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
  expect(document.activeElement).toBe(o)
  expect(onLuu).not.toHaveBeenCalled()
})

test('OSuaNguoi tìm phía server: chọn A rồi B, Hoàn tác của B → ô hiện TÊN của A (không phải mã)', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  const tim = async (q: string) => NGUOI.filter((m) => m.nhan.toLowerCase().includes(q.toLowerCase()))
  render(
    <Dong>
      <OSuaNguoi ma="TK-1" truong="người làm" value="NV01" tim={tim} mucDangChon={NGUOI[0]} onLuu={onLuu} />
    </Dong>,
  )
  const o = nut('Sửa người làm TK-1')
  const chon = async (go: string, ten: string) => {
    await user.click(o)
    await screen.findByRole('combobox')
    await user.keyboard(go)
    await user.click(await screen.findByRole('option', { name: new RegExp(ten) }))
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
  }
  await chon('kiều', 'Kiều Trang')
  await waitFor(() => expect(xong).toHaveBeenCalledTimes(1))
  expect(xong.mock.calls[0][0]).toBe('TK-1: người làm → Kiều Trang')
  await chon('như', 'Như')
  await waitFor(() => expect(xong).toHaveBeenCalledTimes(2))
  expect(xong.mock.calls[1][0]).toBe('TK-1: người làm → Như')
  expect(o.textContent).toContain('Như')
  await act(async () => {
    await xong.mock.calls[1][1]!.hoanTac!()
  })
  expect(onLuu).toHaveBeenLastCalledWith('NV03')
  expect(o.textContent).toContain('Kiều Trang')
})
