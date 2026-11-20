// @vitest-environment jsdom
import { useState } from 'react'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, expect, test, vi } from 'vitest'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from './breadcrumb'
import { Composer } from './composer'
import { DsRoot } from './ds-root'
import { PageHeader } from './page-header'
import { PropertyList, PropertyRow } from './property-list'
import { Timeline, type MucTimeline } from './timeline'

// Máy chạy UTC: Timeline phải nhóm ngày + hiện giờ theo giờ VN, không theo múi giờ máy (đặt trước mọi import).
const tzCu = vi.hoisted(() => {
  const cu = process.env.TZ
  process.env.TZ = 'UTC'
  return cu
})
afterAll(() => {
  if (tzCu === undefined) delete process.env.TZ
  else process.env.TZ = tzCu
})

/* ---------- Breadcrumb ---------- */

const DUONG_DAN = (
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/cskh">CSKH</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="/cskh/ticket">Ticket</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbPage>TK-DEMO-045</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
)

test('Breadcrumb: nav "Đường dẫn", mục cuối aria-current="page" và không phải liên kết, dấu "/" không nằm trong DOM', () => {
  render(DUONG_DAN)
  const nav = screen.getByRole('navigation', { name: 'Đường dẫn' })
  expect(within(nav).getAllByRole('link').map((a) => a.textContent)).toEqual(['CSKH', 'Ticket'])
  const cuoi = within(nav).getByText('TK-DEMO-045')
  expect(cuoi.getAttribute('aria-current')).toBe('page')
  expect(cuoi.closest('a')).toBeNull()
  expect(cuoi.getAttribute('role')).toBeNull()
  expect(nav.textContent).not.toContain('/')
  expect(within(nav).getByRole('list').children.length).toBe(3)
})

/* ---------- PageHeader ---------- */

test('PageHeader: tiêu đề h1, meta từng mục, hành động, chuyển bản ghi đọc vị trí + tắt ở đầu danh sách', async () => {
  const onTruoc = vi.fn()
  const onSau = vi.fn()
  render(
    <DsRoot>
      <PageHeader
        duongDan={DUONG_DAN}
        tieuDe="Công ty Demo An Phát"
        meta={['CTD50', 'chưa có serial']}
        hanhDong={<button type="button">Gọi khách</button>}
        chuyen={{ loai: 'Ticket', viTri: 1, tong: 19, onTruoc, onSau }}
      />
    </DsRoot>,
  )
  expect(screen.getByRole('heading', { level: 1, name: 'Công ty Demo An Phát' })).toBeTruthy()
  expect(screen.getByText('CTD50').tagName).toBe('SPAN')
  expect(screen.getByText('chưa có serial').tagName).toBe('SPAN')
  expect(screen.getByRole('button', { name: 'Gọi khách' })).toBeTruthy()
  expect(screen.getByText('Ticket thứ 1 trong 19')).toBeTruthy()
  const truoc = screen.getByRole('button', { name: 'Ticket trước' }) as HTMLButtonElement
  const sau = screen.getByRole('button', { name: 'Ticket sau' }) as HTMLButtonElement
  expect(truoc.disabled).toBe(true)
  expect(sau.disabled).toBe(false)
  await userEvent.click(sau)
  expect(onSau).toHaveBeenCalledTimes(1)
  expect(onTruoc).not.toHaveBeenCalled()
})

test('PageHeader: cuối danh sách → nút sau tắt; không chuyển thì không có hàng nút ‹ ›', () => {
  const { rerender } = render(
    <DsRoot>
      <PageHeader tieuDe="Phiếu demo" chuyen={{ loai: 'Phiếu', viTri: 5, tong: 5, onTruoc() {}, onSau() {} }} />
    </DsRoot>,
  )
  expect((screen.getByRole('button', { name: 'Phiếu sau' }) as HTMLButtonElement).disabled).toBe(true)
  expect((screen.getByRole('button', { name: 'Phiếu trước' }) as HTMLButtonElement).disabled).toBe(false)
  rerender(
    <DsRoot>
      <PageHeader tieuDe="Phiếu demo" />
    </DsRoot>,
  )
  expect(screen.queryByRole('button')).toBeNull()
})

/* ---------- PropertyList ---------- */

