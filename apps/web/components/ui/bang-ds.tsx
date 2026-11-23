'use client'

import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, CaretLeft, CaretRight, X } from '@phosphor-icons/react/ssr'
import { CauHinhBang, useCauHinh, type BieuTuong, type NghiaChieu, type PropsGoiY, type PropsOChon } from '@/bang'
import type { GiaoDienBang } from '@/bang/giaoDien'
import { GIAO_DIEN_DS, THANH_HANG_LOAT_SURFACE } from './bang-styles'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { TooltipNhanh } from './tooltip'


/** Radix Select cấm mục giá trị '' → mục "Tất cả" mang khoá riêng, đổi về '' khi báo ra. */
const TAT_CA = '__tat-ca__'

/**
 * Khe `OChon` của bang/ (BoLocChon, chế độ LocNgay) = Select DS (≤ 10 mục, luật CHUAN-FILTER). Rộng 192 như `<select>`
 * cũ (nhãn dài cắt bằng ellipsis của selectValue). Chữ trigger truyền thẳng vào SelectValue (HTML server có chữ).
 */
function OChonDs({ value, onValueChange, muc, nhanTatCa, 'aria-label': ten }: PropsOChon) {
  const gt = value === '' && nhanTatCa != null ? TAT_CA : value
  const chu = gt === TAT_CA ? nhanTatCa : muc.find((m) => m.giaTri === value)?.nhan
  return (
    <Select value={gt} onValueChange={(v) => onValueChange(v === TAT_CA ? '' : v)}>
      <SelectTrigger aria-label={ten} className="w-48 max-w-full">
        <SelectValue>{chu}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {nhanTatCa != null && <SelectItem value={TAT_CA}>{nhanTatCa}</SelectItem>}
        {muc.map((m) => (
          <SelectItem key={m.giaTri} value={m.giaTri}>
            {m.nhan}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function GoiYDs({ noiDung, children }: PropsGoiY) {
  return <TooltipNhanh content={noiDung}>{children}</TooltipNhanh>
}

// Chip ×: X bold (preview FilterBar); ✕ của thanh hàng loạt: X regular (preview BulkActionBar).
const BIEU_TUONG: BieuTuong = {
  boLoc: <X weight="bold" aria-hidden="true" />,
  boChon: <X aria-hidden="true" />,
  len: <ArrowUp aria-hidden="true" />,
  xuong: <ArrowDown aria-hidden="true" />,
  truoc: <CaretLeft aria-hidden="true" />,
  sau: <CaretRight aria-hidden="true" />,
}

/**
 * CauHinhBangDs — `CauHinhBang` của bang/ với giao diện DS: `GIAO_DIEN_DS` (FilterBar, Pagination, BulkActionBar, tiêu
 * đề cột, ô chọn dòng), `OChon` = Select DS, icon Phosphor, tooltip DS, Esc bỏ hết lựa chọn. Đặt TRONG `DsRoot` (Select,
 * Tooltip portal vào ô của DsRoot). `tenCot` / `nghiaSapXep` không truyền → lấy của `CauHinhBang` bao ngoài (layout dự
 * án). `giaoDien` = ghép đè vài khoá (vd khối /ds đặt thanh hàng loạt đứng tĩnh). `thanhHangLoat="surface"` = BulkActionBar
 * mặt nổi (`.ui-bulkbar[data-variant="surface"]`, CEO chốt 23/11).
 */
export function CauHinhBangDs({
  tenCot,
  nghiaSapXep,
  giaoDien,
  thanhHangLoat,
  children,
}: {
  tenCot?: Record<string, string>
  nghiaSapXep?: Record<string, NghiaChieu>
  giaoDien?: Partial<GiaoDienBang>
  thanhHangLoat?: 'surface'
  children: ReactNode
}) {
  const ngoai = useCauHinh()
  return (
    <CauHinhBang
      giaoDien={{ ...GIAO_DIEN_DS, ...(thanhHangLoat === 'surface' && THANH_HANG_LOAT_SURFACE), ...giaoDien }}
      tenCot={tenCot ?? ngoai.tenCot}
      nghiaSapXep={nghiaSapXep ?? ngoai.nghiaSapXep}
      OChon={OChonDs}
      bieuTuong={BIEU_TUONG}
      GoiY={GoiYDs}
      escBoChon
    >
      {children}
    </CauHinhBang>
  )
}
