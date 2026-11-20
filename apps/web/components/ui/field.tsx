'use client'

import type { ComponentProps, ReactNode } from 'react'
import { Label as LabelPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

/** div/p/label ăn preflight `0 solid var(--border)` của app; artifact không viền (kiểu none, màu currentColor). */
const khongVien = 'border-none border-current'

/**
 * Field — khung trường form (tên theo shadcn Field), giá trị chép từ `.ui-field`, `.ui-label`, `.ui-help`, `.ui-error`,
 * `.ui-choices`, `.ui-field-meta` của ds/nguon/bundle.css.
 * - Câu gợi ý / câu lỗi gắn vào ô qua `aria-describedby` (người gọi đặt id). FieldError KHÔNG mang `role="alert"`
 *   (khác shadcn): ô lỗi nhận focus khi lưu (`focusLoiDau`), trình đọc màn hình đọc câu lỗi qua describedby — thêm
 *   alert là đọc hai lần.
 * - `*` bắt buộc đỏ, `aria-hidden` (nghĩa "bắt buộc" do ô mang `required`/`aria-required`, không đọc dấu sao).
 */

/** `.ui-field`: cột, gap 6, min-width 0. */
export function Field({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="field" className={cn(khongVien, 'flex min-w-0 flex-col gap-1.5', className)} {...props} />
}

/** `.ui-label .req`: dấu * màu color-text-danger, cách chữ một dấu cách như preview. */
function DauBatBuoc({ required }: { required?: boolean }) {
  if (!required) return null
  return (
    <>
      {' '}
      <span aria-hidden="true" className="border-none border-current text-(--color-text-danger)">
        *
      </span>
    </>
  )
}

const nhan = `${khongVien} text-[14px] leading-[20px] font-medium text-foreground`

/** `.ui-label`: 14/20, 500, foreground (Radix Label). `required` → `*` đỏ aria-hidden sau chữ. */
export function FieldLabel({
  className,
  required,
  children,
  ...props
}: ComponentProps<typeof LabelPrimitive.Root> & { required?: boolean }) {
  return (
    <LabelPrimitive.Root data-slot="field-label" className={cn(nhan, className)} {...props}>
      {children}
      <DauBatBuoc required={required} />
    </LabelPrimitive.Root>
  )
}

/** `.ui-help`: 12/18, muted-foreground. */
export function FieldDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn(khongVien, 'm-0 text-[12px] leading-[18px] text-muted-foreground', className)}
      {...props}
    />
  )
}

/** `.ui-error`: 12/18, color-text-danger. Câu nói rõ cách sửa ("Số điện thoại phải có 10 chữ số."). */
export function FieldError({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-error"
      className={cn(khongVien, 'm-0 text-[12px] leading-[18px] text-(--color-text-danger)', className)}
      {...props}
    />
  )
}

/**
 * `.ui-choices`: fieldset không viền/lề, cột gap 8; `orientation="horizontal"` → hàng xuống dòng, cách cột 20 (hàng
 * vẫn 8), legend chiếm trọn dòng. Nhóm lỗi: `aria-describedby` trỏ FieldError (người gọi đặt).
 */
export function FieldSet({
  className,
  orientation = 'vertical',
  ...props
}: ComponentProps<'fieldset'> & { orientation?: 'vertical' | 'horizontal' }) {
  return (
    <fieldset
      data-slot="field-set"
      data-orientation={orientation}
      className={cn(
        'm-0 flex min-w-0 flex-col gap-2 border-none border-current p-0',
        'data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:flex-wrap data-[orientation=horizontal]:gap-x-5',
        'data-[orientation=horizontal]:[&>legend]:w-full',
        className,
      )}
      {...props}
    />
  )
}

/** `.ui-choices > legend.ui-label`: kiểu nhãn, padding 0, cách lựa chọn 6; ngang thì rộng 100%. */
export function FieldLegend({
  className,
  required,
  children,
  ...props
}: ComponentProps<'legend'> & { required?: boolean }) {
  return (
    <legend
      data-slot="field-legend"
      className={cn(nhan, 'mb-1.5 p-0', className)}
      {...props}
    >
      {children}
      <DauBatBuoc required={required} />
    </legend>
  )
}

/**
 * `.ui-field-meta`: hàng dưới ô — trái gợi ý (con, thường là FieldDescription có id cho aria-describedby), phải đếm
 * "dem/toiDa" kiểu `.ui-help` + tabular-nums, không co. Không có gợi ý thì bộ đếm vẫn nằm phải.
 */
export function FieldMeta({
  dem,
  toiDa,
  children,
  className,
}: {
  dem: number
  toiDa: number
  children?: ReactNode
  className?: string
}) {
  return (
    <div data-slot="field-meta" className={cn(khongVien, 'flex justify-between gap-3', className)}>
      {children}
      <span className="ml-auto shrink-0 border-none border-current text-[12px] leading-[18px] text-muted-foreground tabular-nums">
        {dem}/{toiDa}
      </span>
    </div>
  )
}
