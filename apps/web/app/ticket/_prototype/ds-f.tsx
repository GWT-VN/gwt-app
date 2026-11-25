'use client'

// PROTOTYPE vứt đi — PA F "Đề xuất theo nghiên cứu" (docs/rework/2026-11-25-nghien-cuu-cskh-ho-so-may.md mục 4b):
// L1 Bảng + thẻ Xem nhanh (dải máy + bảo hành, sửa trạng thái / người phụ trách, Hẹn KTV) · L3 view mặc định có số đếm,
// hạn/SLA bằng tag màu · L2 Kanban theo khâu là dạng xem phụ. Không gọi mutation thật — sửa chỉ đổi state trên màn.
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowsClockwise, CalendarPlus, UserPlus } from '@phosphor-icons/react/ssr'
import type { Ticket } from '@/app/actions'
import { KhungChon, OChonDong, OChonTatCa, OTimKiem, PhanTrang, ThanhDaChon, useDaChon } from '@/bang'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { Button } from '@/components/ui/button'
import { DataViewToolbar, TrangDuLieu, type DangXem } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { OSuaNguoi, OSuaTrangThai, type MucTrangThai } from '@/components/ui/inline-edit'
import { KanbanBoard, NoiDungThe, type CotKanban } from '@/components/ui/kanban-board'
import { ListView, NhanDau, NutMoMa, NutMoTen, type CotDanhSach } from '@/components/ui/list-view'
import { nutMoTen } from '@/components/ui/list-view-styles'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { thongBao } from '@/components/ui/sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { CHON_BANG } from '@/components/ui/table-styles'
import { Tabs, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { XemNhanh } from '@/components/ui/xem-nhanh'
import { chuaLuu, cheSdt, DauPrototype, mayLoi, NhanKhan, ngayNgan, NutTaoTicket, tenKhach, useDatUrl, type DuLieuTicket } from './chung'

// ── Giả định (DB chưa có trường) — ghi trên màn ─────────────────────────────────────────────────────────────────────
/** "Của tôi" = CS này (prototype không biết ai đang đăng nhập phía client). */
const TOI = 'CS Demo Lan'
const NGAY = 86_400_000
/** Hạn xử lý = ngày tạo + 3 ngày (khẩn: + 1 ngày). */
const han = (t: Ticket) => new Date(t.created_at).getTime() + (t.khan ? 1 : 3) * NGAY
/** Chờ vật tư = đang mở, đã có KT, loại Thay lõi / Sửa chữa. */
const choVatTu = (t: Ticket) => t.state === 'Open' && !!t.ky_thuat && (t.ticket_type === 'Thay lõi' || t.ticket_type === 'Sửa chữa')
/** Hẹn hôm nay = đang mở, đã có KT (không chờ vật tư), hoạt động cuối là hôm nay — hoặc vừa bấm "Hẹn KTV". */
const laHomNay = (iso: string | null) => !!iso && new Date(iso).toDateString() === new Date().toDateString()

type Sua = { state?: Ticket['state']; cs?: string | null; hen?: boolean }
type Dong = Ticket & { hen: boolean }

const henNay = (t: Dong) => t.state === 'Open' && (t.hen || (!!t.ky_thuat && !choVatTu(t) && laHomNay(t.hoat_dong_cuoi ?? null)))
const sla = (t: Ticket): 'qua' | 'sap' | null => {
  if (t.state !== 'Open') return null
  const con = han(t) - Date.now()
  return con < 0 ? 'qua' : con < NGAY ? 'sap' : null
}
const soNgayQua = (t: Ticket) => Math.max(1, Math.floor((Date.now() - han(t)) / NGAY))

// ── View mặc định (L3) ──────────────────────────────────────────────────────────────────────────────────────────────
const VIEW = [
  { v: 'cua-toi', ten: 'Của tôi', loc: (t: Dong) => t.state === 'Open' && t.cs_ten === TOI },
  { v: 'chua-giao', ten: 'Chưa giao', loc: (t: Dong) => t.state === 'Open' && !t.cs_ten },
  { v: 'qua-han', ten: 'Quá hạn', loc: (t: Dong) => sla(t) === 'qua' },
  { v: 'vat-tu', ten: 'Chờ vật tư', loc: (t: Dong) => choVatTu(t) },
  { v: 'hen-nay', ten: 'Hẹn hôm nay', loc: henNay },
  { v: 'mo', ten: 'Tất cả đang mở', loc: (t: Dong) => t.state === 'Open' },
] as const
type View = (typeof VIEW)[number]['v']

// ── Nhãn ────────────────────────────────────────────────────────────────────────────────────────────────────────────
const TT: MucTrangThai[] = [
  { gt: 'Open', nhan: 'Đang mở', color: 'info' },
  { gt: 'Done', nhan: 'Đã xong', color: 'success' },
  { gt: 'Cancel', nhan: 'Đã huỷ', color: 'secondary' },
]

/** `ngan` (ô bảng hẹp): "Còn BH" / "Hết BH". */
function NhanBaoHanh({ t, ngan }: { t: Ticket; ngan?: boolean }) {
  if (!t.serial) return ngan ? null : <span className="text-muted-foreground">—</span>
  if (!t.warranty_activated)
    return (
      <Badge variant="soft" color="secondary">
        Chưa kích hoạt
      </Badge>
    )
  return t.con_han_may ? (
    <Badge variant="soft" color="success">
      {ngan ? 'Còn BH' : 'Còn bảo hành'}
    </Badge>
  ) : (
    <Badge variant="soft" color="warning">
      {ngan ? 'Hết BH' : 'Hết bảo hành'}
    </Badge>
  )
}

/** Hạn/SLA: tag đỏ quá hạn, cam sắp hạn (< 24 giờ) — kiểu Odoo/Freshdesk; còn lại chữ ngày mờ. */
function NhanHan({ t }: { t: Ticket }) {
  const s = sla(t)
  if (s === 'qua')
    return (
      <Badge variant="soft" color="danger">
        Quá {soNgayQua(t)} ngày
      </Badge>
    )
  if (s === 'sap')
    return (
      <Badge variant="soft" color="warning">
        Hạn {ngayNgan(new Date(han(t)).toISOString())}
      </Badge>
    )
  return <span className="tabular-nums text-muted-foreground">{t.state === 'Open' ? ngayNgan(new Date(han(t)).toISOString()) : '—'}</span>
}

const chuDau = (ten: string) =>
  ten
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

function NguoiPhuTrach({ ten }: { ten: string | null }) {
  return ten ? (
    <Avatar title={ten}>
      <AvatarFallback>{chuDau(ten)}</AvatarFallback>
    </Avatar>
  ) : (
    <span className="text-muted-foreground">—</span>
  )
}

function TrangThaiO({ t }: { t: Ticket }) {
  return (
    <span className="flex items-center gap-1 border-none border-current">
      {t.khan && t.state === 'Open' && <NhanKhan />}
      <Badge variant="soft" color={TT.find((m) => m.gt === t.state)?.color}>
        {TT.find((m) => m.gt === t.state)?.nhan}
      </Badge>
    </span>
  )
}

// ── Bảng (L1) ───────────────────────────────────────────────────────────────────────────────────────────────────────
type Cot = { id: string; ten: string; rong: number | null; phai?: boolean; o: (t: Dong, mo: (ma: string) => void) => React.ReactNode }
// Vừa 963px (vùng nội dung 1440 có sidebar): mã gộp vào ô khách (như ListView), badge bảo hành gộp đầu ô máy ("dải máy").
const COT: Cot[] = [
  {
    id: 'khach',
    ten: 'Ticket · khách',
    rong: null,
    o: (t, mo) => (
      <span className="flex min-w-0 items-center gap-2 border-none border-current">
        <span className="shrink-0 tabular-nums text-muted-foreground">{t.ticket_code}</span>
        <button type="button" className={nutMoTen} onClick={() => mo(t.ticket_code)}>
          {tenKhach(t)}
        </button>
      </span>
    ),
  },
  {
    id: 'may',
    ten: 'Máy · bảo hành',
    rong: 224,
    o: (t) => (
      <span className="flex min-w-0 items-center gap-2 border-none border-current">
        <span className="shrink-0 border-none border-current">
          <NhanBaoHanh t={t} ngan />
        </span>
        <span className="min-w-0 truncate">
          {t.product_name ?? '—'}
          {t.source_serial && <span className="tabular-nums text-muted-foreground"> · {t.source_serial}</span>}
        </span>
      </span>
    ),
  },
  { id: 'loi', ten: 'Loại lỗi', rong: 152, o: (t) => <span className="block truncate text-muted-foreground">{t.dong_may?.[0] ? mayLoi(t) : '—'}</span> },
  { id: 'tt', ten: 'Trạng thái', rong: 136, o: (t) => <TrangThaiO t={t} /> },
  { id: 'cs', ten: 'Phụ trách', rong: 84, o: (t) => <NguoiPhuTrach ten={t.cs_ten} /> },
  { id: 'han', ten: 'Hạn', rong: 104, o: (t) => <NhanHan t={t} /> },
]
const RONG_TOI_THIEU = 36 + 200 + COT.reduce((s, c) => s + (c.rong ?? 0), 0)

function DongBang({ t, mo }: { t: Dong; mo: (ma: string) => void }) {
  const { daChon } = useDaChon()
  return (
    <TableRow chon={daChon.includes(t.ticket_code)}>
      <OChonDong khoa={t.ticket_code} moTa={`ticket ${t.ticket_code}`} />
      {COT.map((c) => (
        <TableCell key={c.id} cot={c.id} phai={c.phai}>
          {c.o(t, mo)}
        </TableCell>
      ))}
    </TableRow>
  )
}

// ── Danh sách (điện thoại + dạng xem Danh sách) ────────────────────────────────────────────────────────────────────
const COT_DS: CotDanhSach<Dong>[] = [
  {
    id: 'ticket',
    ten: 'Ticket · khách',
    rong: 'minmax(0,2fr)',
    dienThoai: 'tren',
    o: (t) => (
      <>
        {t.khan && t.state === 'Open' && (
          <NhanDau gon>
            <NhanKhan />
          </NhanDau>
        )}
        <NutMoMa ma={t.ticket_code} />
        <NutMoTen ten={tenKhach(t)} />
      </>
    ),
  },
  { id: 'may', ten: 'Máy · lỗi', rong: 'minmax(0,1.2fr)', anKhiHep: true, dienThoai: 'duoi', o: (t) => <span className="min-w-0 truncate text-muted-foreground">{mayLoi(t)}</span> },
  { id: 'han', ten: 'Hạn', rong: '112px', dienThoai: 'trenPhai', o: (t) => <NhanHan t={t} /> },
  { id: 'bh', ten: 'Bảo hành', rong: '132px', dienThoai: 'duoiPhai', o: (t) => <NhanBaoHanh t={t} /> },
  { id: 'cs', ten: 'Phụ trách', rong: '72px', anKhiHep: true, o: (t) => <NguoiPhuTrach ten={t.cs_ten} /> },
]

// ── Kanban theo khâu (L2) ───────────────────────────────────────────────────────────────────────────────────────────
const KHAU: CotKanban[] = [
  { id: 'moi', nhan: 'Mới', color: 'discovery' },
  { id: 'cho-hen', nhan: 'Chờ hẹn', color: 'warning' },
  { id: 'da-hen', nhan: 'Đã hẹn KTV', color: 'info' },
  { id: 'vat-tu', nhan: 'Chờ vật tư', color: 'warning' },
  { id: 'xong', nhan: 'Xong', color: 'success' },
]
const khauCua = (t: Dong) => (t.state === 'Done' ? 'xong' : !t.cs_ten ? 'moi' : choVatTu(t) ? 'vat-tu' : t.ky_thuat || t.hen ? 'da-hen' : 'cho-hen')

// ── Thẻ Xem nhanh ───────────────────────────────────────────────────────────────────────────────────────────────────
function NoiDungXem({ t, nguoi, sua }: { t: Dong; nguoi: { gt: string; nhan: string }[]; sua: (s: Sua) => void }) {
  return (
    <div className="flex flex-col gap-5 border-none border-current">
      {/* Dải máy: câu hỏi đầu tiên của mọi ca — "máy nào, còn bảo hành không" (nghiên cứu D1). */}
      <div className="flex flex-wrap items-center gap-2 border-none border-current">
        <span className="ds-text-sm font-medium">{t.product_name ?? 'Chưa rõ máy'}</span>
        {t.source_serial && <span className="ds-text-sm tabular-nums text-muted-foreground">{t.source_serial}</span>}
        <NhanBaoHanh t={t} />
      </div>
      <PropertyList>
        <PropertyRow nhan="Trạng thái">
          <OSuaTrangThai ma={t.ticket_code} value={{ tt: t.state }} muc={TT} onLuu={(v) => sua({ state: v.tt as Ticket['state'] })} />
        </PropertyRow>
        <PropertyRow nhan="Phụ trách">
          <OSuaNguoi ma={t.ticket_code} truong="người phụ trách" value={t.cs_ten} options={nguoi} onLuu={(v) => sua({ cs: v })} />
        </PropertyRow>
        <PropertyRow nhan="Hạn">
          <NhanHan t={t} />
        </PropertyRow>
        <PropertyRow nhan="Kỹ thuật">{t.ky_thuat_ten ?? (t.hen ? 'Đã hẹn (prototype)' : null)}</PropertyRow>
        <PropertyRow nhan="Khách">{t.customer_name}</PropertyRow>
        <PropertyRow nhan="SĐT">{cheSdt(t.primary_phone)}</PropertyRow>
        <PropertyRow nhan="Tỉnh/TP">{t.province}</PropertyRow>
        <PropertyRow nhan="Loại">{t.ticket_type}</PropertyRow>
      </PropertyList>
      <PropertyList tieuDe="Nội dung" layout="stack">
        <PropertyRow nhan="Khách báo">{t.description}</PropertyRow>
        <PropertyRow nhan="Ghi chú cuối">{t.last_note}</PropertyRow>
      </PropertyList>
      <div className="flex flex-wrap gap-2 border-none border-current">
        <Button
          size="sm"
          onClick={() => {
            sua({ hen: true })
            thongBao.xong(`${t.ticket_code}: đã hẹn KTV — prototype, chưa lưu`)
          }}
          disabled={t.hen}
        >
          <CalendarPlus aria-hidden="true" />
          {t.hen ? 'Đã hẹn KTV' : 'Hẹn KTV'}
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/ticket/${encodeURIComponent(t.ticket_code)}?variant=G`}>Mở trang đầy đủ</Link>
        </Button>
      </div>
    </div>
  )
}

export function TicketF({ rows: goc, tong, trang, soTrang, demo }: DuLieuTicket) {
  const sp = useSearchParams()
  const dat = useDatUrl()
  const [sua, setSua] = useState<Record<string, Sua>>({})
  const [dangXem, setDangXem] = useState<DangXem>('bang')

  const rows: Dong[] = goc.map((t) => {
    const s = sua[t.ticket_code]
    return { ...t, state: s?.state ?? t.state, cs_ten: s && 'cs' in s ? (s.cs ?? null) : t.cs_ten, hen: !!s?.hen }
  })
  const nguoi = [...new Set(goc.map((t) => t.cs_ten).filter((x): x is string => !!x))].map((n) => ({ gt: n, nhan: n }))
  const doi = (ma: string) => (s: Sua) => setSua((m) => ({ ...m, [ma]: { ...m[ma], ...s } }))

  const view = (VIEW.find((x) => x.v === sp.get('view'))?.v ?? 'cua-toi') as View
  const dong = rows.filter(VIEW.find((x) => x.v === view)!.loc)
  const xem = sp.get('xem')
  const nguon = dangXem === 'kanban' ? rows : dong
  const i = xem ? nguon.findIndex((t) => t.ticket_code === xem) : -1
  const t = i >= 0 ? nguon[i] : null
  const mo = (ma: string | null) => dat({ xem: ma }, true)

  const bang = (
    <TableWrap>
      <Table layout="fixed" style={{ minWidth: RONG_TOI_THIEU }}>
        <colgroup>
          <col style={{ width: 36 }} />
          {COT.map((c) => (
            <col key={c.id} style={c.rong ? { width: c.rong } : undefined} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <OChonTatCa nhan="ticket" />
            {COT.map((c) => (
              <TableHead key={c.id} phai={c.phai}>
                {c.ten}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dong.map((d) => (
            <DongBang key={d.ticket_code} t={d} mo={mo} />
          ))}
        </TableBody>
      </Table>
    </TableWrap>
  )
  const ds = (
    <ListView aria-label="Ticket CSKH" cot={COT_DS} dong={dong} khoa={(d) => d.ticket_code} onMo={(d) => mo(d.ticket_code)} dangMo={xem} moKhi="ten" />
  )

  return (
    <XemNhanh
      coDinh
      the={t && { ma: t.ticket_code, phu: tenKhach(t), noiDung: <NoiDungXem key={t.ticket_code} t={t} nguoi={nguoi} sua={doi(t.ticket_code)} /> }}
      onDong={() => mo(null)}
      onTruoc={i > 0 ? () => mo(nguon[i - 1].ticket_code) : undefined}
      onSau={i >= 0 && i < nguon.length - 1 ? () => mo(nguon[i + 1].ticket_code) : undefined}
    >
      <TrangDuLieu>
        <DauPrototype
          ma="F"
          demo={demo}
          cach={`Đề xuất theo nghiên cứu (L1 + L3, Kanban theo khâu là dạng xem phụ ở nút dạng xem). Bấm tab view; bấm TÊN khách mở Xem nhanh (đổi trạng thái / phụ trách, Hẹn KTV); tick ô đầu dòng → thanh hàng loạt. Giả định: "Của tôi" = ${TOI}; hạn = ngày tạo + 3 ngày (khẩn + 1); Chờ vật tư = đã có KT + loại Thay lõi/Sửa chữa; Hẹn hôm nay = có KT, hoạt động hôm nay. Không lưu gì.`}
        />
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG }} thanhHangLoat="surface">
          <DataViewToolbar
            tieuDe="Ticket CSKH"
            dem={{ thay: dangXem === 'kanban' ? rows.length : dong.length, tong }}
            timKiem={
              <Suspense>
                <OTimKiem placeholder="Mã ticket, serial, khách, SĐT…" aria-label="Tìm ticket" />
              </Suspense>
            }
            nutChinh={<NutTaoTicket />}
            tabs={
              dangXem === 'kanban' ? undefined : (
                <Tabs value={view} onValueChange={(v) => dat({ view: v, xem: null })}>
                  <TabsList variant="pill" aria-label="View ticket">
                    {VIEW.map((x) => {
                      const n = rows.filter(x.loc).length
                      return (
                        <TabsTrigger key={x.v} value={x.v}>
                          {x.ten} <TabsCount color={x.v === 'qua-han' && n ? 'danger' : undefined}>{n}</TabsCount>
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                </Tabs>
              )
            }
            dangXem={dangXem}
            onDoiXem={setDangXem}
            xemNhanh={t != null}
            onXemNhanh={(bat) => mo(bat ? (nguon[0]?.ticket_code ?? null) : null)}
          />
          <KhungChon
            khoaTrang={dong.map((d) => d.ticket_code)}
            tong={dong.length}
            bat={dangXem !== 'kanban'}
            thamSo={{ view, q: sp.get('q') ?? '' }}
          >
            {dangXem === 'kanban' ? (
              <KanbanBoard
                cot={KHAU}
                the={rows
                  .filter((d) => d.state !== 'Cancel')
                  .map((d) => ({
                    id: d.ticket_code,
                    cot: khauCua(d),
                    ten: d.ticket_code,
                    noiDung: (
                      <NoiDungThe
                        nhan={d.khan && d.state === 'Open' ? <NhanKhan /> : <NhanBaoHanh t={d} />}
                        khach={tenKhach(d)}
                        viec={mayLoi(d)}
                        ma={d.ticket_code}
                        han={{ chu: ngayNgan(new Date(han(d)).toISOString()) }}
                        chu={d.cs_ten ?? undefined}
                      />
                    ),
                  }))}
                onChuyen={(id, cot) => doi(id)(cot === 'xong' ? { state: 'Done' } : cot === 'moi' ? { cs: null, state: 'Open' } : { state: 'Open', hen: cot === 'da-hen' })}
                onMo={(ma) => mo(ma)}
              />
            ) : !dong.length ? (
              <EmptyState size="sm" kieu="loc" tieuDe="Không có ticket nào trong view này" moTa="Thử view khác hoặc bỏ bớt từ khoá." />
            ) : dangXem === 'danh-sach' ? (
              ds
            ) : (
              // Bảng là dạng xem chính; vùng nội dung hẹp hơn bề rộng tối thiểu của bảng (RONG_TOI_THIEU = 952: 900 có
              // sidebar, mở Xem nhanh, điện thoại) → ListView (1 dòng, ≤ 480 hai dòng) thay vì bảng cuộn ngang bóp cột tên.
              <div className="@container border-none border-current">
                <div className="@max-[952px]:hidden border-none border-current">{bang}</div>
                <div className="@min-[952px]:hidden border-none border-current">{ds}</div>
              </div>
            )}
            <ThanhDaChon nhan="ticket">
              <Button variant="ghost" size="sm" onClick={chuaLuu}>
                <UserPlus aria-hidden="true" />
                Giao cho…
              </Button>
              <Button variant="ghost" size="sm" onClick={chuaLuu}>
                <ArrowsClockwise aria-hidden="true" />
                Đổi trạng thái
              </Button>
              <Button variant="ghost" size="sm" onClick={chuaLuu}>
                <CalendarPlus aria-hidden="true" />
                Hẹn KTV
              </Button>
            </ThanhDaChon>
          </KhungChon>
          <Suspense>
            <PhanTrang trang={trang} soTrang={soTrang} tong={tong} nhan="ticket" />
          </Suspense>
        </CauHinhBangDs>
      </TrangDuLieu>
    </XemNhanh>
  )
}
