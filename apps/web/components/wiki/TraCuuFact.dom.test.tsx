// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { DsRoot } from '@/components/ui/ds-root'
import { SAN_PHAM } from '@/lib/wiki/data/san-pham'
import TraCuuFact from './TraCuuFact'

test('tìm và bỏ chọn nhóm dữ kiện bằng bộ lọc', async () => {
  const facts = SAN_PHAM.find((sp) => sp.ma.toLowerCase() === 'ush10')!.facts
  const group = facts[0]
  const user = userEvent.setup()
  render(<DsRoot><TraCuuFact facts={facts} /></DsRoot>)
  await user.click(screen.getByRole('button', { name: /Lọc theo nhóm dữ kiện/ }))
  const dialog = screen.getByRole('dialog', { name: 'Lọc theo nhóm dữ kiện' })
  await user.type(within(dialog).getByRole('combobox'), group.tenNhom)
  await user.click(within(dialog).getByRole('option', { name: `${group.nhom}. ${group.tenNhom}` }))
  expect(screen.getByRole('status').textContent).toContain(`${facts.filter((f) => f.nhom === group.nhom).length} / ${facts.length}`)
  await user.click(screen.getByRole('button', { name: `Bỏ chọn ${group.nhom}. ${group.tenNhom}` }))
  expect(screen.getByRole('status').textContent).toContain(`${facts.length} / ${facts.length}`)
})
