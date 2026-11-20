// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import { expect, test } from 'vitest'
import { DsRoot, useDsPortal } from './ds-root'

// Probe ghi lại mọi giá trị useDsPortal() qua các lần render: lần đầu null (ref chưa gắn), sau mount phải là ô portal.
const thay: (HTMLElement | null)[] = []
function Probe() {
  const o = useDsPortal()
  thay.push(o)
  return <p data-testid="probe">{o ? 'co' : 'chua'}</p>
}

test('useDsPortal sau mount = ô [data-ds-portal] nằm TRONG vùng [data-ds="v2"] (Radix Portal render vào đây)', async () => {
  render(
    <DsRoot theme="dark">
      <Probe />
    </DsRoot>,
  )
  await waitFor(() => expect(screen.getByTestId('probe').textContent).toBe('co'))
  const o = thay.at(-1)!
  expect(o.matches('[data-ds-portal]')).toBe(true)
  expect(o.closest('[data-ds="v2"]')).not.toBeNull()
  expect(o.closest('[data-ds="v2"]')?.getAttribute('data-theme')).toBe('dark')
  expect(thay[0]).toBeNull()
})

test('useDsPortal ngoài DsRoot = null (component overlay không render portal khi chưa có ô)', () => {
  render(<Probe />)
  expect(screen.getAllByTestId('probe').at(-1)?.textContent).toBe('chua')
})
