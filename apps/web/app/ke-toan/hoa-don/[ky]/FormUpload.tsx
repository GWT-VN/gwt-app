'use client'

import { useActionState, useRef, useState } from 'react'
import { uploadNguon } from '../../actions'

/** 5 loại nguồn (Task 10 `nhapNguon`, form field `loai`) — `ngan` dùng cho nhãn nút. */
const LOAI_OPTS = [
  { gt: 'nexia', nhan: 'NEXIA (kế toán gửi)', ngan: 'NEXIA' },
  { gt: 'hdct_vao', nhan: 'HDCT mua vào (cổng thuế)', ngan: 'HDCT mua vào' },
  { gt: 'hdct_ra', nhan: 'HDCT bán ra', ngan: 'HDCT bán ra' },
  { gt: 'hdtq_vao', nhan: 'HDTQ mua vào', ngan: 'HDTQ mua vào' },
  { gt: 'hdtq_ra', nhan: 'HDTQ bán ra', ngan: 'HDTQ bán ra' },
] as const

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
 *
 * Chọn loại nguồn (Task 11): chỉ màn kỳ mới cho chọn — màn danh sách luôn NEXIA (hidden `loai`),
 * vì HDCT/HDTQ gộp VÀO một kỳ đã có, không phải bước tạo kỳ.
 */
export function FormUpload(props: { ky: string } | { macDinh: string }) {
  const [kq, act, dang] = useActionState(uploadNguon, null)
  const formRef = useRef<HTMLFormElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [tenFile, setTenFile] = useState<string | null>(null)
  const [loai, setLoai] = useState<string>('nexia')
  const coKy = 'ky' in props
  const nganNut = LOAI_OPTS.find((o) => o.gt === (coKy ? loai : 'nexia'))?.ngan ?? 'NEXIA'
  return (
    <form ref={formRef} action={act} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      {coKy ? (
        <>
          <input type="hidden" name="ky" value={props.ky} />
          <label className="text-sm">Loại
            <select name="loai" value={loai} disabled={dang} onChange={(e) => setLoai(e.target.value)} className="ml-2 rounded border px-2 py-1 text-sm">
              {LOAI_OPTS.map((o) => <option key={o.gt} value={o.gt}>{o.nhan}</option>)}
            </select>
          </label>
        </>
      ) : (
        <>
          <input type="hidden" name="loai" value="nexia" />
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
        {dang ? 'Đang xử lý…' : `Chọn file ${nganNut} & gộp vào kỳ`}
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
