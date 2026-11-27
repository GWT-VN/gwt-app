'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { KHO } from '@/lib/kho/nhan'

/** Chọn kho (NX mặc định, không ghi URL · HCM = `?kho=HCM`) — phạm vi của cả màn, không phải điều kiện lọc của tab. */
export function ChonKho({ kho }: { kho: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  function doi(v: string) {
    const p = new URLSearchParams(params.toString())
    if (v === 'NX') p.delete('kho')
    else p.set('kho', v)
    p.delete('trang')
    const s = p.toString()
    router.push(s ? `${pathname}?${s}` : pathname, { scroll: false })
  }
  return (
    <Select value={kho} onValueChange={doi}>
      <SelectTrigger aria-label="Kho" className="w-48 max-w-full">
        <SelectValue>{KHO.find((x) => x.ma === kho)?.ten}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {KHO.map((x) => <SelectItem key={x.ma} value={x.ma}>{x.ten}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
