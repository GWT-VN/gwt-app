'use client'

import { useState } from 'react'
import { Combobox } from '@/components/ui/combobox'
import { FieldDescription, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { chuanLoaiMoi, DAI_TOI_DA_LOAI, loaiChoChon } from '@/lib/loi/loaiTicket'

const MOI = { gt: '__them_loai_moi__', nhan: '+ Thêm loại mới…', anMa: true }

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
  const loaiCu = value && !dangThem && !ds.includes(value) ? [value] : []
  const tuyChon = [...loaiCu, ...ds].map((loai) => ({ gt: loai, nhan: loai }))
  const dangChon = dangThem ? MOI.gt : value
  const nhan = id ? undefined : 'Phân loại'
  const kq = dangThem && chu ? chuanLoaiMoi(chu, loaiList) : null

  function go(s: string) {
    setChu(s)
    const r = chuanLoaiMoi(s, loaiList)
    onChange(r.ok ? r.loai : '')
  }

  function chon(loai: string | null) {
    const them = loai === MOI.gt
    setDangThem(them)
    if (them) setChu('')
    onChange(them ? '' : loai ?? '')
  }

  return (
    <div className={className}>
      {tuyChon.length + 1 > 10 ? (
        <Combobox id={id} aria-label={nhan} required={required}
          value={dangChon || null} onValueChange={chon} options={[MOI, ...tuyChon]}
          placeholder="Chọn loại…"
        />
      ) : (
        <NativeSelect id={id} aria-label={nhan} required={required} value={dangChon} onChange={(e) => chon(e.target.value)}>
          <NativeSelectOption value="">— Chọn loại —</NativeSelectOption>
          {tuyChon.map((loai) => <NativeSelectOption key={loai.gt} value={loai.gt}>{loai.nhan}</NativeSelectOption>)}
          <NativeSelectOption value={MOI.gt}>{MOI.nhan}</NativeSelectOption>
        </NativeSelect>
      )}
      {dangThem && (
        <div className="mt-2 space-y-1">
          <Input autoFocus aria-label="Tên loại lỗi mới" value={chu} onChange={(e) => go(e.target.value)}
            maxLength={DAI_TOI_DA_LOAI + 20} placeholder="Tên loại lỗi mới, vd: Máy kêu to khi lọc" />
          {kq && !kq.ok && <FieldError>{kq.error}</FieldError>}
          {kq && kq.ok && kq.daCo && <FieldDescription>Đã có loại <strong>{kq.loai}</strong> — dùng loại này.</FieldDescription>}
          {kq && kq.ok && !kq.daCo && <FieldDescription>Loại mới — lưu ticket là loại này có trong danh sách.</FieldDescription>}
        </div>
      )}
    </div>
  )
}
