'use client'

// PROTOTYPE — A4 nay DÙNG THẲNG DateTimePicker của DS (lát 7 đã nâng A4 vào DS; CEO 22/11 sửa: hai ô gõ dưới lịch, chỉ chọn
// ngày thì chỉ lưu ngày). Giữ tên ChonHanA4 để trang chon-gio + menu-thuoc-tinh không đổi. Bản tự ghép cũ: git log file này.
import { DateTimePicker } from '@/components/ui/date-time-picker'
import type { PropsHan } from './gio'

export function ChonHanA4({ value, onValueChange, id, gon, ma }: PropsHan) {
  return (
    <DateTimePicker
      id={id}
      gon={gon}
      aria-label={gon ? `Sửa hạn ${ma}` : undefined}
      placeholder={gon ? 'Đặt hạn' : 'Chọn hạn'}
      value={value}
      onValueChange={onValueChange}
    />
  )
}