test('PropertyList: dl/dt/dd thật, ô rỗng ghi "Chưa có", tiêu đề nhóm là h3', () => {
  render(
    <PropertyList tieuDe="Khách & máy">
      <PropertyRow nhan="Máy">CTD50</PropertyRow>
      <PropertyRow nhan="Serial">{null}</PropertyRow>
      <PropertyRow nhan="Ghi chú">{''}</PropertyRow>
      <PropertyRow nhan="Số lần">{0}</PropertyRow>
    </PropertyList>,
  )
  expect(screen.getByRole('heading', { level: 3, name: 'Khách & máy' })).toBeTruthy()
  const dl = document.querySelector('dl')!
  expect([...dl.children].map((c) => c.tagName)).toEqual(['DT', 'DD', 'DT', 'DD', 'DT', 'DD', 'DT', 'DD'])
  const dd = [...dl.querySelectorAll('dd')].map((x) => x.textContent)
  expect(dd).toEqual(['CTD50', 'Chưa có', 'Chưa có', '0'])
  expect(screen.getAllByText('Chưa có')[0].getAttribute('data-slot')).toBe('props-empty')
})

test('PropertyList: xếp dọc gắn data-layout="stack"', () => {
  render(
    <PropertyList layout="stack">
      <PropertyRow nhan="Ngày lắp">12/03/2025</PropertyRow>
    </PropertyList>,
  )
  expect(document.querySelector('dl')!.getAttribute('data-layout')).toBe('stack')
})

/* ---------- Timeline ---------- */

const MUC: MucTimeline[] = [
  { id: 's1', ai: 'Hiền', loai: 'tạo ticket từ Zalo', luc: '2026-11-15T09:12:00+07:00', icon: <svg /> },
  { id: 's2', ai: 'Hiền', loai: 'đặt ưu tiên', luc: '2026-11-15T09:40:00+07:00', icon: <svg />, color: 'danger' },
  { id: 's3', ai: 'Hiền', loai: 'ghi chú', luc: '2026-11-15T23:30:00+07:00', noiDung: 'Hẹn gọi lại.' },
  { id: 's4', ai: 'Hiền', loai: 'ghi chú', luc: '2026-11-16T14:05:00+07:00', noiDung: 'Gọi hướng dẫn khách.' },
  // 00:30 giờ VN 18/11 = 17:30 UTC 17/11 — máy UTC nhóm sai sang "Hôm qua" nếu không theo giờ VN.
  { id: 's5', ai: 'Khách', loai: 'hỏi lại qua Zalo', luc: '2026-11-18T00:30:00+07:00', noiDung: 'Bao giờ KT qua?', tep: [{ ten: 'anh-demo.jpg' }] },
]

test('Timeline: nhóm ngày theo giờ VN (Hôm nay / Hôm qua / thứ, ngày), giờ là <time datetime> + title ngày giờ đủ', () => {
  render(<Timeline muc={MUC} homNay="2026-11-18" />)
  const ol = screen.getByRole('list', { name: 'Hoạt động' })
  const nhan = [...ol.querySelectorAll('[data-slot="timeline-day"]')].map((x) => x.textContent)
  expect(nhan).toEqual(['Chủ nhật, 15/11', 'Thứ Hai, 16/11', 'Hôm nay'])
  const gio = [...ol.querySelectorAll('time')]
  expect(gio.map((t) => t.textContent)).toEqual(['09:12', '09:40', '23:30', '14:05', '00:30'])
  expect(gio[4].getAttribute('datetime')).toBe('2026-11-18T00:30:00+07:00')
  expect(gio[4].getAttribute('title')).toBe('Thứ Tư, 18/11/2026 · 00:30')
  // bình luận có khung (noiDung), sự kiện một dòng
  expect(ol.querySelectorAll('[data-slot="timeline-body"]').length).toBe(3)
  expect(screen.getByText('anh-demo.jpg')).toBeTruthy()
})

test('Timeline: "Hôm qua" đúng mốc nửa đêm giờ VN', () => {
  render(<Timeline muc={MUC.slice(4)} homNay="2026-11-19" />)
  expect(document.querySelector('[data-slot="timeline-day"]')!.textContent).toBe('Hôm qua')
})

