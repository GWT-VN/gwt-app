'use client'

// PROTOTYPE vứt đi — PA B "Bảng dày": Table DS nhiều cột + FilterBar (chip loại/lỗi/ngày) + chọn dòng + thanh hàng loạt.
import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { CheckCircle, HandGrabbing, Siren } from '@phosphor-icons/react/ssr'
import type { Ticket } from '@/app/actions'
import { BoLocChon, BoLocGoiY, hrefBoLoc, KhungChon, LocNgay, OChonDong, OChonTatCa, OTimKiem, PhanTrang, ThanhDaChon, ThanhDangLoc, useDaChon } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { Button } from '@/components/ui/button'
import { DataViewToolbar, TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { nutMoTen } from '@/components/ui/list-view-styles'
import { thongBao } from '@/components/ui/sonner'
import { BangTrangThai, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { CHON_BANG } from '@/components/ui/table-styles'
import { chuaLuu, cheSdt, DauPrototype, mayLoi, NhanKhan, NhanTrangThai, ngayNgan, NutTaoTicket, TabTicket, tenKhach, type DuLieuTicket } from './chung'

/** Cột + bề rộng (px); `null` = ăn phần dư. Cột chọn 36 đứng đầu. */
const COT: { id: string; ten: string; rong: number | null; phai?: boolean; o: (t: Ticket) => React.ReactNode }[] = [
  { id: 'ma', ten: 'Mã', rong: 104, o: (t) => <span className="tabular-nums text-muted-foreground">{t.ticket_code}</span> },
  {
    id: 'khach',
    ten: 'Khách',
    rong: null,
    o: (t) => (
      <Link href={`/ticket/${encodeURIComponent(t.ticket_code)}`} className={nutMoTen}>
        {tenKhach(t)}
      </Link>
    ),
  },
  { id: 'sdt', ten: 'SĐT', rong: 88, o: (t) => <span className="tabular-nums">{cheSdt(t.primary_phone) ?? '—'}</span> },
  {
    id: 'may',
    ten: 'Máy · serial',
    rong: 200,
    o: (t) => (
      <span className="block min-w-0 truncate">
        {t.product_name ?? '—'}
        {t.source_serial && <span className="tabular-nums text-muted-foreground"> · {t.source_serial}</span>}
      </span>
    ),
  },
  { id: 'loai', ten: 'Loại', rong: 120, o: (t) => <span className="block truncate">{t.ticket_type ?? '—'}</span> },
  { id: 'loi', ten: 'Lỗi', rong: 180, o: (t) => <span className="block truncate text-muted-foreground">{t.dong_may?.[0] ? mayLoi(t) : '—'}</span> },
  { id: 'cs', ten: 'CS', rong: 120, o: (t) => <span className="block truncate">{t.cs_ten ?? '—'}</span> },
  { id: 'kt', ten: 'Kỹ thuật', rong: 120, o: (t) => <span className="block truncate">{t.ky_thuat_ten ?? '—'}</span> },
  { id: 'ngay', ten: 'Ngày tạo', rong: 88, phai: true, o: (t) => <span className="tabular-nums">{ngayNgan(t.created_at)}</span> },
  {
    id: 'tt',
    ten: 'Trạng thái',
    rong: 148,
    o: (t) => (
      <span className="flex items-center gap-1 border-none border-current">
        {t.khan && <NhanKhan />}
        <NhanTrangThai t={t} />
      </span>
    ),
  },
]
const RONG_TOI_THIEU = 36 + 240 + COT.reduce((s, c) => s + (c.rong ?? 0), 0)

function Dong({ t }: { t: Ticket }) {
  const { daChon } = useDaChon()
  return (
    <TableRow chon={daChon.includes(t.ticket_code)}>
      <OChonDong khoa={t.ticket_code} moTa={`ticket ${t.ticket_code}`} />
      {COT.map((c) => (
        <TableCell key={c.id} cot={c.id} phai={c.phai}>
          {c.o(t)}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function TicketB({ rows, tong, trang, soTrang, loaiList, dsLoi, demo }: DuLieuTicket) {
  const sp = useSearchParams()
  const pathname = usePathname()
  const g = (k: string) => sp.get(k) ?? ''
  const q = g('q')
  const loai = g('loai')
  const loi = g('loi')
  const coNgay = g('ngtu') || g('ngden')
  const dieuKien = [
    q && { nhan: 'Từ khoá', giaTri: q, href: hrefBoLoc(pathname, sp, 'q') },
    loai && { nhan: 'Loại ticket', giaTri: loai, href: hrefBoLoc(pathname, sp, 'loai') },
    loi && { nhan: 'Loại lỗi', giaTri: dsLoi.find((d) => d.code === loi)?.ten ?? loi, href: hrefBoLoc(pathname, sp, 'loi') },
    coNgay && {
      nhan: 'Ngày tạo',
      giaTri: `${g('ngtu') || '…'} → ${g('ngden') || '…'}`,
      href: hrefBoLoc(pathname, sp, 'ngtu', 'ngden'),
    },
  ].filter((d): d is { nhan: string; giaTri: string; href: string } => !!d)

  return (
    <TrangDuLieu>
      <DauPrototype ma="B" demo={demo} cach="Lọc bằng ô Loại ticket / Loại lỗi / Ngày tạo ở hàng chip; tick ô đầu dòng để hiện thanh hàng loạt; bấm tên khách mở trang chi tiết." />
      <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG }} thanhHangLoat="surface">
        <DataViewToolbar
          tieuDe="Ticket CSKH"
          timKiem={
            <Suspense>
              <OTimKiem placeholder="Mã ticket, serial, khách, SĐT…" aria-label="Tìm ticket" />
            </Suspense>
          }
          nutChinh={<NutTaoTicket />}
          tabs={<TabTicket tong={tong} />}
          dangXem="bang"
          onDoiXem={() => thongBao.xong('Prototype B chỉ dựng dạng Bảng — xem PA A cho Danh sách')}
          xemNhanh={false}
          onXemNhanh={() => thongBao.xong('Prototype B mở trang chi tiết — Xem nhanh có ở PA A')}
        />
        <ThanhDangLoc
          dieuKien={dieuKien}
          hienThi={rows.length}
          tong={tong}
          nhan="ticket"
          phai={
            <>
              <Suspense>
                <BoLocChon param="loai" nhan="Loại ticket" tuyChon={loaiList.map((l) => ({ giaTri: l, nhan: l }))} />
              </Suspense>
              <Suspense>
                <BoLocGoiY param="loi" nhan="Loại lỗi" tuyChon={dsLoi.map((d) => ({ giaTri: d.code, nhan: d.ten }))} />
              </Suspense>
              <Suspense>
                <LocNgay nhan="Ngày tạo" />
              </Suspense>
            </>
          }
        />
        <KhungChon
          khoaTrang={rows.map((t) => t.ticket_code)}
          tong={tong}
          bat
          thamSo={{ q, state: g('state'), khan: g('khan'), mine: g('mine'), loai, loi, ngtu: g('ngtu'), ngden: g('ngden') }}
        >
          {rows.length ? (
            <TableWrap>
              <Table layout="fixed" style={{ minWidth: RONG_TOI_THIEU }}>
                <colgroup>
                  <col style={{ width: 36 }} />
                  {COT.map((c) => (
                    <col key={c.id} style={c.rong ? { width: c.rong } : undefined} />
                  ))}
                </colgroup>
                <TableHeader>
                  <TableRow>
                    <OChonTatCa nhan="ticket" />
                    {COT.map((c) => (
                      <TableHead key={c.id} phai={c.phai}>
                        {c.ten}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((t) => (
                    <Dong key={t.ticket_code} t={t} />
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          ) : (
            <BangTrangThai trangThai="rongLoc" tieuDe="Không có ticket nào khớp" moTa="Thử bỏ bớt điều kiện ở hàng chip." />
          )}
          <ThanhDaChon nhan="ticket">
            <Button variant="ghost" size="sm" onClick={chuaLuu}>
              <HandGrabbing aria-hidden="true" />
              Nhận việc
            </Button>
            <Button variant="ghost" size="sm" onClick={chuaLuu}>
              <Siren aria-hidden="true" />
              Đánh dấu khẩn
            </Button>
            <Button variant="ghost" size="sm" onClick={chuaLuu}>
              <CheckCircle aria-hidden="true" />
              Đóng ticket
            </Button>
          </ThanhDaChon>
        </KhungChon>
        <Suspense>
          <PhanTrang trang={trang} soTrang={soTrang} tong={tong} nhan="ticket" />
        </Suspense>
      </CauHinhBangDs>
    </TrangDuLieu>
  )
}
