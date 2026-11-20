import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

const theGoc = (h: string) => h.match(/^<[^>]*>/)?.[0] ?? ''
const lop = (h: string) => (theGoc(h).match(/class="([^"]*)"/)?.[1] ?? '').replaceAll('&amp;', '&').split(' ')

test('Card = .ui-card.ui-card-pad: div data-slot card, viền 1px border, bo radius-xl, nền card, đệm 16, không bóng', () => {
  const h = renderToStaticMarkup(<Card>x</Card>)
  expect(theGoc(h)).toMatch(/^<div data-slot="card"/)
  const c = lop(h)
  expect(c).toEqual(
    expect.arrayContaining([
      'rounded-(--radius-xl)',
      'border',
      'border-solid',
      'border-(--border)',
      'bg-(--card)',
      'text-(--card-foreground)',
      'p-4',
    ]),
  )
  expect(c.some((x) => x.startsWith('shadow'))).toBe(false)
  // khối thường như .ui-card — không flex/gap (FormLayout so khớp đo cả gap, flexDirection)
  expect(c).not.toContain('flex')
  expect(c.some((x) => x.startsWith('gap'))).toBe(false)
})

test('cấu trúc shadcn đủ 7 phần, mỗi phần một data-slot; className người gọi gộp được', () => {
  const h = renderToStaticMarkup(
    <Card className="max-w-90">
      <CardHeader>
        <CardTitle role="heading" aria-level={3}>
          Tiêu đề
        </CardTitle>
        <CardDescription>Mô tả</CardDescription>
        <CardAction>…</CardAction>
      </CardHeader>
      <CardContent>Thân</CardContent>
      <CardFooter>Chân</CardFooter>
    </Card>,
  )
  for (const s of ['card', 'card-header', 'card-title', 'card-description', 'card-action', 'card-content', 'card-footer'])
    expect(h).toContain(`data-slot="${s}"`)
  expect(lop(h)).toContain('max-w-90')
  expect(h).toContain('role="heading" aria-level="3"')
})

test('phần: cách trên 16 khi không đứng đầu; header lưới + cột action; footer nút sát phải cách 8', () => {
  for (const P of [CardHeader, CardContent, CardFooter]) {
    expect(lop(renderToStaticMarkup(<P />))).toEqual(expect.arrayContaining(['not-first:mt-4', 'border-none']))
  }
  expect(lop(renderToStaticMarkup(<CardHeader />))).toEqual(
    expect.arrayContaining(['grid', 'auto-rows-min', 'items-start', 'gap-x-4', 'has-data-[slot=card-action]:grid-cols-[1fr_auto]']),
  )
  expect(lop(renderToStaticMarkup(<CardAction />))).toEqual(
    expect.arrayContaining(['col-start-2', 'row-span-2', 'row-start-1', 'self-start', 'justify-self-end']),
  )
  expect(lop(renderToStaticMarkup(<CardFooter />))).toEqual(
    expect.arrayContaining(['flex', 'items-center', 'justify-end', 'gap-2']),
  )
})

test('chữ: tiêu đề 16/24 600, mô tả 14/20 muted cách trên 4', () => {
  expect(lop(renderToStaticMarkup(<CardTitle />))).toEqual(
    expect.arrayContaining(['text-[16px]', 'leading-[24px]', 'font-semibold']),
  )
  expect(lop(renderToStaticMarkup(<CardDescription />))).toEqual(
    expect.arrayContaining(['mt-1', 'text-[14px]', 'leading-[20px]', 'text-muted-foreground']),
  )
})
