'use client'

// PROTOTYPE vứt đi — trang chi tiết ticket theo ref Shopify (order/customer detail) + Intercom (ticket), REA đọc luật
// Details template của Shopify 26/11 (docs/rework/2026-11-26-ref-mobbin-shopify-helpdesk.md):
// - 2 cột: chính = thứ ĐỊNH NGHĨA ca (lần lỗi, vật tư, nhật ký); phụ 280 = thứ HỖ TRỢ (người, máy, khách, ticket khác).
// - Đầu section mang số đếm + hành động của section. Chỉ gập lần lỗi CŨ, không gập cả section.
// - Trạng thái ở hàng tiêu đề, góc phải (kiểu Intercom) — yêu cầu #1 "thứ rõ nhất"; Khẩn chỉ khi Đang mở.
// - ‹ › sang ticket kề (PageHeader của DS); demo vì trang chưa giữ danh sách.
import { useState } from 'react'
import Link from 'next/link'
import { PencilSimple, Plus } from '@phosphor-icons/react/ssr'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DetailLayout } from '@/components/ui/detail-layout'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { PageHeader } from '@/components/ui/page-header'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { CanhBao, ChiPhi, cheSdt, chuaLuu, dsLan, DuongDan, MUC_DO, ngayVN, OKhan, ONguoi, OTrangThai, type DuLieuCt } from './chung'
import { BadgeBaoHanh, NhanKetQua, NhatKy, NoiDungLan, TRUOC } from './ct-gon'

