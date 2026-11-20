// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import { DsRoot } from './ds-root'
import { OSuaKhach } from './inline-edit'
import { RecordPicker, type BanGhi } from './record-picker'
import { thongBao } from './toast'

vi.mock('./toast', () => ({ thongBao: { xong: vi.fn(), loi: vi.fn(), dangChay: vi.fn(), dong: vi.fn() } }))
const xong = vi.mocked(thongBao.xong)
beforeEach(() => xong.mockClear())

// Dữ liệu demo — tên giả, SĐT giả (đưa vào ĐỦ để kiểm component không bao giờ in ra đủ).
const KHACH: BanGhi[] = [
  { ma: 'KH-01001', ten: 'Bùi Demo Tâm', loai: 'Cá nhân', khuVuc: 'Q.7', sdt: '0900001000', may: 'WH15A', phai: '1 ticket mở' },
  { ma: 'KH-01008', ten: 'Cao Demo Tuấn', loai: 'Cá nhân', khuVuc: 'Thủ Đức', sdt: '0900003731', may: 'WH15A', phai: 'không ticket mở' },
  { ma: 'KH-01015', ten: 'Công ty Demo An Phát', loai: 'Doanh nghiệp', khuVuc: 'Bình Thạnh', sdt: '0911234567', may: 'CTD50 · D50-2304-0077', phai: '2 ticket mở', luuY: true },
  { ma: 'KH-01022', ten: 'Công ty Demo Minh Phát', loai: 'Doanh nghiệp', khuVuc: 'Q.1', sdt: '0900009193', may: 'CTD50', phai: '1 ticket mở' },
  { ma: 'KH-01029', ten: 'Đặng Demo Hà', loai: 'Cá nhân', khuVuc: 'Gò Vấp', sdt: '+84 900 005 502', may: 'WH15A · W15-2201-0003', phai: 'không ticket mở' },
]

function Mo({ onChon = vi.fn(), onTaoMoi = vi.fn(), value }: { onChon?: (b: BanGhi) => void; onTaoMoi?: (q: string) => void; value?: string }) {
  return (
    <DsRoot>
      <RecordPicker muc={KHACH} value={value} onChon={onChon} onTaoMoi={onTaoMoi} />
    </DsRoot>
  )
}

const oTim = () => screen.getByRole('combobox', { name: 'Tìm khách' })
const muc = () => screen.queryAllByRole('option')
const dem = () => screen.getByText(/khách( khớp)? · Enter chọn dòng đầu$/).textContent

test('đếm "5 khách"; mỗi mục 3 dòng: tên + ghi chú phải · mã · loại · khu · SĐT •••4 số · máy', async () => {
  render(<Mo value="KH-01015" />)
  expect(oTim().getAttribute('placeholder')).toBe('Tên, mã KH, 4 số cuối SĐT, serial…')
  expect(dem()).toBe('5 khách · Enter chọn dòng đầu')
  expect(screen.getByRole('listbox', { name: 'Khách hàng' })).toBeTruthy()
  const ap = muc()[2]
  expect(ap.textContent).toContain('Công ty Demo An Phát')
  expect(ap.textContent).toContain('2 ticket mở')
  expect(ap.textContent).toContain('KH-01015 · Doanh nghiệp · Bình Thạnh · SĐT •••4567')
  expect(ap.textContent).toContain('CTD50 · D50-2304-0077')
  expect(ap.querySelector('[aria-label="Có lưu ý"]')).not.toBeNull()
  // mục đang chọn: ✓ + chữ cho trình đọc màn hình
  expect(ap.getAttribute('data-checked')).toBe('true')
  expect(ap.textContent).toContain('(đang chọn)')
  expect(muc()[0].getAttribute('data-checked')).toBeNull()
})

test('KHÔNG BAO GIỜ render SĐT đủ — chỉ 4 số cuối (cả chữ lẫn thuộc tính)', () => {
  const { container } = render(<Mo />)
  const html = container.ownerDocument.body.innerHTML
  for (const k of KHACH) {
    const so = k.sdt!.replace(/\D/g, '')
    expect(html).not.toContain(k.sdt!)
    expect(html).not.toContain(so)
    expect(html).not.toContain(so.slice(0, -4))
    expect(html).toContain(`•••${so.slice(-4)}`)
  }
})

