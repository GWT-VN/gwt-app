import type { ComponentType } from 'react'
import { KhoiCalendar, KhoiCalendarHang } from '../_khoi/khoi-calendar'
import { KhoiCommand, KhoiCommandHang } from '../_khoi/khoi-command'

/**
 * Đăng ký khối của Đợt 7 chép shadcn (lệnh + lịch: Command, Calendar) — CHỈ agent Đợt 7 sửa file này.
 * KHOI_SC_7: tên component (PascalCase, như trong NHOM) → khối trần `Khoi<Ten>` (/ds/tron + cổng so khớp).
 * HANG_SC_7: neo (kebab) → bản hàng biến thể `Khoi<Ten>Hang` (/ds). Import từ `../_khoi/khoi-<neo>`.
 * Toast (code `sonner.tsx`, R22) giữ khối + cổng tên artifact Toast (`khoi-toast.tsx`, đăng ký từ lát 5).
 */
export const KHOI_SC_7: Record<string, ComponentType> = {
  Command: KhoiCommand,
  Calendar: KhoiCalendar,
}
export const HANG_SC_7: Record<string, ComponentType> = {
  command: KhoiCommandHang,
  calendar: KhoiCalendarHang,
}
