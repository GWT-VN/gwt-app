import type { ComponentType } from 'react'
import { KhoiDataViewToolbar, KhoiDataViewToolbarHang } from '../_khoi/khoi-data-view-toolbar'
import { KhoiSavedView, KhoiSavedViewHang } from '../_khoi/khoi-saved-view'

/**
 * Đăng ký khối của Task 8 lát 4–6 (DataViewToolbar, SavedView) — CHỈ agent Task 8 sửa file này.
 * KHOI_T8: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_T8: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_T8: Record<string, ComponentType> = {
  DataViewToolbar: KhoiDataViewToolbar,
  SavedView: KhoiSavedView,
}
export const HANG_T8: Record<string, ComponentType> = {
  'data-view-toolbar': KhoiDataViewToolbarHang,
  'saved-view': KhoiSavedViewHang,
}
