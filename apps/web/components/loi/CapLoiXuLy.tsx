'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { themLanLoi, suaLanLoi, xoaLanLoi } from '@/app/ticket/lan-loi-actions'
import type { LanLoi } from '@/lib/loi/lanLoi'
import { ngayCuaLan, ngayVNHienThi, ngayVNHomNay } from '@/lib/loi/ngayTicket'

/** 'YYYY-MM-DD' (ngày khách báo) hoặc ISO (ngày tạo) → dd/mm/yyyy giờ VN. */
const ngayVN = (s: string | null) => (s ? ngayVNHienThi(/^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ngayCuaLan(null, s)) : '')

/** Một cặp "Khách báo ↔ Xử lý" ở chế độ xem: hai cột cạnh nhau (mobile xếp dọc). */
export function KhungCap({ lan, ngay, moTa, xuLy, nut }: {
  lan: number; ngay: string | null; moTa: string | null; xuLy: string | null; nut?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-3 py-1.5 rounded-t-lg">
        <span className="text-xs font-medium text-slate-700">Lần {lan}{ngay && <span className="font-normal text-slate-500"> · {ngayVN(ngay)}</span>}</span>
        {nut}
      </div>
      <div className="grid sm:grid-cols-2 sm:divide-x divide-slate-100 text-sm">
        <div className="p-3 min-w-0">
          <span className="text-xs text-slate-500">Khách báo</span>
          <p className="text-slate-900 whitespace-pre-wrap [overflow-wrap:anywhere]">{moTa || '—'}</p>
        </div>
        <div className="p-3 min-w-0">
          <span className="text-xs text-slate-500">Xử lý</span>
          <p className={`whitespace-pre-wrap [overflow-wrap:anywhere] ${xuLy ? 'text-slate-900' : 'text-amber-600'}`}>{xuLy || 'chưa có'}</p>
        </div>
      </div>
    </div>
  )
}

/** Hai ô nhập cạnh nhau cho một cặp. */
export function O2Cot({ moTa, setMoTa, xuLy, setXuLy, batBuoc = true }: {
  moTa: string; setMoTa: (s: string) => void; xuLy: string; setXuLy: (s: string) => void; batBuoc?: boolean
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <label className="block">
        <span className="text-sm text-slate-700">Mô tả khách báo{batBuoc && ' *'}</span>
        <textarea value={moTa} onChange={(e) => setMoTa(e.target.value)} rows={4}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900" />
      </label>
      <label className="block">
        <span className="text-sm text-slate-700">Tóm tắt xử lý</span>
        <textarea value={xuLy} onChange={(e) => setXuLy(e.target.value)} rows={4}
          placeholder="Kỹ thuật đã làm gì, nguyên nhân, kết quả…"
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900" />
      </label>
    </div>
  )
}

/** Ô chọn ngày khách báo (cho phép ngày lùi, chặn tương lai bằng `max`). */
export function ONgay({ ngay, setNgay, homNay }: { ngay: string; setNgay: (s: string) => void; homNay: string }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      Ngày khách báo
      <input type="date" value={ngay} max={homNay} min="2020-01-01" onChange={(e) => setNgay(e.target.value)}
        className="rounded-lg border px-2 py-1 text-sm text-slate-900" />
    </label>
  )
}

export function FormCap({ dau, moTa0 = '', xuLy0 = '', ngay0 = '', homNay = ngayVNHomNay(), onLuu, onHuy }: {
  dau: string; moTa0?: string; xuLy0?: string; ngay0?: string; homNay?: string
  onLuu: (v: { mo_ta: string; xu_ly: string; ngay: string }) => Promise<{ ok: true } | { ok: false; error: string }>
  onHuy: () => void
}) {
  const [moTa, setMoTa] = useState(moTa0)
  const [xuLy, setXuLy] = useState(xuLy0)
  const [ngay, setNgay] = useState(ngay0)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  async function luu() {
    if (!moTa.trim()) { setErr('Nhập mô tả khách báo.'); return }
    setBusy(true); setErr(null)
    const r = await onLuu({ mo_ta: moTa, xu_ly: xuLy, ngay })
    setBusy(false)
    if (!r.ok) setErr(r.error)
  }
  return (
    <div className="rounded-lg border border-slate-300 p-3 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs font-medium text-slate-700">{dau}</p>
        <ONgay ngay={ngay} setNgay={setNgay} homNay={homNay} />
      </div>
      <O2Cot moTa={moTa} setMoTa={setMoTa} xuLy={xuLy} setXuLy={setXuLy} />
      <div className="flex items-center gap-3">
        <button onClick={luu} disabled={busy}
          className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm font-medium disabled:opacity-50">
          {busy ? 'Đang lưu…' : 'Lưu'}
        </button>
        <button type="button" onClick={onHuy} disabled={busy}
          className="rounded-lg border px-3 py-1.5 text-sm text-slate-600 disabled:opacity-50 hover:bg-slate-50">Huỷ</button>
      </div>
      {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
    </div>
  )
}

/** Lần lỗi thứ 2+ (bảng ticket_lan_loi): xem, sửa, xoá từng cặp; thêm cặp mới khi khách báo lỗi lần sau. */
export function LanLoiTiepTheo({ code, ds, choSua, lanKe }: { code: string; ds: LanLoi[]; choSua: boolean; lanKe: number }) {
  const [dangSua, setDangSua] = useState<string | null>(null)
  const [dangThem, setDangThem] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  const xong = <T extends { ok: boolean }>(r: T) => { if (r.ok) { setDangSua(null); setDangThem(false); router.refresh() } return r }

  async function xoa(l: LanLoi) {
    if (!window.confirm(`Xoá lần ${l.lan}?`)) return
    setErr(null)
    const r = await xoaLanLoi(l.id, code)
    if (!r.ok) setErr(r.error); else router.refresh()
  }

  return (
    <div className="space-y-3">
      {ds.map((l) => dangSua === l.id ? (
        <FormCap key={l.id} dau={`Sửa lần ${l.lan}`} moTa0={l.mo_ta} xuLy0={l.xu_ly ?? ''}
          ngay0={ngayCuaLan(l.ngay, l.created_at) ?? ''}
          onLuu={async (v) => xong(await suaLanLoi(l.id, code, v))} onHuy={() => setDangSua(null)} />
      ) : (
        <KhungCap key={l.id} lan={l.lan} ngay={ngayCuaLan(l.ngay, l.created_at)} moTa={l.mo_ta} xuLy={l.xu_ly}
          nut={choSua && (
            <span className="flex gap-3 text-xs">
              <button onClick={() => setDangSua(l.id)} className="text-slate-600 underline">Sửa</button>
              <button onClick={() => xoa(l)} className="text-red-600 underline">Xoá</button>
            </span>
          )} />
      ))}

      {choSua && (dangThem ? (
        <FormCap dau={`Lần ${lanKe} — khách báo lỗi tiếp`} ngay0={ngayVNHomNay()}
          onLuu={async (v) => xong(await themLanLoi(code, v))} onHuy={() => setDangThem(false)} />
      ) : (
        <button onClick={() => setDangThem(true)}
          className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
          + Thêm lần lỗi mới
        </button>
      ))}
      {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
    </div>
  )
}
