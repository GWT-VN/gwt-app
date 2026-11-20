import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Avatar as AvatarPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

/**
 * Avatar — khung shadcn (Radix Avatar), giá trị chép từ `.ui-avatar` trong ds/nguon/bundle.css.
 * - Mọi kiểu nằm trên Root (như span `.ui-avatar` của artifact); Fallback chỉ là chữ — Radix chỉ hiện Fallback khi ảnh
 *   chưa/không tải được, avatar chữ cái (không AvatarImage) luôn hiện.
 * - sm: bundle.css `.ui-avatar[data-size="sm"]` giữ font-size 10px (brief ghi 9px — bundle.css thắng) + line-height 14px.
 * - Bo = --radius-full (không `rounded-full` = calc(infinity*1px)); `border-none border-current` = span artifact không
 *   viền (không ăn preflight `0 solid var(--border)`). Không reset font-feature-settings.
 */
const avatarVariants = cva(
  [
    'relative inline-grid place-content-center shrink-0 rounded-(--radius-full) border-none border-current',
    // bundle.css .ui-avatar: font-size 10px · 600 · letter-spacing 0.02em (số trần đúng bundle.css). Chữ muted-foreground
    // (bản 35, CEO chốt 20/11): đạt AA cả hai theme trên alpha-08 — sáng 5.57:1, tối 5.81:1 (gray-600 tối chỉ 3.94:1).
    'bg-(--alpha-08) text-muted-foreground text-[10px] font-semibold tracking-[0.02em]',
  ],
  {
    variants: {
      size: {
        // 22px. line-height: .ui-avatar không khai → kế thừa (20px từ DsRoot = body bundle.css; 18px trong caption).
        default: 'size-(--control-size-3xs)',
        sm: 'size-5 leading-[14px]', // bundle.css [data-size="sm"]: 20px · line-height 14px
      },
    },
    defaultVariants: { size: 'default' },
  },
)

export function Avatar({
  className,
  size = 'default',
  ...props
}: ComponentProps<typeof AvatarPrimitive.Root> & VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(avatarVariants({ size, className }))}
      {...props}
    />
  )
}

/** Ảnh phủ kín vòng tròn (artifact không có mẫu ảnh — chỉ phủ đúng hộp Root, không thêm kiểu). */
export function AvatarImage({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('absolute inset-0 size-full rounded-[inherit] object-cover', className)}
      {...props}
    />
  )
}

export function AvatarFallback(props: ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return <AvatarPrimitive.Fallback data-slot="avatar-fallback" {...props} />
}

const TIEN_TO = new Set(['anh', 'chị', 'em'])

/**
 * 1–2 chữ cái đầu cho avatar: bỏ tiền tố xưng hô ("anh"/"chị"/"em", không phân biệt hoa thường) ở đầu, lấy chữ đầu
 * của từ đầu + từ cuối, viết hoa (giữ dấu: 'Đức' → 'Đ'). 'chị Nguyễn Thu Hiền' → 'NH' · 'Hiền' → 'H' · '  ' → ''.
 */
export function chuCaiDau(ten: string): string {
  // ponytail: tiền tố nhận theo chữ, không theo ngữ cảnh → tên ngắn bắt đầu bằng "Anh"/"Em" (vd "Anh Thư") mất từ đầu
  // ('T' thay vì 'AT'). Xem lại khi nối dữ liệu `staff` thật (khi đó tên không kèm xưng hô → bỏ luật tiền tố).
  const tu = ten.normalize('NFC').trim().split(/\s+/).filter(Boolean)
  if (tu.length > 1 && TIEN_TO.has(tu[0].toLocaleLowerCase('vi'))) tu.shift()
  if (!tu.length) return ''
  const dau = (s: string) => Array.from(s)[0].toLocaleUpperCase('vi')
  return tu.length === 1 ? dau(tu[0]) : dau(tu[0]) + dau(tu[tu.length - 1])
}
