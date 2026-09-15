'use client'

import { useActionState, useRef, useState } from 'react'
import { uploadNexia } from '../../actions'

/**
 * Một nút duy nhất: bấm → hộp chọn file → chọn xong TỰ gửi (không có bước "Upload" thứ hai).
 * Input file ẩn đi vì hai nút cho một hành động làm người dùng bấm nhầm nút sau khi chưa chọn
 * file (CEO bắt 07/09). `required` bỏ vì form chỉ gửi khi đã có file.
 * Trước khi mở hộp chọn phải xoá value cũ: chọn lại ĐÚNG file vừa lỗi thì `onChange` không bắn
 * (review 08/09 issue 6) → nút im, không phản hồi.
 *
 * Hai chỗ dùng: màn kỳ (`ky` cố định, ở lại hiện kết quả) và màn danh sách (`macDinh` = tháng
 * trước, người dùng chọn tháng; upload tự tạo kỳ nếu chưa có rồi server chuyển vào màn kỳ —
 * CEO 15/09: "tạo kỳ" rồi mới upload là hai bước cho một việc).
 */
export function FormUpload(props: { ky: string } | { macDinh: string }) {
  const [kq, act, dang] = useActionState(uploadNexia, null)
  const formRef = useRef<HTMLFormElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [tenFile, setTenFile] = useState<string | null>(null)
  const coKy = 'ky' in props
  return (
    <form ref={formRef} action={act} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      {coKy ? <input type="hidden" name="ky" value={props.ky} /> : (
        <>
          <input type="hidden" name="vao_ky" value="1" />
          <label className="text-sm">Kỳ
            {/* pattern giữ cho trình duyệt chưa có type=month (Firefox rơi về ô text) */}
            <input type="month" name="ky" required defaultValue={props.macDinh} pattern="\d{4}-(0[1-9]|1[0-2])" placeholder="2026-08" className="ml-2 rounded border px-2 py-1" />
          </label>
        </>
      )}
      <input ref={fileRef} type="file" name="file" accept=".xlsx" className="hidden" tabIndex={-1}
        onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setTenFile(f.name); formRef.current?.requestSubmit() }} />
      <button type="button" disabled={dang}
        onClick={() => { if (!formRef.current?.reportValidity()) return; if (fileRef.current) fileRef.current.value = ''; fileRef.current?.click() }}
        className="rounded bg-[#3f8a6a] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#35745a] disabled:opacity-50">
        {dang ? 'Đang xử lý…' : 'Chọn file NEXIA (.xlsx) & phân loại'}
      </button>
      {dang && tenFile ? <span className="text-sm text-slate-500">{tenFile}</span> : null}
      {!dang && kq?.ok ? (
        <span className="text-sm text-emerald-700">
          {tenFile ? `${tenFile}: ` : ''}Thêm {kq.inserted} · cập nhật {kq.updated} · giữ {kq.kept} · cảnh báo {kq.canhBao}
          {kq.thieu > 0 ? ` · ${kq.thieu} dòng của lần trước không còn trong file này` : ''}
        </span>
      ) : null}
      {!dang && kq && !kq.ok ? <span className="text-sm text-red-600">{kq.error}</span> : null}
    </form>
  )
}
