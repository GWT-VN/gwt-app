// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import { useMemo, type ComponentProps, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Label } from './label'
import { Separator } from './separator'

/**
 * Field — khung trường form theo shadcn Field (10 phần), giá trị chép từ `.ui-field`, `.ui-label`, `.ui-help`, `.ui-error`,
 * `.ui-choices`, `.ui-field-meta`, `.ui-form-section` của ds/nguon/bundle.css. Phần GWT thêm: `FieldMeta` (bộ đếm ký tự),
 * `required` trên FieldLabel/FieldLegend, `orientation` trên FieldSet.
 * - Câu gợi ý / câu lỗi gắn vào ô qua `aria-describedby` (người gọi đặt id). FieldError KHÔNG mang `role="alert"`
 *   (khác shadcn): ô lỗi nhận focus khi lưu (`focusLoiDau`), trình đọc màn hình đọc câu lỗi qua describedby — thêm
 *   alert là đọc hai lần.
 * - `*` bắt buộc đỏ, `aria-hidden` (nghĩa "bắt buộc" do ô mang `required`/`aria-required`, không đọc dấu sao).
 * - Lệch shadcn có chủ đích (giữ số đo artifact, cổng so khớp): khoảng cách theo token (.ui-field gap 6, không gap 12);
 *   nhãn không flex/w-fit (`.ui-label` trọn bề ngang cột); gợi ý không kéo lề âm (`-mt-1`) — bố cục do gap lo.
 */

/** div/p/label ăn preflight `0 solid var(--border)` của app; artifact không viền (kiểu none, màu currentColor). */
const khongVien = 'border-none border-current'

/**
 * `.ui-choices`: fieldset không viền/lề, cột gap 8; `orientation="horizontal"` (GWT) → hàng xuống dòng, cách cột 20 (hàng
 * vẫn 8), legend chiếm trọn dòng. Nhóm lỗi: `aria-describedby` trỏ FieldError (người gọi đặt).
 */
function FieldSet({
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

/** `.ui-label`: 14/20, 500, foreground. */
const nhan = `${khongVien} text-[14px] leading-[20px] font-medium text-foreground`

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

/**
 * `.ui-choices > legend.ui-label`: kiểu nhãn, padding 0, cách lựa chọn 6. `variant` theo shadcn (`legend` | `label`) —
 * artifact chỉ có MỘT kiểu legend (14/20 500) nên hai giá trị cùng số; `data-variant` giữ cho bên gọi/CSS phân biệt.
 */
function FieldLegend({
  className,
  variant = 'legend',
  required,
  children,
  ...props
}: ComponentProps<'legend'> & { variant?: 'legend' | 'label'; required?: boolean }) {
  return (
    <legend data-slot="field-legend" data-variant={variant} className={cn(nhan, 'mb-1.5 p-0', className)} {...props}>
      {children}
      <DauBatBuoc required={required} />
    </legend>
  )
}

/** Nhóm nhiều Field (một khối form): cột, cách 16 (`.ui-form-section`); nhóm lồng cũng 16. Container query `field-group`. */
function FieldGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        khongVien,
        'group/field-group @container/field-group flex w-full flex-col gap-4 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4',
        className,
      )}
      {...props}
    />
  )
}

/**
 * `.ui-field`: cột, gap 6, min-width 0. `orientation` theo shadcn: `horizontal` = ô + nhãn một hàng (gap 8 như
 * `.ui-checkbox-label`), `responsive` = cột, lên hàng khi FieldGroup ≥ md (container query).
 */
