'use client'

import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { Checkbox, ChoiceLabel } from '@/components/ui/checkbox'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  comboChon, linhKienCombo, serialsTheoMay, lapBoCombo,
  type LinhKienCombo, type SerialKho, type KhachTom,
} from '@/app/actions'
import { ChonTinh } from '@/components/ChonTinh'
import { KhachPicker } from '@/components/KhachPicker'
import { SerialRo } from '@/components/SerialRo'

const HOM_NAY = () => new Date().toISOString().slice(0, 10)

/** Ô chọn serial tồn kho cho 1 thiết bị của bộ (lọc theo mã nội bộ, chưa kích hoạt BH).
 *  Chọn từ danh sách HOẶC gõ số CUỐI để tìm (gõ 123 -> ưu tiên serial kết thúc 123). */
function ChonSerialThietBi({
  internalCode, ten, value, onChange,
}: { internalCode: string; ten: string | null; value: string; onChange: (serial: string) => void }) {
  const [ds, setDs] = useState<SerialKho[]>([])
  const [tai, setTai] = useState(true)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  // Keyed theo slot ở parent -> mỗi thiết bị là một instance riêng, effect chỉ chạy 1
  // lần lúc mount. Không setState đồng bộ trong thân effect (eslint chặn).
  useEffect(() => {
    let song = true
    serialsTheoMay(internalCode).then((r) => { if (song) { setDs(r); setTai(false) } })
    return () => { song = false }
  }, [internalCode])

  const kq = q.trim().toLowerCase()
  const loc = (kq
    ? ds.filter((s) => s.serial.toLowerCase().includes(kq))
        .sort((a, b) =>
          (a.serial.toLowerCase().endsWith(kq) ? 0 : 1) - (b.serial.toLowerCase().endsWith(kq) ? 0 : 1))
    : ds
  ).slice(0, 12)

  function go(v: string) {
    setQ(v); setOpen(true)
    // Gõ trúng nguyên serial tồn kho -> nhận luôn; chưa trúng thì bỏ chọn.
    const hit = ds.find((s) => s.serial.toLowerCase() === v.trim().toLowerCase())
    onChange(hit ? hit.serial : '')
  }
  function chon(s: SerialKho) { setQ(s.serial); setOpen(false); onChange(s.serial) }

  return (
    <div className="rounded-lg border p-3 bg-card space-y-1">
      <div className="text-sm font-medium text-foreground">{ten ?? internalCode}</div>
      <div className="tabular-nums text-[11px] text-muted-foreground">{internalCode}</div>
      {tai ? (
        <p className="text-xs text-muted-foreground">Đang tải serial…</p>
      ) : ds.length === 0 ? (
        <p className="text-xs text-(--color-text-warning) bg-(--color-background-warning-surface) rounded px-2 py-1">
          Không còn serial tồn kho cho thiết bị này — nhập kho trước.
        </p>
      ) : (
        <div className="relative">
          <Input value={q} onChange={(e) => go(e.target.value)}
            onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder={`Chọn hoặc gõ số CUỐI serial (còn ${ds.length})…`}
            className={`w-full rounded-lg border px-3 py-2 text-sm bg-card tabular-nums text-foreground ${value ? 'border-(--color-border-success-surface)' : ''}`} />
          {open && loc.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-lg border bg-card shadow-lg">
              {loc.map((s) => (
                <li key={s.serial}>
                  <Button type="button" variant="ghost" size="sm" shape="rounded"
                    onMouseDown={(e) => e.preventDefault()} onClick={() => chon(s)}
                    className="h-auto w-full justify-start py-1.5 text-left leading-5 whitespace-normal [overflow-wrap:anywhere] tabular-nums">
                    {s.serial}
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {value && <div className="text-xs text-muted-foreground mt-1">Đã chọn: <SerialRo serial={value} /></div>}
        </div>
      )}
    </div>
  )
}

export function LapBoForm() {
  const router = useRouter()
  const [combos, setCombos] = useState<{ combo: string; ten: string | null }[]>([])
  const [combo, setCombo] = useState('')
  const [linhKien, setLinhKien] = useState<LinhKienCombo[]>([])
  const [chon, setChon] = useState<Record<string, string>>({})   // internal_code -> serial
  // Thiết bị đánh dấu "Chưa có serial" (18/11): vẫn lắp + kích hoạt BH, app cấp mã tạm, bổ sung serial sau.
  const [chuaSerial, setChuaSerial] = useState<Record<string, boolean>>({})
  const [soChoSerial, setSoChoSerial] = useState(0)
  const [khachId, setKhachId] = useState('')
  const [khachAddr, setKhachAddr] = useState<string | null>(null)
  const [dungDcKhach, setDungDcKhach] = useState(true)
  const [dcLap, setDcLap] = useState('')
  const [tinhLap, setTinhLap] = useState('')
  const [ngay, setNgay] = useState(HOM_NAY())
  const [busy, setBusy] = useState(false)
  const [maBo, setMaBo] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => { comboChon().then(setCombos) }, [])

  function chonCombo(c: string) {
    setCombo(c); setChon({}); setChuaSerial({}); setLinhKien([]); setErr(null); setMaBo(null)
    if (c) linhKienCombo(c).then(setLinhKien)
  }
  function chonKhach(id: string, _nhan: string, k?: KhachTom) {
    setKhachId(id); setKhachAddr(k?.address ?? null)
  }

  // Mở rộng linh kiện thành SLOT theo số lượng (ECO có 2× UPF10 -> 2 slot cùng mã).
  const slots = useMemo(() => linhKien.flatMap((lk) =>
    Array.from({ length: lk.so_luong }, (_, i) => ({
      key: `${lk.internal_code}#${i}`,
      internal_code: lk.internal_code,
      ten: lk.so_luong > 1 ? `${lk.ten ?? lk.internal_code} (${i + 1}/${lk.so_luong})` : lk.ten,
    }))), [linhKien])

  // Tỉnh là ô riêng trên giao diện cho CS khỏi gõ lẫn, nhưng `installed_base` chỉ
  // có MỘT cột địa chỉ chữ trơn — nên ghép lại khi lưu thay vì đổi schema.
  const dcLapCuoi = dungDcKhach
    ? (khachAddr ?? '')
    : [dcLap.trim(), tinhLap.trim()].filter(Boolean).join(', ')
  const duSerial = slots.length > 0 && slots.every((s) => chuaSerial[s.key] || (chon[s.key] ?? '').trim())
  const sanSang = !!combo && !!khachId && duSerial && /^\d{4}-\d{2}-\d{2}$/.test(ngay)

  const tienMa = useMemo(() => {
    if (!combo || !/^\d{4}-\d{2}-\d{2}$/.test(ngay)) return null
    const [y, m] = ngay.split('-')
    return `${combo}${y}${m}###`
  }, [combo, ngay])

  async function luu() {
    setBusy(true); setErr(null); setMaBo(null)
    const r = await lapBoCombo({
      combo, customer_id: khachId, install_date: ngay,
      install_address: dcLapCuoi.trim() || undefined,
      serials: slots.map((s) => ({ internal_code: s.internal_code, serial: chon[s.key] ?? '', chua_serial: !!chuaSerial[s.key] })),
    })
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    setMaBo(r.ma_bo); setSoChoSerial(r.so_chua_serial)
    setCombo(''); setLinhKien([]); setChon({}); setChuaSerial({}); setKhachId(''); setKhachAddr(null)
    setDcLap(''); setTinhLap(''); setDungDcKhach(true); setNgay(HOM_NAY())
    router.refresh()
  }

  return (
    <div className="bg-card rounded-(--radius-xl) border p-5 space-y-4 max-w-2xl">
      {/* 1. Combo */}
      <div>
        <label htmlFor="lap-bo-kieu" className="text-sm font-medium">1. Bộ hệ thống (combo)</label>
        <Combobox id="lap-bo-kieu" value={combo || null} placeholder="Chọn bộ" searchPlaceholder="Gõ tên hoặc mã bộ…"
          options={combos.map((c) => ({ gt: c.combo, nhan: c.ten ? `${c.ten} (${c.combo})` : c.combo }))}
          onValueChange={(code) => chonCombo(code ?? '')}
        />
        {tienMa && <p className="text-xs text-muted-foreground mt-1">Mã bộ sẽ sinh dạng <span className="tabular-nums">{tienMa.replace('###', 'xxx')}</span></p>}
      </div>

      {/* 2. Serial từng thiết bị (mỗi slot 1 serial; ECO có 2× UPF10) */}
      {slots.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <label className="text-sm font-medium text-foreground">2. Serial thiết bị ({slots.length})</label>
            <Button variant="ghost" size="sm" type="button" className="text-xs underline text-muted-foreground"
              onClick={() => setChuaSerial(Object.fromEntries(slots.map((s) => [s.key, true])))}>
              Chưa có serial cả bộ
            </Button>
          </div>
          {slots.map((s) => (
            <div key={s.key} className="space-y-1">
              {chuaSerial[s.key] ? (
                <p className="text-sm rounded-lg border border-(--color-border-warning-surface) bg-(--color-background-warning-surface) px-3 py-2 text-(--color-text-warning)">
                  <strong>{s.ten ?? s.internal_code}</strong> — chưa có serial: app cấp mã tạm, bổ sung serial sau ở trang máy.
                </p>
              ) : (
                <ChonSerialThietBi internalCode={s.internal_code} ten={s.ten}
                  value={chon[s.key] ?? ''}
                  onChange={(v) => setChon((p) => ({ ...p, [s.key]: v }))} />
              )}
              <ChoiceLabel>
                <Checkbox checked={!!chuaSerial[s.key]}
                  onCheckedChange={(v) => setChuaSerial((p) => ({ ...p, [s.key]: v === true }))} />
                Chưa có serial — kích hoạt trước, bổ sung sau
              </ChoiceLabel>
            </div>
          ))}
        </div>
      )}

      {/* 3. Khách */}
      <div>
        <label className="text-sm font-medium text-foreground">3. Khách hàng</label>
        <p className="text-xs text-muted-foreground mb-1">Tìm khách đã có; không có thì tạo mới (admin duyệt sau).</p>
        <KhachPicker onPick={chonKhach} />
      </div>

      {/* 4. Địa chỉ */}
      <div>
        <label className="text-sm font-medium text-foreground">4. Địa chỉ lắp đặt</label>
        <p className="text-xs text-muted-foreground">Địa chỉ khách: {khachAddr || '—'}</p>
        {/* Hỏi theo chiều KHẲNG ĐỊNH — xem chú thích cùng khối ở DangKyBHForm. */}
        <ChoiceLabel className="mt-1">
          <Checkbox checked={!dungDcKhach} onCheckedChange={(v) => setDungDcKhach(v !== true)} />
          Địa chỉ lắp khác địa chỉ khách
        </ChoiceLabel>
        {!dungDcKhach && (
          <>
            <Input value={dcLap} onChange={(e) => setDcLap(e.target.value)} placeholder="Số nhà, thôn/xã, quận/huyện…"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-foreground" />
            <div className="mt-2">
              <span className="text-sm font-medium text-foreground">Tỉnh / TP</span>
              <ChonTinh value={tinhLap} onChange={setTinhLap} />
              <p className="text-xs text-muted-foreground mt-1">
                Ô riêng để khỏi gõ lẫn vào địa chỉ — địa chỉ lắp có thể khác địa chỉ khách.
              </p>
            </div>
          </>
        )}
      </div>

      {/* 5. Ngày bắt đầu BH */}
      <label className="block">
        <span className="text-sm font-medium text-foreground">5. Ngày bắt đầu bảo hành</span>
        <Input type="date" value={ngay} max={HOM_NAY()} onChange={(e) => setNgay(e.target.value)}
          className="mt-1 block rounded-lg border px-3 py-2 text-sm text-foreground" />
      </label>

      <div className="flex items-center gap-3">
        <Button onClick={luu} loading={busy} disabled={!sanSang}>
          {busy ? 'Đang lắp…' : 'Lắp bộ + kích hoạt bảo hành'}
        </Button>
        {err && <span className="text-sm text-(--color-text-danger)">{err}</span>}
      </div>

      {maBo && (
        <p className="text-sm bg-(--color-background-success-surface) text-(--color-text-success) rounded-lg px-3 py-2">
          ✅ Đã lắp bộ <span className="tabular-nums font-medium">{maBo}</span> + kích hoạt BH từng thiết bị.
          {soChoSerial > 0 && <> {soChoSerial} thiết bị <strong>chờ bổ sung serial</strong> — xem ở Bảo hành › Chờ kích hoạt BH.</>}
        </p>
      )}
    </div>
  )
}
