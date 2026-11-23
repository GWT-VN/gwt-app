// @vitest-environment jsdom
// Đợt 6 chép shadcn: Tabs (variant shadcn), Toggle, ToggleGroup, Table (container/caption), Sidebar (khung shadcn),
// NavigationMenu, Resizable.
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import { DsRoot } from './ds-root'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './navigation-menu'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './sidebar'
import { Table, TableBody, TableCaption, TableCell, TableRow, TableWrap } from './table'
import { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants } from './tabs'
import { Toggle, toggleVariants } from './toggle'

let hep = false
beforeEach(() => {
  hep = false
  // jsdom không có matchMedia; useIsMobile đọc innerWidth.
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: hep,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
  Object.defineProperty(window, 'innerWidth', { configurable: true, get: () => (hep ? 390 : 1440) })
  document.cookie = 'sidebar_state=; max-age=0; path=/'
})

test('Tabs: variant shadcn default (mặc định, = segmented) / line; gốc mang data-orientation; tabsListVariants xuất ra', () => {
  render(
    <>
      <Tabs defaultValue="a" data-testid="goc">
        <TabsList aria-label="Mặc định">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Thân A</TabsContent>
      </Tabs>
      <Tabs defaultValue="b" orientation="vertical">
        <TabsList variant="line" aria-label="Line">
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>
    </>,
  )
  expect(screen.getByTestId('goc').getAttribute('data-orientation')).toBe('horizontal')
  const macDinh = screen.getByRole('tablist', { name: 'Mặc định' })
  expect(macDinh.getAttribute('data-variant')).toBe('default')
  // default và segmented cùng một vẻ
  expect(tabsListVariants({ variant: 'default' })).toBe(tabsListVariants({ variant: 'segmented' }))
  const line = screen.getByRole('tablist', { name: 'Line' })
  expect(line.getAttribute('data-variant')).toBe('line')
  expect(line.getAttribute('aria-orientation')).toBe('vertical')
  expect(screen.getByRole('tab', { name: 'B' }).className).toContain('after:bg-foreground')
})

test('Toggle: toggleVariants đủ giá trị shadcn; bấm thì aria-pressed', async () => {
  const u = userEvent.setup()
  render(
    <Toggle variant="outline" size="sm">
      Ghim
    </Toggle>,
  )
  const t = screen.getByRole('button', { name: 'Ghim' })
  expect(t.getAttribute('data-slot')).toBe('toggle')
  expect(t.getAttribute('data-variant')).toBe('outline')
  await u.click(t)
  expect(t.getAttribute('aria-pressed')).toBe('true')
  for (const size of ['default', 'sm', 'lg'] as const) expect(toggleVariants({ size })).toContain('min-w-')
})

test('Table: ngoài TableWrap tự bọc table-container; trong TableWrap thì không; TableCaption', () => {
  const { container } = render(
    <>
      <Table aria-label="Trần">
        <TableCaption>Chú thích</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <TableWrap>
        <Table aria-label="Trong khung">
          <TableBody>
            <TableRow>
              <TableCell>2</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableWrap>
    </>,
  )
  const tran = screen.getByRole('table', { name: 'Trần' })
  expect(tran.parentElement?.getAttribute('data-slot')).toBe('table-container')
  expect(tran.querySelector('caption')?.getAttribute('data-slot')).toBe('table-caption')
  const trong = screen.getByRole('table', { name: 'Trong khung' })
  expect(trong.parentElement?.getAttribute('data-slot')).toBe('table-wrap')
  expect(container.querySelectorAll('[data-slot="table-container"]').length).toBe(1)
})

function DemoSidebar() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Khu CSKH</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Ticket">
                  <span>Ticket</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
      </SidebarInset>
    </SidebarProvider>
  )
}

test('Sidebar shadcn: nút ☰ và Ctrl+B thu về icon (data-state, data-collapsible), ghi cookie', async () => {
  const u = userEvent.setup()
  const { container } = render(<DemoSidebar />)
  const sb = container.querySelector('[data-slot="sidebar"]')!
  expect(sb.getAttribute('data-state')).toBe('expanded')
  expect(screen.getByRole('button', { name: 'Ticket' }).getAttribute('data-active')).toBe('true')
  await u.click(screen.getByRole('button', { name: 'Thu / mở thanh bên' }))
  expect(sb.getAttribute('data-state')).toBe('collapsed')
  expect(sb.getAttribute('data-collapsible')).toBe('icon')
  expect(document.cookie).toContain('sidebar_state=false')
  await u.keyboard('{Control>}b{/Control}')
  expect(sb.getAttribute('data-state')).toBe('expanded')
  // Ctrl+Shift+B không đụng thanh bên
  await u.keyboard('{Control>}{Shift>}B{/Shift}{/Control}')
  expect(sb.getAttribute('data-state')).toBe('expanded')
})

test('Sidebar shadcn ≤767px: thành Sheet trái, ☰ mở hộp thoại có tên, không nút ✕', async () => {
  hep = true
  const u = userEvent.setup()
  render(
    <DsRoot>
      <DemoSidebar />
    </DsRoot>,
  )
  expect(screen.queryByRole('dialog')).toBeNull()
  await u.click(screen.getByRole('button', { name: 'Thu / mở thanh bên' }))
  const hop = await screen.findByRole('dialog', { name: 'Thanh bên' })
  expect(hop.getAttribute('data-mobile')).toBe('true')
  expect(within(hop).queryByRole('button', { name: /đóng/i })).toBeNull()
  expect(within(hop).getByRole('button', { name: 'Ticket' })).toBeTruthy()
})

test('NavigationMenu: bấm trigger mở bảng con (aria-expanded), link trong bảng; Esc đóng', async () => {
  const u = userEvent.setup()
  render(
    <NavigationMenu aria-label="Wiki">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Hướng dẫn</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#lap-dat">Lắp đặt</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>,
  )
  const t = screen.getByRole('button', { name: 'Hướng dẫn' })
  expect(t.getAttribute('data-slot')).toBe('navigation-menu-trigger')
  await u.click(t)
  expect(t.getAttribute('aria-expanded')).toBe('true')
  expect(screen.getByRole('link', { name: 'Lắp đặt' }).getAttribute('data-slot')).toBe('navigation-menu-link')
  await u.keyboard('{Escape}')
  expect(t.getAttribute('aria-expanded')).toBe('false')
})

test('Resizable: vạch role separator có tên, data-slot shadcn; tay nắm khi withHandle', () => {
  const { container } = render(
    <ResizablePanelGroup orientation="horizontal" style={{ width: 600, height: 200 }}>
      <ResizablePanel defaultSize="60%">Trái</ResizablePanel>
      <ResizableHandle withHandle aria-label="Đổi cỡ hai vùng" />
      <ResizablePanel defaultSize="40%">Phải</ResizablePanel>
    </ResizablePanelGroup>,
  )
  expect(container.querySelector('[data-slot="resizable-panel-group"]')).toBeTruthy()
  expect(container.querySelectorAll('[data-slot="resizable-panel"]').length).toBe(2)
  const vach = screen.getByRole('separator', { name: 'Đổi cỡ hai vùng' })
  expect(vach.getAttribute('data-slot')).toBe('resizable-handle')
  expect(vach.querySelector('svg')).toBeTruthy()
})
