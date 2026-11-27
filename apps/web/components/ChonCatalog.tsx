'use client'

import { Combobox } from '@/components/ui/combobox'
import type { CatalogChon } from '@/app/actions'

/**
 * Ô chọn sản phẩm từ catalog — GÕ để lọc theo tên + mã nội bộ (bỏ dấu), thay cho
 * <select> 326 dòng. Trả về internal_code. Dùng cho nhập kho / lắp bộ.
 */
export function ChonCatalog({
  catalog, value, onChange, placeholder = 'Gõ tên hoặc mã nội bộ…', 'aria-label': nhan = 'Máy hoặc sản phẩm',
}: {
  catalog: CatalogChon[]
  value: string
  onChange: (internalCode: string) => void
  placeholder?: string
  /** Tên đọc của ô theo ngữ cảnh (vd "Máy đăng ký bảo hành", "Sản phẩm nhập kho"). */
  'aria-label'?: string
}) {
  const options = catalog.map((c) => ({
    gt: c.internal_code,
    nhan: c.ten && c.ten !== c.internal_code ? `${c.ten} · ${c.internal_code}` : c.internal_code,
    anMa: true,
  }))
  return (
    <Combobox
      value={value || null}
      onValueChange={(code) => onChange(code ?? '')}
      options={options}
      aria-label={nhan}
      placeholder="Chọn máy hoặc sản phẩm"
      searchPlaceholder={placeholder}
    />
  )
}
