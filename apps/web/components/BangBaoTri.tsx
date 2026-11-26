'use client'

import type { MaintenanceDue, BangView } from '@/app/actions'
import { Badge } from '@/components/ui/badge'
import { vnDate } from '@/components/Badge'
import { BaoTriDoneButton } from '@/components/BaoTriDoneButton'
import { ChiSoNuoc } from '@/components/ChiSoNuoc'
import { coDoNuoc } from '@/lib/nuoc'
import { BangTuyChinh, type CotDef } from '@/components/BangTuyChinh'

const SAP = 'sắp đến hạn (≤30 ngày)'
function TinhTrangBadge({ tt }: { tt: string }) {
  if (tt === 'QUÁ HẠN') return <Badge variant="soft" color="danger">Quá hạn</Badge>
  if (tt === SAP) return <Badge variant="soft" color="warning">Sắp đến hạn</Badge>
  if (tt === 'đã xong') return <Badge variant="soft" color="success">Đã xong</Badge>
  if (tt.startsWith('không rõ')) return <Badge variant="soft" color="secondary">Không rõ</Badge>
  return <Badge variant="soft" color="info">Còn hạn</Badge>
}

const COT: CotDef<MaintenanceDue>[] = [
  { key: 'khach', nhan: 'Khách / công trình', batBuoc: true, sapXep: 'customer_name', render: (r) => (
    <div>
      <div className="text-foreground">{r.customer_name ?? r.section ?? '—'}</div>
      {r.primary_phone && <div className="font-mono text-xs text-muted-foreground">{r.primary_phone}</div>}
      {r.customer_name && r.section && <div className="text-[10px] text-muted-foreground line-clamp-1">{r.section}</div>}
      {r.chua_khop_khach && <span className="text-[10px] text-(--color-text-warning)">chưa khớp khách</span>}
    </div>
  ) },
  { key: 'bo_may', nhan: 'Bộ máy · gói', render: (r) => (
    <div className="text-foreground">{r.bo_may ?? '—'}{r.loai_goi && <div className="text-[10px] text-muted-foreground">{r.loai_goi}</div>}</div>
  ) },
  { key: 'lan', nhan: 'Lần', render: (r) => <span className="whitespace-nowrap text-muted-foreground">{r.lan_thu ?? '—'}{r.tong_lan ? `/${r.tong_lan}` : ''}</span> },
  { key: 'due_date', nhan: 'Đến hạn', sapXep: 'due_date', render: (r) => (
    <div className="whitespace-nowrap"><TinhTrangBadge tt={r.tinh_trang} /><div className="text-[10px] text-muted-foreground mt-0.5">{vnDate(r.due_date)}</div></div>
  ) },
  { key: 'nuoc', nhan: 'Chỉ số nước', render: (r) => (
    coDoNuoc(r.do_nuoc) ? <ChiSoNuoc d={r.do_nuoc!} /> : <span className="text-[11px] text-muted-foreground">chưa đo</span>
  ) },
  { key: 'ghi', nhan: 'Ghi', render: (r) => <BaoTriDoneButton visitId={r.visit_id} completedAt={r.completed_at} doNuoc={r.do_nuoc} /> },
]
const MAC_DINH = ['khach', 'bo_may', 'lan', 'due_date', 'nuoc', 'ghi']

export function BangBaoTri({ rows, choViewChung, views, congCu }: { rows: MaintenanceDue[]; choViewChung: boolean; views: BangView[]; congCu?: React.ReactNode }) {
  return (
    <BangTuyChinh
      rows={rows} keyOf={(r) => r.visit_id}
      moTaOf={(r) => `lượt bảo trì của ${r.customer_name ?? r.section ?? 'khách chưa khớp'}`} nhan="lượt bảo trì"
      bang="maintenance" cot={COT} macDinh={MAC_DINH} sapMacDinh="due_date" views={views} choViewChung={choViewChung} congCu={congCu}
    />
  )
}
