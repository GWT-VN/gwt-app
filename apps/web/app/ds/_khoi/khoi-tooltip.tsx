import { Gear } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'

/**
 * #tooltip — tái tạo ds/nguon/components/Tooltip/preview.html (gap 24 + padding 8 0 56 48 = style inline của preview:
 * chừa chỗ dưới cho tooltip). Preview ép tooltip nút icon mở bằng class; ở đây rê chuột / Tab thật mới hiện.
 * `data-so` = khoá so khớp (ds/so-khop/tooltip.json).
 */
export function KhoiTooltip() {
  return (
    <section id="tooltip" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#tooltip">Tooltip</a>
      </h2>
      <div className="flex flex-wrap items-center gap-6 pt-2 pr-0 pb-14 pl-12">
        <Tooltip content="Cài đặt hiển thị">
          <Button data-so="icon" variant="ghost" size="icon" aria-label="Cài đặt hiển thị">
            <Gear aria-hidden="true" />
          </Button>
        </Tooltip>
        <Tooltip content="Xuất theo bộ lọc đang chọn">
          <Button data-so="excel" variant="outline" size="sm">
            Xuất Excel
          </Button>
        </Tooltip>
      </div>
    </section>
  )
}
