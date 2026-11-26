'use client'

import Link from 'next/link'
import type { CoreDue, BangView } from '@/app/actions'
import { vnDate } from '@/components/Badge'
import { ThayLoiButton } from '@/components/ThayLoiButton'
import { BangTuyChinh, type CotDef } from '@/components/BangTuyChinh'

const SAP = 'sắp đến hạn (≤30 ngày)'
function HanBadge({ tt, ngay }: { tt: string; ngay: number | null }) {
  if (tt === 'QUÁ HẠN')
    return <span className="px-2 py-0.5 rounded-full text-xs bg-(--color-background-danger-surface) text-(--color-text-danger) whitespace-nowrap">Quá {Math.abs(ngay ?? 0)} ngày</span>
  if (tt === SAP)
    return <span className="px-2 py-0.5 rounded-full text-xs bg-(--color-background-warning-surface) text-(--color-text-warning) whitespace-nowrap">Còn {ngay} ngày</span>
  if (tt.startsWith('không rõ'))
    return <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">Không rõ</span>
  return <span className="px-2 py-0.5 rounded-full text-xs bg-(--color-background-success-surface) text-(--color-text-success) whitespace-nowrap">Còn {ngay} ngày</span>
}

const COT: CotDef<CoreDue>[] = [
  { key: 'khach', nhan: 'Khách', batBuoc: true, sapXep: 'customer_name', render: (r) => (
    <div>
      {r.customer_id
        ? <Link href={`/khach/${r.customer_id}`} prefetch={false} className="text-foreground underline">{r.customer_name}</Link>
        : <span className="text-muted-foreground">—</span>}
      <div className="tabular-nums text-xs text-muted-foreground">{r.primary_phone ?? <span className="text-(--color-text-warning)">thiếu SĐT</span>}</div>
    </div>
  ) },
  { key: 'may', nhan: 'Máy', sapXep: 'serial', render: (r) => (
    <div>
      <Link href={`/may/${encodeURIComponent(r.serial)}`} prefetch={false} className="text-foreground underline">{r.product_name}</Link>
      <div className="tabular-nums text-[10px] text-muted-foreground">{r.serial}</div>
    </div>
  ) },
  { key: 'loi', nhan: 'Lõi cần thay', render: (r) => (
    <div><div className="tabular-nums text-xs text-foreground">{r.filter_code}</div><div className="text-xs text-muted-foreground">{r.filter_name}</div></div>
  ) },
  { key: 'chu_ky', nhan: 'Chu kỳ', render: (r) => <span className="whitespace-nowrap text-muted-foreground">{r.chu_ky_raw}</span> },
  { key: 'moc_tinh', nhan: 'Mốc tính', render: (r) => (
    <div className="whitespace-nowrap text-muted-foreground">{vnDate(r.moc_tinh)}
      <div className="text-[10px] text-muted-foreground">{r.lan_thay_gan_nhat ? 'lần thay gần nhất' : 'ngày lắp (chưa có log thay)'}</div>
    </div>
  ) },
  { key: 'han_som', nhan: 'Đến hạn', sapXep: 'han_som', render: (r) => (
    <div className="whitespace-nowrap"><HanBadge tt={r.tinh_trang} ngay={r.con_bao_nhieu_ngay} /><div className="text-[10px] text-muted-foreground mt-0.5">{vnDate(r.han_som)}</div></div>
  ) },
  { key: 'ghi', nhan: 'Ghi log', render: (r) => <ThayLoiButton serial={r.serial} filterCode={r.filter_code} filterName={r.filter_name} compact /> },
]
const MAC_DINH = ['khach', 'may', 'loi', 'chu_ky', 'moc_tinh', 'han_som', 'ghi']

export function BangLoi({ rows, choViewChung, views, congCu }: { rows: CoreDue[]; choViewChung: boolean; views: BangView[]; congCu?: React.ReactNode }) {
  return (
    <BangTuyChinh
      rows={rows} keyOf={(r) => `${r.serial}-${r.filter_code}`}
      moTaOf={(r) => `lõi ${r.filter_code} của máy ${r.serial}`} nhan="dòng lõi"
      bang="core" cot={COT} macDinh={MAC_DINH} sapMacDinh="han_som" views={views} choViewChung={choViewChung} congCu={congCu}
    />
  )
}
