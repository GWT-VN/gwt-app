import type { ComponentType } from 'react'
import { KhoiDateTimePicker, KhoiDateTimePickerHang } from '../_khoi/khoi-date-time-picker'

/**
 * Đăng ký khối của Task 3 lát 7 (DateTimePicker) — CHỈ agent Task 3 sửa file này.
 * KHOI_L7_3: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_L7_3: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_L7_3: Record<string, ComponentType> = { DateTimePicker: KhoiDateTimePicker }
export const HANG_L7_3: Record<string, ComponentType> = { 'date-time-picker': KhoiDateTimePickerHang }
