'use client'

// PROTOTYPE vứt đi — "Bố cục cũ · UI mới" (CEO 26/11: "thử layout app cũ nhưng UI mới"): bố cục BÁM ĐÚNG màn cũ
// (nhánh không-variant của ../page.tsx + DauTicket), chỉ thay vỏ bằng DS — để so với bản gọn (ct-gon.tsx).
// Khác bản gọn: lần lỗi CŨ → MỚI (Lần 1 trên), mọi lần mở sẵn, Khách báo | Xử lý ngang nhau; khách & máy ở cột phải.
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, PencilSimple, Plus, Trash } from '@phosphor-icons/react/ssr'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { CanhBao, cheSdt, chuaLuu, dsLan, MUC_DO, ngayVN, OKhan, ONguoi, OTrangThai, tien, TT, type DuLieuCt, type Lan } from './chung'
import { NhatKy } from './ct-gon'

/** Hàng ô sửa của DauTicket cũ: nhãn chữ nhạt + ô sửa tại chỗ DS. */
function Cap({ nhan, children }: { nhan: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 border-none border-current">
      <span className="ds-text-sm text-muted-foreground">{nhan}</span>
      {children}
    </span>
  )
}

function DauTicket({ d, tt, setTt }: { d: DuLieuCt; tt: string; setTt: (v: string) => void }) {
  const { t } = d
  const lan = dsLan(d) // đếm cả lần Demo cho khớp danh sách bên dưới
  return (
    <Card className="flex flex-col gap-3">
      <PageHeader tieuDe={t.ticket_code} meta={[t.ticket_type, t.product_name, t.province].filter(Boolean)} />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-none border-current">
        <Cap nhan="Trạng thái">
          <OTrangThai d={d} onDoi={setTt} />
        </Cap>
        {tt === 'Open' && <OKhan d={d} />}
        <Cap nhan="CS theo dõi">
          <ONguoi d={d} loai="cs" />
        </Cap>
        <Cap nhan="Kỹ thuật">
          <ONguoi d={d} loai="kt" />
        </Cap>
      </div>
      <p className="m-0 ds-text-sm text-muted-foreground tabular-nums">
        {TT.find((x) => x.gt === tt)?.nhan ?? tt} · {lan.length} lần lỗi · lần cuối {ngayVN(lan.at(-1)?.ngay)}
      </p>
    </Card>
  )
}

function KhungLan({ lan, nguoi }: { lan: Lan; nguoi: string }) {
  return (
    <Card data-lan={lan.so}>
      <CardHeader>
        <CardTitle className="ds-text-sm tabular-nums">
          Lần {lan.so} · {ngayVN(lan.ngay)} {lan.demo && <Badge variant="soft">Demo</Badge>}
        </CardTitle>
        <CardAction>
          {lan.so === 1 ? (
            <Button variant="ghost" size="xs" onClick={chuaLuu}>
              <PencilSimple aria-hidden="true" />
              Sửa loại / lần 1
            </Button>
          ) : (
            <span className="flex gap-1 border-none border-current">
              <Button variant="ghost" size="xs" onClick={chuaLuu}>
                <PencilSimple aria-hidden="true" />
                Sửa
              </Button>
              <Button variant="ghost" size="xs" onClick={chuaLuu}>
                <Trash aria-hidden="true" />
                Xoá
              </Button>
            </span>
          )}
        </CardAction>
      </CardHeader>
      {/* Khách báo | Xử lý ngang nhau như màn cũ; hẹp thì xếp dọc. */}
      <CardContent className="grid items-start gap-4 md:grid-cols-2">
        <PropertyList layout="stack">
          <PropertyRow nhan="Khách báo">{lan.khach && <span className="whitespace-pre-line">{lan.khach}</span>}</PropertyRow>
        </PropertyList>
        <PropertyList layout="stack">
          <PropertyRow nhan="Xử lý">
            {lan.xuLy ? (
              <span className="flex flex-col gap-1 border-none border-current">
                <span className="whitespace-pre-line">{lan.xuLy}</span>
                <span className="ds-text-xs text-muted-foreground">{nguoi}</span>
              </span>
            ) : null}
          </PropertyRow>
          {lan.vatTu.length > 0 && <PropertyRow nhan="Vật tư">{lan.vatTu.join(', ')}</PropertyRow>}
          {lan.thaoTu && <PropertyRow nhan="Tháo từ máy khác">{lan.thaoTu}</PropertyRow>}
        </PropertyList>
      </CardContent>
    </Card>
  )
}

function CacLan({ d }: { d: DuLieuCt }) {
  const nguoi = d.t.ky_thuat_ten ?? d.t.cs_ten ?? 'CSKH'
  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          Các lần lỗi
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {dsLan(d).map((l) => (
          <KhungLan key={l.so} lan={l} nguoi={nguoi} />
        ))}
        <Button variant="outline" size="sm" className="self-start" onClick={chuaLuu}>
          <Plus aria-hidden="true" />
          Thêm lần lỗi mới
        </Button>
      </CardContent>
    </Card>
  )
}

/** Chi phí ở cột phải hẹp (~316): PropertyList tên → SL · tiền, thay bảng 3 cột (bảng rộng 417 phải cuộn ngang). */
function ChiPhiHep({ d }: { d: DuLieuCt }) {
  if (d.items.length === 0) return <p className="m-0 ds-text-sm text-muted-foreground">Chưa có chi phí hay vật tư.</p>
  const tong = d.items.reduce((s, i) => s + (i.tinh_phi ? (i.so_tien ?? 0) : 0), 0)
  return (
    <PropertyList>
      {d.items.map((i) => (
        <PropertyRow
          key={i.id}
          nhan={i.loai === 'doi_may' ? `Đổi máy ${i.serial_cu ?? '?'} → ${i.serial_moi ?? '?'}` : (i.catalog_code && d.tenCatalog[i.catalog_code]) || i.mo_ta || i.catalog_code}
        >
          <span className="tabular-nums">
            {i.so_luong ? `${i.so_luong} · ` : ''}
            {i.tinh_phi ? tien(i.so_tien) : 'Miễn phí'}
          </span>
        </PropertyRow>
      ))}
      <PropertyRow nhan="Tổng thu khách">
        <span className="font-medium tabular-nums">{tien(tong)}</span>
      </PropertyRow>
    </PropertyList>
  )
}

