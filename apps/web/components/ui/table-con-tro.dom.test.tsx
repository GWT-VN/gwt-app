// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/ds',
  useSearchParams: () => new URLSearchParams(''),
}))

import { KhungChon, OChonDong, useDaChon } from '@/bang'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './context-menu'
import { DsRoot } from './ds-root'
import { Table, TableBody, TableCell, TableRow } from './table'

afterEach(cleanup)

const dong = (ma: string) => document.querySelector<HTMLTableRowElement>(`tr[data-ma="${ma}"]`)!

describe('TableRow — dòng đang trỏ', () => {
  test('`conTro` → data-con-tro; không có thì không gắn', () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-ma="a" conTro>
            <TableCell>a</TableCell>
          </TableRow>
          <TableRow data-ma="b">
            <TableCell>b</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(dong('a').hasAttribute('data-con-tro')).toBe(true)
    expect(dong('b').hasAttribute('data-con-tro')).toBe(false)
    // Kiểu nền alpha-04 theo data-con-tro + vòng focus khi focus phím (cùng class cho mọi dòng — chỉ ăn khi có thuộc tính).
    expect(dong('a').className).toContain('bg-(--alpha-04)')
    expect(dong('a').className).toContain('focus-visible:outline-solid')
  })

  test('ContextMenuTrigger asChild không đè data-state="selected" của dòng đã chọn', () => {
    render(
      <DsRoot>
        <Table>
          <TableBody>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <TableRow data-ma="a" chon>
                  <TableCell>a</TableCell>
                </TableRow>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>Mở</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <TableRow data-ma="b">
                  <TableCell>b</TableCell>
                </TableRow>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>Mở</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </TableBody>
        </Table>
      </DsRoot>,
    )
    expect(dong('a').getAttribute('data-state')).toBe('selected')
    // Dòng chưa chọn giữ data-state của trigger (closed/open) — không bịa "selected".
    expect(dong('b').getAttribute('data-state')).toBe('closed')
  })
})

/** Bảng 5 dòng nối chọn-bằng-bấm của bang/ (KhungChon → useDaChon().bamDong). */
function BangBam({ bat = true }: { bat?: boolean }) {
  const ma = ['a', 'b', 'c', 'd', 'e']
  return (
    <KhungChon khoaTrang={ma} tong={ma.length} bat={bat} thamSo={{}}>
      <Table>
        <TableBody>
          {ma.map((m) => (
            <Dong key={m} ma={m} />
          ))}
        </TableBody>
      </Table>
    </KhungChon>
  )
}
function Dong({ ma }: { ma: string }) {
  const { daChon, bamDong } = useDaChon()
  return (
    <TableRow data-ma={ma} chon={daChon.includes(ma)} onClick={(e) => !(e.target as HTMLElement).closest('input') && bamDong(ma, { mod: e.ctrlKey || e.metaKey, shift: e.shiftKey })}
    >
      <OChonDong khoa={ma} />
      <TableCell>{ma}</TableCell>
    </TableRow>
  )
}
const daChon = () => ['a', 'b', 'c', 'd', 'e'].filter((m) => dong(m).getAttribute('data-state') === 'selected')

describe('KhungChon — chọn bằng bấm dòng (Ctrl/⌘, ⇧)', () => {
  test('bấm thường không chọn; Ctrl bật/tắt; ⇧ chọn dải từ neo', () => {
    render(<BangBam />)
    fireEvent.click(dong('b'))
    expect(daChon()).toEqual([])
    fireEvent.click(dong('b'), { ctrlKey: true })
    expect(daChon()).toEqual(['b'])
    fireEvent.click(dong('d'), { shiftKey: true })
    expect(daChon()).toEqual(['b', 'c', 'd'])
    fireEvent.click(dong('c'), { metaKey: true })
    expect(daChon()).toEqual(['b', 'd'])
  })

  test('bat=false (không có ô chọn): Ctrl / ⇧ + bấm KHÔNG chọn dòng nào', () => {
    render(<BangBam bat={false} />)
    fireEvent.click(dong('b'), { ctrlKey: true })
    fireEvent.click(dong('d'), { shiftKey: true })
    fireEvent.click(dong('e'), { metaKey: true, shiftKey: true })
    expect(daChon()).toEqual([])
  })

  test('tick ô chọn của dòng cũng đặt neo cho ⇧ + bấm', () => {
    render(<BangBam />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Chọn e' }))
    fireEvent.click(dong('c'), { shiftKey: true })
    expect(daChon()).toEqual(['c', 'd', 'e'])
  })
})
