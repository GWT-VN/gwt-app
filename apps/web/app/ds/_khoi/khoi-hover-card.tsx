import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { BienThe, KhoiHang } from '../_khung/tam'

/**
 * Mã khách + thẻ xem nhanh — dùng chung khối trần và hàng biến thể. Dữ liệu demo, không PII (R11: SĐT chỉ `•••` + 4 số
 * cuối). Trigger là link tự đứng được (bấm = tới trang khách); thẻ chỉ là thông tin thêm — Radix không cho Tab vào thẻ.
 * `data-so` để đo.
 */
function MaKhach({ side, so }: { side?: 'bottom' | 'right'; so?: string }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button asChild variant="link" data-so={so}>
          <a href="#hover-card">KH-0412</a>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent side={side} data-so={so && `${so}-the`}>
        <div className="flex gap-3 border-none border-current">
          <Avatar aria-hidden="true">MP</Avatar>
          <div className="flex min-w-0 flex-col gap-1 border-none border-current">
            <p className="m-0 font-semibold">Công ty TNHH Minh Phát</p>
            <p className="m-0 text-[12px] leading-[18px] text-muted-foreground">KH-0412 · Đà Nẵng · SĐT •••&nbsp;4821</p>
            <p className="m-0 text-[12px] leading-[18px] text-muted-foreground">Đơn gần nhất 12/11/2026 · 3 máy đang bảo hành</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

/**
 * #hover-card — chưa có trong artifact (nguồn shadcn new-york-v4, Radix HoverCard). Rê chuột (hoặc Tab tới) mã khách
 * → sau 700ms hiện thẻ tóm tắt. Không có cổng so khớp — giá trị gán token Popover/menu, đo getComputedStyle trong báo
 * cáo đợt. Đệm dưới chừa chỗ cho thẻ.
 */
export function KhoiHoverCard() {
  return (
    <section id="hover-card" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#hover-card">HoverCard</a>
      </h2>
      <div className="flex pb-32">
        <MaKhach so="ma" />
      </div>
    </section>
  )
}

/** /ds dạng hàng. */
export function KhoiHoverCardHang() {
  return (
    <KhoiHang neo="hover-card">
      <BienThe ten="Xem nhanh khách" moTa="Rê chuột hoặc Tab tới mã khách để thấy thẻ (trễ 700ms). Bấm mã = mở trang khách">
        <MaKhach />
      </BienThe>
      <BienThe ten='side="right"' moTa="Mặc định hiện bên dưới; cho hiện bên phải khi mã nằm trong cột hẹp">
        <MaKhach side="right" />
      </BienThe>
    </KhoiHang>
  )
}
