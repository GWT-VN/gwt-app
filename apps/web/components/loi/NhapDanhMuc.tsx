'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { nhapDanhMuc, xemTruocNhapDanhMuc } from '@/app/ticket/loi-actions'
import { chayNhap, chayXemTruoc, duocNhap, nhanNutNhap, NHAN_TRANG_THAI, type TomTatXemTruoc } from '@/lib/loi/giaoDienDanhMuc'

export function NhapDanhMuc() {
  const router = useRouter()
  const [mo, setMo] = useState(false)
  const [tomTat, setTomTat] = useState<TomTatXemTruoc | null>(null)
  const [loi, setLoi] = useState('')
  const [xong, setXong] = useState('')
  const [ban, chay] = useTransition()
  const [coFile, setCoFile] = useState(false)
  const fdRef = useRef<FormData | null>(null)

  const xemTruoc = (fd: FormData) => {
    setTomTat(null); setLoi(''); setXong('')
    chay(async () => {
      const r = await chayXemTruoc(fd, xemTruocNhapDanhMuc)
      if ('loi' in r) setLoi(r.loi); else setTomTat(r.tomTat)
    })
  }
  const chonFile = (input: HTMLInputElement) => {
    const file = input.files?.[0]
    input.value = '' // chọn lại cùng file vẫn kích hoạt onChange
    fdRef.current = null; setCoFile(false); setTomTat(null); setLoi(''); setXong('')
    if (!file) return
    const fd = new FormData(); fd.set('file', file); fdRef.current = fd; setCoFile(true)
    xemTruoc(fd)
  }
  const nhap = () => fdRef.current && chay(async () => {
    const r = await chayNhap(fdRef.current!, tomTat, nhapDanhMuc)
    if ('loi' in r) return setLoi(r.loi)
    setXong(r.thongBao); setTomTat(null); setLoi(''); router.refresh()
  })

  if (!mo) return <button type="button" onClick={() => setMo(true)} className="rounded-lg border bg-white px-3 py-1.5 text-sm">Nhập từ Sheet</button>
  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-slate-900">Nhập danh mục từ Sheet đã duyệt</h2>
        <button type="button" onClick={() => setMo(false)} className="text-sm text-slate-500">Đóng</button>
      </div>
      <input type="file" accept=".xlsx,.csv" onChange={(e) => chonFile(e.target)} />
      {coFile && <button type="button" disabled={ban} onClick={() => xemTruoc(fdRef.current!)} className="ml-2 rounded-lg border px-2 py-1 text-sm">Xem trước lại</button>}
      {ban && <p className="text-sm text-slate-500">Đang xử lý…</p>}
      {loi && <p className="text-sm text-red-600 whitespace-pre-line">{loi}</p>}
      {xong && <p className="text-sm text-emerald-700">{xong}</p>}
      {tomTat && (
        <div className="space-y-2">
          <p className="text-sm">
            {tomTat.daDuyet} đã duyệt · {tomTat.choDuyet} chờ duyệt · {tomTat.soGan} ticket được gán lỗi ·{' '}
            <strong>{tomTat.soDongSeDoi} dòng máy sẽ đổi</strong>
          </p>
          {tomTat.coLoi && (
            <ul className="text-sm text-red-600 list-disc pl-5">
              {tomTat.loi.map((l) => <li key={l}>{l}</li>)}
              {tomTat.soLoiKhac > 0 && <li>+{tomTat.soLoiKhac} lỗi khác</li>}
            </ul>
          )}
          <table className="w-full text-xs">
            <thead className="text-left text-slate-500"><tr><th>Mã</th><th>Tên chuẩn</th><th>Nhóm</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {tomTat.mau.map((m) => (
                <tr key={m.code} className="border-t"><td className="font-mono">{m.code}</td><td>{m.ten}</td><td>{m.nhom ?? '—'}</td><td>{NHAN_TRANG_THAI[m.trang_thai]}</td></tr>
              ))}
            </tbody>
          </table>
          {tomTat.soMa > tomTat.mau.length && <p className="text-xs text-slate-500">Chỉ hiện {tomTat.mau.length} mã đầu.</p>}
          <button type="button" disabled={ban || !duocNhap(tomTat)} onClick={nhap}
            className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm disabled:opacity-40">
            {nhanNutNhap(tomTat)}
          </button>
        </div>
      )}
    </div>
  )
}
