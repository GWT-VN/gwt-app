import { useId, type FocusEvent } from 'react'

/** `aria-invalid` mọi component DS nhận: boolean hoặc chuỗi — `'false'` là KHÔNG lỗi (chuỗi khác rỗng vẫn truthy). */
export type AriaInvalid = boolean | 'true' | 'false'
export const laLoi = (v?: AriaInvalid) => v === true || v === 'true'

/** Props a11y/form chung của trigger mở pop: Combobox, DatePicker, DateRangePicker. */
export type TriggerChonProps = {
  id?: string
  /** Có `name` → input ẩn mang giá trị, form submit thật (FormData) nhận được — như Radix Select. */
  name?: string
  disabled?: boolean
  /** Ô bắt buộc → `aria-required` trên trigger (nút không nhận `required` gốc). */
  required?: boolean
  'aria-required'?: boolean
  'aria-invalid'?: AriaInvalid
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  /** Gọi khi focus rời trigger lúc pop ĐÓNG (mở pop / Esc quay về không tính) — dùng kiểm "rời ô đã sửa" như Input. */
  onBlur?(e: FocusEvent<HTMLButtonElement>): void
}

/**
 * Tên đọc của trigger = NHÃN + GIÁ TRỊ đang chọn. Trigger là `<button>` thường (pop là dialog) chứ không phải
 * role combobox như Select: nút có nhãn ngoài (`FieldLabel htmlFor`) thì tên chỉ còn nhãn, mất giá trị → nối id span giá
 * trị vào `aria-labelledby`:
 * - người gọi có `aria-labelledby` → `"<của người gọi> <span giá trị>"`;
 * - chỉ có `aria-label` hoặc `id` (nhãn `<label for>`) → `"<id chính nút> <span giá trị>"`. Nút TỰ tham chiếu: theo
 *   accname, phần tử đang được duyệt qua aria-labelledby không đọc lại aria-labelledby của nó mà lấy aria-label, rồi tới
 *   `<label for>` → không phải dò DOM tìm nhãn, không đổi id của nhãn. (Không có nhãn nào thì tên lấy từ chữ trong nút
 *   — giá trị đọc hai lần; ô thiếu nhãn là lỗi của màn.)
 * - chưa có giá trị → không nối (tên chỉ là nhãn, placeholder không vào tên).
 */
export function useTriggerChon(
  { id: idGoi, disabled, required, onBlur, ...p }: Omit<TriggerChonProps, 'name'>,
  coGiaTri: boolean,
  mo: boolean,
) {
  const tuSinh = useId()
  const id = idGoi ?? tuSinh
  const idGiaTri = `${id}-gia-tri`
  const nhan = p['aria-labelledby'] ?? (p['aria-label'] || idGoi ? id : undefined)
  return {
    idGiaTri,
    trigger: {
      id,
      disabled,
      'aria-label': p['aria-label'],
      'aria-labelledby': nhan && coGiaTri ? `${nhan} ${idGiaTri}` : p['aria-labelledby'],
      'aria-describedby': p['aria-describedby'],
      'aria-required': required || p['aria-required'] || undefined,
      'aria-invalid': laLoi(p['aria-invalid']) || undefined,
      onBlur: (e: FocusEvent<HTMLButtonElement>) => {
        if (!mo) onBlur?.(e)
      },
    },
  }
}
