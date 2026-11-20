import type { ComponentType } from 'react'
import { KhoiBulkActionBar, KhoiBulkActionBarHang } from '../_khoi/khoi-bulk-action-bar'
import { KhoiFilterBar, KhoiFilterBarHang } from '../_khoi/khoi-filter-bar'
import { KhoiPagination, KhoiPaginationHang } from '../_khoi/khoi-pagination'

/**
 * Đăng ký khối của Task 6 lát 4–6 (FilterBar, Pagination, BulkActionBar) — CHỈ agent Task 6 sửa file này.
 * KHOI_T6: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_T6: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_T6: Record<string, ComponentType> = {
  FilterBar: KhoiFilterBar,
  Pagination: KhoiPagination,
  BulkActionBar: KhoiBulkActionBar,
}
export const HANG_T6: Record<string, ComponentType> = {
  'filter-bar': KhoiFilterBarHang,
  pagination: KhoiPaginationHang,
  'bulk-action-bar': KhoiBulkActionBarHang,
}
