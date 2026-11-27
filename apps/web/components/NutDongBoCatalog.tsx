'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { syncCatalogNow, type CatalogSyncLog } from '@/app/actions'
import { hienNgay } from '@/lib/dinh-dang-ngay'

const BANG = ['catalog_item', 'catalog_category', 'supplier_code',
  'product_bundle', 'product_filter', 'product_warranty']

const khiNao = (iso: string) => hienNgay(iso, 'gio')

/** Nút bấm tay đồng bộ catalog + nhật ký các lần chạy. Chỉ admin thấy trang này. */
export function NutDongBoCatalog({ logs }: { logs: CatalogSyncLog[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  async function chay() {
    setBusy(true); setErr(null); setOk(null)
    const r = await syncCatalogNow()
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    const t = (r.ket_qua?.tables ?? {}) as Record<string, unknown>
    const fmt = (v: unknown): string => {
      if (typeof v === 'number') return `${v} dòng`
      if (v && typeof v === 'object') {
        const o = v as { error?: unknown; skipped?: unknown }
        if (o.error != null) return `lỗi: ${o.error}`
        if (o.skipped != null) return `bỏ qua (${o.skipped})`
      }
      return v == null ? '—' : String(v)
    }
    setOk('Đã đồng bộ: ' + BANG.map((b) => `${b} ${fmt(t[b])}`).join(' · '))
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={chay} loading={busy}>
          {busy ? 'Đang đồng bộ…' : 'Đồng bộ catalog ngay'}
        </Button>
        <span className="text-xs text-muted-foreground">Tự chạy hàng ngày 02:00 (giờ VN). Nút này để chạy ngay khi cần.</span>
      </div>
      {ok && <Alert color="success"><AlertDescription>{ok}</AlertDescription></Alert>}
      {err && <Alert color="danger"><AlertDescription>{err}</AlertDescription></Alert>}

      <div>
        <h2 className="text-sm font-medium text-foreground mb-2">Nhật ký gần đây</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có lần chạy nào.</p>
        ) : (
          <ul className="divide-y border rounded-lg">
            {logs.map((l) => (
              <li key={l.id} className="px-3 py-2.5 text-sm flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge variant="soft" color={l.ok ? 'success' : 'danger'}>{l.ok ? 'Thành công' : 'Lỗi'}</Badge>
                  <span className="text-muted-foreground ml-2">{khiNao(l.chay_luc)}</span>
                  {l.thong_bao && <div className="text-xs text-(--color-text-warning) mt-0.5">{l.thong_bao}</div>}
                  {l.chi_tiet && (
                    <div className="font-mono text-xs text-muted-foreground mt-0.5 break-all">
                      {JSON.stringify(l.chi_tiet)}
                    </div>
                  )}
                </div>
                {l.ms != null && <span className="text-xs text-muted-foreground flex-none">{l.ms}ms</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
