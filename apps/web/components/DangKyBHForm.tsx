'use client'

import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox, ChoiceLabel } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CaretDown } from '@phosphor-icons/react/ssr'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  dangKyBaoHanh, dsMayCoSerial, serialsTheoMay, serialInfo,
  type SerialKho, type MayKho, type KhachTom, type CatalogChon,
} from '@/app/actions'
import { DO_CHAC_NGAY_LAP, NHAN_DO_CHAC, type DoChacNgayLap } from '@/lib/danhSach'
import { SerialPicker } from '@/components/SerialPicker'
import { KhachPicker } from '@/components/KhachPicker'
import { ChonCatalog } from '@/components/ChonCatalog'
import { ChonTinh } from '@/components/ChonTinh'
import Link from 'next/link'
import { dsMayCatalog, kichHoatChuaSerial } from '@/app/may/chua-serial-actions'
import { hienNgay } from '@/lib/dinh-dang-ngay'

const HOM_NAY = () => new Date().toISOString().slice(0, 10)

const vn = (d: string | null) => hienNgay(d)

/**
 * Đăng ký + kích hoạt bảo hành (Đợt 1).
 *  · Chọn MÁY trước -> serial lọc theo máy (còn chưa kích hoạt), hoặc
 *  · Gõ SERIAL trước -> tự soi máy + trạng thái (đã kích hoạt cho ai chưa).
 *  · Địa chỉ khách + địa chỉ lắp (tick dùng chung). Ngày bắt đầu bảo hành.
 *  · "Chưa có serial" (18/11): chọn máy → kích hoạt luôn, app cấp mã tạm TAM…, bổ sung serial sau ở trang máy.
 */
