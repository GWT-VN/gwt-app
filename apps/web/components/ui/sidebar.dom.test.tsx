// @vitest-environment jsdom
import { useState } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Headset, ListChecks, Package } from '@phosphor-icons/react'
import { DsRoot } from './ds-root'
import { KhungApp, type Khu, type MucMenu } from './sidebar'

const KHU: Khu[] = [
  { id: 'viec', ten: 'Việc', icon: ListChecks, mau: '#0e8c9a', gap: true },
  { id: 'cskh', ten: 'CSKH', icon: Headset, mau: '#b5642a' },
  { id: 'kho', ten: 'Kho', icon: Package, mau: '#5560c9' },
  { id: 'ns', ten: 'Nhân sự', icon: Package, mau: '#5560c9', sapCo: true },
]
const MENU: Record<string, MucMenu[]> = {
  viec: [{ id: 'hom-nay', ten: 'Việc hôm nay', href: '#hom-nay', dem: 11 }],
  cskh: [
    { id: 'ticket', ten: 'Ticket', href: '#ticket', dangO: true },
    { id: 'khach', ten: 'Khách hàng', href: '#khach' },
  ],
  kho: [{ id: 'ton', ten: 'Tồn kho', href: '#ton' }],
}

function Mau({ onChonKhu = () => {}, bap }: { onChonKhu?: (id: string) => void; bap?: boolean }) {
  const [khu, setKhu] = useState('cskh')
  return (
    <DsRoot>
      <KhungApp
        khu={KHU}
        khuDangChon={khu}
        onChonKhu={(id) => {
          onChonKhu(id)
          setKhu(id)
        }}
        menu={MENU[khu]}
        bap={bap ? <p>Nội dung Bắp</p> : undefined}
        bapGoiY={bap ? 2 : undefined}
      >
        <p>Nội dung màn</p>
      </KhungApp>
    </DsRoot>
  )
}

const rail = () => screen.getByRole('navigation', { name: 'Khu' })

test('icon khu đang chọn có aria-current; bấm khu khác → panel đổi sang menu khu đó', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  const cskh = within(rail()).getByRole('button', { name: 'CSKH' })
  expect(cskh.getAttribute('aria-current')).toBe('true')
  expect(screen.getByRole('navigation', { name: 'Menu CSKH' })).toBeTruthy()
  await user.click(within(rail()).getByRole('button', { name: 'Kho' }))
  expect(within(rail()).getByRole('button', { name: 'Kho' }).getAttribute('aria-current')).toBe('true')
  expect(within(rail()).getByRole('button', { name: 'CSKH' }).getAttribute('aria-current')).toBeNull()
  const panel = screen.getByRole('navigation', { name: 'Menu Kho' })
  expect(within(panel).getByRole('link', { name: 'Tồn kho' })).toBeTruthy()
  expect(within(panel).queryByRole('link', { name: 'Ticket' })).toBeNull()
})

test('khu có việc gấp đọc kèm trong tên nút; khu "sắp có" không nằm trên thanh', () => {
  render(<Mau />)
  expect(within(rail()).getByRole('button', { name: 'Việc, có việc gấp' })).toBeTruthy()
  expect(within(rail()).queryByRole('button', { name: /Nhân sự/ })).toBeNull()
})

test('"Tất cả khu" có aria-expanded, mở menu khu; khu "sắp có" ghi rõ, không bấm được', async () => {
  const user = userEvent.setup()
  const chon = vi.fn()
  render(<Mau onChonKhu={chon} />)
  const nut = within(rail()).getByRole('button', { name: 'Tất cả khu' })
  expect(nut.getAttribute('aria-expanded')).toBe('false')
  await user.click(nut)
  expect(nut.getAttribute('aria-expanded')).toBe('true')
  const menu = await screen.findByRole('menu')
  const ns = within(menu).getByRole('menuitem', { name: 'Nhân sự sắp có' })
  expect(ns.getAttribute('aria-disabled')).toBe('true')
  await user.click(ns)
  expect(chon).not.toHaveBeenCalled()
  await user.click(within(menu).getByRole('menuitem', { name: 'Kho' }))
  expect(chon).toHaveBeenCalledWith('kho')
  expect(screen.getByRole('navigation', { name: 'Menu Kho' })).toBeTruthy()
})

