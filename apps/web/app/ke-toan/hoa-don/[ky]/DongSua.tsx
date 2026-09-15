'use client'

import { useState, useTransition } from 'react'
import { OChonGoiY, type MucChon } from '@/bang'
import { suaDong, datThanhLuat, type DongRow } from '../../actions'

/** Ba ô sửa tại chỗ của một dòng: Mã (chọn gõ-để-tìm), Ghi chú (blur mới lưu), menu "Đặt thành luật".
 *  Lưu xong: chấm xanh 2s; lỗi: chữ đỏ ngay dưới ô, giữ giá trị người gõ. Không reload trang — hàng khác không nháy.
 *  Pattern của luật tính ở server (datThanhLuat) — component này không import chuan-hoa.ts (dùng
 *  node:crypto, vỡ client bundle nếu import vào đây). */
export function DongSua({ d, ma, huong }: { d: DongRow; ma: MucChon[]; huong: 'vao' | 'ra' }) {
  const [code, setCode] = useState(d.code)
  const [codeName, setCodeName] = useState(d.code_name)
  const [note, setNote] = useState(d.note_for_accountant ?? '')
  const [tb, setTb] = useState<{ ok: boolean; msg: string } | null>(null)
  const [moLuat, setMoLuat] = useState(false)
  const [dang, batDau] = useTransition()

  /** Chấm xanh tự tắt sau 2s (lỗi đỏ thì gọi setTb thẳng, giữ nguyên trên màn). */
  function baoXanh(msg: string) {
    setTb({ ok: true, msg }); setTimeout(() => setTb(null), 2000)
  }
  function luu(codeMoi: string | null, noteMoi: string) {
    batDau(async () => {
      const r = await suaDong({ lineId: d.id, code: codeMoi, note: noteMoi, tenBan: d.ten_ban, tenHang: d.ten_hang })
      if (!r.ok) { setTb({ ok: false, msg: r.error }); return }
      setCode(codeMoi); setCodeName(ma.find((m) => m.gt === codeMoi)?.nhan.split(' · ')[1] ?? null)
      baoXanh(r.suaSauGui > 0 ? `Đã lưu · sửa sau gửi #${r.suaSauGui}` : 'Đã lưu')
    })
  }
  function datLuat(kind: 'supplier' | 'keyword') {
    if (!code) return
    batDau(async () => {
      const r = await datThanhLuat({ kind, tenBan: d.ten_ban, tenHang: d.ten_hang, targetCode: code })
      if (r.ok) baoXanh(r.moi ? `Đã đặt luật: ${kind === 'supplier' ? 'NCC' : 'diễn giải'} chứa "${r.pattern}" → ${code}` : 'Luật này đã có')
      else setTb({ ok: false, msg: r.error })
      setMoLuat(false)
    })
  }
  return (
    <>
      <td className="p-1 min-w-[220px]">
        <OChonGoiY giaTri={code} onChon={(gt) => luu(gt || null, note)} tuyChon={ma} choTrong="Gõ mã / tên…" className="text-xs" />
        {codeName ? <div className="px-1 text-[11px] text-slate-500">{codeName}</div> : null}
      </td>
      <td className="p-1 min-w-[200px]">
        <input value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => note !== (d.note_for_accountant ?? '') && luu(code, note)}
          placeholder="Ghi chú cho kế toán" aria-label="Ghi chú cho kế toán" className="w-full rounded border px-1 py-0.5 text-xs" />
        {tb ? <div className={`px-1 text-[11px] ${tb.ok ? 'text-emerald-700' : 'text-red-600'}`}>{tb.msg}</div> : null}
      </td>
      <td className="p-1 whitespace-nowrap">
        {huong === 'vao' && code ? (
          moLuat ? (
            <span className="inline-flex gap-1">
              <button type="button" disabled={dang} onClick={() => datLuat('supplier')} className="rounded border px-1.5 text-[11px]">NCC → {code}</button>
              <button type="button" disabled={dang} onClick={() => datLuat('keyword')} className="rounded border px-1.5 text-[11px]">Diễn giải → {code}</button>
              <button type="button" onClick={() => setMoLuat(false)} className="px-1 text-[11px] text-slate-400">✕</button>
            </span>
          ) : <button type="button" onClick={() => setMoLuat(true)} className="text-[11px] text-[#3f8a6a] underline">Đặt thành luật</button>
        ) : null}
      </td>
    </>
  )
}
