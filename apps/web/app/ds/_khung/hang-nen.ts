import type { ComponentType } from 'react'
import { KhoiAlertHang } from '../_khoi/khoi-alert'
import { KhoiAvatarHang } from '../_khoi/khoi-avatar'
import { KhoiBadgeHang } from '../_khoi/khoi-badge'
import { KhoiButtonHang } from '../_khoi/khoi-button'
import { KhoiKbdHang } from '../_khoi/khoi-kbd'
import { KhoiTooltipHang } from '../_khoi/khoi-tooltip'

/** Bản hàng biến thể (Nền: Button Badge Avatar Kbd Alert Tooltip) — neo → `Khoi<Ten>Hang` (export từ `_khoi/khoi-<neo>.tsx`). Một agent sở hữu file này. */
export const HANG_NEN: Record<string, ComponentType> = {
  button: KhoiButtonHang,
  badge: KhoiBadgeHang,
  avatar: KhoiAvatarHang,
  kbd: KhoiKbdHang,
  alert: KhoiAlertHang,
  tooltip: KhoiTooltipHang,
}