test('item đang ở mang aria-current="page", item khác không', () => {
  render(<Mau />)
  const panel = screen.getByRole('navigation', { name: 'Menu CSKH' })
  expect(within(panel).getByRole('link', { name: 'Ticket' }).getAttribute('aria-current')).toBe('page')
  expect(within(panel).getByRole('link', { name: 'Khách hàng' }).getAttribute('aria-current')).toBeNull()
})

test('Tab tới icon khu → tooltip hiện tên khu bên phải; không đọc hai lần (mô tả rỗng)', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  const viec = within(rail()).getByRole('button', { name: 'Việc, có việc gấp' })
  while (document.activeElement !== viec) await user.tab()
  const tip = await screen.findByRole('tooltip')
  expect(tip.textContent).toBe('Việc')
  expect(tip.closest('[data-ds-portal]')).not.toBeNull()
  expect(document.querySelector('[data-slot="tooltip-content"]')?.getAttribute('data-side')).toBe('right')
  // Radix vẫn gắn aria-describedby → mô tả tính ra phải rỗng (chữ tooltip aria-hidden), không lặp tên.
  expect(within(rail()).getByRole('button', { name: 'Việc, có việc gấp', description: '' })).toBe(viec)
})

test('điện thoại: nút "Mở menu" → ngăn kéo (dialog) có thanh khu + menu; Esc đóng, focus về nút', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  const mo = screen.getByRole('button', { name: 'Mở menu' })
  await user.click(mo)
  const ngan = await screen.findByRole('dialog')
  expect(ngan.closest('[data-ds-portal]')).not.toBeNull()
  expect(ngan.getAttribute('data-side')).toBe('left')
  // Sheet side="left": bám mép trái, không còn class bám mép phải.
  expect(ngan.classList.contains('left-0')).toBe(true)
  expect(ngan.classList.contains('right-0')).toBe(false)
  expect(within(ngan).getByRole('navigation', { name: 'Khu' })).toBeTruthy()
  expect(within(ngan).getByRole('link', { name: 'Ticket' })).toBeTruthy()
  expect(mo.getAttribute('aria-expanded')).toBe('true')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(mo)
})

