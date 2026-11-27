'use client'

import { useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import type { SerialRow, TabView, TrangThai } from '@/app/actions'
import { tabSerial, TRUONG_SERIAL } from '@/app/serial/truong-serial'
import { BangDanhSachF, type CotF } from '@/components/BangDanhSachF'
import { DoiTrangThaiKho } from '@/components/DoiTrangThaiKho'
import type { CotDanhSach } from '@/components/ui/list-view'
import { hienNgay } from '@/lib/dinh-dang-ngay'

const href = (s: SerialRow) => `/may/${encodeURIComponent(s.serial)}`

function cotSerial(ds: TrangThai[], choDoi: boolean): CotF<SerialRow>[] {
  return [
    {
      id: 'serial', ten: 'Serial', kieu: 'thuong', khoa: true, toiThieu: 120,
      o: (s) => <Link href={href(s)} prefetch={false} className="font-medium tabular-nums hover:underline">{s.serial}</Link>,
    },
    { id: 'internal_code', ten: 'Mã nội bộ', kieu: 'thuong', o: (s) => <span className="tabular-nums">{s.internal_code ?? '—'}</span> },
    { id: 'model', ten: 'Model', kieu: 'thuong', rongToiDa: 240, o: (s) => s.model ?? '—', title: (s) => s.model },
    {
      id: 'trang_thai', ten: 'Trạng thái', kieu: 'thuong', batBuoc: true,
      o: (s) => <DoiTrangThaiKho serial={s.serial} trangThai={s.trang_thai} choDoiTrangThai={choDoi} ds={ds} />,
    },
    // Hai mốc của lần đổi trạng thái gần nhất — trước nằm dòng phụ dưới ô Trạng thái, nay thành cột (dòng một hàng).
    {
      id: 'tt_ghi_chu', ten: 'Vị trí / ghi chú', kieu: 'thuong', rongToiDa: 280,
      o: (s) => s.trang_thai_ghi_chu ?? '—', title: (s) => s.trang_thai_ghi_chu,
    },
    {
      id: 'tt_luc', ten: 'Đổi trạng thái', kieu: 'thuong', ngay: true,
      o: (s, kieu) => <span className="tabular-nums text-muted-foreground">{hienNgay(s.trang_thai_luc, kieu)}</span>,
    },
    { id: 'ten_noi_bo', ten: 'Tên nội bộ', kieu: 'thuong', rongToiDa: 280, o: (s) => s.ten_noi_bo ?? '—', title: (s) => s.ten_noi_bo },
  ]
}

/** Kho serial — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). */
export function BangSerial({
  rows, tong, trang, soTrang, choChon, choDoiTrangThai, dsTrangThai, tabRieng, quyenTabChung, nutChinh, thanhDaChon,
}: {
  rows: SerialRow[]
  tong: number
  trang: number
  soTrang: number
  choChon: boolean
  /** cs.serial.kho — đổi trạng thái tại dòng. */
  choDoiTrangThai: boolean
  dsTrangThai: TrangThai[]
  tabRieng: TabView[]
  quyenTabChung: boolean
  nutChinh: ReactNode
  thanhDaChon?: ReactNode
}) {
  const cot = useMemo(() => cotSerial(dsTrangThai, choDoiTrangThai), [dsTrangThai, choDoiTrangThai])
  const nhanTT = (code: string | null) => dsTrangThai.find((t) => t.code === (code ?? 'ton_kho'))?.nhan ?? code ?? '—'
  const cotDs: CotDanhSach<SerialRow>[] = [
    {
      id: 'ten', ten: 'Serial', rong: 'minmax(0,2fr)', dienThoai: 'tren',
      o: (s) => <Link href={href(s)} prefetch={false} className="min-w-0 truncate font-medium tabular-nums hover:underline">{s.serial}</Link>,
    },
    { id: 'model', ten: 'Model', rong: 'minmax(0,1fr)', dienThoai: 'duoi', o: (s) => s.model ?? '—' },
    { id: 'tt', ten: 'Trạng thái', rong: 'minmax(0,1fr)', dienThoai: 'duoiPhai', o: (s) => nhanTT(s.trang_thai) },
  ]
  return (
    <BangDanhSachF
      tieuDe="Kho serial"
      nhan="serial"
      timKiem={{ placeholder: 'Serial, mã nội bộ, model, mã quốc tế…', nhan: 'Tìm serial và mã máy' }}
      rows={rows}
      khoa={(s) => s.serial}
      moTa={(s) => `serial ${s.serial}`}
      cot={cot}
      cotDs={cotDs}
      hrefDong={href}
      tong={tong}
      trang={trang}
      soTrang={soTrang}
      choChon={choChon}
      tab={{
        bang: 'serial_tab', coDinh: tabSerial(dsTrangThai), rieng: tabRieng, quyenChung: quyenTabChung,
        khu: 'CSKH', viDuTen: 'VD: Hàng lỗi chờ trả hãng',
      }}
      truong={TRUONG_SERIAL}
      tuyChonLoc={{ tt: dsTrangThai.map((t) => ({ giaTri: t.code, nhan: t.nhan })) }}
      nutChinh={nutChinh}
      thanhDaChon={thanhDaChon}
      rong={{ tieuDe: 'Kho chưa có serial nào', moTa: 'Nhập kho để bắt đầu theo dõi serial.' }}
    />
  )
}
