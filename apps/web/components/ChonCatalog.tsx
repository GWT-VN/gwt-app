'use client'

import { Combobox } from '@/components/ui/combobox'
import type { CatalogChon } from '@/app/actions'

/**
 * Ô chọn sản phẩm từ catalog — GÕ để lọc theo tên + mã nội bộ (bỏ dấu), thay cho
 * <select> 326 dòng. Trả về internal_code. Dùng cho nhập kho / lắp bộ.
 */
export function ChonCatalog({
  catalog, value, onChange, placeholder = 'Gõ tên hoặc mã nội bộ…',
}: {
  catalog: CatalogChon[]
  value: string
  onChange: (internalCode: string) => void
  placeholder?: string
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
      aria-label="Máy hoặc sản phẩm"
      placeholder="Chọn máy hoặc sản phẩm"
      searchPlaceholder={placeholder}
    />
  )
}
