'use client'

import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { SerialTraCuu } from './SerialTraCuu'
import { CHUA_PHAN_LOAI } from '@/lib/loi/dongMay'
import { GIOI_HAN } from '@/lib/loi/kiemDauVao'
import { dongBo, dongThem, SO_DONG_TOI_DA } from '@/lib/loi/traCuuForm'
import type { DongMayInput, KetQuaTraSerial, LoiDanhMuc } from '@/lib/loi/kieu'

/** Các dòng máy báo lỗi của một ticket (tối thiểu 1, tối đa 20). */
export function DongMayNhap({ dong, onChange, dsLoi, onKetQua, themNhieu = true }: {
  dong: DongMayInput[]
  onChange: (d: DongMayInput[]) => void
  dsLoi: LoiDanhMuc[]
  themNhieu?: boolean
  onKetQua?: (i: number, k: KetQuaTraSerial | null) => void
}) {
  const tuyChon = dsLoi.filter((d) => d.code !== CHUA_PHAN_LOAI)
    .map((d) => ({ gt: d.code, nhan: d.ten, phu: d.ma_may.join(', ') }))
  const sua = (i: number, p: Partial<DongMayInput>) => onChange(dong.map((d, j) => (j === i ? { ...d, ...p } : d)))
  return (
    <div className="space-y-3">
      {dong.map((d, i) => (
        <div key={i} className="space-y-2 rounded-(--radius-lg) border border-border bg-muted p-3">
          <div className="flex items-center justify-between text-sm font-medium text-foreground">
            <span>Máy {i + 1}</span>
            {dong.length > 1 && (
              <Button type="button" size="sm" variant="ghost" onClick={() => onChange(dongBo(dong, i))} aria-label={`Bỏ dòng máy ${i + 1}`}>Bỏ dòng</Button>
            )}
          </div>
          <SerialTraCuu nhan={`Serial máy ${i + 1}`} value={d.serial ?? ''} onChange={(v) => sua(i, { serial: v })} onKetQua={(k) => onKetQua?.(i, k)} />
          <div className="grid sm:grid-cols-2 gap-2">
            <Combobox
              value={d.loi_code === CHUA_PHAN_LOAI ? null : d.loi_code ?? null}
              onValueChange={(gt) => sua(i, { loi_code: gt ?? CHUA_PHAN_LOAI })}
              options={tuyChon}
              aria-label={`Loại lỗi máy ${i + 1}`}
              placeholder="Chưa phân loại"
              searchPlaceholder="Tìm loại lỗi…"
              disabled={tuyChon.length === 0}
            />
            <Input value={d.mo_ta ?? ''} maxLength={GIOI_HAN.text} onChange={(e) => sua(i, { mo_ta: e.target.value })}
              aria-label={`Mô tả lỗi máy ${i + 1}`} placeholder="Mô tả lỗi của máy này" />
          </div>
        </div>
      ))}
      {themNhieu && (
        <Button type="button" variant="outline" onClick={() => onChange(dongThem(dong))} disabled={dong.length >= SO_DONG_TOI_DA}>
          ＋ Thêm máy
        </Button>
      )}
    </div>
  )
}
