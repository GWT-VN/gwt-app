// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test, vi } from 'vitest'
import { Banner } from './banner'
import { Button } from './button'
import { EmptyState } from './empty-state'
import { Skeleton, SkeletonDong } from './skeleton'
import { StatCard, StatGrid } from './stat-card'

// ---------- Skeleton ----------

test('Skeleton: aria-hidden, hình + bề rộng qua data-shape/data-w, tắt nhấp nháy khi giảm chuyển động', () => {
  const { container } = render(
    <>
      <Skeleton />
      <Skeleton shape="circle" />
      <Skeleton width="1/3" />
    </>,
  )
  const [dong, tron, motPhanBa] = [...container.querySelectorAll('[data-slot="skeleton"]')]
  for (const s of [dong, tron, motPhanBa]) expect(s.getAttribute('aria-hidden')).toBe('true')
  expect(dong.hasAttribute('data-shape')).toBe(false)
  expect(tron.getAttribute('data-shape')).toBe('circle')
  expect(motPhanBa.getAttribute('data-w')).toBe('1/3')
  expect(dong.className).toContain('motion-reduce:animate-none')
})

test('SkeletonDong: vùng đọc role=status KHÔNG nằm trong vùng aria-busy (không bị hoãn đọc); các dòng chờ aria-busy + aria-hidden', () => {
  const { container } = render(<SkeletonDong so={3} />)
  const doc = screen.getByRole('status')
  expect(doc.textContent).toBe('Đang tải danh sách')
  expect(doc.hasAttribute('aria-busy')).toBe(false)
  expect(doc.closest('[aria-busy="true"]')).toBeNull()
  const ban = container.querySelector('[data-slot="skeleton-dong"]')
  expect(ban?.getAttribute('aria-busy')).toBe('true')
  const dong = ban!.querySelectorAll('[data-slot="skeleton-row"]')
  expect(dong).toHaveLength(3)
  for (const d of dong) expect(d.getAttribute('aria-hidden')).toBe('true')
})

test('SkeletonDong: nhãn riêng thay chữ mặc định', () => {
  render(<SkeletonDong so={1} nhan="Đang tải ticket" />)
  expect(screen.getByRole('status').textContent).toBe('Đang tải ticket')
})

// ---------- EmptyState ----------

test('EmptyState: tiêu đề là heading, mô tả, nút hành động; icon trang trí aria-hidden', () => {
  render(
    <EmptyState tieuDe="Chưa có phiếu chi nào" moTa="Phiếu chi tháng này sẽ hiện ở đây.">
      <Button size="sm">Tạo phiếu chi</Button>
    </EmptyState>,
  )
  expect(screen.getByRole('heading', { level: 3, name: 'Chưa có phiếu chi nào' })).toBeTruthy()
  expect(screen.getByText('Phiếu chi tháng này sẽ hiện ở đây.')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Tạo phiếu chi' })).toBeTruthy()
  const icon = document.querySelector('[data-slot="empty-icon"]')
  expect(icon?.getAttribute('aria-hidden')).toBe('true')
  expect(icon?.querySelector('svg')).toBeTruthy()
  // khung shadcn Empty: Empty › EmptyHeader (media · title h3 · description) + EmptyContent
  expect(document.querySelector('[data-slot="empty"] > [data-slot="empty-header"] > h3[data-slot="empty-title"]')).toBeTruthy()
  expect(document.querySelector('[data-slot="empty-header"] > [data-slot="empty-description"]')).toBeTruthy()
  expect(document.querySelector('[data-slot="empty"] > [data-slot="empty-content"] > button')).toBeTruthy()
})

test('EmptyState: kieu="loi" → icon màu danger; không con → không có nhóm hành động; size sm; cấp heading đổi được', () => {
  const { container } = render(<EmptyState kieu="loi" size="sm" capTieuDe={2} tieuDe="Không tải được danh sách" />)
  expect(container.querySelector('[data-slot="empty-icon"]')?.getAttribute('data-color')).toBe('danger')
  expect(container.querySelector('[data-slot="empty-content"]')).toBeNull()
  expect(container.querySelector('[data-slot="empty"]')?.getAttribute('data-size')).toBe('sm')
  expect(screen.getByRole('heading', { level: 2, name: 'Không tải được danh sách' })).toBeTruthy()
})

test('EmptyState: kieu khác "loi" → icon không màu danger', () => {
  for (const kieu of ['that', 'loc', 'quyen'] as const) {
    const { container, unmount } = render(<EmptyState kieu={kieu} tieuDe="x" />)
    expect(container.querySelector('[data-slot="empty-icon"]')?.hasAttribute('data-color')).toBe(false)
    unmount()
  }
})

// ---------- Banner ----------

test('Banner: role theo màu — mặc định status, danger alert; role truyền vào thắng', () => {
  const { rerender } = render(<Banner>Đang xem dữ liệu thử</Banner>)
  expect(screen.getByRole('status').getAttribute('data-color')).toBe('info')
  rerender(<Banner color="danger">Phiên sắp hết hạn</Banner>)
  expect(screen.getByRole('alert')).toBeTruthy()
  rerender(<Banner color="danger" role="status">x</Banner>)
  expect(screen.getByRole('status')).toBeTruthy()
})

test('Banner: không onDong → không có nút đóng; có hanhDong → nút hiện', () => {
  render(<Banner hanhDong={<Button size="sm">Tải lại</Button>}>Có bản mới</Banner>)
  expect(screen.queryByRole('button', { name: 'Ẩn thông báo' })).toBeNull()
  expect(screen.getByRole('button', { name: 'Tải lại' })).toBeTruthy()
})

function CoBanner({ onDong }: { onDong: () => void }) {
  const [hien, setHien] = useState(true)
  return (
    <div>
      <button type="button">Trước</button>
      {hien && (
        <Banner
          onDong={() => {
            onDong()
            setHien(false)
          }}
        >
          Có bản cập nhật mới
        </Banner>
      )}
      <main>
        <button type="button">Sau</button>
      </main>
    </div>
  )
}

test('Banner: bấm ✕ → onDong, banner gỡ khỏi trang, focus sang phần tử kế tiếp (không rơi về body)', async () => {
  const onDong = vi.fn()
  const u = userEvent.setup()
  render(<CoBanner onDong={onDong} />)
  await u.click(screen.getByRole('button', { name: 'Ẩn thông báo' }))
  expect(onDong).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole('status')).toBeNull()
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Sau' }))
})

