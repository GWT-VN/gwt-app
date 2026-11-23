import type { ComponentType } from 'react'
import { KhoiNavigationMenu, KhoiNavigationMenuHang } from '../_khoi/khoi-navigation-menu'
import { KhoiResizable, KhoiResizableHang } from '../_khoi/khoi-resizable'
import { KhoiToggle, KhoiToggleHang } from '../_khoi/khoi-toggle'

/**
 * Đăng ký khối của Đợt 6 chép shadcn (điều hướng + bảng: NavigationMenu, Toggle, Resizable) — CHỈ agent Đợt 6 sửa file này.
 * KHOI_SC_6: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_SC_6: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_SC_6: Record<string, ComponentType> = {
  NavigationMenu: KhoiNavigationMenu,
  Toggle: KhoiToggle,
  Resizable: KhoiResizable,
}
export const HANG_SC_6: Record<string, ComponentType> = {
  'navigation-menu': KhoiNavigationMenuHang,
  toggle: KhoiToggleHang,
  resizable: KhoiResizableHang,
}
