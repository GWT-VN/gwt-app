'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import type { IssueReport, TabView } from '@/app/actions'
import { TAB_NHOM_LOI } from '@/app/nhom-loi/truong-nhom-loi'
import { BangDanhSachF, type CotF } from '@/components/BangDanhSachF'
import { BaoHangBadge, MucDoBadge } from '@/components/NhomLoiBadge'
import type { CotDanhSach } from '@/components/ui/list-view'

const href = (r: IssueReport) => `/nhom-loi/${r.code}`

const COT: CotF<IssueReport>[] = [
  {
    id: 'ten', ten: 'Nhóm lỗi', kieu: 'thuong', khoa: true, toiThieu: 160, rongToiDa: 300, title: (r) => r.ten,
    o: (r) => (
      <span className="inline-flex items-center gap-2">
        <Link href={href(r)} prefetch={false} className="font-medium hover:underline">{r.ten}</Link>
        {r.bao_hang && <BaoHangBadge />}
      </span>
    ),
  },
  { id: 'mo_ta', ten: 'Mô tả', kieu: 'thuong', rongToiDa: 360, o: (r) => r.mo_ta ?? '—', title: (r) => r.mo_ta },
  { id: 'muc_do', ten: 'Mức', kieu: 'thuong', o: (r) => <MucDoBadge muc_do={r.muc_do} /> },
  { id: 'so_ticket', ten: 'Ticket', kieu: 'thuong', phai: true, o: (r) => r.so_ticket },
  {
    id: 'dang_mo', ten: 'Đang mở', kieu: 'thuong', phai: true,
    o: (r) => (r.dang_mo > 0 ? <span className="font-medium text-(--color-text-warning)">{r.dang_mo}</span> : <span className="text-muted-foreground">0</span>),
  },
  { id: 'trong_90_ngay', ten: '90 ngày', kieu: 'thuong', phai: true, o: (r) => r.trong_90_ngay },
  { id: 'so_khach', ten: 'Khách', kieu: 'thuong', phai: true, o: (r) => r.so_khach },
  { id: 'so_may', ten: 'Máy', kieu: 'thuong', phai: true, o: (r) => r.so_may },
  {
    id: 'cac_model', ten: 'Model dính', kieu: 'thuong', rongToiDa: 280, title: (r) => r.cac_model,
    o: (r) => <span className="tabular-nums text-muted-foreground">{r.cac_model ?? 'chưa gắn máy'}</span>,
  },
]

const COT_DS: CotDanhSach<IssueReport>[] = [
  {
    id: 'ten', ten: 'Nhóm lỗi', rong: 'minmax(0,2fr)', dienThoai: 'tren',
    o: (r) => <Link href={href(r)} prefetch={false} className="min-w-0 truncate font-medium hover:underline">{r.ten}</Link>,
  },
  { id: 'muc_do', ten: 'Mức', rong: 'minmax(0,1fr)', dienThoai: 'trenPhai', o: (r) => <MucDoBadge muc_do={r.muc_do} /> },
  { id: 'so_ticket', ten: 'Ticket', rong: 'minmax(0,1fr)', dienThoai: 'duoi', o: (r) => `${r.so_ticket} ticket · ${r.dang_mo} đang mở` },
]

/** Danh sách nhóm lỗi — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). Thứ tự do server (an toàn trước). */
export function BangNhomLoi({
  rows, tabRieng, quyenTabChung, nutChinh,
}: {
  rows: IssueReport[]
  tabRieng: TabView[]
  quyenTabChung: boolean
  nutChinh?: ReactNode
}) {
  return (
    <BangDanhSachF
      tieuDe="Nhóm lỗi"
      nhan="nhóm lỗi"
      timKiem={{ placeholder: 'Tên nhóm, mô tả lỗi, mã ticket…', nhan: 'Tìm nhóm lỗi' }}
      rows={rows}
      khoa={(r) => r.code}
      moTa={(r) => `nhóm ${r.ten}`}
      cot={COT}
      cotDs={COT_DS}
      hrefDong={href}
      tong={rows.length}
      tab={{
        bang: 'nhom_loi_tab', coDinh: TAB_NHOM_LOI, rieng: tabRieng, quyenChung: quyenTabChung,
        khu: 'CSKH', viDuTen: 'VD: Nhóm rò nước',
      }}
      nutChinh={nutChinh}
      // Nhóm rủi ro an toàn: tô nền đỏ cả dòng (như bảng cũ) — đập vào mắt kể cả khi ticket đã đóng.
      lopDong={(r) => (r.muc_do === 'an_toan' ? '[&>td]:bg-(--color-background-danger-surface)' : undefined)}
      rong={{ tieuDe: 'Chưa có nhóm lỗi', moTa: 'Tạo nhóm lỗi để hệ tự gom ticket theo triệu chứng.' }}
    />
  )
}
