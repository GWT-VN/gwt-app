import type { ComponentType } from 'react'
import { KhoiHoverCard, KhoiHoverCardHang } from '../_khoi/khoi-hover-card'

/**
 * Đăng ký khối của Đợt 3 chép shadcn (pop nổi: HoverCard) — CHỈ agent Đợt 3 sửa file này.
 * KHOI_SC_3: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_SC_3: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_SC_3: Record<string, ComponentType> = { HoverCard: KhoiHoverCard }
export const HANG_SC_3: Record<string, ComponentType> = { 'hover-card': KhoiHoverCardHang }
