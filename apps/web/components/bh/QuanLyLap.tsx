'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { huyLapMay, suaNgayBaoHanhBo, type ThongTinLap } from '@/app/may/huy-lap-actions'

const vn = (d: string | null) => (d ? d.slice(0, 10).split('-').reverse().join('/') : '—')
const nut = 'rounded-lg border bg-white px-3 py-1.5 text-sm disabled:opacity-50'

/**
 * Trang máy (18/11): bộ combo → danh sách thiết bị + "Sửa ngày bảo hành cả bộ"; máy lẻ / bộ → "Huỷ lắp (nhập nhầm)"
 * bất cứ lúc nào, có ghi lý do. Hỏi lại ngay trong khung, không dùng confirm() của trình duyệt.
 */
export function QuanLyLap({ serial, tt, choSua }: { serial: string; tt: ThongTinLap; choSua: boolean }) {
  const router = useRouter()
  const [ngay, setNgay] = useState(tt.install_date ?? '')
  const [moNgay, setMoNgay] = useState(false)
  const [moHuy, setMoHuy] = useState(false)
  const [lyDo, setLyDo] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const ten = tt.la_bo ? 'bộ' : 'máy'

  async function luuNgay() {
    setBusy(true); setErr(null); setOk(null)
    const r = await suaNgayBaoHanhBo(serial, ngay)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    setOk(`Đã đổi ngày bắt đầu bảo hành cả bộ sang ${vn(ngay)} — tính lại hạn ${r.so_thiet_bi} thiết bị.`)
    setMoNgay(false); router.refresh()
  }

  async function huy() {
    setBusy(true); setErr(null); setOk(null)
    const r = await huyLapMay(serial, lyDo)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    router.replace(r.customer_id ? `/khach/${r.customer_id}` : '/')
    router.refresh()
  }

  if (!tt.la_bo && !tt.bo_cha && !(choSua && tt.huy_duoc)) return null

  return (
    <section className="bg-white rounded-xl border p-5 space-y-3">
      {tt.bo_cha && (
        <p className="text-sm text-slate-700">
          Thiết bị thuộc bộ <Link className="font-mono underline" href={`/may/${encodeURIComponent(tt.bo_cha)}`}>{tt.bo_cha}</Link>
          {' '}— sửa ngày cả bộ / huỷ bộ ở trang bộ.
        </p>
      )}

      {tt.la_bo && (
        <div className="space-y-2">
          <h2 className="font-medium text-slate-900">Thiết bị trong bộ ({tt.con.length})</h2>
          <ul className="text-sm divide-y rounded-lg border">
            {tt.con.map((c) => (
              <li key={c.serial} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2">
                <Link className="font-mono underline" href={`/may/${encodeURIComponent(c.serial)}`}>{c.serial}</Link>
                <span className="font-mono text-xs text-slate-500">{c.internal_code ?? '—'}</span>
                {c.cho_serial && <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">chờ bổ sung serial</span>}
                <span className="ml-auto text-xs text-slate-500">BH đến {c.full_end ? vn(c.full_end) : <span className="text-amber-700">chưa có hạn</span>}</span>
              </li>
            ))}
          </ul>
          {choSua && (moNgay ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm">
              <span>Ngày bắt đầu bảo hành cả bộ</span>
              <input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} disabled={busy}
                className="rounded-lg border px-2 py-1 text-slate-900 bg-white" />
              <button type="button" onClick={luuNgay} disabled={busy || !ngay}
                className="rounded-lg bg-slate-900 text-white px-3 py-1.5 disabled:opacity-50">Lưu cho cả {tt.con.length} thiết bị</button>
              <button type="button" onClick={() => setMoNgay(false)} disabled={busy} className={nut}>Huỷ</button>
            </div>
          ) : (
            <button type="button" onClick={() => { setMoNgay(true); setErr(null); setOk(null) }} className={nut}>
              Sửa ngày bảo hành cả bộ (đang {vn(tt.install_date)})
            </button>
          ))}
        </div>
      )}

      {choSua && tt.huy_duoc && (moHuy ? (
        <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
          <p className="text-red-800">
            Huỷ {ten} <span className="font-mono">{serial}</span>
            {tt.la_bo ? ` và ${tt.con.length} thiết bị` : ''} — xoá luôn bảo hành đã kích hoạt; serial thật trả về kho.
            Dùng khi <strong>nhập nhầm</strong>. Không hoàn tác được.
          </p>
          <input value={lyDo} onChange={(e) => setLyDo(e.target.value)} disabled={busy} maxLength={320}
            placeholder='Lý do, vd: "nhập nhầm khách", "chọn sai bộ"'
            className="w-full rounded-lg border px-3 py-2 text-slate-900 bg-white" />
          <div className="flex gap-2">
            <button type="button" onClick={huy} disabled={busy || lyDo.trim().length < 5}
              className="rounded-lg bg-red-600 text-white px-3 py-1.5 font-medium disabled:opacity-50">
              {busy ? 'Đang huỷ…' : `Xác nhận huỷ ${ten}`}
            </button>
            <button type="button" onClick={() => setMoHuy(false)} disabled={busy} className={nut}>Thôi</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => { setMoHuy(true); setErr(null); setOk(null) }}
          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm text-red-700">
          Huỷ {ten} (nhập nhầm)
        </button>
      ))}

      {ok && <p className="text-sm text-emerald-700">{ok}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
    </section>
  )
}
