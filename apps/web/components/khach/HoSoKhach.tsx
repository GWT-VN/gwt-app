'use client'

/**
 * HỒ SƠ KHÁCH — màn "view full" của một khách (CEO 27/11: "view full ở đây là coi như view full một KH luôn… chuyển các tab
 * thành các dạng module… thêm phần filter để chỉnh view"; chốt 2 cột). Khách là trục: ticket, máy, bảo trì đều nối qua khách.
 * - ≥ 1200: 2 cột — TRÁI các module (`TheGap`) theo thứ tự của view đang chọn, PHẢI thẻ Khách (dính khi cuộn; CEO 27/11).
 *   < 1200: 1 cột, thẻ Khách lên đầu.
 * - View (`?view=`): Ticket trước (mặc định khi mở từ ticket) · Thông tin trước (sản phẩm + bảo trì) · Bảo trì trước. Đổi view
 *   chỉ đổi THỨ TỰ module, không đổi bộ module.
 * - `ticketMo` (`?ticket=`): ticket đang xem mở sẵn tới các lần lỗi; ticket khác gập.
 * Ảnh sản phẩm: app chưa có nguồn ảnh → ô vuông icon (ponytail: thay bằng ảnh catalog khi có cột ảnh).
 */
import { useState, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CaretDown, Cube, Eye } from '@phosphor-icons/react/ssr'
import type { Ticket } from '@/app/actions'
import { TT } from '@/app/ticket/_danh-sach/ds-f'
import { DsTheLan } from '@/app/ticket/_danh-sach/the-lan'
import { LanLoiThat } from '@/app/ticket/_danh-sach/the-tab'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { ListView } from '@/components/ui/list-view'
import { PageHeader } from '@/components/ui/page-header'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { TheGap } from '@/components/ui/the-gap'
import { hienNgay } from '@/lib/dinh-dang-ngay'
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

const VIEW = [
  { gt: 'ticket', nhan: 'Ticket trước', thuTu: ['ticket', 'may', 'baotri'] },
  { gt: 'thong-tin', nhan: 'Thông tin trước', thuTu: ['may', 'baotri', 'ticket'] },
  { gt: 'bao-tri', nhan: 'Bảo trì trước', thuTu: ['baotri', 'ticket', 'may'] },
] as const
type View = (typeof VIEW)[number]['gt']

export function HoSoKhach({
  khach,
  may,
  tickets,
  baoTri,
  demo,
}: {
  khach: KhachHoSo
  may: MayHoSo[]
  tickets: Ticket[]
  baoTri: BaoTriHoSo[]
  demo: boolean
}) {
  const sp = useSearchParams()
  const router = useRouter()
  const duong = usePathname()
  const [view, setView] = useState<View>(() => (VIEW.find((v) => v.gt === sp.get('view'))?.gt ?? 'ticket') as View)
  const ticketMo = sp.get('ticket')
  const doiView = (v: View) => {
    setView(v)
    const q = new URLSearchParams(sp.toString())
    q.set('view', v)
    router.replace(`${duong}?${q}`, { scroll: false })
  }
  const dangView = VIEW.find((v) => v.gt === view)!

  const khoi: Record<string, ReactNode> = {
    ticket: <KhoiTicket key="ticket" tickets={tickets} ticketMo={ticketMo} demo={demo} />,
    may: <KhoiMay key="may" may={may} demo={demo} />,
    baotri: <KhoiBaoTri key="baotri" baoTri={baoTri} />,
  }

  return (
    <TrangDuLieu>
      <PageHeader
        tieuDe={khach.ten}
        meta={[khach.tinh, khach.maKh && <span key="ma" className="tabular-nums">{khach.maKh}</span>].filter(Boolean)}
        hanhDong={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye aria-hidden="true" />
                {dangView.nhan}
                <CaretDown aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px]">
              <DropdownMenuLabel>Thứ tự xem</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={view} onValueChange={(v) => doiView(v as View)}>
                {VIEW.map((v) => (
                  <DropdownMenuRadioItem key={v.gt} value={v.gt}>
                    {v.nhan}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <div className="mt-6 grid items-start gap-4 border-none border-current min-[1200px]:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        <div className="border-none border-current min-[1200px]:sticky min-[1200px]:top-4 min-[1200px]:col-start-2 min-[1200px]:row-start-1">
          <TheGap tieuDe="Khách" data-module="khach">
            <PropertyList layout="stack">
              <PropertyRow nhan="SĐT">{khach.sdt && <span className="tabular-nums">{khach.sdt}</span>}</PropertyRow>
              <PropertyRow nhan="Tỉnh/TP">{khach.tinh}</PropertyRow>
              <PropertyRow nhan="Địa chỉ">{khach.diaChi}</PropertyRow>
              <PropertyRow nhan="Nguồn">{khach.nguon}</PropertyRow>
              <PropertyRow nhan="Mã khách">{khach.maKh && <span className="tabular-nums">{khach.maKh}</span>}</PropertyRow>
              <PropertyRow nhan="Mã Sales">{khach.maSales && <span className="tabular-nums">{khach.maSales}</span>}</PropertyRow>
            </PropertyList>
          </TheGap>
        </div>
        <div className="flex min-w-0 flex-col gap-4 border-none border-current min-[1200px]:col-start-1 min-[1200px]:row-start-1">{dangView.thuTu.map((k) => khoi[k])}</div>
      </div>
    </TrangDuLieu>
  )
}

/** Ticket của khách: mới → cũ; ticket đang xem (`ticketMo`) mở sẵn tới các lần lỗi, không có thì mở ticket mới nhất. */
function KhoiTicket({ tickets, ticketMo, demo }: { tickets: Ticket[]; ticketMo: string | null; demo: boolean }) {
  const ds = [...tickets].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const mo = ticketMo && ds.some((t) => t.ticket_code === ticketMo) ? ticketMo : ds[0]?.ticket_code
  return (
    <TheGap tieuDe={<>Ticket <Dem n={ds.length} /></>} data-module="ticket" khit={ds.length > 0}>
      {ds.length === 0 ? (
        <EmptyState size="sm" tieuDe="Chưa có ticket" />
      ) : (
        ds.map((t, i) => <DongTicket key={t.ticket_code} t={t} moSan={t.ticket_code === mo} cuoi={i === ds.length - 1} demo={demo} />)
      )}
    </TheGap>
  )
}

function DongTicket({ t, moSan, cuoi, demo }: { t: Ticket; moSan: boolean; cuoi: boolean; demo: boolean }) {
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
              · {t.ticket_type ?? 'Ticket'} · {t.product_name ?? 'chưa có máy'}
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

function ChuBh({ m }: { m: MayHoSo }) {
  if (!m.warranty_activated) return <span className="text-muted-foreground">Chưa kích hoạt</span>
  const het = !!m.warranty_full_end && m.warranty_full_end < new Date().toISOString().slice(0, 10)
  return het ? <span className="text-(--color-text-danger)">Hết BH</span> : <span className="text-muted-foreground">Còn BH</span>
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

/** Link "Xem hồ sơ khách" dùng ở chỗ khác (vd ⤢ Xem nhanh ticket). */
export const duongHoSoKhach = (id: string, ticket?: string) =>
  `/khach/${encodeURIComponent(id)}?view=ticket${ticket ? `&ticket=${encodeURIComponent(ticket)}` : ''}`
