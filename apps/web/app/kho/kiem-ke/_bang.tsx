'use client'

import { useMemo, useState, useTransition } from 'react'
import { OChonGoiY, boDau } from '@/bang'
import type { MucDanhMuc } from '@/lib/kho/doc'
import type { KetQuaKiemKe } from '@/lib/kho/ghi'
import { chuanHoaKiemKe } from '@/lib/kho/sua'
import { kiemKeKho } from '../actions'

type DongKiem = { ma: string; ten: string | null; don_vi: string | null; ton: number | null }

const so = (n: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(n)
const O_DEM = 'w-24 rounded-lg border border-slate-300 px-2 py-1 text-right text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

/** Bảng tồn theo mã + ô "SL đếm". Gửi các ô đã điền → hiện bảng kết quả (tồn trước, đếm, chênh). */
export function BangKiemKe({ kho, dong, danhMuc }: { kho: string; dong: DongKiem[]; danhMuc: MucDanhMuc[] }) {
  const [them, setThem] = useState<DongKiem[]>([])
  const [dem, setDem] = useState<Record<string, string>>({})
  const [q, setQ] = useState('')
  const [loi, setLoi] = useState<string | null>(null)
  const [ketQua, setKetQua] = useState<KetQuaKiemKe[] | null>(null)
  const [dang, batDau] = useTransition()

  const tatCa = useMemo(() => [...them, ...dong], [them, dong])
  const coSan = useMemo(() => new Set(tatCa.map((d) => d.ma)), [tatCa])
  const tuyChonThem = useMemo(() => danhMuc.filter((d) => !coSan.has(d.ma)).map((d) => ({ gt: d.ma, nhan: d.ten ?? d.ma })), [danhMuc, coSan])
  const s = boDau(q.trim())
  const hien = s ? tatCa.filter((d) => boDau(d.ma).includes(s) || boDau(d.ten ?? '').includes(s) || (dem[d.ma] ?? '') !== '') : tatCa
  const soDaDien = Object.values(dem).filter((v) => v.trim() !== '').length

  function themMa(ma: string) {
    if (!ma || coSan.has(ma)) return
    const m = danhMuc.find((d) => d.ma === ma)
    setThem((x) => [{ ma, ten: m?.ten ?? null, don_vi: null, ton: null }, ...x])
  }

  function gui() {
    setLoi(null)
    let ds
    try { ds = chuanHoaKiemKe(Object.entries(dem).map(([internal_code, so_dem]) => ({ internal_code, so_dem }))) } catch (e) { setLoi((e as Error).message); return }
    if (!window.confirm(`Ghi kiểm kê ${ds.length} mã? Mã nào lệch sẽ có dòng "Điều chỉnh" vào sổ NGAY.`)) return
    batDau(async () => {
      const r = await kiemKeKho(ds, kho)
      if (!r.ok) { setLoi(r.error); return }
      setKetQua(r.ketQua)
      setDem({})
      setThem([])
    })
  }

  const tenCua = (ma: string) => tatCa.find((d) => d.ma === ma)?.ten ?? danhMuc.find((d) => d.ma === ma)?.ten ?? ''

  return (
    <div className="space-y-3">
      {ketQua && (
        <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center justify-between">
            <b className="text-sm text-emerald-900">Đã ghi kiểm kê {ketQua.length} mã · {ketQua.filter((x) => x.chenh !== 0).length} mã lệch → có dòng Điều chỉnh</b>
            <button type="button" onClick={() => setKetQua(null)} className="text-xs text-emerald-800 underline">Đóng</button>
          </div>
          <div className="overflow-x-auto rounded-lg bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-3 py-2">Mã</th><th className="px-3 py-2">Tên</th><th className="px-3 py-2 text-right">Tồn trước</th><th className="px-3 py-2 text-right">Đếm</th><th className="px-3 py-2 text-right">Chênh</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ketQua.map((x) => (
                  <tr key={x.internal_code}>
                    <td className="px-3 py-1.5 font-mono text-[13px]">{x.internal_code}</td>
                    <td className="px-3 py-1.5">{tenCua(x.internal_code)}</td>
                    <td className="px-3 py-1.5 text-right">{so(x.ton_truoc)}</td>
                    <td className="px-3 py-1.5 text-right">{so(x.so_dem)}</td>
                    <td className={`px-3 py-1.5 text-right font-semibold ${x.chenh > 0 ? 'text-emerald-700' : x.chenh < 0 ? 'text-red-700' : 'text-slate-400'}`}>
                      {x.chenh === 0 ? 'khớp' : (x.chenh > 0 ? '+' : '') + so(x.chenh)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Lọc mã / tên…"
          className="w-56 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        <div className="w-72">
          <OChonGoiY giaTri={null} onChon={themMa} tuyChon={tuyChonThem} choTrong="+ Thêm mã chưa có trong bảng…"
            className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-400" />
        </div>
        <span className="ml-auto text-xs text-slate-500">Đã điền {soDaDien} mã</span>
        <button type="button" onClick={gui} disabled={dang || !soDaDien}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {dang ? 'Đang ghi…' : 'Ghi kiểm kê'}
        </button>
      </div>
      {loi && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{loi}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-3 py-2.5">Mã</th><th className="px-3 py-2.5">Tên</th><th className="px-3 py-2.5">ĐVT</th>
                <th className="px-3 py-2.5 text-right">Tồn sổ</th><th className="px-3 py-2.5 text-right">SL đếm</th><th className="px-3 py-2.5 text-right">Chênh (dự kiến)</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!hien.length && <tr><td colSpan={6} className="px-3 py-10 text-center text-slate-400">Không có mã nào khớp.</td></tr>}
              {hien.map((d) => {
                const v = dem[d.ma] ?? ''
                const n = v.trim() === '' ? null : Number(v.replace(',', '.'))
                const chenh = n !== null && Number.isFinite(n) ? n - (d.ton ?? 0) : null
                return (
                  <tr key={d.ma} className={v ? 'bg-indigo-50/40' : 'hover:bg-slate-50'}>
                    <td className="px-3 py-1.5 font-mono text-[13px]">{d.ma}</td>
                    <td className="px-3 py-1.5">{d.ten ?? ''}</td>
                    <td className="px-3 py-1.5 text-slate-500">{d.don_vi ?? ''}</td>
                    <td className={`px-3 py-1.5 text-right ${d.ton !== null && d.ton < 0 ? 'text-red-700' : ''}`}>{d.ton === null ? <span className="text-slate-400">0 (mới)</span> : so(d.ton)}</td>
                    <td className="px-3 py-1.5 text-right">
                      <input inputMode="decimal" className={O_DEM} value={v} onChange={(e) => setDem((x) => ({ ...x, [d.ma]: e.target.value }))} aria-label={`SL đếm ${d.ma}`} />
                    </td>
                    <td className={`px-3 py-1.5 text-right text-xs ${chenh ? (chenh > 0 ? 'text-emerald-700' : 'text-red-700') : 'text-slate-400'}`}>
                      {chenh === null ? '' : chenh === 0 ? 'khớp' : (chenh > 0 ? '+' : '') + so(chenh)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
