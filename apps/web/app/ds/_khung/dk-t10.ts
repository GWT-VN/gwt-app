import type { ComponentType } from 'react'
import { KhoiInlineEdit, KhoiInlineEditHang } from '../_khoi/khoi-inline-edit'
import { KhoiRecordPicker, KhoiRecordPickerHang } from '../_khoi/khoi-record-picker'

/**
 * Đăng ký khối của Task 10 lát 4–6 (InlineEdit, RecordPicker) — CHỈ agent Task 10 sửa file này.
 * KHOI_T10: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_T10: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_T10: Record<string, ComponentType> = { InlineEdit: KhoiInlineEdit, RecordPicker: KhoiRecordPicker }
export const HANG_T10: Record<string, ComponentType> = {
  'inline-edit': KhoiInlineEditHang,
  'record-picker': KhoiRecordPickerHang,
}
