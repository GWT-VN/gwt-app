'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { datTrangThaiSerial, type TrangThai } from '@/app/actions'
import { MAU_TRANG_THAI } from '@/lib/danhSach'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

/**
 * Badge trạng thái + đổi nhanh NGAY trong list kho serial (đỡ phải mở từng máy).
 *  - Máy đã lắp khách: chỉ badge + link sang trang máy (phải thu hồi trước khi đổi).
 *  - Máy ở kho + admin: chọn trạng thái mới + BẮT BUỘC mô tả hiện trạng -> Đặt.
 * Danh mục `ds` do trang truyền vào (bảng serial_trang_thai).
 */
export function DoiTrangThaiKho({
  serial, trangThai, choDoiTrangThai, ds,
}: {
  serial: string; trangThai: string | null
  /** Đổi trạng thái serial trong kho — cs.serial.kho (đúng quyền datTrangThaiSerial đòi) */
  choDoiTrangThai: boolean
  ds: TrangThai[]
}) {
  const router = useRouter()
  const [den, setDen] = useState('')
  const [ghiChu, setGhiChu] = useState('')
  const [ngay, setNgay] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const mapTT = new Map(ds.map((t) => [t.code, t]))
  const tt = trangThai ?? 'ton_kho'
  const nhan = (code: string) => mapTT.get(code)?.nhan ?? code
  const mauClass = MAU_TRANG_THAI[mapTT.get(tt)?.mau ?? 'slate'] ?? MAU_TRANG_THAI.slate
  const datTayList = ds.filter((t) => t.cho_dat_tay && t.hoat_dong && t.code !== tt)

  const badge = (
    <span className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${mauClass}`}>{nhan(tt)}</span>
  )

  if (tt === 'da_lap') {
    return (
      <div className="flex items-center gap-2">
        {badge}
        <Link href={`/may/${encodeURIComponent(serial)}`} prefetch={false} className="text-xs text-muted-foreground underline">ở khách</Link>
      </div>
    )
  }
  if (!choDoiTrangThai) return badge

  async function dat() {
    if (!den || !ghiChu.trim()) return
    if (!window.confirm(`Đổi ${serial} → ${nhan(den)}?`)) return
    setBusy(true); setErr(null)
    const r = await datTrangThaiSerial(serial, den, ghiChu, ngay || undefined)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    setDen(''); setGhiChu(''); setNgay(''); router.refresh()
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        {badge}
        <NativeSelect size="sm" aria-label={`Đổi trạng thái ${serial}`} value={den} onChange={(e) => setDen(e.target.value)} disabled={busy}>
          <NativeSelectOption value="">đổi…</NativeSelectOption>
          {datTayList.map((t) => <NativeSelectOption key={t.code} value={t.code}>{t.nhan}</NativeSelectOption>)}
        </NativeSelect>
        {den && (
          <>
            <Input type="date" aria-label="Ngày (bỏ trống = hôm nay)" title="Ngày (bỏ trống = hôm nay)" value={ngay} onChange={(e) => setNgay(e.target.value)} />
            <Input aria-label="Mô tả hiện trạng" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} placeholder="mô tả hiện trạng (bắt buộc)" />
            <Button size="sm" disabled={busy || !ghiChu.trim()} onClick={dat}>Đặt</Button>
          </>
        )}
      </div>
      {err && <span className="text-xs text-(--color-text-danger)">{err}</span>}
    </div>
  )
}
