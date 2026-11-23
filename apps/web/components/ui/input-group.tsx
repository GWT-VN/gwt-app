// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { dinhDangSo, docSo } from '@/lib/dinh-dang-so'
import { Button } from './button'
import { controlOutlineWithin } from './control-styles'

/**
 * InputGroup — khung shadcn Input Group (6 phần; trước 21/11 tên file `input-affix.tsx` — khối /ds + cổng so khớp vẫn
 * mang tên artifact **InputAffix**, R22). Giá trị chép từ `.ui-input-affix` / `.ui-affix` của ds/nguon/bundle.css: KHUNG
 * mang viền (`controlOutlineWithin`: hover, focus-within, lỗi, tắt đọc từ ô con), ô bên trong không viền không nền, phần
 * kèm (đơn vị ₫ %, icon, nút) đứng SÁT ô cách 4.
 * - Nhãn `FieldLabel htmlFor` trỏ ô; lỗi `aria-invalid` + `aria-describedby` đặt lên ô (`InputGroupInput`), khung tự đỏ.
 * - Đơn vị là chữ trang trí → `<InputGroupAddon align="inline-end" aria-hidden="true">₫</InputGroupAddon>`, nhãn nói đơn
 *   vị nếu không hiển nhiên ("Chiết khấu (%)"). Addon có nút thì KHÔNG aria-hidden (nút phải đọc được).
 * - Tiền VND dùng `OTien` (GWT, ghép sẵn), không tự ghép.
 * - Lệch shadcn có chủ đích: khung cao 32 + lề 12 (shadcn 36, lề ở addon); addon không đệm riêng, không gap 8, chữ 400 màu
 *   color-text-tertiary (`.ui-affix`); `InputGroupInput` là `<input>` riêng, không bọc `Input` (Input mang viền + trạng
 *   thái của controlOutline — gỡ bằng className là chồng class, dễ sót trạng thái).
 */
function InputGroup({ className, onClick, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        controlOutlineWithin,
        'group/input-group relative gap-1',
        'has-[>textarea]:h-auto',
        // Addon trên / dưới ô (shadcn block-start / block-end): khung thành cột, cao tự do.
        'has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:items-stretch',
        'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:items-stretch',
        className,
      )}
      // GWT: khung có con trỏ chữ (cursor text như bundle.css) → bấm vào lề khung cũng đưa con trỏ vào ô.
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.querySelector<HTMLElement>('input, textarea')?.focus()
        onClick?.(e)
      }}
      {...props}
    />
  )
}

/** `.ui-affix`: 14/20 400 color-text-tertiary, không co, con trỏ kế thừa khung (chữ / cấm khi tắt); `inline-start` → đứng trước ô (shadcn mặc định), `inline-end` sau. */
const inputGroupAddonVariants = cva(
  [
    'flex h-auto shrink-0 items-center justify-center border-none border-current select-none',
    'text-[14px] leading-[20px] font-normal text-(--color-text-tertiary)',
    '[&>svg]:size-4 [&>svg]:shrink-0 [&>kbd]:rounded-(--radius-xs)',
  ],
  {
    variants: {
      align: {
        // Icon đầu cách chữ 8 như Input có icon (gap khung 4 + 4); nút sát mép khung 4 (shadcn kéo nút ra mép bằng lề âm).
        'inline-start': 'order-first has-[>svg]:mr-1 has-[>button]:-ml-2',
        'inline-end': 'order-last has-[>button]:-mr-2',
        'block-start': 'order-first w-full justify-start pt-2',
        'block-end': 'order-last w-full justify-start pb-2',
      },
    },
    defaultVariants: { align: 'inline-start' },
  },
)

function InputGroupAddon({
  className,
  align = 'inline-start',
  onClick,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        onClick?.(e)
        if ((e.target as HTMLElement).closest('button')) return
        e.currentTarget.parentElement?.querySelector<HTMLElement>('input, textarea')?.focus()
      }}
      {...props}
    />
  )
}

