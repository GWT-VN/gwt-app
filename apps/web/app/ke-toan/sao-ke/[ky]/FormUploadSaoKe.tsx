'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { uploadSaoKe } from '../actions'
import type { TaiKhoan } from '@/lib/ke-toan/sao-ke/kieu'

/** 3 tài khoản ngân hàng (lát 5) — accept đổi theo tài khoản (VCB .xls/.xlsx, TCB .pdf). */
const TK_OPTS: { gt: TaiKhoan; nhan: string; accept: string }[] = [
  { gt: 'VCB21', nhan: 'VCB21 (.xls)', accept: '.xls,.xlsx' },
  { gt: 'VCB63', nhan: 'VCB63 (.xls)', accept: '.xls,.xlsx' },
  { gt: 'TCB', nhan: 'TCB (.pdf)', accept: '.pdf' },
]

/**
 * Một nút duy nhất, cùng khuôn FormUpload.tsx: chọn tài khoản → bấm nút → hộp chọn file → chọn
 * xong tự gửi. Nạp lại sao kê cùng tài khoản là GHI ĐÈ đối chiếu (giữ chốt tay), không phải lỗi.
 * Thông báo thành công tự tắt sau 2s (baoXanh như DongSua) — lỗi thì giữ nguyên, role="alert".
 */
export function FormUploadSaoKe({ ky }: { ky: string }) {
  const [kq, act, dang] = useActionState(uploadSaoKe, null)
  const formRef = useRef<HTMLFormElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [taiKhoan, setTaiKhoan] = useState<TaiKhoan>('VCB21')
  const [tenFile, setTenFile] = useState<string | null>(null)
  const [kqGoc, setKqGoc] = useState(kq)
  const [hienKq, setHienKq] = useState(false)
  const accept = TK_OPTS.find((o) => o.gt === taiKhoan)!.accept

  // kq đổi (action vừa xong) → chỉnh state NGAY TRONG RENDER (khuyến nghị của React thay vì
  // useEffect) để bật cờ hiện; useEffect chỉ lo phần hẹn giờ tắt (setTimeout, gọi setState
  // BÊN TRONG callback — không phải đồng bộ ngay trong thân effect).
  if (kq !== kqGoc) { setKqGoc(kq); setHienKq(!!kq?.ok) }
  useEffect(() => {
    if (!hienKq) return
    const hen = setTimeout(() => setHienKq(false), 2000)
    return () => clearTimeout(hen)
  }, [hienKq])

  return (
    <form ref={formRef} action={act} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <input type="hidden" name="ky" value={ky} />
      <label className="text-sm">Tài khoản
        <select name="tai_khoan" value={taiKhoan} disabled={dang} onChange={(e) => setTaiKhoan(e.target.value as TaiKhoan)} className="ml-2 rounded border px-2 py-1 text-sm">
          {TK_OPTS.map((o) => <option key={o.gt} value={o.gt}>{o.nhan}</option>)}
        </select>
      </label>
      <input ref={fileRef} type="file" name="file" accept={accept} className="hidden" tabIndex={-1}
        onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setTenFile(f.name); formRef.current?.requestSubmit() }} />
      <button type="button" disabled={dang}
        onClick={() => { if (fileRef.current) fileRef.current.value = ''; fileRef.current?.click() }}
        className="rounded bg-[#3f8a6a] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#35745a] disabled:opacity-50">
        {dang ? 'Đang xử lý…' : 'Chọn file & nhập sao kê'}
      </button>
      {dang && tenFile ? <span className="text-sm text-slate-500">{tenFile}</span> : null}
      {!dang && kq?.ok && hienKq ? (
        <span className="text-sm text-emerald-700">
          Nhập {kq.inserted} dòng · cập nhật {kq.updated} · chắc {kq.chac} · gợi ý {kq.goiY} · chưa khớp {kq.khongKhop}
        </span>
      ) : null}
      {!dang && kq && !kq.ok ? <span role="alert" className="text-sm text-red-600">{kq.error}</span> : null}
    </form>
  )
}
