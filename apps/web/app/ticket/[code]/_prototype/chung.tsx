'use client'

// PROTOTYPE vứt đi — mảnh dùng chung của 3 phương án trang chi tiết ticket (?variant=A|B|C). Chỉ ghép component DS;
// ô sửa tại chỗ KHÔNG gọi server (state cục bộ + toast "Prototype — chưa lưu").
import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { CalendarPlus, ChatCircleText, Plus, Receipt, Wrench } from '@phosphor-icons/react/ssr'
import type { Ticket, TicketIssue, TicketMuc, TicketNote, MucDo } from '@/app/actions'
import type { DongMay, TrangThaiDong } from '@/lib/loi/kieu'
import type { LanLoi } from '@/lib/loi/lanLoi'
import type { TepNhatKy } from '@/lib/loi/tepNhatKy'
import type { NguoiTicket } from '@/app/ticket/nguoi-actions'
import type { Staff } from '@/lib/nen-tang/nhan-su-luat'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Composer } from '@/components/ui/composer'
import { OSuaNguoi, OSuaNhan, OSuaNhap, OSuaTrangThai, type MucNhan, type MucTrangThai } from '@/components/ui/inline-edit'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { thongBao } from '@/components/ui/sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import type { MucTimeline } from '@/components/ui/timeline'

export type DuLieuCt = {
  t: Ticket
  ngayBao: string | null
  csTheoDoi: string | null
  nhom: TicketIssue[]
  notes: TicketNote[]
  items: TicketMuc[]
  tenCatalog: Record<string, string>
  lanLoi: LanLoi[]
  dongMay: DongMay[]
  tepNK: TepNhatKy[]
  nguoi: NguoiTicket | null
  staff: Staff[]
  canhBao: string | null
  thieu: { dongMay: boolean; danhMuc: boolean; lanLoi: boolean }
  quyen: { lichKT: boolean; sua: boolean }
  ngayDau: string | null
  ngayCuoi: string | null
  soNgayMo: number | null
}

export const PA = [
  { ma: 'A', ten: 'Hai cột kiểu Linear' },
  { ma: 'B', ten: 'Hội thoại là chính' },
  { ma: 'C', ten: 'Theo tab' },
  { ma: 'D', ten: 'Chat với khách' },
  { ma: 'E', ten: 'Hồ sơ máy & khách' },
  { ma: 'F', ten: 'Đối chiếu từng lần' },
]

// ───────────── định dạng ─────────────
export const ngayVN = (d: string | null | undefined) => (d ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : '—')
export const cheSdt = (s: string | null) => (s ? `•••${s.replace(/\D/g, '').slice(-4)}` : null)
const tien = (n: number | null) => (n === null ? '—' : `${n.toLocaleString('vi-VN')} ₫`)

const TT: MucTrangThai[] = [
  { gt: 'Open', nhan: 'Đang mở', color: 'info' },
  { gt: 'Done', nhan: 'Đã xong', color: 'success' },
  { gt: 'Cancel', nhan: 'Đã huỷ' },
]
const KHAN: MucNhan<'1' | '0'>[] = [
  { gt: '1', nhan: <Badge variant="solid" color="danger">Khẩn</Badge>, chu: 'Khẩn' },
  { gt: '0', nhan: <Badge variant="soft">Thường</Badge>, chu: 'Thường' },
]
const MUC_DO: Record<MucDo, { nhan: string; color: 'danger' | 'warning' | 'secondary'; solid?: boolean }> = {
  an_toan: { nhan: 'An toàn', color: 'danger', solid: true },
  nghiem_trong: { nhan: 'Nghiêm trọng', color: 'danger' },
  thuong: { nhan: 'Thường', color: 'warning' },
  nhe: { nhan: 'Nhẹ', color: 'secondary' },
  khong_loi: { nhan: 'Không phải lỗi', color: 'secondary' },
}
const TT_DONG: Record<TrangThaiDong, { nhan: string; color: 'warning' | 'success' | 'secondary' }> = {
  dang_xu_ly: { nhan: 'Đang xử lý', color: 'warning' },
  da_xu_ly: { nhan: 'Đã xử lý', color: 'success' },
  khong_loi: { nhan: 'Không phải lỗi', color: 'secondary' },
}

