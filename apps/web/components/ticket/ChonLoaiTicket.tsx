'use client'

import { useState } from 'react'
import { chuanLoaiMoi, DAI_TOI_DA_LOAI, loaiChoChon } from '@/lib/loi/loaiTicket'

const MOI = '__them_loai_moi__'

/**
 * Ô chọn loại ticket + "+ Thêm loại mới…". Gõ trùng loại đã có (bỏ dấu, hoa thường) → dùng loại đã có.
 * Bảo trì / thay lõi lọc không có trong danh sách (không phải lỗi). Giá trị lạ đang có (ticket cũ) vẫn giữ.
 * `onChange('')` khi tên mới chưa hợp lệ → form cha chặn Lưu như khi chưa chọn loại.
 */
export function ChonLoaiTicket({ value, onChange, loaiList, className = '', id, required }: {
  value: string; onChange: (loai: string) => void; loaiList: string[]; className?: string; id?: string; required?: boolean
}) {
  const ds = loaiChoChon(loaiList)
  const [dangThem, setDangThem] = useState(false)
  const [chu, setChu] = useState('')
  const kq = dangThem && chu ? chuanLoaiMoi(chu, loaiList) : null

  function go(s: string) {
    setChu(s)
    const r = chuanLoaiMoi(s, loaiList)
    onChange(r.ok ? r.loai : '')
  }

  return (
    <div className={className}>
      <select id={id} required={required} value={dangThem ? MOI : value}
        onChange={(e) => {
          if (e.target.value === MOI) { setDangThem(true); setChu(''); onChange('') }
          else { setDangThem(false); onChange(e.target.value) }
        }}
        className="w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white">
        <option value="">— Chọn loại —</option>
        {value && !dangThem && !ds.includes(value) && <option value={value}>{value}</option>}
        {ds.map((l) => <option key={l} value={l}>{l}</option>)}
        <option value={MOI}>+ Thêm loại mới…</option>
      </select>
      {dangThem && (
        <div className="mt-2 space-y-1">
          <input autoFocus value={chu} onChange={(e) => go(e.target.value)} maxLength={DAI_TOI_DA_LOAI + 20}
            placeholder="Tên loại lỗi mới, vd: Máy kêu to khi lọc"
            className="w-full rounded-lg border px-3 py-2 text-sm text-slate-900" />
          {kq && !kq.ok && <p className="text-xs text-red-600">{kq.error}</p>}
          {kq && kq.ok && kq.daCo && <p className="text-xs text-slate-500">Đã có loại <strong>{kq.loai}</strong> — dùng loại này.</p>}
          {kq && kq.ok && !kq.daCo && <p className="text-xs text-emerald-700">Loại mới — lưu ticket là loại này có trong danh sách.</p>}
        </div>
      )}
    </div>
  )
}