test('Timeline: gập phần cũ → "Hiện N hoạt động cũ hơn" mở thêm mục, focus vào mục mới đầu tiên (cũ nhất)', async () => {
  render(<Timeline muc={MUC} hien={2} homNay="2026-11-18" />)
  const ol = screen.getByRole('list', { name: 'Hoạt động' })
  expect(ol.querySelectorAll('[data-slot="timeline-item"]').length).toBe(2)
  // mục đầu đang hiện vẫn có nhãn ngày của nó dù mục cùng ngày bị gập
  expect([...ol.querySelectorAll('[data-slot="timeline-day"]')].map((x) => x.textContent)).toEqual(['Thứ Hai, 16/11', 'Hôm nay'])
  await userEvent.click(screen.getByRole('button', { name: 'Hiện 3 hoạt động cũ hơn' }))
  const muc = ol.querySelectorAll('[data-slot="timeline-item"]')
  expect(muc.length).toBe(5)
  expect(screen.queryByRole('button', { name: /hoạt động cũ hơn/ })).toBeNull()
  expect(document.activeElement).toBe(muc[0])
  expect(muc[0].textContent).toContain('tạo ticket từ Zalo')
})

test('Timeline: đủ ít mục thì không có nút gập', () => {
  render(<Timeline muc={MUC} hien={5} homNay="2026-11-18" />)
  expect(screen.queryByRole('button')).toBeNull()
})

/* ---------- Composer ---------- */

const o = () => screen.getByRole('textbox', { name: 'Viết ghi chú' }) as HTMLTextAreaElement
const nutGui = (ten = 'Gửi') => screen.getByRole('button', { name: ten }) as HTMLButtonElement

test('Composer: trống (hoặc chỉ dấu cách) → nút Gửi tắt; có chữ → bật', async () => {
  render(<DsRoot><Composer onGui={() => {}} /></DsRoot>)
  expect(nutGui().disabled).toBe(true)
  await userEvent.type(o(), '   ')
  expect(nutGui().disabled).toBe(true)
  await userEvent.type(o(), 'Đã gọi')
  expect(nutGui().disabled).toBe(false)
})

test('Composer: Enter xuống dòng, Ctrl+Enter và ⌘+Enter gửi (bỏ khoảng trắng hai đầu) rồi xoá ô', async () => {
  const onGui = vi.fn()
  render(<DsRoot><Composer onGui={onGui} /></DsRoot>)
  await userEvent.type(o(), ' dòng 1{Enter}dòng 2 ')
  expect(onGui).not.toHaveBeenCalled()
  expect(o().value).toBe(' dòng 1\ndòng 2 ')
  await userEvent.keyboard('{Control>}{Enter}{/Control}')
  expect(onGui).toHaveBeenCalledWith('dòng 1\ndòng 2', [])
  expect(o().value).toBe('')
  await userEvent.type(o(), 'lần hai')
  await userEvent.keyboard('{Meta>}{Enter}{/Meta}')
  expect(onGui).toHaveBeenLastCalledWith('lần hai', [])
})

test('Composer: bộ gõ tiếng Việt đang ghép chữ (isComposing / keyCode 229) → Ctrl+Enter không gửi', async () => {
  const onGui = vi.fn()
  render(<DsRoot><Composer onGui={onGui} /></DsRoot>)
  await userEvent.type(o(), 'Viet')
  fireEvent.keyDown(o(), { key: 'Enter', ctrlKey: true, isComposing: true })
  fireEvent.keyDown(o(), { key: 'Enter', ctrlKey: true, keyCode: 229 })
  expect(onGui).not.toHaveBeenCalled()
  fireEvent.keyDown(o(), { key: 'Enter', ctrlKey: true })
  expect(onGui).toHaveBeenCalledWith('Viet', [])
})

test('Composer: Ctrl+Enter khi trống không gửi', async () => {
  const onGui = vi.fn()
  render(<DsRoot><Composer onGui={onGui} /></DsRoot>)
  await userEvent.click(o())
  await userEvent.keyboard('{Control>}{Enter}{/Control}')
  expect(onGui).not.toHaveBeenCalled()
})

test('Composer: đang gửi → nút aria-busy, ô chỉ đọc, phím gửi không gửi lần nữa', async () => {
  const onGui = vi.fn()
  render(<DsRoot><Composer onGui={onGui} dangGui defaultValue="Đã hẹn" /></DsRoot>)
  expect(nutGui().getAttribute('aria-busy')).toBe('true')
  expect(o().readOnly).toBe(true)
  fireEvent.keyDown(o(), { key: 'Enter', ctrlKey: true })
  await userEvent.click(nutGui())
  expect(onGui).not.toHaveBeenCalled()
})

