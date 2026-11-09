'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { phanLoaiLai } from '@/app/ticket/loi-actions'
import { apDungPhanLoai, chayThuPhanLoai } from '@/lib/loi/giaoDienDanhMuc'

export function PhanLoaiLai() {
  const router = useRouter()
  const [baoCao, setBaoCao] = useState<{ nhan: string; gia: string }[] | null>(null)
  const [loi, setLoi] = useState('')
  const [xong, setXong] = useState('')
  const [ban, chay] = useTransition()

  const thu = () => chay(async () => {
    setLoi(''); setXong('')
    const r = await chayThuPhanLoai(phanLoaiLai)
    if ('loi' in r) { setBaoCao(null); setLoi(r.loi ?? '') } else setBaoCao(r.baoCao)
  })
  const apDung = () => chay(async () => {
    const r = await apDungPhanLoai(baoCao !== null, (m) => window.confirm(m), phanLoaiLai)
    if ('loi' in r) return setLoi(r.loi ?? '')
    if ('huy' in r) return
    setXong(r.thongBao ?? ''); setBaoCao(null); setLoi(''); router.refresh()
  })

  return (
    <div className="space-y-2">
      <button type="button" disabled={ban} onClick={thu} className="rounded-lg border bg-white px-3 py-1.5 text-sm">Chạy thử phân loại lại</button>
      {loi && <p className="text-sm text-red-600">{loi}</p>}
      {xong && <p className="text-sm text-emerald-700">{xong}</p>}
      {baoCao && (
        <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
          <p className="text-sm font-medium">Kết quả chạy thử (chưa ghi gì)</p>
          <ul className="text-sm">{baoCao.map((d) => <li key={d.nhan}>{d.nhan}: <strong>{d.gia}</strong></li>)}</ul>
          <button type="button" disabled={ban} onClick={apDung} className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm">Áp dụng</button>
        </div>
      )}
    </div>
  )
}
