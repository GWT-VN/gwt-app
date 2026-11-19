'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { themNguoi, xoaNguoi, type NguoiQuanTri } from '@/app/ticket/nguoi-actions'
import { chuanTenNguoi, DAI_TOI_DA_TEN } from '@/lib/loi/nguoiTicket'

const nut = 'rounded-lg border px-2.5 py-1 text-sm disabled:opacity-50'

/**
 * Tab CS theo dõi của /danh-sach-nguoi (Hiệp 19/11/2026): thêm + xoá (hỏi lại trong khung, nêu số ticket đang gán).
 * Không đổi tên. Tab Kỹ thuật dùng `RosterKyThuat` (hồ sơ thợ đầy đủ).
 */
export function DanhSachCs({ ds }: { ds: NguoiQuanTri[] }) {
  const loai = 'cs' as const
  const router = useRouter()
  const [ten, setTen] = useState('')
  const [dangXoa, setDangXoa] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const kiem = ten ? chuanTenNguoi(ten, ds) : null

  async function them() {
    setBusy(true); setErr(null)
    const r = await themNguoi(loai, ten)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    setTen(''); router.refresh()
  }
  async function xoa(id: string) {
    setBusy(true); setErr(null)
    const r = await xoaNguoi(loai, id)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    setDangXoa(null); router.refresh()
  }

  return (
    <section className="bg-white rounded-xl border p-5 space-y-3">
      <ul className="divide-y rounded-lg border text-sm">
        {ds.length === 0 && <li className="px-3 py-2 text-slate-400">Chưa có ai.</li>}
        {ds.map((x) => (
          <li key={x.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
            {dangXoa === x.id ? (
              <>
                <span className="flex-1 text-red-700">
                  Xoá <strong>{x.ten}</strong>?{x.so_ticket > 0 ? ` ${x.so_ticket} ticket đang mở sẽ về "chưa gán".` : ''}
                </span>
                <button type="button" disabled={busy} onClick={() => xoa(x.id)} className={`${nut} bg-red-600 border-red-600 text-white`}>Xoá</button>
                <button type="button" disabled={busy} onClick={() => setDangXoa(null)} className={nut}>Huỷ</button>
              </>
            ) : (
              <>
                <span className={`flex-1 ${x.hoat_dong ? 'text-slate-900' : 'text-slate-400'}`}>
                  {x.ten}{x.la_ctv ? ' (CTV)' : ''}{x.hoat_dong ? '' : ' (nghỉ)'}
                </span>
                <span className="text-xs text-slate-500">{x.so_ticket} ticket đang mở</span>
                <button type="button" disabled={busy} onClick={() => { setErr(null); setDangXoa(x.id) }} className={`${nut} text-red-600`}>Xoá</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <input value={ten} onChange={(e) => setTen(e.target.value)} maxLength={DAI_TOI_DA_TEN + 10} disabled={busy}
          onKeyDown={(e) => { if (e.key === 'Enter' && kiem?.ok && !kiem.trung) them() }}
          placeholder="Tên CS mới, vd: Thanh Hiền"
          className="flex-1 min-w-48 rounded-lg border px-3 py-1.5 text-sm text-slate-900" />
        <button type="button" disabled={busy || !kiem?.ok || !!(kiem.ok && kiem.trung)} onClick={them}
          className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm disabled:opacity-50">+ Thêm</button>
      </div>
      {kiem && !kiem.ok && <p className="text-xs text-red-600">{kiem.error}</p>}
      {kiem?.ok && kiem.trung && <p className="text-xs text-amber-700">Đã có <strong>{kiem.trung.ten}</strong> trong danh sách.</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
    </section>
  )
}
