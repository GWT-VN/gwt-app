'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { datTrangThaiLichKT, ghiKetQuaBaoTri, type KetQuaDo, type LichKyThuatRow, type LoaiMay } from '@/app/actions'
import { NHAN_LOAI_VIEC } from '@/lib/danhSach'
import { docBoSo } from '@/lib/so'
import { vnDate } from '@/components/Badge'
import { AnhViec } from '@/components/AnhViec'

const HOM_NAY = () => new Date().toISOString().slice(0, 10)

const MAU_TT: Record<string, string> = {
  hen: 'bg-(--color-background-info-surface) text-(--color-text-info)', xong: 'bg-(--color-background-success-surface) text-(--color-text-success-surface)', huy: 'bg-muted text-muted-foreground line-through',
}
const NHAN_TT: Record<string, string> = { hen: 'Đã hẹn', xong: 'Xong', huy: 'Huỷ' }

// Các cột số của KetQuaDo (trước/sau lọc) — tách riêng để index động không bị suy về never.
type SoField = 'tds_truoc' | 'tds_sau' | 'ph_truoc' | 'ph_sau' | 'do_cung_truoc' | 'do_cung_sau' | 'clo_truoc' | 'clo_sau'

// Chỉ tiêu đo. t = cột trước lọc (đầu vào, dùng chung 1 điểm), s = cột sau lọc (riêng từng máy).
type ChiTieu = { key: string; nhan: string; t: SoField; s: SoField }
const TDS: ChiTieu = { key: 'tds', nhan: 'TDS (ppm)', t: 'tds_truoc', s: 'tds_sau' }
const PH: ChiTieu = { key: 'ph', nhan: 'pH', t: 'ph_truoc', s: 'ph_sau' }
const DO_CUNG: ChiTieu = { key: 'do_cung', nhan: 'Độ cứng', t: 'do_cung_truoc', s: 'do_cung_sau' }
const CLO: ChiTieu = { key: 'clo', nhan: 'Clo dư', t: 'clo_truoc', s: 'clo_sau' }

// POU (máy uống) đo TDS + pH; POE (lọc tổng) đo độ cứng + Clo; không rõ -> đủ 4.
function chiTieuTheoLoai(mmloai: LoaiMay): ChiTieu[] {
  if (mmloai === 'POU') return [TDS, PH]
  if (mmloai === 'POE') return [DO_CUNG, CLO]
  return [TDS, PH, DO_CUNG, CLO]
}

/**
 * Giữ NGUYÊN CHUỖI người gõ, không parse ngay từng phím.
 *
 * Trước đây map này là `number`: gõ "7." -> Number("7.") = 7 -> ô render lại
 * thành "7", dấu chấm bay mất nên KHÔNG TÀI NÀO gõ được pH 7.5. Chỉ đổi sang
 * số ở bước lưu.
 */
type SoMap = Partial<Record<SoField, string>>

