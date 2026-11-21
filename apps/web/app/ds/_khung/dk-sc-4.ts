import type { ComponentType } from 'react'
import { KhoiInputOTP, KhoiInputOTPHang } from '../_khoi/khoi-input-otp'
import { KhoiLabel, KhoiLabelHang } from '../_khoi/khoi-label'
import { KhoiNativeSelect, KhoiNativeSelectHang } from '../_khoi/khoi-native-select'
import { KhoiSeparator, KhoiSeparatorHang } from '../_khoi/khoi-separator'
import { KhoiSlider, KhoiSliderHang } from '../_khoi/khoi-slider'

/**
 * Đăng ký khối của Đợt 0+4 chép shadcn (Label, Separator, NativeSelect, InputOTP, Slider) — CHỈ agent Đợt 4 sửa file này.
 * KHOI_SC_4: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_SC_4: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 */
export const KHOI_SC_4: Record<string, ComponentType> = {
  Label: KhoiLabel,
  Separator: KhoiSeparator,
  NativeSelect: KhoiNativeSelect,
  InputOTP: KhoiInputOTP,
  Slider: KhoiSlider,
}
export const HANG_SC_4: Record<string, ComponentType> = {
  label: KhoiLabelHang,
  separator: KhoiSeparatorHang,
  'native-select': KhoiNativeSelectHang,
  'input-otp': KhoiInputOTPHang,
  slider: KhoiSliderHang,
}
