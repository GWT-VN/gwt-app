'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import type { TabView } from '@/app/actions'
import type { SapXep } from '@/bang'
import type { TruongLoc } from '@/components/ui/bo-loc-truong'
import type { CotDanhSach } from '@/components/ui/list-view'
import type { CotBang } from '@/components/ui/use-cot-bang'
import { hienNgay } from '@/lib/dinh-dang-ngay'
import { BangF } from '../_bang-f'
import type { KhachRow } from '../actions'
import { TAB_KHACH_SALES } from '../truong-sales'

const COT: CotBang[] = [
  { id: 'ma', ten: 'Mã KH', kieu: 'sap', khoa: true, toiThieu: 100, nghia: { tang: 'Mã nhỏ trước', giam: 'Mã lớn trước' } },
  { id: 'ten', ten: 'Tên', kieu: 'sap', toiThieu: 128, rongToiDa: 280, nghia: { tang: 'Tên từ A đến Z', giam: 'Tên từ Z đến A' } },
  { id: 'phone', ten: 'SĐT', kieu: 'sap', toiThieu: 112, nghia: { tang: 'Số nhỏ trước', giam: 'Số lớn trước' } },
  { id: 'tinh', ten: 'Tỉnh/TP', kieu: 'sap', rongToiDa: 200, nghia: { tang: 'Tỉnh/TP từ A đến Z', giam: 'Tỉnh/TP từ Z đến A' } },
  { id: 'don', ten: 'Đơn', kieu: 'sap', phai: true, nghia: { tang: 'Ít đơn trước', giam: 'Nhiều đơn trước' } },
  { id: 'mua', ten: 'Mua gần nhất', kieu: 'sap', ngay: true, nghia: { tang: 'Lâu nhất trước', giam: 'Gần nhất trước' } },
]

const href = (c: KhachRow) => `/sales/khach/${encodeURIComponent(c.customer_code)}`

const COT_DS: CotDanhSach<KhachRow>[] = [
  {
    id: 'ten', ten: 'Khách', rong: 'minmax(0,2fr)', dienThoai: 'tren',
    o: (c) => <Link href={href(c)} prefetch={false} className="min-w-0 truncate font-medium hover:underline">{c.name || c.customer_code}</Link>,
  },
  { id: 'ma', ten: 'Mã KH', rong: 'minmax(0,1fr)', dienThoai: 'trenPhai', o: (c) => c.customer_code },
  { id: 'sdt', ten: 'SĐT', rong: 'minmax(0,1fr)', dienThoai: 'duoi', o: (c) => c.phone || '—' },
  { id: 'tinh', ten: 'Tỉnh/TP', rong: 'minmax(0,1fr)', dienThoai: 'duoiPhai', o: (c) => c.province || '—' },
]

/** Danh sách khách Sales — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). */
export function BangKhachSales(p: {
  rows: KhachRow[]
  tong: number
  trang: number
  soTrang: number
  sapXep: SapXep
  tabRieng: TabView[]
  quyenTabChung: boolean
  truong: TruongLoc[]
  taoKhach: ReactNode
  ghiChu?: ReactNode
}) {
  return (
    <BangF<KhachRow>
      {...p}
      tieuDe="Khách hàng"
      nhan="khách"
      timKiem={{ placeholder: 'Tên, SĐT, mã KH…', nhan: 'Tìm khách hàng' }}
      nutChinh={p.taoKhach}
      bang="sales_khach_tab"
      coDinh={TAB_KHACH_SALES}
      viDuTen="VD: Khách Hà Nội"
      co={[{ id: 'trung_sdt', nhan: 'SĐT', giaTri: 'Trùng nhiều hồ sơ' }]}
      cot={COT}
      o={(c, id, ngay) =>
        id === 'ma' ? (
          <Link href={href(c)} prefetch={false} className="font-mono hover:underline">{c.customer_code}</Link>
        ) : id === 'ten' ? (
          <Link href={href(c)} prefetch={false} className="font-medium hover:underline">{c.name || '—'}</Link>
        ) : id === 'phone' ? c.phone || '—'
        : id === 'tinh' ? c.province || '—'
        : id === 'don' ? (c.total_orders ?? 0)
        : hienNgay(c.last_order_date, ngay(id))
      }
      tieuDeO={(c, id) => (id === 'ten' ? c.name ?? undefined : undefined)}
      cotDs={COT_DS}
      khoa={(c) => c.customer_code}
      hrefMo={href}
      // Mã KH… từ Sheet, Mã KA… tạo trên app (trước là dòng mô tả dưới tiêu đề trang).
      chanTrang={<p className="text-xs text-muted-foreground">Mã KH… đồng bộ từ Google Sheet · Mã KA… tạo trên app.</p>}
      rong={{ loc: 'Không tìm thấy khách nào', that: { tieuDe: 'Chưa có khách hàng', moTa: 'Khách từ Google Sheet và khách tạo trên app sẽ hiện ở đây.' } }}
    />
  )
}
