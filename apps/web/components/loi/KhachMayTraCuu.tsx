'use client'

import { useCallback } from 'react'
import { OChonTimXa } from '@/bang'
import { traKhachVaMay } from '@/app/ticket/loi-actions'
import { mucTuKetQuaKhach } from '@/lib/loi/traCuuForm'

/** Tra nhanh theo tên / SĐT khách: liệt kê máy + serial để chọn. */
export function KhachMayTraCuu({ onChonMay }: { onChonMay: (m: { customer_id: string; serial: string }) => void }) {
  const tim = useCallback(async (q: string) => mucTuKetQuaKhach(await traKhachVaMay(q)), [])
  return (
    <OChonTimXa tim={tim} choTrong="Tra nhanh theo tên / SĐT khách…"
      onChon={(m) => {
        const i = m.gt.indexOf('|')
        onChonMay({ customer_id: m.gt.slice(0, i), serial: m.gt.slice(i + 1) })
      }} />
  )
}
