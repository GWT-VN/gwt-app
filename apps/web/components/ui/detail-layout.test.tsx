import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { DetailHeading, DetailLayout } from './detail-layout'

const html = () =>
  renderToStaticMarkup(
    <DetailLayout chinh={<p>NOI-DUNG</p>} ben={<p>THUOC-TINH</p>} nhanBen="Thuộc tính ticket" />,
  )

test('DOM: nội dung chính TRƯỚC cột thuộc tính (trình đọc màn hình đọc đúng thứ tự logic)', () => {
  const h = html()
  expect(h.indexOf('NOI-DUNG')).toBeGreaterThan(-1)
  expect(h.indexOf('NOI-DUNG')).toBeLessThan(h.indexOf('THUOC-TINH'))
})

test('cột thuộc tính là <aside> có tên; ≤960 lên trên chỉ bằng CSS order, hết sticky', () => {
  const h = html()
  const aside = h.match(/<aside[^>]*>/)?.[0] ?? ''
  expect(aside).toContain('aria-label="Thuộc tính ticket"')
  expect(aside).toContain('sticky')
  expect(aside).toContain('[@media(max-width:960px)]:[order:-1]')
  expect(aside).toContain('[@media(max-width:960px)]:static')
})

test('lưới 1fr + 280 gap 40; ≤960 một cột gap 24', () => {
  const luoi = html().match(/<div[^>]*data-slot="detail-layout"[^>]*>/)?.[0] ?? ''
  expect(luoi).toContain('grid-cols-[minmax(0,1fr)_280px]')
  expect(luoi).toContain('gap-10')
  expect(luoi).toContain('[@media(max-width:960px)]:grid-cols-[minmax(0,1fr)]')
  expect(luoi).toContain('[@media(max-width:960px)]:gap-6')
})

test('benKhiHep="duoi": ≤960 hết sticky nhưng KHÔNG order −1 → thuộc tính ở dưới nội dung', () => {
  const h = renderToStaticMarkup(<DetailLayout chinh={<p>NOI-DUNG</p>} ben={<p>THUOC-TINH</p>} benKhiHep="duoi" />)
  expect(h).toContain('data-ben-hep="duoi"')
  const aside = h.match(/<aside[^>]*>/)?.[0] ?? ''
  expect(aside).toContain('[@media(max-width:960px)]:static')
  expect(aside).not.toContain('order:-1')
  expect(html()).not.toContain('data-ben-hep')
})

test('DetailHeading là h2 mặc định, đổi cấp được', () => {
  expect(renderToStaticMarkup(<DetailHeading>Hoạt động</DetailHeading>)).toMatch(/^<h2[^>]*>Hoạt động<\/h2>$/)
  expect(renderToStaticMarkup(<DetailHeading cap={3}>Mô tả</DetailHeading>)).toMatch(/^<h3/)
})
