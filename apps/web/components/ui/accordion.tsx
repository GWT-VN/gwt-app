// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import * as React from 'react'
import { CaretDown } from '@phosphor-icons/react/ssr'
import { Accordion as AccordionPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

/**
 * Accordion — nhiều mục mở/thu xếp dọc (Radix Accordion: `type="single"` (+ `collapsible`) hoặc `"multiple"`; nút
 * trong `<h3>`, `aria-expanded`/`aria-controls`; ↑/↓ Home/End chuyển giữa các nút).
 * Token (artifact chưa có Accordion): vạch ngăn mục `--border` (như Separator); nút 14/20 medium màu chữ, đệm dọc 16
 * (shadcn `py-4`), bo radius-md; caret Phosphor 16 `muted-foreground` xoay 180° khi mở (200ms). Focus phím: outline 2
 * `ring` offset 2 (luật focus DS, không quầng như shadcn). Tắt: mờ 50%.
 * Không chép animation trượt `accordion-down/up` của shadcn: cần keyframes của gói `shadcn/tailwind.css` mà DS không nạp
 * — mục mở/thu tức thì.
 */
function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b border-(--border) last:border-b-0', className)}
      {...props}
    />
  )
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="m-0 flex border-none border-current text-[14px] leading-[20px] font-medium">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'flex flex-1 cursor-pointer items-start justify-between gap-4 rounded-(--radius-md) border-none border-current bg-transparent px-0 py-4',
          'text-left text-[14px] leading-[20px] font-medium text-foreground transition-[color] duration-150 ease-[ease] hover:underline',
          '[outline:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring',
          'disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <CaretDown
          aria-hidden="true"
          className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden border-none border-current text-[14px] leading-[20px] motion-safe:data-[state=closed]:animate-[accordion-up_200ms_ease-out] motion-safe:data-[state=open]:animate-[accordion-down_200ms_ease-out]"
      {...props}
    >
      <div className={cn('border-none border-current pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