/** Nút trong khung (xoá, hiện mật khẩu, sao chép…): Button `ghost`, cỡ theo thang control (xs 24 · sm 28). */
const inputGroupButtonVariants = cva('flex items-center gap-2 shadow-none', {
  variants: {
    size: {
      xs: 'h-(--control-size-2xs) gap-1 rounded-(--radius-sm) px-2 has-[>svg]:px-2 [&>svg]:size-3.5',
      sm: 'h-(--control-size-sm) gap-1.5 rounded-(--radius-md) px-2.5 has-[>svg]:px-2.5',
      'icon-xs': 'size-(--control-size-2xs) rounded-(--radius-sm) p-0 has-[>svg]:p-0',
      'icon-sm': 'size-(--control-size-sm) p-0 has-[>svg]:p-0',
    },
  },
  defaultVariants: { size: 'xs' },
})

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size'> & VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      size={size ?? 'xs'}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

/** Chữ kèm trong addon (đơn vị, tiền tố "https://"): 14/20 color-text-tertiary, icon 16. */
function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'flex items-center gap-2 border-none border-current text-[14px] leading-[20px] text-(--color-text-tertiary)',
        '[&_svg]:pointer-events-none [&_svg]:size-4',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Ô trong khung (`.ui-input-affix > .ui-input`): lấp chỗ, cao bằng khung, không padding/bo/nền/viền; chữ 14/20
 * color-text 400 (bundle `font: 400`), placeholder color-text-tertiary, tắt chữ color-text-disabled. GWT: số trong FORM căn trái
 * như chữ (CEO chốt 23/11); `data-align="end"` chỉ khi cần thẳng cột chữ số (ô số trong bảng); `inputMode` numeric/decimal → `tabular-nums` (số thẳng cột khi các ô xếp dọc).
 */
function InputGroupInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input-group-control"
      className={cn(
        'h-full min-w-0 flex-1 rounded-none border-none border-current bg-transparent p-0 [outline:none]',
        'text-[14px] leading-[20px] font-normal text-(--color-text) placeholder:text-(--color-text-tertiary)',
        'disabled:cursor-not-allowed disabled:text-(--color-text-disabled)',
        'data-[align=end]:text-right [&[inputmode=numeric]]:tabular-nums [&[inputmode=decimal]]:tabular-nums',
        className,
      )}
      {...props}
    />
  )
}

/** Ô nhiều dòng trong khung: như InputGroupInput, đệm dọc 6 (`.ui-textarea`), cao tối thiểu 80, không kéo giãn. */
function InputGroupTextarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="input-group-control"
      className={cn(
        'min-h-20 w-full min-w-0 flex-1 resize-none rounded-none border-none border-current bg-transparent px-0 py-[6px] [outline:none]',
        'text-[14px] leading-[20px] font-normal text-(--color-text) placeholder:text-(--color-text-tertiary)',
        'disabled:cursor-not-allowed disabled:text-(--color-text-disabled)',
        className,
      )}
      {...props}
    />
  )
}

/** Chỉ số trong chuỗi đã định dạng nằm ngay sau chữ số thứ `n` (0 → đầu ô). */
function viTriSauChuSo(chu: string, n: number) {
  let i = 0
  for (let dem = 0; i < chu.length && dem < n; i++) if (/\d/.test(chu[i])) dem++
  return i
}

