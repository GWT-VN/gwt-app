// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import * as React from 'react'
import { Slider as SliderPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

/**
 * Slider — thanh kéo chọn số / khoảng số (Radix Slider: núm `role="slider"`, ←/→ ↑/↓ đổi một bước, PageUp/PageDown
 * mười bước, Home/End về đầu/cuối). Một núm = một giá trị; `value`/`defaultValue` hai phần tử = khoảng (từ – đến).
 * Token mượn Switch (`.ui-switch` của bundle.css — artifact chưa có Slider): rãnh cao 6 nền alpha-25, phần đã chọn
 * color-background-primary-solid; núm 16 nền background (tối foreground), viền 1px primary-solid, bóng shadow-hairline +
 * 0 1px 2px alpha-15 như núm Switch. Focus phím: outline 2 ring offset 2 (luật focus DS, không quầng như shadcn ring-4).
 * Tắt: mờ 50%, con trỏ cấm.
 * - GWT thêm `nhan` (chuỗi hoặc mảng theo thứ tự núm) → `aria-label` từng núm: Radix không tự đặt tên cho núm, khoảng
 *   giá cần "Giá từ" / "Giá đến". Thiếu `nhan` thì núm không có tên (nhãn của Root không truyền xuống núm) — luôn truyền.
 * - Chỉ dùng khi con số gần đúng là đủ (lọc khoảng giá, mức độ). Cần số chính xác → ô nhập số; luôn hiện giá trị đang
 *   chọn bằng chữ cạnh thanh (núm không tự hiện số).
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  nhan,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & { nhan?: string | string[] }) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max],
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center border-none border-current select-none data-[disabled]:opacity-50',
        'data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          'relative grow overflow-hidden rounded-(--radius-full) border-none border-current bg-(--alpha-25)',
          'data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full',
          'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5',
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            'absolute border-none border-current bg-(--color-background-primary-solid)',
            'data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full',
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          aria-label={Array.isArray(nhan) ? nhan[index] : nhan}
          className={cn(
            'block size-4 shrink-0 cursor-pointer rounded-(--radius-full) border border-solid border-(--color-background-primary-solid)',
            'bg-background in-data-[theme=dark]:bg-foreground [box-shadow:var(--shadow-hairline),0_1px_2px_var(--alpha-15)]',
            '[outline:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring',
            'data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed',
          )}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
