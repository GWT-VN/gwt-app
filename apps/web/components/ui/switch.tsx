'use client'

import { createContext, useContext, useId, type ComponentProps, type ReactNode } from 'react'
import { Switch as SwitchPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

/**
 * Switch — công tắc bật/tắt (Radix Switch: nút `role="switch"`, Space bật/tắt), giá trị chép từ `.ui-switch` của
 * ds/nguon/bundle.css. Nguồn vẽ núm bằng `::after` của input; ở đây núm là `SwitchPrimitive.Thumb`.
 * - Rãnh 32×18 (bundle gõ `width: 32px; height: 18px; margin: 1px 0 0`), bo token radius-full = 9999px (không dùng
 *   utility bo-full của Tailwind 4: nó ra calc(infinity) → computed lệch nguồn). Tắt alpha-25, rê alpha-30; bật
 *   color-background-primary-solid, rê color-background-primary-solid-hover.
 * - Núm 14, cách mép 2, nền background (tối foreground), bật color-text-primary-solid; bóng shadow-hairline + 0 1px 2px
 *   alpha-15; trượt 14px trong 150ms, tắt hiệu ứng khi prefers-reduced-motion.
 * - Focus phím: outline 2 ring, offset 2. Tắt: opacity 0.5, not-allowed.
 * - Rê chuột chia theo trạng thái (unchecked / checked) vì biến thể hover + enabled đặc hiệu cao hơn data-state: viết
 *   chung một hover sẽ đè màu "bật". Tắt (disabled) KHÔNG đổi màu khi rê — bundle.css thì có (`.ui-switch:hover` không
 *   loại `:disabled`); DS nhất quán với ô nhập tắt (lyDo trong ds/so-khop/switch.json).
 */
export function Switch({
  className,
  'aria-describedby': describedBy,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root>) {
  const hang = useContext(HangCtx)
  const moTa = [hang?.idMoTa, describedBy].filter(Boolean).join(' ')
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      aria-labelledby={hang?.idNhan}
      aria-describedby={moTa || undefined}
      className={cn(
        'relative mt-px inline-block h-[18px] w-8 shrink-0 cursor-pointer rounded-(--radius-full) border-none border-current p-0',
        'bg-(--alpha-25) transition-[background-color] duration-150 ease-[ease]',
        'data-[state=checked]:bg-(--color-background-primary-solid)',
        'data-[state=unchecked]:enabled:hover:bg-(--alpha-30)',
        'data-[state=checked]:enabled:hover:bg-(--color-background-primary-solid-hover)',
        '[outline:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none absolute top-0.5 left-0.5 block size-3.5 rounded-(--radius-full) border-none border-current',
          'bg-background in-data-[theme=dark]:bg-foreground',
          '[box-shadow:var(--shadow-hairline),0_1px_2px_var(--alpha-15)]',
          'transition-transform duration-150 ease-[cubic-bezier(0.19,1,0.22,1)] motion-reduce:transition-none',
          'data-[state=checked]:translate-x-3.5 data-[state=checked]:bg-(--color-text-primary-solid)',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

/** Id nhãn + mô tả của SwitchRow bao ngoài (context, không cloneElement: con đi qua ranh giới server → client là phần
 * tử lười, không đọc được props lúc SSR). Prop `aria-labelledby` truyền thẳng cho Switch vẫn thắng (rải sau). */
const HangCtx = createContext<{ idNhan: string; idMoTa?: string } | null>(null)

const khongVien = 'border-none border-current'

/**
 * SwitchRow — hàng cài đặt `.ui-switch-row`: nhãn (+ mô tả `.ui-help`) trái, công tắc phải, gap 16, căn đầu dòng.
 * - Cả hàng là `<label>` → bấm chữ (nhãn hay mô tả) cũng đổi công tắc.
 * - Tên đọc được = `nhan` (qua `aria-labelledby`, không lẫn mô tả); `moTa` nối `aria-describedby` của Switch.
 * - Switch con tắt → nhãn color-text-disabled (preview gõ style inline lên nhãn hàng tắt).
 * - Dựng y DOM preview: có mô tả thì bọc span (nhãn block + mô tả inline), không có thì nhãn đứng thẳng trong hàng.
 */
export function SwitchRow({
  nhan,
  moTa,
  children,
  className,
  ...props
}: Omit<ComponentProps<'label'>, 'children'> & {
  nhan: ReactNode
  moTa?: ReactNode
  /** Một `<Switch>` (đọc id nhãn/mô tả qua context). */
  children: ReactNode
}) {
  const id = useId()
  const idNhan = `${id}-nhan`
  const idMoTa = `${id}-mota`
  const nhanEl = (
    <span
      id={idNhan}
      data-slot="switch-row-label"
      className={cn(
        khongVien,
        'text-[14px] leading-[20px] font-medium text-foreground',
        'group-has-disabled/switch-row:text-(--color-text-disabled)',
        moTa != null && 'block',
      )}
    >
      {nhan}
    </span>
  )
  return (
    <label
      data-slot="switch-row"
      className={cn(khongVien, 'group/switch-row flex items-start justify-between gap-4', className)}
      {...props}
    >
      {moTa != null ? (
        <span className={khongVien}>
          {nhanEl}
          <span
            id={idMoTa}
            data-slot="switch-row-description"
            className={cn(khongVien, 'text-[12px] leading-[18px] text-muted-foreground')}
          >
            {moTa}
          </span>
        </span>
      ) : (
        nhanEl
      )}
      <HangCtx.Provider value={{ idNhan, idMoTa: moTa != null ? idMoTa : undefined }}>{children}</HangCtx.Provider>
    </label>
  )
}
