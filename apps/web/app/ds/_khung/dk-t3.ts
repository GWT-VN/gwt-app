import type { ComponentType } from 'react'
import { KhoiToast, KhoiToastHang } from '../_khoi/khoi-toast'

/**
 * Đăng ký khối của Task 3 lát 4–6 (Toast) — CHỈ agent Task 3 sửa file này.
 * KHOI_T3: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_T3: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_T3: Record<string, ComponentType> = { Toast: KhoiToast }
export const HANG_T3: Record<string, ComponentType> = { toast: KhoiToastHang }
