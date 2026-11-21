import { ClockCounterClockwise, Gear } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { TooltipNhanh } from '@/components/ui/tooltip'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Demo dùng chung cho `KhoiTooltip` (/ds/tron) và `KhoiTooltipHang` (/ds). */
const ICON = (
  <TooltipNhanh content="Cài đặt hiển thị">
    <Button data-so="icon" variant="ghost" size="icon" aria-label="Cài đặt">
      <Gear aria-hidden="true" />
    </Button>
  </TooltipNhanh>
)
const EXCEL = (
  <TooltipNhanh content="Xuất theo bộ lọc đang chọn">
    <Button data-so="excel" variant="outline" size="sm">
      Xuất Excel
    </Button>
  </TooltipNhanh>
)

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
        {ICON}
        {EXCEL}
      </div>
    </section>
  )
}

/** #tooltip dạng hàng cho /ds — rê chuột / Tab tới nút để thấy tooltip (không ép mở). */
export function KhoiTooltipHang() {
  return (
    <KhoiHang neo="tooltip">
      <BienThe ten="Nút icon" moTa="Chữ mô tả thêm, không lặp lại tên nút. Rê chuột hoặc bấm Tab để thấy.">
        {ICON}
      </BienThe>
      <BienThe ten="Nút có chữ" moTa="Giải thích phạm vi thao tác. Rê chuột hoặc bấm Tab để thấy.">
        {EXCEL}
      </BienThe>
      <BienThe ten='side="right"' moTa="Mặc định hiện bên dưới; cho hiện bên phải khi phía dưới chật (thanh bên).">
        <TooltipNhanh side="right" content="Xem các lần sửa đơn">
          <Button variant="ghost" size="icon" aria-label="Lịch sử">
            <ClockCounterClockwise aria-hidden="true" />
          </Button>
        </TooltipNhanh>
      </BienThe>
    </KhoiHang>
  )
}
