'use client'

import { useState } from 'react'
import { FieldError, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

function TinhTrang(props: { ten: string; giaTri?: string; so: string; invalid?: boolean; loi?: string; disabled?: boolean }) {
  return (
    <Select defaultValue={props.giaTri} disabled={props.disabled}>
      <SelectTrigger
        data-so={props.so}
        aria-label={props.ten}
        aria-invalid={props.invalid || undefined}
        aria-describedby={props.loi}
      >
        <SelectValue placeholder="Chọn tình trạng hàng" />
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

/**
 * #select — tái tạo ds/nguon/components/Select/preview.html: lưới tự xếp cột tối thiểu 220, gap 16, căn trên (style
 * inline của preview). Cột 1 "Kênh bán": preview vẽ menu mở TĨNH dưới nút; ở đây bấm nút thật mới mở (Select modal —
 * mở sẵn là khoá cả trang /ds). Cột 2: trigger placeholder / hover (rê thật, preview ép `.is-hover`) / lỗi / tắt.
 * Cột dọc gap 8 = `.ui-stack`; cột 2 là nhóm (FieldSet) nên nhãn là legend, cách nút 8 như preview. Dữ liệu demo.
 * `data-so` = khoá so khớp (ds/so-khop/select.json).
 */
export function KhoiSelect() {
  const [kenh, setKenh] = useState('showroom')
  return (
    <section id="select" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#select">Select</a>
      </h2>
      {/* border-none border-current: div ăn preflight `0 solid var(--border)` của app; div preview không viền. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] items-start gap-4 border-none border-current">
        <div className="flex flex-col gap-2 border-none border-current">
          <FieldLabel data-so="nhan" htmlFor="ds-select-kenh">
            Kênh bán
          </FieldLabel>
          <Select value={kenh} onValueChange={setKenh}>
            <SelectTrigger data-so="kenh" id="ds-select-kenh">
              <SelectValue placeholder="Chọn kênh bán" />
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
        <FieldSet>
          <FieldLegend className="mb-2">Trạng thái trigger</FieldLegend>
          <TinhTrang so="placeholder" ten="Tình trạng hàng (chưa chọn)" />
          <TinhTrang so="hover" ten="Tình trạng hàng (rê chuột)" giaTri="con" />
          <TinhTrang so="loi" ten="Tình trạng hàng (lỗi)" giaTri="het" invalid loi="ds-select-loi" />
          <FieldError data-so="loi-msg" id="ds-select-loi">
            Hết hàng — chọn Đặt trước nếu khách chờ được (demo).
          </FieldError>
          <TinhTrang so="tat" ten="Tình trạng hàng (tắt)" giaTri="dat-truoc" disabled />
        </FieldSet>
      </div>
    </section>
  )
}
