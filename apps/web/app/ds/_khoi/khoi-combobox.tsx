'use client'

import { useState } from 'react'
import type { MucChon } from '@/bang/OChonGoiY'
import { locMucChon } from '@/bang/timkiem'
import { Combobox, ComboboxPanel } from '@/components/ui/combobox'
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { menuContent } from '@/components/ui/menu-styles'
import { cn } from '@/lib/utils'
import { BienThe, KhoiHang } from '../_khung/tam'

// Dữ liệu demo: 34 đơn vị hành chính cấp tỉnh từ 1/7/2025 theo Nghị quyết 202/2025/QH15 của Quốc hội (12/6/2025),
// Điều 1: khoản 1–23 (23 đơn vị hình thành sau sắp xếp) + khoản 24 (11 đơn vị không sắp xếp). Đối chiếu 20/11/2026:
// toàn văn trên luatvietnam.vn (402728) + pbgdpl.cantho.gov.vn. Thứ tự: 6 thành phố rồi 28 tỉnh theo ABC.
// Mã là số thứ tự, KHÔNG phải mã hành chính. (Danh mục địa chỉ thật của app vẫn là lib/tinh.ts — CEO chốt giữ tên cũ.)
const TINH: MucChon[] = [
  'Hà Nội', 'Hồ Chí Minh', 'Hải Phòng', 'Đà Nẵng', 'Cần Thơ', 'Huế',
  'An Giang', 'Bắc Ninh', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Tĩnh',
  'Hưng Yên', 'Khánh Hòa', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Nghệ An', 'Ninh Bình', 'Phú Thọ',
  'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sơn La', 'Tây Ninh', 'Thái Nguyên', 'Thanh Hóa', 'Tuyên Quang', 'Vĩnh Long',
].map((nhan, i) => ({ gt: String(i + 1).padStart(2, '0'), nhan }))

/** Tìm xa giả: không bao giờ trả lời → giữ trạng thái "Đang tìm…" (demo). Cấp module → tham chiếu cố định cho useTimXa. */
const timTreo = () => new Promise<MucChon[]>(() => {})

/** Tìm xa giả (demo): lọc TINH sau 400ms như gọi server. Cấp module → tham chiếu cố định. */
const timGia = (q: string) =>
  new Promise<MucChon[]>((xong) => setTimeout(() => xong(locMucChon(TINH, q, 30).ds), 400))

/** Mặt `.ui-menu` nằm tĩnh trong cột (không nổi): bỏ z của lớp menu. */
const matTinh = cn(menuContent, 'z-auto')

/** Ba trạng thái vẽ tĩnh bằng thân pop (`tinh`: không cmdk sống — không cuộn trang, không listbox thường trực) — dùng chung khối cũ (một cột) và bản hàng (mỗi trạng thái một hàng). */
const TRANG_THAI: { ten: string; moTa: string; options?: MucChon[]; tim?: typeof timTreo; defaultSearch: string }[] = [
  { ten: 'Không có kết quả', moTa: 'Gõ không khớp mục nào — danh sách báo rõ, không để trống trơn.', options: TINH, defaultSearch: 'zzz' },
  { ten: 'Tìm trên máy chủ: gõ thêm', moTa: 'Chưa đủ 2 ký tự — chưa tìm, nhắc gõ thêm.', tim: timTreo, defaultSearch: 'n' },
  { ten: 'Tìm trên máy chủ: đang tìm', moTa: 'Đã gửi đi tìm, đang chờ kết quả.', tim: timTreo, defaultSearch: 'nguyen' },
]

function PanelTrangThai({ options, tim, defaultSearch }: (typeof TRANG_THAI)[number]) {
  return (
    <ComboboxPanel tinh className={matTinh} value={null} onSelect={() => {}} options={options} tim={tim} defaultSearch={defaultSearch} />
  )
}

/**
 * #combobox — tái tạo ds/nguon/components/Combobox/preview.html: lưới tự xếp cột tối thiểu 260, gap 16, căn trên.
 * Cột 1 "Tỉnh/thành" (34 tỉnh/thành hiện hành, hiện tối đa 8 như preview): preview vẽ pop mở TĨNH dưới nút; ở đây bấm nút thật mới
 * mở (pop nổi trong portal). Cột 2: ba trạng thái vẽ tĩnh bằng chính thân pop (`ComboboxPanel`) — rỗng ("zzz"), tìm xa
 * chưa đủ ký tự ("n"), tìm xa đang tìm ("nguyen", `tim` treo). Cột dọc gap 8 = `.ui-stack`; nhãn cột 2 là legend (không
 * ăn gap của fieldset) nên tự cách 8. Khoá so khớp: ds/so-khop/combobox.json.
 */
