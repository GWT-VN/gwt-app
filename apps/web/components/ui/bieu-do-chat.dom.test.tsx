// @vitest-environment jsdom
// Đợt 8 chép shadcn: Chart, Carousel, Message, MessageScroller, Bubble, Marker, Direction.
import { fireEvent, render, screen } from '@testing-library/react'
import { Bar, BarChart, XAxis } from 'recharts'
import { afterEach, beforeAll, expect, test, vi } from 'vitest'
import { Bubble, BubbleContent, BubbleReactions } from './bubble'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from './carousel'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from './chart'
import { DirectionProvider, useDirection } from './direction'
import { Marker, MarkerContent, MarkerIcon } from './marker'
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from './message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from './message-scroller'

// Embla đọc matchMedia + IntersectionObserver; jsdom không có (ResizeObserver đã polyfill chung ở vitest.setup-dom.ts).
beforeAll(() => {
  window.matchMedia ??= ((q: string) => ({
    matches: false,
    media: q,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
  globalThis.IntersectionObserver ??= class {
    root = null
    rootMargin = ''
    thresholds = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
})

afterEach(() => {
  vi.restoreAllMocks()
})

const config = {
  online: { label: 'Online', color: 'var(--blue-400)' },
  cuaHang: { label: 'Cửa hàng', theme: { light: 'var(--orange-500)', dark: 'var(--orange-400)' } },
} satisfies ChartConfig
const data = [
  { thang: 'T6', online: 186, cuaHang: 80 },
  { thang: 'T7', online: 305, cuaHang: 200 },
]

test('Chart: data-slot, biến màu theo config, theme tối theo selector DS (không .dark), chữ trục chọn lớp tick-value', () => {
  const { container } = render(
    <ChartContainer config={config} id="demo">
      <BarChart data={data}>
        <Bar dataKey="online" fill="var(--color-online)" />
      </BarChart>
    </ChartContainer>,
  )
  const khung = container.querySelector('[data-slot="chart"]')!
  expect(khung.getAttribute('data-chart')).toBe('chart-demo')
  const css = khung.querySelector('style')!.innerHTML
  expect(css).toContain('--color-online: var(--blue-400);')
  expect(css).toContain('[data-ds="v2"][data-theme="dark"] [data-chart=chart-demo]')
  expect(css).toContain('--color-cuaHang: var(--orange-400);')
  expect(css).not.toContain('.dark')
  expect(khung.className).toContain('[&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground')
  expect(khung.className).toContain('text-[12px] leading-[18px]')
})

test('ChartTooltipContent: nhãn + tên chuỗi theo config + số; nền popover, bo radius-lg, bóng token', () => {
  // ResponsiveContainer đo khung bằng getBoundingClientRect (jsdom = 0 → không vẽ) → giả khung 320 × 200.
  vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue({ x: 0, y: 0, top: 0, left: 0, right: 320, bottom: 200, width: 320, height: 200, toJSON: () => ({}) })
  const { container } = render(
    <ChartContainer config={config}>
      <BarChart data={data}>
        <XAxis dataKey="thang" />
        <ChartTooltip content={<ChartTooltipContent />} defaultIndex={1} />
        <Bar dataKey="online" fill="var(--color-online)" />
        <Bar dataKey="cuaHang" fill="var(--color-cuaHang)" />
      </BarChart>
    </ChartContainer>,
  )
  const hop = [...container.querySelectorAll('div')].find((d) => d.className.includes('bg-popover'))
  expect(hop).toBeTruthy()
  expect(hop!.textContent).toContain('T7')
  expect(hop!.textContent).toContain('Online')
  expect(hop!.textContent).toContain('Cửa hàng')
  expect(hop!.textContent).toContain('305')
  expect(hop!.className).toContain('rounded-(--radius-lg)')
  expect(hop!.className).toContain('[box-shadow:var(--shadow),var(--shadow-hairline)]')
  expect(hop!.className).not.toContain('shadow-xl')
})

test('Carousel: vùng region "băng chuyền", mục group "trang", nút tiếng Việt, ←/→ gọi Embla', () => {
  let api: CarouselApi
  render(
    <Carousel aria-label="Ảnh demo" setApi={(a) => (api = a)}>
      <CarouselContent>
        {[1, 2, 3].map((n) => (
          <CarouselItem key={n} aria-label={`${n} / 3`}>
            {n}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>,
  )
  const vung = screen.getByRole('region', { name: 'Ảnh demo' })
  expect(vung.getAttribute('aria-roledescription')).toBe('băng chuyền')
  expect(vung.getAttribute('data-slot')).toBe('carousel')
  expect(screen.getByRole('group', { name: '2 / 3' }).getAttribute('aria-roledescription')).toBe('trang')
  const truoc = screen.getByRole('button', { name: 'Mục trước' })
  expect(truoc.getAttribute('data-slot')).toBe('carousel-previous')
  expect(truoc.getAttribute('data-variant')).toBe('outline')
  expect(truoc.className).not.toContain('rounded-full')
  expect(screen.getByRole('button', { name: 'Mục sau' }).getAttribute('data-slot')).toBe('carousel-next')
  expect(api!).toBeTruthy()
  const sau = vi.spyOn(api!, 'scrollNext')
  const lui = vi.spyOn(api!, 'scrollPrev')
  fireEvent.keyDown(vung, { key: 'ArrowRight' })
  fireEvent.keyDown(vung, { key: 'ArrowLeft' })
  expect(sau).toHaveBeenCalledTimes(1)
  expect(lui).toHaveBeenCalledTimes(1)
})

test('Message: align end đảo hàng, ảnh bo radius-full, đầu/chân chữ 12/18 muted', () => {
  const { container } = render(
    <Message align="end">
      <MessageAvatar>AN</MessageAvatar>
      <MessageContent>
        <MessageHeader>Bạn</MessageHeader>
        <MessageFooter>09:06</MessageFooter>
      </MessageContent>
    </Message>,
  )
  const m = container.querySelector('[data-slot="message"]')!
  expect(m.getAttribute('data-align')).toBe('end')
  expect(m.className).toContain('data-[align=end]:flex-row-reverse')
  expect(container.querySelector('[data-slot="message-avatar"]')!.className).toContain('rounded-(--radius-full)')
  for (const s of ['message-header', 'message-footer']) {
    const c = container.querySelector(`[data-slot="${s}"]`)!.className
    expect(c).toContain('text-[12px] leading-[18px]')
    expect(c).toContain('text-muted-foreground')
  }
})

test('MessageScroller: vùng "Tin nhắn" focus được, nội dung role log, nút cuộn ẩn (inert) khi đang ở cuối', () => {
  render(
    <MessageScrollerProvider>
      <MessageScroller>
        <MessageScrollerViewport>
          <MessageScrollerContent>
            <MessageScrollerItem messageId="t1">Chào bạn</MessageScrollerItem>
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>,
  )
  const vung = screen.getByRole('region', { name: 'Tin nhắn' })
  expect(vung.getAttribute('tabindex')).toBe('0')
  expect(vung.className).toContain('focus-visible:outline-ring')
  expect(screen.getByRole('log').textContent).toContain('Chào bạn')
  const nut = document.querySelector('[data-slot="message-scroller-button"]')!
  expect(nut.getAttribute('data-active')).toBe('false')
  expect(nut.hasAttribute('inert')).toBe(true)
  expect(nut.textContent).toBe('Cuộn xuống cuối')
  expect(nut.className).toContain('bg-background')
  expect(nut.className).not.toContain('bg-secondary')
})

test('Bubble: đủ 7 variant, destructive dùng danger-soft-alpha như Badge, asChild thành nút có vòng focus', () => {
  const ds = ['default', 'secondary', 'muted', 'tinted', 'outline', 'ghost', 'destructive'] as const
  const { container } = render(
    <>
      {ds.map((v) => (
        <Bubble key={v} variant={v}>
          <BubbleContent>{v}</BubbleContent>
        </Bubble>
      ))}
      <Bubble variant="outline">
        <BubbleContent asChild>
          <button type="button">Gợi ý</button>
        </BubbleContent>
        <BubbleReactions aria-label="2 lượt thích">2</BubbleReactions>
      </Bubble>
    </>,
  )
  const bong = [...container.querySelectorAll('[data-slot="bubble"]')]
  expect(bong.map((b) => b.getAttribute('data-variant'))).toEqual([...ds, 'outline'])
  const huy = bong[6].className
  expect(huy).toContain('bg-(--color-background-danger-soft-alpha)')
  expect(huy).not.toContain('dark:')
  expect(bong[3].className).toContain('in-data-[theme=dark]:')
  const nut = screen.getByRole('button', { name: 'Gợi ý' })
  expect(nut.getAttribute('data-slot')).toBe('bubble-content')
  expect(nut.className).toContain('[button,a]:focus-visible:outline-2')
  expect(nut.className).not.toContain('outline-none')
  const cx = container.querySelector('[data-slot="bubble-reactions"]')!
  expect(cx.getAttribute('data-side')).toBe('bottom')
  expect(cx.className).toContain('rounded-(--radius-full)')
})

test('Marker: biến thể separator/border, icon aria-hidden', () => {
  const { container } = render(
    <>
      <Marker variant="separator">
        <MarkerContent>Hôm nay</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerIcon>i</MarkerIcon>
        <MarkerContent>Tin chưa đọc</MarkerContent>
      </Marker>
    </>,
  )
  const [a, b] = container.querySelectorAll('[data-slot="marker"]')
  expect(a.getAttribute('data-variant')).toBe('separator')
  expect(a.className).toContain('before:bg-border')
  expect(b.className).toContain('border-b border-border pb-2')
  expect(container.querySelector('[data-slot="marker-icon"]')!.getAttribute('aria-hidden')).toBe('true')
})

test('DirectionProvider: prop direction (shadcn) đè dir', () => {
  function Doc() {
    return <span>{useDirection()}</span>
  }
  render(
    <DirectionProvider dir="ltr" direction="rtl">
      <Doc />
    </DirectionProvider>,
  )
  expect(screen.getByText('rtl')).toBeTruthy()
})
