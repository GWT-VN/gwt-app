'use client'

import { useActionState } from 'react'
import { taoKy } from './actions'

export function FormTaoKy() {
  const [kq, act, dang] = useActionState(
    async (_p: unknown, f: FormData) => taoKy(String(f.get('ky') ?? '')),
    null as null | Awaited<ReturnType<typeof taoKy>>,
  )
  // Mặc định = tháng TRƯỚC: file NEXIA của tháng N về đầu tháng N+1 (spec §4). Tính theo giờ
  // máy (getFullYear/getMonth), không toISOString — bẫy UTC ghi ở docs/CHUAN-FILTER.md.
  const nay = new Date()
  const thangTruoc = new Date(nay.getFullYear(), nay.getMonth() - 1, 1)
  const macDinh = `${thangTruoc.getFullYear()}-${String(thangTruoc.getMonth() + 1).padStart(2, '0')}`
  return (
    <form action={act} className="flex items-end gap-2">
      <label className="text-sm">Kỳ
        <input type="month" name="ky" required defaultValue={macDinh} className="ml-2 rounded border px-2 py-1" />
      </label>
      <button disabled={dang} className="rounded bg-[#3f8a6a] px-3 py-1 text-white disabled:opacity-50">Tạo kỳ</button>
      {kq && !kq.ok ? <span className="text-sm text-red-600">{kq.error}</span> : null}
    </form>
  )
}
