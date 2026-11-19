'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { nhapPhuongAnDuyet, xuatFileChuyenGia, type XemTruocDuyet } from '@/app/ticket/xuat-chuyen-gia-actions'

const nut = 'rounded-lg border bg-white px-3 py-1.5 text-sm disabled:opacity-50'

/**
 * Duyệt phương án xử lý qua chuyên gia (chị Trang 18/11):
 *  "Xuất cho chuyên gia" → .xlsx · "Nhập phương án đã duyệt" → xem trước → Ghi. Chỉ phương án đã duyệt mới hiện trên ticket.
 */
export function NutXuatChuyenGia() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [xem, setXem] = useState<XemTruocDuyet | null>(null)
  const [xong, setXong] = useState<string | null>(null)
  const [dangXuat, setDangXuat] = useState(false)
  const fdRef = useRef<FormData | null>(null)

  async function tai() {
    setBusy(true); setDangXuat(true); setErr(null); setXong(null)
    const r = await xuatFileChuyenGia()
    setBusy(false); setDangXuat(false)
    if (!r.ok) { setErr(r.error); return }
    const bin = atob(r.base64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    const a = document.createElement('a')
    a.href = url; a.download = r.tenFile; a.click()
    URL.revokeObjectURL(url)
  }

  async function chay(ghi: boolean) {
    if (!fdRef.current) return
    setBusy(true); setErr(null); setXong(null)
    const r = await nhapPhuongAnDuyet(fdRef.current, ghi)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    if (r.daGhi) {
      setXong(`Đã ghi: ${r.xemTruoc.duyet.length} phương án được duyệt (hiện trên ticket), ${r.xemTruoc.boDuyet.length} thôi hiện.`)
      setXem(null); fdRef.current = null; router.refresh()
    } else setXem(r.xemTruoc)
  }

  function chonFile(input: HTMLInputElement) {
    const f = input.files?.[0]
    input.value = ''
    setXem(null); setXong(null); setErr(null)
    if (!f) return
    const fd = new FormData(); fd.set('file', f); fdRef.current = fd
    chay(false)
  }

  const coGhi = !!xem && !xem.loi.length && (xem.duyet.length > 0 || xem.boDuyet.length > 0)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap">
        <button type="button" onClick={tai} disabled={busy} className={nut}
          title="File Excel: mỗi loại lỗi + phương án đề xuất + ticket thật (đã che SĐT) để chuyên gia duyệt / sửa.">
          {dangXuat ? 'Đang tạo file…' : 'Xuất cho chuyên gia'}
        </button>
        <label className={`${nut} ${busy ? '' : 'cursor-pointer'}`}>
          Nhập phương án đã duyệt
          <input type="file" accept=".xlsx" className="hidden" disabled={busy} onChange={(e) => chonFile(e.target)} />
        </label>
      </div>

      {xem && (
        <div className="rounded-lg border bg-white p-3 text-sm space-y-2 max-w-3xl">
          <div className="font-medium text-slate-900">Xem trước — chưa ghi gì</div>
          {xem.loi.length > 0 && (
            <ul className="text-red-700 bg-red-50 rounded p-2 text-xs space-y-0.5">
              {xem.loi.map((l, i) => <li key={i}>{l}</li>)}
              <li className="font-medium">Sửa file rồi chọn lại — có lỗi thì không ghi dòng nào.</li>
            </ul>
          )}
          <p className="text-slate-600">
            {xem.duyet.length} phương án <strong>duyệt</strong> (sẽ hiện trên ticket) · {xem.boDuyet.length} <strong>thôi hiện</strong>
            {xem.chuaDanhDau > 0 && <> · <span className="text-amber-700">{xem.chuaDanhDau} dòng có sửa / ý kiến nhưng chưa đánh x — sẽ bỏ qua</span></>}
          </p>
          {xem.duyet.length > 0 && (
            <ul className="space-y-1 max-h-72 overflow-auto">
              {xem.duyet.map((d) => (
                <li key={d.code} className="border-l-2 border-emerald-400 pl-2">
                  <span className="font-mono text-xs">{d.code}</span>{d.doi && <span className="ml-1 text-xs text-amber-700">(chuyên gia sửa)</span>}
                  {d.doi && d.truoc && <div className="text-xs text-slate-400 line-through whitespace-pre-wrap">{d.truoc}</div>}
                  <div className="text-xs text-slate-800 whitespace-pre-wrap">{d.sau}</div>
                </li>
              ))}
            </ul>
          )}
          {xem.boDuyet.length > 0 && <p className="text-xs text-slate-600">Thôi hiện: <span className="font-mono">{xem.boDuyet.join(', ')}</span></p>}
          <div className="flex gap-2">
            <button type="button" disabled={busy || !coGhi} onClick={() => chay(true)}
              className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm disabled:opacity-50">Ghi vào app</button>
            <button type="button" disabled={busy} onClick={() => { setXem(null); fdRef.current = null }} className={nut}>Huỷ</button>
          </div>
        </div>
      )}
      {xong && <p className="text-sm text-emerald-700">{xong}</p>}
      {err && <p className="text-sm text-red-600 whitespace-pre-wrap">{err}</p>}
    </div>
  )
}
