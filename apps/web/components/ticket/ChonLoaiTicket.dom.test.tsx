// @vitest-environment jsdom
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { DsRoot } from '@/components/ui/ds-root'
import { ChonLoaiTicket } from './ChonLoaiTicket'

test('a long ticket type list keeps an old type and can add a new one', async () => {
  const u = userEvent.setup()
  function Form() {
    const [loai, setLoai] = useState('Yêu cầu bảo trì')
    const ds = Array.from({ length: 32 }, (_, i) => 'Loại ' + (i + 1))
    return <><ChonLoaiTicket value={loai} onChange={setLoai} loaiList={ds} /><output>{loai}</output></>
  }
  render(<DsRoot><Form /></DsRoot>)

  await u.click(screen.getByRole('button', { name: /Phân loại.*Yêu cầu bảo trì/ }))
  await u.keyboard('loai 32')
  await u.click(await screen.findByRole('option', { name: 'Loại 32' }))
  await u.click(screen.getByRole('button', { name: /Phân loại.*Loại 32/ }))
  await u.click(screen.getByRole('option', { name: '+ Thêm loại mới…' }))
  await u.type(screen.getByRole('textbox', { name: 'Tên loại lỗi mới' }), 'Loại mới')
  expect(screen.getByRole('status').textContent).toBe('Loại mới')
})
