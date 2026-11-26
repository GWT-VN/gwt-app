// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { DsRoot } from '@/components/ui/ds-root'
import { BangKiemKe } from './_bang'

const kiemKeKho = vi.hoisted(() => vi.fn(async (): Promise<{ ok: true; ketQua: import('@/lib/kho/ghi').KetQuaKiemKe[] }> => ({ ok: true, ketQua: [] })))
vi.mock('../actions', () => ({ kiemKeKho }))

it('requires confirmation before saving a decimal count to the selected warehouse', async () => {
  const nativeConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
  try {
    render(<DsRoot><BangKiemKe kho="HCM" dong={[{ ma: 'A1', ten: null, don_vi: null, ton: 1 }]} danhMuc={[]} /></DsRoot>)
    fireEvent.change(screen.getByLabelText('SL đếm A1'), { target: { value: '2,5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ghi kiểm kê' }))
    expect(await screen.findByRole('alertdialog')).toBeTruthy()
    expect(kiemKeKho).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Ghi vào sổ' }))
    await waitFor(() => expect(kiemKeKho).toHaveBeenCalledWith([{ internal_code: 'A1', so_dem: 2.5 }], 'HCM'))
  } finally {
    nativeConfirm.mockRestore()
  }
})

it('báo số đếm khớp khi kiểm kê không tạo điều chỉnh', async () => {
  kiemKeKho.mockResolvedValueOnce({
    ok: true, ketQua: [{ internal_code: 'A1', ton_truoc: 1, so_dem: 1, chenh: 0, id: null }],
  })
  render(<DsRoot><BangKiemKe kho="NX" dong={[{ ma: 'A1', ten: 'Lõi lọc QA', don_vi: null, ton: 1 }]} danhMuc={[]} /></DsRoot>)
  fireEvent.change(screen.getByLabelText('SL đếm A1'), { target: { value: '1' } })
  fireEvent.click(screen.getByRole('button', { name: 'Ghi kiểm kê' }))
  await screen.findByRole('alertdialog')
  fireEvent.click(screen.getByRole('button', { name: 'Ghi vào sổ' }))
  expect(await screen.findByText('Số đếm khớp với sổ kho.')).toBeTruthy()
  expect(screen.queryByText(/mã có dòng điều chỉnh/)).toBeNull()
})
