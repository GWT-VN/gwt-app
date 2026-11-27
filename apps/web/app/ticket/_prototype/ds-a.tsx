'use client'

// PROTOTYPE vứt đi — PA A "Hàng đợi như Việc": khuôn màn Work v2 (DataViewToolbar + ListView 1 dòng nhóm + Xem nhanh).
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Ticket } from '@/app/actions'
import { OTimKiem, PhanTrang } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataViewToolbar, TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { ListView, NhanDau, NutMoMa, NutMoTen, type CotDanhSach } from '@/components/ui/list-view'
import { thongBao } from '@/components/ui/sonner'
import { XemNhanh } from '@/components/ui/xem-nhanh'
import { DauPrototype, DocTicket, mayLoi, NhanKhan, NhanTrangThai, ngayNgan, NutTaoTicket, TabTicket, tenKhach, useDatUrl, type DuLieuTicket } from './chung'

const NHOM = [
  { gt: 'khan', nhan: <span className="text-(--color-text-danger)">Khẩn</span> },
  { gt: 'Open', nhan: 'Đang mở' },
  { gt: 'Done', nhan: 'Đã xong' },
  { gt: 'Cancel', nhan: 'Đã huỷ' },
]

const chuCai = (ten: string | null) =>
  (ten ?? '?')
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export function TicketA({ rows, tong, trang, soTrang, demo }: DuLieuTicket) {
  const sp = useSearchParams()
  const dat = useDatUrl()
  const xem = sp.get('xem')
  const i = xem ? rows.findIndex((t) => t.ticket_code === xem) : -1
  const t = i >= 0 ? rows[i] : null
  const mo = (ma: string | null) => dat({ xem: ma }, true)

  const cot: CotDanhSach<Ticket>[] = [
    {
      id: 'ticket',
      ten: 'Ticket · khách',
      rong: 'minmax(0,2.4fr)',
      dienThoai: 'tren',
      o: (t) => (
        <>
          {t.khan && (
            <NhanDau gon>
              <NhanKhan />
            </NhanDau>
          )}
          <NutMoMa ma={t.ticket_code} />
          <NutMoTen ten={tenKhach(t)} />
        </>
      ),
    },
    {
      id: 'loi',
      ten: 'Máy · lỗi',
      rong: 'minmax(0,1.2fr)',
      anKhiHep: true,
      dienThoai: 'duoi',
      o: (t) => <span className="min-w-0 truncate text-muted-foreground">{mayLoi(t)}</span>,
    },
    { id: 'tt', ten: 'Trạng thái', rong: '120px', dienThoai: 'duoiPhai', o: (t) => <NhanTrangThai t={t} /> },
    {
      id: 'ngay',
      ten: 'Hoạt động',
      rong: '96px',
      phai: true,
      dienThoai: 'trenPhai',
      o: (t) => <span className="tabular-nums text-muted-foreground">{ngayNgan(t.hoat_dong_cuoi ?? t.created_at)}</span>,
    },
    {
      id: 'cs',
      ten: 'CS',
      rong: '40px',
      anKhiHep: true,
      o: (t) =>
        t.cs_ten ? (
          <Avatar title={t.cs_ten}>
            <AvatarFallback>{chuCai(t.cs_ten)}</AvatarFallback>
          </Avatar>
        ) : null,
    },
  ]

  return (
    <XemNhanh
      coDinh
      the={t && { ma: t.ticket_code, phu: tenKhach(t), noiDung: <DocTicket key={t.ticket_code} t={t} /> }}
      onDong={() => mo(null)}
      onTruoc={i > 0 ? () => mo(rows[i - 1].ticket_code) : undefined}
      onSau={i >= 0 && i < rows.length - 1 ? () => mo(rows[i + 1].ticket_code) : undefined}
    >
      <TrangDuLieu>
        <DauPrototype ma="A" demo={demo} cach="Bấm tab để đổi hàng đợi; bấm TÊN khách hoặc mã để mở thẻ Xem nhanh bên phải (↑/↓ lật ticket, Esc đóng)." />
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
            onDoiXem={() => thongBao.xong('Prototype A chỉ dựng dạng Danh sách — xem PA B cho Bảng')}
            xemNhanh={t != null}
            onXemNhanh={(bat) => mo(bat ? (rows[0]?.ticket_code ?? null) : null)}
          />
          {rows.length ? (
            <ListView
              aria-label="Ticket CSKH"
              cot={cot}
              dong={rows}
              khoa={(t) => t.ticket_code}
              onMo={(t) => mo(t.ticket_code)}
              dangMo={xem}
              moKhi="ten"
              nhom={{ theo: (t) => (t.khan && t.state === 'Open' ? 'khan' : t.state), muc: NHOM }}
            />
          ) : (
            <EmptyState size="sm" kieu="loc" tieuDe="Không có ticket nào" moTa="Thử tab khác hoặc bỏ bớt từ khoá." />
          )}
          <Suspense>
            <PhanTrang trang={trang} soTrang={soTrang} tong={tong} nhan="ticket" />
          </Suspense>
        </CauHinhBangDs>
      </TrangDuLieu>
    </XemNhanh>
  )
}
