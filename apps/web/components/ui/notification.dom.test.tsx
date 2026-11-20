// @vitest-environment jsdom
import { afterAll, expect, test, vi } from 'vitest'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { DsRoot } from './ds-root'
import { NotificationCenter, type ThongBaoMuc } from './notification-center'
import {
  NotificationMatrix,
  type GiaTriMaTran,
  type KenhThongBao,
  type LoaiThongBao,
  type ThayDoiThongBao,
} from './notification-matrix'

// Múi giờ máy = UTC CỐ Ý (không phải giờ VN): nhóm ngày phải theo giờ VN dù máy/CI chạy múi nào. Lúc 00:30 giờ VN
// ngày 18 thì máy UTC đang là 17:30 ngày 17 — tính bằng giờ máy sẽ xếp sai cả ba nhóm.
const tzCu = vi.hoisted(() => {
  const cu = process.env.TZ
  process.env.TZ = 'UTC'
  return cu
})
afterAll(() => {
  if (tzCu === undefined) delete process.env.TZ
  else process.env.TZ = tzCu
})

/* ---------------- NotificationCenter ---------------- */

const BAY_GIO = '2026-11-18T15:47:00+07:00'
const DS: ThongBaoMuc[] = [
  { id: 'a', loai: 'giao', ai: 'Minh', noi: 'giao việc cho bạn:', dt: 'Gọi lại Công ty Demo An Phát', khu: 'Việc', luc: '2026-11-18T15:42:00+07:00', doc: false, quaDiscord: true },
  { id: 'b', loai: 'nhac', ai: 'Lan', noi: 'nhắc bạn trong', dt: 'TK-DEMO-042', trich: 'Khách gửi ảnh rồi', khu: 'CSKH', luc: '2026-11-18T15:29:00+07:00', doc: false },
  { id: 'c', loai: 'han', noi: 'Việc tiếp theo tới hạn:', dt: 'Chờ duyệt (TK-DEMO-039)', khu: 'CSKH', luc: '2026-11-18T13:00:00+07:00', doc: true },
  { id: 'd', loai: 'lau', noi: 'Ticket mở quá 7 ngày:', dt: 'TK-DEMO-028', khu: 'CSKH', luc: '2026-11-17T08:00:00+07:00', doc: true },
]

function Mau({
  ds: dau = DS,
  bayGio = BAY_GIO,
  onMo,
  onCauHinh = () => {},
  onDocHet,
}: {
  ds?: ThongBaoMuc[]
  bayGio?: string
  onMo?: (t: ThongBaoMuc) => void
  onCauHinh?: () => void
  onDocHet?: (ids: string[]) => void
}) {
  const [ds, setDs] = useState(dau)
  return (
    <DsRoot>
      <button type="button">Trước chuông</button>
      <NotificationCenter
        thongBao={ds}
        bayGio={bayGio}
        onDoc={(id, doc) => setDs((d) => d.map((t) => (t.id === id ? { ...t, doc } : t)))}
        onDocHet={(ids) => {
          onDocHet?.(ids)
          setDs((d) => d.map((t) => (ids.includes(t.id) ? { ...t, doc: true } : t)))
        }}
        onCauHinh={onCauHinh}
        onMo={onMo}
      />
      <button type="button">Sau chuông</button>
    </DsRoot>
  )
}

const chuong = () => screen.getByRole('button', { name: /^Thông báo/ })
const mo = async (u: ReturnType<typeof userEvent.setup>) => {
  await u.click(chuong())
  return screen.findByRole('dialog', { name: 'Thông báo' })
}

test('chuông: tên đọc kèm số chưa đọc, aria-haspopup dialog, aria-expanded theo hộp', async () => {
  const u = userEvent.setup()
  render(<Mau />)
  expect(chuong().getAttribute('aria-label')).toBe('Thông báo, 2 chưa đọc')
  expect(chuong().getAttribute('aria-haspopup')).toBe('dialog')
  expect(chuong().getAttribute('aria-expanded')).toBe('false')
  await mo(u)
  expect(chuong().getAttribute('aria-expanded')).toBe('true')
})

test('mở → hộp không chặn (không aria-modal) trong vùng DS, focus vào tab đang chọn', async () => {
  const u = userEvent.setup()
  render(<Mau />)
  const hop = await mo(u)
  expect(hop.getAttribute('aria-modal')).toBeNull()
  expect(hop.closest('[data-ds="v2"]')).not.toBeNull()
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Tất cả' })))
})

test('Esc → đóng, focus về chuông', async () => {
  const u = userEvent.setup()
  render(<Mau />)
  await mo(u)
  await u.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(chuong())
})

test('Shift+Tab ở đầu hộp → đóng, focus về chuông; Tab ở cuối → đóng, sang phần tử kế sau chuông', async () => {
  const u = userEvent.setup()
  render(<Mau />)
  await mo(u)
  // tab đang chọn → Shift+Tab về "Cấu hình", "Đọc hết", rồi chốt đầu hộp
  screen.getByRole('button', { name: 'Đọc hết' }).focus()
  await u.tab({ shift: true })
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(chuong())

  await mo(u)
  const nut = screen.getAllByRole('button', { name: /^Đánh dấu/ })
  nut[nut.length - 1].focus()
  await u.tab()
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Sau chuông' }))
})

test('tab theo APG: ←/→ chuyển + chọn, Home/End; tab Chưa đọc mang số', async () => {
  const u = userEvent.setup()
  render(<Mau />)
  await mo(u)
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Tất cả' })))
  await u.keyboard('{ArrowRight}')
  const chua = screen.getByRole('tab', { name: 'Chưa đọc 2' })
  expect(document.activeElement).toBe(chua)
  expect(chua.getAttribute('aria-selected')).toBe('true')
  await u.keyboard('{Home}')
  expect(screen.getByRole('tab', { name: 'Tất cả' }).getAttribute('aria-selected')).toBe('true')
  await u.keyboard('{End}')
  expect(chua.getAttribute('aria-selected')).toBe('true')
})

test('dòng: "Chưa đọc." cho trình đọc, nút đánh dấu có tên "Đánh dấu đã đọc: …" / "Đánh dấu chưa đọc: …"', async () => {
  const u = userEvent.setup()
  render(<Mau />)
  await mo(u)
  screen.getByRole('button', { name: 'Đánh dấu đã đọc: Minh giao việc cho bạn: Gọi lại Công ty Demo An Phát' })
  screen.getByRole('button', { name: 'Đánh dấu chưa đọc: Ticket mở quá 7 ngày: TK-DEMO-028' })
  const dong = screen.getByRole('button', { name: /^Chưa đọc\.\s*Minh\s*giao việc/ })
  // jsdom cắt khoảng trắng đầu/cuối từng phần tử khi tính tên; trình duyệt đọc đủ "Chưa đọc. Minh giao việc…"
  expect(dong.textContent?.startsWith('Chưa đọc. Minh giao việc cho bạn: Gọi lại')).toBe(true)
  expect(dong.textContent).toContain('Việc · 5 phút · qua Discord')
})

test('tab Chưa đọc: dòng vừa đọc ở yên chỗ tới khi đổi tab', async () => {
  const u = userEvent.setup()
  render(<Mau />)
  await mo(u)
  await u.click(screen.getByRole('tab', { name: /Chưa đọc/ }))
  const pn = () => screen.getByRole('tabpanel')
  expect(within(pn()).getAllByRole('listitem')).toHaveLength(2)
  await u.click(screen.getByRole('button', { name: /^Đánh dấu đã đọc: Lan/ }))
  // đã đọc nhưng vẫn ở chỗ cũ, nút đổi thành "Đánh dấu chưa đọc"
  expect(within(pn()).getAllByRole('listitem')).toHaveLength(2)
  within(pn()).getByRole('button', { name: /^Đánh dấu chưa đọc: Lan/ })
  await u.click(screen.getByRole('tab', { name: 'Tất cả' }))
  await u.click(screen.getByRole('tab', { name: /Chưa đọc/ }))
  expect(within(pn()).getAllByRole('listitem')).toHaveLength(1)
})

