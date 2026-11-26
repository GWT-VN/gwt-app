// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { DsRoot } from '@/components/ui/ds-root'
import { BangKiemKe } from './_bang'

const kiemKeKho = vi.hoisted(() => vi.fn(async () => ({ ok: true, ketQua: [] })))
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
