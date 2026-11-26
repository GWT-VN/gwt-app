'use client'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { xoaKhach } from './actions'

export function CustomerActions({ customerCode }: { customerCode: string }) {
  const router = useRouter()
  const [mo, setMo] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onDelete() {
    setErr(null)
    const res = await xoaKhach(customerCode)
    if (!res.ok) {
      setErr(res.error)
      throw new Error(res.error)
    }
    router.push('/sales/khach')
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/sales/khach/${encodeURIComponent(customerCode)}/sua`}>Sửa</Link>
      </Button>
      <Button variant="destructive" size="sm" onClick={() => { setErr(null); setMo(true) }}>
        Xoá
      </Button>
      <ConfirmDialog
        open={mo}
        onOpenChange={setMo}
        color="danger"
        pha
        tieuDe={`Xoá khách ${customerCode}?`}
        moTa="Không hoàn tác được."
        nutXacNhan="Xoá khách"
        loi={err}
        onXacNhan={onDelete}
      />
    </div>
  )
}
