'use client'

import Link from 'next/link'
import type { DongNuoc, TabView } from '@/app/actions'
import { TAB_NUOC, TRUONG_NUOC } from '@/app/nuoc/truong-nuoc'
import { BangDanhSachF, type CotF } from '@/components/BangDanhSachF'
import { ChiSoNuoc } from '@/components/ChiSoNuoc'
import type { CotDanhSach } from '@/components/ui/list-view'
import { hienNgay } from '@/lib/dinh-dang-ngay'
import { coDoNuoc } from '@/lib/nuoc'

const Khach = ({ r }: { r: DongNuoc }) =>
  r.customer_id ? (
    <Link href={`/khach/${r.customer_id}`} prefetch={false} className="min-w-0 truncate font-medium hover:underline">{r.ten_khach ?? 'khách chưa khớp'}</Link>
  ) : (
    <span className="text-muted-foreground">chưa khớp khách</span>
  )

const COT: CotF<DongNuoc>[] = [
  {
    id: 'ngay', ten: 'Ngày đo', kieu: 'thuong', khoa: true, ngay: true,
    o: (r, kieu) => <span className="tabular-nums">{hienNgay(r.ngay, kieu)}</span>,
  },
  { id: 'khach', ten: 'Khách', kieu: 'thuong', rongToiDa: 260, title: (r) => r.ten_khach, o: (r) => <Khach r={r} /> },
  { id: 'tinh', ten: 'Tỉnh/TP', kieu: 'thuong', o: (r) => r.tinh ?? '—' },
  { id: 'dia_chi', ten: 'Địa chỉ', kieu: 'thuong', rongToiDa: 320, title: (r) => r.dia_chi, o: (r) => <span className="text-muted-foreground">{r.dia_chi ?? '—'}</span> },
  { id: 'bo_may', ten: 'Bộ máy', kieu: 'thuong', rongToiDa: 240, title: (r) => r.bo_may, o: (r) => r.bo_may ?? '—' },
  { id: 'lan_thu', ten: 'Lần', kieu: 'thuong', phai: true, o: (r) => r.lan_thu ?? '—' },
  {
    id: 'chi_so', ten: 'Chỉ số (trước → sau lọc)', kieu: 'thuong', batBuoc: true,
    o: (r) => (coDoNuoc(r.do_nuoc) ? <ChiSoNuoc d={r.do_nuoc} gonMotDong /> : <span className="text-muted-foreground">—</span>),
  },
]

const COT_DS: CotDanhSach<DongNuoc>[] = [
  { id: 'ten', ten: 'Khách', rong: 'minmax(0,2fr)', dienThoai: 'tren', o: (r) => <Khach r={r} /> },
  { id: 'ngay', ten: 'Ngày đo', rong: 'minmax(0,1fr)', dienThoai: 'trenPhai', o: (r) => hienNgay(r.ngay) },
  { id: 'chi_so', ten: 'Chỉ số', rong: 'minmax(0,2fr)', dienThoai: 'duoi', o: (r) => (coDoNuoc(r.do_nuoc) ? <ChiSoNuoc d={r.do_nuoc} gonMotDong /> : '—') },
]

/**
 * Hồ sơ chất lượng nước — TOÀN BỘ khách (CEO 31/08: "xem theo tỉnh thành, địa chỉ, thời gian được"). Khuôn bảng Ticket F
 * (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). Mỗi lần kiểm tra một dòng, mới nhất trước.
 */
export function BangNuoc({
  rows, tong, trang, soTrang, dsTinh, tabRieng, quyenTabChung, locTrongTrang,
}: {
  rows: DongNuoc[]
  tong: number
  trang: number
  soTrang: number
  /** Tỉnh có trong dữ liệu đang xem — không liệt kê tỉnh chưa có lượt đo nào (bấm vào chỉ ra bảng rỗng). */
  dsTinh: string[]
  tabRieng: TabView[]
  quyenTabChung: boolean
  /** Đang lọc tên/tỉnh — hai thứ nằm ở bảng khác nên chỉ lọc TRONG TRANG; phải nói thẳng giới hạn. */
  locTrongTrang: boolean
}) {
  return (
    <BangDanhSachF
      tieuDe="Hồ sơ chất lượng nước"
      nhan="lượt đo"
      timKiem={{ placeholder: 'Tên khách, địa chỉ hoặc bộ máy…', nhan: 'Tìm lượt đo nước' }}
      rows={rows}
      khoa={(r) => r.visit_id}
      moTa={(r) => `lượt đo ${r.ten_khach ?? ''}`}
      cot={COT}
      cotDs={COT_DS}
      hrefDong={(r) => (r.customer_id ? `/khach/${r.customer_id}` : null)}
      tong={tong}
      trang={trang}
      soTrang={soTrang}
      tab={{
        bang: 'nuoc_tab', coDinh: TAB_NUOC, rieng: tabRieng, quyenChung: quyenTabChung,
        khu: 'CSKH', viDuTen: 'VD: Hà Nội tháng này',
      }}
      truong={TRUONG_NUOC}
      tuyChonLoc={{ tinh: dsTinh.map((t) => ({ giaTri: t, nhan: t })) }}
      ghiChuLoc={locTrongTrang && <span className="text-(--color-text-warning)">Lọc tên/tỉnh chỉ áp dụng trong trang đang xem</span>}
      rong={{ tieuDe: 'Chưa có lượt nào đo nước', moTa: 'Số đo nhập ở lượt bảo trì sẽ hiện ở đây.' }}
      rongLoc={{ tieuDe: 'Chưa có lượt nào đo nước khớp bộ lọc', moTa: 'Thử đổi từ khoá hoặc bỏ bớt bộ lọc.' }}
    />
  )
}
