'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { BienThe, KhoiHang } from '../_khung/tam'

const HOI = [
  {
    id: 'bao-hanh',
    hoi: 'Máy được bảo hành bao lâu?',
    dap: '12 tháng kể từ ngày lắp đặt, tính theo biên bản bàn giao. Gia hạn thêm 12 tháng nếu đăng ký trước khi hết hạn 30 ngày.',
  },
  {
    id: 'doi-tra',
    hoi: 'Đổi máy trong trường hợp nào?',
    dap: 'Lỗi phần cứng do nhà sản xuất trong 30 ngày đầu, đã có kỹ thuật xác nhận. Không áp dụng máy hỏng do va đập hoặc nguồn điện.',
  },
  {
    id: 'van-chuyen',
    hoi: 'Phí vận chuyển tính thế nào?',
    dap: 'Miễn phí trong bán kính 30 km quanh kho; xa hơn tính theo bảng giá vận chuyển hiện hành.',
  },
]

function Muc({ id, hoi, dap, disabled, so }: { id: string; hoi: string; dap: string; disabled?: boolean; so?: boolean }) {
  return (
    <AccordionItem value={id} disabled={disabled}>
      <AccordionTrigger data-so={so ? id : undefined}>{hoi}</AccordionTrigger>
      <AccordionContent>{dap}</AccordionContent>
    </AccordionItem>
  )
}

/** Demo không PII. `data-so` để đo. */
function CacBienThe() {
  return (
    <>
      <BienThe ten='type="single" collapsible' moTa="Mở một mục thì mục kia thu; bấm lại mục đang mở để thu. ↑/↓ chuyển giữa các nút.">
        <Accordion type="single" collapsible defaultValue="bao-hanh" className="max-w-[560px]">
          {HOI.map((h) => (
            <Muc key={h.id} so {...h} />
          ))}
        </Accordion>
      </BienThe>
      <BienThe ten='type="multiple"' moTa="Mở nhiều mục cùng lúc (trang cài đặt, thông số máy).">
        <Accordion type="multiple" defaultValue={['bao-hanh', 'van-chuyen']} className="max-w-[560px]">
          {HOI.map((h) => (
            <Muc key={h.id} {...h} />
          ))}
        </Accordion>
      </BienThe>
      <BienThe ten="Mục tắt" moTa="disabled: mờ 50%, không mở được.">
        <Accordion type="single" collapsible className="max-w-[560px]">
          <Muc {...HOI[0]} />
          <Muc {...HOI[1]} disabled />
        </Accordion>
      </BienThe>
    </>
  )
}

/** #accordion trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp riêng. */
export function KhoiAccordion() {
  return (
    <section id="accordion" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#accordion">Accordion</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #accordion dạng hàng (/ds). */
export function KhoiAccordionHang() {
  return (
    <KhoiHang neo="accordion">
      <CacBienThe />
    </KhoiHang>
  )
}