const fieldVariants = cva(`${khongVien} group/field flex min-w-0 data-[invalid=true]:text-(--color-text-danger)`, {
  variants: {
    orientation: {
      vertical: 'flex-col gap-1.5',
      horizontal: [
        'flex-row items-center gap-2',
        '[&>[data-slot=field-label]]:flex-auto',
        'has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      ],
      responsive: [
        'flex-col gap-1.5 @md/field-group:flex-row @md/field-group:items-center @md/field-group:gap-2',
        '@md/field-group:[&>[data-slot=field-label]]:flex-auto',
        '@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      ],
    },
  },
  defaultVariants: { orientation: 'vertical' },
})

function Field({
  className,
  orientation = 'vertical',
  ...props
}: ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

/** Cột nhãn + mô tả cạnh ô chọn (Field ngang): cột, cách 6. */
function FieldContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-content"
      className={cn(khongVien, 'group/field-content flex flex-1 flex-col gap-1.5', className)}
      {...props}
    />
  )
}

/**
 * `.ui-label` trên Label (Radix). `required` (GWT) → `*` đỏ aria-hidden sau chữ. Nhãn BỌC một Field (thẻ lựa chọn) →
 * khung viền `--border` bo radius-lg, đệm 16 con Field; đang chọn viền color-background-primary-solid + nền alpha-04.
 */
function FieldLabel({
  className,
  required,
  children,
  ...props
}: ComponentProps<typeof Label> & { required?: boolean }) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        'group/field-label peer/field-label group-data-[disabled=true]/field:opacity-50',
        'has-[>[data-slot=field]]:flex has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
        'has-[>[data-slot=field]]:rounded-(--radius-lg) has-[>[data-slot=field]]:border-solid has-[>[data-slot=field]]:border-(--border)',
        '[&>*]:data-[slot=field]:p-4',
        // shadcn tô mọi nhãn chứa ô đang chọn; DS chỉ tô thẻ lựa chọn (nhãn bọc Field) — nhãn thường cạnh Switch/Checkbox không đổi nền.
        'has-[>[data-slot=field]]:has-data-[state=checked]:border-(--color-background-primary-solid)',
        'has-[>[data-slot=field]]:has-data-[state=checked]:bg-(--alpha-04)',
        className,
      )}
      {...props}
    >
      {children}
      <DauBatBuoc required={required} />
    </Label>
  )
}

/** Tiêu đề trong FieldContent (không phải `<label>`): 14/20 500, cùng slot `field-label` như shadcn. */
function FieldTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        nhan,
        'flex w-fit items-center gap-2 group-data-[disabled=true]/field:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

/** `.ui-help`: 12/18, muted-foreground; link trong câu gạch chân. */
function FieldDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        khongVien,
        'm-0 text-[12px] leading-[18px] font-normal text-muted-foreground',
        'group-has-[[data-orientation=horizontal]]/field:text-balance',
        '[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

/** Vạch ngăn trong form, có thể kèm chữ giữa ("hoặc"): Separator nằm giữa, chữ 14/20 muted trên nền background. */
function FieldSeparator({ children, className, ...props }: ComponentProps<'div'> & { children?: ReactNode }) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(khongVien, 'relative -my-2 h-5 text-[14px] leading-[20px] group-data-[variant=outline]/field-group:-mb-2', className)}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit border-none border-current bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

/**
 * `.ui-error`: 12/18, color-text-danger. Câu nói rõ cách sửa ("Số điện thoại phải có 10 chữ số."). `errors` theo
 * shadcn (mảng `{ message }`, trùng thì gộp, nhiều câu thành danh sách); không có nội dung → không render.
 */
function FieldError({
  className,
  children,
  errors,
  ...props
}: ComponentProps<'div'> & { errors?: Array<{ message?: string } | undefined> }) {
  const content = useMemo(() => {
    if (children) return children
    if (!errors?.length) return null
    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()]
    if (uniqueErrors.length == 1) return uniqueErrors[0]?.message
    return (
      <ul className="m-0 ml-4 flex list-disc flex-col gap-1 border-none border-current p-0">
        {uniqueErrors.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}
      </ul>
    )
  }, [children, errors])

  if (!content) return null

  return (
    <div
      data-slot="field-error"
      className={cn(khongVien, 'm-0 text-[12px] leading-[18px] font-normal text-(--color-text-danger)', className)}
      {...props}
    >
      {content}
    </div>
  )
}

/**
 * GWT — `.ui-field-meta`: hàng dưới ô — trái gợi ý (con, thường là FieldDescription có id cho aria-describedby), phải
 * đếm "dem/toiDa" kiểu `.ui-help` + tabular-nums, không co. Không có gợi ý thì bộ đếm vẫn nằm phải.
 */
function FieldMeta({
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

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
  FieldMeta,
}
