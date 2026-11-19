'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { LoaiNguoi } from '@/app/ticket/nguoi-actions'
import { dsChoChon, type NguoiDs } from '@/lib/loi/nguoiTicket'

type KQ = { ok: true } | { ok: false; error: string }

const nhan = (x: NguoiDs) => `${x.ten}${x.la_ctv ? ' (CTV)' : ''}`

/**
 * Ô chọn người trên ticket (CS theo dõi / Kỹ thuật) — CHỈ CHỌN (Hiệp 19/11/2026). Thêm / xoá người làm ở trang quản trị
 * /danh-sach-nguoi (chỉ admin@ + ai@); `quanTri` = hiện link sang trang đó. `onChon` gán vào ticket.
 */
export function ChonNguoi({ loai, ds, dangGan, onChon, disabled, quanTri = false, className = '' }: {
  loai: LoaiNguoi; ds: NguoiDs[]; dangGan: string | null
  onChon: (id: string | null) => Promise<KQ>; disabled?: boolean; quanTri?: boolean; className?: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const tenDs = loai === 'cs' ? 'CS theo dõi' : 'kỹ thuật'

  async function chon(id: string | null) {
    setBusy(true); setErr(null)
    const r = await onChon(id)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    router.refresh()
  }

  return (
    <span className={`inline-flex flex-col gap-1 ${className}`}>
      <span className="inline-flex items-center gap-2">
        <select className="rounded-lg border px-2 py-1 text-sm bg-white text-slate-900 disabled:opacity-50"
          disabled={disabled || busy} aria-label={`Chọn ${tenDs}`} value={dangGan ?? ''}
          onChange={(e) => chon(e.target.value || null)}>
          <option value="">— Chưa gán —</option>
          {dsChoChon(ds, dangGan).map((x) => <option key={x.id} value={x.id}>{nhan(x)}{x.an ? ' (nghỉ)' : ''}</option>)}
        </select>
        {quanTri && <Link href="/danh-sach-nguoi" className="text-xs text-slate-500 underline whitespace-nowrap">Quản lý danh sách →</Link>}
      </span>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </span>
  )
}
