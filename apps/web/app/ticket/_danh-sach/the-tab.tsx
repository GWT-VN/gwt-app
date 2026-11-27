'use client'

// Tab Xem nhanh của ticket F chạy DỮ LIỆU THẬT (bước 4, docs/rework/2026-11-26-ticket-f-dung-that.md): Lần lỗi (đủ các lần),
// Nhật ký (+ thêm ghi chú), Vật tư, Ticket khác (cùng máy / cùng khách — truy vấn DB, không chỉ trang đang tải), Việc đã
// gắn + Gắn việc (CEO 26/11 "thay quá hạn bằng việc gắn task → để hạn sang tab Work"). Chỉ gọi action có sẵn (+ viecGanErp
// đọc). Ticket Demo dùng khối Demo ở xem-nhanh-f.tsx.
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowSquareOut, ChatText, LinkSimple, Plus } from '@phosphor-icons/react/ssr'
import { addTicketNote, listTicketItems, listTicketNotes, ticketsOfCustomer, ticketsOfSerial, type Ticket } from '@/app/actions'
import { docLanLoi, suaLanLoiMd, themLanLoiMd } from '@/app/ticket/lan-loi-md-actions'
import { ganErp, taoViec, timViec, viecGanErp, type ViecTeamRow } from '@/app/work/actions'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { thongBao } from '@/components/ui/sonner'
import { Textarea } from '@/components/ui/textarea'
import { Timeline, type MucTimeline } from '@/components/ui/timeline'
import { ngayVNHomNay } from '@/lib/loi/ngayTicket'
import { mayLoi, ngayNgan, tenKhach } from './chung'
import { TT } from './ds-f'
import { DsTheLan, type LanThe, type LuuLan } from './the-lan'