test('điện thoại: bấm "Đóng menu" trong ngăn kéo → đóng', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(screen.getByRole('button', { name: 'Mở menu' }))
  const ngan = await screen.findByRole('dialog')
  await user.click(within(ngan).getByRole('button', { name: 'Đóng menu' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})

test('nút Bắp: số gợi ý trong tên; bấm mở thẻ Bắp, Esc đóng và focus về nút', async () => {
  const user = userEvent.setup()
  render(<Mau bap />)
  const nut = screen.getByRole('button', { name: 'Mở Bắp (Ctrl J) — 2 gợi ý' })
  expect(nut.getAttribute('aria-expanded')).toBe('false')
  await user.click(nut)
  const the = screen.getByRole('dialog', { name: 'Bắp' })
  expect(within(the).getByText('Nội dung Bắp')).toBeTruthy()
  expect(nut.getAttribute('aria-expanded')).toBe('true')
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog', { name: 'Bắp' })).toBeNull()
  expect(document.activeElement).toBe(nut)
})

test('không truyền bap → không có nút Bắp', () => {
  render(<Mau />)
  expect(screen.queryByRole('button', { name: /Bắp/ })).toBeNull()
})

test('Ctrl+J (máy không phải Mac) bật / tắt thẻ Bắp; ⌘J không tác dụng', async () => {
  const user = userEvent.setup()
  render(<Mau bap />)
  await user.keyboard('{Meta>}j{/Meta}')
  expect(screen.queryByRole('dialog', { name: 'Bắp' })).toBeNull()
  await user.keyboard('{Control>}j{/Control}')
  expect(screen.getByRole('dialog', { name: 'Bắp' })).toBeTruthy()
  await user.keyboard('{Control>}j{/Control}')
  expect(screen.queryByRole('dialog', { name: 'Bắp' })).toBeNull()
})

test('nhiều khung có Bắp: chỉ khung mount sau cùng nhận Ctrl+J; gỡ nó thì khung trước nhận lại', async () => {
  const user = userEvent.setup()
  function Hai({ hai }: { hai: boolean }) {
    return (
      <>
        <Mau bap />
        {hai && <Mau bap />}
      </>
    )
  }
  const { rerender } = render(<Hai hai />)
  await user.keyboard('{Control>}j{/Control}')
  const the = screen.getAllByRole('dialog', { name: 'Bắp' })
  expect(the.length).toBe(1)
  const nuts = [...document.querySelectorAll('[data-slot="khung-dock"]')]
  expect(nuts[1].getAttribute('aria-expanded')).toBe('true')
  expect(nuts[0].getAttribute('aria-expanded')).toBe('false')
  rerender(<Hai hai={false} />)
  await user.keyboard('{Control>}j{/Control}')
  expect(document.querySelector('[data-slot="khung-dock"]')?.getAttribute('aria-expanded')).toBe('true')
})

test('mục nhóm (con): mở sẵn khi có con đang ở; bấm nút nhóm đóng/mở, aria-expanded khớp, đóng thì gỡ link con', async () => {
  const user = userEvent.setup()
  const menu: MucMenu[] = [
    { id: 'may', ten: 'Máy & bảo hành', con: [{ id: 'serial', ten: 'Kho serial', href: '#serial', dangO: true }, { id: 'bh', ten: 'Đăng ký BH', href: '#bh' }] },
    { id: 'tri', ten: 'Bảo trì', con: [{ id: 'lich', ten: 'Lịch bảo trì', href: '#lich' }] },
  ]
  render(
    <DsRoot>
      <KhungApp khu={KHU} khuDangChon="cskh" onChonKhu={() => {}} menu={menu} />
    </DsRoot>,
  )
  const may = screen.getByRole('button', { name: 'Máy & bảo hành' })
  expect(may.getAttribute('aria-expanded')).toBe('true')
  expect(screen.getByRole('link', { name: 'Kho serial' }).getAttribute('aria-current')).toBe('page')
  const tri = screen.getByRole('button', { name: 'Bảo trì' })
  expect(tri.getAttribute('aria-expanded')).toBe('false')
  expect(screen.queryByRole('link', { name: 'Lịch bảo trì' })).toBeNull()
  await user.click(tri)
  expect(tri.getAttribute('aria-expanded')).toBe('true')
  expect(document.getElementById(tri.getAttribute('aria-controls')!)!.textContent).toContain('Lịch bảo trì')
  await user.click(may)
  expect(screen.queryByRole('link', { name: 'Kho serial' })).toBeNull()
})

test('khu `day` nằm ở đáy thanh (sau "Tất cả khu"), không có trong menu Tất cả khu; menu tài khoản có dòng phụ + mục', async () => {
  const user = userEvent.setup()
  const khu: Khu[] = [...KHU, { id: 'quan-tri', ten: 'Quản trị', icon: Package, mau: '#6b7280', day: true }]
  const onChonKhu = vi.fn()
  render(
    <DsRoot>
      <KhungApp
        khu={khu}
        khuDangChon="cskh"
        onChonKhu={onChonKhu}
        menu={[]}
        nguoiDung={{ ten: 'Demo An', phu: 'demo@example.com', menu: <button type="button">Đăng xuất</button> }}
      />
    </DsRoot>,
  )
  const nut = within(rail()).getAllByRole('button')
  const qt = within(rail()).getByRole('button', { name: 'Quản trị' })
  expect(nut.indexOf(qt)).toBeGreaterThan(nut.indexOf(within(rail()).getByRole('button', { name: 'Tất cả khu' })))
  await user.click(qt)
  expect(onChonKhu).toHaveBeenCalledWith('quan-tri')
  await user.click(within(rail()).getByRole('button', { name: 'Tất cả khu' }))
  expect(screen.queryByRole('menuitem', { name: /Quản trị/ })).toBeNull()
  await user.keyboard('{Escape}')
  await user.click(within(rail()).getByRole('button', { name: 'Tài khoản Demo An' }))
  expect(await screen.findByText('demo@example.com')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeTruthy()
})
