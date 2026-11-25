'use client'

// PROTOTYPE vứt đi — PA G "Đề xuất theo nghiên cứu" (docs/rework/2026-11-25-nghien-cuu-cskh-ho-so-may.md mục 4a):
// D1 đầu trang ghim + dải máy (bảo hành ngay đầu) · D2 bố cục 3 vùng, panel phải tab Máy · Khách · Ticket khác ·
// D3 "lần lỗi" là khối chính (khách báo → chẩn đoán → xử lý → vật tư → KTV), ghi chú + sự kiện xen theo thời gian ·
// D4 thẻ lịch hẹn hiện trường đổi theo trạng thái (Dynamics Booking) · D5 bản gọn: lịch sử máy dạng danh sách.
// Ô soạn 1 ô 2 chế độ (R3). Dữ liệu DB local không có → "Demo"; trường đang đoán → "giả định".
import { useState, useSyncExternalStore, type ReactNode } from 'react'
import {
  ArrowsClockwise,
  CalendarPlus,
  Gear,
  LockSimple,
  Package,
  Phone,
  Plus,
  SidebarSimple,
} from '@phosphor-icons/react/ssr'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Composer } from '@/components/ui/composer'
import { DetailHeading, DetailLayout } from '@/components/ui/detail-layout'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { PageHeader } from '@/components/ui/page-header'
import { Progress } from '@/components/ui/progress'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { thongBao } from '@/components/ui/sonner'
import { Tabs, TabsContent, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Timeline, type MucTimeline } from '@/components/ui/timeline'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CanhBao, cheSdt, DuongDan, HangThuocTinh, meta, mucGhiChu, ngayVN, tieuDe, type DuLieuCt } from './chung'
import { dsLan, type Lan } from './ct-f'

const chuaLuu = () => thongBao.xong('Prototype — chưa lưu')
const tien = (n: number) => `${n.toLocaleString('vi-VN')} ₫`
const NGAY = 86400e3

// ───────────── hồ sơ máy (thật nếu có trong hệ thống, không thì Demo) ─────────────
type HoSoMay = {
  demo: boolean
  model: string
  serial: string | null
  ngayLap: string
  hang: { tu: string; den: string }
  lapDat: { tu: string; den: string }
}

function hoSoMay(d: DuLieuCt): HoSoMay {
  const { t } = d
  // DB chưa có ngày lắp / bảo hành lắp đặt → luôn Demo/giả định; bảo hành hãng lấy thật khi máy đã kích hoạt.
  const ngayLap = '2025-03-12'
  const denHang = t.serial && t.warranty_activated && t.warranty_full_end ? t.warranty_full_end : '2027-03-12'
  return {
    demo: !t.serial,
    model: t.product_name ?? 'Máy lọc RO Demo D50',
    serial: t.source_serial,
    ngayLap,
    hang: { tu: ngayLap, den: denHang },
    lapDat: { tu: ngayLap, den: '2026-03-12' },
  }
}

/** % thời hạn đã trôi qua (0–100). */
const phanDaQua = (tu: string, den: string) =>
  Math.max(0, Math.min(100, ((Date.now() - Date.parse(tu)) / (Date.parse(den) - Date.parse(tu))) * 100))
const conNgay = (den: string) => Math.ceil((Date.parse(den) - Date.now()) / NGAY)
function tuoiMay(ngayLap: string) {
  const thang = Math.floor((Date.now() - Date.parse(ngayLap)) / (NGAY * 30.44))
  const nam = Math.floor(thang / 12)
  return [nam && `${nam} năm`, thang % 12 && `${thang % 12} tháng`].filter(Boolean).join(' ') || 'dưới 1 tháng'
}

function BadgeBaoHanh({ d, may }: { d: DuLieuCt; may: HoSoMay }) {
  if (d.t.serial && !d.t.warranty_activated)
    return (
      <Badge variant="soft" color="warning">
        Chưa kích hoạt
      </Badge>
    )
  const con = conNgay(may.hang.den)
  return con > 0 ? (
    <Badge variant="soft" color="success">
      Còn {con} ngày
    </Badge>
  ) : (
    <Badge variant="soft" color="danger">
      Hết hạn {may.hang.den.slice(5, 7)}/{may.hang.den.slice(0, 4)}
    </Badge>
  )
}

