import type { ComponentType } from 'react'
import { KhoiComboboxHang } from '../_khoi/khoi-combobox'
import { KhoiDatePickerHang } from '../_khoi/khoi-date-picker'
import { KhoiDateRangePickerHang } from '../_khoi/khoi-date-range-picker'
import { KhoiFileUploadHang } from '../_khoi/khoi-file-upload'

/** Bản hàng biến thể (Form B: Combobox DatePicker DateRangePicker FileUpload) — neo → `Khoi<Ten>Hang` (export từ `_khoi/khoi-<neo>.tsx`). Một agent sở hữu file này. */
export const HANG_FORM_B: Record<string, ComponentType> = {
  combobox: KhoiComboboxHang,
  'date-picker': KhoiDatePickerHang,
  'date-range-picker': KhoiDateRangePickerHang,
  'file-upload': KhoiFileUploadHang,
}
