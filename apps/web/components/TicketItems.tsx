'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addTicketItem, deleteTicketItem, type TicketMuc, type CatalogItem } from '@/app/actions'
import { SerialPicker } from '@/components/SerialPicker'
import { vnDate } from '@/components/Badge'

const HOM_NAY = () => new Date().toISOString().slice(0, 10)
/** Chỉ giữ chữ số — dùng cho ô SL / Thành tiền (chặn ký tự lạ ngay khi gõ). */
const chiSo = (s: string) => s.replace(/[^\d]/g, '')

function tien(n: number | null) {
  if (n === null || n === undefined) return null
  return n.toLocaleString('vi-VN') + ' đ'
}

/**
 * `choPhepSua` chỉ ẩn nút cho gọn mắt — KHÔNG phải phân quyền.
 * Rào thật ở addTicketItem()/deleteTicketItem() trên server.
 * Hạng mục thu phí/vật tư gộp làm một; BẮT BUỘC chọn từ catalog_item.
 */
export function TicketItems(
  { code, items, catalog, choPhepSua }:
  { code: string; items: TicketMuc[]; catalog: CatalogItem[]; choPhepSua: boolean }
) {
  const [loai, setLoai] = useState<'hang_muc' | 'doi_may'>('hang_muc')
  const [catalogCode, setCatalogCode] = useState('')
  const [soLuong, setSoLuong] = useState('1')
  const [moTa, setMoTa] = useState('')
  const [soTien, setSoTien] = useState('')
  const [tinhPhi, setTinhPhi] = useState(true)
  const [ngayThuPhi, setNgayThuPhi] = useState(HOM_NAY())
  const [serialCu, setSerialCu] = useState('')
  const [serialMoi, setSerialMoi] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  // Validate SL / Thành tiền: chỉ nhận số. Thành tiền rỗng = không thu (null);
  // nếu nhập thì phải > 0 (0đ không phải một khoản thu hợp lệ).
  const slNum = Number(soLuong)
  const slHopLe = soLuong !== '' && slNum >= 1
  const tienNhap = soTien !== ''
  const tienNum = Number(soTien)
  const tienHopLe = !tienNhap || tienNum > 0

  const tenTheoCode = useMemo(
    () => new Map(catalog.map((c) => [c.code, c.ten ?? c.code])), [catalog])

  const tuyChon = useMemo(() => catalog.map((c) => ({
    gt: c.code,
    nhan: c.ten ?? c.code,
    phu: c.danh_muc === 'Services' ? 'DV' : undefined,
  })), [catalog])


  function reset() {
    setCatalogCode(''); setSoLuong('1'); setMoTa(''); setSoTien('')
    setTinhPhi(true); setNgayThuPhi(HOM_NAY()); setSerialCu(''); setSerialMoi('')
  }

  async function add() {
    setBusy(true); setErr(null)
    const r = await addTicketItem(code, {
      loai,
      catalog_code: loai === 'hang_muc' ? catalogCode : undefined,
      so_luong: slNum >= 1 ? slNum : 1,
      mo_ta: moTa,
      so_tien: tienNhap ? tienNum : null,
      tinh_phi: tinhPhi,
      serial_cu: loai === 'doi_may' ? serialCu : undefined,
      serial_moi: loai === 'doi_may' ? serialMoi : undefined,
      ngay_thu_phi: tinhPhi ? ngayThuPhi : null,
    })
    setBusy(false)
    if (!r.ok) setErr(r.error)
    else { reset(); router.refresh() }
  }

  async function del(id: string) {
    if (!window.confirm('Xoá mục này?')) return
    await deleteTicketItem(id, code)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <ul className="divide-y border rounded-lg">
          {items.map((it) => (
            <li key={it.id} className="px-3 py-2.5 flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-0.5">
                {it.loai === 'doi_may' ? (
                  <>
                    <Badge variant="soft" color="discovery">Đổi máy</Badge>
                    <p className="font-mono text-xs text-muted-foreground">
                      {it.serial_cu ?? '—'} → {it.serial_moi ?? '—'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-foreground">
                        {tenTheoCode.get(it.catalog_code ?? '') ?? it.catalog_code ?? 'Hạng mục'}
                      </span>
                      {it.so_luong && it.so_luong > 1 && (
                        <span className="text-xs text-muted-foreground">× {it.so_luong}</span>
                      )}
                      {tien(it.so_tien) && (
                        <span className="text-sm font-medium text-foreground">{tien(it.so_tien)}</span>
                      )}
                      <Badge variant="soft" color={it.tinh_phi ? 'warning' : 'success'}>
                        {it.tinh_phi ? 'Thu phí' : 'Miễn phí'}
                      </Badge>
                      {it.tinh_phi && it.ngay_thu_phi && (
                        <span className="text-xs text-muted-foreground">· thu {vnDate(it.ngay_thu_phi)}</span>
                      )}
                    </div>
                    {it.catalog_code && <span className="font-mono text-[10px] text-muted-foreground">{it.catalog_code}</span>}
                  </>
                )}
                {it.mo_ta && <p className="text-sm text-foreground">{it.mo_ta}</p>}
              </div>
              {choPhepSua && (
                <Button onClick={() => del(it.id)}
                  variant="ghost" size="sm" className="text-destructive">Xoá</Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!choPhepSua && (
        <p className="text-sm text-muted-foreground">
          {items.length === 0 && 'Chưa có mục nào. '}
          Chỉ quản trị mới ghi được chi phí, vật tư, đổi máy.
        </p>
      )}

      {choPhepSua && (
        <Card className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setLoai('hang_muc')}
              size="sm" aria-pressed={loai === 'hang_muc'} variant={loai === 'hang_muc' ? 'default' : 'outline'}>
              Hạng mục (thu phí / vật tư)
            </Button>
            <Button onClick={() => setLoai('doi_may')}
              size="sm" aria-pressed={loai === 'doi_may'} variant={loai === 'doi_may' ? 'default' : 'outline'}>
              Đổi máy
            </Button>
          </div>

          {loai === 'hang_muc' ? (
            <>
              <Combobox aria-label="Hạng mục (bắt buộc)" required options={tuyChon}
                value={catalogCode || null} onValueChange={(ma) => setCatalogCode(ma ?? '')}
                placeholder="Chọn mã hoặc tên hạng mục…" />
              <div className="flex gap-2 flex-wrap items-center">
                <label className="text-sm text-foreground flex items-center gap-1">
                  SL
                  <Input value={soLuong} onChange={(e) => setSoLuong(chiSo(e.target.value))} inputMode="numeric"
                    className="w-16" aria-invalid={!slHopLe} />
                </label>
                <Input value={soTien} onChange={(e) => setSoTien(chiSo(e.target.value))} inputMode="numeric"
                  placeholder="Thành tiền (đ)"
                  className="w-40 max-w-full" aria-invalid={tienNhap && !tienHopLe} aria-label="Thành tiền (đ)" />
                <label className="flex items-center gap-1.5 text-sm text-foreground">
                  <input type="checkbox" checked={tinhPhi} onChange={(e) => setTinhPhi(e.target.checked)} />
                  Thu phí khách
                </label>
                {tinhPhi && (
                  <label className="text-sm text-foreground flex items-center gap-1">
                    Ngày thu
                    <Input type="date" value={ngayThuPhi} max={HOM_NAY()}
                      onChange={(e) => setNgayThuPhi(e.target.value)}
                      className="w-auto max-w-full" />
                  </label>
                )}
              </div>
              {tienNhap && (tienHopLe
                ? <p className="text-xs text-muted-foreground">= {tien(tienNum)}</p>
                : <p className="text-xs text-destructive">Thành tiền không hợp lệ (chỉ nhập số dương).</p>)}
              <Input value={moTa} onChange={(e) => setMoTa(e.target.value)}
                placeholder="Ghi chú (tuỳ chọn)"
                aria-label="Ghi chú (tuỳ chọn)" />
            </>
          ) : (
            <>
              <div className="flex gap-2 flex-wrap">
                <SerialPicker value={serialCu} onChange={setSerialCu} placeholder="Serial máy CŨ (thu hồi)" />
                <SerialPicker value={serialMoi} onChange={setSerialMoi} placeholder="Serial máy MỚI (đổi cho khách)" />
              </div>
              <Input value={moTa} onChange={(e) => setMoTa(e.target.value)}
                placeholder="Ghi chú (tuỳ chọn)"
                aria-label="Ghi chú (tuỳ chọn)" />
            </>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={add}
              disabled={busy || (loai === 'hang_muc' && (!catalogCode || !slHopLe || !tienHopLe))}
              size="sm">
              {busy ? 'Đang thêm…' : '+ Thêm mục'}
            </Button>
            {err && <Alert color="danger"><AlertDescription>{err}</AlertDescription></Alert>}
          </div>
        </Card>
      )}
    </div>
  )
}
