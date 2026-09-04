'use client'

import { useActionState } from 'react'
import { uploadNexia } from '../../actions'

export function FormUpload({ ky }: { ky: string }) {
  const [kq, act, dang] = useActionState(uploadNexia, null)
  return (
    <form action={act} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <input type="hidden" name="ky" value={ky} />
      <label className="text-sm">File NEXIA (.xlsx) <input type="file" name="file" accept=".xlsx" required className="ml-2 text-sm" /></label>
      <button disabled={dang} className="rounded bg-[#3f8a6a] px-3 py-1 text-white disabled:opacity-50">{dang ? 'Đang xử lý…' : 'Upload & phân loại'}</button>
      {kq?.ok ? <span className="text-sm text-emerald-700">Thêm {kq.inserted} · cập nhật {kq.updated} · giữ {kq.kept} · cảnh báo {kq.canhBao}</span> : null}
      {kq && !kq.ok ? <span className="text-sm text-red-600">{kq.error}</span> : null}
    </form>
  )
}
