'use client'

import { useActionState, useRef, useState } from 'react'
import { uploadNexia } from '../../actions'

/**
 * Một nút duy nhất: bấm → hộp chọn file → chọn xong TỰ gửi (không có bước "Upload" thứ hai).
 * Input file ẩn đi vì hai nút cho một hành động làm người dùng bấm nhầm nút sau khi chưa chọn
 * file (CEO bắt 07/09). `required` bỏ vì form chỉ gửi khi đã có file.
 */
export function FormUpload({ ky }: { ky: string }) {
  const [kq, act, dang] = useActionState(uploadNexia, null)
  const formRef = useRef<HTMLFormElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [tenFile, setTenFile] = useState<string | null>(null)
  return (
    <form ref={formRef} action={act} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <input type="hidden" name="ky" value={ky} />
      <input ref={fileRef} type="file" name="file" accept=".xlsx" className="hidden" tabIndex={-1}
        onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setTenFile(f.name); formRef.current?.requestSubmit() }} />
      <button type="button" disabled={dang} onClick={() => fileRef.current?.click()}
        className="rounded bg-[#3f8a6a] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#35745a] disabled:opacity-50">
        {dang ? 'Đang xử lý…' : 'Chọn file NEXIA (.xlsx) & phân loại'}
      </button>
      {dang && tenFile ? <span className="text-sm text-slate-500">{tenFile}</span> : null}
      {!dang && kq?.ok ? <span className="text-sm text-emerald-700">{tenFile ? `${tenFile}: ` : ''}Thêm {kq.inserted} · cập nhật {kq.updated} · giữ {kq.kept} · cảnh báo {kq.canhBao}</span> : null}
      {!dang && kq && !kq.ok ? <span className="text-sm text-red-600">{kq.error}</span> : null}
    </form>
  )
}
