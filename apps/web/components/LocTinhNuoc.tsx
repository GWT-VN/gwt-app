'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

/**
 * Lọc theo tỉnh ở hồ sơ nước. Danh sách tỉnh lấy từ CHÍNH dữ liệu đang có, không phải
 * danh mục 63 tỉnh — hiện tỉnh không có lượt đo nào chỉ tổ khiến người dùng bấm vào rồi
 * thấy bảng rỗng.
 */
export function LocTinhNuoc({ dsTinh, dangChon }: { dsTinh: string[]; dangChon: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  function chon(v: string) {
    const p = new URLSearchParams(sp.toString())
    if (v) p.set('tinh', v); else p.delete('tinh')
    p.delete('trang')
    router.push(`${pathname}?${p.toString()}`)
  }

  if (!dsTinh.length) return null
  return (
    <label className="block">
      <span className="text-xs text-slate-500">Tỉnh / TP</span>
      <select
        value={dangChon}
        onChange={(e) => chon(e.target.value)}
        className="mt-0.5 block rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-900"
      >
        <option value="">Tất cả</option>
        {dsTinh.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
    </label>
  )
}
