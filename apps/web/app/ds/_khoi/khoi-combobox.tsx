'use client'

import { useState } from 'react'
import type { MucChon } from '@/bang/OChonGoiY'
import { Combobox, ComboboxPanel } from '@/components/ui/combobox'
import { FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { menuContent } from '@/components/ui/menu-styles'
import { cn } from '@/lib/utils'

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

/** Mặt `.ui-menu` nằm tĩnh trong cột (không nổi): bỏ z của lớp menu. */
const matTinh = cn(menuContent, 'z-auto')

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
          <ComboboxPanel className={matTinh} value={null} onSelect={() => {}} options={TINH} defaultSearch="zzz" />
          <ComboboxPanel className={matTinh} value={null} onSelect={() => {}} tim={timTreo} defaultSearch="n" />
          <ComboboxPanel className={matTinh} value={null} onSelect={() => {}} tim={timTreo} defaultSearch="nguyen" />
        </FieldSet>
      </div>
    </section>
  )
}
