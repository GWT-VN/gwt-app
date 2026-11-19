import { Gear } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'

/**
 * #tooltip — tái tạo ds/nguon/components/Tooltip/preview.html (gap 24 + padding 8 0 56 48 = style inline của preview:
 * chừa chỗ dưới cho tooltip). Preview ép tooltip nút icon mở bằng class; ở đây rê chuột / Tab thật mới hiện.
 * Chữ tooltip giữ y artifact ("Cài đặt hiển thị"); aria-label nút icon là "Cài đặt" (preview để trùng) — tooltip là mô
 * tả thêm, trùng nguyên văn thì trình đọc màn hình đọc hai lần (luật NGUON.md; Radix luôn nối aria-describedby, không gỡ
 * được). `data-so` = khoá so khớp (ds/so-khop/tooltip.json).
 */
export function KhoiTooltip() {
  return (
    <section id="tooltip" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#tooltip">Tooltip</a>
      </h2>
      <div className="flex flex-wrap items-center gap-6 pt-2 pr-0 pb-14 pl-12">
        <Tooltip content="Cài đặt hiển thị">
          <Button data-so="icon" variant="ghost" size="icon" aria-label="Cài đặt">
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