/** Đọc một lần theo `khoa` (đổi ticket / bấm tải lại → đọc lại). Lỗi → `loi` (chữ), không vỡ thẻ. */
function useDoc<T>(khoa: string, doc: () => Promise<T>) {
  const [kq, setKq] = useState<{ khoa: string; data?: T; loi?: string } | null>(null)
  useEffect(() => {
    let huy = false
    doc().then(
      (data) => !huy && setKq({ khoa, data }),
      (e: unknown) => !huy && setKq({ khoa, loi: e instanceof Error ? e.message : 'Không đọc được' }),
    )
    return () => {
      huy = true
    }
    // `doc` đổi mỗi lần render — chỉ đọc lại khi `khoa` đổi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [khoa])
  return kq?.khoa === khoa ? kq : null
}

function DangTai() {
  return (
    <div className="flex flex-col gap-2 border-none border-current" aria-busy="true" aria-label="Đang tải">
      <Skeleton className="h-10" />
      <Skeleton className="h-10" />
    </div>
  )
}
const Loi = ({ chu }: { chu: string }) => <EmptyState size="sm" tieuDe="Chưa đọc được" moTa={chu} />

/**
 * Lần lỗi, cũ → mới, mở sẵn lần mới nhất. Nguồn do server chọn (`docLanLoi`, CSKH_NGUON):
 * - ST: lần 1 (mô tả + ghi chú xử lý của ticket) + lần 2+ (ticket_lan_loi), sửa chỉ trên màn như cũ.
 * - MD: mọi lần ở `customer_care.issue_reports`, sửa là lưu; ticket chưa có dòng nào → hiện lần 1 của ticket, ghi lần đầu tạo dòng.
 */
/** `serial` = đang nằm trong thẻ MỘT máy (hồ sơ khách) → lần thêm mới gắn máy đó; không có (Xem nhanh) → server lấy máy lần gần nhất. */
export function LanLoiThat({ t, serial }: { t: Ticket; serial?: string }) {
  const kq = useDoc(t.ticket_code, () => docLanLoi(t.ticket_code))
  if (!kq) return <DangTai />
  // Ngày lần 1 = ngày tạo ticket theo giờ VN (ticket tạo 0–7h VN không lùi về hôm trước).
  const lan1: LanThe = { so: 1, ngay: ngayVNHomNay(new Date(t.created_at)), khach: t.description, xuLy: t.last_note, vatTu: [] }
  const r = kq.data
  const ds: LanThe[] = r?.md
    ? r.ds.length
      ? r.ds.map((l) => ({ so: l.report_no, id: l.id, tt: l.status, ngay: l.reported_on, khach: l.customer_said, xuLy: l.handling, vatTu: [] }))
      : [lan1]
    : [lan1, ...(r?.ds ?? []).map((l) => ({ so: l.lan, ngay: l.ngay ?? l.created_at.slice(0, 10), khach: l.mo_ta, xuLy: l.xu_ly, vatTu: [] }))]
  const luu: LuuLan | undefined = r?.md
    ? { them: (i) => themLanLoiMd(t.ticket_code, serial ? { ...i, serial } : i), sua: (id, p) => suaLanLoiMd(id, t.ticket_code, p) }
    : undefined
  return (
    <div className="flex flex-col gap-3 border-none border-current">
      {/* Đọc lần 2+ lỗi → vẫn hiện lần 1 (của ticket), báo phần thiếu — như trang chi tiết. */}
      {kq.loi && <p className="m-0 ds-text-xs text-muted-foreground">Chưa tải được các lần lỗi sau — {kq.loi}</p>}
      <DsTheLan ds={ds} nguoi={t.ky_thuat_ten ?? t.cs_ten ?? 'CSKH'} luu={luu} />
    </div>
  )
}

/** Nhật ký: ghi chú ticket_note (cũ → mới) + ô thêm ghi chú (addTicketNote). */
export function NhatKyThat({ t, choGhi }: { t: Ticket; choGhi: boolean }) {
  const [lan, setLan] = useState(0)
  const kq = useDoc(`${t.ticket_code}#${lan}`, () => listTicketNotes(t.ticket_code))
  const [chu, setChu] = useState('')
  const [dang, setDang] = useState(false)
  const ghi = async () => {
    setDang(true)
    const r = await addTicketNote(t.ticket_code, chu)
    setDang(false)
    if (!r.ok) return thongBao.loi(`${t.ticket_code}: chưa ghi được — ${r.error}`)
    setChu('')
    setLan((n) => n + 1)
  }
  const muc: MucTimeline[] = [...(kq?.data ?? [])].reverse().map((n) => ({
    id: n.id,
    ai: n.tac_gia ?? 'CSKH',
    loai: 'ghi chú',
    luc: n.created_at,
    icon: <ChatText aria-hidden="true" />,
    noiDung: <span className="whitespace-pre-line">{n.noi_dung}</span>,
  }))
  return (
    <div className="flex flex-col gap-3 border-none border-current">
      {!kq ? (
        <DangTai />
      ) : kq.loi ? (
        <Loi chu={kq.loi} />
      ) : muc.length ? (
        <Timeline muc={muc} aria-label={`Nhật ký ${t.ticket_code}`} />
      ) : (
        <EmptyState size="sm" tieuDe="Chưa có ghi chú" moTa="Ghi chú trao đổi với khách / kỹ thuật sẽ hiện ở đây." />
      )}
      {choGhi && (
        <form
          className="flex flex-col items-end gap-2 border-none border-current"
          onSubmit={(e) => {
            e.preventDefault()
            if (chu.trim() && !dang) void ghi()
          }}
        >
          <Textarea aria-label={`Ghi chú cho ${t.ticket_code}`} placeholder="Ghi chú…" value={chu} onChange={(e) => setChu(e.target.value)} rows={2} className="w-full" />
          <Button type="submit" size="sm" disabled={!chu.trim()} loading={dang}>
            Thêm ghi chú
          </Button>
        </form>
      )}
    </div>
  )
}

/** Vật tư: mục ticket_muc thật (cần quyền chi phí). Ghi vật tư (chọn từ danh mục hàng) ở trang chi tiết. */
export function VatTuThat({ t }: { t: Ticket }) {
  const kq = useDoc(t.ticket_code, () => listTicketItems(t.ticket_code))
  const nut = (
    <Button variant="outline" size="sm" asChild>
      <Link href={`/ticket/${encodeURIComponent(t.ticket_code)}`} prefetch={false}>
        <ArrowSquareOut aria-hidden="true" />
        Ghi vật tư ở trang chi tiết
      </Link>
    </Button>
  )
  if (!kq) return <DangTai />
  if (kq.loi) return <Loi chu={kq.loi} />
  const ds = kq.data ?? []
  if (!ds.length) return <EmptyState size="sm" tieuDe="Chưa ghi vật tư" moTa="Linh kiện / chi phí của ticket này sẽ hiện ở đây.">{nut}</EmptyState>
  return (
    <div className="flex flex-col items-start gap-3 border-none border-current">
      <ItemGroup className="gap-2 self-stretch">
        {ds.map((x) => (
          <Item key={x.id} size="sm" variant="outline">
            <ItemContent>
              <ItemTitle>{x.loai === 'doi_may' ? `Đổi máy ${x.serial_cu ?? '?'} → ${x.serial_moi ?? '?'}` : (x.mo_ta ?? x.catalog_code ?? 'Chi phí')}</ItemTitle>
              <ItemDescription>
                <span className="tabular-nums">
                  {[x.catalog_code, x.so_luong != null && `${x.so_luong} cái`, x.so_tien != null && `${x.so_tien.toLocaleString('vi-VN')} đ`, ngayNgan(x.created_at)]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
      {nut}
    </div>
  )
}

/** Ticket khác cùng máy (ticketsOfSerial) + cùng khách (ticketsOfCustomer) — mọi ticket trong DB, không chỉ trang đang tải. */
export function TicketKhacThat({ t, moDuoc, onMo }: { t: Ticket; moDuoc: (ma: string) => boolean; onMo: (ma: string) => void }) {
  const kq = useDoc(t.ticket_code, async () => {
    const [may, khach] = await Promise.all([
      t.serial ? ticketsOfSerial(t.serial) : Promise.resolve([]),
      // Cùng khách cần quyền xem khách — không có thì chỉ còn cùng máy.
      t.customer_id ? ticketsOfCustomer(t.customer_id).catch(() => [] as Ticket[]) : Promise.resolve([]),
    ])
    const gop = new Map<string, Ticket & { cungMay: boolean }>()
    for (const x of may) gop.set(x.ticket_code, { ...x, cungMay: true })
    for (const x of khach) if (!gop.has(x.ticket_code)) gop.set(x.ticket_code, { ...x, cungMay: false })
    gop.delete(t.ticket_code)
    return [...gop.values()].sort((a, b) => b.created_at.localeCompare(a.created_at))
  })
  if (!kq) return <DangTai />
  if (kq.loi) return <Loi chu={kq.loi} />
  const ds = kq.data ?? []
  if (!ds.length) return <EmptyState size="sm" tieuDe="Không có ticket khác" moTa="Máy và khách này chưa có ticket nào khác." />
  return (
    <ItemGroup className="gap-2">
      {ds.map((x) => {
        const m = TT.find((y) => y.gt === x.state)
        const nd = (
          <>
            <ItemContent>
              <ItemTitle>
                <span className="tabular-nums">{x.ticket_code}</span> · {mayLoi(x)}
              </ItemTitle>
              <ItemDescription>
                <span className="tabular-nums">Tạo {ngayNgan(x.created_at)}</span> · {x.cungMay ? 'Cùng máy' : 'Cùng khách'}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge variant="soft" color={m?.color}>
                <BadgeDot />
                {m?.nhan}
              </Badge>
            </ItemActions>
          </>
        )
        return (
          <Item key={x.ticket_code} size="sm" variant="outline" asChild>
            {moDuoc(x.ticket_code) ? (
              <button type="button" className="w-full cursor-pointer bg-transparent text-left" onClick={() => onMo(x.ticket_code)}>
                {nd}
              </button>
            ) : (
              <Link href={`/ticket/${encodeURIComponent(x.ticket_code)}`} prefetch={false}>
                {nd}
              </Link>
            )}
          </Item>
        )
      })}
    </ItemGroup>
  )
}

const TT_VIEC: Record<string, string> = { todo: 'Cần làm', doing: 'Đang làm', review: 'Chờ duyệt', done: 'Xong', cancelled: 'Huỷ' }

/** Việc (khu Work) đang gắn ticket này: tiêu đề · hạn · trạng thái, link /work?xem=<id>. Hạn theo dõi ở Work. */
export function ViecDaGan({ t, lan }: { t: Ticket; lan: number }) {
  const kq = useDoc(`${t.ticket_code}#${lan}`, () => viecGanErp('ticket', t.ticket_code).then((r) => (r.ok ? r.duLieu : Promise.reject(new Error(r.loi)))))
  if (!kq) return <DangTai />
  if (kq.loi) return <Loi chu={kq.loi} />
  const ds = kq.data ?? []
  if (!ds.length) return <p className="m-0 ds-text-sm text-muted-foreground">Chưa gắn việc nào.</p>
  return (
    <ItemGroup className="gap-2">
      {ds.map((v: ViecTeamRow) => (
        <Item key={v.id} size="sm" variant="outline" asChild>
          <Link href={`/work?xem=${v.id}`} prefetch={false}>
            <ItemContent>
              <ItemTitle>{v.title}</ItemTitle>
              <ItemDescription>
                <span className="tabular-nums">
                  {v.ref}
                  {v.due_at ? ` · hạn ${ngayNgan(v.due_at)}` : ' · chưa hạn'}
                </span>
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge variant="soft" color={v.status === 'done' ? 'success' : undefined}>
                <BadgeDot />
                {TT_VIEC[v.status] ?? v.status}
              </Badge>
            </ItemActions>
          </Link>
        </Item>
      ))}
    </ItemGroup>
  )
}

/**
 * Hộp Gắn việc cho một hoặc nhiều ticket: gắn Việc có sẵn (timViec) HOẶC tạo Việc mới (taoViec — tiêu đề điền sẵn mã +
 * khách, hạn, người làm) rồi ganErp(id, 'ticket', mã) cho từng ticket.
 */
export function HopGanViec({
  ds,
  nhanVien,
  open,
  onOpenChange,
  onXong,
}: {
  ds: Ticket[]
  nhanVien: { gt: string; nhan: string; anMa?: boolean }[]
  open: boolean
  onOpenChange: (o: boolean) => void
  onXong?: () => void
}) {
  const macDinh = ds.length === 1 ? `${ds[0].ticket_code} · ${tenKhach(ds[0])}` : `${ds.length} ticket: ${ds.map((x) => x.ticket_code).join(', ')}`
  const [coSan, setCoSan] = useState<{ gt: string; nhan: string } | null>(null)
  const [ten, setTen] = useState(macDinh)
  const [han, setHan] = useState<string | null>(null)
  const [nguoi, setNguoi] = useState<string | null>(null)
  const [dang, setDang] = useState(false)
  // Nhãn của kết quả tìm (Combobox chỉ trả id) — cho toast "Đã gắn <mã việc>".
  const nhanTim = useRef(new Map<string, string>())
  const gan = async (id: number, ref: string) => {
    for (const x of ds) {
      const r = await ganErp(id, 'ticket', x.ticket_code)
      if (!r.ok) return thongBao.loi(`${ref}: chưa gắn được ${x.ticket_code} — ${r.loi}`)
    }
    thongBao.xong(`Đã gắn ${ref} với ${ds.length === 1 ? ds[0].ticket_code : `${ds.length} ticket`}`)
    onOpenChange(false)
    onXong?.()
  }
  const lam = async () => {
    setDang(true)
    try {
      if (coSan) return await gan(Number(coSan.gt), coSan.nhan.split(' · ')[0])
      const kq = await taoViec({ title: ten.trim(), due: han, assignees: nguoi ? [{ staff_id: nguoi, role: 'owner' }] : undefined })
      if (!kq.ok) return thongBao.loi(`Chưa tạo được việc — ${kq.loi}`)
      await gan(kq.duLieu.id, kq.duLieu.ref)
    } finally {
      setDang(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gắn việc</DialogTitle>
          <DialogDescription>Hạn và người làm theo dõi ở khu Việc. {macDinh}</DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Gắn việc có sẵn</FieldLabel>
            <Combobox
              value={coSan?.gt ?? null}
              mucDangChon={coSan ?? undefined}
              onValueChange={(v) => setCoSan(v ? { gt: v, nhan: nhanTim.current.get(v) ?? v } : null)}
              tim={async (q) => {
                const r = await timViec(q)
                if (!r.ok) throw new Error(r.loi)
                const ds = r.duLieu.map((v) => ({ gt: String(v.id), nhan: `${v.ref} · ${v.title}`, phu: v.team_name ?? undefined, anMa: true }))
                for (const m of ds) nhanTim.current.set(m.gt, m.nhan)
                return ds
              }}
              placeholder="Tìm việc theo tên / mã…"
              searchPlaceholder="Gõ ≥ 2 ký tự…"
            />
          </Field>
          <Separator />
          <fieldset disabled={!!coSan} className="m-0 flex flex-col gap-4 border-none p-0">
            <legend className="mb-2 ds-text-sm font-medium">hoặc tạo việc mới</legend>
            <Field>
              <FieldLabel htmlFor="gan-viec-ten">Tiêu đề</FieldLabel>
              <Input id="gan-viec-ten" value={ten} onChange={(e) => setTen(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Hạn</FieldLabel>
              {/* Hạn có GIỜ như khu Việc (CEO 27/11 "mất cái form chọn time"): DateTimePicker DS — lịch trên, ô ngày + giờ dưới;
                  chỉ chọn ngày → 17:00 (giờ hành chính cuối ngày, như `hanLuu` của Work). */}
              <DateTimePicker value={han} onValueChange={setHan} gioMacDinh="17:00" placeholder="Chưa hạn" />
            </Field>
            <Field>
              <FieldLabel>Người làm</FieldLabel>
              <Combobox value={nguoi} onValueChange={setNguoi} options={nhanVien} placeholder="Mình (người tạo)" searchPlaceholder="Gõ tên…" />
            </Field>
          </fieldset>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button onClick={() => void lam()} loading={dang} disabled={!coSan && !ten.trim()}>
            {coSan ? <LinkSimple aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {coSan ? 'Gắn việc' : 'Tạo và gắn'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
