'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { duyetExport, tuChoiExport, type YeuCauExport } from '@/app/actions'
import { hienNgay } from '@/lib/dinh-dang-ngay'

/** Yêu cầu xuất danh sách CÓ PII (SĐT/địa chỉ) chờ admin duyệt. */
export function DuyetExportList({ items }: { items: YeuCauExport[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function lam(id: string, duyet: boolean) {
    setBusy(id); setErr(null)
    const r = duyet ? await duyetExport(id) : await tuChoiExport(id)
    setBusy(null)
    if (!r.ok) setErr(r.error)
    else router.refresh()
  }

  if (!items.length) return <p className="text-sm text-muted-foreground">Không có yêu cầu xuất nào chờ duyệt.</p>
  return (
    <div className="space-y-2">
      {err && <Alert color="danger"><AlertDescription>{err}</AlertDescription></Alert>}
      <ul className="divide-y border rounded-lg">
        {items.map((y) => (
          <li key={y.id} className="px-3 py-2.5 flex items-start justify-between gap-3 text-sm">
            <div className="min-w-0">
              <div className="text-foreground">Xuất khách <strong>có SĐT/địa chỉ</strong></div>
              {y.tieu_chi?.q ? <div className="text-muted-foreground text-xs">lọc: “{String(y.tieu_chi.q)}”</div> : <div className="text-muted-foreground text-xs">toàn bộ</div>}
              <div className="text-[11px] text-muted-foreground">{y.nguoi_gui ?? '—'} · {hienNgay(y.created_at, 'gio')}</div>
            </div>
            <div className="flex gap-2 flex-none">
              <Button size="sm" onClick={() => lam(y.id, true)} disabled={busy === y.id}>
                {busy === y.id ? '…' : 'Duyệt'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => lam(y.id, false)} disabled={busy === y.id}>Từ chối</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
