'use client'

import { createContext, useContext, useEffect, useId, useState, type ComponentProps } from 'react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

/**
 * Ô chọn tròn/vuông dùng chung Checkbox + RadioGroupItem — chép từ `.ui-checkbox` / `.ui-radio` của ds/nguon/bundle.css:
 * 18px, lệch xuống 1px (thẳng dòng đầu nhãn 14/20), viền 1px gray-200 (tối gray-500), hover gray-300 (tối gray-600),
 * focus-visible outline 2 ring offset 2, tắt viền gray-150 nền gray-25 (tối viền gray-300), lỗi viền red-500.
 * Radix vẽ bằng button (không phải input) → trạng thái đọc từ data-state, không từ pseudo checked.
 * Ưu tiên (thứ tự biến thể Tailwind 4: hover < focus-visible < enabled/disabled < aria < data): tắt > lỗi > chọn >
 * hover. Lỗi và chọn gắn `enabled:` (không tranh với tắt); viền "chọn" gắn `not-aria-invalid` để lỗi thắng như nguồn.
 * Khác bundle.css ở các ca theme tối (rule tối đặc hiệu 0,3,0 thắng mọi trạng thái 0,2,0 → ô lỗi/đã chọn rê chuột đổi
 * viền xám): DS giữ thứ tự như theme sáng.
 */
export const oChon = [
  'relative top-px m-0 inline-grid size-[18px] shrink-0 place-content-center p-0',
  'border border-solid bg-transparent cursor-pointer outline-none',
  '[--oc-vien:var(--gray-200)] in-data-[theme=dark]:[--oc-vien:var(--gray-500)]',
  '[--oc-tro:var(--gray-300)] in-data-[theme=dark]:[--oc-tro:var(--gray-600)]',
  '[--oc-tat:var(--gray-150)] in-data-[theme=dark]:[--oc-tat:var(--gray-300)]',
  'border-(--oc-vien) hover:border-(--oc-tro)',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-(--ring)',
  'disabled:cursor-not-allowed disabled:border-(--oc-tat) disabled:bg-(--gray-25)',
  'enabled:aria-invalid:border-(--red-500)',
].join(' ')

/**
 * Checkbox — Radix Checkbox, `.ui-checkbox`: bo radius-xs 4; chọn / một phần (`checked="indeterminate"`, cho ô "chọn tất
 * cả" của bảng → `aria-checked="mixed"`) viền + nền gray-900. Tắt + chọn: viền + nền gray-300 (tối gray-200). Tắt nền
 * gray-25 (tối gray-200). Nhãn: bọc trong `ChoiceLabel`.
 * Dấu vẽ bằng ::after y nguồn, màu gray-0: ✓ = góc viền 2px 10×6 xoay −45° (nhích lên 1px), – = vạch 2px rộng 8.
 * Không dùng icon Phosphor (kế hoạch ghi Check/Minus bold 12): nét bold ở cỡ 12 chỉ ~1.1px, mảnh rõ so với 2px của
 * nguồn và gạch "một phần" ra xám (đã so ảnh 20/11).
 */
export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  const moTa = useMoTaChon(props['aria-describedby'])
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        oChon,
        'rounded-(--radius-xs) [transition:border-color_150ms_ease,background-color_150ms_ease]',
        'in-data-[theme=dark]:disabled:bg-(--gray-200)',
        'enabled:data-[state=checked]:bg-(--gray-900) enabled:data-[state=indeterminate]:bg-(--gray-900)',
        'enabled:not-aria-invalid:data-[state=checked]:border-(--gray-900)',
        'enabled:not-aria-invalid:data-[state=indeterminate]:border-(--gray-900)',
        '[--oc-tat-chon:var(--gray-300)] in-data-[theme=dark]:[--oc-tat-chon:var(--gray-200)]',
        'disabled:data-[state=checked]:border-(--oc-tat-chon) disabled:data-[state=checked]:bg-(--oc-tat-chon)',
        'disabled:data-[state=indeterminate]:border-(--oc-tat-chon) disabled:data-[state=indeterminate]:bg-(--oc-tat-chon)',
        'after:h-1.5 after:w-2.5 after:border-solid after:border-(--gray-0) after:[border-width:0_0_2px_2px]',
        'after:[transform:translateY(-1px)_rotate(-45deg)] after:opacity-0',
        'data-[state=checked]:after:opacity-100 data-[state=indeterminate]:after:opacity-100',
        'data-[state=indeterminate]:after:h-0 data-[state=indeterminate]:after:w-2',
        'data-[state=indeterminate]:after:[border-width:0_0_2px_0] data-[state=indeterminate]:after:[transform:none]',
        className,
      )}
      {...props}
      aria-describedby={moTa}
    />
  )
}

