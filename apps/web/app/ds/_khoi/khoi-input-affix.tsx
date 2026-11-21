'use client'

import { useState } from 'react'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { MagnifyingGlass, X } from '@phosphor-icons/react/ssr'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  OTien,
} from '@/components/ui/input-group'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Ô tiền có state riêng để gõ thử được trên /ds. */
function Tien({ dau, ...props }: { dau: number | null } & Omit<Parameters<typeof OTien>[0], 'value' | 'onValueChange'>) {
  const [v, setV] = useState<number | null>(dau)
  return <OTien value={v} onValueChange={setV} {...props} />
}

/* Ô demo dùng chung cho KhoiInputAffix (so khớp, /ds/tron) và KhoiInputAffixHang (/ds). `id` truyền vào để mỗi trang một id. */

function DonGia({ id }: { id: string }) {
  return (
    <Field data-so="field">
      <FieldLabel data-so="label" htmlFor={id}>
        Đơn giá
      </FieldLabel>
      <Tien id={id} dau={1250000} />
    </Field>
  )
}

function ChietKhau({ id }: { id: string }) {
  const [ck, setCk] = useState('5')
  return (
    <Field>
      <FieldLabel htmlFor={id}>Chiết khấu (%)</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          inputMode="decimal"
          data-align="end"
          value={ck}
          onChange={(e) => setCk(e.target.value.replace(/[^\d,.]/g, ''))}
        />
        <InputGroupAddon align="inline-end" aria-hidden="true">
          %
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}

function SoTien({ id }: { id: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Số tiền</FieldLabel>
      <Tien id={id} dau={0} aria-invalid aria-describedby={`${id}-e`} />
      <FieldError data-so="loi-msg" id={`${id}-e`}>
        Số tiền phải lớn hơn 0.
      </FieldError>
    </Field>
  )
}

/** shadcn: icon đầu khung (addon inline-start, mặc định) + nút xoá trong khung (InputGroupButton icon-xs). */
function TimKiem({ id }: { id: string }) {
  const [q, setQ] = useState('DH-10')
  return (
    <Field>
      <FieldLabel htmlFor={id}>Tìm đơn</FieldLabel>
      <InputGroup>
        <InputGroupAddon aria-hidden="true">
          <MagnifyingGlass />
        </InputGroupAddon>
        <InputGroupInput id={id} value={q} placeholder="Mã đơn, tên khách" onChange={(e) => setQ(e.target.value)} />
        {q && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label="Xoá chữ tìm" onClick={() => setQ('')}>
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </Field>
  )
}

/** shadcn: ô nhiều dòng trong khung + addon block-end (đếm ký tự). */
function GhiChu({ id }: { id: string }) {
  const [v, setV] = useState('')
  return (
    <Field>
      <FieldLabel htmlFor={id}>Ghi chú giao hàng</FieldLabel>
      <InputGroup>
        <InputGroupTextarea id={id} value={v} maxLength={200} placeholder="Gọi trước 30 phút" onChange={(e) => setV(e.target.value)} />
        <InputGroupAddon align="block-end" aria-hidden="true">
          <InputGroupText className="ml-auto tabular-nums">{v.length}/200</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}

function DaThu({ id }: { id: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Đã thu</FieldLabel>
      <Tien id={id} dau={3500000} disabled />
    </Field>
  )
}

/**
 * #input-affix — tái tạo ds/nguon/components/InputAffix/preview.html: cột rộng tối đa 520, gap 16; 4 ô: đơn giá ₫,
 * chiết khấu %, số tiền lỗi, đã thu tắt. Ô tiền là `OTien` (gõ thử: tự chấm hàng nghìn, xoá hết = trống); chiết khấu ghép
 * tay `InputGroup` (số thập phân — OTien chỉ nhận số nguyên). Nhãn chiết khấu nói đơn vị "(%)" theo README (preview
 * chỉ ghi "Chiết khấu"). Hover/focus đo bằng bước rê/Tab thật. Dữ liệu minh hoạ (demo). `data-so` = khoá so khớp
 * (ds/so-khop/inputaffix.json).
 * Tên (R22): code theo shadcn `components/ui/input-group.tsx` (`InputGroup*`); khối + cổng giữ tên artifact InputAffix.
 */
export function KhoiInputAffix() {
  return (
    <section id="input-affix" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#input-affix">InputAffix · ô tiền VND</a>
      </h2>
      {/* border-none border-current: div ăn preflight `0 solid var(--border)` của app; div preview không viền. */}
      <div className="flex max-w-[520px] flex-col gap-4 border-none border-current">
        <DonGia id="ds-ia-gia" />
        <ChietKhau id="ds-ia-ck" />
        <SoTien id="ds-ia-tien" />
        <DaThu id="ds-ia-thu" />
      </div>
    </section>
  )
}

/** #input-affix dạng hàng (/ds): mỗi biến thể một hàng; ô rộng tối đa `max-w-sm`. */
export function KhoiInputAffixHang() {
  return (
    <KhoiHang neo="input-affix">
      <BienThe ten="VND" moTa="Ô tiền: gõ số, tự chấm hàng nghìn, ký hiệu ₫ phía sau. Rê chuột hoặc bấm Tab để thấy viền.">
        <div className="max-w-sm">
          <DonGia id="ds-iah-gia" />
        </div>
      </BienThe>
      <BienThe ten="%" moTa="Đơn vị đứng sau số; nhận số thập phân.">
        <div className="max-w-sm">
          <ChietKhau id="ds-iah-ck" />
        </div>
      </BienThe>
      <BienThe ten="Lỗi" moTa="Viền đỏ cả khung + câu lỗi.">
        <div className="max-w-sm">
          <SoTien id="ds-iah-tien" />
        </div>
      </BienThe>
      <BienThe ten="Tắt" moTa="Số hệ thống tính, chỉ xem.">
        <div className="max-w-sm">
          <DaThu id="ds-iah-thu" />
        </div>
      </BienThe>
      <BienThe ten="Icon + nút" moTa="shadcn: icon đầu khung (addon inline-start) và nút xoá trong khung (InputGroupButton).">
        <div className="max-w-sm">
          <TimKiem id="ds-iah-tim" />
        </div>
      </BienThe>
      <BienThe ten="Nhiều dòng" moTa="shadcn: InputGroupTextarea + addon block-end (đếm ký tự).">
        <div className="max-w-sm">
          <GhiChu id="ds-iah-ghichu" />
        </div>
      </BienThe>
    </KhoiHang>
  )
}