test('Banner: đóng bằng bàn phím (Tab tới ✕, Enter) cũng giữ focus', async () => {
  const u = userEvent.setup()
  render(<CoBanner onDong={() => {}} />)
  screen.getByRole('button', { name: 'Trước' }).focus()
  await u.tab()
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Ẩn thông báo' }))
  await u.keyboard('{Enter}')
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Sau' }))
})

test('Banner: không có phần tử nào sau → focus về phần tử đứng trước', async () => {
  function Cuoi() {
    const [hien, setHien] = useState(true)
    return (
      <div>
        <button type="button">Trước</button>
        {hien && <Banner onDong={() => setHien(false)}>x</Banner>}
      </div>
    )
  }
  const u = userEvent.setup()
  render(<Cuoi />)
  await u.click(screen.getByRole('button', { name: 'Ẩn thông báo' }))
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Trước' }))
})

test('Banner: phần tử kế tiếp bị ẩn / inert / tắt → focus nhảy qua, tới phần tử thấy được', async () => {
  function CoAn() {
    const [hien, setHien] = useState(true)
    return (
      <div>
        {hien && <Banner onDong={() => setHien(false)}>x</Banner>}
        <button type="button" style={{ display: 'none' }}>
          Ẩn
        </button>
        <div hidden>
          <button type="button">Trong khối hidden</button>
        </div>
        <div inert>
          <button type="button">Trơ</button>
        </div>
        <span tabIndex={0} aria-disabled="true" style={{ visibility: 'hidden' }}>
          Vô hình
        </span>
        <button type="button">Thấy được</button>
      </div>
    )
  }
  const u = userEvent.setup()
  render(<CoAn />)
  await u.click(screen.getByRole('button', { name: 'Ẩn thông báo' }))
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Thấy được' }))
})

// ---------- StatCard ----------

