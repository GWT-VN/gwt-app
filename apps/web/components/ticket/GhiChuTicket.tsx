'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { datGhiChu } from '@/app/ticket/dau-ticket-actions'
import { GHI_CHU_TOI_DA } from '@/lib/loi/ngayTicket'

/**
 * Ghi chú tự do của ticket (tickets.note, 26/11): CSKH ghi mọi thông tin CHƯA có ô riêng trên app.
 * Văn bản thuần để bot quét tìm trường còn thiếu. Mặc định XEM; "Sửa" mở ô nhiều dòng tại chỗ.
 * Nút / ô nhập theo đúng kiểu của TicketEditor + CapLoiXuLy (main chưa có thư viện DS).
 */
export function GhiChuTicket({ code, note, choSua }: { code: string; note: string | null; choSua: boolean }) {
  const [edit, setEdit] = useState(false)
  const [val, setVal] = useState(note ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  async function save() {
    setBusy(true); setErr(null)
    const r = await datGhiChu(code, val)
    setBusy(false)
    if (!r.ok) setErr(r.error)
    else { setEdit(false); router.refresh() }
  }

  function huy() { setVal(note ?? ''); setErr(null); setEdit(false) }

  return (
    <section className="bg-white rounded-xl border p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium text-slate-900">Ghi chú</h2>
        {choSua && !edit && (
          <button onClick={() => setEdit(true)} className="text-sm text-slate-600 underline flex-none">
            {note ? 'Sửa ghi chú' : 'Thêm ghi chú'}
          </button>
        )}
      </div>

      {!edit ? (
        note
          ? <p className="text-sm text-slate-900 whitespace-pre-wrap [overflow-wrap:anywhere]">{note}</p>
          : <p className="text-sm text-slate-400">Chưa có ghi chú.</p>
      ) : (
        <>
          <label className="block">
            <span className="text-sm text-slate-700">Ghi lại mọi thông tin của ticket chưa có ô riêng trên app</span>
            <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={8} maxLength={GHI_CHU_TOI_DA} autoFocus
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900" />
          </label>
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={busy}
              className="rounded-lg border border-transparent bg-slate-900 text-white px-4 py-2 font-medium disabled:opacity-50">
              {busy ? 'Đang lưu…' : 'Lưu'}
            </button>
            <button type="button" onClick={huy} disabled={busy}
              className="rounded-lg border px-4 py-2 font-medium text-slate-600 disabled:opacity-50 hover:bg-slate-50">
              Huỷ
            </button>
            <span className="ml-auto text-xs text-slate-500 tabular-nums">{val.length}/{GHI_CHU_TOI_DA}</span>
          </div>
          {err && <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
        </>
      )}
    </section>
  )
}
