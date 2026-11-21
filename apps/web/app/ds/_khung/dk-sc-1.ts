import type { ComponentType } from 'react'
import { KhoiMenubar, KhoiMenubarHang } from '../_khoi/khoi-menubar'

/**
 * Đăng ký khối của Đợt 1 chép shadcn (menu: Menubar) — CHỈ agent Đợt 1 sửa file này.
 * KHOI_SC_1: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_SC_1: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_SC_1: Record<string, ComponentType> = { Menubar: KhoiMenubar }
export const HANG_SC_1: Record<string, ComponentType> = { menubar: KhoiMenubarHang }