function BaoHanh({ d }: { d: DuLieuCt }) {
  const { t } = d
  const [bay] = useState(Date.now) // mốc hôm nay lấy một lần (không gọi Date.now lúc vẽ)
  if (!t.serial) return null
  if (!t.warranty_activated || !t.warranty_full_end) return <>chưa kích hoạt</>
  const con = Date.parse(t.warranty_full_end) > bay
  return (
    <span className="flex flex-wrap items-center gap-2 border-none border-current tabular-nums">
      đến {ngayVN(t.warranty_full_end)}
      <Badge variant="soft" color={con ? 'success' : 'danger'}>
        {con ? 'Còn hạn' : 'Hết hạn'}
      </Badge>
    </span>
  )
}

function KhachMay({ d }: { d: DuLieuCt }) {
  const { t } = d
  return (
    <Card className="flex flex-col gap-4">
      <PropertyList tieuDe="Khách">
        <PropertyRow nhan="Tên">
          {t.customer_id ? (
            <Link href={`/khach/${t.customer_id}`} prefetch={false}>
              {t.customer_name}
            </Link>
          ) : (
            t.customer_name
          )}
        </PropertyRow>
        <PropertyRow nhan="SĐT">{cheSdt(t.primary_phone) && <span className="tabular-nums">{cheSdt(t.primary_phone)}</span>}</PropertyRow>
        <PropertyRow nhan="Tỉnh/TP">{t.province}</PropertyRow>
        <PropertyRow nhan="Tài khoản nhận việc">
          <span className="flex flex-wrap items-center gap-2 border-none border-current">
            {t.cs_ten ?? <span className="text-muted-foreground">chưa có</span>}
            {!t.cs_phu_trach && (
              <Button variant="outline" size="xs" onClick={chuaLuu}>
                Nhận việc
              </Button>
            )}
          </span>
        </PropertyRow>
      </PropertyList>
      <PropertyList tieuDe="Máy & lỗi">
        <PropertyRow nhan="Máy">
          {t.serial ? (
            <Link href={`/may/${encodeURIComponent(t.serial)}`} prefetch={false}>
              {t.product_name}
            </Link>
          ) : null}
        </PropertyRow>
        <PropertyRow nhan="Serial">{t.source_serial && <span className="tabular-nums">{t.source_serial}</span>}</PropertyRow>
        <PropertyRow nhan="Bảo hành">
          <BaoHanh d={d} />
        </PropertyRow>
        <PropertyRow nhan="Dòng máy & loại lỗi">
          {d.dongMay.length > 0 ? `${d.dongMay.length} dòng đã ghi` : d.thieu.dongMay ? null : 'Chưa ghi máy / loại lỗi nào'}
        </PropertyRow>
      </PropertyList>
    </Card>
  )
}

export function CtCu({ d }: { d: DuLieuCt }) {
  const { t } = d
  const [tt, setTt] = useState<string>(t.state)
  const moiNhat = d.notes[0] // listTicketNotes trả mới trước
  return (
    <div className="flex flex-col gap-4 border-none border-current">
      <Button variant="ghost" size="sm" className="self-start" asChild>
        <Link href="/ticket">
          <ArrowLeft aria-hidden="true" />
          Quay lại
        </Link>
      </Button>
      <DauTicket d={d} tt={tt} setTt={setTt} />
      <CanhBao d={d} />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4 border-none border-current">
          <CacLan d={d} />
          {/* Dưới lg: khách & máy chen ngay sau các lần lỗi như màn cũ. */}
          <div className="border-none border-current lg:hidden">
            <KhachMay d={d} />
          </div>
          <Card>
            <Accordion type="single" collapsible>
              <AccordionItem value="nk" className="border-b-0">
                <AccordionTrigger className="py-0">
                  <span className="flex min-w-0 flex-col gap-1 border-none border-current">
                    Nhật ký trao đổi · {d.notes.length}
                    {moiNhat && <span className="truncate font-normal text-muted-foreground">{moiNhat.noi_dung}</span>}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <NhatKy d={d} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>
        <div className="flex min-w-0 flex-col gap-4 border-none border-current">
          <div className="hidden border-none border-current lg:block">
            <KhachMay d={d} />
          </div>
          {d.nhom.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle role="heading" aria-level={2}>
                  Nhóm lỗi
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {d.nhom.map((n) => {
                  const m = MUC_DO[n.muc_do] ?? MUC_DO.thuong
                  return (
                    <Badge key={n.group_code} variant={m.solid ? 'solid' : 'soft'} color={m.color}>
                      {n.nhom_ten}
                    </Badge>
                  )
                })}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle role="heading" aria-level={2}>
                Chi phí & vật tư
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChiPhiHep d={d} />
            </CardContent>
          </Card>
          {/* Màn cũ chỉ hiện khi có quyền lịch KT VÀ ticket đã gắn khách; prototype bỏ điều kiện khách để thấy nút. */}
          {d.quyen.lichKT && (
            <Button className="w-full" onClick={chuaLuu}>
              <Plus aria-hidden="true" />
              Tạo lịch kỹ thuật cho ticket này
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
