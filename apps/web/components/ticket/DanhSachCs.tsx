'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { themNguoi, xoaNguoi, type NguoiQuanTri } from '@/app/ticket/nguoi-actions'
import { chuanTenNguoi, DAI_TOI_DA_TEN } from '@/lib/loi/nguoiTicket'
import { XacNhanXoa } from './XacNhanXoa'

const nut = 'rounded-lg border px-2.5 py-1 text-sm disabled:opacity-50'

/**
 * Tab CS theo dõi của /danh-sach-nguoi (Hiệp 19/11/2026): thêm + xoá (hỏi lại trong khung, nêu số ticket đang gán).
 * Không đổi tên. Tab Kỹ thuật dùng `RosterKyThuat` (hồ sơ thợ đầy đủ).
 * `ds` gồm cả người đã xoá (hoat_dong false) để gõ lại đúng tên thì KHÔI PHỤC thay vì tạo trùng.
 */
export function DanhSachCs({ ds }: { ds: NguoiQuanTri[] }) {
  const loai = 'cs' as const
  const router = useRouter()
  const [ten, setTen] = useState('')
  const [dangXoa, setDangXoa] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const dangDung = ds.filter((x) => x.hoat_dong)
  const kiem = ten ? chuanTenNguoi(ten, ds) : null
  const trung = kiem?.ok ? kiem.trung : null
  const khoiPhuc = !!trung && !trung.hoat_dong

  async function them() {
    setBusy(true); setErr(null)
    const r = await themNguoi(loai, ten)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    setTen(''); router.refresh()
  }
  async function xoa(id: string, chuyenSang: string | null) {
    setBusy(true); setErr(null)
    const r = await xoaNguoi(loai, id, chuyenSang)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    setDangXoa(null); router.refresh()
  }

  return (
    <section className="bg-white rounded-xl border p-5 space-y-3">
      <ul className="divide-y rounded-lg border text-sm">
        {dangDung.length === 0 && <li className="px-3 py-2 text-slate-400">Chưa có ai.</li>}
        {dangDung.map((x) => (
          <li key={x.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
            {dangXoa === x.id ? (
              <XacNhanXoa ten={x.ten} soTicket={x.so_ticket} nguoiNhan={dangDung.filter((y) => y.id !== x.id)} busy={busy}
                onXoa={(nhan) => xoa(x.id, nhan)} onHuy={() => setDangXoa(null)} />
            ) : (
              <>
                <span className="flex-1 text-slate-900">{x.ten}</span>
                <span className="text-xs text-slate-500">{x.so_ticket} ticket đang mở</span>
                <button type="button" disabled={busy} onClick={() => { setErr(null); setDangXoa(x.id) }} className={`${nut} text-red-600`}>Xoá</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <input value={ten} onChange={(e) => setTen(e.target.value)} maxLength={DAI_TOI_DA_TEN + 10} disabled={busy}
          onKeyDown={(e) => { if (e.key === 'Enter' && kiem?.ok && (!trung || khoiPhuc)) them() }}
          placeholder="Tên CS mới, vd: Thanh Hiền"
          className="flex-1 min-w-48 rounded-lg border px-3 py-1.5 text-sm text-slate-900" />
        <button type="button" disabled={busy || !kiem?.ok || (!!trung && !khoiPhuc)} onClick={them}
          className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm disabled:opacity-50">{khoiPhuc ? 'Khôi phục' : '+ Thêm'}</button>
      </div>
      {kiem && !kiem.ok && <p className="text-xs text-red-600">{kiem.error}</p>}
      {trung && !khoiPhuc && <p className="text-xs text-amber-700">Đã có <strong>{trung.ten}</strong> trong danh sách.</p>}
      {khoiPhuc && <p className="text-xs text-slate-600"><strong>{trung.ten}</strong> đã xoá trước đây. Bấm Khôi phục để đưa lại vào danh sách.</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
    </section>
  )
}
