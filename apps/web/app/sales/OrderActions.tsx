'use client'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { xoaDon } from './actions'

export function OrderActions({ orderCode }: { orderCode: string }) {
  const router = useRouter()
  const [mo, setMo] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onDelete() {
    setErr(null)
    const res = await xoaDon(orderCode)
    if (!res.ok) {
      setErr(res.error)
      throw new Error(res.error)
    }
    router.push('/sales')
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/sales/don/${encodeURIComponent(orderCode)}/sua`}>Sửa</Link>
      </Button>
      <Button variant="destructive" size="sm" onClick={() => { setErr(null); setMo(true) }}>
        Xoá
      </Button>
      <ConfirmDialog
        open={mo}
        onOpenChange={setMo}
        color="danger"
        pha
        tieuDe={`Xoá đơn ${orderCode}?`}
        moTa="Không hoàn tác được. Google Sheet Sales giữ dòng đơn và đánh dấu Tình trạng hàng là Huỷ."
        nutXacNhan="Xoá đơn"
        loi={err}
        onXacNhan={onDelete}
      />
    </div>
  )
}
