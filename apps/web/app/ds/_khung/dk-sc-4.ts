import type { ComponentType } from 'react'

/**
 * Đăng ký khối của Đợt 0+4 chép shadcn (Label, Separator, NativeSelect, InputOTP, Slider) — CHỈ agent Đợt 4 sửa file này.
 * KHOI_SC_4: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_SC_4: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_SC_4: Record<string, ComponentType> = {}
export const HANG_SC_4: Record<string, ComponentType> = {}
