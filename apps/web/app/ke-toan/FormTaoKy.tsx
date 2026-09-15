'use client'

import { useActionState } from 'react'
import { taoKy } from './actions'

/** `macDinh` = tháng trước, tính ở server theo giờ VN (page.tsx) — server và trình duyệt cùng một giá trị lúc hydrate. */
export function FormTaoKy({ macDinh }: { macDinh: string }) {
  const [kq, act, dang] = useActionState(
    async (_p: unknown, f: FormData) => taoKy(String(f.get('ky') ?? '')),
    null as null | Awaited<ReturnType<typeof taoKy>>,
  )
  return (
    <form action={act} className="flex items-end gap-2">
      <label className="text-sm">Kỳ
        {/* pattern giữ cho trình duyệt chưa có type=month (Firefox rơi về ô text) */}
        <input type="month" name="ky" required defaultValue={macDinh} pattern="\d{4}-(0[1-9]|1[0-2])" placeholder="2026-08" className="ml-2 rounded border px-2 py-1" />
      </label>
      <button disabled={dang} className="rounded bg-[#3f8a6a] px-3 py-1 text-white disabled:opacity-50">{dang ? 'Đang mở…' : 'Tạo / mở kỳ'}</button>
      {kq && !kq.ok ? <span className="text-sm text-red-600">{kq.error}</span> : null}
    </form>
  )
}
