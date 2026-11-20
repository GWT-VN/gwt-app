'use client'

import { useState } from 'react'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput, OTien } from '@/components/ui/input-affix'

/** Ô tiền có state riêng để gõ thử được trên /ds. */
function Tien({ dau, ...props }: { dau: number | null } & Omit<Parameters<typeof OTien>[0], 'value' | 'onValueChange'>) {
  const [v, setV] = useState<number | null>(dau)
  return <OTien value={v} onValueChange={setV} {...props} />
}

/**
 * #input-affix — tái tạo ds/nguon/components/InputAffix/preview.html: cột rộng tối đa 520, gap 16; 4 ô: đơn giá ₫,
 * chiết khấu %, số tiền lỗi, đã thu tắt. Ô tiền là `OTien` (gõ thử: tự chấm hàng nghìn, xoá hết = trống); chiết khấu ghép
 * tay `InputGroup` (số thập phân — OTien chỉ nhận số nguyên). Nhãn chiết khấu nói đơn vị "(%)" theo README (preview
 * chỉ ghi "Chiết khấu"). Hover/focus đo bằng bước rê/Tab thật. Dữ liệu minh hoạ (demo). `data-so` = khoá so khớp
 * (ds/so-khop/inputaffix.json).
 */
export function KhoiInputAffix() {
  const [ck, setCk] = useState('5')
  return (
    <section id="input-affix" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#input-affix">InputAffix · ô tiền VND</a>
      </h2>
      {/* border-none border-current: div ăn preflight `0 solid var(--border)` của app; div preview không viền. */}
      <div className="flex max-w-[520px] flex-col gap-4 border-none border-current">
        <Field data-so="field">
          <FieldLabel data-so="label" htmlFor="ds-ia-gia">
            Đơn giá
          </FieldLabel>
          <Tien id="ds-ia-gia" dau={1250000} />
        </Field>
        <Field>
          <FieldLabel htmlFor="ds-ia-ck">Chiết khấu (%)</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="ds-ia-ck"
              inputMode="decimal"
              data-align="end"
              value={ck}
              onChange={(e) => setCk(e.target.value.replace(/[^\d,.]/g, ''))}
            />
            <InputGroupAddon>%</InputGroupAddon>
          </InputGroup>
        </Field>
        <Field>
          <FieldLabel htmlFor="ds-ia-tien">Số tiền</FieldLabel>
          <Tien id="ds-ia-tien" dau={0} aria-invalid aria-describedby="ds-ia-tien-e" />
          <FieldError data-so="loi-msg" id="ds-ia-tien-e">
            Số tiền phải lớn hơn 0.
          </FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="ds-ia-thu">Đã thu</FieldLabel>
          <Tien id="ds-ia-thu" dau={3500000} disabled />
        </Field>
      </div>
    </section>
  )
}
