import type { ReactNode } from 'react'
import { ChoiceLabel } from '@/components/ui/checkbox'
import { FieldError, FieldLegend, FieldSet } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { BienThe, KhoiHang } from '../_khung/tam'

/** `.ds-muc` + `.ds-nhan` của preview (khung trình bày, không phải component): cách dưới 28; nhãn 500 12/16 muted. */
function Muc({ nhan, children }: { nhan: string; children: ReactNode }) {
  return (
    <div data-so="muc" className="mb-7 border-none border-current">
      <div className="mb-2 border-none border-current text-[12px] leading-[16px] font-medium text-muted-foreground">
        {nhan}
      </div>
      {children}
    </div>
  )
}

/* Nhóm demo dùng chung cho KhoiRadio (so khớp, /ds/tron) và KhoiRadioHang (/ds). */

function NhomDoc() {
  return (
    <RadioGroup asChild defaultValue="ck">
      <FieldSet data-so="doc">
        <FieldLegend data-so="legend">Hình thức thanh toán</FieldLegend>
        <ChoiceLabel nhan="Chuyển khoản" moTa="Đối soát tự động theo sao kê.">
          <RadioGroupItem value="ck" />
        </ChoiceLabel>
        <ChoiceLabel>
          <RadioGroupItem value="tm" />
          <span className="border-none border-current">Tiền mặt</span>
        </ChoiceLabel>
        <ChoiceLabel>
          <RadioGroupItem value="the" disabled />
          <span className="border-none border-current">Thẻ (chưa hỗ trợ)</span>
        </ChoiceLabel>
      </FieldSet>
    </RadioGroup>
  )
}

function NhomNgang() {
  return (
    <RadioGroup asChild orientation="horizontal" defaultValue="thuong">
      <FieldSet data-so="ngang">
        <FieldLegend>Mức độ</FieldLegend>
        <ChoiceLabel>
          <RadioGroupItem value="thap" />
          <span className="border-none border-current">Thấp</span>
        </ChoiceLabel>
        <ChoiceLabel>
          <RadioGroupItem value="thuong" />
          <span className="border-none border-current">Thường</span>
        </ChoiceLabel>
        <ChoiceLabel>
          <RadioGroupItem value="gap" />
          <span className="border-none border-current">Gấp</span>
        </ChoiceLabel>
      </FieldSet>
    </RadioGroup>
  )
}

function NhomLoi({ id }: { id: string }) {
  return (
    <RadioGroup asChild required>
      <FieldSet data-so="loi-nhom" aria-describedby={id}>
        <FieldLegend required>Giới tính</FieldLegend>
        <ChoiceLabel>
          <RadioGroupItem value="nam" aria-invalid />
          <span className="border-none border-current">Nam</span>
        </ChoiceLabel>
        <ChoiceLabel>
          <RadioGroupItem value="nu" aria-invalid />
          <span className="border-none border-current">Nữ</span>
        </ChoiceLabel>
        <FieldError data-so="loi-msg" id={id}>
          Chọn một lựa chọn.
        </FieldError>
      </FieldSet>
    </RadioGroup>
  )
}

/**
 * #radio — tái tạo ds/nguon/components/Radio/preview.html: 3 mục cạnh nhau (`.ds-hang` gap 24, căn đầu) — dọc có mô tả
 * + mục tắt, ngang, lỗi chưa chọn. Hover/focus: rê chuột / Tab thật (so khớp đo bằng bước `tro`/`tab`).
 * Dữ liệu minh hoạ (demo). `data-so` = khoá so khớp (ds/so-khop/radio.json).
 */
export function KhoiRadio() {
  return (
    <section id="radio" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#radio">Radio</a>
      </h2>
      <div data-so="hang" className="flex flex-wrap items-start gap-6 border-none border-current">
        <Muc nhan="Dọc, có mô tả">
          <NhomDoc />
        </Muc>
        <Muc nhan="Ngang (≤ 4 lựa chọn ngắn)">
          <NhomNgang />
        </Muc>
        <Muc nhan="Lỗi (chưa chọn)">
          <NhomLoi id="ds-radio-loi" />
        </Muc>
      </div>
    </section>
  )
}

/** #radio dạng hàng (/ds): mỗi biến thể một hàng. */
export function KhoiRadioHang() {
  return (
    <KhoiHang neo="radio">
      <BienThe ten="Dọc, có mô tả" moTa="Chọn đúng một trong vài lựa chọn; mục không chọn được ghi lý do. Rê chuột, bấm Tab rồi ↑↓ để thử.">
        <NhomDoc />
      </BienThe>
      <BienThe ten="Ngang" moTa="≤ 4 lựa chọn ngắn.">
        <NhomNgang />
      </BienThe>
      <BienThe ten="Lỗi" moTa="Bắt buộc mà chưa chọn; câu lỗi dưới nhóm.">
        <NhomLoi id="ds-radioh-loi" />
      </BienThe>
    </KhoiHang>
  )
}
