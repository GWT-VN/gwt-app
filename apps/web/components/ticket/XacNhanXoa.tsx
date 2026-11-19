'use client'

import { useState } from 'react'
import type { NguoiDs } from '@/lib/loi/nguoiTicket'

/**
 * Khung hỏi lại khi xoá người khỏi danh sách CS theo dõi / kỹ thuật (Hiệp 19/11/2026). Xoá = ngừng dùng: ticket đã xong
 * giữ tên; ticket ĐANG MỞ chuyển sang người được chọn (mặc định "chưa gán") — như Freshdesk / Jobber khuyên chuyển việc
 * trước khi cho một người nghỉ.
 */
export function XacNhanXoa({ ten, soTicket, soLichHen = 0, coTaiKhoan = false, nguoiNhan, busy, onXoa, onHuy }: {
  ten: string; soTicket: number; soLichHen?: number; coTaiKhoan?: boolean
  /** người còn trong danh sách (trừ người đang xoá) để nhận ticket đang mở */
  nguoiNhan: NguoiDs[]
  busy: boolean
  onXoa: (chuyenSang: string | null) => void
  onHuy: () => void
}) {
  const [nhan, setNhan] = useState('')
  return (
    <div className="w-full space-y-2 text-sm">
      <p className="text-red-700">Xoá <strong>{ten}</strong> khỏi danh sách? Ticket đã xong vẫn giữ tên {ten}.</p>
      {soTicket > 0 && (
        <label className="flex flex-wrap items-center gap-2 text-slate-700">
          Chuyển {soTicket} ticket đang mở sang
          <select value={nhan} onChange={(e) => setNhan(e.target.value)} disabled={busy} aria-label="Chuyển ticket đang mở sang"
            className="rounded-lg border px-2 py-1 text-sm bg-white text-slate-900">
            <option value="">— Chưa gán —</option>
            {nguoiNhan.map((x) => <option key={x.id} value={x.id}>{x.ten}{x.la_ctv ? ' (CTV)' : ''}</option>)}
          </select>
        </label>
      )}
      {soLichHen > 0 && <p className="text-amber-700">Còn {soLichHen} chuyến hẹn sắp tới của {ten}: đổi thợ ở Gán lịch kỹ thuật.</p>}
      {coTaiKhoan && <p className="text-amber-700">{ten} vẫn còn tài khoản đăng nhập: bấm &quot;thu quyền&quot; nếu đã nghỉ.</p>}
      <div className="flex gap-2">
        <button type="button" disabled={busy} onClick={() => onXoa(nhan || null)}
          className="rounded-lg bg-red-600 border border-red-600 text-white px-3 py-1 text-sm disabled:opacity-50">Xoá</button>
        <button type="button" disabled={busy} onClick={onHuy} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50">Huỷ</button>
      </div>
    </div>
  )
}
