'use client'

/**
 * Focus đến từ CHUỘT không hiện vòng focus. Radix (menu, pop, chọn ngày…) đóng lại thì trả focus về nút mở — DS giữ việc
 * trả focus (form đi tiếp bằng Tab, test date-picker/cot-bang khoá điều này), nhưng Chrome coi focus bằng script đó là
 * `:focus-visible` → nút mở hiện vòng xanh dù người dùng chỉ bấm chuột (CEO 26/11 ảnh tiêu đề cột "Loại lỗi": "Nhớ sửa
 * trạng thái focus"). Cách sửa: phần tử nhận focus khi lần nhập cuối là chuột mang `data-focus-chuot`; `DsRoot` tắt
 * outline của `[data-focus-chuot]:focus-visible`. Gõ phím bất kỳ → gỡ cờ ngay, vòng focus hiện lại cho người dùng phím.
 * Chỉ tắt OUTLINE (vòng focus); viền ô nhập vẽ bằng box-shadow giữ nguyên.
 */
const CO = 'data-focus-chuot'
let chuot = false

if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', () => (chuot = true), true)
  window.addEventListener(
    'keydown',
    () => {
      chuot = false
      document.activeElement?.removeAttribute(CO)
    },
    true,
  )
  window.addEventListener('focusin', (e) => {
    if (!(e.target instanceof Element)) return
    if (chuot) e.target.setAttribute(CO, '')
    else e.target.removeAttribute(CO)
  })
  window.addEventListener('focusout', (e) => {
    if (e.target instanceof Element) e.target.removeAttribute(CO)
  })
}

/** Class cho gốc DS: tắt vòng focus của phần tử đang mang cờ (đặc hiệu 0,3,0 > lớp `focus-visible:outline-*` 0,2,0). */
export const TAT_VIEN_FOCUS_CHUOT = '[&_[data-focus-chuot]:focus-visible]:[outline:none]'
