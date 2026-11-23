// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import * as React from 'react'
import { Minus } from '@phosphor-icons/react/ssr'
import { OTPInput, OTPInputContext } from 'input-otp'
import { cn } from '@/lib/utils'

/**
 * InputOTP — ô mã một lần (thư viện `input-otp` 1.5.0: MỘT `<input>` thật nằm trong suốt phủ lên các ô vẽ → dán cả mã,
 * tự điền SMS `autocomplete="one-time-code"`, trình đọc màn hình đọc như một ô chữ). Ô vẽ mang số của ô nhập DS
 * (`controlOutline`): 32×32, viền inset 1px `--input`, chữ 14/20 500 tabular-nums; ô đang gõ viền alpha-50 (focus của
 * ô nhập, không quầng); lỗi (`aria-invalid` trên InputOTPSlot) viền red-500 (tối 600). Tắt: mờ 50% như shadcn.
 * - Ô liền nhau trong InputOTPGroup chồng mép 1px (−ml-px) thay cho viền ba cạnh của shadcn — viền inset vẫn một nét,
 *   ô đang gõ nổi lên trên (z-10) nên cả bốn cạnh đổi màu. Bo radius-md 8 ở ô đầu / cuối nhóm.
 * - Tên: `aria-label` (hoặc `FieldLabel htmlFor` + `id`) đặt lên InputOTP — đi thẳng vào `<input>` thật.
 * - Con trỏ giả nhấp nháy `animate-caret-blink` như shadcn (keyframes ở `ds/chuyen-dong.css`); tắt khi prefers-reduced-motion.
 */
function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & { containerClassName?: string }) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn('flex items-center gap-2 has-disabled:opacity-50', containerClassName)}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="input-otp-group" className={cn('flex items-center border-none border-current', className)} {...props} />
}

function InputOTPSlot({ index, className, ...props }: React.ComponentProps<'div'> & { index: number }) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        'relative flex size-(--control-size-md) items-center justify-center border-none border-current bg-transparent',
        '-ml-px first:ml-0 first:rounded-l-(--radius-md) last:rounded-r-(--radius-md)',
        'text-[14px] leading-[20px] font-medium text-(--color-text) tabular-nums',
        'transition-[box-shadow] duration-150 ease-[ease]',
        '[--ctl-invalid:var(--red-500)] in-data-[theme=dark]:[--ctl-invalid:var(--red-600)]',
        '[box-shadow:inset_0_0_0_1px_var(--input)]',
        // Tailwind 4 xếp data-* SAU aria-* → ô đang gõ mà lỗi phải chặn bằng not-aria-invalid để viền đỏ thắng (như shadcn).
        'data-[active=true]:z-10 data-[active=true]:not-aria-invalid:[box-shadow:inset_0_0_0_1px_var(--alpha-50)]',
        'aria-invalid:z-10 aria-invalid:[box-shadow:inset_0_0_0_1px_var(--ctl-invalid)]',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center border-none border-current">
          <div className="h-4 w-px border-none border-current bg-foreground motion-safe:animate-[caret-blink_1.25s_ease-out_infinite]" />
        </div>
      )}
    </div>
  )
}

/** Gạch giữa hai nhóm (vd 3 – 3): icon Minus 16 muted, `role="separator"`. */
function InputOTPSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-separator"
      role="separator"
      className={cn('flex border-none border-current text-muted-foreground [&>svg]:size-4', className)}
      {...props}
    >
      <Minus aria-hidden="true" />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