test('Composer: onGui trả Promise → chờ (aria-busy); bị từ chối thì GIỮ nội dung, thành công thì xoá', async () => {
  let tuChoi!: (e: Error) => void
  let xong!: () => void
  const onGui = vi
    .fn()
    .mockImplementationOnce(() => new Promise<void>((_, r) => (tuChoi = r)))
    .mockImplementationOnce(() => new Promise<void>((ok) => (xong = ok)))
  render(<DsRoot><Composer onGui={onGui} /></DsRoot>)
  await userEvent.type(o(), 'Đã hẹn 14:00')
  await userEvent.click(nutGui())
  expect(nutGui().getAttribute('aria-busy')).toBe('true')
  await act(async () => tuChoi(new Error('mất mạng')))
  expect(o().value).toBe('Đã hẹn 14:00')
  expect(nutGui().getAttribute('aria-busy')).toBeNull()
  await userEvent.click(nutGui())
  await act(async () => xong())
  expect(o().value).toBe('')
})

test('Composer: lỗi gửi → ô aria-invalid + mô tả câu lỗi, nút thành "Gửi lại", nội dung giữ nguyên', () => {
  render(
    <DsRoot>
      <Composer onGui={() => {}} defaultValue="Đã hẹn KT" loi="Chưa gửi được — mất kết nối." />
    </DsRoot>,
  )
  expect(o().getAttribute('aria-invalid')).toBe('true')
  expect(screen.getByRole('textbox', { description: 'Chưa gửi được — mất kết nối.' })).toBe(o())
  expect(nutGui('Gửi lại').disabled).toBe(false)
  expect(o().value).toBe('Đã hẹn KT')
})

test('Composer: tắt → ô + nút đính + nút gửi đều tắt', () => {
  render(<DsRoot><Composer onGui={() => {}} disabled placeholder="Ticket đã đóng" /></DsRoot>)
  expect(o().disabled).toBe(true)
  expect(nutGui().disabled).toBe(true)
  expect((screen.getByRole('button', { name: 'Đính kèm tệp' }) as HTMLButtonElement).disabled).toBe(true)
})

test('Composer: đính tệp → chip có nút bỏ; chỉ có tệp cũng gửi được; bỏ tệp → focus về ô chữ', async () => {
  const onGui = vi.fn()
  function Khung() {
    const [n, setN] = useState(0)
    return (
      <DsRoot>
        <Composer onGui={(c, t) => { onGui(c, t); setN(n + 1) }} />
      </DsRoot>
    )
  }
  render(<Khung />)
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  const a = new File(['x'], 'bien-ban-demo.pdf', { type: 'application/pdf' })
  const b = new File(['y'], 'anh-demo.jpg', { type: 'image/jpeg' })
  await userEvent.upload(input, [a, b])
  expect(nutGui().disabled).toBe(false)
  await userEvent.click(screen.getByRole('button', { name: 'Bỏ tệp anh-demo.jpg' }))
  expect(screen.queryByText('anh-demo.jpg')).toBeNull()
  expect(document.activeElement).toBe(o())
  await userEvent.click(nutGui())
  expect(onGui).toHaveBeenCalledWith('', [a])
  expect(screen.queryByText('bien-ban-demo.pdf')).toBeNull()
})

test('Timeline: lúc không hợp lệ → không sập, hiện chữ gốc + "không rõ giờ", nhóm vào "Không rõ ngày"', () => {
  render(<Timeline muc={[{ id: 'x', ai: 'Hiền', loai: 'ghi chú', luc: 'abc' }, MUC[4]]} homNay="2026-11-18" />)
  const gio = document.querySelector('time')!
  expect(gio.textContent).toBe('không rõ giờ')
  expect(gio.getAttribute('title')).toBe('abc')
  expect(gio.hasAttribute('datetime')).toBe(false)
  expect([...document.querySelectorAll('[data-slot="timeline-day"]')].map((x) => x.textContent)).toEqual(['Không rõ ngày', 'Hôm nay'])
})

test('Timeline: hai tệp cùng tên không cảnh báo key trùng, hiện đủ hai chip', () => {
  const loi = vi.spyOn(console, 'error').mockImplementation(() => {})
  render(<Timeline muc={[{ ...MUC[4], tep: [{ ten: 'anh.jpg' }, { ten: 'anh.jpg' }] }]} homNay="2026-11-18" />)
  expect(screen.getAllByText('anh.jpg').length).toBe(2)
  expect(loi.mock.calls.some((c) => String(c[0]).includes('same key'))).toBe(false)
  loi.mockRestore()
})