/** D1 — dải máy 1 dòng ngay dưới đầu trang (≤ hẹp tự xuống 2 dòng nhờ flex-wrap). */
function DaiMay({ d, may }: { d: DuLieuCt; may: HoSoMay }) {
  return (
    <div role="group" aria-label="Máy của ticket" className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-none border-current ds-text-sm">
      <span className="font-medium">{may.model}</span>
      <span className="tabular-nums text-muted-foreground">{may.serial ?? 'chưa có serial'}</span>
      <BadgeBaoHanh d={d} may={may} />
      <span className="tabular-nums text-muted-foreground">Lắp {ngayVN(may.ngayLap)}</span>
      <span className="text-muted-foreground">{tuoiMay(may.ngayLap)} tuổi</span>
      {may.demo && <Badge variant="soft">Demo</Badge>}
    </div>
  )
}

// ───────────── D3 — các lần lỗi + những gì xảy ra giữa các lần ─────────────
const VAT_TU_BH = 'Trong BH · 0 ₫' // kiểu Odoo: phiếu trong bảo hành → phụ tùng giá 0

type GhiMoi = MucTimeline & { lan: number }

/** Mốc bắt đầu của từng lần (để xếp ghi chú/sự kiện vào giữa các lần). */
function mocLan(d: DuLieuCt, ds: Lan[]) {
  return ds.map((l, i) => Date.parse(i === 0 ? d.t.created_at : (d.lanLoi[i - 1]?.created_at ?? `${l.ngay}T00:00:00+07:00`)))
}
function lanCua(moc: number[], luc: string) {
  const x = Date.parse(luc)
  let i = 0
  while (i + 1 < moc.length && moc[i + 1] <= x) i++
  return i
}

/** Sự kiện hệ thống liền nhau → gom 1 dòng thu gọn (kiểu Linear). Ghi chú giữ nguyên. */
function gomHeThong(muc: (MucTimeline & { heThong?: boolean })[]): MucTimeline[] {
  const ra: MucTimeline[] = []
  for (let i = 0; i < muc.length; ) {
    if (!muc[i].heThong) {
      ra.push(muc[i++])
      continue
    }
    let j = i
    while (j < muc.length && muc[j].heThong) j++
    const nhom = muc.slice(i, j)
    ra.push(
      nhom.length === 1
        ? nhom[0]
        : {
            id: `gom-${nhom[0].id}`,
            ai: nhom[0].ai,
            loai: `${nhom.length} cập nhật hệ thống`,
            luc: nhom[0].luc,
            icon: <Gear aria-hidden="true" />,
            noiDung: <span className="ds-text-sm text-muted-foreground">{nhom.map((x) => x.loai).join(' · ')}</span>,
          },
    )
    i = j
  }
  return ra
}

function TheLan({ lan, d, nguoi, chanDoan }: { lan: Lan; d: DuLieuCt; nguoi: string; chanDoan: string | null }) {
  return (
    <Card id={`g-lan-${lan.so}`} className="flex scroll-mt-48 flex-col gap-4">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2 border-none border-current">
          <CardTitle>Lần {lan.so}</CardTitle>
          {lan.xuLy ? (
            <Badge variant="soft" color={lan.ketQua?.color ?? 'success'}>
              {lan.ketQua?.nhan ?? 'Đã xử lý'}
            </Badge>
          ) : (
            <Badge variant="soft" color="warning">
              Chờ xử lý
            </Badge>
          )}
          {lan.demo && <Badge variant="soft">Demo</Badge>}
        </div>
        <CardDescription className="tabular-nums">Khách báo ngày {ngayVN(lan.ngay)}</CardDescription>
      </CardHeader>
      {/* Trình tự cố định của một ca: khách báo → chẩn đoán → xử lý → vật tư → KTV. */}
      <PropertyList>
        <PropertyRow nhan="Khách báo">{lan.khach && <span className="whitespace-pre-line">{lan.khach}</span>}</PropertyRow>
        <PropertyRow nhan="Chẩn đoán">{chanDoan}</PropertyRow>
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
        <PropertyRow nhan="Vật tư">
          {lan.vatTu.length > 0 && (
            <span className="flex flex-col gap-1 border-none border-current">
              {lan.vatTu.map((v, i) => (
                <span key={i} className="flex flex-wrap items-center gap-1.5 border-none border-current">
                  {v}
                  {d.t.con_han_may !== false && (
                    <Badge variant="soft" color="success">
                      {VAT_TU_BH}
                    </Badge>
                  )}
                </span>
              ))}
            </span>
          )}
        </PropertyRow>
        <PropertyRow nhan="KTV / lịch hẹn">{lan.xuLy ? (d.t.ky_thuat_ten ?? null) : null}</PropertyRow>
      </PropertyList>
    </Card>
  )
}