/** Đo nước cho 1 việc bảo trì. "Trước lọc" dùng chung `truoc` cả chuyến; "sau lọc" riêng máy này. */
function DoNuocViec({
  visitId, mmloai, truoc, setTruoc, doNuoc,
}: {
  visitId: string; mmloai: LoaiMay; truoc: SoMap; setTruoc: (f: (c: SoMap) => SoMap) => void
  /** Chỉ số ĐÃ đo lần trước — mở form ra là thấy lại, không phải gõ lại từ đầu. */
  doNuoc?: import('@/app/actions').DoNuoc | null
}) {
  const router = useRouter()
  const [mo, setMo] = useState(false)
  const [ngay, setNgay] = useState(HOM_NAY())
  // Đổ lại số SAU lọc đã lưu. Số TRƯỚC lọc dùng chung cả chuyến nên do màn cha giữ.
  const [sau, setSau] = useState<SoMap>(() => {
    const o: SoMap = {}
    if (!doNuoc) return o
    const g = (k: SoField, v: number | null) => { if (v !== null && v !== undefined) o[k] = String(v) }
    g('tds_sau', doNuoc.tds_sau); g('ph_sau', doNuoc.ph_sau)
    g('do_cung_sau', doNuoc.do_cung_sau); g('clo_sau', doNuoc.clo_sau)
    return o
  })
  const [ghiChu, setGhiChu] = useState(doNuoc?.ket_qua_ghi_chu ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const ct = chiTieuTheoLoai(mmloai)

  async function luu() {
    setErr(null); setMsg(null)
    // Chỉ đọc ô của ĐÚNG loại máy này — ô của chỉ tiêu đang ẩn không được xét, kẻo một
    // số cũ còn sót trong state lại chặn nút Lưu bằng lỗi trỏ vào ô không ai nhìn thấy.
    const oCanDoc: Partial<Record<SoField, string>> = {}
    for (const c of ct) { oCanDoc[c.t] = truoc[c.t]; oCanDoc[c.s] = sau[c.s] }
    const doc = docBoSo<SoField>(oCanDoc)
    if (!doc.ok) { setErr(doc.loi); return }
    setBusy(true)
    const kq: KetQuaDo = { ngay, ghi_chu: ghiChu || undefined, ...doc.so }
    const r = await ghiKetQuaBaoTri(visitId, kq)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    // CỐ Ý không hỏi kỹ thuật có dời lịch không: CEO chốt 21/08 là **CS** xác nhận rồi mới đổi.
    // Kỹ thuật đang ở nhà khách, không nắm được lịch hẹn miệng của các lượt sau. Chỉ báo cho
    // biết lịch chưa đụng tới, để không ai tưởng hệ thống đã tự dời.
    setMsg(r.deXuat.length
      ? `Đã lưu kết quả đo. ${r.deXuat.length} lượt sau lệch ngày — CS sẽ xác nhận dời.`
      : 'Đã lưu kết quả đo.')
    router.refresh()
  }

  if (!mo) {
    return (
      <Button onClick={() => setMo(true)} variant="ghost" size="sm">
        + Ghi kết quả đo{mmloai ? ` (${mmloai})` : ''}
      </Button>
    )
  }

  return (
    <div className="bg-card rounded-lg border p-2.5 space-y-1.5 text-xs">
      <label className="flex items-center gap-2 text-muted-foreground">Ngày làm thực tế
        <Input type="date" max={HOM_NAY()} value={ngay} onChange={(e) => setNgay(e.target.value)} className="w-40" />
      </label>
      <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 gap-y-1 items-center">
        <span />
        <span className="text-muted-foreground text-[10px]">trước lọc (đầu vào)</span>
        <span className="text-muted-foreground text-[10px]">sau lọc (máy này)</span>
        {ct.map((c) => (
          <div key={c.key} className="contents">
            <span className="text-muted-foreground">{c.nhan}</span>
            <Input inputMode="decimal" value={truoc[c.t] ?? ''} placeholder="chung điểm" aria-label={`${c.nhan} trước lọc`}
              onChange={(e) => setTruoc((cur) => ({ ...cur, [c.t]: e.target.value }))} />
            <Input inputMode="decimal" value={sau[c.s] ?? ''} placeholder="sau" aria-label={`${c.nhan} sau lọc`}
              onChange={(e) => setSau((cur) => ({ ...cur, [c.s]: e.target.value }))} />
          </div>
        ))}
      </div>
      {mmloai === null && <p className="text-[10px] text-muted-foreground">Không rõ loại máy — hiện đủ 4 chỉ tiêu.</p>}
      <p className="text-[10px] text-muted-foreground">Số lẻ gõ <code>7.9</code> hay <code>7,9</code> đều được.</p>
      <Input value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} placeholder="Ghi chú khác" aria-label="Ghi chú khác" />
      <div className="flex items-center gap-2 pt-0.5">
        <Button onClick={luu} disabled={busy} size="sm">{busy ? 'Đang lưu…' : 'Lưu kết quả'}</Button>
        <Button onClick={() => setMo(false)} variant="ghost" size="sm">Đóng</Button>
        {msg && <span className="text-(--color-text-success)">{msg}</span>}
        {err && <span className="text-destructive">{err}</span>}
      </div>
    </div>
  )
}

