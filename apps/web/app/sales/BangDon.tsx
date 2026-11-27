'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import type { TabView } from '@/app/actions'
import type { SapXep } from '@/bang'
import type { TruongLoc } from '@/components/ui/bo-loc-truong'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CotDanhSach } from '@/components/ui/list-view'
import type { CotBang } from '@/components/ui/use-cot-bang'
import { hienNgay } from '@/lib/dinh-dang-ngay'
import { BangF } from './_bang-f'
import { fmtVnd, TabBadge } from './_ui'
import type { DonRow } from './actions'
import { TAB_DON } from './truong-sales'

const COT: CotBang[] = [
  { id: 'ma', ten: 'Mã đơn', kieu: 'sap', khoa: true, toiThieu: 140, nghia: { tang: 'Mã từ A đến Z', giam: 'Mã từ Z đến A' } },
  { id: 'ngay', ten: 'Ngày', kieu: 'sap', ngay: true, nghia: { tang: 'Cũ nhất trước', giam: 'Mới nhất trước' } },
  { id: 'khach', ten: 'Khách', kieu: 'sap', toiThieu: 128, rongToiDa: 280, nghia: { tang: 'Tên từ A đến Z', giam: 'Tên từ Z đến A' } },
  { id: 'tinh', ten: 'Tỉnh/TP', kieu: 'thuong', rongToiDa: 200 },
  { id: 'tt', ten: 'Tình trạng', kieu: 'thuong', rongToiDa: 200 },
  { id: 'tp', ten: 'Thanh toán', kieu: 'thuong', rongToiDa: 200 },
  { id: 'tong', ten: 'Tổng (VAT)', kieu: 'sap', phai: true, nghia: { tang: 'Nhỏ trước', giam: 'Lớn trước' } },
]

const href = (d: DonRow) => `/sales/don/${encodeURIComponent(d.order_code)}`

function MaDon({ d }: { d: DonRow }) {
  return (
    <Link href={href(d)} prefetch={false} className="inline-flex min-w-0 items-center gap-2 font-medium hover:underline">
      {d.source_tab && <TabBadge tab={d.source_tab} />}
      <span className="truncate">{d.order_code}</span>
      {/* Nhãn "App" = đơn tạo trên app, sửa hoặc xoá được (trước là dòng mô tả dưới tiêu đề trang). */}
      {d.is_app && <Badge variant="soft" color="info" title="Tạo trên app — sửa hoặc xoá được">App</Badge>}
    </Link>
  )
}

const COT_DS: CotDanhSach<DonRow>[] = [
  { id: 'ten', ten: 'Mã đơn', rong: 'minmax(0,1.6fr)', dienThoai: 'tren', o: (d) => <MaDon d={d} /> },
  { id: 'tong', ten: 'Tổng', rong: 'minmax(0,1fr)', phai: true, dienThoai: 'trenPhai', o: (d) => fmtVnd(d.total_vat || null) },
  { id: 'khach', ten: 'Khách', rong: 'minmax(0,1.4fr)', dienThoai: 'duoi', o: (d) => d.customer_name || '—' },
  { id: 'ngay', ten: 'Ngày', rong: 'minmax(0,1fr)', dienThoai: 'duoiPhai', o: (d) => hienNgay(d.order_date) },
]

/** Danh sách đơn Sales — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). */
export function BangDon(p: {
  rows: DonRow[]
  tong: number
  trang: number
  soTrang: number
  sapXep: SapXep
  tabRieng: TabView[]
  quyenTabChung: boolean
  truong: TruongLoc[]
  /** Đang lọc sản phẩm → nhắc cột Tổng chỉ cộng dòng khớp. */
  ghiChu?: ReactNode
}) {
  return (
    <BangF<DonRow>
      {...p}
      tieuDe="Đơn hàng"
      nhan="đơn"
      timKiem={{ placeholder: 'Mã đơn, tên khách, sản phẩm…', nhan: 'Tìm đơn hàng' }}
      nutChinh={<Button asChild><Link href="/sales/don/moi">Tạo đơn</Link></Button>}
      bang="sales_don_tab"
      coDinh={TAB_DON}
      viDuTen="VD: Đơn POE chưa thu"
      cot={COT}
      o={(d, id, ngay) =>
        id === 'ma' ? <MaDon d={d} />
        : id === 'ngay' ? hienNgay(d.order_date, ngay(id))
        : id === 'khach' ? d.customer_name || '—'
        : id === 'tinh' ? d.province || '—'
        : id === 'tt' ? d.fulfillment_status || '—'
        : id === 'tp' ? d.payment_status || '—'
        : fmtVnd(d.total_vat || null)
      }
      tieuDeO={(d, id) => (id === 'khach' ? d.customer_name ?? undefined : id === 'ma' ? d.order_code : undefined)}
      cotDs={COT_DS}
      khoa={(d) => d.order_code}
      hrefMo={href}
      rong={{ loc: 'Không có đơn nào khớp', that: { tieuDe: 'Chưa có đơn hàng', moTa: 'Đơn từ Google Sheet và đơn tạo trên app sẽ hiện ở đây.' } }}
    />
  )
}