export function DangKyBHForm() {
  const [dsMay, setDsMay] = useState<MayKho[]>([])
  const [mayCode, setMayCode] = useState('')            // '' = chưa chọn máy -> gõ serial tự do
  const [serialList, setSerialList] = useState<SerialKho[] | null>(null)
  const [loiSerial, setLoiSerial] = useState(false)
  const [lanTaiSerial, setLanTaiSerial] = useState(0)
  const [serial, setSerial] = useState('')
  const [serialQ, setSerialQ] = useState('')        // ô gõ tìm serial (khi đã chọn máy)
  const [serialOpen, setSerialOpen] = useState(false)
  const [info, setInfo] = useState<SerialKho | null>(null)
  const [chuaSerial, setChuaSerial] = useState(false)
  const [dsMayDu, setDsMayDu] = useState<CatalogChon[] | null>(null)   // mọi máy (kể cả hết serial kho) — tải khi cần
  const [maTam, setMaTam] = useState<string | null>(null)

  const [khachId, setKhachId] = useState('')
  const [khachAddr, setKhachAddr] = useState<string | null>(null)
  const [dungDcKhach, setDungDcKhach] = useState(true)
  const [dcLap, setDcLap] = useState('')
  const [tinhLap, setTinhLap] = useState('')

  const [ngay, setNgay] = useState(HOM_NAY())
  const [doChac, setDoChac] = useState<DoChacNgayLap>('chinh_xac')
  const [ghiChu, setGhiChu] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  // Tải danh sách máy 1 lần
  useEffect(() => {
    let song = true
    dsMayCoSerial().then((r) => { if (song) setDsMay(r) })
    return () => { song = false }
  }, [])

  // Chọn máy -> tải serial của máy đó (chỉ chạy khi có mayCode; clear làm ở handler)
  useEffect(() => {
    if (!mayCode || chuaSerial) return
    let song = true
    serialsTheoMay(mayCode)
      .then((r) => { if (song) setSerialList(r) })
      .catch(() => { if (song) setLoiSerial(true) })
    return () => { song = false }
  }, [mayCode, chuaSerial, lanTaiSerial])

  // Serial thay đổi -> soi trạng thái (debounce; setState chỉ trong callback async)
  useEffect(() => {
    const s = serial.trim()
    if (!s) return
    let song = true
    const id = setTimeout(() => { serialInfo(s).then((r) => { if (song) setInfo(r) }) }, 250)
    return () => { song = false; clearTimeout(id) }
  }, [serial])

  function chonMay(code: string) {
    setMayCode(code); setSerial(''); setSerialQ(''); setSerialOpen(false)
    setInfo(null); setSerialList(null); setLoiSerial(false); setErr(null)
    setLanTaiSerial((luot) => luot + 1)
  }
  function datSerial(v: string) {
    setSerial(v); setErr(null)
    if (!v.trim()) setInfo(null)
  }
  // Gõ tìm serial theo ĐUÔI (gõ 123 -> ưu tiên serial kết thúc bằng 123).
  function goSerial(v: string) {
    setSerialQ(v); setSerialOpen(true)
    const hit = serialList?.find((s) => s.serial === v.trim())
    datSerial(hit ? hit.serial : '')
  }
  function chonSerialTrongList(s: SerialKho) {
    setSerialQ(s.serial); setSerialOpen(false); datSerial(s.serial)
  }
  const q = serialQ.trim().toLowerCase()
  const dsSerial = serialList ?? []
  const serialLoc = (q
    ? dsSerial.filter((s) => s.serial.toLowerCase().includes(q))
        .sort((a, b) =>
          (a.serial.toLowerCase().endsWith(q) ? 0 : 1) - (b.serial.toLowerCase().endsWith(q) ? 0 : 1))
    : dsSerial
  ).slice(0, 12)
  function chonKhach(id: string, _nhan: string, k?: KhachTom) {
    setKhachId(id); setKhachAddr(k?.address ?? null)
  }

  const daKichHoat = info?.bh_kich_hoat === true
  // Tỉnh là ô riêng trên giao diện cho CS khỏi gõ lẫn, nhưng `installed_base` chỉ
  // có MỘT cột địa chỉ chữ trơn — nên ghép lại khi lưu thay vì đổi schema.
  // Dùng địa chỉ khách thì thôi, địa chỉ đó đã có tỉnh của khách rồi.
  const dcLapCuoi = dungDcKhach
    ? (khachAddr ?? '')
    : [dcLap.trim(), tinhLap.trim()].filter(Boolean).join(', ')
  // dsMayCoSerial (v_may_kho) đã LỌC chỉ máy (bỏ lõi/vỏ) -> danh sách typeahead chỉ có máy.
  const catalogMay: CatalogChon[] = useMemo(
    () => chuaSerial && dsMayDu ? dsMayDu : dsMay.map((m) => ({
      internal_code: m.internal_code,
      ten: `${m.ten_noi_bo ?? m.internal_code} (còn ${m.con_lai})`,
      danh_muc: null,
    })), [dsMay, chuaSerial, dsMayDu])

  function datChuaSerial(v: boolean) {
    setChuaSerial(v); setErr(null); setMsg(null); setMaTam(null)
    setSerial(''); setSerialQ(''); setSerialOpen(false); setInfo(null)
    setSerialList(null); setLoiSerial(false)
    if (v && !dsMayDu) dsMayCatalog().then(setDsMayDu).catch(() => setDsMayDu([]))
  }

  async function luu() {
    setBusy(true); setErr(null); setMsg(null); setMaTam(null)
    if (chuaSerial) {
      const t = await kichHoatChuaSerial({
        internal_code: mayCode, customer_id: khachId, install_date: ngay,
        install_address: dcLapCuoi.trim() || undefined, ngay_lap_do_chac: doChac, ghi_chu: ghiChu.trim() || undefined,
      })
      setBusy(false)
      if (!t.ok) { setErr(t.error); return }
      setMsg(`Đã kích hoạt bảo hành — chờ bổ sung serial (mã tạm ${t.serial}).`); setMaTam(t.serial)
      setMayCode(''); setKhachId(''); setKhachAddr(null); setDcLap(''); setTinhLap(''); setDungDcKhach(true); setNgay(HOM_NAY())
      setDoChac('chinh_xac'); setGhiChu('')
      router.refresh()
      return
    }
    const r = await dangKyBaoHanh({
      serial, customer_id: khachId, install_date: ngay,
      install_address: dcLapCuoi.trim() || undefined,
      ngay_lap_do_chac: doChac,
      ghi_chu: ghiChu.trim() || undefined,
    })
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    setMsg(`Đã đăng ký + kích hoạt BH cho serial ${serial}.`)
    setMayCode(''); setSerial(''); setSerialQ(''); setSerialOpen(false); setInfo(null); setSerialList(null)
    setKhachId(''); setKhachAddr(null); setDcLap(''); setTinhLap(''); setDungDcKhach(true); setNgay(HOM_NAY())
    setDoChac('chinh_xac'); setGhiChu('')
    router.refresh()
  }

  const chonThietBi = (
    <ChonCatalog catalog={catalogMay} value={mayCode} onChange={chonMay}
      placeholder="Gõ tên hoặc mã máy…" />
  )

  return (
    <div className="bg-card rounded-(--radius-xl) border p-5 space-y-4 max-w-2xl">
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Thiết bị</h2>
        <ChoiceLabel className="mt-1">
          <Checkbox checked={chuaSerial} onCheckedChange={(v) => datChuaSerial(v === true)} />
          Chưa có serial — kích hoạt bảo hành trước, bổ sung serial sau
        </ChoiceLabel>
        {chuaSerial ? (
          <>
            {chonThietBi}
            <p className="rounded-lg bg-(--color-background-warning-surface) px-3 py-2 text-xs text-(--color-text-warning)">
              Chọn máy để tính hạn bảo hành. App cấp mã tạm <span className="tabular-nums">TAM…</span>.
              Khi có serial, mở hồ sơ máy và chọn <strong>Bổ sung serial</strong>.
            </p>
          </>
        ) : mayCode ? (
          loiSerial ? (
            <div className="flex flex-wrap items-center gap-2">
              <p role="alert" className="text-sm text-(--color-text-danger)">Chưa tải được danh sách serial.</p>
              <Button variant="outline" size="sm" onClick={() => {
                setLoiSerial(false); setSerialList(null); setLanTaiSerial((luot) => luot + 1)
              }}>Tải lại</Button>
            </div>
          ) : serialList === null ? (
            <p role="status" className="text-sm text-muted-foreground">Đang tải serial của máy…</p>
          ) : serialList.length ? (
            <div className="relative mt-1">
              <Input aria-label="Chọn hoặc tìm serial máy" value={serialQ} onChange={(e) => goSerial(e.target.value)}
                onFocus={() => setSerialOpen(true)}
                onBlur={() => setTimeout(() => setSerialOpen(false), 200)}
                placeholder="Chọn hoặc gõ số CUỐI serial…"
                className="w-full rounded-lg border px-3 py-2 text-sm bg-card tabular-nums text-foreground" />
              {serialOpen && serialLoc.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-lg border bg-card shadow-lg">
                  {serialLoc.map((s) => (
                    <li key={s.serial}>
                      <Button type="button" variant="ghost" size="sm" shape="rounded"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => chonSerialTrongList(s)}
                        className="h-auto w-full justify-start py-1.5 text-left leading-5 whitespace-normal [overflow-wrap:anywhere] tabular-nums">
                        {/* Một span bọc: serial + tên khách chảy cùng dòng, hết chỗ thì xuống dòng (flex con riêng sẽ bóp cột). */}
                        <span>
                          {s.serial}
                          <span className="text-muted-foreground">{s.ten_khach ? ` · đã lắp: ${s.ten_khach}` : ' · tồn kho'}</span>
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-sm bg-(--color-background-warning-surface) text-(--color-text-warning) rounded-lg px-3 py-2 mt-1">
              Máy này không còn serial nào chưa kích hoạt trong kho.
            </p>
          )
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-1">Gõ serial; chưa có thì tạo chờ duyệt.</p>
            <div className="flex"><SerialPicker value={serial} onChange={datSerial} placeholder="Gõ serial…" /></div>
          </>
        )}

        {!chuaSerial && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button size="sm" variant="outline">
                {mayCode ? `Máy đang lọc: ${mayCode}` : 'Lọc serial theo máy'} <CaretDown aria-hidden />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">{chonThietBi}</CollapsibleContent>
          </Collapsible>
        )}

        {/* Soi trạng thái serial */}
        {serial.trim() && info && (
          <div className={
            'mt-2 text-sm rounded-lg px-3 py-2 ' +
            (daKichHoat ? 'bg-(--color-background-danger-surface) text-(--color-text-danger)'
              : info.trang_thai === 'da_lap_chua_kich_hoat' ? 'bg-(--color-background-warning-surface) text-(--color-text-warning)'
              : 'bg-(--color-background-success-surface) text-(--color-text-success)')
          }>
            <div className="font-medium">{info.ten_noi_bo ?? info.ma_noi_bo ?? '—'}
              <span className="font-normal text-muted-foreground"> · mã {info.ma_noi_bo ?? '—'}</span>
            </div>
            {daKichHoat ? (
              <div>⛔ ĐÃ kích hoạt BH cho <strong>{info.ten_khach ?? '—'}</strong>
                {info.ngay_lap && <> (ngày {vn(info.ngay_lap)})</>} — không đăng ký lại.</div>
            ) : info.trang_thai === 'da_lap_chua_kich_hoat' ? (
              <div>Đã lắp cho <strong>{info.ten_khach ?? '—'}</strong> nhưng chưa kích hoạt BH.</div>
            ) : (
              <div>Tồn kho — đăng ký được.</div>
            )}
          </div>
        )}
        {serial.trim() && !info && (
          <p className="mt-2 text-xs text-muted-foreground">Serial chưa có trong kho — sẽ tạo tự do khi đăng ký.</p>
        )}
      </section>

      {/* Khách */}
      <div>
        <label className="text-sm font-medium text-foreground">Khách hàng</label>
        <p className="text-xs text-muted-foreground mb-1">Tìm khách đã có; không có thì tạo mới (admin duyệt sau).</p>
        <KhachPicker onPick={chonKhach} onClear={() => { setKhachId(''); setKhachAddr(null) }} />
      </div>

      {/* 4. Địa chỉ */}
      <div>
        <label className="text-sm font-medium text-foreground">Địa chỉ lắp đặt</label>
        <p className="text-xs text-muted-foreground">Địa chỉ khách: {khachAddr || '—'}</p>
        {/* Hỏi theo chiều KHẲNG ĐỊNH: mặc định lắp tại nhà khách, tick khi khác.
            Bản trước hỏi ngược ("dùng địa chỉ khách", mặc định đã tick) nên tick
            vào lại làm ẩn mất ô nhập — đúng ngược ý người dùng đang định làm. */}
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
      <div>
        <label className="block">
          <span className="text-sm font-medium text-foreground">Ngày bắt đầu bảo hành</span>
          <Input type="date" value={ngay} max={HOM_NAY()} onChange={(e) => setNgay(e.target.value)}
            className="mt-1 block rounded-lg border px-3 py-2 text-sm text-foreground" />
        </label>

        {/* Khách chỉ liên hệ lúc máy hỏng thì thường không nhớ ngày lắp. Vẫn phải
            điền một ngày (bảo hành + lịch bảo trì + lịch thay lõi đều tính từ đó),
            nhưng đánh dấu rõ đây là ngày đoán để sau này đọc còn biết. */}
        <div className="mt-2">
          <span className="text-sm font-medium text-foreground">Ngày này chắc tới đâu?</span>
          <NativeSelect aria-label="Độ chắc chắn của ngày bắt đầu bảo hành" value={doChac} onChange={(e) => setDoChac(e.target.value as DoChacNgayLap)}
            className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-foreground bg-card">
            {DO_CHAC_NGAY_LAP.map((k) => <NativeSelectOption key={k} value={k}>{NHAN_DO_CHAC[k]}</NativeSelectOption>)}
          </NativeSelect>
          {doChac !== 'chinh_xac' && (
            <>
              <Textarea aria-label="Ghi chú về ngày bắt đầu bảo hành" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} rows={2}
                placeholder="Khách nói gì? vd: chỉ nhớ mùa hè năm ngoái · lấy theo ngày hoá đơn đại lý"
                className="mt-2 w-full rounded-lg border px-3 py-2 text-sm text-foreground" />
              <p className="text-xs text-(--color-text-warning) mt-1">
                Hạn bảo hành vẫn tính từ ngày trên, nhưng máy sẽ hiện nhãn
                “{NHAN_DO_CHAC[doChac].toLowerCase()}” để người sau biết mà kiểm lại.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={luu} loading={busy}
          disabled={!khachId || (chuaSerial ? !mayCode : (!serial.trim() || daKichHoat))}>
          {busy ? 'Đang đăng ký…' : chuaSerial ? 'Kích hoạt bảo hành (chưa có serial)' : 'Đăng ký + kích hoạt bảo hành'}
        </Button>
        {!chuaSerial && daKichHoat && <span className="text-sm text-(--color-text-danger)">Serial đã kích hoạt — chọn serial khác.</span>}
        {msg && <span className="text-sm text-(--color-text-success)">{msg}{maTam && <> · <Link className="underline" href={`/may/${encodeURIComponent(maTam)}`}>mở máy</Link></>}</span>}
        {err && <span className="text-sm text-(--color-text-danger)">{err}</span>}
      </div>
    </div>
  )
}
