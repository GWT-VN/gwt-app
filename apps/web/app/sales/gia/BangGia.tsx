'use client'

import type { ReactNode } from 'react'
import type { TabView } from '@/app/actions'
import type { SapXep } from '@/bang'
import { Badge } from '@/components/ui/badge'
import type { CotDanhSach } from '@/components/ui/list-view'
import type { CotBang } from '@/components/ui/use-cot-bang'
import { BangF } from '../_bang-f'
import { fmtVnd } from '../_ui'
import { TAB_GIA } from '../truong-sales'
import type { DongGia } from './actions'

const COT: CotBang[] = [
  { id: 'ma', ten: 'Mã nội bộ', kieu: 'sap', khoa: true, toiThieu: 100, nghia: { tang: 'Mã từ A đến Z', giam: 'Mã từ Z đến A' } },
  { id: 'ten', ten: 'Tên sản phẩm', kieu: 'sap', toiThieu: 160, rongToiDa: 400, nghia: { tang: 'Tên từ A đến Z', giam: 'Tên từ Z đến A' } },
  { id: 'thue', ten: 'Thuế', kieu: 'thuong' },
  { id: 'gia', ten: 'Giá niêm yết (gồm VAT)', kieu: 'sap', phai: true, nghia: { tang: 'Rẻ trước', giam: 'Đắt trước' } },
]

/** Hàng hoá không chịu / không kê khai thuế (KCT/KAD) → nhãn cảnh báo; còn lại hiện %. */
function Thue({ x }: { x: DongGia }) {
  if (x.vat_loai === 'KCT' || x.vat_loai === 'KAD') return <Badge variant="soft" color="warning">{x.vat_loai}</Badge>
  return <span className="text-muted-foreground">{x.vat_pct == null ? '—' : `${Math.round(x.vat_pct * 100)}%`}</span>
}

const COT_DS: CotDanhSach<DongGia>[] = [
  { id: 'ten', ten: 'Sản phẩm', rong: 'minmax(0,2fr)', dienThoai: 'tren', o: (x) => <span className="min-w-0 truncate font-medium">{x.ten}</span> },
  { id: 'gia', ten: 'Giá', rong: 'minmax(0,1fr)', phai: true, dienThoai: 'trenPhai', o: (x) => fmtVnd(x.gia_vat) },
  { id: 'ma', ten: 'Mã', rong: 'minmax(0,1fr)', dienThoai: 'duoi', o: (x) => x.ma },
  { id: 'thue', ten: 'Thuế', rong: 'minmax(0,1fr)', dienThoai: 'duoiPhai', o: (x) => <Thue x={x} /> },
]

/** Bảng giá niêm yết Sales — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). Chỉ đọc, không trang chi tiết. */
export function BangGia(p: {
  rows: DongGia[]
  tong: number
  trang: number
  soTrang: number
  sapXep: SapXep
  tabRieng: TabView[]
  quyenTabChung: boolean
  demTab: Record<string, number>
  lienKet: ReactNode
}) {
  return (
    <BangF<DongGia>
      {...p}
      tieuDe="Bảng giá niêm yết"
      nhan="sản phẩm"
      timKiem={{ placeholder: 'Mã hoặc tên sản phẩm…', nhan: 'Tìm sản phẩm' }}
      nutChinh={p.lienKet}
      bang="sales_gia_tab"
      coDinh={TAB_GIA}
      viDuTen="VD: Máy lọc POE"
      cot={COT}
      o={(x, id) =>
        id === 'ma' ? <span className="font-mono text-muted-foreground">{x.ma}</span>
        : id === 'ten' ? x.ten
        : id === 'thue' ? <Thue x={x} />
        : <span className="font-semibold tabular-nums">{fmtVnd(x.gia_vat)}</span>
      }
      tieuDeO={(x, id) => (id === 'ten' ? x.ten : undefined)}
      cotDs={COT_DS}
      khoa={(x) => x.ma}
      chanTrang={
        <p className="text-xs text-muted-foreground">Gương từ Masterdata — khu Sales chỉ đọc. Sản phẩm chưa có giá thì không kéo về.</p>
      }
      rong={{ loc: 'Không có mã nào khớp', that: { tieuDe: 'Chưa có giá niêm yết', moTa: 'Giá niêm yết đồng bộ từ Masterdata sẽ hiện ở đây.' } }}
    />
  )
}
