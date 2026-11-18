'use client'

import { useState } from 'react'
import { xuatFileChuyenGia } from '@/app/ticket/xuat-chuyen-gia-actions'

/** Nút "Xuất cho chuyên gia": tải .xlsx (danh mục lỗi + ticket thật, đã che SĐT) để chuyên gia sửa / duyệt rồi nhập lại. */
export function NutXuatChuyenGia() {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function tai() {
    setBusy(true); setErr(null)
    const r = await xuatFileChuyenGia()
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    const bin = atob(r.base64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    const a = document.createElement('a')
    a.href = url; a.download = r.tenFile; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button type="button" onClick={tai} disabled={busy}
        title="File Excel: danh mục lỗi + phương án xử lý + ticket thật (đã che SĐT). Chuyên gia sửa, duyệt rồi nhập lại bằng “Nhập từ Sheet”."
        className="rounded-lg border bg-white px-3 py-1.5 text-sm disabled:opacity-50">
        {busy ? 'Đang tạo file…' : 'Xuất cho chuyên gia'}
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </span>
  )
}
