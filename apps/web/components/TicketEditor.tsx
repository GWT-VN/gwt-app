'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { updateTicket } from '@/app/actions'
import { datNgayBao } from '@/app/ticket/dau-ticket-actions'
import { KhungCap, O2Cot, ONgay } from '@/components/loi/CapLoiXuLy'
import { ChonLoaiTicket } from '@/components/ticket/ChonLoaiTicket'
import { ngayCuaLan, ngayVNHomNay } from '@/lib/loi/ngayTicket'

/**
 * Khối "Các lần lỗi": Lần 1 (tickets.description ↔ last_note, ngày = ngay_bao | ngày tạo) +
 * các lần sau (children). Mặc định XEM; "Sửa" sửa tại chỗ loại + Lần 1 + ngày khách báo.
 * Trạng thái / Khẩn / CS / Kỹ thuật nằm ở thanh đầu trang (DauTicket), không ở đây.
 */
export function TicketEditor({
  code, lastNote, ticketType, description, loaiList = [], ngayBao, ngayTao = null,
  choSua = true, coNgayBao = true, children,
}: {
  code: string
  lastNote: string | null
  ticketType: string | null
  description: string | null
  loaiList?: string[]
  // Ngày khách báo lần 1 ('YYYY-MM-DD'); null → dùng ngày tạo ticket.
  ngayBao: string | null
  ngayTao?: string | null
  choSua?: boolean
  // false = DB chưa có cột ngay_bao (chưa áp migration) → ẩn ô chọn ngày.
  coNgayBao?: boolean
  children?: ReactNode
}) {
  const ngayLan1 = ngayCuaLan(ngayBao, ngayTao)
  const [edit, setEdit] = useState(false)
  const [note, setNote] = useState(lastNote ?? '')
  const [loai, setLoai] = useState(ticketType ?? '')
  const [moTa, setMoTa] = useState(description ?? '')
  const [ngay, setNgay] = useState(ngayLan1 ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  async function save() {
    if (!loai.trim() || !moTa.trim()) { setErr('Phân loại và Mô tả không được trống.'); return }
    setBusy(true); setErr(null)
    const r = await updateTicket(code, { last_note: note, ticket_type: loai, description: moTa })
    const r2 = r.ok && coNgayBao && ngay !== (ngayLan1 ?? '') ? await datNgayBao(code, ngay || null) : r
    setBusy(false)
    if (!r.ok) setErr(r.error)
    else if (!r2.ok) setErr(r2.error)
    else { setEdit(false); router.refresh() }
  }

  function huy() {
    setNote(lastNote ?? ''); setLoai(ticketType ?? ''); setMoTa(description ?? ''); setNgay(ngayLan1 ?? '')
    setErr(null); setEdit(false)
  }

  if (!edit) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-medium text-slate-900">Các lần lỗi</h2>
          {choSua && <button onClick={() => setEdit(true)} className="text-sm text-slate-600 underline flex-none">Sửa loại / lần 1</button>}
        </div>
        <KhungCap lan={1} ngay={ngayLan1} moTa={moTa} xuLy={note} />
        {children}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="font-medium text-slate-900">Sửa loại &amp; lần 1</h2>
      <div className="flex items-end gap-4 flex-wrap">
        <div className="block min-w-56">
          <span className="text-sm text-slate-700">Phân loại *</span>
          {/* Giữ giá trị lạ (loại cũ ngoài danh sách) để không mất dữ liệu; có "+ Thêm loại mới…". */}
          <ChonLoaiTicket value={loai} onChange={setLoai} loaiList={loaiList} className="mt-1" />
        </div>
        {coNgayBao && <ONgay ngay={ngay} setNgay={setNgay} homNay={ngayVNHomNay()} />}
      </div>
      <O2Cot moTa={moTa} setMoTa={setMoTa} xuLy={note} setXuLy={setNote} />
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={busy}
          className="rounded-lg bg-slate-900 text-white px-4 py-2 font-medium disabled:opacity-50">
          {busy ? 'Đang lưu…' : 'Lưu'}
        </button>
        <button type="button" onClick={huy} disabled={busy}
          className="rounded-lg border px-4 py-2 font-medium text-slate-600 disabled:opacity-50 hover:bg-slate-50">
          Huỷ
        </button>
      </div>
      {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
    </div>
  )
}
