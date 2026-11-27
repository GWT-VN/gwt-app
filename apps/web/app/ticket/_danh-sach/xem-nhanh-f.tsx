'use client'

// Thẻ Xem nhanh của danh sách ticket F (/ticket) theo bố cục panel bản ghi của Twenty (CEO duyệt 26/11 "Duyệt, dựng đi"):
// đầu thẻ mã + khách (+ Khẩn) · hàng tab line có icon (gom "+N Thêm") · Tổng quan = các nhóm trường gập/mở, dòng icon +
// nhãn + giá trị, trống hiện tên trường mờ · thanh thao tác dính đáy (⋮ + Hẹn KTV). Học BỐ CỤC + HÀNH VI, giao diện là DS
// (XemNhanh `tab`/`chan`/`co`, Tabs line `thuGon`, Accordion, PropertyList `trong`). Chưa gọi mutation — nối ở bước 4
// (docs/rework/2026-11-26-ticket-f-dung-that.md). Lần lỗi mượn khối của prototype chi tiết (ct-gon) tới khi chi tiết dựng thật.
import Link from 'next/link'
import {
  AddressBook,
  Barcode,
  CalendarPlus,
  ChatText,
  CircleHalf,
  Clock,
  ClockCounterClockwise,
  Copy,
  Cube,
  DotsThreeVertical,
  House,
  MapPin,
  Package,
  Phone,
  Plus,
  ShieldCheck,
  Tag,
  Ticket as IconTicket,
  User,
  UserCircle,
  Wrench,
  ArrowSquareOut,
  LinkSimple,
} from '@phosphor-icons/react/ssr'
import type { ReactNode } from 'react'
import type { Ticket } from '@/app/actions'
import { NhanKetQua, NoiDungLan, TRUOC } from '@/app/ticket/[code]/_prototype/ct-gon'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { OSuaNguoi, OSuaTrangThai } from '@/components/ui/inline-edit'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { thongBao } from '@/components/ui/sonner'
import { Timeline, type MucTimeline } from '@/components/ui/timeline'
import type { XemNhanh } from '@/components/ui/xem-nhanh'
import { chuaLuu, cheSdt, laDemo, mayLoi, ngayGioNgan, ngayNgan, tenKhach } from './chung'
import { LanLoiThat, NhatKyThat, TicketKhacThat, VatTuThat, ViecDaGan } from './the-tab'
import { ChuBaoHanh, laKhan, TT, type DongF } from './ds-f'
import type { SuaTruong } from './sua-ticket'

type Luu = ((patch: SuaTruong) => Promise<void>) | null
type NhanVien = { gt: string; nhan: string; anMa?: boolean }[]

/** Tab của thẻ — `xem_tab` trên URL (mặc định `tong` không ghi). */
export const TAB_XEM = ['tong', 'lan', 'nk', 'vt', 'khac'] as const
export type TabXem = (typeof TAB_XEM)[number]

const ngayGio = ngayGioNgan

/**
 * Một dòng trường: icon + nhãn mờ (cột trái) · giá trị; trống → "—". Không lặp tên trường ở ô giá trị như Twenty: CEO
 * duyệt bỏ 26/11 ("Sửa luôn") — chữ mờ "Tên máy" nằm cạnh nhãn "Tên máy" trông như đã có dữ liệu.
 */
function Truong({ icon, nhan, children }: { icon: ReactNode; nhan: string; children?: ReactNode }) {
  return (
    <PropertyRow
      nhan={
        <>
          {icon}
          {nhan}
        </>
      }
      trong="—"
    >
      {children}
    </PropertyRow>
  )
}

