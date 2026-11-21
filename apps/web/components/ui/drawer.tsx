// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import type { ComponentProps } from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { cn } from '@/lib/utils'
import { useDsPortal } from './ds-root'
import { desc, header, overlay, title } from './dialog-styles'
import { useNutMo } from './use-nut-mo'

/**
 * Drawer — ngăn kéo vuốt được (vaul 1.1.2, bản Radix của shadcn; vaul dựng trên Radix Dialog). Khung shadcn new-york-v4:
 * 10 export, `data-slot`, hướng qua prop `direction` của `Drawer` (bottom mặc định / top / left / right). Artifact CHƯA
 * có Drawer → gán giá trị của Dialog/Sheet: overlay `.ui-overlay`, nền popover + `--shadow-400` + hairline như
 * `.ui-sheet`, bo `--radius-2xl` (như `.ui-dialog`) ở cạnh trong, padding `--dialog-padding`, tiêu đề/mô tả dùng chung
 * dialog-styles.ts.
 * Dùng khi: thao tác ngắn trên ĐIỆN THOẠI (chọn nhanh, xác nhận gọn) — kéo xuống để đóng. Máy bàn / form dài → Dialog,
 * bộ lọc nhiều trường → Sheet.
 * Phần GWT cộng thêm (shadcn không có):
 * - Portal vào ô của DsRoot (`useDsPortal`); chưa có ô thì không render. z-70 theo thang z dialog/overlay (ds/NGUON.md).
 * - Mở: vaul mặc định KHÔNG dời focus vào ngăn (`autoFocus` false — tránh bật bàn phím iOS) → focus nằm lại nút mở đã bị
 *   `aria-hidden` → trình đọc màn hình lạc. DS đặt `autoFocus` mặc định BẬT: Radix focus phần tử focus được đầu tiên;
 *   `data-autofocus` thắng (use-nut-mo.ts). Màn cần giữ bàn phím iOS đóng thì truyền `autoFocus={false}` + tự lo focus.
 * - Đóng: focus về phần tử đã mở ngăn (use-nut-mo.ts).
 * - Giảm chuyển động: tắt animation/transition trượt của vaul (vaul không tự xét `prefers-reduced-motion`).
 * Radix lo: bẫy Tab, Esc / bấm overlay đóng, khoá cuộn nền, aria-labelledby/describedby → LUÔN có `DrawerTitle`.
 * Thanh kéo (vạch giữa đỉnh) chỉ hiện ở hướng bottom như shadcn, trang trí (`aria-hidden`).
 */
function Drawer({ autoFocus = true, ...props }: ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" autoFocus={autoFocus} {...props} />
}

function DrawerTrigger(props: ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

/** shadcn: Portal trần. DS: mặc định vào ô portal của DsRoot; chưa có ô → không render. */
function DrawerPortal({ container, ...props }: ComponentProps<typeof DrawerPrimitive.Portal>) {
  const o = useDsPortal()
  const dich = container ?? o
  if (!dich) return null
  return <DrawerPrimitive.Portal data-slot="drawer-portal" container={dich} {...props} />
}

function DrawerClose(props: ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({ className, ...props }: ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(overlay, 'motion-reduce:animate-none!', className)}
      {...props}
    />
  )
}

/**
 * Khung theo hướng (shadcn): bottom/top rộng hết, trần cao 80vh, cách mép kia 96 (`mt-24`/`mb-24`), bo cạnh trong;
 * left/right cao hết, rộng 3/4, trần 384 (`sm:max-w-sm`, như `.ui-sheet`). shadcn viền cạnh trong — artifact không
 * viền ngăn/hộp (bóng + hairline đã tách nền) → không chép viền.
 */
const panel = [
  'group/drawer-content fixed z-70 flex h-auto flex-col',
  'border-none border-current outline-none',
  'bg-popover text-popover-foreground [box-shadow:var(--shadow-400),var(--shadow-hairline)]',
  'motion-reduce:animate-none! motion-reduce:transition-none!',
  'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24',
  'data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-(--radius-2xl)',
  'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24',
  'data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-(--radius-2xl)',
  'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0',
  'data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:sm:max-w-sm',
  'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0',
  'data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:sm:max-w-sm',
].join(' ')

function DrawerContent({ className, children, ...props }: ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPanel data-slot="drawer-content" className={cn(panel, className)} {...props}>
        {/* Thanh kéo: shadcn h-2 w-100 bg-muted, mt-4 — DS dùng --muted (nền bậc ba) + bo tròn của thang DS. */}
        <div
          aria-hidden="true"
          className="mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-(--radius-full) border-none border-current bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
        />
        {children}
      </DrawerPanel>
    </DrawerPortal>
  )
}

/** Con trực tiếp của Portal → chỉ mount khi mở (xem useNutMo). Không export. */
function DrawerPanel(props: ComponentProps<typeof DrawerPrimitive.Content>) {
  return <DrawerPrimitive.Content {...props} {...useNutMo(props)} />
}

/**
 * shadcn `flex flex-col gap-0.5 p-4`, căn giữa chữ ở hướng bottom/top (tới `md`). DS: padding --dialog-padding; khoảng
 * tiêu đề ↔ mô tả do `desc` (mt-1) lo như Dialog; giữ căn giữa theo hướng như shadcn (ngăn đáy điện thoại).
 */
function DrawerHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        header,
        'p-(--dialog-padding)',
        'group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:text-left',
        className,
      )}
      {...props}
    />
  )
}

/** shadcn `mt-auto flex flex-col gap-2 p-4`: nút xếp dọc rộng hết (ngón cái), gap 8, padding --dialog-padding. */
function DrawerFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('mt-auto flex flex-col gap-2 p-(--dialog-padding) border-none border-current', className)}
      {...props}
    />
  )
}

function DrawerTitle({ className, ...props }: ComponentProps<typeof DrawerPrimitive.Title>) {
  return <DrawerPrimitive.Title data-slot="drawer-title" className={cn(title, className)} {...props} />
}

function DrawerDescription({ className, ...props }: ComponentProps<typeof DrawerPrimitive.Description>) {
  return <DrawerPrimitive.Description data-slot="drawer-description" className={cn(desc, className)} {...props} />
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
}
