import Link from 'next/link'
import { NutQuayLai } from '@/components/NutQuayLai'
import { notFound } from 'next/navigation'
import { issueReport, ticketsInGroup, nhomLoiChiTiet } from '@/app/actions'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { MucDoBadge, BaoHangBadge, NguonBadge } from '@/components/NhomLoiBadge'
import { StateBadge, vnDateTime } from '@/components/TicketBadge'
import { NhomLoiForm } from '@/components/NhomLoiForm'
import { ManV2 } from '@/components/khung/ManV2'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DetailHeading, DetailLayout } from '@/components/ui/detail-layout'
import { PageHeader } from '@/components/ui/page-header'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { BangTrangThai, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'

export default async function NhomLoiDetail({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const [all, tickets, chiTiet, quyen] = await Promise.all([
    issueReport(false), ticketsInGroup(code), nhomLoiChiTiet(code), hoiQuyen({ cauHinh: ['cs.nhom_loi.cau_hinh', 'QUANLY'] }),
  ])
  const nhom = all.find((r) => r.code === code)
  if (!nhom) notFound()

  // model nào dính nhiều nhất -> bằng chứng cho công ty mẹ
  const theoModel = new Map<string, number>()
  for (const t of tickets) {
    const k = t.internal_code ?? '(chưa gắn máy)'
    theoModel.set(k, (theoModel.get(k) ?? 0) + 1)
  }
  const models = [...theoModel.entries()].sort((a, b) => b[1] - a[1])

  return (
    <ManV2>
      <main className="mx-auto w-full max-w-[1584px] space-y-5 px-4 py-5 sm:px-6">
        <PageHeader
          duongDan={<NutQuayLai macDinh="/nhom-loi" />}
          tieuDe={nhom.ten}
          meta={[
            <MucDoBadge key="muc-do" muc_do={nhom.muc_do} />,
            ...(nhom.bao_hang ? [<BaoHangBadge key="bao-hang" />] : []),
          ]}
        />
        {nhom.mo_ta && <p className="max-w-3xl text-sm text-muted-foreground">{nhom.mo_ta}</p>}

        <DetailLayout
          nhanBen="Thống kê nhóm lỗi"
          ben={
            <Card className="space-y-4">
              <PropertyList tieuDe="Thống kê nhóm lỗi">
                <PropertyRow nhan="Ticket">{nhom.so_ticket}</PropertyRow>
                <PropertyRow nhan="Đang mở">{nhom.dang_mo}</PropertyRow>
                <PropertyRow nhan="90 ngày qua">{nhom.trong_90_ngay}</PropertyRow>
                <PropertyRow nhan="Khách dính">{nhom.so_khach}</PropertyRow>
                <PropertyRow nhan="Máy dính">{nhom.so_may}</PropertyRow>
              </PropertyList>
              <DetailHeading cap={3}>Model dính lỗi</DetailHeading>
              <div className="flex flex-wrap gap-2">
                {models.map(([m, n]) => <Badge key={m} variant="outline">{m} × {n}</Badge>)}
                {!models.length && <span className="text-sm text-muted-foreground">Chưa có</span>}
              </div>
              {theoModel.has('(chưa gắn máy)') && (
                <Alert color="warning">
                  <AlertDescription>
                    {theoModel.get('(chưa gắn máy)')} ticket chưa gắn serial. Gắn serial ở trang ticket để xác định model khi báo hãng.
                  </AlertDescription>
                </Alert>
              )}
            </Card>
          }
          chinh={
            <>
              <DetailHeading>Ticket trong nhóm</DetailHeading>
              {tickets.length === 0 ? (
                <BangTrangThai trangThai="rongThat" tieuDe="Nhóm này chưa có ticket nào." />
              ) : (
                <TableWrap vien className="min-w-0">
                  <Table aria-label="Ticket trong nhóm" variant="thuong" className="min-w-[680px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead scope="col">Ticket</TableHead>
                        <TableHead scope="col">Ngày</TableHead>
                        <TableHead scope="col">Trạng thái</TableHead>
                        <TableHead scope="col">Máy</TableHead>
                        <TableHead scope="col">Khách</TableHead>
                        <TableHead scope="col">Khách báo gì</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tickets.map((t) => (
                        <TableRow key={t.ticket_code} className="align-top">
                          <TableCell className="whitespace-nowrap">
                            <Link href={`/ticket/${t.ticket_code}`} prefetch={false} className="font-mono text-xs text-foreground underline">
                              {t.ticket_code}
                            </Link>
                            <div className="mt-1"><NguonBadge nguon={t.nguon} /></div>
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">{vnDateTime(t.created_at)}</TableCell>
                          <TableCell><StateBadge state={t.state} /></TableCell>
                          <TableCell>
                            {t.serial ? (
                              <>
                                <Link href={`/may/${encodeURIComponent(t.serial)}`} prefetch={false} className="text-foreground underline">
                                  {t.product_name ?? t.internal_code}
                                </Link>
                                <div className="font-mono text-[10px] text-muted-foreground">{t.serial}</div>
                              </>
                            ) : (
                              <span className="text-(--color-text-warning) text-xs">chưa gắn máy</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {t.customer_id ? (
                              <Link href={`/khach/${t.customer_id}`} prefetch={false} className="text-foreground underline">{t.customer_name}</Link>
                            ) : <span className="text-muted-foreground">—</span>}
                            <div className="font-mono text-xs text-muted-foreground">{t.primary_phone ?? ''}</div>
                          </TableCell>
                          <TableCell className="max-w-md whitespace-normal break-words">
                            {t.description ?? <span className="text-muted-foreground italic">không ghi mô tả</span>}
                            <div className="text-[10px] text-muted-foreground mt-0.5">loại Odoo: {t.ticket_type ?? '—'}</div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableWrap>
              )}
              {quyen.cauHinh && chiTiet && (
                <Card>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline">Sửa nhóm / mẫu gom / xoá</Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent forceMount className="pt-4 data-[state=closed]:hidden">
                      <NhomLoiForm nhom={chiTiet} />
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}
            </>
          }
        />
      </main>
    </ManV2>
  )
}