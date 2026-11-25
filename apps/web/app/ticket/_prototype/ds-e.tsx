'use client'

// PROTOTYPE vứt đi — PA E "Bàn làm việc trong ngày": số liệu trước (StatCard bấm = lọc), danh sách theo việc cần làm
// (Accordion + Item) sau, cột phải biểu đồ 14 ngày + 5 lỗi hay gặp.
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { Ticket } from '@/app/actions'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { DauPrototype, mayLoi, NhanKhan, ngayNgan, NutTaoTicket, tenKhach, useDatUrl, type DuLieuTicket } from './chung'

const NGAY = 86_400_000
const tuoi = (t: Ticket, bayGio: number) => Math.floor((bayGio - new Date(t.created_at).getTime()) / NGAY)
const ngayVn = (ms: number) => new Date(ms).toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' })

/** Giả định (DB chưa có trạng thái con): "chờ" = CS đã nhận, chưa có kỹ thuật; "quá 3 ngày" tính từ ngày tạo. */
const LOC = {
  khan: { nhan: 'Khẩn', dk: (t: Ticket) => t.khan },
  cham: { nhan: 'Quá 3 ngày chưa xử lý', dk: (t: Ticket, n: number) => tuoi(t, n) > 3 },
  cho: { nhan: 'Chờ khách', dk: (t: Ticket) => !!t.cs_phu_trach && !t.ky_thuat },
  moi: { nhan: 'Mới hôm nay', dk: (t: Ticket, n: number) => ngayVn(new Date(t.created_at).getTime()) === ngayVn(n) },
} as const
type MaLoc = keyof typeof LOC

/** Khu thu gọn — chia rời nhau theo thứ tự: một ticket chỉ nằm ở khu đầu tiên nó khớp. */
const KHU: { id: string; nhan: string; dk: (t: Ticket, n: number) => boolean }[] = [
  { id: 'ngay', nhan: 'Cần làm ngay', dk: (t, n) => t.khan || tuoi(t, n) > 3 },
  { id: 'moi', nhan: 'Mới vào — chưa ai nhận', dk: (t) => !t.cs_phu_trach },
  { id: 'cho', nhan: 'Đang chờ khách / linh kiện', dk: (t) => !t.ky_thuat },
  { id: 'dang', nhan: 'Kỹ thuật đang xử lý', dk: () => true },
]

const cauHinh = { so: { label: 'Ticket mới', color: 'var(--blue-400)' } } satisfies ChartConfig
const TRUC = { tickLine: false, axisLine: false, tickMargin: 8 } as const

function DongTicket({ t, bayGio }: { t: Ticket; bayGio: number }) {
  const n = tuoi(t, bayGio)
  return (
    <Item asChild size="sm">
      <Link href={`/ticket/${encodeURIComponent(t.ticket_code)}?variant=A`}>
        <ItemContent className="min-w-0">
          <ItemTitle className="w-full min-w-0">
            <span className="min-w-0 truncate">{tenKhach(t)}</span>
          </ItemTitle>
          <ItemDescription className="line-clamp-1">
            <span className="tabular-nums">{t.ticket_code}</span> · {mayLoi(t)}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          {t.khan && <NhanKhan />}
          <span className="ds-text-xs tabular-nums text-muted-foreground">{n <= 0 ? 'hôm nay' : `${n} ngày`}</span>
        </ItemActions>
      </Link>
    </Item>
  )
}

