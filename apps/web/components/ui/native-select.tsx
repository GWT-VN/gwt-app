// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
import * as React from 'react'
import { CaretDown } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { selectTrigger, selectTriggerSize } from './control-styles'

/**
 * NativeSelect — `<select>` gốc của trình duyệt mặc diện mạo Select trigger (`.ui-select-trigger` qua `selectTrigger`:
 * cao 32, viền inset, hover/focus/lỗi/tắt, chữ 500, chevron 16 muted cách mép phải 12). Danh sách mở là của hệ điều
 * hành (bàn phím, trình đọc màn hình, điện thoại đều chuẩn sẵn) — không tuỳ biến được giao diện mục.
 * - Khi nào: form đơn giản ≤ 10 mục cần chạy không JS / trên điện thoại (bánh xe chọn gốc). Cần ✓, nhóm có kiểu, mục tắt
 *   có lý do → `Select`; quá 10 mục → `Combobox` (luật docs/CHUAN-FILTER.md).
 * - `size` theo shadcn: `default` 32 / `sm` 28. Tên: `FieldLabel htmlFor` trỏ `id`; lỗi `aria-invalid` + `aria-describedby`.
 * - Lệch shadcn có chủ đích: khung bọc rộng trọn cột (shadcn `w-fit`) như mọi ô nhập DS; tắt dùng nền/chữ tắt của
 *   controlOutline (shadcn mờ 50%); chevron không mờ thêm.
 * - Không `'use client'` (như shadcn) → khối server dùng thẳng được.
 */
function NativeSelect({
  className,
  size = 'default',
  ...props
}: Omit<React.ComponentProps<'select'>, 'size'> & { size?: 'sm' | 'default' }) {
  return (
    <div
      className="group/native-select relative w-full min-w-0 border-none border-current"
      data-slot="native-select-wrapper"
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          selectTrigger,
          selectTriggerSize,
          'block appearance-none truncate',
          // chừa chỗ chevron: lề 12 + icon 16 + cách chữ 8 (sm: lề 10).
          'pr-[calc(var(--control-gutter-md)+24px)] data-[size=sm]:pr-[calc(var(--control-gutter-sm)+24px)]',
          className,
        )}
        {...props}
      />
      <CaretDown
        aria-hidden="true"
        data-slot="native-select-icon"
        className={cn(
          'pointer-events-none absolute top-1/2 right-(--control-gutter-md) size-4 -translate-y-1/2 select-none text-muted-foreground',
          'group-has-[select[data-size=sm]]/native-select:right-(--control-gutter-sm)',
        )}
      />
    </div>
  )
}

/** Mục: màu hệ thống (Canvas/CanvasText) như shadcn — danh sách gốc theo theme hệ điều hành, không theo token. */
function NativeSelectOption({ className, ...props }: React.ComponentProps<'option'>) {
  return <option data-slot="native-select-option" className={cn('bg-[Canvas] text-[CanvasText]', className)} {...props} />
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<'optgroup'>) {
  return (
    <optgroup data-slot="native-select-optgroup" className={cn('bg-[Canvas] text-[CanvasText]', className)} {...props} />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
