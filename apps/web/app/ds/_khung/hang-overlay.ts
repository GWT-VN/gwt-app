import type { ComponentType } from 'react'
import { KhoiConfirmDialogHang } from '../_khoi/khoi-confirm-dialog'
import { KhoiContextMenuHang } from '../_khoi/khoi-context-menu'
import { KhoiDialogHang } from '../_khoi/khoi-dialog'
import { KhoiDropdownMenuHang } from '../_khoi/khoi-dropdown-menu'
import { KhoiSheetHang } from '../_khoi/khoi-sheet'

/** Bản hàng biến thể (Overlay: DropdownMenu ContextMenu Dialog ConfirmDialog Sheet) — neo → `Khoi<Ten>Hang` (export từ `_khoi/khoi-<neo>.tsx`). Một agent sở hữu file này. */
export const HANG_OVERLAY: Record<string, ComponentType> = {
  'dropdown-menu': KhoiDropdownMenuHang,
  'context-menu': KhoiContextMenuHang,
  dialog: KhoiDialogHang,
  'confirm-dialog': KhoiConfirmDialogHang,
  sheet: KhoiSheetHang,
}