test('"Đọc hết" chỉ đánh dấu thông báo đang hiện (loại tắt Trong app không bị đọc hộ), focus về tab đang chọn', async () => {
  const u = userEvent.setup()
  const onDocHet = vi.fn()
  // Bên gọi lọc bỏ loại đã tắt cột Trong app ("gap") trước khi đưa vào — "Đọc hết" không được đụng tới nó.
  const kho: ThongBaoMuc[] = [...DS, { id: 'z', loai: 'gap', noi: 'Ticket Gấp:', khu: 'CSKH', luc: '2026-11-18T15:00:00+07:00', doc: false }]
  render(<Mau ds={kho.filter((t) => t.loai !== 'gap')} onDocHet={onDocHet} />)
  await mo(u)
  await u.click(screen.getByRole('button', { name: 'Đọc hết' }))
  expect(onDocHet).toHaveBeenCalledWith(['a', 'b'])
  expect(screen.getByRole('button', { name: 'Đọc hết' }).hasAttribute('disabled')).toBe(true)
  expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Tất cả' }))
  expect(chuong().getAttribute('aria-label')).toBe('Thông báo')
})

test('bấm dòng → đánh dấu đã đọc, đóng hộp, mở bản ghi', async () => {
  const u = userEvent.setup()
  const onMo = vi.fn()
  render(<Mau onMo={onMo} />)
  await mo(u)
  await u.click(screen.getByRole('button', { name: /^Chưa đọc\.\s*Lan\s*nhắc bạn/ }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(onMo).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }))
  expect(chuong().getAttribute('aria-label')).toBe('Thông báo, 1 chưa đọc')
})

