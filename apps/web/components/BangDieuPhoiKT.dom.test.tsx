// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import { expect, test } from 'vitest'
import type { KyThuat, LichKyThuatRow } from '@/app/actions'
import { BangDieuPhoiKT } from './BangDieuPhoiKT'

const days = ['2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29']
const kts = [{ id: 'k1', ten: 'Anh Ánh' }] as KyThuat[]
const rows = [
  { id: 'c1', ky_thuat_id: 'k1', ngay: '2026-11-24', ten_khach: 'Khách A', viec: [{ loai_viec: 'bao_tri' }], tinh: 'Hà Tĩnh', trang_thai: 'hen' },
  { id: 'c2', ky_thuat_id: null, ngay: '2026-11-25', ten_khach: 'Khách B', viec: [], tinh: null, trang_thai: 'xong' },
] as unknown as LichKyThuatRow[]

test('điều phối = lưới người × ngày bằng Table DS: cột Kỹ thuật dính trái, chuyến chưa gán có hàng riêng', () => {
  render(<BangDieuPhoiKT kts={kts} rows={rows} days={days} />)
  expect(screen.getByRole('region', { name: 'Bảng điều phối kỹ thuật' }).getAttribute('data-slot')).toBe('table-wrap')
  const table = screen.getByRole('table', { name: 'Điều phối kỹ thuật theo tuần' })
  expect(within(table).getAllByRole('columnheader')).toHaveLength(8)
  const hang = within(table).getAllByRole('row')
  expect(within(hang[1]).getByRole('cell', { name: 'Anh Ánh' }).hasAttribute('data-ghim')).toBe(true)
  expect(within(hang[1]).getByRole('link', { name: /Khách A/ }).getAttribute('href')).toBe('/ky-thuat/lich?view=list&tu=2026-11-24&den=2026-11-24')
  expect(within(hang[2]).getByRole('cell', { name: 'Chưa gán KT' })).toBeTruthy()
})
