import type { ComponentType } from 'react'
import { KhoiSidebar, KhoiSidebarHang } from '../_khoi/khoi-sidebar'

/**
 * Đăng ký khối của Task 9 lát 4–6 (Sidebar) — CHỈ agent Task 9 sửa file này.
 * KHOI_T9: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_T9: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_T9: Record<string, ComponentType> = { Sidebar: KhoiSidebar }
export const HANG_T9: Record<string, ComponentType> = { sidebar: KhoiSidebarHang }
