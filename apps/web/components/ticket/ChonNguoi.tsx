'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { doiTenNguoi, themNguoi, xoaNguoi, type LoaiNguoi } from '@/app/ticket/nguoi-actions'
import { chuanTenNguoi, DAI_TOI_DA_TEN, dsChoChon, type NguoiDs } from '@/lib/loi/nguoiTicket'

const THEM = '__them__'
const SUA = '__sua_ds__'
type KQ = { ok: true } | { ok: false; error: string }

const nhan = (x: NguoiDs) => `${x.ten}${x.la_ctv ? ' (CTV)' : ''}`

/**
 * Ô chọn người trên ticket (CS theo dõi / Kỹ thuật) + "+ Thêm tên…" + "Sửa danh sách…" (đổi tên · xoá).
 * Chị Trang 18/11: chỉ Thêm + Xoá, không "ẩn". Xoá hỏi lại ngay trong khung (không dùng confirm() của trình duyệt).
 * `onChon` gán vào ticket.
 */
export function ChonNguoi({ loai, ds, dangGan, onChon, disabled, className = '' }: {
  loai: LoaiNguoi; ds: NguoiDs[]; dangGan: string | null
  onChon: (id: string | null) => Promise<KQ>; disabled?: boolean; className?: string
}) {
  const router = useRouter()
  const [che, setChe] = useState<'chon' | 'them' | 'sua'>('chon')
  const [chu, setChu] = useState('')
  const [laCtv, setLaCtv] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [dangDoi, setDangDoi] = useState<{ id: string; ten: string } | null>(null)
  const [dangXoa, setDangXoa] = useState<string | null>(null)

  const chon = dsChoChon(ds, dangGan)
  const kiem = che === 'them' && chu ? chuanTenNguoi(chu, ds) : null
  const tenDs = loai === 'cs' ? 'CS theo dõi' : 'kỹ thuật'

  async function chay(fn: () => Promise<KQ>, xong?: () => void) {
    setBusy(true); setErr(null)
    const r = await fn()
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    xong?.(); router.refresh()
  }

  async function luuMoi() {
    setBusy(true); setErr(null)
    const r = await themNguoi(loai, chu, laCtv)
    if (!r.ok) { setBusy(false); setErr(r.error); return }
    const g = await onChon(r.id)
    setBusy(false)
    if (!g.ok) { setErr(g.error); return }
    setChe('chon'); setChu(''); setLaCtv(false); router.refresh()
  }

  const o = 'rounded-lg border px-2 py-1 text-sm bg-white text-slate-900 disabled:opacity-50'
  const nut = 'rounded-lg border px-2 py-0.5 text-xs disabled:opacity-50'

  return (
    <span className={`inline-flex flex-col gap-1 ${className}`}>
      <select className={o} disabled={disabled || busy} aria-label={`Chọn ${tenDs}`}
        value={che === 'them' ? THEM : che === 'sua' ? SUA : (dangGan ?? '')}
        onChange={(e) => {
          const v = e.target.value
          setErr(null)
          if (v === THEM) { setChe('them'); setChu(''); return }
          if (v === SUA) { setChe('sua'); setDangDoi(null); setDangXoa(null); return }
          setChe('chon')
          chay(() => onChon(v || null))
        }}>
        <option value="">— Chưa gán —</option>
        {chon.map((x) => <option key={x.id} value={x.id}>{nhan(x)}{x.an ? ' (nghỉ)' : ''}</option>)}
        <option value={THEM}>+ Thêm tên…</option>
        <option value={SUA}>✎ Sửa danh sách…</option>
      </select>

      {che === 'them' && (
        <span className="flex flex-col gap-1 rounded-lg border bg-slate-50 p-2 min-w-56">
          <input autoFocus value={chu} maxLength={DAI_TOI_DA_TEN + 10} disabled={busy}
            onChange={(e) => setChu(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && kiem?.ok) luuMoi(); if (e.key === 'Escape') setChe('chon') }}
            placeholder={loai === 'cs' ? 'Tên CS, vd: Thanh Hiền' : 'Tên thợ, vd: Trần Văn Sơn'}
            className="rounded-lg border px-2 py-1 text-sm text-slate-900 bg-white" />
          {loai === 'kt' && (
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              <input type="checkbox" checked={laCtv} onChange={(e) => setLaCtv(e.target.checked)} /> CTV / freelancer
            </label>
          )}
          {kiem && !kiem.ok && <span className="text-xs text-red-600">{kiem.error}</span>}
          {kiem?.ok && kiem.trung && (
            <span className="text-xs text-slate-500">
              Đã có <strong>{kiem.trung.ten}</strong> — dùng người này.
            </span>
          )}
          <span className="flex gap-1.5">
            <button type="button" className={`${nut} bg-slate-900 text-white`} disabled={busy || !kiem?.ok} onClick={luuMoi}>Thêm &amp; gán</button>
            <button type="button" className={nut} disabled={busy} onClick={() => setChe('chon')}>Huỷ</button>
          </span>
        </span>
      )}

      {che === 'sua' && (
        <span className="flex flex-col gap-1 rounded-lg border bg-slate-50 p-2 min-w-64">
          <span className="text-xs font-medium text-slate-600">Danh sách {tenDs}</span>
          {ds.length === 0 && <span className="text-xs text-slate-500">Chưa có ai.</span>}
          {ds.map((x) => (
            <span key={x.id} className="flex items-center gap-1.5 text-sm">
              {dangDoi?.id === x.id ? (
                <>
                  <input autoFocus value={dangDoi.ten} maxLength={DAI_TOI_DA_TEN + 10} disabled={busy}
                    onChange={(e) => setDangDoi({ id: x.id, ten: e.target.value })}
                    className="flex-1 rounded border px-1.5 py-0.5 text-sm text-slate-900 bg-white" />
                  <button type="button" className={nut} disabled={busy}
                    onClick={() => chay(() => doiTenNguoi(loai, x.id, dangDoi.ten), () => setDangDoi(null))}>Lưu</button>
                  <button type="button" className={nut} disabled={busy} onClick={() => setDangDoi(null)}>Huỷ</button>
                </>
              ) : dangXoa === x.id ? (
                <>
                  <span className="flex-1 text-xs text-red-700">Xoá <strong>{x.ten}</strong>? Ticket đang gán sẽ về &quot;chưa gán&quot;.</span>
                  <button type="button" className={`${nut} bg-red-600 border-red-600 text-white`} disabled={busy}
                    onClick={() => chay(() => xoaNguoi(loai, x.id), () => setDangXoa(null))}>Xoá</button>
                  <button type="button" className={nut} disabled={busy} onClick={() => setDangXoa(null)}>Huỷ</button>
                </>
              ) : (
                <>
                  <span className={`flex-1 ${x.hoat_dong ? 'text-slate-900' : 'text-slate-400'}`}>{nhan(x)}{x.hoat_dong ? '' : ' (nghỉ)'}</span>
                  <button type="button" className={nut} disabled={busy} onClick={() => { setDangXoa(null); setDangDoi({ id: x.id, ten: x.ten }) }}>Đổi tên</button>
                  <button type="button" className={`${nut} text-red-600`} disabled={busy} onClick={() => { setDangDoi(null); setDangXoa(x.id) }}>Xoá</button>
                </>
              )}
            </span>
          ))}
          <button type="button" className={`${nut} self-start`} disabled={busy} onClick={() => setChe('chon')}>Xong</button>
        </span>
      )}

      {err && <span className="text-xs text-red-600">{err}</span>}
    </span>
  )
}
