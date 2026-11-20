import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * FormLayout — khung form dùng chung, giá trị chép từ `.ui-form*` + `.ui-caption` của ds/nguon/bundle.css. Ghép Field,
 * Input, Select, DatePicker, InputAffix, Radio, Checkbox, Textarea, FileUpload, Switch; màn nghiệp vụ chỉ sắp field.
 *
 * Luật form (README FormLayout, chuẩn ngành):
 * - Bắt buộc: `*` ở nhãn (`FieldLabel required`) + `required`/`aria-required` trên ô; đầu form có `FormRequiredNote`.
 * - Kiểm khi bấm Lưu và khi rời ô ĐÃ SỬA; không đỏ lúc mới mở. Lỗi viết cách sửa, không "Không hợp lệ".
 * - Lưu lỗi → `focusLoiDau(form)` (sau khi lỗi đã render, vd trong `flushSync`). Lỗi máy chủ → `Alert color="danger"`
 *   là con đầu của form, giữ nguyên dữ liệu đã nhập.
 * - Đang lưu: nút Lưu `loading`, nút Huỷ `disabled`.
 * - Form dài/sửa bản ghi → Sheet phải; ≤ 3 trường → Dialog; tạo bản ghi chính → trang riêng.
 * - Chưa dùng react-hook-form/zod (README: cài khi có form nghiệp vụ thật đầu tiên).
 */

/** div/p/span ăn preflight `0 solid var(--border)` của app; artifact không viền. */
const khongVien = 'border-none border-current'

/** `.ui-form`: cột, các khối cách 24. Mặc định `noValidate` — form tự kiểm, không để bong bóng lỗi của trình duyệt. */
export function FormLayout({ className, noValidate = true, ...props }: ComponentProps<'form'>) {
  return (
    <form
      data-slot="form-layout"
      noValidate={noValidate}
      className={cn(khongVien, 'flex flex-col gap-6', className)}
      {...props}
    />
  )
}

/** `.ui-form-desc`: 14/20 muted-foreground, kéo lên 12 cho sát tiêu đề (bundle.css `margin: -12px 0 0`). */
const moTaKhoi = cn(khongVien, 'm-0 -mt-3 text-[14px] leading-[20px] text-muted-foreground')

/**
 * `.ui-form-section`: cột gap 16; khối đứng sau một khối khác có đệm trên 24 + kẻ trên alpha-08 (box-shadow inset, không
 * đổi kích thước hộp). Tiêu đề `h3` 16/24 600; `moTa` kiểu `.ui-form-desc` ngay dưới tiêu đề.
 */
export function FormSection({
  tieuDe,
  moTa,
  className,
  children,
  ...props
}: Omit<ComponentProps<'div'>, 'title'> & { tieuDe: ReactNode; moTa?: ReactNode }) {
  return (
    <div
      data-slot="form-section"
      className={cn(
        khongVien,
        'flex flex-col gap-4',
        '[[data-slot=form-section]+&]:pt-6 [[data-slot=form-section]+&]:[box-shadow:inset_0_1px_0_var(--alpha-08)]',
        className,
      )}
      {...props}
    >
      <h3 data-slot="form-title" className={cn(khongVien, 'm-0 text-[16px] leading-[24px] font-semibold')}>
        {tieuDe}
      </h3>
      {moTa != null && (
        <p data-slot="form-description" className={moTaKhoi}>
          {moTa}
        </p>
      )}
      {children}
    </div>
  )
}

/** Câu "Trường có dấu * là bắt buộc." kiểu `.ui-form-desc` — đặt ngay dưới tiêu đề khối đầu (con đầu của FormSection). */
export function FormRequiredNote({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p data-slot="form-description" className={cn(moTaKhoi, className)} {...props}>
      Trường có dấu * là bắt buộc.
    </p>
  )
}

/**
 * `.ui-form-grid`: 2 cột đều, gap 16 dọc / 20 ngang; con mang `data-span="full"` chiếm trọn hàng (ghi chú, đính kèm).
 * Khung nhìn ≤ 640px → 1 cột (media query khung nhìn như bundle.css, không phải container).
 */
export function FormGrid({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="form-grid"
      className={cn(
        khongVien,
        'grid grid-cols-2 gap-x-5 gap-y-4 max-[640px]:grid-cols-1 [&>[data-span=full]]:col-span-full',
        className,
      )}
      {...props}
    />
  )
}

/**
 * `.ui-form-footer`: hàng căn giữa dọc, nút dồn phải cách 8 (Huỷ `outline` · Lưu chính), đệm trên 16 + kẻ trên alpha-08.
 * `trangThai` ("Chưa lưu", "Còn trường bắt buộc chưa điền.", "Đang lưu…") nằm trái kiểu `.ui-caption` 12/18 muted,
 * `aria-live="polite"` để trình đọc màn hình báo khi đổi.
 */
export function FormFooter({
  trangThai,
  className,
  children,
  ...props
}: ComponentProps<'div'> & { trangThai?: ReactNode }) {
  return (
    <div
      data-slot="form-footer"
      className={cn(
        khongVien,
        'flex items-center justify-end gap-2 pt-4 [box-shadow:inset_0_1px_0_var(--alpha-08)]',
        className,
      )}
      {...props}
    >
      {trangThai != null && (
        <span
          data-slot="form-status"
          aria-live="polite"
          className={cn(khongVien, 'mr-auto text-[12px] leading-[18px] text-muted-foreground')}
        >
          {trangThai}
        </span>
      )}
      {children}
    </div>
  )
}

/** Focus phần tử `[aria-invalid="true"]` đầu tiên của form theo thứ tự DOM (gọi sau khi lỗi đã render). */
export function focusLoiDau(form: HTMLFormElement): void {
  form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}
