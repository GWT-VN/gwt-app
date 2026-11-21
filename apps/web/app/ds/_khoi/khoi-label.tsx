import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Demo không PII. Khối server: chỉ phần tử tĩnh, không truyền hàm sang client component. */
function CacBienThe() {
  return (
    <>
      <BienThe ten="Mặc định" moTa="Nhãn 14/20 500 — bấm nhãn đưa focus vào ô (htmlFor). Trong form dùng FieldLabel (ghép trên Label).">
        <div className="flex max-w-80 flex-col gap-1.5 border-none border-current" data-so="mac-dinh">
          <Label htmlFor="dsh-label-ten">Tên khách</Label>
          <Input id="dsh-label-ten" placeholder="Nguyễn Văn A" />
        </div>
      </BienThe>
      <BienThe ten="Cạnh ô chọn" moTa="Ô đứng TRƯỚC mang class peer; nhãn trỏ ô qua htmlFor.">
        <div className="flex items-center gap-2 border-none border-current" data-so="canh-o">
          <Checkbox id="dsh-label-dk" className="peer" />
          <Label htmlFor="dsh-label-dk">Nhận thông báo qua email</Label>
        </div>
      </BienThe>
      <BienThe ten="Tắt" moTa="Ô peer bị tắt → nhãn mờ 50%, con trỏ cấm (y shadcn).">
        <div className="flex items-center gap-2 border-none border-current" data-so="tat">
          <Checkbox id="dsh-label-tat" className="peer" disabled />
          <Label htmlFor="dsh-label-tat">Đồng bộ kho (không có quyền)</Label>
        </div>
      </BienThe>
    </>
  )
}

/** #label trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp riêng. */
export function KhoiLabel() {
  return (
    <section id="label" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#label">Label</a>
      </h2>
      <div className="divide-y divide-(--border) border-none border-current">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #label dạng hàng (/ds). */
export function KhoiLabelHang() {
  return (
    <KhoiHang neo="label">
      <CacBienThe />
    </KhoiHang>
  )
}