/**
 * GWT — OTien: ô tiền VND (component ghép): số tiền KHÔNG ÂM — cần số âm (điều chỉnh, hoàn tiền) thì dùng component
 * khác, đừng mở rộng ô này. Gõ chỉ nhận chữ số, tự chèn dấu chấm hàng nghìn vi-VN, lưu SỐ nguyên; ô trống = `null` (khác
 * 0). Không `type="number"` (mất dấu chấm, con lăn chuột đổi số).
 * - Gõ: chỉ lấy chữ số. Con trỏ giữ sau đúng số chữ số đứng trước nó khi định dạng lại (chèn giữa số, gõ chữ cái giữa
 *   số không nhảy về cuối).
 * - Xoá sát dấu chấm (Backspace sau dấu, Delete trước dấu): trình duyệt chỉ xoá dấu → ô xoá luôn chữ số kề bên. Đọc
 *   theo `inputType` của sự kiện input (deleteContentBackward/Forward), không theo phím → chạy cả trên Android Gboard
 *   (phím xoá có key `Unidentified`).
 * - Dán: đọc cả khối bằng `docSo` (lib/dinh-dang-so.ts) — phần lẻ 1–2 chữ số cuối làm tròn ("1.250.000,00" → 1250000,
 *   "12,5" → 13), dấu âm bị bỏ ("-500.000" → 500000, vẫn báo `onValueChange` như thường). Dán chuỗi không có chữ số: bỏ.
 *   Kéo-thả chữ vào ô đi đường gõ (chỉ lấy chữ số).
 * - Quá `Number.MAX_SAFE_INTEGER` (~9 triệu tỷ): bỏ lần gõ/dán đó, giữ giá trị cũ.
 * - `value` không nguyên (đọc từ cột numeric, vd 1250.5) → hiển thị làm tròn, gõ tiếp không ra số rác.
 * - Chủ ý: xoá chữ số đầu của "1.000" còn "0" (con trỏ trước số 0), gõ tiếp 2 → "20" — ô không tự xoá số 0 còn lại.
 */
function OTien({
  value,
  onValueChange,
  donVi = '₫',
  ...props
}: {
  value: number | null
  onValueChange(v: number | null): void
  donVi?: string
} & Omit<React.ComponentProps<'input'>, 'value' | 'defaultValue' | 'onChange' | 'type'>) {
  const cu = value == null ? '' : String(Math.round(value))
  /** Ghi chuỗi chữ số mới vào ô: định dạng + con trỏ sau chữ số thứ `truoc`, báo giá trị nếu đổi. */
  const ghi = (el: HTMLInputElement, chuSo: string, truoc: number) => {
    const v = chuSo ? Number(chuSo) : null
    // ponytail: quá 2^53 thì bỏ (React trả lại giá trị cũ); cần số lớn hơn thì đổi sang bigint/chuỗi.
    if (v !== null && v > Number.MAX_SAFE_INTEGER) return
    // Ghi chuỗi đã định dạng + con trỏ NGAY tại đây: React thấy DOM đã đúng giá trị mới nên không ghi đè (ghi đè là
    // con trỏ nhảy về cuối). Gõ chữ cái → cùng số → ô trả về như cũ, không gọi onValueChange.
    const chu = v == null ? '' : dinhDangSo(v)
    el.value = chu
    const i = viTriSauChuSo(chu, truoc)
    el.setSelectionRange(i, i)
    if (v !== value) onValueChange(v)
  }
  return (
    <InputGroup>
      <InputGroupInput
        inputMode="numeric"
        autoComplete="off"
        {...props}
        type="text"
        value={cu && dinhDangSo(Number(cu))}
        onPaste={(e) => {
          props.onPaste?.(e)
          if (e.defaultPrevented) return
          e.preventDefault()
          const n = docSo(e.clipboardData.getData('text'))
          if (n === null) return
          const el = e.currentTarget
          const dau = el.selectionStart ?? el.value.length
          const truoc = el.value.slice(0, dau).replace(/\D/g, '') + n
          ghi(el, (truoc + el.value.slice(el.selectionEnd ?? dau)).replace(/\D/g, ''), truoc.length)
        }}
        onChange={(e) => {
          const el = e.currentTarget
          let chuSo = el.value.replace(/\D/g, '')
          let truoc = el.value.slice(0, el.selectionStart ?? el.value.length).replace(/\D/g, '').length
          // Phím xoá chỉ ăn mất dấu chấm (chữ số không đổi) → xoá chữ số kề bên theo chiều xoá.
          const kieu = (e.nativeEvent as InputEvent).inputType
          if (chuSo === cu && kieu === 'deleteContentBackward' && truoc > 0) truoc--
          if (chuSo === cu && (kieu === 'deleteContentBackward' || kieu === 'deleteContentForward'))
            chuSo = chuSo.slice(0, truoc) + chuSo.slice(truoc + 1)
          ghi(el, chuSo, truoc)
        }}
      />
      <InputGroupAddon align="inline-end" aria-hidden="true">
        {donVi}
      </InputGroupAddon>
    </InputGroup>
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
  OTien,
}