/** Đầu section: tên + số đếm (Shopify "Templates (2)") + một hành động của section. */
function Section({ id, ten, dem, hanhDong, children }: { id: string; ten: string; dem?: number; hanhDong?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card aria-labelledby={id} role="region">
      {/* items-center: nút bút chì 28 và tiêu đề 24 cùng tâm (CardHeader mặc định items-start lệch 2px) */}
      <CardHeader className="items-center">
        <CardTitle id={id} role="heading" aria-level={2}>
          {ten}
          {dem !== undefined && <span className="font-normal text-muted-foreground tabular-nums"> ({dem})</span>}
        </CardTitle>
        {hanhDong && <CardAction className="row-span-1 self-center">{hanhDong}</CardAction>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function CacLan({ d }: { d: DuLieuCt }) {
  const ds = [...dsLan(d)].reverse() // mới nhất trên cùng (CSKH 23/11)
  const nguoi = d.t.ky_thuat_ten ?? d.t.cs_ten ?? 'CSKH'
  return (
    <Section
      id="ref-lan"
      ten="Các lần lỗi"
      dem={ds.length}
      hanhDong={
        <Button variant="outline" size="sm" onClick={chuaLuu}>
          <Plus aria-hidden="true" />
          Ghi lần lỗi
        </Button>
      }
    >
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
    </Section>
  )
}

/** Nút bút chì của một thẻ (Shopify): chỉ icon + tên cho trình đọc màn hình; prototype chưa mở form sửa. */
function NutSua({ ten }: { ten: string }) {
  return (
    <Button variant="ghost" size="icon-sm" aria-label={`Sửa ${ten}`} onClick={chuaLuu}>
      <PencilSimple aria-hidden="true" />
    </Button>
  )
}

/** Cột phụ kiểu Shopify: mỗi nhóm một thẻ riêng — người · máy · khách · ticket khác · phân loại. */
function CotPhu({ d }: { d: DuLieuCt }) {
  const { t } = d
  return (
    <div className="flex flex-col gap-4 border-none border-current">
      <Section id="ref-nguoi" ten="Phụ trách">
        <PropertyList layout="stack">
          <PropertyRow nhan="CS theo dõi">
            <ONguoi d={d} loai="cs" />
          </PropertyRow>
          <PropertyRow nhan="Kỹ thuật">
            <ONguoi d={d} loai="kt" />
          </PropertyRow>
        </PropertyList>
      </Section>
      <Section id="ref-may" ten="Máy" hanhDong={<NutSua ten="máy" />}>
        <PropertyList layout="stack">
          <PropertyRow nhan="Model">
            {t.serial ? (
              <Link href={`/may/${encodeURIComponent(t.serial)}`} prefetch={false}>
                {t.product_name ?? t.serial}
              </Link>
            ) : (
              t.product_name
            )}
          </PropertyRow>
          <PropertyRow nhan="Serial">{t.source_serial && <span className="tabular-nums">{t.source_serial}</span>}</PropertyRow>
          <PropertyRow nhan="Bảo hành">
            <BadgeBaoHanh d={d} />
          </PropertyRow>
        </PropertyList>
      </Section>
      <Section id="ref-khach" ten="Khách" hanhDong={<NutSua ten="khách" />}>
        <PropertyList layout="stack">
          <PropertyRow nhan="Tên">
            {t.customer_id ? (
              <Link href={`/khach/${t.customer_id}`} prefetch={false}>
                {t.customer_name}
              </Link>
            ) : (
              t.customer_name
            )}
          </PropertyRow>
          <PropertyRow nhan="Điện thoại">{cheSdt(t.primary_phone) && <span className="tabular-nums">{cheSdt(t.primary_phone)}</span>}</PropertyRow>
          <PropertyRow nhan="Tỉnh">{t.province}</PropertyRow>
        </PropertyList>
      </Section>
      {/* còn mở: chưa truy vấn ticket cùng serial / cùng khách → Demo (như bản Gọn). */}
      <Section id="ref-truoc" ten="Ticket khác" dem={TRUOC.length} hanhDong={<Badge variant="soft">Demo</Badge>}>
        <ItemGroup>
          {TRUOC.map((x) => (
            <Item key={x.ma} size="sm" variant="outline">
              <ItemContent>
                <ItemTitle>
                  <span className="tabular-nums">{x.ma}</span>
                </ItemTitle>
                <ItemDescription>
                  {x.viec} · <span className="tabular-nums">{ngayVN(x.ngay)}</span>
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
      </Section>
      <Section id="ref-loai" ten="Phân loại" hanhDong={<NutSua ten="phân loại" />}>
        <PropertyList layout="stack">
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
      </Section>
    </div>
  )
}

export function CtRef({ d }: { d: DuLieuCt }) {
  const { t } = d
  const [tt, setTt] = useState<string>(t.state)
  const [viTri, setViTri] = useState(3) // Demo: trang chưa giữ thứ tự danh sách
  return (
    <div className="flex flex-col gap-6 border-none border-current">
      <PageHeader
        duongDan={<DuongDan ma={t.ticket_code} />}
        chuyen={{ loai: 'Ticket', viTri, tong: 12, onTruoc: () => (setViTri((v) => v - 1), chuaLuu()), onSau: () => (setViTri((v) => v + 1), chuaLuu()) }}
        tieuDe={`${t.ticket_code} · ${t.ticket_type ?? 'Ticket'}`}
        meta={[
          t.product_name ?? 'Chưa rõ máy',
          t.customer_name ?? 'Chưa gắn khách',
          <span key="bao" className="tabular-nums">
            Khách báo {ngayVN(d.ngayDau)}
          </span>,
        ]}
        hanhDong={
          // Trạng thái = thứ rõ nhất, góc phải hàng tiêu đề (Intercom); Khẩn là cờ của ca đang mở.
          <div role="group" aria-label="Trạng thái ticket" data-ref="trang-thai" className="flex items-center gap-2 border-none border-current">
            {tt === 'Open' && <OKhan d={d} />}
            <OTrangThai d={d} onDoi={setTt} />
          </div>
        }
      />
      <DetailLayout
        nhanBen="Người, máy & khách"
        chinh={
          <>
            <CanhBao d={d} />
            <CacLan d={d} />
            <Section
              id="ref-cp"
              ten="Chi phí & vật tư"
              dem={d.items.length}
              hanhDong={
                <Button variant="outline" size="sm" onClick={chuaLuu}>
                  <Plus aria-hidden="true" />
                  Ghi linh kiện
                </Button>
              }
            >
              <ChiPhi d={d} />
            </Section>
            <Section id="ref-nk" ten="Nhật ký trao đổi" dem={d.notes.length}>
              <NhatKy d={d} />
            </Section>
          </>
        }
        ben={<CotPhu d={d} />}
      />
    </div>
  )
}
