'use client'

import { useCallback, useRef } from 'react'
import { Combobox } from '@/components/ui/combobox'
import { traKhachVaMay } from '@/app/ticket/loi-actions'
import { mucTuKetQuaKhach } from '@/lib/loi/traCuuForm'

/** Tra nhanh theo tên / SĐT khách: liệt kê máy + serial để chọn. */
export function KhachMayTraCuu({ onChonMay }: { onChonMay: (m: { customer_id: string; serial: string; nhan: string }) => void }) {
  const nhanTheoMa = useRef(new Map<string, string>())
  const tim = useCallback(async (q: string) => {
    const muc = mucTuKetQuaKhach(await traKhachVaMay(q))
    for (const m of muc) nhanTheoMa.current.set(m.gt, m.nhan)
    return muc.map((m) => ({ ...m, anMa: true }))
  }, [])
  return (
    <Combobox tim={tim} value={null} aria-label="Tra máy theo khách hàng"
      placeholder="Tìm máy theo khách" searchPlaceholder="Tra nhanh theo tên / SĐT khách…"
      onValueChange={(gt) => {
        if (!gt) return
        const i = gt.indexOf('|')
        const nhan = nhanTheoMa.current.get(gt)
        if (nhan) onChonMay({ customer_id: gt.slice(0, i), serial: gt.slice(i + 1), nhan })
      }} />
  )
}