export function TicketE({ rows, demo }: DuLieuTicket) {
  const sp = useSearchParams()
  const dat = useDatUrl()
  const [bayGio] = useState(() => Date.now())
  const loc = sp.get('loc') as MaLoc | null
  const dangLoc = loc && loc in LOC ? LOC[loc] : null

  // Bàn làm việc = ticket còn mở (Đã xong / Đã huỷ chỉ góp vào biểu đồ).
  const mo = rows.filter((t) => t.state === 'Open')
  const dem = (k: MaLoc) => mo.filter((t) => LOC[k].dk(t, bayGio)).length
  const hien = dangLoc ? mo.filter((t) => dangLoc.dk(t, bayGio)) : mo
  const khu = KHU.map((k, i) => ({
    ...k,
    ds: hien.filter((t) => k.dk(t, bayGio) && !KHU.slice(0, i).some((tr) => tr.dk(t, bayGio))),
  }))

  const ngay14 = Array.from({ length: 14 }, (_, i) => {
    const ms = bayGio - (13 - i) * NGAY
    return { ngay: ngayNgan(new Date(ms).toISOString()), so: rows.filter((t) => ngayVn(new Date(t.created_at).getTime()) === ngayVn(ms)).length }
  })
  const loiHay = Object.entries(
    rows.reduce<Record<string, number>>((m, t) => {
      const k = mayLoi(t)
      if (k !== '—') m[k] = (m[k] ?? 0) + 1
      return m
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const the = (k: MaLoc) => (
    <StatCard
      key={k}
      nhan={LOC[k].nhan}
      giaTri={dem(k)}
      chan={loc === k ? 'Đang lọc' : 'Lọc danh sách'}
      href={`?${new URLSearchParams({ ...Object.fromEntries(sp), loc: k })}`}
      aria-current={loc === k ? 'true' : undefined}
    />
  )

  return (
    <TrangDuLieu>
      <DauPrototype
        ma="E"
        demo={demo}
        cach="Bấm một thẻ số để lọc danh sách bên dưới; bấm tên khu để thu/mở; bấm một dòng mở trang chi tiết PA A. Giả định: Chờ khách = CS đã nhận, chưa có kỹ thuật."
      />
      <PageHeader
        tieuDe="Bàn làm việc CSKH"
        meta={[
          new Date(bayGio).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }),
          `${mo.length} ticket đang mở`,
        ]}
        hanhDong={<NutTaoTicket />}
      />

      {/* Điện thoại: 2 thẻ một hàng (lưới DS tự đổ 1 cột ≤ 400 → 4 thẻ cao đẩy danh sách xuống quá xa). */}
      <StatGrid className="mt-6 max-md:grid-cols-2">{(Object.keys(LOC) as MaLoc[]).map(the)}</StatGrid>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 border-none border-current md:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-label="Ticket cần xử lý" className="flex min-w-0 flex-col gap-2 border-none border-current">
          {dangLoc && (
            <div className="flex items-center gap-2 border-none border-current">
              <span className="ds-text-sm text-muted-foreground">Đang lọc: {dangLoc.nhan}</span>
              <Button variant="ghost" size="xs" onClick={() => dat({ loc: null }, true)}>
                Bỏ lọc
              </Button>
            </div>
          )}
          <Accordion type="multiple" defaultValue={KHU.map((k) => k.id)}>
            {khu.map((k) => (
              <AccordionItem key={k.id} value={k.id}>
                <AccordionTrigger>
                  <span className="flex items-center gap-2 border-none border-current">
                    {k.nhan}
                    <span className="ds-text-xs tabular-nums text-muted-foreground">{k.ds.length}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {k.ds.length ? (
                    <ItemGroup aria-label={k.nhan} className="gap-1">
                      {k.ds.map((t) => (
                        <DongTicket key={t.ticket_code} t={t} bayGio={bayGio} />
                      ))}
                    </ItemGroup>
                  ) : (
                    <span className="ds-text-sm text-muted-foreground">Không có ticket nào.</span>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <aside aria-label="Xu hướng" className="flex min-w-0 flex-col gap-4 border-none border-current">
          <Card>
            <CardHeader>
              <CardTitle>Ticket mới 14 ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={cauHinh} className="aspect-auto h-44 w-full">
                <BarChart data={ngay14}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="ngay" {...TRUC} interval={3} />
                  <YAxis {...TRUC} width={24} allowDecimals={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="so" fill="var(--color-so)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>5 lỗi hay gặp</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemGroup aria-label="5 lỗi hay gặp">
                {loiHay.map(([loi, so]) => (
                  <Item key={loi} size="sm" className="px-0 py-1.5">
                    <ItemContent className="min-w-0">
                      <ItemTitle className="w-full min-w-0 font-normal">
                        <span className="min-w-0 truncate">{loi}</span>
                      </ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <span className="ds-text-sm tabular-nums text-muted-foreground">{so}</span>
                    </ItemActions>
                  </Item>
                ))}
              </ItemGroup>
            </CardContent>
          </Card>
        </aside>
      </div>
    </TrangDuLieu>
  )
}
