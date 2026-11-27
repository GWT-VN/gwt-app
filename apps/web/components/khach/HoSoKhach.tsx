'use client'

/**
 * HỒ SƠ KHÁCH — màn "view full" của một khách (CEO 27/11: "view full ở đây là coi như view full một KH luôn… chuyển các tab
 * thành các dạng module"; chốt 2 cột). Khách là trục: ticket, máy, bảo trì đều nối qua khách.
 * - Ba tab CỐ ĐỊNH (`?tab=`, Tabs line dưới PageHeader): Ticket (một thẻ mỗi máy) · Thông tin (Liên hệ · Địa chỉ · Kênh
 *   + Sản phẩm đã mua) · Bảo trì & lõi (Bảo trì + Lõi lọc). Không có `?tab=` → Ticket.
 * - ≥ 1200: 2 cột — TRÁI các module (`TheGap`) của tab, PHẢI thẻ Khách (dính khi cuộn). < 1200: 1 cột, thẻ Khách lên đầu
 *   (đứng đầu DOM, ≥ 1200 đặt sang cột 2 bằng lưới). Thẻ Khách GỌN ở Ticket / Bảo trì, ĐẦY ĐỦ ở Thông tin.
 * - Tab Ticket (CEO 27/11 "tên máy KH mua → mở detail ra có ticket riêng cho máy đó, trạng thái bảo hành luôn"): mỗi máy
 *   một `TheGap` — đầu thẻ tên · serial · BH · chip `Mã ×n` · số ticket; thân = bảo hành + ticket CỦA máy đó.
 * - `?ticket=`: thẻ máy chứa ticket đó mở (máy khác gập), ticket mở sẵn tới các lần lỗi. Không có → thẻ đầu + ticket mới nhất.
 * - Chỉ đọc ở đợt này; sửa tại chỗ (qua hàng chờ duyệt) để đợt 2.
 * Ảnh sản phẩm: app chưa có nguồn ảnh → ô vuông icon (ponytail: thay bằng ảnh catalog khi có cột ảnh).
 */
import { useState, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CaretDown, Cube } from '@phosphor-icons/react/ssr'
import type { Ticket } from '@/app/actions'
import { TT } from '@/app/ticket/_danh-sach/ds-f'
import { DsTheLan } from '@/app/ticket/_danh-sach/the-lan'
import { LanLoiThat } from '@/app/ticket/_danh-sach/the-tab'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { ListView } from '@/components/ui/list-view'
import { PageHeader } from '@/components/ui/page-header'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TheGap } from '@/components/ui/the-gap'
import { hienNgay } from '@/lib/dinh-dang-ngay'
import { gomTicketTheoMay, type DongLoiMay, type NhomMay } from '@/lib/khach/thong-ke-loi'
import { cn } from '@/lib/utils'

export type KhachHoSo = {
  id: string
  ten: string
  sdt: string | null
  tinh: string | null
  diaChi: string | null
  nguon: string | null
  maKh: string | null
  maSales: string | null
  phuTrach: string | null
}
export type MayHoSo = {
  serial: string
  product_name: string | null
  internal_code: string | null
  warranty_activated: boolean | null
  warranty_full_end: string | null
  install_date?: string | null
}
export type BaoTriHoSo = { id: string; lan: number | null; ngay: string | null; xong: string | null; boMay: string | null }
export type LienHeHoSo = { id: string; sdt: string | null; ten: string | null; vaiTro: string | null; chinh: boolean }
export type DiaChiHoSo = { id: string; diaChi: string; loai: string; tinh: string | null }

const TAB = [
  { gt: 'ticket', nhan: 'Ticket' },
  { gt: 'thong-tin', nhan: 'Thông tin' },
  { gt: 'bao-tri', nhan: 'Bảo trì & lõi' },
] as const
export type TabHoSo = (typeof TAB)[number]['gt']
const laTab = (v: string | null): v is TabHoSo => TAB.some((t) => t.gt === v)