test('StatCard: số vi-VN tabular-nums, biến động có câu đọc đủ ("Tăng 12% so với tháng trước, tốt"), mũi tên aria-hidden', () => {
  render(
    <StatCard
      nhan="Doanh thu"
      giaTri={1250000}
      donVi="₫"
      bienDong={{ so: 12, donVi: '%', soVoi: 'so với tháng trước', tot: 'tang' }}
      chan="Xem báo cáo"
      href="/ke-toan/demo"
    />,
  )
  const the = screen.getByRole('link', { name: /Doanh thu\s*1\.250\.000\s*₫.*Tăng 12% so với tháng trước, tốt/ })
  expect(the.getAttribute('href')).toBe('/ke-toan/demo')
  const delta = the.querySelector('[data-slot="stat-delta"]')
  expect(delta?.getAttribute('data-nghia')).toBe('tot')
  expect(delta?.querySelector('b')?.getAttribute('aria-hidden')).toBe('true')
  expect(the.querySelector('[data-slot="stat-value"]')?.className).toContain('tabular-nums')
  expect(screen.getByText('Tăng 12% so với tháng trước, tốt')).toBeTruthy()
})

test('StatCard: màu theo NGHĨA — giảm khi "giảm là tốt" → tốt; tăng khi "giảm là tốt" → cần chú ý', () => {
  const { container, rerender } = render(
    <StatCard nhan="Quá hạn" giaTri={2} bienDong={{ so: -1, soVoi: 'so với hôm qua', tot: 'giam' }} />,
  )
  const delta = () => container.querySelector('[data-slot="stat-delta"]')
  expect(delta()?.getAttribute('data-nghia')).toBe('tot')
  expect(screen.getByText('Giảm 1 so với hôm qua, tốt')).toBeTruthy()
  rerender(<StatCard nhan="Khách hỏi lại" giaTri={7} donVi="lần" bienDong={{ so: 2, soVoi: 'so với tuần trước', tot: 'giam' }} />)
  expect(delta()?.getAttribute('data-nghia')).toBe('xau')
  expect(screen.getByText('Tăng 2 so với tuần trước, cần chú ý')).toBeTruthy()
})

test('StatCard: không đổi / không có nghĩa → màu trung tính; đơn vị biến động có khoảng trắng', () => {
  const { container, rerender } = render(
    <StatCard nhan="Giữ lời hẹn" giaTri={92} donVi="%" bienDong={{ so: 0, soVoi: 'so với tuần trước', tot: 'tang' }} />,
  )
  const delta = () => container.querySelector('[data-slot="stat-delta"]')
  expect(delta()?.hasAttribute('data-nghia')).toBe(false)
  expect(screen.getByText('Không đổi so với tuần trước')).toBeTruthy()
  rerender(<StatCard nhan="Phản hồi đầu" giaTri={42} donVi="phút" bienDong={{ so: -8, donVi: 'phút', soVoi: 'so với tuần trước' }} />)
  expect(delta()?.hasAttribute('data-nghia')).toBe(false)
  expect(screen.getByText('Giảm 8 phút so với tuần trước')).toBeTruthy()
})

test('StatCard: chưa có dữ liệu → "—" + lý do, không hiện 0; không href → không phải link', () => {
  const { container } = render(<StatCard nhan="Báo cáo đã gửi" giaTri={null} trong="Chưa có dữ liệu — tính năng Đợt 2" />)
  expect(container.querySelector('[data-slot="stat-value"]')?.textContent).toBe('—')
  expect(screen.getByText('Chưa có dữ liệu — tính năng Đợt 2')).toBeTruthy()
  expect(screen.queryByRole('link')).toBeNull()
})

test('StatCard dangTai: thẻ aria-busy, câu "Đang tải" ở vùng đọc riêng ngoài vùng busy; khung chờ aria-hidden; StatGrid bọc lưới', () => {
  const { container } = render(
    <StatGrid>
      <StatCard nhan="Doanh thu" giaTri={null} dangTai />
    </StatGrid>,
  )
  const doc = screen.getByRole('status')
  expect(doc.textContent).toBe('Đang tải: Doanh thu')
  expect(doc.hasAttribute('aria-busy')).toBe(false)
  expect(doc.closest('[aria-busy="true"]')).toBeNull()
  const the = container.querySelector('[data-slot="stat-card"]')!
  expect(the.getAttribute('aria-busy')).toBe('true')
  expect(the.querySelectorAll('[data-slot="skeleton"][aria-hidden="true"]')).toHaveLength(3)
  expect(the.parentElement?.getAttribute('data-slot')).toBe('stat-grid')
})

// cwd = apps/web (vitest); jsdom không cho import.meta.url dạng file.
test('feedback-styles.ts là file thường (server component gọi được hằng class)', () => {
  expect(readFileSync('components/ui/feedback-styles.ts', 'utf8')).not.toMatch(/^\s*['"]use client['"]/)
})
