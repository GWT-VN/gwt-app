// @vitest-environment jsdom
/**
 * Menu không dính mép khung nhìn (ảnh 390: ContextMenu right = 390). DropdownMenuContent/ContextMenuContent mặc định
 * `collisionPadding` 8 (= trần cao `calc(100vh-16px)`, 8px mỗi mép), bên gọi đè được. jsdom không có bố cục nên không
 * đo được vị trí Popper → ghi lại prop chuyển xuống Content của Radix. Vị trí thật đo trên ảnh 390 (chup-ds.mjs).
 */
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './context-menu'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'
import { DsRoot } from './ds-root'

const ghi = vi.hoisted(() => [] as unknown[])

vi.mock('radix-ui', async (goc) => {
  const m = await goc<typeof import('radix-ui')>()
  const { createElement } = await import('react')
  const boc = <T extends { Content: unknown }>(ns: T): T => {
    const Content = ns.Content as React.ElementType
    return {
      ...ns,
      Content: (p: { collisionPadding?: unknown }) => {
        ghi.push(p.collisionPadding)
        return createElement(Content, p)
      },
    }
  }
  return { ...m, DropdownMenu: boc(m.DropdownMenu), ContextMenu: boc(m.ContextMenu) }
})

beforeEach(() => {
  ghi.length = 0
})

async function moDropdown(padding?: number) {
  render(
    <DsRoot>
      <DropdownMenu>
        <DropdownMenuTrigger>Mở</DropdownMenuTrigger>
        <DropdownMenuContent {...(padding === undefined ? {} : { collisionPadding: padding })}>
          <DropdownMenuItem>Sửa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </DsRoot>,
  )
  await userEvent.setup().click(screen.getByRole('button', { name: 'Mở' }))
  await screen.findByRole('menu')
}

async function moContext(padding?: number) {
  render(
    <DsRoot>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div data-testid="dong">Dòng</div>
        </ContextMenuTrigger>
        <ContextMenuContent {...(padding === undefined ? {} : { collisionPadding: padding })}>
          <ContextMenuItem>Sửa</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </DsRoot>,
  )
  fireEvent.contextMenu(screen.getByTestId('dong'), { clientX: 0, clientY: 0 })
  await screen.findByRole('menu')
}

test.each([
  ['DropdownMenu', moDropdown],
  ['ContextMenu', moContext],
])('%s: Content mặc định collisionPadding 8', async (_, mo) => {
  await mo()
  expect(ghi.length).toBeGreaterThan(0)
  expect(new Set(ghi)).toEqual(new Set([8]))
})

test.each([
  ['DropdownMenu', moDropdown],
  ['ContextMenu', moContext],
])('%s: bên gọi đè collisionPadding={0}', async (_, mo) => {
  await mo(0)
  expect(new Set(ghi)).toEqual(new Set([0]))
})