test('⚙ → đóng hộp, gọi onCauHinh', async () => {
  const u = userEvent.setup()
  const onCauHinh = vi.fn()
  render(<Mau onCauHinh={onCauHinh} />)
  await mo(u)
  await u.click(screen.getByRole('button', { name: 'Cấu hình thông báo' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(onCauHinh).toHaveBeenCalledOnce()
})

test('thông báo mới đến (cả khi hộp đóng) → số tăng + câu đọc qua role="status"; lần đầu nạp không đọc', () => {
  const { rerender } = render(
    <DsRoot>
      <NotificationCenter thongBao={DS} bayGio={BAY_GIO} onDoc={() => {}} onDocHet={() => {}} onCauHinh={() => {}} />
    </DsRoot>,
  )
  const st = screen.getByRole('status')
  expect(st.textContent).toBe('')
  const moi: ThongBaoMuc = { id: 'n', loai: 'nhac', ai: 'Minh', noi: 'nhắc bạn trong', dt: 'TK-DEMO-050', khu: 'CSKH', luc: BAY_GIO, doc: false }
  act(() =>
    rerender(
      <DsRoot>
        <NotificationCenter thongBao={[moi, ...DS]} bayGio={BAY_GIO} onDoc={() => {}} onDocHet={() => {}} onCauHinh={() => {}} />
      </DsRoot>,
    ),
  )
  expect(screen.getByRole('status').textContent).toBe('Thông báo mới: Minh nhắc bạn trong TK-DEMO-050')
  expect(chuong().getAttribute('aria-label')).toBe('Thông báo, 3 chưa đọc')
})

test('nhóm Hôm nay / Hôm qua / Cũ hơn theo giờ VN — đúng cả lúc 00:30 (máy chạy UTC)', async () => {
  const u = userEvent.setup()
  const ds: ThongBaoMuc[] = [
    { id: '1', loai: 'giao', noi: 'Vừa nhận', khu: 'Việc', luc: '2026-11-18T00:10:00+07:00', doc: true },
    { id: '2', loai: 'giao', noi: 'Tối qua', khu: 'Việc', luc: '2026-11-17T23:50:00+07:00', doc: true },
    { id: '3', loai: 'giao', noi: 'Hôm kia', khu: 'Việc', luc: '2026-11-16T10:00:00+07:00', doc: true },
  ]
  render(<Mau ds={ds} bayGio="2026-11-18T00:30:00+07:00" />)
  await mo(u)
  const nhom = (ten: string) => within(screen.getByRole('group', { name: ten })).getByRole('listitem').textContent
  expect(nhom('Hôm nay')).toContain('Vừa nhận')
  expect(nhom('Hôm nay')).toContain('20 phút')
  expect(nhom('Hôm qua')).toContain('Tối qua')
  expect(nhom('Hôm qua')).toContain('Hôm qua 23:50')
  expect(nhom('Cũ hơn')).toContain('Hôm kia')
  expect(nhom('Cũ hơn')).toContain('16/11')
  expect(screen.getByText('20 phút').getAttribute('title')).toBe('18/11/2026 00:10')
})

test('rỗng: tab Chưa đọc khi đã đọc hết → EmptyState, panel focus được', async () => {
  const u = userEvent.setup()
  render(<Mau ds={DS.map((t) => ({ ...t, doc: true }))} />)
  await mo(u)
  await u.click(screen.getByRole('tab', { name: 'Chưa đọc' }))
  screen.getByRole('heading', { name: 'Đã đọc hết' })
  expect(screen.getByRole('tabpanel').getAttribute('tabindex')).toBe('0')
})

/* ---------------- NotificationMatrix ---------------- */

const KENH: KenhThongBao[] = [
  { id: 'app', ten: 'Trong app' },
  { id: 'rieng', ten: 'Discord · tin riêng' },
  { id: 'kenh', ten: 'Discord · kênh', luaChon: ['#viec', '#cskh'] },
]
const LOAI: LoaiThongBao[] = [
  { id: 'giao', khu: 'Việc', ten: 'Được giao việc', guiCho: 'Người được giao' },
  { id: 'quahan', khu: 'Việc', ten: 'Quá hạn', guiCho: 'Người làm và người giao' },
  { id: 'gap', khu: 'CSKH', ten: 'Ticket Gấp chưa ai nhận', guiCho: 'Cả khu CSKH' },
]
const GT: GiaTriMaTran = {
  giao: { app: { bat: true }, rieng: { bat: true } },
  quahan: { app: { bat: true }, rieng: { bat: true }, kenh: { bat: false, chon: '#viec' } },
  gap: { app: { bat: true }, kenh: { bat: true, chon: '#cskh' } },
}

function MaTran({ onLuu }: { onLuu?: (t: ThayDoiThongBao) => void | Promise<unknown> }) {
  const [gt, setGt] = useState(GT)
  return (
    <DsRoot>
      <NotificationMatrix loai={LOAI} kenh={KENH} giaTri={gt} onDoi={setGt} onLuu={onLuu} />
    </DsRoot>
  )
}

test('ma trận: caption ẩn, tiêu đề cột/hàng/nhóm đúng scope', () => {
  render(<MaTran />)
  const bang = screen.getByRole('table', { name: 'Cấu hình thông báo: loại thông báo theo kênh nhận' })
  expect(bang.querySelector('caption')?.className).toContain('sr-only')
  expect(screen.getByRole('columnheader', { name: 'Trong app' }).getAttribute('scope')).toBe('col')
  expect(screen.getByRole('rowheader', { name: /^Được giao việc/ }).getAttribute('scope')).toBe('row')
  expect(screen.getByText('CSKH').closest('th')?.getAttribute('scope')).toBe('rowgroup')
  expect(bang.querySelectorAll('tbody')).toHaveLength(2)
})

test('ma trận: mỗi ô tên đọc = kênh + loại, mô tả "Gửi cho: …"; ô không áp dụng ghi rõ', () => {
  render(<MaTran />)
  const o = screen.getByRole('checkbox', { name: 'Trong app Được giao việc', description: 'Gửi cho: Người được giao' })
  expect(o.getAttribute('aria-checked')).toBe('true')
  screen.getByRole('checkbox', { name: 'Discord · kênh Quá hạn' })
  // giao × kênh, gap × tin riêng: không áp dụng
  expect(screen.getAllByText('Không áp dụng')).toHaveLength(2)
  expect(screen.queryByRole('checkbox', { name: 'Discord · kênh Được giao việc' })).toBeNull()
})

test('ma trận: bấm là lưu — onDoi giá trị mới, onLuu đúng thay đổi, role="status" báo "Đã lưu: …"', async () => {
  const u = userEvent.setup()
  const onLuu = vi.fn()
  render(<MaTran onLuu={onLuu} />)
  const st = screen.getByRole('status')
  expect(st.textContent).toBe('Bấm là lưu — không có nút Lưu.')
  await u.click(screen.getByRole('checkbox', { name: 'Trong app Được giao việc' }))
  expect(onLuu).toHaveBeenCalledWith({ loai: 'giao', kenh: 'app', bat: false })
  expect(screen.getByRole('checkbox', { name: 'Trong app Được giao việc' }).getAttribute('aria-checked')).toBe('false')
  await waitFor(() => expect(st.textContent).toBe('Đã lưu: tắt Trong app — Được giao việc'))
})

test('ma trận: chọn kênh Discord tắt khi bỏ tick, bật lại thì chọn được', async () => {
  const u = userEvent.setup()
  const onLuu = vi.fn()
  render(<MaTran onLuu={onLuu} />)
  const chon = () => screen.getByRole('combobox', { name: 'Kênh Discord cho “Quá hạn”: #viec' })
  expect(chon().hasAttribute('disabled')).toBe(true)
  await u.click(screen.getByRole('checkbox', { name: 'Discord · kênh Quá hạn' }))
  expect(onLuu).toHaveBeenLastCalledWith({ loai: 'quahan', kenh: 'kenh', bat: true, chon: '#viec' })
  expect(chon().hasAttribute('disabled')).toBe(false)
})

test('ma trận: lưu lỗi → trả ô về như cũ, báo "Chưa lưu được"', async () => {
  const u = userEvent.setup()
  render(<MaTran onLuu={() => Promise.reject(new Error('mạng'))} />)
  await u.click(screen.getByRole('checkbox', { name: 'Trong app Được giao việc' }))
  await waitFor(() =>
    expect(screen.getByRole('status').textContent).toBe('Chưa lưu được: tắt Trong app — Được giao việc. Thử lại.'),
  )
  expect(screen.getByRole('checkbox', { name: 'Trong app Được giao việc' }).getAttribute('aria-checked')).toBe('true')
})

test('ma trận: bấm nhanh hai ô, ô đầu lưu lỗi → CHỈ ô đầu trả về cũ, ô sau giữ giá trị mới', async () => {
  const u = userEvent.setup()
  let tuChoiA: (e: Error) => void = () => {}
  const onLuu = vi.fn((t: ThayDoiThongBao) =>
    t.loai === 'giao' ? new Promise((_, tc) => (tuChoiA = tc)) : Promise.resolve(),
  )
  render(<MaTran onLuu={onLuu} />)
  const a = () => screen.getByRole('checkbox', { name: 'Trong app Được giao việc' })
  const b = () => screen.getByRole('checkbox', { name: 'Trong app Quá hạn' })
  await u.click(a())
  await u.click(b())
  expect(a().getAttribute('aria-checked')).toBe('false')
  expect(b().getAttribute('aria-checked')).toBe('false')
  await act(async () => tuChoiA(new Error('mạng')))
  await waitFor(() => expect(a().getAttribute('aria-checked')).toBe('true'))
  expect(b().getAttribute('aria-checked')).toBe('false')
})

test('ma trận: bên gọi chưa kịp render lại giá trị mới, lượt render riêng (báo "Đã lưu") không làm ô vừa bấm bị đè', async () => {
  // Bên gọi chưa áp onDoi (giaTri giữ nguyên). Lần bấm thứ hai phải dựng trên giá trị MỚI NHẤT (đã gồm ô đầu),
  // kể cả khi ma trận đã render lại vì dòng trạng thái "Đã lưu: …" (ref không được ghi đè bằng prop cũ lúc render).
  const u = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <NotificationMatrix loai={LOAI} kenh={KENH} giaTri={GT} onDoi={onDoi} onLuu={() => Promise.resolve()} />
    </DsRoot>,
  )
  await u.click(screen.getByRole('checkbox', { name: 'Trong app Được giao việc' }))
  await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Đã lưu: tắt Trong app — Được giao việc'))
  await u.click(screen.getByRole('checkbox', { name: 'Trong app Quá hạn' }))
  const cuoi = onDoi.mock.lastCall![0] as GiaTriMaTran
  expect(cuoi.quahan.app).toEqual({ bat: false })
  expect(cuoi.giao.app).toEqual({ bat: false })
})
