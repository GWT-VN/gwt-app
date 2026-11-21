import type { ComponentType } from 'react'
import { KhoiDrawer, KhoiDrawerHang } from '../_khoi/khoi-drawer'

/**
 * Đăng ký khối của Đợt 2 chép shadcn (overlay: Drawer) — CHỈ agent Đợt 2 sửa file này.
 * KHOI_SC_2: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_SC_2: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_SC_2: Record<string, ComponentType> = { Drawer: KhoiDrawer }
export const HANG_SC_2: Record<string, ComponentType> = { drawer: KhoiDrawerHang }
