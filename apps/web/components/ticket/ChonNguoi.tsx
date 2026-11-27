'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { LoaiNguoi } from '@/app/ticket/nguoi-actions'
import { dsChoChon, type NguoiDs } from '@/lib/loi/nguoiTicket'
import { Combobox } from '@/components/ui/combobox'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

type KQ = { ok: true } | { ok: false; error: string }

const nhan = (x: NguoiDs) => `${x.ten}${x.la_ctv ? ' (CTV)' : ''}`

/**
 * Ô chọn người trên ticket (CS theo dõi / Kỹ thuật) — CHỈ CHỌN (Hiệp 19/11/2026). Thêm / xoá người làm ở trang quản trị
 * /danh-sach-nguoi (chỉ vai trò "Sửa danh sách người"); `quanTri` = hiện link sang trang đó. `onChon` gán vào ticket.
 */
export function ChonNguoi({ loai, ds, dangGan, onChon, disabled, quanTri = false, className = '' }: {
  loai: LoaiNguoi; ds: NguoiDs[]; dangGan: string | null
  onChon: (id: string | null) => Promise<KQ>; disabled?: boolean; quanTri?: boolean; className?: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const tenDs = loai === 'cs' ? 'CS theo dõi' : 'kỹ thuật'

  const muc = dsChoChon(ds, dangGan)

  async function chon(id: string | null) {
    setBusy(true); setErr(null)
    const r = await onChon(id)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    router.refresh()
  }

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {muc.length > 10 ? (
          <div className="w-48 max-w-full">
            <Combobox value={dangGan} onValueChange={chon} disabled={disabled || busy} aria-label={`Chọn ${tenDs}`}
              placeholder="Chưa gán" searchPlaceholder="Gõ tên…"
              options={muc.map((x) => ({ gt: x.id, nhan: nhan(x) + (x.an ? ' (đã xoá)' : '') }))}
            />
          </div>
        ) : (
          <div className="w-fit max-w-full">
            <NativeSelect size="sm" disabled={disabled || busy} aria-label={`Chọn ${tenDs}`} value={dangGan ?? ''}
              onChange={(e) => chon(e.target.value || null)}>
              <NativeSelectOption value="">— Chưa gán —</NativeSelectOption>
              {muc.map((x) => (
                <NativeSelectOption key={x.id} value={x.id}>{nhan(x)}{x.an ? ' (đã xoá)' : ''}</NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        )}
        {quanTri && <Link href="/danh-sach-nguoi" className="text-xs text-muted-foreground underline whitespace-nowrap">Sửa danh sách →</Link>}
      </div>
      {err && <span className="text-xs text-(--color-text-danger)">{err}</span>}
    </div>
  )
}
