'use client'

import { useState } from 'react'

/**
 * Overlay mở bằng chuột/chạm → ẩn vòng focus BÊN TRONG cho tới phím đầu tiên (Select, DatePicker…).
 *
 * Overlay tự focus() một phần tử bên trong khi mở (Radix Select focus mục đang chọn, Calendar focus ô ngày). Nếu trigger
 * chặn mousedown (Radix Select) thì Chrome tính focus() đó là :focus-visible → bấm chuột mở cũng hiện vòng xanh, trong
 * khi preview chỉ có nền/hình. Mở bằng phím, hoặc gõ phím bất kỳ sau khi mở bằng chuột → vòng hiện lại.
 *
 * Cách gắn: `onPointerDown` lên trigger; `onKeyDown` lên trigger VÀ nội dung overlay; đọc `chuot` để tắt vòng (class
 * tắt outline do component tự chọn, vì phần tử mang vòng mỗi nơi một khác).
 */
export function useMoBangChuot() {
  const [chuot, setChuot] = useState(false)
  return { chuot, onPointerDown: () => setChuot(true), onKeyDown: () => setChuot(false) }
}

export type MoBangChuot = ReturnType<typeof useMoBangChuot>