function TongQuan({ t, nhanVien, luu, lanViec }: { t: DongF; nhanVien: NhanVien; luu: Luu; lanViec: number }) {
  const ic = (I: typeof User) => <I aria-hidden="true" />
  return (
    <Accordion type="multiple" defaultValue={['ticket', 'may', 'khach', 'viec', 'he-thong']}>
      <AccordionItem value="ticket">
        <AccordionTrigger>Ticket</AccordionTrigger>
        <AccordionContent>
          <PropertyList>
            <Truong icon={ic(CircleHalf)} nhan="Trạng thái">
              {/* Lưu DB thật (updateTicket) — lạc quan + Hoàn tác của InlineEdit; không quyền sửa → chỉ đọc. */}
              {luu ? (
                <OSuaTrangThai ma={t.ticket_code} value={{ tt: t.state }} muc={TT} onLuu={(v) => luu({ state: v.tt as Ticket['state'] })} />
              ) : (
                <Badge variant="soft" color={TT.find((m) => m.gt === t.state)?.color}>
                  <BadgeDot />
                  {TT.find((m) => m.gt === t.state)?.nhan}
                </Badge>
              )}
            </Truong>
            <Truong icon={ic(User)} nhan="Phụ trách">
              {luu ? (
                <OSuaNguoi
                  ma={t.ticket_code}
                  truong="người phụ trách"
                  value={t.cs_phu_trach}
                  mucDangChon={t.cs_phu_trach ? { gt: t.cs_phu_trach, nhan: t.cs_ten ?? '—' } : undefined}
                  options={nhanVien}
                  onLuu={(v) => luu({ cs_phu_trach: v })}
                />
              ) : (
                t.cs_ten
              )}
            </Truong>
            <Truong icon={ic(Tag)} nhan="Loại">
              {t.ticket_type}
            </Truong>
            <Truong icon={ic(Wrench)} nhan="Kỹ thuật">
              {t.ky_thuat_ten}
            </Truong>
          </PropertyList>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="may">
        <AccordionTrigger>Máy</AccordionTrigger>
        <AccordionContent>
          <PropertyList>
            <Truong icon={ic(Cube)} nhan="Tên máy">
              {t.product_name}
            </Truong>
            <Truong icon={ic(Barcode)} nhan="Serial">
              {t.source_serial && <span className="tabular-nums">{t.source_serial}</span>}
            </Truong>
            {/* Bảo hành là CHỮ (một nhãn màu mỗi khối — nhãn đó là Trạng thái); màu chữ chỉ khi hết BH. */}
            <Truong icon={ic(ShieldCheck)} nhan="Bảo hành">
              {t.serial && (
                <span className="border-none border-current">
                  <ChuBaoHanh t={t} />
                  {t.warranty_full_end && <span className="tabular-nums text-muted-foreground"> · đến {ngayNgan(t.warranty_full_end)}</span>}
                </span>
              )}
            </Truong>
          </PropertyList>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="khach">
        <AccordionTrigger>Khách</AccordionTrigger>
        <AccordionContent>
          <PropertyList>
            <Truong icon={ic(AddressBook)} nhan="Tên khách">
              {t.customer_name}
            </Truong>
            <Truong icon={ic(Phone)} nhan="SĐT">
              {cheSdt(t.primary_phone) && <span className="tabular-nums">{cheSdt(t.primary_phone)}</span>}
            </Truong>
            <Truong icon={ic(MapPin)} nhan="Tỉnh/TP">
              {t.province}
            </Truong>
          </PropertyList>
        </AccordionContent>
      </AccordionItem>
      {!laDemo(t.ticket_code) && (
        <AccordionItem value="viec">
          <AccordionTrigger>Việc đã gắn</AccordionTrigger>
          <AccordionContent>
            {/* Chỉ danh sách — nút "Gắn việc" có một chỗ duy nhất ở thanh đáy (CEO 26/11: bỏ nút trùng). */}
            <ViecDaGan t={t} lan={lanViec} />
          </AccordionContent>
        </AccordionItem>
      )}
      <AccordionItem value="he-thong">
        <AccordionTrigger>Hệ thống</AccordionTrigger>
        <AccordionContent>
          <PropertyList>
            <Truong icon={ic(Clock)} nhan="Ngày tạo">
              <span className="tabular-nums">{ngayGio(t.created_at)}</span>
            </Truong>
            {/* Danh sách chưa kèm người tạo (DB có ở trang chi tiết) → trường trống, hiện tên mờ. */}
            <Truong icon={ic(UserCircle)} nhan="Người tạo" />
            <Truong icon={ic(ClockCounterClockwise)} nhan="Hoạt động cuối">
              {t.hoat_dong_cuoi && <span className="tabular-nums">{ngayGio(t.hoat_dong_cuoi)}</span>}
            </Truong>
          </PropertyList>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

/** Lần lỗi: danh sách chỉ có lần 1 (mô tả + ghi chú cuối) — các lần sau nằm ở trang chi tiết. */
function LanLoi({ t }: { t: DongF }) {
  const lan = { so: 1, ngay: t.created_at.slice(0, 10), khach: t.description, xuLy: t.last_note, vatTu: [] }
  return (
    <Accordion type="multiple" defaultValue={['1']}>
      <AccordionItem value="1">
        <AccordionTrigger>
          <span className="flex flex-wrap items-center gap-2 border-none border-current">
            Lần 1<span className="font-normal tabular-nums text-muted-foreground">· khách báo {ngayNgan(t.created_at)}</span>
            <NhanKetQua lan={lan} />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <NoiDungLan lan={lan} nguoi={t.ky_thuat_ten ?? t.cs_ten ?? 'CSKH'} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

/** Nhật ký (Demo): tạo ticket + ghi chú cuối, cũ → mới. */
function NhatKy({ t }: { t: DongF }) {
  const muc: MucTimeline[] = [
    { id: 'tao', ai: t.cs_ten ?? 'CSKH', loai: 'tạo ticket', luc: t.created_at, icon: <Plus aria-hidden="true" /> },
    ...(t.last_note
      ? [
          {
            id: 'note',
            ai: t.ky_thuat_ten ?? t.cs_ten ?? 'CSKH',
            loai: 'ghi chú',
            luc: t.hoat_dong_cuoi ?? t.created_at,
            noiDung: <span className="whitespace-pre-line">{t.last_note}</span>,
          },
        ]
      : []),
  ]
  return (
    <div className="flex flex-col gap-3 border-none border-current">
      <Timeline muc={muc} aria-label={`Nhật ký ${t.ticket_code}`} />
      <p className="m-0 ds-text-xs text-muted-foreground">Demo — nhật ký đầy đủ và ô ghi chú ở trang chi tiết.</p>
    </div>
  )
}

/** Vật tư (Demo theo loại ticket — DB danh sách chưa kèm vật tư). */
function VatTu({ t }: { t: DongF }) {
  const ds = t.ticket_type === 'Thay lõi' ? ['Bộ lõi lọc 1-2-3'] : t.ticket_type === 'Sửa chữa' ? ['Van điện từ cấp nước', 'Gioăng khớp nối'] : []
  const nut = (
    <Button variant="outline" size="sm" onClick={chuaLuu}>
      <Plus aria-hidden="true" />
      Ghi linh kiện
    </Button>
  )
  if (!ds.length) return <EmptyState size="sm" tieuDe="Chưa ghi vật tư" moTa="Linh kiện thay cho ticket này sẽ hiện ở đây.">{nut}</EmptyState>
  return (
    <div className="flex flex-col items-start gap-3 border-none border-current">
      <ItemGroup className="gap-2 self-stretch">
        {ds.map((x) => (
          <Item key={x} size="sm" variant="outline">
            <ItemContent>
              <ItemTitle>{x}</ItemTitle>
              <ItemDescription>Demo · 1 cái</ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
      {nut}
    </div>
  )
}

/**
 * Ticket khác cùng khách / cùng máy — trong dữ liệu đang tải (trang hiện tại). Ticket Demo (DB local trống, serial/khách
 * không trùng nhau) → mượn 3 ticket Demo của trang chi tiết (`TRUOC`) để thấy dạng có dữ liệu.
 */
function TicketKhac({ t, rows, moDuoc, onMo }: { t: DongF; rows: DongF[]; moDuoc: (ma: string) => boolean; onMo: (ma: string) => void }) {
  const ds = rows.filter(
    (x) => x.ticket_code !== t.ticket_code && ((t.customer_id && x.customer_id === t.customer_id) || (t.serial && x.serial === t.serial)),
  )
  if (!ds.length && t.ticket_code.startsWith('DEMO-'))
    return (
      <div className="flex flex-col gap-3 border-none border-current">
        <ItemGroup className="gap-2">
          {TRUOC.map((x) => (
            <Item key={x.ma} size="sm" variant="outline" asChild>
              <Link href={`/ticket/${encodeURIComponent(x.ma)}?variant=G`} prefetch={false}>
                <ItemContent>
                  <ItemTitle>
                    <span className="tabular-nums">{x.ma}</span> · {x.viec}
                  </ItemTitle>
                  <ItemDescription>
                    <span className="tabular-nums">Khách báo {ngayNgan(x.ngay)}</span> · {x.vi}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Badge variant="soft" color="success">
                    Đã xong
                  </Badge>
                </ItemActions>
              </Link>
            </Item>
          ))}
        </ItemGroup>
        <p className="m-0 ds-text-xs text-muted-foreground">Demo — dữ liệu minh hoạ, chưa truy vấn theo serial / khách.</p>
      </div>
    )
  if (!ds.length)
    return <EmptyState size="sm" tieuDe="Không có ticket khác" moTa="Khách và máy này chưa có ticket nào khác trong danh sách đang tải." />
  return (
    <ItemGroup className="gap-2">
      {ds.map((x) => {
        const nd = (
          <>
            <ItemContent>
              <ItemTitle>
                <span className="tabular-nums">{x.ticket_code}</span> · {mayLoi(x)}
              </ItemTitle>
              <ItemDescription>
                <span className="tabular-nums">Tạo {ngayNgan(x.created_at)}</span> · {t.serial && x.serial === t.serial ? 'Cùng máy' : 'Cùng khách'}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge variant="soft" color={TT.find((m) => m.gt === x.state)?.color}>
                <BadgeDot />
                {TT.find((m) => m.gt === x.state)?.nhan}
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
              <Link href={`/ticket/${encodeURIComponent(x.ticket_code)}?variant=G`}>{nd}</Link>
            )}
          </Item>
        )
      })}
    </ItemGroup>
  )
}

/** Thanh dính đáy: ⋮ (mở trang chi tiết, sao chép mã) · Gắn việc · Hẹn KTV (luồng hẹn có sẵn ở trang chi tiết). */
function ThanhThaoTac({ t, moGanViec }: { t: DongF; moGanViec: (() => void) | null }) {
  const chiTiet = `/ticket/${encodeURIComponent(t.ticket_code)}${laDemo(t.ticket_code) ? '?variant=G' : ''}`
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Thao tác khác cho ${t.ticket_code}`}>
            <DotsThreeVertical aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top">
          <DropdownMenuItem asChild>
            <Link href={chiTiet}>
              <ArrowSquareOut aria-hidden="true" />
              Mở trang chi tiết
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              void navigator.clipboard?.writeText(t.ticket_code)
              thongBao.xong(`Đã sao chép ${t.ticket_code}`)
            }}
          >
            <Copy aria-hidden="true" />
            Sao chép mã
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {moGanViec && (
        <Button variant="outline" size="sm" onClick={moGanViec}>
          <LinkSimple aria-hidden="true" />
          Gắn việc
        </Button>
      )}
      <Button size="sm" asChild>
        <Link href={chiTiet} prefetch={false}>
          <CalendarPlus aria-hidden="true" />
          Hẹn KTV
        </Link>
      </Button>
    </>
  )
}

type The = NonNullable<Parameters<typeof XemNhanh>[0]['the']>

/** Dữ liệu `the` của XemNhanh cho một ticket F. */
export function theXemNhanhF({
  t,
  rows,
  nhanVien,
  luu,
  tab,
  onTab,
  moDuoc,
  onMo,
  lanViec,
  moGanViec,
}: {
  t: DongF
  rows: DongF[]
  nhanVien: NhanVien
  /** Lưu trạng thái / phụ trách (updateTicket); null = không quyền sửa → chỉ đọc. */
  luu: Luu
  tab: TabXem
  onTab: (v: TabXem) => void
  moDuoc: (ma: string) => boolean
  onMo: (ma: string) => void
  /** Tăng sau mỗi lần Gắn việc → khối "Việc đã gắn" đọc lại. */
  lanViec: number
  moGanViec: () => void
}): The {
  const demo = laDemo(t.ticket_code)
  return {
    ma: t.ticket_code,
    // "MÃ · Tên khách" (CEO 26/11 "đổi lại ticket ở đầu"); khẩn → MÃ đỏ + sr-only "Khẩn: ".
    khan: laKhan(t),
    phu: tenKhach(t),
    tab: {
      value: tab,
      onDoi: (v) => onTab(v as TabXem),
      ds: [
        {
          gt: 'tong',
          nhan: 'Tổng quan',
          icon: <House aria-hidden="true" />,
          noiDung: <TongQuan key={t.ticket_code} t={t} nhanVien={nhanVien} luu={luu} lanViec={lanViec} />,
        },
        // Ticket thật: đọc DB (the-tab.tsx); ticket Demo (bộ nhớ): khối Demo bên dưới.
        { gt: 'lan', nhan: 'Lần lỗi', icon: <Wrench aria-hidden="true" />, noiDung: demo ? <LanLoi key={t.ticket_code} t={t} /> : <LanLoiThat key={t.ticket_code} t={t} /> },
        { gt: 'nk', nhan: 'Nhật ký', icon: <ChatText aria-hidden="true" />, noiDung: demo ? <NhatKy t={t} /> : <NhatKyThat key={t.ticket_code} t={t} choGhi={!!luu} /> },
        { gt: 'vt', nhan: 'Vật tư', icon: <Package aria-hidden="true" />, noiDung: demo ? <VatTu t={t} /> : <VatTuThat key={t.ticket_code} t={t} /> },
        {
          gt: 'khac',
          nhan: 'Ticket khác',
          icon: <IconTicket aria-hidden="true" />,
          noiDung: demo ? <TicketKhac t={t} rows={rows} moDuoc={moDuoc} onMo={onMo} /> : <TicketKhacThat key={t.ticket_code} t={t} moDuoc={moDuoc} onMo={onMo} />,
        },
      ],
    },
    chan: <ThanhThaoTac t={t} moGanViec={luu && !demo ? moGanViec : null} />,
  }
}