const chuaLuu = () => thongBao.xong('Prototype — chưa lưu')

// ───────────── đầu trang ─────────────
export function BangPrototype({ pa, cach }: { pa: string; cach: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-none border-current">
      <Badge variant="soft" color="warning">Prototype</Badge>
      <Badge variant="soft" color="info">Phương án {pa}</Badge>
      <span className="ds-text-sm text-muted-foreground">{cach}</span>
    </div>
  )
}

export function DuongDan({ ma }: { ma: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/ticket">Ticket CSKH</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>{ma}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

/** Tiêu đề trang: câu khách báo lần 1 (ticket không có trường tiêu đề riêng); trống → mã. */
export const tieuDe = (d: DuLieuCt) => d.t.description?.split('\n')[0].trim() || d.t.ticket_code

export function meta(d: DuLieuCt): ReactNode[] {
  const { t } = d
  const soLan = 1 + d.lanLoi.length
  // Mã đã ở đường dẫn (mục cuối Breadcrumb) → meta không lặp lại.
  return [
    ...[t.ticket_type, t.product_name, t.province].filter(Boolean),
    t.state === 'Open' && d.soNgayMo !== null ? `Mở ${d.soNgayMo} ngày` : TT.find((x) => x.gt === t.state)?.nhan,
    `${soLan} lần lỗi${d.ngayCuoi ? ` · lần cuối ${ngayVN(d.ngayCuoi)}` : ''}`,
  ]
}

export function NutLichKT({ d }: { d: DuLieuCt }) {
  const { t } = d
  if (!d.quyen.lichKT || !t.customer_id) return null
  const href = `/ky-thuat?kh=${t.customer_id}&loai=ticket&ref=${encodeURIComponent(t.ticket_code)}&mota=${encodeURIComponent(t.description ?? '')}`
  return (
    <Button asChild variant="outline">
      <Link href={href}>
        <CalendarPlus aria-hidden="true" />
        Tạo lịch kỹ thuật
      </Link>
    </Button>
  )
}

export function CanhBao({ d }: { d: DuLieuCt }) {
  const { t } = d
  return (
    <>
      {d.canhBao && (
        <Alert color="warning">
          <AlertDescription>{d.canhBao}</AlertDescription>
        </Alert>
      )}
      {t.may_khong_trong_he_thong && (
        <Alert color="danger" role="note">
          <AlertTitle>Máy không có trong hệ thống</AlertTitle>
          <AlertDescription>
            Ticket gắn serial <span className="tabular-nums">{t.source_serial}</span> nhưng Odoo đang ghi máy là tồn kho dù đã có
            ticket (máy đang ở nhà khách). Gán khách cho serial này trong Odoo rồi export lại.
          </AlertDescription>
        </Alert>
      )}
      {(d.thieu.danhMuc || d.thieu.dongMay || d.thieu.lanLoi) && (
        <Alert color="warning">
          <AlertDescription>
            Chưa tải được {[d.thieu.danhMuc && 'danh mục lỗi', d.thieu.dongMay && 'dòng máy', d.thieu.lanLoi && 'các lần lỗi sau']
              .filter(Boolean)
              .join(', ')}{' '}
            — báo kỹ thuật nếu kéo dài.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}

// ───────────── thuộc tính ─────────────
function useNguoi(d: DuLieuCt) {
  const cs = d.nguoi?.cs.map((x) => ({ gt: x.id, nhan: x.ten })) ?? []
  const kt = d.nguoi ? d.nguoi.kt.map((x) => ({ gt: x.id, nhan: x.ten })) : d.staff.map((s) => ({ gt: s.id, nhan: s.ten }))
  const csId = d.nguoi && d.csTheoDoi ? (d.nguoi.cs.find((x) => x.ten === d.csTheoDoi)?.id ?? null) : null
  const ktId = d.nguoi ? d.nguoi.kt_ho_so : d.t.ky_thuat
  return { cs, kt, csId, ktId }
}

/** Ô trạng thái · khẩn · CS · KT (sửa tại chỗ, chỉ cục bộ). `gon` = chỉ avatar ở ô người. */
export function OTrangThai({ d }: { d: DuLieuCt }) {
  return (
    <OSuaNhap>
      <OSuaTrangThai ma={d.t.ticket_code} value={{ tt: d.t.state }} muc={TT} onLuu={chuaLuu} />
    </OSuaNhap>
  )
}
export function OKhan({ d }: { d: DuLieuCt }) {
  return (
    <OSuaNhap>
      <OSuaNhan ma={d.t.ticket_code} truong="mức khẩn" value={d.t.khan ? '1' : '0'} muc={KHAN} onLuu={chuaLuu} />
    </OSuaNhap>
  )
}
export function ONguoi({ d, loai, gon }: { d: DuLieuCt; loai: 'cs' | 'kt'; gon?: boolean }) {
  const n = useNguoi(d)
  return (
    <OSuaNhap>
      <OSuaNguoi
        ma={d.t.ticket_code}
        truong={loai === 'cs' ? 'CS theo dõi' : 'kỹ thuật'}
        value={loai === 'cs' ? n.csId : n.ktId}
        options={loai === 'cs' ? n.cs : n.kt}
        onLuu={chuaLuu}
        gon={gon}
      />
    </OSuaNhap>
  )
}

export function TTXuLy({ d, layout }: { d: DuLieuCt; layout?: 'stack' }) {
  return (
    <PropertyList tieuDe="Xử lý" layout={layout}>
      <PropertyRow nhan="Trạng thái">
        <OTrangThai d={d} />
      </PropertyRow>
      <PropertyRow nhan="Mức khẩn">
        <OKhan d={d} />
      </PropertyRow>
      <PropertyRow nhan="CS theo dõi">
        <ONguoi d={d} loai="cs" />
      </PropertyRow>
      <PropertyRow nhan="Kỹ thuật">
        <ONguoi d={d} loai="kt" />
      </PropertyRow>
      <PropertyRow nhan="Loại ticket">{d.t.ticket_type}</PropertyRow>
      <PropertyRow nhan="Ngày khách báo">{d.ngayDau && <span className="tabular-nums">{ngayVN(d.ngayDau)}</span>}</PropertyRow>
    </PropertyList>
  )
}

export function TTKhachMay({ d, layout }: { d: DuLieuCt; layout?: 'stack' }) {
  const { t } = d
  return (
    <>
      <PropertyList tieuDe="Khách" layout={layout}>
        <PropertyRow nhan="Tên">
          {t.customer_id ? (
            <Button asChild variant="link" className="text-left leading-[20px] whitespace-normal">
              <Link href={`/khach/${t.customer_id}`} prefetch={false}>
                {t.customer_name}
              </Link>
            </Button>
          ) : (
            t.customer_name
          )}
        </PropertyRow>
        <PropertyRow nhan="SĐT">{cheSdt(t.primary_phone) && <span className="tabular-nums">{cheSdt(t.primary_phone)}</span>}</PropertyRow>
        <PropertyRow nhan="Tỉnh/TP">{t.province}</PropertyRow>
        <PropertyRow nhan="Nhận việc">{t.cs_ten}</PropertyRow>
      </PropertyList>
      <PropertyList tieuDe="Máy" layout={layout}>
        <PropertyRow nhan="Model">
          {t.serial ? (
            <Button asChild variant="link" className="text-left leading-[20px] whitespace-normal">
              <Link href={`/may/${encodeURIComponent(t.serial)}`} prefetch={false}>
                {t.product_name}
              </Link>
            </Button>
          ) : (
            t.product_name
          )}
        </PropertyRow>
        <PropertyRow nhan="Serial">{t.source_serial && <span className="tabular-nums">{t.source_serial}</span>}</PropertyRow>
        <PropertyRow nhan="Bảo hành">
          {t.serial &&
            (t.warranty_activated ? (
              <span className="inline-flex flex-wrap items-center gap-1.5 border-none border-current">
                <span className="tabular-nums">đến {ngayVN(t.warranty_full_end)}</span>
                <Badge variant="soft" color={t.con_han_may ? 'success' : 'danger'}>
                  {t.con_han_may ? 'Còn hạn' : 'Hết hạn'}
                </Badge>
              </span>
            ) : (
              <Badge variant="soft" color="warning">Chưa kích hoạt</Badge>
            ))}
        </PropertyRow>
      </PropertyList>
    </>
  )
}

export function NhomLoi({ d, layout }: { d: DuLieuCt; layout?: 'stack' }) {
  if (d.nhom.length === 0) return null
  return (
    <PropertyList tieuDe="Nhóm lỗi" layout={layout}>
      {d.nhom.map((n) => {
        const m = MUC_DO[n.muc_do] ?? MUC_DO.thuong
        return (
          <PropertyRow
            key={n.group_code}
            nhan={
              <Button asChild variant="link" className="text-left leading-[20px] whitespace-normal">
                <Link href={`/nhom-loi/${n.group_code}`}>{n.nhom_ten}</Link>
              </Button>
            }
          >
            <Badge variant={m.solid ? 'solid' : 'soft'} color={m.color}>
              {m.nhan}
            </Badge>
          </PropertyRow>
        )
      })}
    </PropertyList>
  )
}

// ───────────── nội dung ─────────────
type Lan = { so: number; ngay: string | null; khach: string | null; xuLy: string | null }
export const cacLan = (d: DuLieuCt): Lan[] => [
  { so: 1, ngay: d.ngayDau, khach: d.t.description, xuLy: d.t.last_note },
  ...d.lanLoi.map((l) => ({ so: l.lan, ngay: l.ngay ?? l.created_at.slice(0, 10), khach: l.mo_ta, xuLy: l.xu_ly })),
]

export function KhachBaoXuLy({ lan }: { lan: Lan }) {
  return (
    <PropertyList layout="stack">
      <PropertyRow nhan="Khách báo">{lan.khach && <span className="whitespace-pre-line">{lan.khach}</span>}</PropertyRow>
      <PropertyRow nhan="Xử lý">{lan.xuLy && <span className="whitespace-pre-line">{lan.xuLy}</span>}</PropertyRow>
    </PropertyList>
  )
}

export function CacLanLoi({ d }: { d: DuLieuCt }) {
  return (
    <div className="flex flex-col gap-3 border-none border-current">
      {cacLan(d).map((lan) => (
        <Card key={lan.so}>
          <CardHeader>
            <CardTitle>Lần {lan.so}</CardTitle>
            <CardDescription className="tabular-nums">Khách báo ngày {ngayVN(lan.ngay)}</CardDescription>
          </CardHeader>
          <div className="mt-4 border-none border-current">
            <KhachBaoXuLy lan={lan} />
          </div>
        </Card>
      ))}
    </div>
  )
}

export function DongMayLoi({ d }: { d: DuLieuCt }) {
  if (d.dongMay.length === 0)
    return <p className="m-0 ds-text-sm text-muted-foreground">Chưa ghi máy / loại lỗi nào cho ticket này.</p>
  return (
    <ItemGroup>
      {d.dongMay.map((m) => {
        const tt = TT_DONG[m.trang_thai]
        return (
          <Item key={m.id} variant="outline" size="sm">
            <ItemContent>
              <ItemTitle>{m.loi_ten ?? m.loi_code}</ItemTitle>
              <ItemDescription>
                <span className="tabular-nums">{m.source_serial ?? m.serial ?? 'chưa có serial'}</span>
                {m.internal_code ? ` · ${m.internal_code}` : ''}
                {m.mo_ta ? ` · ${m.mo_ta}` : ''}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge variant="soft" color={tt.color}>
                {tt.nhan}
              </Badge>
            </ItemActions>
          </Item>
        )
      })}
    </ItemGroup>
  )
}

export function ChiPhi({ d }: { d: DuLieuCt }) {
  if (d.items.length === 0) return <p className="m-0 ds-text-sm text-muted-foreground">Chưa có chi phí hay vật tư.</p>
  const tong = d.items.reduce((s, i) => s + (i.tinh_phi ? (i.so_tien ?? 0) : 0), 0)
  return (
    <TableWrap vien>
      <Table variant="thuong">
        <TableHeader>
          <TableRow>
            <TableHead>Mục</TableHead>
            <TableHead phai>SL</TableHead>
            <TableHead phai>Tiền</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {d.items.map((i) => (
            <TableRow key={i.id}>
              <TableCell>
                {i.loai === 'doi_may' ? (
                  <>
                    Đổi máy <span className="tabular-nums">{i.serial_cu ?? '?'} → {i.serial_moi ?? '?'}</span>
                  </>
                ) : (
                  (i.catalog_code && d.tenCatalog[i.catalog_code]) || i.mo_ta || i.catalog_code
                )}
              </TableCell>
              <TableCell phai className="tabular-nums">
                {i.so_luong ?? '—'}
              </TableCell>
              <TableCell phai className="tabular-nums">
                {i.tinh_phi ? tien(i.so_tien) : <Badge variant="soft">Miễn phí</Badge>}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-medium">Tổng thu khách</TableCell>
            <TableCell />
            <TableCell phai className="font-medium tabular-nums">
              {tien(tong)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableWrap>
  )
}

/** Chi phí dạng nhãn ↔ tiền cho cột hẹp 280 (bảng 3 cột không vừa). */
export function ChiPhiGon({ d }: { d: DuLieuCt }) {
  const tong = d.items.reduce((s, i) => s + (i.tinh_phi ? (i.so_tien ?? 0) : 0), 0)
  return (
    <PropertyList tieuDe="Chi phí & vật tư">
      {d.items.length === 0 && <PropertyRow nhan="Mục" />}
      {d.items.map((i) => (
        <PropertyRow
          key={i.id}
          nhan={
            i.loai === 'doi_may'
              ? `Đổi máy ${i.serial_cu ?? '?'} → ${i.serial_moi ?? '?'}`
              : `${(i.catalog_code && d.tenCatalog[i.catalog_code]) || i.mo_ta || i.catalog_code}${(i.so_luong ?? 1) > 1 ? ` × ${i.so_luong}` : ''}`
          }
        >
          {i.tinh_phi ? <span className="tabular-nums">{tien(i.so_tien)}</span> : <Badge variant="soft">Miễn phí</Badge>}
        </PropertyRow>
      ))}
      {d.items.length > 0 && (
        <PropertyRow nhan="Tổng thu khách">
          <span className="font-medium tabular-nums">{tien(tong)}</span>
        </PropertyRow>
      )}
    </PropertyList>
  )
}

// ───────────── hoạt động ─────────────
const tepCua = (d: DuLieuCt, noteId: string) =>
  d.tepNK.filter((f) => f.note_id === noteId).map((f) => ({ ten: f.ten, href: f.url ?? undefined }))

/** Ghi chú cũ → mới (listTicketNotes trả mới trước). */
export const mucGhiChu = (d: DuLieuCt, them: MucTimeline[] = []): MucTimeline[] => [
  ...[...d.notes].reverse().map((n) => ({
    id: n.id,
    ai: n.tac_gia ?? 'Không rõ',
    loai: 'ghi chú',
    luc: n.created_at,
    noiDung: <span className="whitespace-pre-line">{n.noi_dung}</span>,
    tep: tepCua(d, n.id),
  })),
  ...them,
]

/** Mọi thứ có mốc thời gian, gộp một dòng (PA B): lần lỗi, ghi chú + tệp, dòng máy, chi phí. */
export const mucGop = (d: DuLieuCt, them: MucTimeline[] = []): MucTimeline[] => {
  const lan = cacLan(d)
  const ds: MucTimeline[] = [
    { id: 'tao', ai: d.t.cs_ten ?? 'CSKH', loai: 'tạo ticket', luc: d.t.created_at, icon: <Plus aria-hidden="true" /> },
    ...lan.map((l, i) => ({
      id: `lan-${l.so}`,
      ai: 'Khách',
      loai: `báo lỗi lần ${l.so} · ngày báo ${ngayVN(l.ngay)}`,
      luc: i === 0 ? d.t.created_at : d.lanLoi[i - 1].created_at,
      icon: <ChatCircleText aria-hidden="true" />,
      color: l.so > 1 ? ('danger' as const) : undefined,
      noiDung: <KhachBaoXuLy lan={l} />,
    })),
    ...d.dongMay.map((m) => ({
      id: `may-${m.id}`,
      ai: 'CSKH',
      loai: `ghi lỗi ${m.loi_ten ?? m.loi_code} · ${TT_DONG[m.trang_thai].nhan.toLocaleLowerCase('vi')}`,
      luc: m.created_at,
      icon: <Wrench aria-hidden="true" />,
    })),
    ...d.items.map((i) => ({
      id: `cp-${i.id}`,
      ai: i.tac_gia ?? 'CSKH',
      loai:
        i.loai === 'doi_may'
          ? `đổi máy ${i.serial_cu ?? '?'} → ${i.serial_moi ?? '?'}`
          : `thêm ${(i.catalog_code && d.tenCatalog[i.catalog_code]) || i.mo_ta || 'chi phí'} · ${i.tinh_phi ? tien(i.so_tien) : 'miễn phí'}`,
      luc: i.created_at,
      icon: <Receipt aria-hidden="true" />,
    })),
    ...mucGhiChu(d),
    ...them,
  ]
  // ponytail: sắp theo chuỗi ISO — đúng khi mọi mốc cùng định dạng timestamptz của Supabase.
  return ds.sort((a, b) => Date.parse(a.luc) - Date.parse(b.luc))
}

/** Composer ghi chú: chỉ thêm vào danh sách cục bộ. */
export function useGhiChuMoi() {
  const [moi, setMoi] = useState<MucTimeline[]>([])
  const composer = (
    <Composer
      onGui={(noiDung, tep) => {
        setMoi((ds) => [
          ...ds,
          {
            id: `moi-${ds.length}`,
            ai: 'Bạn',
            loai: 'ghi chú',
            luc: new Date().toISOString(),
            noiDung,
            tep: tep.map((f) => ({ ten: f.name })),
          },
        ])
        chuaLuu()
      }}
    />
  )
  return { moi, composer }
}

// ───────────── hàng thuộc tính gọn (PA B, C) ─────────────
// còn mở: DS chưa có "hàng thuộc tính ngang" (property bar kiểu Linear dưới tiêu đề) — tạm ghép nhãn chữ xs + ô sửa DS.
function O({ nhan, children }: { nhan: string; children: ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 border-none border-current">
      <span className="ds-text-xs text-muted-foreground">{nhan}</span>
      {children}
    </span>
  )
}

export function HangThuocTinh({ d, khachMay }: { d: DuLieuCt; khachMay?: boolean }) {
  const { t } = d
  const tong = d.items.reduce((s, i) => s + (i.tinh_phi ? (i.so_tien ?? 0) : 0), 0)
  return (
    <div role="group" aria-label="Thuộc tính ticket" className="flex flex-wrap items-center gap-x-5 gap-y-2 border-none border-current">
      <O nhan="Trạng thái">
        <OTrangThai d={d} />
      </O>
      <O nhan="Mức khẩn">
        <OKhan d={d} />
      </O>
      <O nhan="CS theo dõi">
        <ONguoi d={d} loai="cs" />
      </O>
      <O nhan="Kỹ thuật">
        <ONguoi d={d} loai="kt" />
      </O>
      {khachMay && (
        <>
          <O nhan="Khách">
            {t.customer_id ? (
              <Button asChild variant="link">
                <Link href={`/khach/${t.customer_id}`} prefetch={false}>
                  {t.customer_name}
                </Link>
              </Button>
            ) : (
              <span className="ds-text-sm">{t.customer_name ?? '—'}</span>
            )}
          </O>
          {cheSdt(t.primary_phone) && (
            <O nhan="SĐT">
              <span className="ds-text-sm tabular-nums">{cheSdt(t.primary_phone)}</span>
            </O>
          )}
          <O nhan="Bảo hành">
            {!t.serial ? (
              <span className="ds-text-sm text-muted-foreground">—</span>
            ) : t.warranty_activated ? (
              <Badge variant="soft" color={t.con_han_may ? 'success' : 'danger'}>
                {t.con_han_may ? `Còn hạn đến ${ngayVN(t.warranty_full_end)}` : 'Hết hạn'}
              </Badge>
            ) : (
              <Badge variant="soft" color="warning">Chưa kích hoạt</Badge>
            )}
          </O>
          {d.nhom.length > 0 && (
            <O nhan="Nhóm lỗi">
              {d.nhom.map((n) => (
                <Badge key={n.group_code} variant="soft" color={(MUC_DO[n.muc_do] ?? MUC_DO.thuong).color}>
                  {n.nhom_ten}
                </Badge>
              ))}
            </O>
          )}
          {d.items.length > 0 && (
            <O nhan="Thu khách">
              <span className="ds-text-sm tabular-nums">{tien(tong)}</span>
            </O>
          )}
        </>
      )}
    </div>
  )
}
