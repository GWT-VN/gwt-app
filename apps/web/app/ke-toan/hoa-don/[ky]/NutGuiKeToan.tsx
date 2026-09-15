'use client'
import { useActionState } from 'react'
import { guiKeToan, type KyRow } from '../../actions'

/** guiKeToan() luôn redirect khi thành công (NEXT_REDIRECT) — never trả ok:true; state chỉ giữ lỗi. */
export function NutGuiKeToan({ period }: { period: KyRow }) {
  const [kq, act, dang] = useActionState(async () => guiKeToan(period.id, period.ky), null as null | { ok: false; error: string })
  if (period.status === 'da_gui') {
    return <span className="rounded bg-emerald-50 px-2 py-1 text-sm text-emerald-800">Đã gửi kế toán {period.sent_at ? new Date(period.sent_at).toLocaleDateString('vi-VN') : ''}{period.edits_after_sent > 0 ? ` · ${period.edits_after_sent} sửa sau gửi` : ''}</span>
  }
  return (
    <form action={act} onSubmit={(e) => { if (!window.confirm(period.so_canh_bao > 0 ? `Còn ${period.so_canh_bao} dòng cảnh báo chưa xử lý. Vẫn đánh dấu đã gửi?` : 'Đánh dấu kỳ đã gửi kế toán?')) e.preventDefault() }}>
      <button type="submit" disabled={dang} className="rounded bg-[#3f8a6a] px-3 py-1 text-sm text-white disabled:opacity-50">{dang ? 'Đang ghi…' : 'Đã gửi kế toán'}</button>
      {kq && !kq.ok ? <span className="ml-2 text-sm text-red-600">{kq.error}</span> : null}
    </form>
  )
}
