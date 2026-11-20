'use client'

import type { ComponentProps, MouseEvent } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'
import { buttonVariants } from './button-variants'
import { Spinner } from './spinner'

export { buttonVariants }

/** Loading: chặn bấm lặp — preventDefault để nút submit không gửi lại form, `<a>` asChild không điều hướng. */
const chanBam = (e: MouseEvent<HTMLElement>) => e.preventDefault()

/** Button — số đo, biến thể, trạng thái loading: xem `button-variants.ts`. */
export function Button({
  className,
  variant = 'default',
  size = 'default',
  shape = 'pill',
  asChild = false,
  loading = false,
  disabled,
  type,
  onClick,
  children,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean; loading?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-loading={loading ? '' : undefined}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      disabled={disabled}
      // File 'use client': handler nội bộ (chanBam) không được đi qua ranh giới server → client (khối /ds server render
      // `<Button loading>` từng 500 "Event handlers cannot be passed to Client Component props").
      onClick={loading ? chanBam : onClick}
      // Mặc định "button": nút DS nằm trong <form> không submit nhầm. asChild (vd <a>) không mang type.
      type={asChild ? type : (type ?? 'button')}
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    >
      {/* Loading: nội dung ẩn bằng opacity (vẫn chiếm chỗ → nút không co), spinner nằm đè giữa.
          asChild cần đúng 1 con → không chèn spinner, bên gọi tự lo.
          Bật/tắt loading đổi cây con (bọc/không bọc <span>) → children bị remount, state bên trong children mất. */}
      {loading && !asChild ? (
        <>
          <span className="inline-flex items-center gap-[inherit] opacity-0">{children}</span>
          <Spinner className="absolute inset-0 m-auto" />
        </>
      ) : (
        children
      )}
    </Comp>
  )
}