test('khớp không dấu: "an phat" → An Phát; đếm "1 khách khớp"', async () => {
  const user = userEvent.setup()
  render(<Mo />)
  await user.type(oTim(), 'an phat')
  await waitFor(() => expect(muc().map((m) => m.querySelector('[data-slot="record-picker-ten"]')?.textContent)).toEqual(['Công ty Demo An Phát']))
  expect(dem()).toBe('1 khách khớp · Enter chọn dòng đầu')
})

test('khớp theo mã, 4 số cuối SĐT, khu vực, serial', async () => {
  const user = userEvent.setup()
  render(<Mo />)
  const ten = () => muc().map((m) => m.querySelector('[data-slot="record-picker-ten"]')?.textContent)
  await user.type(oTim(), 'kh-01008')
  await waitFor(() => expect(ten()).toEqual(['Cao Demo Tuấn']))
  await user.clear(oTim())
  await user.type(oTim(), '5502')
  await waitFor(() => expect(ten()).toEqual(['Đặng Demo Hà']))
  await user.clear(oTim())
  await user.type(oTim(), 'thu duc')
  await waitFor(() => expect(ten()).toEqual(['Cao Demo Tuấn']))
  await user.clear(oTim())
  await user.type(oTim(), 'd50-2304')
  await waitFor(() => expect(ten()).toEqual(['Công ty Demo An Phát']))
  // chỉ khớp phần SĐT hiển thị: đầu số bị che không khớp
  await user.clear(oTim())
  await user.type(oTim(), '091123')
  await waitFor(() => expect(muc()).toHaveLength(0))
  expect(screen.getByText('Không thấy khách "091123"')).toBeTruthy()
})

test('Enter chọn dòng đầu; ↓ rồi Enter chọn dòng hai; listbox/option aria-selected theo mục sáng', async () => {
  const user = userEvent.setup()
  const onChon = vi.fn()
  render(<Mo onChon={onChon} />)
  await user.type(oTim(), 'cong ty')
  await waitFor(() => expect(muc()).toHaveLength(2))
  await waitFor(() => expect(muc()[0].getAttribute('aria-selected')).toBe('true'))
  await waitFor(() => expect(oTim().getAttribute('aria-activedescendant')).toBe(muc()[0].id))
  await user.keyboard('{Enter}')
  expect(onChon).toHaveBeenLastCalledWith(KHACH[2])
  await user.keyboard('{ArrowDown}')
  await waitFor(() => expect(muc()[1].getAttribute('aria-selected')).toBe('true'))
  expect(muc()[0].getAttribute('aria-selected')).toBe('false')
  await user.keyboard('{Enter}')
  expect(onChon).toHaveBeenLastCalledWith(KHACH[3])
})

test('bộ gõ đang ghép chữ: Enter KHÔNG chọn; ghép xong mới lọc và Enter chọn', async () => {
  const user = userEvent.setup()
  const onChon = vi.fn()
  render(<Mo onChon={onChon} />)
  const o = oTim()
  await user.click(o)
  fireEvent.compositionStart(o)
  fireEvent.change(o, { target: { value: 'đặ' } })
  await user.keyboard('{Enter}')
  expect(onChon).not.toHaveBeenCalled()
  expect(muc()).toHaveLength(5)
  fireEvent.compositionEnd(o, { data: 'đặng' })
  fireEvent.change(o, { target: { value: 'đặng' } })
  await waitFor(() => expect(muc()).toHaveLength(1))
  await waitFor(() => expect(muc()[0].getAttribute('aria-selected')).toBe('true'))
  await user.keyboard('{Enter}')
  expect(onChon).toHaveBeenLastCalledWith(KHACH[4])
})

test('chân "+ Tạo khách mới "<chữ đang gõ>"" luôn thấy, gọi onTaoMoi với chữ đang gõ', async () => {
  const user = userEvent.setup()
  const onTaoMoi = vi.fn()
  render(<Mo onTaoMoi={onTaoMoi} />)
  expect(screen.getByRole('button', { name: 'Tạo khách mới' })).toBeTruthy()
  await user.type(oTim(), 'Demo Mới')
  await user.click(screen.getByRole('button', { name: 'Tạo khách mới "Demo Mới"' }))
  expect(onTaoMoi).toHaveBeenCalledWith('Demo Mới')
})

test('tìm xa: gõ đủ ký tự → gọi tim, hiện kết quả, đếm "N khách khớp"', async () => {
  const user = userEvent.setup()
  const tim = vi.fn(async (q: string) => KHACH.filter((k) => k.ten.toLowerCase().includes(q.toLowerCase())))
  render(
    <DsRoot>
      <RecordPicker tim={tim} onChon={() => {}} />
    </DsRoot>,
  )
  expect(screen.getByText(/Gõ ít nhất 2 ký tự/)).toBeTruthy()
  await user.type(oTim(), 'demo h')
  await waitFor(() => expect(muc()).toHaveLength(1), { timeout: 2000 })
  expect(dem()).toBe('1 khách khớp · Enter chọn dòng đầu')
  expect(tim).toHaveBeenLastCalledWith('demo h')
})

// ---------- ô khách của InlineEdit (RecordPicker trong pop) ----------

test('OSuaKhach: bấm ô mở bảng chọn khách; Enter chọn → lưu, toast Hoàn tác, focus về ô; Esc huỷ', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  const moDong = vi.fn()
  render(
    <DsRoot>
      <div role="row" onClick={moDong}>
        <OSuaKhach ma="TK-1" value={KHACH[0]} muc={KHACH} onLuu={onLuu} onTaoMoi={() => {}} />
      </div>
    </DsRoot>,
  )
  const o = screen.getByRole('button', { name: 'Sửa khách TK-1', description: 'Bùi Demo Tâm' })
  await user.click(o)
  const pop = await screen.findByRole('dialog', { name: 'Chọn khách' })
  expect(pop.closest('[data-ds="v2"]')).not.toBeNull()
  await waitFor(() => expect(document.activeElement).toBe(oTim()))
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(o)
  expect(onLuu).not.toHaveBeenCalled()

  await user.click(o)
  await waitFor(() => expect(document.activeElement).toBe(oTim()))
  await user.keyboard('an phat{Enter}')
  expect(onLuu).toHaveBeenCalledWith(KHACH[2])
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(o.textContent).toContain('Công ty Demo An Phát')
  expect(o.querySelector('[aria-label="Khách có lưu ý"]')).not.toBeNull()
  expect(document.activeElement).toBe(o)
  await waitFor(() => expect(xong.mock.calls[0]?.[0]).toBe('TK-1: khách → Công ty Demo An Phát'))
  expect(moDong).not.toHaveBeenCalled()
})

// ---------- mặt vẽ tĩnh (khối /ds) ----------

test('tinh: mặt nằm sẵn trên trang KHÔNG gọi scrollIntoView (cmdk 1.1.1 cuộn cả cửa sổ tới mục sáng lúc mount), inert, cùng nội dung', () => {
  const cuon = vi.fn()
  const goc = Element.prototype.scrollIntoView
  Element.prototype.scrollIntoView = cuon
  try {
    const { container } = render(
      <DsRoot>
        <RecordPicker tinh muc={KHACH} value="KH-01015" defaultSearch="cong ty" onChon={() => {}} onTaoMoi={() => {}} />
      </DsRoot>,
    )
    expect(cuon).not.toHaveBeenCalled()
    const goc2 = container.querySelector('[data-slot="record-picker"]')!
    expect(goc2.hasAttribute('inert')).toBe(true)
    expect(goc2.querySelectorAll('[cmdk-item]')).toHaveLength(2)
    expect(goc2.textContent).toContain('2 khách khớp · Enter chọn dòng đầu')
    expect(goc2.textContent).toContain('KH-01015 · Doanh nghiệp · Bình Thạnh · SĐT •••4567')
    expect(goc2.textContent).toContain('Tạo khách mới "cong ty"')
    expect(goc2.innerHTML).not.toContain('0911234567')
  } finally {
    Element.prototype.scrollIntoView = goc
  }
})
