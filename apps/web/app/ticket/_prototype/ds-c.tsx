'use client'

// PROTOTYPE vứt đi — PA C "Hộp thư chia đôi": trái danh sách hẹp mục 2 dòng, phải đọc ticket đang chọn (`?chon=`).
import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { CaretLeft } from '@phosphor-icons/react/ssr'
import type { Ticket } from '@/app/actions'
import { OTimKiem, PhanTrang } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { Button } from '@/components/ui/button'
import { DataViewToolbar, TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { thongBao } from '@/components/ui/sonner'
import { chuaLuu, DauPrototype, DocTicket, mayLoi, NhanKhan, NhanTrangThai, ngayNgan, NutTaoTicket, TabTicket, tenKhach, useDatUrl, type DuLieuTicket } from './chung'

function DanhSach({ rows, chon }: { rows: Ticket[]; chon: string | null }) {
  const sp = useSearchParams()
  const pathname = usePathname()
  const href = (ma: string) => {
    const p = new URLSearchParams(sp.toString())
    p.set('chon', ma)
    return `${pathname}?${p}`
  }
  return (
    <ItemGroup aria-label="Danh sách ticket" className="gap-1">
      {rows.map((t) => (
        <Item key={t.ticket_code} asChild size="sm" variant={t.ticket_code === chon ? 'muted' : 'default'}>
          <Link href={href(t.ticket_code)} scroll={false} aria-current={t.ticket_code === chon ? 'true' : undefined}>
            <ItemContent className="min-w-0">
              <ItemTitle className="w-full min-w-0">
                <span className="min-w-0 truncate">{tenKhach(t)}</span>
              </ItemTitle>
              <ItemDescription className="line-clamp-1">
                <span className="tabular-nums">{t.ticket_code}</span> · {ngayNgan(t.hoat_dong_cuoi ?? t.created_at)} · {mayLoi(t)}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              {t.khan && <NhanKhan />}
              <NhanTrangThai t={t} />
            </ItemActions>
          </Link>
        </Item>
      ))}
    </ItemGroup>
  )
}

function KhungDoc({ t }: { t: Ticket }) {
  return (
    <article aria-label={`Ticket ${t.ticket_code}`} className="flex flex-col gap-4 border-none border-current p-5">
      <header className="flex flex-col gap-1 border-none border-current">
        <span className="ds-text-sm tabular-nums text-muted-foreground">{t.ticket_code}</span>
        <h2 className="m-0 ds-heading-sm">{tenKhach(t)}</h2>
      </header>
      <DocTicket
        t={t}
        them={
          <Button size="sm" onClick={chuaLuu}>
            Nhận việc
          </Button>
        }
      />
    </article>
  )
}

export function TicketC({ rows, tong, trang, soTrang, demo }: DuLieuTicket) {
  const sp = useSearchParams()
  const dat = useDatUrl()
  const maChon = sp.get('chon')
  const chon = rows.find((t) => t.ticket_code === maChon) ?? null
  // Màn rộng: chưa chọn → đọc ticket đầu (như hộp thư); điện thoại: chưa chọn → chỉ danh sách.
  const docRong = chon ?? rows[0] ?? null

  return (
    <TrangDuLieu>
      <DauPrototype ma="C" demo={demo} cach="Bấm một ticket bên trái để đọc ngay bên phải (kéo vạch giữa để đổi cỡ); trên điện thoại bấm ticket rồi ‹ Danh sách để quay lại." />
      <CauHinhBangDs giaoDien={O_TIM_PILL}>
        <DataViewToolbar
          tieuDe="Ticket CSKH"
          timKiem={
            <Suspense>
              <OTimKiem placeholder="Mã ticket, serial, khách, SĐT…" aria-label="Tìm ticket" />
            </Suspense>
          }
          nutChinh={<NutTaoTicket />}
          tabs={<TabTicket tong={tong} />}
          dangXem="danh-sach"
          onDoiXem={() => thongBao.xong('Prototype C chỉ có dạng hộp thư')}
          xemNhanh
          onXemNhanh={() => thongBao.xong('Prototype C luôn có khung đọc bên phải')}
        />
        {!rows.length ? (
          <EmptyState size="sm" kieu="loc" tieuDe="Không có ticket nào" moTa="Thử tab khác hoặc bỏ bớt từ khoá." />
        ) : (
          <>
            {/* ponytail: cao khung cố định 75svh để hai cột cuộn riêng — chốt PA thì tính theo chiều cao vùng nội dung của khung. */}
            {/* Vỏ ẩn < 768: thư viện gắn display:flex inline lên Group nên lớp ẩn phải nằm ở vỏ. */}
            <div className="border-none border-current max-md:hidden">
            <ResizablePanelGroup
              orientation="horizontal"
              className="h-[75svh] overflow-hidden rounded-(--radius-xl) border border-solid border-(--border)"
            >
              <ResizablePanel defaultSize="38%" minSize="28%">
                <ScrollArea className="h-full">
                  <div className="border-none border-current p-2">
                    <DanhSach rows={rows} chon={docRong?.ticket_code ?? null} />
                  </div>
                </ScrollArea>
              </ResizablePanel>
              <ResizableHandle withHandle aria-label="Đổi cỡ danh sách và khung đọc" />
              <ResizablePanel defaultSize="62%" minSize="35%">
                <ScrollArea className="h-full">{docRong && <KhungDoc key={docRong.ticket_code} t={docRong} />}</ScrollArea>
              </ResizablePanel>
            </ResizablePanelGroup>
            </div>
            <div className="border-none border-current md:hidden">
              {chon ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => dat({ chon: null }, true)}>
                    <CaretLeft aria-hidden="true" />
                    Danh sách
                  </Button>
                  <KhungDoc t={chon} />
                </>
              ) : (
                <DanhSach rows={rows} chon={null} />
              )}
            </div>
          </>
        )}
        <Suspense>
          <PhanTrang trang={trang} soTrang={soTrang} tong={tong} nhan="ticket" />
        </Suspense>
      </CauHinhBangDs>
    </TrangDuLieu>
  )
}
