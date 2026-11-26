'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { taoLichKyThuat, boiCanhKhach, capNhatDiaChiMay, lichTuanKyThuat, taoNghiKyThuat, xoaNghiKyThuat, type KyThuat, type ViecInput, type BoiCanhKhach, type TuanKyThuat } from '@/app/actions'
import { LOAI_VIEC_KT, NHAN_LOAI_VIEC } from '@/lib/danhSach'
import { ChonTinh } from '@/components/ChonTinh'
import { KhachPicker } from '@/components/KhachPicker'
import { vnDate } from '@/components/Badge'

const HOM_NAY = () => new Date().toISOString().slice(0, 10)

/**
 * Quản lý kỹ thuật + GÁN CHUYẾN ĐI (1 chuyến nhiều việc).
 * Kỹ thuật gồm nhân viên + cộng tác viên. Việc "Khác" bắt buộc ghi cụ thể.
 */
export function KyThuatBang({ dsKt, prefill, suaDs = false }: {
  dsKt: KyThuat[]
  // Trang này CHỈ gán lịch (Hiệp 19/11/2026). Thêm / sửa / xoá thợ làm ở /danh-sach-nguoi?tab=kt (chỉ vai trò "Sửa danh sách người");
  // `suaDs` = hiện link sang đó.
  suaDs?: boolean
  prefill?: { khachId: string; ctx: BoiCanhKhach; ngay?: string; viec?: ViecInput[] }
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  // tạo chuyến
  const [ktId, setKtId] = useState('')
  const [ngay, setNgay] = useState(prefill?.ngay ?? HOM_NAY())
  const [tuan, setTuan] = useState<TuanKyThuat | null>(null)

  async function loadTuan(kt: string, ng: string) {
    if (kt && ng) setTuan(await lichTuanKyThuat(kt, ng)); else setTuan(null)
  }
  async function baoNghi() {
    if (!ktId || !ngay) return
    const r = await taoNghiKyThuat(ktId, ngay); if (r.ok) loadTuan(ktId, ngay)
  }
  async function boNghi(id: string) {
    const r = await xoaNghiKyThuat(id); if (r.ok) loadTuan(ktId, ngay)
  }
  const [khachId, setKhachId] = useState(prefill?.khachId ?? '')
  const [diaChi, setDiaChi] = useState(prefill?.ctx.dia_chi ?? '')
  const [tinh, setTinh] = useState(prefill?.ctx.tinh ?? '')
  const [capMay, setCapMay] = useState(false)   // cập nhật địa chỉ mới cho máy của khách
  const [ghiChu, setGhiChu] = useState('')
  const [viec, setViec] = useState<ViecInput[]>(prefill?.viec ?? [{ loai_viec: 'bao_tri', mo_ta: '', ref: '' }])
  const [ctx, setCtx] = useState<BoiCanhKhach | null>(prefill?.ctx ?? null)

  async function chonKhach(id: string) {
    setKhachId(id); setCapMay(false)
    const c = await boiCanhKhach(id)
    setCtx(c)
    if (c.dia_chi) setDiaChi(c.dia_chi)   // địa chỉ: máy -> khách -> tự điền
    if (c.tinh) setTinh(c.tinh)
  }

  function setViecAt(i: number, patch: Partial<ViecInput>) {
    setViec((vs) => vs.map((v, j) => (j === i ? { ...v, ...patch } : v)))
  }
  async function taoChuyen() {
    setBusy(true); setErr(null); setMsg(null)
    const r = await taoLichKyThuat({ kyThuatId: ktId, ngay, customerId: khachId || undefined, diaChi: diaChi || undefined, tinh: tinh || undefined, ghiChu: ghiChu || undefined, viec })
    if (!r.ok) { setBusy(false); setErr(r.error); return }
    // Khách chuyển địa chỉ mới -> cập nhật cho máy (có xác nhận).
    let themMsg = ''
    if (capMay && khachId && diaChi.trim()) {
      if (window.confirm(`Cập nhật địa chỉ "${diaChi.trim()}" cho MỌI máy đang lắp của khách này?`)) {
        const r2 = await capNhatDiaChiMay(khachId, diaChi)
        if (r2.ok) themMsg = ` Đã cập nhật địa chỉ ${r2.so} máy.`
      }
    }
    setBusy(false)
    setMsg('Đã tạo chuyến.' + themMsg); setKhachId(''); setCtx(null); setDiaChi(''); setTinh(''); setCapMay(false); setGhiChu(''); setViec([{ loai_viec: 'bao_tri', mo_ta: '', ref: '' }])
    if (ktId && ngay) loadTuan(ktId, ngay)
    router.refresh()
  }


  return (
    <div className="space-y-4">
      {(msg || err) && <p className={`text-sm ${err ? 'text-destructive' : 'text-(--color-text-success)'}`}>{err ?? msg}</p>}

      {/* Tạo chuyến */}
      <Card className="space-y-3">
        <h2 className="font-medium text-foreground">Gán chuyến đi cho kỹ thuật</h2>
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-48 max-w-full space-y-1 text-xs text-muted-foreground">
            <span>Kỹ thuật</span>
            <Combobox aria-label="Kỹ thuật" value={ktId || null}
              options={dsKt.filter((k) => k.hoat_dong).map((k) => ({ gt: k.id, nhan: k.ten + (k.la_ctv ? ' (CTV)' : ''), anMa: true }))}
              onValueChange={(id) => { setKtId(id ?? ''); loadTuan(id ?? '', ngay) }} />
          </div>
          <label className="text-xs text-muted-foreground">Ngày<br />
            <Input type="date" value={ngay} onChange={(e) => { setNgay(e.target.value); loadTuan(ktId, e.target.value) }} className="mt-0.5" />
          </label>
          <label className="text-xs text-muted-foreground">Tỉnh/TP<br />
            {/* Dùng CHUNG `ChonTinh` như mọi màn khác, thay vì tự dựng `<select>` 64 mục ở đây.
                Tự dựng là (a) vi phạm luật ">10 mục phải gõ để tìm" và (b) khi `ChonTinh` được
                nâng cấp thì chỗ này không hưởng — đúng thứ đã xảy ra hôm 22/08. */}
            <ChonTinh value={tinh} onChange={setTinh} />
          </label>
          <label className="text-xs text-muted-foreground flex-1 min-w-40">Địa chỉ (tự theo máy → khách; sửa được)<br />
            <Input value={diaChi} onChange={(e) => setDiaChi(e.target.value)} className="mt-0.5 w-full" />
          </label>
        </div>
        {tuan && ktId && (
          <div className="rounded-lg border bg-muted p-2 text-xs">
            <p className="text-muted-foreground mb-1">
              Lịch tuần của kỹ thuật ({vnDate(tuan.tu)} – {vnDate(tuan.den)}): {tuan.chuyen.length} chuyến · {tuan.nghi.length} ngày nghỉ
              <Button onClick={baoNghi} className="text-(--color-text-warning) underline ml-2">Báo nghỉ ngày {vnDate(ngay)}</Button>
            </p>
            {tuan.chuyen.length === 0 && tuan.nghi.length === 0 ? (
              <p className="text-muted-foreground">Trống — rảnh cả tuần.</p>
            ) : (
              <ul className="space-y-0.5">
                {tuan.nghi.map((n) => (
                  <li key={n.id} className="text-(--color-text-warning)">🌙 {vnDate(n.ngay)}: nghỉ phép{n.ly_do ? ` (${n.ly_do})` : ''} <Button onClick={() => boNghi(n.id)} className="text-muted-foreground underline">bỏ</Button></li>
                ))}
                {tuan.chuyen.map((c) => (
                  <li key={c.id} className="text-muted-foreground">📅 {vnDate(c.ngay)}: {c.ten_khach ?? c.dia_chi ?? 'chuyến'} · {c.viec.map((v) => NHAN_LOAI_VIEC[v.loai_viec] ?? v.loai_viec).join(', ')}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {khachId && diaChi.trim() && ctx?.dia_chi !== diaChi.trim() && (
          <label className="flex items-center gap-1.5 text-xs text-(--color-text-warning)">
            <input type="checkbox" checked={capMay} onChange={(e) => setCapMay(e.target.checked)} />
            Khách chuyển địa chỉ mới — cập nhật địa chỉ này cho máy của khách (sẽ hỏi xác nhận)
          </label>
        )}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Khách (chọn để tự lấy địa chỉ + bộ/máy/ticket):</p>
          {khachId ? <p className="text-xs text-(--color-text-success)">✓ đã chọn <Button onClick={() => { setKhachId(''); setCtx(null) }} className="underline text-muted-foreground ml-1">bỏ</Button></p> : <KhachPicker onPick={(id) => chonKhach(id)} />}
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Việc trong chuyến (1 chuyến nhiều việc):</p>
          {viec.map((v, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <NativeSelect aria-label="Loại việc" value={v.loai_viec} onChange={(e) => setViecAt(i, { loai_viec: e.target.value, ref: '', mo_ta: '', so_tien: undefined })}>
                {LOAI_VIEC_KT.map((l) => <NativeSelectOption key={l.v} value={l.v}>{l.nhan}</NativeSelectOption>)}
              </NativeSelect>
              {v.loai_viec === 'bao_tri' && ctx && ctx.visits.length > 0 ? (
                <div className="min-w-0 flex-[1_1_192px]">
                  <Combobox aria-label="Lượt bảo trì" value={v.ref || null} placeholder="Chọn lượt bảo trì"
                    options={ctx.visits.map((vs) => ({ gt: vs.id, nhan: vs.nhan, anMa: true }))}
                    onValueChange={(id) => setViecAt(i, { ref: id ?? '', mo_ta: ctx.visits.find((x) => x.id === id)?.nhan ?? '' })} />
                </div>
              ) : v.loai_viec === 'thay_loi' && ctx && ctx.machines.length > 0 ? (
                <>
                  <div className="min-w-0 flex-[1_1_192px]">
                    <Combobox aria-label="Máy" value={v.ref || null} placeholder="Chọn máy"
                      options={ctx.machines.map((m) => ({ gt: m.serial, nhan: m.nhan, phu: m.dia_chi ?? undefined }))}
                      onValueChange={(id) => setViecAt(i, { ref: id ?? '', mo_ta: '' })} />
                  </div>
                  {v.ref && (() => {
                    const loi = ctx.machines.find((m) => m.serial === v.ref)?.loi ?? []
                    return loi.length > 0 ? (
                      <div className="min-w-0 flex-[1_1_160px]">
                        <Combobox aria-label="Lõi cần thay" value={v.mo_ta || null} placeholder="Chọn lõi cần thay"
                          options={loi.map((l) => ({ gt: `${l.ten ?? l.code} (${l.code})`, nhan: l.ten ?? l.code, phu: l.code, anMa: true }))}
                          onValueChange={(id) => setViecAt(i, { mo_ta: id ?? '' })} />
                      </div>
                    ) : (
                      <Input value={v.mo_ta ?? ''} onChange={(e) => setViecAt(i, { mo_ta: e.target.value })} placeholder="Lõi cần thay (máy chưa có danh mục lõi)" className="flex-1 min-w-40" />
                    )
                  })()}
                </>
              ) : v.loai_viec === 'ticket' && ctx && ctx.tickets.length > 0 ? (
                <div className="min-w-0 flex-[1_1_192px]">
                  <Combobox aria-label="Ticket" value={v.ref || null} placeholder="Chọn ticket"
                    options={ctx.tickets.map((t) => ({ gt: t.code, nhan: t.nhan }))}
                    onValueChange={(id) => setViecAt(i, { ref: id ?? '', mo_ta: ctx.tickets.find((t) => t.code === id)?.nhan ?? '' })} />
                </div>
              ) : v.loai_viec === 'thu_tien' ? (
                <>
                  <Input type="number" value={v.so_tien ?? ''} onChange={(e) => setViecAt(i, { so_tien: Number(e.target.value) || undefined })} placeholder="Số tiền (VND)" className="w-36" />
                  <Input value={v.mo_ta ?? ''} onChange={(e) => setViecAt(i, { mo_ta: e.target.value })} placeholder="Nội dung thu (tuỳ chọn)" className="flex-1 min-w-40" />
                </>
              ) : (
                <Input value={v.mo_ta ?? ''} onChange={(e) => setViecAt(i, { mo_ta: e.target.value })}
                  placeholder={v.loai_viec === 'khac' ? 'Ghi cụ thể việc gì (bắt buộc)' : 'Mô tả (tuỳ chọn)'} className="flex-1 min-w-48" />
              )}
              {viec.length > 1 && <Button onClick={() => setViec((vs) => vs.filter((_, j) => j !== i))} variant="ghost" size="icon-sm" aria-label={`Bỏ việc ${i + 1}`} className="text-destructive">✕</Button>}
            </div>
          ))}
          <Button onClick={() => setViec((vs) => [...vs, { loai_viec: 'khac', mo_ta: '', ref: '' }])} variant="ghost" size="sm">+ thêm việc</Button>
          {!khachId && <p className="text-[11px] text-amber-500">Chọn khách ở trên để hiện danh sách bộ/máy/ticket cho từng việc (không chọn vẫn nhập tay được).</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} placeholder="Ghi chú chuyến (tuỳ chọn)" className="flex-1" />
          <Button disabled={busy || !ktId} onClick={taoChuyen} size="sm">Tạo chuyến</Button>
        </div>
      </Card>

      {/* Danh sách thợ: chỉ xem. Sửa ở trang Danh sách người. */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-medium text-foreground">Kỹ thuật ({dsKt.filter((k) => k.hoat_dong).length})</h2>
          {suaDs && <Link href="/danh-sach-nguoi?tab=kt" className="text-(--color-text-info) underline underline-offset-2">Sửa danh sách →</Link>}
        </div>
        <ul className="divide-y border rounded-lg">
          {dsKt.filter((k) => k.hoat_dong).map((k) => (
            <li key={k.id} className="px-3 py-2 text-sm">
              <span className="text-foreground">{k.ten}</span>
              {k.la_ctv && <span className="text-[11px] text-violet-600 ml-1">CTV</span>}
              {k.sdt && <span className="text-xs text-muted-foreground font-mono ml-1">· {k.sdt}</span>}
            </li>
          ))}
          {dsKt.length === 0 && <li className="px-3 py-4 text-sm text-muted-foreground">Chưa có kỹ thuật.</li>}
        </ul>
      </Card>
    </div>
  )
}
