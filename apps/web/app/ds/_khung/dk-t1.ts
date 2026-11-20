import type { ComponentType } from 'react'
import { KhoiCount, KhoiCountHang } from '../_khoi/khoi-count'
import { KhoiTabs, KhoiTabsHang } from '../_khoi/khoi-tabs'

/**
 * Đăng ký khối của Task 1 lát 4–6 (Tabs, Count) — CHỈ agent Task 1 sửa file này.
 * KHOI_T1: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_T1: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_T1: Record<string, ComponentType> = { Tabs: KhoiTabs, Count: KhoiCount }
export const HANG_T1: Record<string, ComponentType> = { tabs: KhoiTabsHang, count: KhoiCountHang }
