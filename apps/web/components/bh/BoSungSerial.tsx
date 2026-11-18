'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { serialsTheoMay, type SerialKho } from '@/app/actions'
import { boSungSerial } from '@/app/may/chua-serial-actions'

/**
 * Khung vàng trên trang máy đang chờ bổ sung serial (kích hoạt BH trước — chị Trang 18/11).
 * Chọn serial tồn kho đúng loại máy (hoặc gõ) → đổi mã tạm thành serial thật; bảo hành / ticket / lịch bảo trì đi theo.
 */
export function BoSungSerial({ maTam, internalCode, choSua }: { maTam: string; internalCode: string | null; choSua: boolean }) {
  const router = useRouter()
  const [mo, setMo] = useState(false)
  const [ds, setDs] = useState<SerialKho[] | null>(null)
  const [serial, setSerial] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  function moForm() {
    setMo(true); setErr(null)
    if (internalCode && !ds) serialsTheoMay(internalCode).then(setDs).catch(() => setDs([]))
  }

  async function luu() {
    setBusy(true); setErr(null)
    const r = await boSungSerial(maTam, serial)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    router.replace(`/may/${encodeURIComponent(r.serial)}`)
    router.refresh()
  }

  const q = serial.trim().toLowerCase()
  const goiY = (ds ?? []).filter((s) => !q || s.serial.toLowerCase().includes(q)).slice(0, 30)

  return (
    <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2">
      <p className="text-sm text-amber-900">
        ⚠️ <strong>Chờ bổ sung serial.</strong> Máy đã kích hoạt bảo hành khi chưa có serial; đang dùng mã tạm{' '}
        <span className="font-mono">{maTam}</span>. Bổ sung serial thật thì bảo hành, ticket, lịch bảo trì giữ nguyên.
      </p>
      {choSua && !mo && (
        <button type="button" onClick={moForm} className="rounded-lg bg-amber-600 text-white px-3 py-1.5 text-sm font-medium">
          Bổ sung serial
        </button>
      )}
      {choSua && mo && (
        <div className="space-y-2">
          <input autoFocus value={serial} onChange={(e) => { setSerial(e.target.value); setErr(null) }} disabled={busy}
            placeholder={internalCode ? `Serial ${internalCode} trong kho — chọn bên dưới hoặc gõ` : 'Gõ serial…'}
            className="w-full rounded-lg border px-3 py-2 text-sm font-mono text-slate-900 bg-white" />
          {ds === null && internalCode && <p className="text-xs text-slate-500">Đang tải serial tồn kho…</p>}
          {ds && ds.length === 0 && <p className="text-xs text-slate-600">Kho chưa có serial nào của máy này — nhập kho trước, hoặc gõ serial đã có trong kho.</p>}
          {goiY.length > 0 && (
            <ul className="max-h-48 overflow-auto rounded-lg border bg-white text-sm">
              {goiY.map((s) => (
                <li key={s.serial}>
                  <button type="button" onClick={() => setSerial(s.serial)}
                    className={`w-full text-left px-3 py-1.5 font-mono hover:bg-slate-50 ${s.serial === serial.trim() ? 'bg-slate-100' : ''}`}>
                    {s.serial}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={luu} disabled={busy || !serial.trim()}
              className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm disabled:opacity-50">
              {busy ? 'Đang lưu…' : 'Lưu serial'}
            </button>
            <button type="button" onClick={() => setMo(false)} disabled={busy} className="rounded-lg border bg-white px-3 py-1.5 text-sm">Huỷ</button>
          </div>
        </div>
      )}
      {err && <p className="text-sm text-red-700">{err}</p>}
    </section>
  )
}
