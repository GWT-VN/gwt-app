import type { ComponentType } from 'react'
import { KhoiCardHang } from '../_khoi/khoi-card'
import { KhoiFormLayoutHang } from '../_khoi/khoi-form-layout'

/** Bản hàng biến thể (Card + FormLayout) — neo → `Khoi<Ten>Hang` (export từ `_khoi/khoi-<neo>.tsx`). Một agent sở hữu file này. */
export const HANG_CARD: Record<string, ComponentType> = {
  card: KhoiCardHang,
  'form-layout': KhoiFormLayoutHang,
}
