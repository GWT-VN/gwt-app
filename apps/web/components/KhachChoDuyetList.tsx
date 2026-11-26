'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { duyetKhach, type KhachTom } from '@/app/actions'

/** Khách chờ duyệt (tạo từ CS). Duyệt CHỈ admin (server cũng chặn). */
export function KhachChoDuyetList({ items }: { items: KhachTom[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function duyet(id: string) {
    setBusy(id); setErr(null)
    const r = await duyetKhach(id)
    setBusy(null)
    if (!r.ok) setErr(r.error)
    else router.refresh()
  }

  if (!items.length) return <p className="text-sm text-muted-foreground">Không có khách nào chờ duyệt.</p>
  return (
    <div className="space-y-2">
      {err && <Alert color="danger"><AlertDescription>{err}</AlertDescription></Alert>}
      <ul className="divide-y border rounded-lg">
        {items.map((k) => (
          <li key={k.id} className="px-3 py-2.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm text-foreground">{k.full_name}</div>
              {k.primary_phone && <div className="font-mono text-xs text-muted-foreground">{k.primary_phone}</div>}
            </div>
            <Button size="sm" onClick={() => duyet(k.id)} loading={busy === k.id} className="flex-none">
              Duyệt
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