// ───────────── ô soạn 1 ô 2 chế độ ─────────────
type CheDo = 'noi-bo' | 'khach'

function OSoan({ ds, onThem }: { ds: Lan[]; onThem: (m: GhiMoi) => void }) {
  const [cheDo, setCheDo] = useState<CheDo>('noi-bo')
  const [lan, setLan] = useState(String(ds.at(-1)?.so ?? 1))
  const noiBo = cheDo === 'noi-bo'
  return (
    <div className="flex flex-col gap-2 border-none border-current">
      <div className="flex flex-wrap items-center justify-between gap-2 border-none border-current">
        <ToggleGroup
          type="single"
          size="sm"
          spacing={0.5}
          value={cheDo}
          onValueChange={(v) => v && setCheDo(v as CheDo)}
          aria-label="Loại ghi"
          className="flex-wrap"
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
        <Select value={lan} onValueChange={setLan}>
          <SelectTrigger size="sm" aria-label="Ghi vào lần">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ds.map((l) => (
              <SelectItem key={l.so} value={String(l.so)}>
                Ghi vào lần {l.so}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Composer
        key={cheDo}
        aria-label={noiBo ? 'Viết ghi chú nội bộ' : 'Ghi nhận trao đổi với khách'}
        placeholder={noiBo ? 'Ghi chú nội bộ — khách không thấy. Gõ @tên để nhắc người…' : 'Khách nói gì qua điện thoại / Zalo…'}
        // Nội bộ = nền vàng nhạt (mẫu Zendesk), khách = nền thường.
        className={noiBo ? '[&_[data-slot=composer]]:bg-(--color-background-warning-soft-alpha)' : undefined}
        onGui={(noiDung) => {
          onThem({
            id: `moi-${Date.now()}`,
            lan: Number(lan),
            ai: 'Bạn',
            loai: noiBo ? 'ghi chú nội bộ' : 'ghi nhận trao đổi với khách',
            luc: new Date().toISOString(),
            icon: noiBo ? <LockSimple aria-hidden="true" /> : <Phone aria-hidden="true" />,
            noiDung: <span className="whitespace-pre-line">{noiDung}</span>,
          })
          chuaLuu()
        }}
      />
      {/* CEO chốt 25/11: app CHỈ GHI NHẬN trao đổi (gọi / Zalo), không gửi tin cho khách. */}
      {!noiBo && (
        <p className="m-0 ds-text-xs text-muted-foreground">Ghi lại nội dung đã gọi / nhắn Zalo với khách — app không gửi tin cho khách.</p>
      )}
    </div>
  )
}

// ───────────── D4 — thẻ lịch hẹn hiện trường đổi theo trạng thái ─────────────
type TrangThaiHen = 'chua' | 'da' | 'xong'

function TheLichHen({ d }: { d: DuLieuCt }) {
  const [tt, setTt] = useState<TrangThaiHen>('da')
  const kt = d.t.ky_thuat_ten ?? 'Chưa giao KTV'
  return (
    <Card className="flex flex-col gap-3">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2 border-none border-current">
          <CardTitle>Lịch hẹn hiện trường</CardTitle>
          <Badge variant="soft">Demo</Badge>
        </div>
        <CardDescription>Thẻ đổi theo trạng thái — bấm để xem 3 dạng.</CardDescription>
      </CardHeader>
      <ToggleGroup type="single" size="sm" spacing={0.5} value={tt} onValueChange={(v) => v && setTt(v as TrangThaiHen)} aria-label="Xem trạng thái lịch hẹn">
        <ToggleGroupItem value="chua">Chưa hẹn</ToggleGroupItem>
        <ToggleGroupItem value="da">Đã hẹn</ToggleGroupItem>
        <ToggleGroupItem value="xong">Xong</ToggleGroupItem>
      </ToggleGroup>
      {tt === 'chua' && (
        <>
          <p className="m-0 ds-text-sm text-muted-foreground">Chưa có lịch. Gợi ý: {kt}, sáng mai.</p>
          <Button size="sm" className="self-start" onClick={chuaLuu}>
            <CalendarPlus aria-hidden="true" />
            Hẹn KTV
          </Button>
        </>
      )}
      {tt === 'da' && (
        <PropertyList layout="stack">
          <PropertyRow nhan="KTV">{kt}</PropertyRow>
          <PropertyRow nhan="Giờ hẹn">
            <span className="tabular-nums">09:00 · 27/11/2026</span>
          </PropertyRow>
          <PropertyRow nhan="Địa chỉ">{d.t.province ? `${d.t.province} (giả định)` : null}</PropertyRow>
        </PropertyList>
      )}
      {tt === 'xong' && (
        <PropertyList layout="stack">
          <PropertyRow nhan="Kết quả">Thay gioăng khớp nối, chạy thử 30 phút không rò.</PropertyRow>
          <PropertyRow nhan="Vật tư">Gioăng khớp nối × 1 · Trong BH</PropertyRow>
          <PropertyRow nhan="Biên bản">
            <Button variant="link" onClick={chuaLuu}>
              Xem biên bản
            </Button>
          </PropertyRow>
        </PropertyList>
      )}
    </Card>
  )
}

// ───────────── D2 — panel phải: Ticket · Lịch hẹn · tab Máy / Khách / Ticket khác ─────────────
const LICH_SU_MAY = [
  { ma: 'TK-DEMO-640', viec: 'Thay lõi định kỳ', ngay: '2026-03-12', xong: true },
  { ma: 'TK-DEMO-712', viec: 'Rò nước van cấp', ngay: '2026-07-02', xong: true },
]
const LOI_THAY = [
  { lo: 'Lõi PP 5µm', ngay: '2025-09-12' },
  { lo: 'Lõi than hoạt tính', ngay: '2026-03-12' },
]
const MAY_KHAC = [
  { model: 'Máy nóng lạnh Demo NL2', serial: 'NL2-DEMO-0417', bh: 'Còn 210 ngày', color: 'success' as const },
  { model: 'Máy lọc tổng Demo T50', serial: 'T50-DEMO-0033', bh: 'Hết hạn 08/2025', color: 'danger' as const },
]
const TICKET_KHACH = [{ ma: 'TK-DEMO-688', viec: 'Máy nóng lạnh kêu to', ngay: '2026-05-20', may: 'NL2-DEMO-0417' }]

function DongTicket({ ma, viec, ngay, phu }: { ma: string; viec: string; ngay: string; phu?: ReactNode }) {
  return (
    <Item size="sm" variant="outline">
      <ItemContent>
        <ItemTitle>{viec}</ItemTitle>
        <ItemDescription className="tabular-nums">
          {ma} · {ngayVN(ngay)}
        </ItemDescription>
      </ItemContent>
      {phu && <ItemActions>{phu}</ItemActions>}
    </Item>
  )
}

function Panel({ d, may }: { d: DuLieuCt; may: HoSoMay }) {
  const { t } = d
  const thu = d.items.reduce((s, i) => s + (i.tinh_phi ? (i.so_tien ?? 0) : 0), 0)
  const daQua = phanDaQua(may.hang.tu, may.hang.den)
  return (
    <div className="flex flex-col gap-6 border-none border-current">
      {/* Thuộc tính ticket còn lại (kiểu Linear: đầu panel). Trạng thái/khẩn/CS/KT đã ở đầu trang ghim. */}
      <PropertyList tieuDe="Ticket">
        <PropertyRow nhan="Loại">{t.ticket_type}</PropertyRow>
        <PropertyRow nhan="Ngày khách báo">{d.ngayDau && <span className="tabular-nums">{ngayVN(d.ngayDau)}</span>}</PropertyRow>
        <PropertyRow nhan="Nhóm lỗi">
          {d.nhom.length > 0 && (
            <span className="flex flex-wrap gap-1 border-none border-current">
              {d.nhom.map((n) => (
                <Badge key={n.group_code} variant="soft">
                  {n.nhom_ten}
                </Badge>
              ))}
            </span>
          )}
        </PropertyRow>
        <PropertyRow nhan="Thu khách">{d.items.length > 0 && <span className="tabular-nums">{tien(thu)}</span>}</PropertyRow>
      </PropertyList>

      <TheLichHen d={d} />

      <Tabs defaultValue="may">
        <TabsList variant="line">
          <TabsTrigger value="may">Máy</TabsTrigger>
          <TabsTrigger value="khach">Khách</TabsTrigger>
          <TabsTrigger value="khac">
            Ticket khác <TabsCount>{LICH_SU_MAY.length + TICKET_KHACH.length}</TabsCount>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="may" className="flex flex-col gap-6 pt-4">
          <PropertyList>
            <PropertyRow nhan="Loại">Máy lọc RO (giả định)</PropertyRow>
            <PropertyRow nhan="Hãng">GWT (giả định)</PropertyRow>
            <PropertyRow nhan="Model">{may.model}</PropertyRow>
            <PropertyRow nhan="Serial">{may.serial && <span className="tabular-nums">{may.serial}</span>}</PropertyRow>
            <PropertyRow nhan="Ngày lắp">
              <span className="tabular-nums">{ngayVN(may.ngayLap)}</span> <Badge variant="soft">Demo</Badge>
            </PropertyRow>
            <PropertyRow nhan="Địa chỉ lắp">{t.province ? `${t.province} (giả định)` : null}</PropertyRow>
            <PropertyRow nhan="Trạng thái">
              <Badge variant="soft" color="success">
                Đang dùng
              </Badge>
            </PropertyRow>
          </PropertyList>

          <section aria-labelledby="g-bh" className="flex flex-col gap-3 border-none border-current">
            <DetailHeading id="g-bh" cap={3}>
              Bảo hành
            </DetailHeading>
            {/* còn mở: DS chưa có "trục thời gian tài sản" (dải BH + điểm ticket kiểu ServiceMax) — tạm Progress + danh sách. */}
            <div className="flex flex-col gap-1.5 border-none border-current">
              <div className="flex items-center justify-between gap-2 border-none border-current ds-text-sm">
                <span>Bảo hành hãng</span>
                <BadgeBaoHanh d={d} may={may} />
              </div>
              <Progress value={daQua} aria-label="Đã qua bao nhiêu phần thời hạn bảo hành hãng" />
              <span className="ds-text-xs tabular-nums text-muted-foreground">
                {ngayVN(may.hang.tu)} → {ngayVN(may.hang.den)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 border-none border-current ds-text-sm">
              <span>Bảo hành lắp đặt (giả định)</span>
              <Badge variant="soft" color="danger">
                Hết hạn {may.lapDat.den.slice(5, 7)}/{may.lapDat.den.slice(0, 4)}
              </Badge>
            </div>
          </section>

          <section aria-labelledby="g-ls" className="flex flex-col gap-3 border-none border-current">
            <div className="flex items-center gap-2 border-none border-current">
              <DetailHeading id="g-ls" cap={3}>
                Lịch sử máy
              </DetailHeading>
              <Badge variant="soft">Demo</Badge>
            </div>
            <ItemGroup>
              {LICH_SU_MAY.map((x) => (
                <DongTicket key={x.ma} ma={x.ma} viec={x.viec} ngay={x.ngay} />
              ))}
              <DongTicket ma={t.ticket_code} viec="Ticket này" ngay={d.ngayDau ?? t.created_at.slice(0, 10)} phu={<Badge variant="soft" color="info">Đang xem</Badge>} />
            </ItemGroup>
            <ItemGroup>
              {LOI_THAY.map((x) => (
                <Item key={x.lo} size="sm">
                  <ItemContent>
                    <ItemTitle>Thay {x.lo}</ItemTitle>
                    <ItemDescription className="tabular-nums">{ngayVN(x.ngay)}</ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </section>
        </TabsContent>

        <TabsContent value="khach" className="flex flex-col gap-6 pt-4">
          <PropertyList>
            <PropertyRow nhan="Tên">{t.customer_name}</PropertyRow>
            <PropertyRow nhan="SĐT">{cheSdt(t.primary_phone) && <span className="tabular-nums">{cheSdt(t.primary_phone)}</span>}</PropertyRow>
            <PropertyRow nhan="Tỉnh/TP">{t.province}</PropertyRow>
            <PropertyRow nhan="Nhận việc">{t.cs_ten}</PropertyRow>
          </PropertyList>
          <section aria-labelledby="g-mk" className="flex flex-col gap-3 border-none border-current">
            <div className="flex items-center gap-2 border-none border-current">
              <DetailHeading id="g-mk" cap={3}>
                Máy khác của khách
              </DetailHeading>
              <Badge variant="soft">Demo</Badge>
            </div>
            <ItemGroup>
              {MAY_KHAC.map((m) => (
                <Item key={m.serial} size="sm" variant="outline">
                  <ItemContent>
                    <ItemTitle>{m.model}</ItemTitle>
                    <ItemDescription className="tabular-nums">{m.serial}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Badge variant="soft" color={m.color}>
                      {m.bh}
                    </Badge>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </section>
        </TabsContent>

        <TabsContent value="khac" className="flex flex-col gap-6 pt-4">
          <section aria-labelledby="g-cm" className="flex flex-col gap-3 border-none border-current">
            <DetailHeading id="g-cm" cap={3}>
              Cùng máy
            </DetailHeading>
            <ItemGroup>
              {LICH_SU_MAY.map((x) => (
                <DongTicket key={x.ma} ma={x.ma} viec={x.viec} ngay={x.ngay} phu={<Badge variant="soft" color="success">Đã xong</Badge>} />
              ))}
            </ItemGroup>
          </section>
          <section aria-labelledby="g-ck" className="flex flex-col gap-3 border-none border-current">
            <DetailHeading id="g-ck" cap={3}>
              Cùng khách, máy khác
            </DetailHeading>
            <ItemGroup>
              {TICKET_KHACH.map((x) => (
                <DongTicket key={x.ma} ma={x.ma} viec={x.viec} ngay={x.ngay} phu={<span className="ds-text-xs tabular-nums text-muted-foreground">{x.may}</span>} />
              ))}
            </ItemGroup>
          </section>
          <Badge variant="soft" className="self-start">
            Demo — DB local chưa có ticket khác
          </Badge>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ───────────── trang ─────────────
const hepQuery = '(max-width: 960px)'
function ngheHep(f: () => void) {
  const m = window.matchMedia(hepQuery)
  m.addEventListener('change', f)
  return () => m.removeEventListener('change', f)
}

export function CtG({ d }: { d: DuLieuCt }) {
  const { t } = d
  const may = hoSoMay(d)
  const ds = dsLan(d)
  const moc = mocLan(d, ds)
  const nguoi = t.ky_thuat_ten ?? t.cs_ten ?? 'CSKH'
  const chanDoan = d.dongMay.map((m) => m.loi_ten ?? m.loi_code).join(', ') || d.nhom.map((n) => n.nhom_ten).join(', ') || null
  const [moi, setMoi] = useState<GhiMoi[]>([])
  const [moPanel, setMoPanel] = useState(true)
  const [moSheet, setMoSheet] = useState(false)
  // ≤960 (DetailLayout tự xuống 1 cột ở đúng mốc này): panel thành Sheet thay vì đẩy các lần lỗi xuống dưới.
  const hep = useSyncExternalStore(ngheHep, () => window.matchMedia(hepQuery).matches, () => false)

  // Ghi chú cũ + sự kiện hệ thống (ghi lỗi, vật tư) xếp vào lần có mốc ngay trước nó.
  const theoLan: (MucTimeline & { heThong?: boolean })[][] = ds.map(() => [])
  for (const n of mucGhiChu(d)) theoLan[lanCua(moc, n.luc)].push({ ...n, loai: 'ghi chú nội bộ', icon: <LockSimple aria-hidden="true" /> })
  for (const m of d.dongMay)
    theoLan[lanCua(moc, m.created_at)].push({ id: `may-${m.id}`, ai: 'CSKH', loai: `ghi lỗi ${m.loi_ten ?? m.loi_code}`, luc: m.created_at, heThong: true })
  for (const i of d.items)
    theoLan[lanCua(moc, i.created_at)].push({
      id: `vt-${i.id}`,
      ai: i.tac_gia ?? 'CSKH',
      loai: `thêm ${(i.catalog_code && d.tenCatalog[i.catalog_code]) || i.mo_ta || 'chi phí'}`,
      luc: i.created_at,
      icon: <Package aria-hidden="true" />,
      heThong: true,
    })
  for (const m of moi) theoLan[Math.min(m.lan, ds.length) - 1].push(m)
  const xen = theoLan.map((ls) => gomHeThong([...ls].sort((a, b) => Date.parse(a.luc) - Date.parse(b.luc))))

  // Nút hậu mãi (kiểu Odoo) nằm cùng hàng thuộc tính, xuống dòng được — để ở hanhDong của PageHeader thì ở 900 chúng
  // không co, ép tiêu đề còn 0 rộng.
  const hauMai = (
    <div className="flex flex-wrap items-center gap-2 border-none border-current">
      <Button variant="outline" size="sm" onClick={chuaLuu}>
        <CalendarPlus aria-hidden="true" />
        Tạo lịch kỹ thuật
      </Button>
      <Button variant="outline" size="sm" onClick={chuaLuu}>
        <ArrowsClockwise aria-hidden="true" />
        Đổi máy
      </Button>
      <Button variant="outline" size="sm" onClick={chuaLuu}>
        <Package aria-hidden="true" />
        Ghi vật tư
      </Button>
    </div>
  )
  const nutPanel = (
    <Button variant="ghost" size="sm" aria-pressed={hep ? undefined : moPanel} onClick={() => (hep ? setMoSheet(true) : setMoPanel((x) => !x))}>
      <SidebarSimple aria-hidden="true" />
      Hồ sơ máy &amp; khách
    </Button>
  )

  const chinh = (
    <>
      <CanhBao d={d} />
      <section aria-labelledby="g-lan" className="flex flex-col gap-4 border-none border-current">
        <DetailHeading id="g-lan">Các lần lỗi · {ds.length}</DetailHeading>
        {ds.map((l, i) => (
          <div key={l.so} className="flex flex-col gap-4 border-none border-current">
            <TheLan lan={l} d={d} nguoi={nguoi} chanDoan={i === 0 ? chanDoan : l.demo ? 'Rò khớp nối (giả định)' : null} />
            {xen[i].length > 0 && <Timeline muc={xen[i]} hien={4} aria-label={`Ghi chú và sự kiện sau lần ${l.so}`} />}
          </div>
        ))}
      </section>
      <section aria-labelledby="g-soan" className="flex flex-col gap-3 border-none border-current">
        <DetailHeading id="g-soan">Ghi thêm</DetailHeading>
        <OSoan ds={ds} onThem={(m) => setMoi((x) => [...x, m])} />
      </section>
    </>
  )

  return (
    <div className="flex flex-col gap-6 border-none border-current">
      {/* D1 — đầu trang ghim khi cuộn (từ md; điện thoại để cuộn tự nhiên, đầu trang cao chiếm hết màn). */}
      <div className="z-10 flex flex-col gap-3 border-none border-current bg-background pb-3 md:sticky md:top-0">
        <PageHeader duongDan={<DuongDan ma={t.ticket_code} />} tieuDe={tieuDe(d)} meta={meta(d)} hanhDong={nutPanel} />
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-none border-current">
          <HangThuocTinh d={d} />
          {hauMai}
        </div>
        <Separator />
        <DaiMay d={d} may={may} />
      </div>

      {!hep && moPanel ? (
        // Panel không dính (đầu trang đã dính — hai lớp dính chồng nhau che mất đầu panel).
        <DetailLayout chinh={chinh} ben={<Panel d={d} may={may} />} nhanBen="Hồ sơ máy và khách" className="[&>[data-slot=detail-aside]]:static" />
      ) : (
        <div className="flex min-w-0 flex-col gap-5 border-none border-current">{chinh}</div>
      )}

      <Sheet open={hep && moSheet} onOpenChange={setMoSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Hồ sơ máy &amp; khách</SheetTitle>
            <SheetDescription>{t.ticket_code} · sửa chỉ đổi trên màn (prototype).</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <Panel d={d} may={may} />
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  )
}
