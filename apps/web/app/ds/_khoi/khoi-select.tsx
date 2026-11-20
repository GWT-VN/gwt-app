'use client'

import { useState } from 'react'
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BienThe, KhoiHang } from '../_khung/tam'

const KENH = [
  ['online', 'Online'],
  ['showroom', 'Showroom'],
  ['dai-ly', 'Đại lý'],
] as const

const TINH_TRANG = [
  ['con', 'Còn hàng'],
  ['het', 'Hết hàng'],
  ['dat-truoc', 'Đặt trước'],
] as const

/* Demo dùng chung cho KhoiSelect (so khớp, /ds/tron) và KhoiSelectHang (/ds). */

/** Chữ của giá trị đang chọn — truyền thẳng vào SelectValue: Radix chỉ lấy chữ mục khi danh sách đã mở một lần, HTML server rỗng. */
const chuCua = (ds: readonly (readonly [string, string])[], gt: string | undefined) => ds.find(([g]) => g === gt)?.[1]

function TinhTrang(props: { ten: string; giaTri?: string; so: string; invalid?: boolean; loi?: string; disabled?: boolean }) {
  const [gt, setGt] = useState(props.giaTri)
  return (
    <Select value={gt} onValueChange={setGt} disabled={props.disabled}>
      <SelectTrigger
        data-so={props.so}
        aria-label={props.ten}
        aria-invalid={props.invalid || undefined}
        aria-describedby={props.loi}
      >
        <SelectValue placeholder="Chọn tình trạng hàng">{chuCua(TINH_TRANG, gt)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {TINH_TRANG.map(([gt, nhan]) => (
          <SelectItem key={gt} value={gt}>
            {nhan}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function CauLoi({ id }: { id: string }) {
  return (
    <FieldError data-so="loi-msg" id={id}>
      Hết hàng — chọn Đặt trước nếu khách chờ được (demo).
    </FieldError>
  )
}

function KenhBan({ id }: { id: string }) {
  const [kenh, setKenh] = useState('showroom')
  return (
    <div className="flex flex-col gap-2 border-none border-current">
      <FieldLabel data-so="nhan" htmlFor={id}>
        Kênh bán
      </FieldLabel>
      <Select value={kenh} onValueChange={setKenh}>
        <SelectTrigger data-so="kenh" id={id}>
          <SelectValue placeholder="Chọn kênh bán">{chuCua(KENH, kenh)}</SelectValue>
        </SelectTrigger>
        <SelectContent data-so="content">
          {KENH.map(([gt, nhan]) => (
            <SelectItem key={gt} value={gt} data-so={gt}>
              {nhan}
            </SelectItem>
          ))}
          <SelectItem value="san" data-so="san" disabled>
            Sàn TMĐT (chưa mở)
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

/**
 * #select — tái tạo ds/nguon/components/Select/preview.html: lưới tự xếp cột tối thiểu 220, gap 16, căn trên (style
 * inline của preview). Cột 1 "Kênh bán": preview vẽ menu mở TĨNH dưới nút; ở đây bấm nút thật mới mở (Select modal —
 * mở sẵn là khoá cả trang /ds). Cột 2: trigger placeholder / hover (rê thật, preview ép `.is-hover`) / lỗi / tắt.
 * Cột dọc gap 8 = `.ui-stack`; cột 2 là nhóm (FieldSet) nên nhãn là legend, cách nút 8 như preview. Dữ liệu demo.
 * `data-so` = khoá so khớp (ds/so-khop/select.json).
 */
export function KhoiSelect() {
  return (
    <section id="select" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#select">Select</a>
      </h2>
      {/* border-none border-current: div ăn preflight `0 solid var(--border)` của app; div preview không viền. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] items-start gap-4 border-none border-current">
        <KenhBan id="ds-select-kenh" />
        <FieldSet>
          <FieldLegend className="mb-2">Trạng thái trigger</FieldLegend>
          <TinhTrang so="placeholder" ten="Tình trạng hàng (chưa chọn)" />
          <TinhTrang so="hover" ten="Tình trạng hàng (rê chuột)" giaTri="con" />
          <TinhTrang so="loi" ten="Tình trạng hàng (lỗi)" giaTri="het" invalid loi="ds-select-loi" />
          <CauLoi id="ds-select-loi" />
          <TinhTrang so="tat" ten="Tình trạng hàng (tắt)" giaTri="dat-truoc" disabled />
        </FieldSet>
      </div>
    </section>
  )
}

/** #select dạng hàng (/ds): mỗi trạng thái trigger một hàng; nút rộng tối đa `max-w-sm`. */
export function KhoiSelectHang() {
  return (
    <KhoiHang neo="select">
      <BienThe ten="Chưa chọn" moTa="Chữ mờ nói cần chọn gì.">
        <div className="max-w-sm">
          <TinhTrang so="placeholder" ten="Tình trạng hàng (chưa chọn)" />
        </div>
      </BienThe>
      <BienThe ten="Có giá trị" moTa="Danh sách ngắn (≤ 10 mục), không cần gõ tìm. Rê chuột / bấm Tab để thấy viền đổi.">
        <div className="max-w-sm">
          <TinhTrang so="hover" ten="Tình trạng hàng (có giá trị)" giaTri="con" />
        </div>
      </BienThe>
      <BienThe ten="Lỗi" moTa="Viền đỏ + câu lỗi nói cách sửa.">
        <Field className="max-w-sm">
          <TinhTrang so="loi" ten="Tình trạng hàng (lỗi)" giaTri="het" invalid loi="ds-selecth-loi" />
          <CauLoi id="ds-selecth-loi" />
        </Field>
      </BienThe>
      <BienThe ten="Tắt" moTa="Không đổi được ở bước này.">
        <div className="max-w-sm">
          <TinhTrang so="tat" ten="Tình trạng hàng (tắt)" giaTri="dat-truoc" disabled />
        </div>
      </BienThe>
      <BienThe ten="Đang mở" moTa="Bấm để mở: mục đang chọn có dấu ✓, mục tắt không chọn được.">
        <div className="max-w-sm">
          <KenhBan id="ds-selecth-kenh" />
        </div>
      </BienThe>
    </KhoiHang>
  )
}