/** ChoiceLabel ↔ ChoiceDescription ↔ ô: mô tả đăng ký id lên nhãn bao ngoài, ô đọc id đó (context, không cloneElement —
 * con qua ranh giới server → client là phần tử lười, như SwitchRow). Ngoài ChoiceLabel → null, không làm gì. */
const NhanCtx = createContext<{ idMoTa?: string; datMoTa: (id?: string) => void } | null>(null)

/** `aria-describedby` của ô = describedby truyền vào (vd câu lỗi) + id mô tả của ChoiceLabel bao ngoài (nếu có). */
export function useMoTaChon(rieng?: string) {
  const idMoTa = useContext(NhanCtx)?.idMoTa
  return [rieng, idMoTa].filter(Boolean).join(' ') || undefined
}

/**
 * ChoiceLabel — `.ui-checkbox-label`: nhãn BỌC ô (Checkbox / RadioGroupItem) + chữ, inline-flex căn đầu, cách 8, chữ
 * 14/20, con trỏ tay; có ô tắt bên trong → chữ color-text-disabled, not-allowed. Bấm chữ = bấm ô (label kích hoạt
 * button con). Có ChoiceDescription bên trong → mô tả nối vào `aria-describedby` của ô, tên đọc chỉ còn chữ nhãn.
 */
export function ChoiceLabel({ className, ...props }: ComponentProps<'label'>) {
  const [idMoTa, datMoTa] = useState<string>()
  return (
    <NhanCtx.Provider value={{ idMoTa, datMoTa }}>
      <label
        data-slot="choice-label"
        className={cn(
          'inline-flex items-start gap-2 border-none border-current text-[14px] leading-[20px] cursor-pointer',
          'has-disabled:cursor-not-allowed has-disabled:text-(--color-text-disabled)',
          className,
        )}
        {...props}
      />
    </NhanCtx.Provider>
  )
}

/**
 * ChoiceDescription — `.ui-choice-desc`: dòng mô tả dưới chữ nhãn, block 12/18 muted-foreground.
 * Nằm trong nhãn bọc → để nguyên thì tên đọc của ô gồm luôn câu mô tả. Nên: `aria-hidden` (ra khỏi tên — tính tên từ
 * nhãn bỏ nút ẩn) + id đăng ký lên ChoiceLabel → ô trỏ `aria-describedby` tới nó (nút ẩn được trỏ thẳng vẫn tính vào
 * mô tả). Trình đọc màn hình đọc mô tả khi focus ô; con trỏ ảo duyệt trang bỏ qua dòng này (đã nghe qua ô).
 */
export function ChoiceDescription({ className, id, ...props }: ComponentProps<'span'>) {
  const tuSinh = useId()
  const idMoTa = id ?? tuSinh
  const datMoTa = useContext(NhanCtx)?.datMoTa
  useEffect(() => {
    if (!datMoTa) return
    datMoTa(idMoTa)
    return () => datMoTa(undefined)
  }, [datMoTa, idMoTa])
  return (
    <span
      data-slot="choice-description"
      id={idMoTa}
      aria-hidden="true"
      className={cn('block border-none border-current text-[12px] leading-[18px] text-muted-foreground', className)}
      {...props}
    />
  )
}
