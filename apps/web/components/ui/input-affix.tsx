'use client'

import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { dinhDangSo, docSo } from '@/lib/dinh-dang-so'
import { controlOutlineWithin } from './control-styles'

/**
 * InputAffix — ô nhập có chữ cố định trong ô (₫, %, kg). Khung shadcn InputGroup, giá trị chép từ `.ui-input-affix` /
 * `.ui-affix` của ds/nguon/bundle.css: KHUNG mang viền (`controlOutlineWithin`: hover, focus-within, lỗi, tắt đọc từ ô
 * con), ô số bên trong không viền không nền, đơn vị đứng SÁT số cách 4.
 * - Nhãn `FieldLabel htmlFor` trỏ ô; lỗi `aria-invalid` + `aria-describedby` đặt lên ô (`InputGroupInput`), khung tự đỏ.
 * - Đơn vị là chữ trang trí (`aria-hidden`) → nhãn nói đơn vị nếu không hiển nhiên ("Chiết khấu (%)").
 * - Tiền VND dùng `OTien` (ghép sẵn), không tự ghép.
 */
export function InputGroup({ className, onClick, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      className={cn(controlOutlineWithin, 'gap-1', className)}
      // Khung có con trỏ chữ (cursor text như bundle.css) → bấm vào lề/đơn vị cũng đưa con trỏ vào ô.
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.slot === 'input-group-addon')
          e.currentTarget.querySelector('input')?.focus()
        onClick?.(e)
      }}
      {...props}
    />
  )
}

/**
 * Ô trong khung (`.ui-input-affix > .ui-input`): lấp chỗ, cao bằng khung, không padding/bo/nền/viền; chữ 14/20
 * color-text 400 (bundle `font: 400`), placeholder color-text-tertiary, tắt chữ color-text-disabled. `data-align="end"` căn phải;
 * `inputMode` numeric/decimal → `tabular-nums` (số thẳng cột khi các ô xếp dọc).
 */
export function InputGroupInput({ className, ...props }: ComponentProps<'input'>) {
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

/** Đơn vị (`.ui-affix`): 14/20 color-text-tertiary, không co, không bắt chuột; `inline-start` → đứng trước số. */
export function InputGroupAddon({
  className,
  align = 'inline-end',
  ...props
}: ComponentProps<'span'> & { align?: 'inline-start' | 'inline-end' }) {
  return (
    <span
      data-slot="input-group-addon"
      data-align={align}
      aria-hidden="true"
      className={cn(
        'pointer-events-none shrink-0 border-none border-current text-[14px] leading-[20px] text-(--color-text-tertiary)',
        align === 'inline-start' && 'order-first',
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
 * OTien — ô tiền VND (component ghép): gõ chỉ nhận chữ số, tự chèn dấu chấm hàng nghìn vi-VN, lưu SỐ nguyên; ô trống
 * = `null` (khác 0). Không `type="number"` (mất dấu chấm, con lăn chuột đổi số). Con trỏ giữ sau đúng số chữ số đứng
 * trước nó khi định dạng lại (chèn giữa số không nhảy về cuối); Backspace/Delete sát dấu chấm nhảy qua dấu để xoá chữ số.
 */
export function OTien({
  value,
  onValueChange,
  donVi = '₫',
  onKeyDown,
  ...props
}: {
  value: number | null
  onValueChange(v: number | null): void
  donVi?: string
} & Omit<ComponentProps<'input'>, 'value' | 'defaultValue' | 'onChange' | 'type'>) {
  return (
    <InputGroup>
      <InputGroupInput
        inputMode="numeric"
        data-align="end"
        autoComplete="off"
        {...props}
        type="text"
        value={value == null ? '' : dinhDangSo(value)}
        onKeyDown={(e) => {
          const el = e.currentTarget
          const c = el.selectionStart ?? 0
          if (c === el.selectionEnd) {
            if (e.key === 'Backspace' && el.value[c - 1] === '.') el.setSelectionRange(c - 1, c - 1)
            if (e.key === 'Delete' && el.value[c] === '.') el.setSelectionRange(c + 1, c + 1)
          }
          onKeyDown?.(e)
        }}
        onChange={(e) => {
          const el = e.currentTarget
          const truoc = el.value.slice(0, el.selectionStart ?? el.value.length).replace(/\D/g, '').length
          const v = docSo(el.value)
          // ponytail: quá 2^53 thì bỏ phím (React trả lại giá trị cũ); cần số lớn hơn thì đổi sang bigint/chuỗi.
          if (v !== null && v > Number.MAX_SAFE_INTEGER) return
          // Ghi chuỗi đã định dạng + con trỏ NGAY tại đây: React thấy DOM đã đúng giá trị mới nên không ghi đè (ghi đè
          // là con trỏ nhảy về cuối). Gõ chữ cái → cùng số → ô trả về như cũ, không gọi onValueChange.
          const chu = v == null ? '' : dinhDangSo(v)
          el.value = chu
          const i = viTriSauChuSo(chu, truoc)
          el.setSelectionRange(i, i)
          if (v !== value) onValueChange(v)
        }}
      />
      <InputGroupAddon>{donVi}</InputGroupAddon>
    </InputGroup>
  )
}
