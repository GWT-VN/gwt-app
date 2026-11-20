'use client'

import type { ComponentProps } from 'react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { oChon, useNhanChon } from './checkbox'

/**
 * RadioGroup — Radix RadioGroup (Tab vào nhóm focus mục đang chọn, mũi tên đổi lựa chọn, bỏ qua mục tắt). Chọn đúng 1
 * trong 2–5 lựa chọn cần thấy hết; trên 5 → Select, trên 10 → Combobox (CHUAN-FILTER).
 * - Nhóm có tên: `<RadioGroup asChild><FieldSet>` + `FieldLegend` → MỘT phần tử fieldset role radiogroup, tên từ legend,
 *   bố cục `.ui-choices` (dọc gap 8). Lỗi: `aria-describedby` trên FieldSet trỏ `FieldError` + `aria-invalid` trên item.
 * - Xếp ngang (≤ 4 lựa chọn ngắn): `orientation="horizontal"` ĐẶT Ở RadioGroup (hàng xuống dòng, cách cột 20, legend
 *   trọn dòng). Không đặt ở FieldSet khi asChild: Radix truyền data-orientation rỗng qua Slot, FieldSet rải props sau
 *   thuộc tính của nó → bị xoá. `orientation` KHÔNG chuyển cho Radix: Radix có orientation thì bỏ ↑/↓ (chỉ ←/→), còn
 *   radio gốc của trình duyệt nhận cả bốn mũi tên (README Radio "trình duyệt lo").
 * - Không bọc FieldSet: div, tự đặt `aria-label`/`aria-labelledby`.
 */
export function RadioGroup({ className, orientation, ...props }: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      data-orientation={orientation}
      className={cn(
        'flex min-w-0 flex-col gap-2 border-none border-current',
        'data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:flex-wrap data-[orientation=horizontal]:gap-x-5',
        className,
      )}
      {...props}
    />
  )
}

/**
 * RadioGroupItem — `.ui-radio`: vòng 18 (khung chung `oChon` với Checkbox), chọn = viền + chấm 8 giữa màu
 * color-background-primary-solid (chấm vẽ bằng ::after như nguồn, phóng to 120ms, tắt chuyển động khi
 * prefers-reduced-motion). Tắt: chấm gray-300; theme tối nền trong suốt. Nhãn: bọc trong `ChoiceLabel`.
 */
export function RadioGroupItem({ className, ...props }: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  const nhan = useNhanChon(props['aria-describedby'])
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      aria-labelledby={nhan.idNhan}
      className={cn(
        oChon,
        'rounded-(--radius-full) transition-[border-color] duration-150 ease-[ease]',
        'in-data-[theme=dark]:disabled:bg-transparent',
        'enabled:not-aria-invalid:data-[state=checked]:border-(--color-background-primary-solid)',
        'after:size-2 after:rounded-(--radius-full) after:bg-(--color-background-primary-solid)',
        'after:[transform:scale(0)] after:transition-transform after:duration-120 after:ease-[ease]',
        'motion-reduce:after:transition-none data-[state=checked]:after:[transform:scale(1)]',
        'disabled:after:bg-(--gray-300) after:border-none after:border-current',
        className,
      )}
      {...props}
      aria-describedby={nhan.moTa}
    />
  )
}
