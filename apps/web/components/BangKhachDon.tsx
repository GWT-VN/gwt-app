'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import type { Customer, TabView } from '@/app/actions'
import { TAB_KHACH_DON } from '@/app/khach/truong-khach-don'
import type { SapXep } from '@/bang'
import { BangDanhSachF, type CotF } from '@/components/BangDanhSachF'
import { Badge } from '@/components/ui/badge'
import type { CotDanhSach } from '@/components/ui/list-view'

type Khach = Customer & { machines: number }
const href = (c: Khach) => `/khach/${c.id}`

function Sdt({ c }: { c: Khach }) {
  if (!c.needs_phone) return <span className="tabular-nums text-muted-foreground">{c.primary_phone ?? '—'}</span>
  return c.primary_phone
    ? <span className="tabular-nums text-(--color-text-warning)" title="Số sai định dạng — cần xin lại">{c.primary_phone} ⚠️</span>
    : <Badge variant="soft" color="danger">thiếu</Badge>
}

const COT: CotF<Khach>[] = [
  {
    id: 'full_name', ten: 'Khách', kieu: 'sap', khoa: true, toiThieu: 128, rongToiDa: 260, title: (c) => c.full_name,
    nghia: { tang: 'Tên từ A đến Z', giam: 'Tên từ Z đến A' },
    o: (c) => <Link href={href(c)} prefetch={false} className="font-medium hover:underline">{c.full_name}</Link>,
  },
  {
    id: 'notes', ten: 'Ghi chú', kieu: 'thuong', rongToiDa: 320, title: (c) => c.notes,
    o: (c) => (c.notes ? <span className="text-(--color-text-warning)">{c.notes}</span> : '—'),
  },
  { id: 'machines', ten: 'Máy', kieu: 'thuong', phai: true, o: (c) => c.machines },
  { id: 'primary_phone', ten: 'SĐT', kieu: 'thuong', batBuoc: true, o: (c) => <Sdt c={c} /> },
  {
    id: 'address', ten: 'Địa chỉ', kieu: 'thuong', batBuoc: true, rongToiDa: 320, title: (c) => c.address,
    o: (c) => (c.address ? <span className="text-muted-foreground">{c.address}</span> : <Badge variant="soft" color="warning">thiếu</Badge>),
  },
]

const COT_DS: CotDanhSach<Khach>[] = [
  {
    id: 'ten', ten: 'Khách', rong: 'minmax(0,2fr)', dienThoai: 'tren',
    o: (c) => <Link href={href(c)} prefetch={false} className="min-w-0 truncate font-medium hover:underline">{c.full_name}</Link>,
  },
  { id: 'sdt', ten: 'SĐT', rong: 'minmax(0,1fr)', dienThoai: 'duoi', o: (c) => <Sdt c={c} /> },
  {
    id: 'dia_chi', ten: 'Địa chỉ', rong: 'minmax(0,1fr)', dienThoai: 'duoiPhai',
    o: (c) => (c.address ? 'có địa chỉ' : <Badge variant="soft" color="warning">thiếu địa chỉ</Badge>),
  },
]

/** Khách cần dọn dữ liệu (thiếu/lỗi SĐT hoặc thiếu địa chỉ) — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). */
export function BangKhachDon({
  rows, tong, trang, soTrang, sapXep, choChon, tabRieng, quyenTabChung, thanhDaChon,
}: {
  rows: Khach[]
  tong: number
  trang: number
  soTrang: number
  sapXep: SapXep
  choChon: boolean
  tabRieng: TabView[]
  quyenTabChung: boolean
  thanhDaChon?: ReactNode
}) {
  // Chỉ tính trên trang hiện tại — `tong` mới là tổng số khách cần dọn thật.
  const thieuSdt = rows.filter((c) => c.needs_phone).length
  const thieuDiaChi = rows.filter((c) => !c.address).length
  return (
    <BangDanhSachF
      tieuDe="Khách cần dọn dữ liệu"
      nhan="khách"
      timKiem={{ placeholder: 'Tên khách, SĐT…', nhan: 'Tìm khách cần dọn' }}
      rows={rows}
      khoa={(c) => c.id}
      moTa={(c) => `khách ${c.full_name}`}
      cot={COT}
      cotDs={COT_DS}
      hrefDong={href}
      maDong={(c) => c.ma_kh}
      tenMa="mã KH"
      tong={tong}
      trang={trang}
      soTrang={soTrang}
      sapXep={sapXep}
      choChon={choChon}
      tab={{
        bang: 'khach_don_tab', coDinh: TAB_KHACH_DON, rieng: tabRieng, quyenChung: quyenTabChung,
        khu: 'CSKH', viDuTen: 'VD: Khách nhiều máy',
      }}
      ghiChuLoc={rows.length > 0 && `Trên trang này: ${thieuSdt} thiếu/lỗi SĐT · ${thieuDiaChi} thiếu địa chỉ. Di trú từ Odoo không lấp được — bấm tên khách để sửa.`}
      thanhDaChon={thanhDaChon}
      rong={{ tieuDe: 'Không còn gì để dọn', moTa: 'Mọi khách đã có SĐT đúng và địa chỉ.' }}
    />
  )
}