/** 1 chuyến của kỹ thuật: các việc + đo nước (chia sẻ chỉ số đầu vào giữa các máy cùng điểm). */
function TripCard({ r, busy, hoanThanh, moLai }: {
  r: LichKyThuatRow; busy: string | null; hoanThanh: (id: string) => void; moLai: (id: string) => void
}) {
  // "Trước lọc" = nước nguồn của điểm này -> dùng chung cho mọi máy trong chuyến.
  const [truoc, setTruoc] = useState<SoMap>({})

  return (
    <li className="bg-card rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {r.customer_id
              ? <Link href={`/khach/${r.customer_id}`} prefetch={false} className="font-medium text-foreground underline">{r.ten_khach ?? 'khách'}</Link>
              : <span className="font-medium text-foreground">{r.ten_khach ?? '—'}</span>}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${MAU_TT[r.trang_thai] ?? ''}`}>{NHAN_TT[r.trang_thai] ?? r.trang_thai}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {r.tinh && <span>{r.tinh}</span>}
            {r.dia_chi && <span>{r.tinh ? ' · ' : ''}{r.dia_chi}</span>}
            {!r.tinh && !r.dia_chi && <span className="text-muted-foreground">chưa có địa chỉ</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-none">
          {r.trang_thai !== 'xong'
            ? <Button disabled={busy === r.id} onClick={() => hoanThanh(r.id)} size="sm">{busy === r.id ? '…' : '✓ Hoàn thành chuyến'}</Button>
            : <Button disabled={busy === r.id} onClick={() => moLai(r.id)} variant="ghost" size="sm">mở lại</Button>}
        </div>
      </div>

      <ul className="mt-2.5 space-y-2">
        {r.viec.map((v, i) => (
          <li key={i} className="rounded-lg bg-muted border px-3 py-2">
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className={`px-1.5 py-0.5 rounded text-[11px] ${v.loai_viec === 'thu_tien' ? 'bg-(--color-background-warning-surface) text-(--color-text-warning-surface)' : 'bg-muted text-foreground'}`}>{NHAN_LOAI_VIEC[v.loai_viec] ?? v.loai_viec}</span>
              {v.loai_viec === 'bao_tri' && v.mmloai && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-(--color-background-info-surface) text-(--color-text-info-surface)">{v.mmloai === 'POU' ? 'Máy uống (POU)' : 'Lọc tổng (POE)'}</span>}
              {v.mo_ta && <span className="text-foreground">{v.mo_ta}</span>}
              {v.so_tien ? <span className="text-(--color-text-warning) font-medium">{v.so_tien.toLocaleString('vi-VN')}đ</span> : null}
              {v.loai_viec === 'thay_loi' && v.ref && <Link href={`/may/${encodeURIComponent(v.ref)}`} prefetch={false} className="text-(--color-text-info) underline underline-offset-2">máy {v.ref}</Link>}
              {v.loai_viec === 'ticket' && v.ref && <Link href={`/ticket/${encodeURIComponent(v.ref)}`} prefetch={false} className="text-(--color-text-info) underline underline-offset-2">ticket {v.ref}</Link>}
            </div>
            {v.loai_viec === 'bao_tri' && v.ref && (
              <div className="mt-1.5">
                <DoNuocViec visitId={v.ref} mmloai={v.mmloai ?? null} truoc={truoc} setTruoc={setTruoc} doNuoc={v.do_nuoc} />
              </div>
            )}
          </li>
        ))}
        {r.viec.length === 0 && <li className="text-xs text-muted-foreground">Chuyến chưa gán việc cụ thể.</li>}
      </ul>

      <div className="mt-2.5">
        <AnhViec chuyenId={r.id} />
      </div>

      {r.ghi_chu && <p className="text-[11px] text-muted-foreground mt-2">Ghi chú: {r.ghi_chu}</p>}
    </li>
  )
}

/**
 * Màn hình KỸ THUẬT tự xem: chỉ chuyến của mình. Hoàn thành chuyến (cascade bảo trì/
 * thay lõi/ticket) + ghi kết quả đo theo loại máy. Nhiều máy cùng điểm chia sẻ chỉ số
 * đầu vào (trước lọc), chỉ khác chỉ số sau lọc. Có link tra cứu khách/máy/ticket.
 */
export function LichCuaToiKT({ rows }: { rows: LichKyThuatRow[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function hoanThanh(id: string) {
    setBusy(id); setMsg(null); setErr(null)
    const r = await datTrangThaiLichKT(id, 'xong')
    setBusy(null)
    // Ca chuyến ĐÃ xong nhưng vài việc ăn theo không cập nhật được: vẫn phải tải lại, nếu
    // không màn hình còn hiện nút "Hoàn thành chuyến" trong khi chuyến đã xong thật.
    if (!r.ok) { setErr(r.error); router.refresh(); return }
    if (r.cap_nhat > 0) setMsg(`Đã hoàn thành + cập nhật ${r.cap_nhat} việc.`)
    router.refresh()
  }
  async function moLai(id: string) {
    setBusy(id); setErr(null)
    const r = await datTrangThaiLichKT(id, 'hen')
    setBusy(null)
    if (!r.ok) { setErr(r.error); return }
    router.refresh()
  }

  if (rows.length === 0) return <p className="text-sm text-muted-foreground">Bạn chưa có chuyến nào trong khoảng này.</p>

  const theoNgay = new Map<string, LichKyThuatRow[]>()
  for (const r of rows) { const a = theoNgay.get(r.ngay) ?? []; a.push(r); theoNgay.set(r.ngay, a) }

  return (
    <div className="space-y-4">
      {msg && <p className="text-sm text-(--color-text-success-surface) bg-(--color-background-success-surface) rounded-lg px-3 py-2">{msg}</p>}
      {err && <p className="text-sm text-destructive bg-(--color-background-danger-surface) rounded-lg px-3 py-2">{err}</p>}
      {[...theoNgay.entries()].map(([ngay, list]) => (
        <div key={ngay}>
          <h3 className="text-sm font-medium text-foreground mb-1.5">{vnDate(ngay)} ({list.length} chuyến)</h3>
          <ul className="space-y-3">
            {list.map((r) => (
              <TripCard key={r.id} r={r} busy={busy} hoanThanh={hoanThanh} moLai={moLai} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
