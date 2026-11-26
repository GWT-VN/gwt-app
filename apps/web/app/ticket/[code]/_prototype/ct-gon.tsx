'use client'

// PROTOTYPE vứt đi — trang chi tiết ticket BẢN GỌN, CEO duyệt khung 26/11/2026 (thay 7 PA A–G). Thứ tự theo yêu cầu gom từ
// kênh nội bộ (docs/rework/2026-11-26-yeu-cau-cskh-tu-kenh-noi-bo.md):
// 1 Trạng thái nổi nhất (Khẩn chỉ là cờ của ca đang mở) + MỘT dòng máy · bảo hành · khách.
// 2 Các lần lỗi MỚI NHẤT TRÊN CÙNG, mở sẵn; lần cũ thu 1 dòng. Ngày = ngày KHÁCH BÁO.
// 3 Máy & khách đã lỗi gì trước.  4 Cuối trang, thu gọn: nhật ký · chi phí · thông tin khác.
// Không ghim, không panel phải, không lịch hẹn, không trục bảo hành, không nút hậu mãi.
import { useState } from 'react'
import Link from 'next/link'
import { LockSimple, Phone, Plus } from '@phosphor-icons/react/ssr'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Composer } from '@/components/ui/composer'
import { DetailHeading } from '@/components/ui/detail-layout'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { detail, detailMain } from '@/components/ui/notif-styles'
import { PageHeader } from '@/components/ui/page-header'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { Timeline, type MucTimeline } from '@/components/ui/timeline'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CanhBao, ChiPhi, cheSdt, chuaLuu, dsLan, DuongDan, MUC_DO, mucGhiChu, ngayVN, OKhan, ONguoi, OTrangThai, type DuLieuCt, type Lan } from './chung'

const NGAY = 86400e3

/** Badge bảo hành: còn N ngày / hết hạn MM/YYYY / chưa kích hoạt; máy chưa có trong hệ thống → chưa rõ (Alert nói lý do). */
function BadgeBaoHanh({ d }: { d: DuLieuCt }) {
  const { t } = d
  const [bay] = useState(Date.now) // mốc "hôm nay" lấy một lần (không gọi Date.now lúc vẽ)
  if (!t.serial) return <Badge variant="soft">Chưa rõ bảo hành</Badge>
  if (!t.warranty_activated || !t.warranty_full_end)
    return (
      <Badge variant="soft" color="warning">
        Chưa kích hoạt BH
      </Badge>
    )
  const con = Math.ceil((Date.parse(t.warranty_full_end) - bay) / NGAY)
  return con > 0 ? (
    <Badge variant="soft" color="success">
      Còn BH {con} ngày
    </Badge>
  ) : (
    <Badge variant="soft" color="danger">
      Hết BH {t.warranty_full_end.slice(5, 7)}/{t.warranty_full_end.slice(0, 4)}
    </Badge>
  )
}

/** Một dòng dưới tiêu đề: model · serial · bảo hành · khách · tỉnh · SĐT che (PageHeader tự ngăn "·", tự xuống dòng). */
function dongMayKhach(d: DuLieuCt) {
  const { t } = d
  return [
    t.serial ? (
      <Link href={`/may/${encodeURIComponent(t.serial)}`} prefetch={false} className="text-inherit">
        {t.product_name ?? t.serial}
      </Link>
    ) : (
      t.product_name ?? 'Chưa rõ máy'
    ),
    t.source_serial && <span className="tabular-nums">{t.source_serial}</span>,
    <BadgeBaoHanh key="bh" d={d} />,
    t.customer_id ? (
      <Link href={`/khach/${t.customer_id}`} prefetch={false} className="text-inherit">
        {t.customer_name}
      </Link>
    ) : (
      (t.customer_name ?? 'Chưa gắn khách')
    ),
    t.province,
    cheSdt(t.primary_phone) && <span className="tabular-nums">{cheSdt(t.primary_phone)}</span>,
  ].filter(Boolean)
}

// ───────────── các lần lỗi ─────────────
function NhanKetQua({ lan }: { lan: Lan }) {
  return lan.xuLy ? (
    <Badge variant="soft" color={lan.ketQua?.color ?? 'success'}>
      {lan.ketQua?.nhan ?? 'Đã xử lý'}
    </Badge>
  ) : (
    <Badge variant="soft" color="warning">
      Chờ xử lý
    </Badge>
  )
}

