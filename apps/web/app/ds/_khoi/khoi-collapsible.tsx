'use client'

import { CaretUpDown } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { BienThe, KhoiHang } from '../_khung/tam'

const THONG_SO = ['Công suất 2,2 kW', 'Điện áp 380 V / 3 pha', 'Khối lượng 145 kg']

/** Dòng thông số — cùng khung với dòng luôn hiện ở trên. */
function Dong({ chu }: { chu: string }) {
  return (
    <div className="rounded-(--radius-md) px-3 py-2 text-[14px] leading-[20px] [box-shadow:inset_0_0_0_1px_var(--border)]">
      {chu}
    </div>
  )
}

/** Demo không PII. `data-so` để đo. */
function CacBienThe() {
  return (
    <>
      <BienThe ten="Mở / thu" moTa="Nút icon (asChild Button) mang aria-expanded; phần thu ẩn hẳn (hidden) khi đóng.">
        <Collapsible defaultOpen={false} className="flex max-w-80 flex-col gap-2" data-so="khung">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[14px] leading-[20px] font-medium">Thông số máy NX-2210</span>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Xem thêm thông số" data-so="nut">
                <CaretUpDown aria-hidden="true" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <Dong chu={THONG_SO[0]} />
          <CollapsibleContent className="flex flex-col gap-2">
            {THONG_SO.slice(1).map((t) => (
              <Dong key={t} chu={t} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      </BienThe>
      <BienThe ten="Mở sẵn" moTa="defaultOpen — nút chữ đổi theo trạng thái nhờ data-state của Root.">
        <Collapsible defaultOpen className="group/thu flex max-w-80 flex-col gap-2">
          <CollapsibleTrigger asChild>
            <Button variant="link" className="self-start">
              <span className="group-data-[state=open]/thu:hidden">Hiện ghi chú kỹ thuật</span>
              <span className="hidden group-data-[state=open]/thu:inline">Ẩn ghi chú kỹ thuật</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="m-0 text-[14px] leading-[20px] text-muted-foreground">
              Kiểm tra dây tiếp địa trước khi cấp nguồn. Sau 500 giờ chạy thay dầu bôi trơn.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </BienThe>
    </>
  )
}

/** #collapsible trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp riêng. */
export function KhoiCollapsible() {
  return (
    <section id="collapsible" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#collapsible">Collapsible</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #collapsible dạng hàng (/ds). */
export function KhoiCollapsibleHang() {
  return (
    <KhoiHang neo="collapsible">
      <CacBienThe />
    </KhoiHang>
  )
}
