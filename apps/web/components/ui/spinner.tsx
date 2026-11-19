import { cn } from '@/lib/utils'

/**
 * Vòng quay chờ — `.ui-spinner` trong ds/nguon/bundle.css: 16px (--indicator-size md), viền 2px currentColor hở
 * cạnh phải, quay 0.8s; giảm chuyển động → 2.4s (chậm lại, không tắt hẳn: vẫn báo đang chạy).
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      data-slot="spinner"
      className={cn(
        'inline-block size-4 rounded-(--radius-full) border-2 border-current border-r-transparent',
        'animate-[spin_0.8s_linear_infinite] motion-reduce:[animation-duration:2.4s]',
        className,
      )}
    />
  )
}
