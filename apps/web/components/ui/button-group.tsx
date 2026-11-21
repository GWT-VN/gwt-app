// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'
import { Separator } from './separator'

/**
 * ButtonGroup — cụm nút liền nhau (`role="group"`: đặt `aria-label` nói cụm làm gì, vd "Định dạng"). Nút trong cụm:
 * góc trong vuông, góc ngoài giữ bo của nút; cụm lồng cụm cách 8 (`gap-2`). Nút focus phím nổi lên trên (`z-10`) để
 * outline không bị nút kề che.
 * GWT thêm: viền outline của DS Button là box-shadow inset (không phải border) → `border-l-0`/`border-t-0` của shadcn
 * không gộp được hai đường viền; hai nút outline kề nhau chồng 1px (`-ml-px` / `-mt-px`) thành một vạch 1px.
 * File thường (không 'use client'): không hook, khối /ds server dùng được.
 */
const buttonGroupVariants = cva(
  "flex w-fit items-stretch has-[>[data-slot=button-group]]:gap-2 [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none [&>[data-variant=outline]+[data-variant=outline]]:-ml-px',
        vertical:
          'flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none [&>[data-variant=outline]+[data-variant=outline]]:-mt-px',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
)

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

/**
 * Ô chữ trong cụm (đơn vị, tiền tố "https://"). Token: nền `muted`, viền inset 1px `--input` như Button outline (không
 * border → cao bằng nút), bo radius-md, chữ 14/20 medium, đệm ngang 16 (shadcn `px-4`), icon 16. Không `shadow-xs` —
 * nút DS không có bóng.
 */
function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : 'div'

  return (
    <Comp
      className={cn(
        "flex items-center gap-2 rounded-(--radius-md) border-none border-current bg-muted px-4 text-[14px] leading-[20px] font-medium [box-shadow:inset_0_0_0_1px_var(--input)] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

/** Vạch ngăn giữa hai nút đặc (secondary/default) — màu `--input` như viền nút outline, cao theo cụm. */
function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn('relative m-0! self-stretch bg-(--input) data-[orientation=vertical]:h-auto', className)}
      {...props}
    />
  )
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants }
