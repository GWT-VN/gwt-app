import type { ComponentType } from 'react'
import { KhoiBubble, KhoiBubbleHang } from '../_khoi/khoi-bubble'
import { KhoiCarousel, KhoiCarouselHang } from '../_khoi/khoi-carousel'
import { KhoiChart, KhoiChartHang } from '../_khoi/khoi-chart'
import { KhoiMarker, KhoiMarkerHang } from '../_khoi/khoi-marker'
import { KhoiMessage, KhoiMessageHang } from '../_khoi/khoi-message'

/**
 * Đăng ký khối của Đợt 8 chép shadcn (biểu đồ + chat: Chart, Carousel, Message, Bubble, Marker) — CHỈ agent Đợt 8 sửa file này.
 * KHOI_SC_8: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_SC_8: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 * MessageScroller không có khối riêng: là một hàng trong khối Message. Direction không có khối (app không RTL).
 */
export const KHOI_SC_8: Record<string, ComponentType> = {
  Chart: KhoiChart,
  Carousel: KhoiCarousel,
  Message: KhoiMessage,
  Bubble: KhoiBubble,
  Marker: KhoiMarker,
}
export const HANG_SC_8: Record<string, ComponentType> = {
  chart: KhoiChartHang,
  carousel: KhoiCarouselHang,
  message: KhoiMessageHang,
  bubble: KhoiBubbleHang,
  marker: KhoiMarkerHang,
}
