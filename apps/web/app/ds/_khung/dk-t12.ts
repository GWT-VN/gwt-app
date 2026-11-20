import type { ComponentType } from 'react'
import { KhoiListView, KhoiListViewHang } from '../_khoi/khoi-list-view'

/**
 * Đăng ký khối của Task 12 lát 4–6 (ListView) — CHỈ agent Task 12 sửa file này.
 * KHOI_T12: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_T12: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_T12: Record<string, ComponentType> = { ListView: KhoiListView }
export const HANG_T12: Record<string, ComponentType> = { 'list-view': KhoiListViewHang }
