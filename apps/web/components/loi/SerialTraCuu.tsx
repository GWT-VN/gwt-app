'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { traSerial } from '@/app/ticket/loi-actions'
import { kiemDangSerial } from '@/lib/loi/serial'
import { ngayVN } from '@/lib/loi/traCuuForm'
import type { KetQuaTraSerial } from '@/lib/loi/kieu'

/** Ô gõ serial (mono) + tra installed_base / serial_registry sau 300 ms im phím. */
export function SerialTraCuu({ value, onChange, onKetQua, nhan = 'Serial máy' }: {
  value: string
  nhan?: string
  onChange: (v: string) => void
  onKetQua?: (k: KetQuaTraSerial | null) => void
}) {
  const [kq, setKq] = useState<KetQuaTraSerial | null>(null)
  const [loiMang, setLoiMang] = useState<string | null>(null)
  const luot = useRef(0)
  const baoRef = useRef(onKetQua)
  useEffect(() => { baoRef.current = onKetQua })

  const k = kiemDangSerial(value)

  useEffect(() => {
    const cua = ++luot.current
    if (!k.chuan) {
      const t = setTimeout(() => { if (cua === luot.current) { setKq(null); setLoiMang(null); baoRef.current?.(null) } }, 0)
      return () => clearTimeout(t)
    }
    const hen = setTimeout(async () => {
      try {
        const r = await traSerial(k.chuan)
        if (cua !== luot.current) return
        setKq(r); setLoiMang(null); baoRef.current?.(r)
      } catch (e) {
        if (cua !== luot.current) return
        setKq(null); setLoiMang(e instanceof Error ? e.message : 'Không tra được serial'); baoRef.current?.(null)
      }
    }, 300)
    return () => clearTimeout(hen)
  }, [k.chuan])

  const ra = kq && kq.serial === k.chuan ? kq : null   // bỏ kết quả của serial cũ
  const hienLoiDang = !!k.loi && (!ra || ra.loai === 'sai_dang' || ra.loai === 'khong_co')

  return (
    <div className="space-y-1">
      <Input value={value} onChange={(e) => onChange(e.target.value)}
        aria-label={nhan} placeholder="Serial máy (20 ký tự)" spellCheck={false}
        autoCapitalize="characters" className="font-mono" />
      {hienLoiDang && ra?.loai !== 'sai_dang' && <p className="text-xs text-(--color-text-danger)">{k.loi}</p>}
      {loiMang && <p className="text-xs text-(--color-text-danger)">{loiMang}</p>}
      {ra?.loai === 'sai_dang' && <p className="text-xs text-(--color-text-danger)">{ra.loi}</p>}
      {ra?.loai === 'da_lap' && (
        <div className="text-sm rounded-lg bg-(--color-background-success-surface) text-(--color-text-success) px-3 py-2">
          <strong>{ra.product_name ?? ra.internal_code ?? 'Máy'}</strong>
          {ra.internal_code ? ` (${ra.internal_code})` : ''} · Khách: {ra.customer_name ?? '—'} · Lắp {ngayVN(ra.install_date)}
          <div className="text-xs mt-0.5">BH: {ra.warranty_activated ? 'đã kích hoạt' : 'chưa kích hoạt'}</div>
        </div>
      )}
      {ra?.loai === 'chua_kich_hoat' && (
        <div className="text-sm rounded-lg bg-(--color-background-warning-surface) text-(--color-text-warning) px-3 py-2">
          Máy <strong>chưa kích hoạt</strong>{ra.trang_thai ? ` (${ra.trang_thai})` : ''}
          {ra.product_name ? ` · ${ra.product_name}` : ''}{' '}
          <Link href="/dang-ky-bh" className="underline font-medium">Kích hoạt / lắp máy →</Link>
        </div>
      )}
      {ra?.loai === 'khong_co' && (
        <div className="text-sm rounded-lg bg-muted text-muted-foreground px-3 py-2">
          Serial chưa có trong hệ thống — vẫn lưu được, CS bổ sung sau
        </div>
      )}
    </div>
  )
}