export function KhoiCombobox() {
  const [tinh, setTinh] = useState<string | null>('01')
  return (
    <section id="combobox" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#combobox">Combobox</a>
      </h2>
      {/* border-none border-current: div ăn preflight `0 solid var(--border)` của app; div preview không viền. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-start gap-4 border-none border-current">
        <div className="flex flex-col gap-2 border-none border-current">
          <FieldLabel htmlFor="ds-combobox-tinh">Tỉnh/thành (gõ thử: &quot;ha&quot;, &quot;12&quot;)</FieldLabel>
          <Combobox id="ds-combobox-tinh" value={tinh} onValueChange={setTinh} options={TINH} max={8} />
        </div>
        <FieldSet>
          <FieldLegend className="mb-2">Rỗng · Tìm xa (OChonTimXa)</FieldLegend>
          {TRANG_THAI.map((t) => (
            <PanelTrangThai key={t.defaultSearch} {...t} />
          ))}
        </FieldSet>
      </div>
    </section>
  )
}

/** #combobox dạng hàng (/ds): mỗi chế độ / trạng thái một hàng. Ô rộng tối đa 320 như cột preview. */
export function KhoiComboboxHang() {
  const [sanCo, setSanCo] = useState<string | null>('01')
  const [xa, setXa] = useState<string | null>(null)
  const [sua, setSua] = useState<string | null>(TINH[21].gt)
  const [loi, setLoi] = useState<string | null>(null)
  return (
    <KhoiHang neo="combobox">
      <BienThe ten="Danh sách nạp sẵn" moTa="Danh sách trên 10 mục đã tải sẵn (tỉnh, kho, nhóm hàng) — gõ mã hoặc tên để lọc ngay.">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-cb-san">Tỉnh/thành (gõ thử: &quot;ha&quot;, &quot;12&quot;)</FieldLabel>
          <Combobox id="dsh-cb-san" value={sanCo} onValueChange={setSanCo} options={TINH} max={8} />
        </Field>
      </BienThe>
      <BienThe ten="Tìm trên máy chủ" moTa="Danh sách lớn không tải trước (khách, đơn, ticket) — gõ từ 2 ký tự mới bắt đầu tìm.">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-cb-xa">Tỉnh/thành (tìm trên máy chủ, demo trễ 0,4 giây)</FieldLabel>
          <Combobox id="dsh-cb-xa" value={xa} onValueChange={setXa} tim={timGia} />
        </Field>
      </BienThe>
      <BienThe ten="Mở form sửa đã có giá trị" moTa="Mở lại bản ghi đã lưu — ô hiện tên tỉnh/thành, không hiện mã thô.">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-cb-sua">Tỉnh/thành đã lưu</FieldLabel>
          <Combobox id="dsh-cb-sua" value={sua} onValueChange={setSua} tim={timGia} mucDangChon={TINH[21]} />
        </Field>
      </BienThe>
      <BienThe ten="Lỗi" moTa="Bắt buộc mà chưa chọn — viền đỏ + câu lỗi; trình đọc màn hình đọc câu lỗi cùng ô.">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-cb-loi" required>
            Tỉnh/thành giao
          </FieldLabel>
          <Combobox
            id="dsh-cb-loi"
            value={loi}
            onValueChange={setLoi}
            options={TINH}
            required
            aria-invalid={!loi}
            aria-describedby={loi ? undefined : 'dsh-cb-loi-msg'}
          />
          {!loi && <FieldError id="dsh-cb-loi-msg">Chọn tỉnh/thành giao.</FieldError>}
        </Field>
      </BienThe>
      <BienThe ten="Tắt" moTa="Không được sửa (đã khoá, thiếu quyền) — vẫn đọc được giá trị.">
        <Field className="max-w-80">
          <FieldLabel htmlFor="dsh-cb-tat">Tỉnh/thành</FieldLabel>
          <Combobox id="dsh-cb-tat" value="04" onValueChange={() => {}} options={TINH} disabled />
        </Field>
      </BienThe>
      {TRANG_THAI.map((t) => (
        <BienThe key={t.defaultSearch} ten={t.ten} moTa={t.moTa}>
          <div className="max-w-80 border-none border-current">
            <PanelTrangThai {...t} />
          </div>
        </BienThe>
      ))}
    </KhoiHang>
  )
}
