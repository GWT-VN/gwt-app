import type { ComponentType } from 'react'
import { KhoiMenuThuocTinh, KhoiMenuThuocTinhHang } from '../_khoi/khoi-menu-thuoc-tinh'

/**
 * Đăng ký khối của Task 4 lát 7 (khối mẫu ghép MenuThuocTinh) — CHỈ agent Task 4 sửa file này.
 * KHOI_L7_4: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_L7_4: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_L7_4: Record<string, ComponentType> = { MenuThuocTinh: KhoiMenuThuocTinh }
export const HANG_L7_4: Record<string, ComponentType> = { 'menu-thuoc-tinh': KhoiMenuThuocTinhHang }
