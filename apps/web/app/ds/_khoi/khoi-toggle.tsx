'use client'

import { Kanban, ListBullets, PushPin, SidebarSimple, Table, TextB, TextItalic, TextUnderline } from '@phosphor-icons/react/ssr'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Demo không PII. `data-so` để đo. Nút chỉ icon luôn có `aria-label`. */
function CacBienThe() {
  return (
    <>
      <BienThe ten="Toggle" moTa="Một nút bật/tắt (aria-pressed). Bật thì nền accent. Mặc định variant default, size default.">
        <div className="flex flex-wrap items-center gap-2">
          <Toggle data-so="toggle">
            <PushPin aria-hidden="true" />
            Ghim
          </Toggle>
          <Toggle defaultPressed data-so="toggle-bat">
            <PushPin aria-hidden="true" weight="fill" />
            Đã ghim
          </Toggle>
          <Toggle variant="outline" data-so="toggle-outline" aria-label="In đậm">
            <TextB aria-hidden="true" />
          </Toggle>
          <Toggle size="icon" aria-label="Thẻ xem nhanh bên phải" data-so="toggle-icon">
            <SidebarSimple mirrored aria-hidden="true" />
          </Toggle>
          <Toggle disabled>
            <PushPin aria-hidden="true" />
            Ghim (không có quyền)
          </Toggle>
        </div>
      </BienThe>
      <BienThe ten="Size" moTa="sm 28 · default 32 · lg 36 (thang control). icon / icon-sm: ô vuông cho nút chỉ icon (phần GWT thêm).">
        <div className="flex flex-wrap items-center gap-2">
          <Toggle size="sm" aria-label="Nghiêng (nhỏ)">
            <TextItalic aria-hidden="true" />
          </Toggle>
          <Toggle aria-label="Nghiêng">
            <TextItalic aria-hidden="true" />
          </Toggle>
          <Toggle size="lg" aria-label="Nghiêng (lớn)">
            <TextItalic aria-hidden="true" />
          </Toggle>
          <Toggle size="icon-sm" aria-label="Gạch chân (ô nhỏ)">
            <TextUnderline aria-hidden="true" />
          </Toggle>
        </div>
      </BienThe>
      <BienThe
        ten="ToggleGroup single, rời"
        moTa="Chọn một trong nhóm (radiogroup). spacing 0.5 = cách 2, mỗi nút bo pill — kiểu thanh công cụ DataViewToolbar. ← → chuyển."
      >
        <ToggleGroup type="single" defaultValue="bang" size="icon" spacing={0.5} aria-label="Dạng xem" data-so="nhom-roi">
          <ToggleGroupItem value="danh-sach" aria-label="Danh sách">
            <ListBullets aria-hidden="true" />
          </ToggleGroupItem>
          <ToggleGroupItem value="bang" aria-label="Bảng">
            <Table aria-hidden="true" />
          </ToggleGroupItem>
          <ToggleGroupItem value="kanban" aria-label="Kanban">
            <Kanban aria-hidden="true" />
          </ToggleGroupItem>
        </ToggleGroup>
      </BienThe>
      <BienThe ten="ToggleGroup multiple, liền" moTa="Bật nhiều nút (spacing 0 mặc định shadcn: dính liền, chỉ đầu/cuối bo). variant outline đặt ở nhóm.">
        <ToggleGroup type="multiple" variant="outline" aria-label="Định dạng chữ" data-so="nhom-lien">
          <ToggleGroupItem value="dam" aria-label="In đậm">
            <TextB aria-hidden="true" />
          </ToggleGroupItem>
          <ToggleGroupItem value="nghieng" aria-label="Nghiêng">
            <TextItalic aria-hidden="true" />
          </ToggleGroupItem>
          <ToggleGroupItem value="gach" aria-label="Gạch chân">
            <TextUnderline aria-hidden="true" />
          </ToggleGroupItem>
        </ToggleGroup>
      </BienThe>
    </>
  )
}

/** #toggle trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp riêng (DataViewToolbar đo nút công cụ). */
export function KhoiToggle() {
  return (
    <section id="toggle" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#toggle">Toggle</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #toggle dạng hàng (/ds). */
export function KhoiToggleHang() {
  return (
    <KhoiHang neo="toggle">
      <CacBienThe />
    </KhoiHang>
  )
}
