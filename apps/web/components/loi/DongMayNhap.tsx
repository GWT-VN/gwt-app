'use client'

import { OChonGoiY } from '@/bang'
import { SerialTraCuu } from './SerialTraCuu'
import { CHUA_PHAN_LOAI } from '@/lib/loi/dongMay'
import { GIOI_HAN } from '@/lib/loi/kiemDauVao'
import { dongBo, dongThem, SO_DONG_TOI_DA } from '@/lib/loi/traCuuForm'
import type { DongMayInput, KetQuaTraSerial, LoiDanhMuc } from '@/lib/loi/kieu'

/** Các dòng máy báo lỗi của một ticket (tối thiểu 1, tối đa 20). */
export function DongMayNhap({ dong, onChange, dsLoi, onKetQua }: {
  dong: DongMayInput[]
  onChange: (d: DongMayInput[]) => void
  dsLoi: LoiDanhMuc[]
  onKetQua?: (i: number, k: KetQuaTraSerial | null) => void
}) {
  const tuyChon = dsLoi.map((d) => ({ gt: d.code, nhan: d.ten, phu: d.ma_may.join(', ') }))
  const sua = (i: number, p: Partial<DongMayInput>) => onChange(dong.map((d, j) => (j === i ? { ...d, ...p } : d)))
  return (
    <div className="space-y-3">
      {dong.map((d, i) => (
        <div key={i} className="rounded-lg border p-3 space-y-2 bg-slate-50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Máy {i + 1}</span>
            {dong.length > 1 && (
              <button type="button" onClick={() => onChange(dongBo(dong, i))} className="text-red-600 hover:underline">Bỏ dòng</button>
            )}
          </div>
          <SerialTraCuu value={d.serial ?? ''} onChange={(v) => sua(i, { serial: v })} onKetQua={(k) => onKetQua?.(i, k)} />
          <div className="grid sm:grid-cols-2 gap-2">
            <OChonGoiY giaTri={d.loi_code ?? CHUA_PHAN_LOAI} tuyChon={tuyChon} choPhepXoa={false}
              choTrong="Loại lỗi…" onChon={(gt) => sua(i, { loi_code: gt || CHUA_PHAN_LOAI })} />
            <input value={d.mo_ta ?? ''} maxLength={GIOI_HAN.text} onChange={(e) => sua(i, { mo_ta: e.target.value })}
              placeholder="Mô tả lỗi của máy này"
              className="w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white" />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange(dongThem(dong))} disabled={dong.length >= SO_DONG_TOI_DA}
        className="text-sm rounded-lg border px-3 py-1.5 bg-white disabled:opacity-50">
        ＋ Thêm máy
      </button>
    </div>
  )
}
