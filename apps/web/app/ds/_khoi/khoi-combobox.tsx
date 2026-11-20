'use client'

import { useState } from 'react'
import type { MucChon } from '@/bang/OChonGoiY'
import { Combobox, ComboboxPanel } from '@/components/ui/combobox'
import { FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { menuContent } from '@/components/ui/menu-styles'
import { cn } from '@/lib/utils'

// Dữ liệu demo (chép từ preview): mã là số thứ tự, KHÔNG phải mã hành chính.
const TINH: MucChon[] = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn',
  'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng',
  'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương',
  'Hậu Giang', 'Hoà Bình', 'Hưng Yên', 'Khánh Hoà', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai',
  'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam',
  'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hoá',
  'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
].map((nhan, i) => ({ gt: String(i + 1).padStart(2, '0'), nhan }))

/** Tìm xa giả: không bao giờ trả lời → giữ trạng thái "Đang tìm…" (demo). Cấp module → tham chiếu cố định cho useTimXa. */
const timTreo = () => new Promise<MucChon[]>(() => {})

/** Mặt `.ui-menu` nằm tĩnh trong cột (không nổi): bỏ z của lớp menu. */
const matTinh = cn(menuContent, 'z-auto')

/**
 * #combobox — tái tạo ds/nguon/components/Combobox/preview.html: lưới tự xếp cột tối thiểu 260, gap 16, căn trên.
 * Cột 1 "Tỉnh/thành" (63 mục demo, hiện tối đa 8 như preview): preview vẽ pop mở TĨNH dưới nút; ở đây bấm nút thật mới
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
          <ComboboxPanel className={matTinh} value={null} onSelect={() => {}} options={TINH} defaultSearch="zzz" />
          <ComboboxPanel className={matTinh} value={null} onSelect={() => {}} tim={timTreo} defaultSearch="n" />
          <ComboboxPanel className={matTinh} value={null} onSelect={() => {}} tim={timTreo} defaultSearch="nguyen" />
        </FieldSet>
      </div>
    </section>
  )
}
