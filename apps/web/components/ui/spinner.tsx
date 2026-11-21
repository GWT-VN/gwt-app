// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Spinner — khung shadcn (`role="status"` + `aria-label`, nhận `...props`), hình từ `.ui-spinner` của ds/nguon/bundle.css:
 * 16px (--indicator-size md), viền 2px currentColor hở cạnh phải, quay 0.8s; giảm chuyển động → 2.4s (chậm lại, không tắt
 * hẳn: vẫn báo đang chạy).
 * - Lệch có chủ đích: shadcn vẽ icon `Loader2` (svg); artifact vẽ vòng viền → DS giữ `span` vòng viền (cổng so khớp đo
 *   `borderTopWidth`/`borderRightColor`), props kiểu `span`.
 * - Đặt trong nút/toast/dòng đã có chữ ("Đang lưu", "Đang tìm…") → truyền `aria-hidden` để trình đọc không đọc thừa.
 */
function Spinner({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      role="status"
      aria-label="Đang tải"
      data-slot="spinner"
      className={cn(
        'inline-block size-4 rounded-(--radius-full) border-2 border-current border-r-transparent',
        'animate-[spin_0.8s_linear_infinite] motion-reduce:[animation-duration:2.4s]',
        className,
      )}
      {...props}
    />
  )
}

export { Spinner }