function NoiDungLan({ lan, nguoi }: { lan: Lan; nguoi: string }) {
  return (
    <PropertyList>
      <PropertyRow nhan="Khách báo">{lan.khach && <span className="whitespace-pre-line">{lan.khach}</span>}</PropertyRow>
      <PropertyRow nhan="Xử lý">
        {lan.xuLy ? (
          <span className="flex flex-col gap-1 border-none border-current">
            <span className="whitespace-pre-line">{lan.xuLy}</span>
            <span className="ds-text-xs text-muted-foreground">{nguoi}</span>
          </span>
        ) : (
          <Button variant="outline" size="sm" onClick={chuaLuu}>
            <Plus aria-hidden="true" />
            Ghi xử lý lần {lan.so}
          </Button>
        )}
      </PropertyRow>
      <PropertyRow nhan="Vật tư">{lan.vatTu.length > 0 && lan.vatTu.join(', ')}</PropertyRow>
      {lan.thaoTu && <PropertyRow nhan="Tháo từ máy khác">{lan.thaoTu}</PropertyRow>}
    </PropertyList>
  )
}

function CacLan({ d }: { d: DuLieuCt }) {
  const ds = [...dsLan(d)].reverse() // MỚI NHẤT TRÊN CÙNG (CSKH 23/11)
  const nguoi = d.t.ky_thuat_ten ?? d.t.cs_ten ?? 'CSKH'
  return (
    <section aria-labelledby="gon-lan" className="flex flex-col gap-2 border-none border-current">
      <DetailHeading id="gon-lan">Các lần lỗi · {ds.length}</DetailHeading>
      <Accordion type="multiple" defaultValue={[String(ds[0].so)]}>
        {ds.map((l) => (
          <AccordionItem key={l.so} value={String(l.so)} data-lan={l.so}>
            <AccordionTrigger>
              <span className="flex min-w-0 flex-col gap-1 border-none border-current">
                <span className="flex flex-wrap items-center gap-2 border-none border-current">
                  Lần {l.so}
                  <span className="font-normal text-muted-foreground tabular-nums">· khách báo {ngayVN(l.ngay)}</span>
                  <NhanKetQua lan={l} />
                  {l.demo && <Badge variant="soft">Demo</Badge>}
                </span>
                <span className="truncate font-normal text-muted-foreground">{l.khach}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <NoiDungLan lan={l} nguoi={nguoi} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button variant="outline" size="sm" className="self-start" onClick={chuaLuu}>
        <Plus aria-hidden="true" />
        Ghi lần lỗi mới
      </Button>
    </section>
  )
}

// ───────────── máy & khách đã lỗi gì trước ─────────────
// còn mở: page chưa đọc ticket cùng serial / cùng khách — cần truy vấn (serial, customer_id); DB local không có → Demo.
const TRUOC = [
  { ma: 'TK-DEMO-712', ngay: '2026-07-02', viec: 'Rò nước van cấp', vi: 'Cùng máy' },
  { ma: 'TK-DEMO-640', ngay: '2026-03-12', viec: 'Thay lõi định kỳ', vi: 'Cùng máy' },
  { ma: 'TK-DEMO-688', ngay: '2026-05-20', viec: 'Máy nóng lạnh kêu to', vi: 'Cùng khách · máy NL2-DEMO-0417' },
]

function LoiTruoc() {
  return (
    <section aria-labelledby="gon-truoc" className="flex flex-col gap-3 border-none border-current">
      <div className="flex items-center gap-2 border-none border-current">
        <DetailHeading id="gon-truoc">Máy & khách đã lỗi gì trước</DetailHeading>
        <Badge variant="soft">Demo</Badge>
      </div>
      <ItemGroup>
        {TRUOC.map((x) => (
          <Item key={x.ma} size="sm" variant="outline">
            <ItemContent>
              <ItemTitle>
                <span className="tabular-nums">{x.ma}</span> · {x.viec}
              </ItemTitle>
              <ItemDescription>
                <span className="tabular-nums">Khách báo {ngayVN(x.ngay)}</span> · {x.vi}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge variant="soft" color="success">
                Đã xong
              </Badge>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </section>
  )
}

// ───────────── nhật ký: ô soạn 2 chế độ (CEO chốt 25/11: app CHỈ GHI NHẬN trao đổi, không gửi tin cho khách) ─────────────
function NhatKy({ d }: { d: DuLieuCt }) {
  const [cheDo, setCheDo] = useState<'noi-bo' | 'khach'>('noi-bo')
  const [moi, setMoi] = useState<MucTimeline[]>([])
  const noiBo = cheDo === 'noi-bo'
  const nk = mucGhiChu(d, moi)
  return (
    <div className="flex flex-col gap-3 border-none border-current">
      {nk.length > 0 && <Timeline muc={nk} hien={6} aria-label="Nhật ký trao đổi" />}
      <ToggleGroup
        type="single"
        size="sm"
        spacing={0.5}
        value={cheDo}
        onValueChange={(v) => v && setCheDo(v as 'noi-bo' | 'khach')}
        aria-label="Loại ghi"
        className="flex-wrap self-start"
      >
        <ToggleGroupItem value="noi-bo">
          <LockSimple aria-hidden="true" />
          Ghi chú nội bộ
        </ToggleGroupItem>
        <ToggleGroupItem value="khach">
          <Phone aria-hidden="true" />
          Ghi nhận với khách
        </ToggleGroupItem>
      </ToggleGroup>
      <Composer
        key={cheDo}
        aria-label={noiBo ? 'Viết ghi chú nội bộ' : 'Ghi nhận trao đổi với khách'}
        placeholder={noiBo ? 'Ghi chú nội bộ — khách không thấy…' : 'Khách nói gì qua điện thoại / Zalo…'}
        className={noiBo ? '[&_[data-slot=composer]]:bg-(--color-background-warning-soft-alpha)' : undefined}
        onGui={(noiDung) => {
          setMoi((ds) => [
            ...ds,
            {
              id: `moi-${ds.length}`,
              ai: 'Bạn',
              loai: noiBo ? 'ghi chú nội bộ' : 'ghi nhận trao đổi với khách',
              luc: new Date().toISOString(),
              icon: noiBo ? <LockSimple aria-hidden="true" /> : <Phone aria-hidden="true" />,
              noiDung: <span className="whitespace-pre-line">{noiDung}</span>,
            },
          ])
          chuaLuu()
        }}
      />
      {!noiBo && <p className="m-0 ds-text-xs text-muted-foreground">Ghi lại nội dung đã gọi / nhắn Zalo với khách — app không gửi tin cho khách.</p>}
    </div>
  )
}

function ThongTinKhac({ d }: { d: DuLieuCt }) {
  const { t } = d
  return (
    <PropertyList>
      <PropertyRow nhan="CS theo dõi">
        <ONguoi d={d} loai="cs" />
      </PropertyRow>
      <PropertyRow nhan="Kỹ thuật">
        <ONguoi d={d} loai="kt" />
      </PropertyRow>
      <PropertyRow nhan="Loại ticket">{t.ticket_type}</PropertyRow>
      <PropertyRow nhan="Nhóm lỗi">
        {d.nhom.length > 0 && (
          <span className="flex flex-wrap gap-1.5 border-none border-current">
            {d.nhom.map((n) => {
              const m = MUC_DO[n.muc_do] ?? MUC_DO.thuong
              return (
                <Badge key={n.group_code} variant={m.solid ? 'solid' : 'soft'} color={m.color}>
                  {n.nhom_ten}
                </Badge>
              )
            })}
          </span>
        )}
      </PropertyRow>
      <PropertyRow nhan="Ngày tạo">
        <span className="tabular-nums">{ngayVN(t.created_at)}</span>
      </PropertyRow>
    </PropertyList>
  )
}

export function CtGon({ d }: { d: DuLieuCt }) {
  const { t } = d
  const [tt, setTt] = useState<string>(t.state)
  return (
    <div className={detail}>
      <div className={detailMain}>
        <DuongDan ma={t.ticket_code} />
        {/* Trạng thái đứng đầu, trước tiêu đề — thứ CSKH cần biết đầu tiên (quản lý 25/11). Khẩn chỉ có khi Đang mở. */}
        <div role="group" aria-label="Trạng thái ticket" data-gon="trang-thai" className="flex flex-wrap items-center gap-2 border-none border-current">
          <OTrangThai d={d} onDoi={setTt} />
          {tt === 'Open' && <OKhan d={d} />}
        </div>
        <PageHeader tieuDe={`${t.ticket_code} · ${t.ticket_type ?? 'Ticket'}`} meta={dongMayKhach(d)} />
        <CanhBao d={d} />
        <CacLan d={d} />
        <LoiTruoc />
        <Accordion type="multiple">
          <AccordionItem value="nk">
            <AccordionTrigger>Nhật ký trao đổi · {d.notes.length}</AccordionTrigger>
            <AccordionContent>
              <NhatKy d={d} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="cp">
            <AccordionTrigger>Chi phí & vật tư · {d.items.length}</AccordionTrigger>
            <AccordionContent>
              <ChiPhi d={d} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="khac">
            <AccordionTrigger>Thông tin khác</AccordionTrigger>
            <AccordionContent>
              <ThongTinKhac d={d} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
