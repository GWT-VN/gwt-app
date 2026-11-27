'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import type { DongSoatKenh, Kenh, TabView } from '@/app/actions'
import { TAB_KENH } from '@/app/khach/kenh/truong-kenh'
import { BangDanhSachF, type CotF } from '@/components/BangDanhSachF'
import { SuaKenhNhanh } from '@/components/SuaKenhNhanh'
import type { CotDanhSach } from '@/components/ui/list-view'

const href = (r: DongSoatKenh) => `/khach/${r.id}`
const Ten = ({ r }: { r: DongSoatKenh }) => (
  <Link href={href(r)} prefetch={false} className="min-w-0 truncate font-medium hover:underline">{r.ten ?? '(chưa có tên)'}</Link>
)

const Sua = ({ r, kenh }: { r: DongSoatKenh; kenh: Kenh[] }) => (
  <SuaKenhNhanh customerId={r.id} channelId={r.channel_id} kenhHienTai={r.kenh} tuDong={r.tu_dong} kenh={kenh} />
)

function cotKenh(kenh: Kenh[]): CotF<DongSoatKenh>[] {
  return [
    { id: 'ten', ten: 'Khách', kieu: 'thuong', khoa: true, toiThieu: 128, rongToiDa: 260, title: (r) => r.ten, o: (r) => <Ten r={r} /> },
    { id: 'sdt', ten: 'SĐT', kieu: 'thuong', o: (r) => <span className="tabular-nums">{r.sdt ?? '—'}</span> },
    { id: 'ma_kh', ten: 'Mã KH', kieu: 'thuong', o: (r) => <span className="tabular-nums">{r.ma_kh ?? '—'}</span> },
    { id: 'tinh', ten: 'Tỉnh', kieu: 'thuong', o: (r) => r.tinh ?? '—' },
    { id: 'so_may', ten: 'Máy', kieu: 'thuong', phai: true, o: (r) => r.so_may || '—' },
    // Sửa được NGAY TẠI DÒNG: mở 113 hồ sơ để đổi một ô chọn là sai cách dùng.
    { id: 'kenh', ten: 'Kênh', kieu: 'thuong', batBuoc: true, o: (r) => <Sua r={r} kenh={kenh} /> },
  ]
}

/**
 * Soát KÊNH của khách CSKH (CEO 31/08) — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). Ba tab
 * đúng ba mức tin cậy khác nhau (máy điền cần duyệt · người điền · còn trống), sửa kênh ngay tại dòng.
 */
export function BangSoatKenh({
  rows, tong, trang, soTrang, kenh, tabRieng, quyenTabChung, moTaNhom,
}: {
  rows: DongSoatKenh[]
  tong: number
  trang: number
  soTrang: number
  kenh: Kenh[]
  tabRieng: TabView[]
  quyenTabChung: boolean
  /** Một dòng nói nhóm đang xem là gì ("Hệ tự suy từ đơn/khách — cần anh duyệt"). */
  moTaNhom: string
}) {
  const cot = useMemo(() => cotKenh(kenh), [kenh])
  const cotDs: CotDanhSach<DongSoatKenh>[] = [
    { id: 'ten', ten: 'Khách', rong: 'minmax(0,1.4fr)', dienThoai: 'tren', o: (r) => <Ten r={r} /> },
    { id: 'sdt', ten: 'SĐT', rong: 'minmax(0,1fr)', dienThoai: 'duoi', o: (r) => r.sdt ?? '—' },
    { id: 'kenh', ten: 'Kênh', rong: 'minmax(0,1.4fr)', dienThoai: 'duoiPhai', o: (r) => <Sua r={r} kenh={kenh} /> },
  ]
  return (
    <BangDanhSachF
      tieuDe="Soát kênh khách"
      nhan="khách"
      timKiem={{ placeholder: 'Tên khách, SĐT hoặc mã KH…', nhan: 'Tìm khách để soát kênh' }}
      rows={rows}
      khoa={(r) => r.id}
      moTa={(r) => `khách ${r.ten ?? ''}`}
      cot={cot}
      cotDs={cotDs}
      hrefDong={href}
      maDong={(r) => r.ma_kh}
      tenMa="mã KH"
      tong={tong}
      trang={trang}
      soTrang={soTrang}
      tab={{
        bang: 'kenh_tab', coDinh: TAB_KENH, rieng: tabRieng, quyenChung: quyenTabChung,
        khu: 'CSKH', viDuTen: 'VD: Máy điền Hà Nội',
      }}
      ghiChuLoc={moTaNhom}
      rong={{ tieuDe: 'Không có khách nào trong nhóm này' }}
    />
  )
}
