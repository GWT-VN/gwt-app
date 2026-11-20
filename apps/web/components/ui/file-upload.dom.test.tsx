// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { FileDrop, FileItem, FileList, kichThuocDoc, kiemTep } from './file-upload'

vi.mock('next/font/google', () => ({
  Inter: (o: { variable: string }) => ({ variable: `gia-lap${o.variable}`, className: 'gia-lap-inter', style: {} }),
}))

const MB = 1024 * 1024
const tep = (ten: string, co: number, type = '') => {
  const f = new File(['x'], ten, { type })
  Object.defineProperty(f, 'size', { value: co })
  return f
}

test('kiemTep: quá dung lượng → câu nói cách sửa', () => {
  expect(kiemTep(tep('a.pdf', 11 * MB, 'application/pdf'), { toiDaMB: 10 })).toBe(
    'Quá 10 MB — nén lại hoặc chọn tệp khác',
  )
  expect(kiemTep(tep('a.pdf', 10 * MB, 'application/pdf'), { toiDaMB: 10 })).toBeNull()
})

test('kiemTep: sai loại → liệt kê loại nhận được, kiểm loại trước dung lượng', () => {
  expect(kiemTep(tep('quay.mov', 1 * MB, 'video/quicktime'), { accept: 'image/*,.pdf', toiDaMB: 10 })).toBe(
    'Chỉ nhận ảnh, PDF',
  )
  expect(kiemTep(tep('quay.mov', 50 * MB, 'video/quicktime'), { accept: 'image/*,.pdf,.xlsx,.docx', toiDaMB: 10 })).toBe(
    'Chỉ nhận ảnh, PDF, Excel, Word',
  )
  expect(kiemTep(tep('ANH.JPG', MB, 'image/jpeg'), { accept: 'image/*,.pdf', toiDaMB: 10 })).toBeNull()
  expect(kiemTep(tep('Bao-Cao.PDF', MB), { accept: 'image/*,.pdf', toiDaMB: 10 })).toBeNull()
  expect(kiemTep(tep('a.bin', MB, 'application/pdf'), { accept: 'application/pdf', toiDaMB: 10 })).toBeNull()
})

test('kichThuocDoc: KB / MB kiểu vi-VN', () => {
  expect(kichThuocDoc(2_411_725)).toBe('2,3 MB')
  expect(kichThuocDoc(247_808)).toBe('242 KB')
  expect(kichThuocDoc(300)).toBe('1 KB')
})

test('FileDrop: chọn tệp qua input → onChonTep nhận mọi tệp (không lọc ngầm)', async () => {
  const onChonTep = vi.fn()
  render(<FileDrop id="u" accept="image/*" onChonTep={onChonTep} goiY="Ảnh · tối đa 10 MB" />)
  const input = screen.getByLabelText(/chọn từ máy/) as HTMLInputElement
  expect(input.type).toBe('file')
  expect(input.multiple).toBe(true)
  const a = tep('a.png', 10, 'image/png')
  const b = tep('b.mov', 10, 'video/quicktime')
  await userEvent.setup({ applyAccept: false }).upload(input, [a, b])
  expect(onChonTep).toHaveBeenCalledWith([a, b])
})

test('FileDrop: thả tệp → onChonTep; đang kéo vào đổi chữ "Thả tệp vào đây"', () => {
  const onChonTep = vi.fn()
  const { container } = render(<FileDrop onChonTep={onChonTep} goiY="g" />)
  const vung = container.querySelector('label')!
  const a = tep('a.pdf', 10)
  fireEvent.dragOver(vung, { dataTransfer: { files: [a] } })
  expect(vung.hasAttribute('data-over')).toBe(true)
  expect(vung.textContent).toContain('Thả tệp vào đây')
  fireEvent.drop(vung, { dataTransfer: { files: [a] } })
  expect(vung.hasAttribute('data-over')).toBe(false)
  expect(onChonTep).toHaveBeenCalledWith([a])
})

test('FileDrop disabled: input disabled, thả không gọi onChonTep', () => {
  const onChonTep = vi.fn()
  const { container } = render(<FileDrop disabled onChonTep={onChonTep} goiY="g" />)
  expect(container.querySelector('input')!.disabled).toBe(true)
  const vung = container.querySelector('label')!
  expect(vung.getAttribute('aria-disabled')).toBe('true')
  fireEvent.dragOver(vung, { dataTransfer: { files: [] } })
  expect(vung.hasAttribute('data-over')).toBe(false)
  fireEvent.drop(vung, { dataTransfer: { files: [tep('a.pdf', 1)] } })
  expect(onChonTep).not.toHaveBeenCalled()
})

test('FileDrop: input nối gợi ý qua aria-describedby', () => {
  render(<FileDrop id="u3" onChonTep={() => {}} goiY="Ảnh, PDF · tối đa 10 MB mỗi tệp" />)
  const id = screen.getByLabelText(/chọn từ máy/).getAttribute('aria-describedby')!
  expect(document.getElementById(id)!.textContent).toBe('Ảnh, PDF · tối đa 10 MB mỗi tệp')
})

test('FileItem: nút bỏ có aria-label "Bỏ <tên>", bấm gọi onBo', async () => {
  const onBo = vi.fn()
  render(
    <FileList>
      <FileItem ten="bien-ban.pdf" kichThuoc={247_808} trangThai="xong" onBo={onBo} />
    </FileList>,
  )
  expect(screen.getByRole('list', { name: 'Tệp đã chọn' })).toBeTruthy()
  expect(screen.getByText('242 KB · đã tải lên')).toBeTruthy()
  await userEvent.click(screen.getByRole('button', { name: 'Bỏ bien-ban.pdf' }))
  expect(onBo).toHaveBeenCalledOnce()
})

test('FileItem đang tải: progressbar aria-valuenow, chữ phụ có %', () => {
  render(<FileItem ten="anh.jpg" kichThuoc={2_411_725} trangThai="dang-tai" tienDo={60} onBo={() => {}} />)
  const p = screen.getByRole('progressbar', { name: 'Đang tải anh.jpg' })
  expect(p.getAttribute('aria-valuenow')).toBe('60')
  expect(screen.getByText('2,3 MB · đang tải 60%')).toBeTruthy()
})

test('FileItem lỗi: data-state error, chữ phụ là câu lỗi, onThuLai → nút "Thử lại"', async () => {
  const onThuLai = vi.fn()
  const { container } = render(
    <FileItem ten="v.mov" kichThuoc={1} trangThai="loi" loi="Mất mạng — thử lại" onBo={() => {}} onThuLai={onThuLai} />,
  )
  expect(container.querySelector('li')!.getAttribute('data-state')).toBe('error')
  expect(screen.queryByRole('progressbar')).toBeNull()
  expect(screen.getByText('Mất mạng — thử lại')).toBeTruthy()
  await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
  expect(onThuLai).toHaveBeenCalledOnce()
})
