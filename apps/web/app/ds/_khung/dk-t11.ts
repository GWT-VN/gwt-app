import type { ComponentType } from 'react'
import { KhoiDetailLayout, KhoiDetailLayoutHang } from '../_khoi/khoi-detail-layout'
import { KhoiNotificationCenter, KhoiNotificationCenterHang } from '../_khoi/khoi-notification-center'
import { KhoiNotificationMatrix, KhoiNotificationMatrixHang } from '../_khoi/khoi-notification-matrix'

/**
 * Đăng ký khối của Task 11 lát 4–6 (DetailLayout, NotificationCenter, NotificationMatrix) — CHỈ agent Task 11 sửa file này.
 * KHOI_T11: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_T11: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_T11: Record<string, ComponentType> = {
  DetailLayout: KhoiDetailLayout,
  NotificationCenter: KhoiNotificationCenter,
  NotificationMatrix: KhoiNotificationMatrix,
}
export const HANG_T11: Record<string, ComponentType> = {
  'detail-layout': KhoiDetailLayoutHang,
  'notification-center': KhoiNotificationCenterHang,
  'notification-matrix': KhoiNotificationMatrixHang,
}
