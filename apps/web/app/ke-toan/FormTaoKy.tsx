'use client'

import { useActionState, useEffect, useRef } from 'react'
import { taoKy } from './actions'

/** Tháng TRƯỚC theo giờ máy (getFullYear/getMonth, không toISOString — bẫy UTC, docs/CHUAN-FILTER.md). */
function thangTruoc(): string {
  const nay = new Date()
  const t = new Date(nay.getFullYear(), nay.getMonth() - 1, 1)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`
}

export function FormTaoKy() {
  const [kq, act, dang] = useActionState(
    async (_p: unknown, f: FormData) => taoKy(String(f.get('ky') ?? '')),
    null as null | Awaited<ReturnType<typeof taoKy>>,
  )
  // Mặc định = tháng TRƯỚC: file NEXIA của tháng N về đầu tháng N+1 (spec §4). Điền SAU khi mount, qua
  // ref (input không kiểm soát) để server (UTC) và trình duyệt (UTC+7) không cho hai giá trị khác nhau
  // lúc hydrate (review 08/09 #11) và không setState trong effect (luật lint react-hooks).
  const oKy = useRef<HTMLInputElement>(null)
  useEffect(() => { if (oKy.current && !oKy.current.value) oKy.current.value = thangTruoc() }, [])
  return (
    <form action={act} className="flex items-end gap-2">
      <label className="text-sm">Kỳ
        {/* pattern giữ cho trình duyệt chưa có type=month (Firefox rơi về ô text) */}
        <input ref={oKy} type="month" name="ky" required pattern="\d{4}-(0[1-9]|1[0-2])" placeholder="2026-08" className="ml-2 rounded border px-2 py-1" />
      </label>
      <button disabled={dang} className="rounded bg-[#3f8a6a] px-3 py-1 text-white disabled:opacity-50">Tạo kỳ</button>
      {kq && !kq.ok ? <span className="text-sm text-red-600">{kq.error}</span> : null}
    </form>
  )
}
