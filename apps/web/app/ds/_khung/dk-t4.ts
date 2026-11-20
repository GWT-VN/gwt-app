import type { ComponentType } from 'react'
import { KhoiBreadcrumb, KhoiBreadcrumbHang } from '../_khoi/khoi-breadcrumb'
import { KhoiComposer, KhoiComposerHang } from '../_khoi/khoi-composer'
import { KhoiPageHeader, KhoiPageHeaderHang } from '../_khoi/khoi-page-header'
import { KhoiPropertyList, KhoiPropertyListHang } from '../_khoi/khoi-property-list'
import { KhoiTimeline, KhoiTimelineHang } from '../_khoi/khoi-timeline'

/**
 * Đăng ký khối của Task 4 lát 4–6 (Breadcrumb, PageHeader, PropertyList, Timeline, Composer) — CHỈ agent Task 4 sửa file này.
 * KHOI_T4: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_T4: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_T4: Record<string, ComponentType> = {
  Breadcrumb: KhoiBreadcrumb,
  PageHeader: KhoiPageHeader,
  PropertyList: KhoiPropertyList,
  Timeline: KhoiTimeline,
  Composer: KhoiComposer,
}
export const HANG_T4: Record<string, ComponentType> = {
  breadcrumb: KhoiBreadcrumbHang,
  'page-header': KhoiPageHeaderHang,
  'property-list': KhoiPropertyListHang,
  timeline: KhoiTimelineHang,
  composer: KhoiComposerHang,
}
