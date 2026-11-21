import type { ComponentType } from 'react'
import { KhoiAccordion, KhoiAccordionHang } from '../_khoi/khoi-accordion'
import { KhoiAspectRatio, KhoiAspectRatioHang } from '../_khoi/khoi-aspect-ratio'
import { KhoiAttachment, KhoiAttachmentHang } from '../_khoi/khoi-attachment'
import { KhoiButtonGroup, KhoiButtonGroupHang } from '../_khoi/khoi-button-group'
import { KhoiCollapsible, KhoiCollapsibleHang } from '../_khoi/khoi-collapsible'
import { KhoiItem, KhoiItemHang } from '../_khoi/khoi-item'
import { KhoiProgress, KhoiProgressHang } from '../_khoi/khoi-progress'
import { KhoiScrollArea, KhoiScrollAreaHang } from '../_khoi/khoi-scroll-area'

/**
 * Đăng ký khối của Đợt 5 chép shadcn (hiển thị: ButtonGroup, Item, Progress, AspectRatio, Accordion, Collapsible, ScrollArea,
 * Attachment) — CHỈ agent Đợt 5 sửa file này.
 * KHOI_SC_5: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_SC_5: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 * Pagination (shadcn) không có khối riêng: là một hàng trong khối Pagination sẵn có (`khoi-pagination.tsx`, lát 4).
 */
export const KHOI_SC_5: Record<string, ComponentType> = {
  ButtonGroup: KhoiButtonGroup,
  Item: KhoiItem,
  Progress: KhoiProgress,
  AspectRatio: KhoiAspectRatio,
  Accordion: KhoiAccordion,
  Collapsible: KhoiCollapsible,
  ScrollArea: KhoiScrollArea,
  Attachment: KhoiAttachment,
}
export const HANG_SC_5: Record<string, ComponentType> = {
  'button-group': KhoiButtonGroupHang,
  item: KhoiItemHang,
  progress: KhoiProgressHang,
  'aspect-ratio': KhoiAspectRatioHang,
  accordion: KhoiAccordionHang,
  collapsible: KhoiCollapsibleHang,
  'scroll-area': KhoiScrollAreaHang,
  attachment: KhoiAttachmentHang,
}
