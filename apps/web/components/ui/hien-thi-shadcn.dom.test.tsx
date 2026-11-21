// @vitest-environment jsdom
// Đợt 5b chép shadcn: ButtonGroup, Item, Progress, Pagination, AspectRatio, Accordion, Collapsible, ScrollArea, Attachment.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'
import { AspectRatio } from './aspect-ratio'
import {
  Attachment,
  AttachmentAction,
  AttachmentContent,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from './attachment'
import { Button } from './button'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './button-group'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from './item'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination'
import { Progress } from './progress'
import { ScrollArea } from './scroll-area'

test('ButtonGroup: role group + data-slot; vạch ngăn dọc mặc định; hai nút outline kề nhau chồng 1px', () => {
  render(
    <ButtonGroup aria-label="Thao tác">
      <Button variant="outline">Một</Button>
      <Button variant="outline">Hai</Button>
      <ButtonGroupSeparator />
      <ButtonGroupText>Chữ</ButtonGroupText>
    </ButtonGroup>,
  )
  const g = screen.getByRole('group', { name: 'Thao tác' })
  expect(g.getAttribute('data-slot')).toBe('button-group')
  expect(g.className).toContain('[&>*:not(:first-child)]:rounded-l-none')
  expect(g.className).toContain('[&>[data-variant=outline]+[data-variant=outline]]:-ml-px')
  const vach = g.querySelector('[data-slot="button-group-separator"]')
  expect(vach?.getAttribute('data-orientation')).toBe('vertical')
  expect(vach?.className).toContain('bg-(--input)')
  expect(vach?.className).not.toContain('bg-border')
  expect(screen.getByText('Chữ').className).toContain('bg-muted')
})

test('ButtonGroup dọc: data-orientation + chồng theo chiều dọc', () => {
  render(<ButtonGroup orientation="vertical" aria-label="Dọc" />)
  const g = screen.getByRole('group', { name: 'Dọc' })
  expect(g.getAttribute('data-orientation')).toBe('vertical')
  expect(g.className).toContain('flex-col')
  expect(g.className).toContain('-mt-px')
})

test('Item: data-slot/variant/size; asChild thành <a>; ItemGroup role list; ô icon token .ui-file-thumb', () => {
  render(
    <ItemGroup aria-label="Việc">
      <Item role="listitem" variant="outline" size="sm" asChild>
        <a href="#x">
          <ItemMedia variant="icon">i</ItemMedia>
          <ItemContent>
            <ItemTitle>Giao hàng</ItemTitle>
          </ItemContent>
        </a>
      </Item>
    </ItemGroup>,
  )
  const ds = screen.getByRole('list', { name: 'Việc' })
  expect(ds.getAttribute('data-slot')).toBe('item-group')
  const a = screen.getByRole('listitem')
  expect(a.tagName).toBe('A')
  expect(a.getAttribute('data-slot')).toBe('item')
  expect(a.getAttribute('data-variant')).toBe('outline')
  expect(a.getAttribute('data-size')).toBe('sm')
  expect(a.className).toContain('border-(--border)')
  const media = a.querySelector('[data-slot="item-media"]')
  expect(media?.className).toContain('size-(--control-size-md)')
  expect(media?.className).toContain('text-muted-foreground')
})

test('Progress: chuyền value cho Radix → aria-valuenow + data-state; thanh trượt translateX', () => {
  const { rerender } = render(<Progress value={64} aria-label="Đang tải" />)
  const p = screen.getByRole('progressbar', { name: 'Đang tải' })
  expect(p.getAttribute('data-slot')).toBe('progress')
  expect(p.getAttribute('aria-valuenow')).toBe('64')
  expect(p.getAttribute('data-state')).toBe('loading')
  const thanh = p.querySelector<HTMLElement>('[data-slot="progress-indicator"]')
  expect(thanh?.style.transform).toBe('translateX(-36%)')
  rerender(<Progress value={100} aria-label="Đang tải" />)
  expect(p.getAttribute('data-state')).toBe('complete')
})

test('AspectRatio: khung bọc giữ tỉ lệ bằng padding-bottom', () => {
  render(
    <AspectRatio ratio={16 / 9}>
      <span>ảnh</span>
    </AspectRatio>,
  )
  const khung = document.querySelector<HTMLElement>('[data-slot="aspect-ratio"]')
  expect(khung).not.toBeNull()
  expect(khung?.parentElement?.style.paddingBottom).toBe('56.25%')
})

test('Accordion: nút trong heading, bấm mở/thu (aria-expanded, nội dung ẩn hẳn), ↓ chuyển nút', async () => {
  const user = userEvent.setup()
  render(
    <Accordion type="single" collapsible>
      <AccordionItem value="a">
        <AccordionTrigger>Bảo hành</AccordionTrigger>
        <AccordionContent>12 tháng</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Đổi trả</AccordionTrigger>
        <AccordionContent>30 ngày</AccordionContent>
      </AccordionItem>
    </Accordion>,
  )
  const nut = screen.getByRole('button', { name: 'Bảo hành' })
  expect(nut.getAttribute('data-slot')).toBe('accordion-trigger')
  expect(nut.parentElement?.tagName).toBe('H3')
  expect(nut.getAttribute('aria-expanded')).toBe('false')
  expect(screen.queryByText('12 tháng')).toBeNull()
  await user.click(nut)
  expect(nut.getAttribute('aria-expanded')).toBe('true')
  expect(screen.getByText('12 tháng')).toBeTruthy()
  expect(nut.className).toContain('focus-visible:outline-ring')
  await user.keyboard('{ArrowDown}')
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Đổi trả' }))
  await user.click(nut)
  expect(nut.getAttribute('aria-expanded')).toBe('false')
})

test('Collapsible: Trigger asChild Button mang aria-expanded, bấm hiện nội dung', async () => {
  const user = userEvent.setup()
  render(
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="ghost">Xem thêm</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>Thông số</CollapsibleContent>
    </Collapsible>,
  )
  const nut = screen.getByRole('button', { name: 'Xem thêm' })
  expect(nut.getAttribute('aria-expanded')).toBe('false')
  expect(screen.queryByText('Thông số')).toBeNull()
  await user.click(nut)
  expect(nut.getAttribute('aria-expanded')).toBe('true')
  expect(screen.getByText('Thông số').getAttribute('data-slot')).toBe('collapsible-content')
})

test('ScrollArea: Root + Viewport đúng data-slot, nội dung nằm trong viewport', () => {
  render(
    <ScrollArea className="h-20">
      <p>Dòng 1</p>
    </ScrollArea>,
  )
  const vp = document.querySelector('[data-slot="scroll-area-viewport"]')
  expect(vp?.closest('[data-slot="scroll-area"]')?.className).toContain('h-20')
  expect(vp?.contains(screen.getByText('Dòng 1'))).toBe(true)
  expect(vp?.className).toContain('focus-visible:-outline-offset-2')
})

test('Pagination: nav "Phân trang", trang đang xem aria-current + outline, trang khác ghost, trước/sau có tên', () => {
  render(
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#p" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#p">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#p" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#p" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>,
  )
  const nav = screen.getByRole('navigation', { name: 'Phân trang' })
  expect(nav.getAttribute('data-slot')).toBe('pagination')
  const dang = screen.getByRole('link', { name: '2' })
  expect(dang.getAttribute('aria-current')).toBe('page')
  expect(dang.className).toContain('[box-shadow:inset_0_0_0_1px_var(--input)]')
  const khac = screen.getByRole('link', { name: '1' })
  expect(khac.getAttribute('aria-current')).toBeNull()
  expect(khac.className).toContain('hover:bg-accent')
  expect(khac.className).toContain('size-(--control-size-md)')
  expect(screen.getByRole('link', { name: 'Về trang trước' })).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Tới trang sau' })).toBeTruthy()
  expect(nav.querySelector('[data-slot="pagination-ellipsis"]')?.getAttribute('aria-hidden')).toBe('true')
})

test('Attachment: data-state/size/orientation, nút thao tác ghost icon-xs, Trigger là nút type=button hoặc link asChild', () => {
  render(
    <AttachmentGroup>
      <Attachment state="error" size="sm" data-testid="the">
        <AttachmentMedia>i</AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>bao-gia.pdf</AttachmentTitle>
        </AttachmentContent>
        <AttachmentAction aria-label="Bỏ bao-gia.pdf">x</AttachmentAction>
        <AttachmentTrigger aria-label="Xem bao-gia.pdf" />
      </Attachment>
      <Attachment>
        <AttachmentTrigger asChild>
          <a href="#t" aria-label="Mở hop-dong.pdf" />
        </AttachmentTrigger>
      </Attachment>
    </AttachmentGroup>,
  )
  const the = screen.getByTestId('the')
  expect(the.getAttribute('data-slot')).toBe('attachment')
  expect(the.getAttribute('data-state')).toBe('error')
  expect(the.getAttribute('data-size')).toBe('sm')
  expect(the.getAttribute('data-orientation')).toBe('horizontal')
  expect(the.parentElement?.getAttribute('data-slot')).toBe('attachment-group')
  const bo = screen.getByRole('button', { name: 'Bỏ bao-gia.pdf' })
  expect(bo.getAttribute('data-slot')).toBe('attachment-action')
  expect(bo.getAttribute('data-variant')).toBe('ghost')
  expect(bo.getAttribute('data-size')).toBe('icon-xs')
  expect(screen.getByRole('button', { name: 'Xem bao-gia.pdf' }).getAttribute('type')).toBe('button')
  const link = screen.getByRole('link', { name: 'Mở hop-dong.pdf' })
  expect(link.getAttribute('data-slot')).toBe('attachment-trigger')
  expect(link.getAttribute('type')).toBeNull()
  // Mặc định state done, size default.
  expect(link.parentElement?.getAttribute('data-state')).toBe('done')
  expect(link.parentElement?.getAttribute('data-size')).toBe('default')
})
