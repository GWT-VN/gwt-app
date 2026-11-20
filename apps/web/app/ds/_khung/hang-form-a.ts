import type { ComponentType } from 'react'
import { KhoiCheckboxHang } from '../_khoi/khoi-checkbox'
import { KhoiInputHang } from '../_khoi/khoi-input'
import { KhoiInputAffixHang } from '../_khoi/khoi-input-affix'
import { KhoiRadioHang } from '../_khoi/khoi-radio'
import { KhoiSelectHang } from '../_khoi/khoi-select'
import { KhoiSwitchHang } from '../_khoi/khoi-switch'

/** Bản hàng biến thể (Form A: Input InputAffix Checkbox Radio Switch Select) — neo → `Khoi<Ten>Hang` (export từ `_khoi/khoi-<neo>.tsx`). Một agent sở hữu file này. */
export const HANG_FORM_A: Record<string, ComponentType> = {
  input: KhoiInputHang,
  'input-affix': KhoiInputAffixHang,
  checkbox: KhoiCheckboxHang,
  radio: KhoiRadioHang,
  switch: KhoiSwitchHang,
  select: KhoiSelectHang,
}
