'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import type { TabView } from '@/app/actions'
import type { SapXep } from '@/bang'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { TruongLoc } from '@/components/ui/bo-loc-truong'
import type { CotDanhSach } from '@/components/ui/list-view'
import type { CotBang } from '@/components/ui/use-cot-bang'
import { hienNgay, type KieuNgay } from '@/lib/dinh-dang-ngay'
import { BangF } from '../_bang-f'
import { nhanKieuGiam, nhanNhomKhach } from '../_ctkm'
import { fmtVnd } from '../_ui'
import { NHAN_TT_CTKM, TAB_CTKM } from '../truong-sales'
import type { CtkmRow } from './actions'
import { CtkmActions } from './CtkmActions'

const COT: CotBang[] = [
  { id: 'ten', ten: 'Chương trình', kieu: 'sap', khoa: true, toiThieu: 160, rongToiDa: 320, nghia: { tang: 'Tên từ A đến Z', giam: 'Tên từ Z đến A' } },
  { id: 'ma', ten: 'Mã', kieu: 'thuong' },
  { id: 'ngay', ten: 'Thời gian', kieu: 'sap', ngay: true, nghia: { tang: 'Bắt đầu sớm trước', giam: 'Bắt đầu muộn trước' } },
  { id: 'tt', ten: 'Trạng thái', kieu: 'thuong' },
  { id: 'giam', ten: 'Giảm giá', kieu: 'thuong', rongToiDa: 260 },
  { id: 'sp', ten: 'Áp dụng', kieu: 'thuong', rongToiDa: 260 },
  { id: 'kenh', ten: 'Kênh', kieu: 'thuong', rongToiDa: 360 },
  { id: 'qua', ten: 'Quà kèm', kieu: 'thuong' },
  { id: 'tac', ten: 'Thao tác', kieu: 'thuong', batBuoc: true },
]

const MAU_TT = { ban_hanh: 'success', nhap: 'warning', ket_thuc: 'secondary' } as const
const MO_TA_TT: Record<string, string> = { nhap: 'Nháp — chưa áp cho đơn nào' }

const thoiGian = (c: CtkmRow, kieu?: KieuNgay) =>
  `${hienNgay(c.tu_ngay, kieu)} → ${c.den_ngay ? hienNgay(c.den_ngay, kieu) : 'vô thời hạn'}`

function TrangThai({ c, choDuyet }: { c: CtkmRow; choDuyet: boolean }) {
  const mau = MAU_TT[c.trang_thai as keyof typeof MAU_TT] ?? 'secondary'
  return (
    <span className="inline-flex items-center gap-2">
      <Badge variant="soft" color={mau} title={MO_TA_TT[c.trang_thai]}>{NHAN_TT_CTKM[c.trang_thai] ?? c.trang_thai}</Badge>
      {/* Người không có quyền duyệt: bản nháp chờ người duyệt ban hành (trước là chữ "Chờ duyệt" trên thanh nút). */}
      {choDuyet && c.trang_thai === 'nhap' && <span className="text-muted-foreground">chờ duyệt</span>}
    </span>
  )
}

function Kenh({ c }: { c: CtkmRow }) {
  if (c.so_kenh === 0) return <span className="text-(--color-text-danger)">chưa chọn kênh — sẽ không áp cho đơn nào</span>
  return (
    <span className="inline-flex items-center gap-1">
      {c.kenh_nhan.slice(0, 3).map((k) => <Badge key={k} variant="soft" color="info">{k}</Badge>)}
      {c.so_kenh > 3 && <span className="text-muted-foreground">+{c.so_kenh - 3}</span>}
    </span>
  )
}

/** Danh sách chương trình khuyến mãi — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). */
export function BangCtkm(p: {
  rows: CtkmRow[]
  tong: number
  trang: number
  soTrang: number
  sapXep: SapXep
  tabRieng: TabView[]
  quyenTabChung: boolean
  demTab: Record<string, number>
  truong: TruongLoc[]
  quyen: { soan: boolean; duyet: boolean }
  ghiChu?: ReactNode
  chanTrang?: ReactNode
}) {
  const { quyen } = p
  const ten = (c: CtkmRow) =>
    quyen.soan ? (
      <Link href={`/sales/ctkm/${c.id}`} prefetch={false} className="min-w-0 truncate font-medium hover:underline">{c.ten}</Link>
    ) : (
      <span className="min-w-0 truncate font-medium">{c.ten}</span>
    )
  const cotDs: CotDanhSach<CtkmRow>[] = [
    { id: 'ten', ten: 'Chương trình', rong: 'minmax(0,2fr)', dienThoai: 'tren', o: ten },
    { id: 'tt', ten: 'Trạng thái', rong: 'minmax(0,1fr)', dienThoai: 'trenPhai', o: (c) => <TrangThai c={c} choDuyet={!quyen.duyet} /> },
    { id: 'ngay', ten: 'Thời gian', rong: 'minmax(0,1fr)', dienThoai: 'duoi', o: (c) => thoiGian(c) },
    { id: 'tac', ten: '', rong: '40px', dienThoai: 'duoiPhai', o: (c) => <CtkmActions id={c.id} ten={c.ten} trangThai={c.trang_thai} quyen={quyen} /> },
  ]

  return (
    <BangF<CtkmRow>
      {...p}
      tieuDe="Chương trình khuyến mãi"
      nhan="chương trình"
      timKiem={{ placeholder: 'Tên hoặc mã chương trình…', nhan: 'Tìm chương trình' }}
      nutChinh={quyen.soan && <Button asChild><Link href="/sales/ctkm/moi">Tạo chương trình</Link></Button>}
      bang="sales_ctkm_tab"
      coDinh={TAB_CTKM}
      viDuTen="VD: Khuyến mãi tháng 12"
      cot={COT}
      o={(c, id, ngay) =>
        id === 'ten' ? ten(c)
        : id === 'ma' ? <span className="font-mono text-muted-foreground">{c.ma ?? '—'}</span>
        : id === 'ngay' ? thoiGian(c, ngay(id))
        : id === 'tt' ? <TrangThai c={c} choDuyet={!quyen.duyet} />
        : id === 'giam' ? (
          <>
            {nhanKieuGiam(c.kieu_giam, c.muc_chung)}
            {c.kieu_giam === 'PCT' && c.giam_toi_da != null && <span className="text-muted-foreground"> (tối đa {fmtVnd(c.giam_toi_da)})</span>}
          </>
        )
        : id === 'sp' ? `${nhanNhomKhach(c.nhom_khach)} · ${c.so_sp === 0 ? 'mọi sản phẩm' : `${c.so_sp} sản phẩm`}`
        : id === 'kenh' ? <Kenh c={c} />
        : id === 'qua' ? (c.so_qua === 0 ? 'không có' : `${c.so_qua} món`)
        : <CtkmActions id={c.id} ten={c.ten} trangThai={c.trang_thai} quyen={quyen} />
      }
      tieuDeO={(c, id) => (id === 'ten' ? c.ten : id === 'kenh' ? c.kenh_nhan.join(', ') || undefined : undefined)}
      cotDs={cotDs}
      khoa={(c) => c.id}
      hrefMo={quyen.soan ? (c) => `/sales/ctkm/${c.id}` : undefined}
      rong={{ loc: 'Không có chương trình nào khớp', that: { tieuDe: 'Chưa có chương trình nào', moTa: 'Chương trình khuyến mãi theo kênh sẽ hiện ở đây.' } }}
    />
  )
}