export function HoSoKhach({
  khach,
  may,
  tickets,
  dongLoi = [],
  baoTri,
  lienHe = [],
  diaChiPhu = [],
  kenh = null,
  demo,
  tab: tabDau,
}: {
  khach: KhachHoSo
  may: MayHoSo[]
  tickets: Ticket[]
  /** Dòng máy báo lỗi của các ticket (gom ticket theo máy + chip lỗi). */
  dongLoi?: DongLoiMay[]
  baoTri: BaoTriHoSo[]
  lienHe?: LienHeHoSo[]
  diaChiPhu?: DiaChiHoSo[]
  kenh?: string | null
  demo: boolean
  tab?: TabHoSo
}) {
  const sp = useSearchParams()
  const router = useRouter()
  const duong = usePathname()
  const [tab, setTab] = useState<TabHoSo>(() => {
    const q = sp.get('tab')
    return tabDau ?? (laTab(q) ? q : 'ticket')
  })
  const doiTab = (v: string) => {
    if (!laTab(v)) return
    setTab(v)
    const q = new URLSearchParams(sp.toString())
    q.set('tab', v)
    q.delete('view') // tham số cũ (ô chọn thứ tự xem) — bỏ khi đổi tab
    router.replace(`${duong}?${q}`, { scroll: false })
  }

  // Ticket đang xem: `?ticket=` nếu là của khách này → thẻ máy chứa nó mở; không thì thẻ đầu + ticket mới nhất của thẻ đó.
  const q = sp.get('ticket')
  const xem = q && tickets.some((t) => t.ticket_code === q) ? q : null
  const nhom = gomTicketTheoMay(tickets, dongLoi, may, xem)
  const theMo = xem ? nhom.findIndex((n) => n.tickets.some((t) => t.ticket_code === xem)) : 0
  const ticketMo = xem ?? nhom[0]?.tickets[0]?.ticket_code ?? null
  const theoSerial = new Map(may.map((m) => [m.serial, m]))

  const noiDung: Record<TabHoSo, ReactNode> = {
    ticket: (
      <>
        {nhom.map((n, i) => (
          <TheMay
            key={n.serial ?? ''}
            n={n}
            may={n.serial ? theoSerial.get(n.serial) : undefined}
            moSan={i === theMo}
            ticketMo={ticketMo}
            demo={demo}
          />
        ))}
        {nhom.length === 0 && (
          <TheGap tieuDe="Máy" data-module="may-ticket">
            <EmptyState size="sm" tieuDe="Chưa có máy nào" />
          </TheGap>
        )}
      </>
    ),
    'thong-tin': (
      <>
        <KhoiLienHe lienHe={lienHe} />
        <KhoiDiaChi diaChi={khach.diaChi} tinh={khach.tinh} phu={diaChiPhu} />
        <TheGap tieuDe="Kênh" data-module="kenh">
          <PropertyList layout="stack">
            <PropertyRow nhan="Kênh / đối tác">{kenh}</PropertyRow>
          </PropertyList>
        </TheGap>
        <KhoiMay may={may} demo={demo} />
      </>
    ),
    'bao-tri': (
      <>
        <KhoiBaoTri baoTri={baoTri} />
        <TheGap tieuDe="Lõi lọc" data-module="loi-loc">
          <EmptyState size="sm" tieuDe="Chưa nối dữ liệu lõi" />
        </TheGap>
      </>
    ),
  }

  const day = tab === 'thong-tin'
  return (
    <TrangDuLieu>
      <PageHeader
        tieuDe={khach.ten}
        meta={[khach.tinh, khach.maKh && <span key="ma" className="tabular-nums">{khach.maKh}</span>].filter(Boolean)}
      />
      <Tabs value={tab} onValueChange={doiTab} className="mt-4">
        <TabsList variant="line" aria-label="Phần hồ sơ khách">
          {TAB.map((t) => (
            <TabsTrigger key={t.gt} value={t.gt}>
              {t.nhan}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-4 grid items-start gap-4 border-none border-current min-[1200px]:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
          <div className="border-none border-current min-[1200px]:sticky min-[1200px]:top-4 min-[1200px]:col-start-2 min-[1200px]:row-start-1">
            <TheGap tieuDe="Khách" data-module="khach">
              <PropertyList layout="stack">
                <PropertyRow nhan="Tên">{khach.ten}</PropertyRow>
                <PropertyRow nhan="SĐT">{khach.sdt && <span className="tabular-nums">{khach.sdt}</span>}</PropertyRow>
                <PropertyRow nhan="Tỉnh/TP">{khach.tinh}</PropertyRow>
                <PropertyRow nhan="Phụ trách">{khach.phuTrach}</PropertyRow>
                {day && (
                  <>
                    <PropertyRow nhan="Địa chỉ">{khach.diaChi}</PropertyRow>
                    <PropertyRow nhan="Nguồn">{khach.nguon}</PropertyRow>
                    <PropertyRow nhan="Mã khách">{khach.maKh && <span className="tabular-nums">{khach.maKh}</span>}</PropertyRow>
                    <PropertyRow nhan="Mã Sales">{khach.maSales && <span className="tabular-nums">{khach.maSales}</span>}</PropertyRow>
                  </>
                )}
              </PropertyList>
            </TheGap>
          </div>
          {TAB.map((t) => (
            <TabsContent
              key={t.gt}
              value={t.gt}
              className="flex min-w-0 flex-col gap-4 pt-0 min-[1200px]:col-start-1 min-[1200px]:row-start-1"
            >
              {noiDung[t.gt]}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </TrangDuLieu>
  )
}

/**
 * Một máy của khách: đầu thẻ tên + serial mờ (khổ hẹp cắt "…") · `thaoTac` chip BH + số ticket (không cắt); thân = Bảo hành
 * đến · Ngày lắp (máy của khách) · Lỗi đã báo (chip `Mã ×n`) + ticket của máy, mới → cũ (dòng ticket không lặp tên máy).
 */
function TheMay({
  n,
  may,
  moSan,
  ticketMo,
  demo,
}: {
  n: NhomMay<Ticket>
  may: MayHoSo | undefined
  moSan: boolean
  ticketMo: string | null
  demo: boolean
}) {
  return (
    <TheGap
      data-module="may-ticket"
      data-may={n.serial ?? ''}
      moSan={moSan}
      khit
      tieuDe={
        <span>
          {n.serial === null ? 'Chưa rõ máy' : (n.ten ?? 'Chưa rõ tên máy')}
          {n.serial && <span className="font-normal tabular-nums text-muted-foreground"> {n.serial}</span>}
        </span>
      }
      thaoTac={
        <span className="flex items-center gap-2 border-none border-current">
          {may && (
            <Badge variant="soft" color={BH[loaiBh(may)].color}>
              {BH[loaiBh(may)].nhan}
            </Badge>
          )}
          <span className="whitespace-nowrap tabular-nums text-muted-foreground">{n.tickets.length} ticket</span>
        </span>
      }
    >
      <div className="mx-4 border-0 border-b border-solid border-(--border) py-3">
        <PropertyList>
          {may && (
            <>
              <PropertyRow nhan="Bảo hành đến">
                {may.warranty_full_end && <span className="tabular-nums">{hienNgay(may.warranty_full_end)}</span>}
              </PropertyRow>
              <PropertyRow nhan="Ngày lắp">{may.install_date && <span className="tabular-nums">{hienNgay(may.install_date)}</span>}</PropertyRow>
            </>
          )}
          <PropertyRow nhan="Lỗi đã báo">
            {n.loi.length > 0 && (
              <span className="flex min-w-0 flex-wrap gap-1 border-none border-current">
                {n.loi.map((l) => (
                  <Badge key={l.code} variant="soft" color="secondary" title={l.ten} className="tabular-nums">
                    {`${l.ten === 'Chưa phân loại' ? l.ten : l.code} ×${l.so_lan}`}
                  </Badge>
                ))}
              </span>
            )}
          </PropertyRow>
        </PropertyList>
      </div>
      {n.tickets.length === 0 ? (
        <div className="border-none border-current px-4 pt-3 pb-4">
          <EmptyState size="sm" tieuDe="Chưa có ticket" />
        </div>
      ) : (
        n.tickets.map((t, i) => (
          <DongTicket
            key={t.ticket_code}
            t={t}
            moSan={t.ticket_code === ticketMo}
            cuoi={i === n.tickets.length - 1}
            anMay={n.serial !== null}
            demo={demo}
          />
        ))
      )}
    </TheGap>
  )
}

/** Một ticket gập/mở tới các lần lỗi. `anMay` = đang nằm trong thẻ máy → không lặp tên máy. */
function DongTicket({ t, moSan, cuoi, anMay, demo }: { t: Ticket; moSan: boolean; cuoi: boolean; anMay: boolean; demo: boolean }) {
  const [mo, setMo] = useState(moSan)
  const tt = TT.find((m) => m.gt === t.state)
  return (
    <Collapsible open={mo} onOpenChange={setMo} data-ticket={t.ticket_code}>
      <div className={cn('border-none border-current', !cuoi && 'border-0 border-b border-solid border-(--border)')}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex min-h-12 w-full cursor-pointer items-center gap-2 border-none bg-transparent px-4 py-2 text-left [font:inherit] text-inherit',
              'hover:bg-(--alpha-03) [outline:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-(--ring)',
            )}
          >
            <span className="shrink-0 whitespace-nowrap font-semibold tabular-nums">{t.ticket_code}</span>
            <span className="min-w-0 truncate text-muted-foreground">
              · {t.ticket_type ?? 'Ticket'}
              {!anMay && ` · ${t.product_name ?? 'chưa có máy'}`}
            </span>
            {tt && (
              <Badge variant="soft" color={tt.color} className="shrink-0">
                <BadgeDot />
                {tt.nhan}
              </Badge>
            )}
            <span className="ml-auto shrink-0 tabular-nums text-muted-foreground">{hienNgay(t.created_at)}</span>
            <CaretDown aria-hidden="true" className={cn('size-4 shrink-0 text-muted-foreground transition-transform', mo && 'rotate-180')} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-none border-current px-4 pb-4">
            {demo ? (
              <DsTheLan
                ds={[{ so: 1, ngay: t.created_at.slice(0, 10), khach: t.description, xuLy: t.last_note, vatTu: [] }]}
                nguoi={t.ky_thuat_ten ?? t.cs_ten ?? 'CSKH'}
              />
            ) : (
              <LanLoiThat t={t} />
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

/** Liên hệ (chỉ đọc): SĐT chính trước. */
function KhoiLienHe({ lienHe }: { lienHe: LienHeHoSo[] }) {
  return (
    <TheGap tieuDe={<>Liên hệ <Dem n={lienHe.length} /></>} data-module="lien-he">
      {lienHe.length === 0 ? (
        <EmptyState size="sm" tieuDe="Chưa có" />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 border-none border-current p-0">
          {lienHe.map((c) => (
            <li key={c.id} className="flex min-w-0 items-center gap-2 border-none border-current">
              <span className="shrink-0 tabular-nums">{c.sdt ?? 'Chưa có SĐT'}</span>
              {(c.ten || c.vaiTro) && (
                <span className="min-w-0 truncate text-muted-foreground">· {[c.ten, c.vaiTro].filter(Boolean).join(' · ')}</span>
              )}
              {c.chinh && (
                <Badge variant="soft" color="secondary" className="ml-auto shrink-0">
                  Chính
                </Badge>
              )}
            </li>
          ))}
        </ul>
      )}
    </TheGap>
  )
}

/** Địa chỉ (chỉ đọc): địa chỉ chính của hồ sơ + địa chỉ phụ (nhà / công ty / lắp đặt). */
function KhoiDiaChi({ diaChi, tinh, phu }: { diaChi: string | null; tinh: string | null; phu: DiaChiHoSo[] }) {
  const ds = [...(diaChi ? [{ id: 'chinh', diaChi, loai: 'Chính', tinh }] : []), ...phu]
  return (
    <TheGap tieuDe={<>Địa chỉ <Dem n={ds.length} /></>} data-module="dia-chi">
      {ds.length === 0 ? (
        <EmptyState size="sm" tieuDe="Chưa có" />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 border-none border-current p-0">
          {ds.map((d) => (
            <li key={d.id} className="flex min-w-0 items-center gap-2 border-none border-current">
              <span className="shrink-0 text-muted-foreground">{d.loai}</span>
              <span className="min-w-0 truncate">
                {d.diaChi}
                {d.tinh && <span className="text-muted-foreground"> · {d.tinh}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </TheGap>
  )
}

/** Sản phẩm đã mua = bảng inline: ảnh · tên + mã · serial · bảo hành (CEO 27/11). */
function KhoiMay({ may, demo }: { may: MayHoSo[]; demo: boolean }) {
  const router = useRouter()
  return (
    <TheGap tieuDe={<>Sản phẩm đã mua <Dem n={may.length} /></>} data-module="may" khit={may.length > 0}>
      {may.length === 0 ? (
        <EmptyState size="sm" tieuDe="Chưa có máy nào" />
      ) : (
        <ListView<MayHoSo>
          aria-label="Sản phẩm đã mua"
          cot={[
            {
              id: 'sp',
              ten: 'Sản phẩm',
              rong: 'minmax(0,1fr)',
              dienThoai: 'tren',
              o: (m) => (
                <span className="flex min-w-0 items-center gap-3 border-none border-current">
                  <span
                    aria-hidden="true"
                    className="grid size-8 shrink-0 place-content-center rounded-(--radius-md) border-none border-current bg-(--alpha-05) text-muted-foreground [&_svg]:size-4"
                  >
                    <Cube />
                  </span>
                  <span className="flex min-w-0 flex-col border-none border-current">
                    <span className="truncate">{m.product_name ?? 'Chưa rõ tên máy'}</span>
                    {m.internal_code && <span className="text-[12px] leading-[18px] tabular-nums text-muted-foreground">{m.internal_code}</span>}
                  </span>
                </span>
              ),
            },
            { id: 'serial', ten: 'Serial', rong: '150px', dienThoai: 'duoi', o: (m) => <span className="tabular-nums">{m.serial}</span> },
            {
              id: 'lap',
              ten: 'Ngày lắp',
              rong: '96px',
              anKhiHep: true,
              o: (m) => <span className="tabular-nums text-muted-foreground">{m.install_date ? hienNgay(m.install_date) : '—'}</span>,
            },
            { id: 'bh', ten: 'Bảo hành', rong: '112px', dienThoai: 'trenPhai', o: (m) => <ChuBh m={m} /> },
          ]}
          dong={may}
          khoa={(m) => m.serial}
          // Ticket demo: máy demo không có trang máy thật.
          onMo={(m) => !demo && router.push(`/may/${encodeURIComponent(m.serial)}`)}
        />
      )}
    </TheGap>
  )
}

const BH = {
  chua: { nhan: 'Chưa kích hoạt', color: 'secondary' },
  het: { nhan: 'Hết BH', color: 'danger' },
  con: { nhan: 'Còn BH', color: 'success' },
} as const
const loaiBh = (m: MayHoSo): keyof typeof BH =>
  !m.warranty_activated ? 'chua' : m.warranty_full_end && m.warranty_full_end < new Date().toISOString().slice(0, 10) ? 'het' : 'con'

function ChuBh({ m }: { m: MayHoSo }) {
  const k = loaiBh(m)
  return <span className={k === 'het' ? 'text-(--color-text-danger)' : 'text-muted-foreground'}>{BH[k].nhan}</span>
}

function KhoiBaoTri({ baoTri }: { baoTri: BaoTriHoSo[] }) {
  const xong = baoTri.filter((v) => v.xong).length
  return (
    <TheGap tieuDe={<>Bảo trì <Dem n={baoTri.length} chu={baoTri.length ? `${xong}/${baoTri.length} đã làm` : undefined} /></>} data-module="baotri">
      {baoTri.length === 0 ? (
        <EmptyState size="sm" tieuDe="Chưa có lịch bảo trì" />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 border-none border-current p-0">
          {baoTri.map((v) => (
            <li key={v.id} className="flex items-center gap-2 border-none border-current">
              <span className="text-muted-foreground">Lần {v.lan ?? '?'}</span>
              <span className="tabular-nums">{v.ngay ? hienNgay(v.ngay) : '—'}</span>
              {v.boMay && <span className="min-w-0 truncate text-muted-foreground">· {v.boMay}</span>}
              <Badge variant="soft" color={v.xong ? 'success' : 'warning'} className="ml-auto shrink-0">
                {v.xong ? 'Đã làm' : 'Chưa làm'}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </TheGap>
  )
}

const Dem = ({ n, chu }: { n: number; chu?: string }) => (
  <span className="font-normal tabular-nums text-muted-foreground">· {chu ?? n}</span>
)

/** Link "Xem hồ sơ khách" dùng ở chỗ khác (vd ⤢ Xem nhanh ticket): tab Ticket, ticket đang xem mở sẵn. */
export const duongHoSoKhach = (id: string, ticket?: string) =>
  `/khach/${encodeURIComponent(id)}?tab=ticket${ticket ? `&ticket=${encodeURIComponent(ticket)}` : ''}`
