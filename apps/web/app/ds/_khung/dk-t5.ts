import type { ComponentType } from 'react'
import { KhoiCommandPalette, KhoiCommandPaletteHang } from '../_khoi/khoi-command-palette'

/**
 * Đăng ký khối của Task 5 lát 4–6 (CommandPalette) — CHỈ agent Task 5 sửa file này.
 * KHOI_T5: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_T5: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_T5: Record<string, ComponentType> = { CommandPalette: KhoiCommandPalette }
export const HANG_T5: Record<string, ComponentType> = { 'command-palette': KhoiCommandPaletteHang }
