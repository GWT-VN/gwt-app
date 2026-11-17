'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateTicket } from '@/app/actions'
import { datCsTheoDoi } from '@/app/ticket/dau-ticket-actions'
import type { Staff } from '@/lib/nen-tang/nhan-su-luat'
import { CS_THEO_DOI, ngayVNHienThi, soNgayMo } from '@/lib/loi/ngayTicket'

const TRANG_THAI = [
  { key: 'Open', label: 'Đang mở' },
  { key: 'Done', label: 'Đã xong' },
  { key: 'Cancel', label: 'Đã huỷ' },
]
const nhanTT = (k: string) => TRANG_THAI.find((s) => s.key === k)?.label ?? k

type KQ = { ok: true } | { ok: false; error: string }

/**
 * Thanh đầu trang ticket: mã · loại · model · tỉnh; 4 ô sửa nhanh (chọn là lưu ngay)
 * Trạng thái · Khẩn · CS theo dõi (4 tên) · Kỹ thuật; tóm tắt "Mở N ngày · K lần lỗi · lần cuối".
 */
export function DauTicket({
  code, loai, model, tinh, state, khan, csTheoDoi, ktId, staff,
  ngayDau, soLan, ngayCuoi, homNay, choSua, choCs, coCotMoi = true,
}: {
  code: string; loai: string | null; model: string | null; tinh: string | null
  state: string; khan: boolean; csTheoDoi: string | null; ktId: string | null; staff: Staff[]
  // 'YYYY-MM-DD': ngày khách báo lần 1 / lần gần nhất; hôm nay theo giờ VN.
  ngayDau: string | null; soLan: number; ngayCuoi: string | null; homNay: string
  choSua: boolean
  // Sửa được CS theo dõi (có quyền + DB đã có cột).
  choCs: boolean
  // false = DB chưa có cột cs_theo_doi → ẩn ô CS theo dõi.
  coCotMoi?: boolean
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  async function luu(fn: () => Promise<KQ>) {
    setBusy(true); setErr(null)
    const r = await fn()
    setBusy(false)
    if (!r.ok) setErr(r.error); else router.refresh()
  }

  const dangMo = state === 'Open'
  const tenKt = ktId ? staff.find((s) => s.id === ktId)?.ten ?? '—' : null
  const o = 'rounded-lg border px-2 py-1 text-sm bg-white text-slate-900 disabled:opacity-50'

  return (
    <section className="bg-white rounded-xl border p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
        <h1 className="text-xl font-semibold text-slate-900 font-mono">{code}</h1>
        {[loai, model, tinh].filter(Boolean).map((x, i) => (
          <span key={i} className="text-slate-600">{i === 0 ? '' : '· '}{x}</span>
        ))}
      </div>

      <div className="flex items-center gap-x-5 gap-y-2 flex-wrap text-sm">
        <label className="flex items-center gap-1.5 text-slate-500">
          Trạng thái
          {choSua ? (
            <select className={o} value={state} disabled={busy}
              onChange={(e) => luu(() => updateTicket(code, { state: e.target.value }))}>
              {TRANG_THAI.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          ) : <span className="text-slate-900">{nhanTT(state)}</span>}
        </label>

        {choSua ? (
          <button type="button" disabled={busy} onClick={() => luu(() => updateTicket(code, { khan: !khan }))}
            className={`rounded-lg border px-2.5 py-1 text-sm disabled:opacity-50 ${khan ? 'bg-red-600 border-red-600 text-white' : 'bg-white text-slate-600'}`}>
            {khan ? '🔴 Khẩn' : 'Khẩn'}
          </button>
        ) : khan && <span className="font-medium text-red-600">🔴 Khẩn</span>}

        {coCotMoi && (
          <label className="flex items-center gap-1.5 text-slate-500">
            CS theo dõi
            {choCs ? (
              <select className={o} value={csTheoDoi ?? ''} disabled={busy}
                onChange={(e) => luu(() => datCsTheoDoi(code, e.target.value || null))}>
                <option value="">— Chưa gán —</option>
                {CS_THEO_DOI.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            ) : <span className={csTheoDoi ? 'text-slate-900' : 'text-amber-600'}>{csTheoDoi ?? 'chưa gán'}</span>}
          </label>
        )}

        <label className="flex items-center gap-1.5 text-slate-500">
          Kỹ thuật
          {choSua ? (
            <select className={o} value={ktId ?? ''} disabled={busy}
              onChange={(e) => luu(() => updateTicket(code, { ky_thuat: e.target.value || null }))}>
              <option value="">— Chưa gán —</option>
              {staff.map((s) => <option key={s.id} value={s.id}>{s.ten}</option>)}
            </select>
          ) : <span className={tenKt ? 'text-slate-900' : 'text-slate-400'}>{tenKt ?? 'chưa gán'}</span>}
        </label>
      </div>

      <p className="text-sm text-slate-500">
        {dangMo && ngayDau
          ? <span className="font-medium text-slate-700">Mở {soNgayMo(ngayDau, homNay)} ngày</span>
          : <span className="font-medium text-slate-700">{nhanTT(state)}</span>}
        {' · '}{soLan} lần lỗi
        {ngayCuoi && <> · lần cuối {ngayVNHienThi(ngayCuoi)}</>}
      </p>

      {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
    </section>
  )
}
