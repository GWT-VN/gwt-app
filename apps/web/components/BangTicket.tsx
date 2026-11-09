'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Ticket, BangView } from '@/app/actions'
import { StateBadge, KhanBadge, MayThieuBadge, MoiBadge, vnDateTime } from '@/components/TicketBadge'
import { BangTuyChinh, type CotDef } from '@/components/BangTuyChinh'
import { dongVuaDoi, type AnhBang } from '@/lib/ticketHoatDong'

const COT: CotDef<Ticket>[] = [
  { key: 'ticket_code', nhan: 'Mã', batBuoc: true, sapXep: 'ticket_code',
    render: (t) => (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <Link href={`/ticket/${t.ticket_code}`} prefetch={false} className="font-mono text-xs text-slate-900 underline">{t.ticket_code}</Link>
        <MoiBadge moi={t.moi} luc={t.hoat_dong_cuoi} />
      </span>
    ) },
  { key: 'hoat_dong', nhan: 'Hoạt động', sapXep: 'hoat_dong', chieuDau: 'desc',
    render: (t) => <span className="whitespace-nowrap text-slate-600">{vnDateTime(t.hoat_dong_cuoi ?? t.created_at)}</span> },
  { key: 'created_at', nhan: 'Ngày', sapXep: 'created_at', chieuDau: 'desc',
    render: (t) => <span className="whitespace-nowrap text-slate-600">{vnDateTime(t.created_at)}</span> },
  { key: 'ticket_type', nhan: 'Loại', render: (t) => <span className="max-w-56 inline-block">{t.ticket_type ?? '—'}</span> },
  { key: 'customer', nhan: 'Khách', sapXep: 'customer_name', render: (t) => (
    <>
      {t.customer_id
        ? <Link href={`/khach/${t.customer_id}`} prefetch={false} className="text-slate-900 underline">{t.customer_name}</Link>
        : <span className="text-slate-500">{t.customer_name ?? '—'}</span>}
      {t.primary_phone && <div className="font-mono text-xs text-slate-500">{t.primary_phone}</div>}
    </>
  ) },
  { key: 'may', nhan: 'Máy', render: (t) => (
    t.dong_may?.length
      ? <div className="space-y-0.5">{t.dong_may.map((d, i) => (
          <div key={i} className="text-xs whitespace-nowrap">
            {d.serial
              ? <Link href={`/may/${encodeURIComponent(d.serial)}`} prefetch={false} className={d.nhan.includes('Chưa phân loại') ? 'text-slate-500 underline' : 'text-slate-900 underline'}>{d.nhan}</Link>
              : <span className={d.nhan.includes('Chưa phân loại') ? 'text-slate-400' : 'text-slate-700'}>{d.nhan}</span>}
          </div>))}</div>
      : t.serial
        ? <Link href={`/may/${encodeURIComponent(t.serial)}`} prefetch={false} className="text-slate-900 underline">{t.product_name}</Link>
        : t.source_serial ? <MayThieuBadge t={t} /> : <span className="text-slate-400">—</span>
  ) },
  { key: 'phu_trach', nhan: 'Phụ trách', render: (t) => (
    t.cs_ten || t.ky_thuat_ten
      ? <div className="text-xs text-slate-600">{t.cs_ten && <div>CS: {t.cs_ten}</div>}{t.ky_thuat_ten && <div>KT: {t.ky_thuat_ten}</div>}</div>
      : <span className="text-slate-300">—</span>
  ) },
  { key: 'state', nhan: 'Trạng thái', sapXep: 'state',
    render: (t) => <div className="flex items-center gap-1.5"><KhanBadge khan={t.khan} /><StateBadge state={t.state} /></div> },
]
const MAC_DINH = ['ticket_code', 'hoat_dong', 'created_at', 'ticket_type', 'customer', 'may', 'phu_trach', 'state']

/** Tô sáng bao lâu sau khi một dòng vừa xuất hiện / vừa đổi. */
const TO_SANG_MS = 6000

function chup(rows: Ticket[], boLoc: string): AnhBang {
  return { boLoc, ban: Object.fromEntries(rows.map((t) => [t.ticket_code, t.hoat_dong_cuoi ?? t.created_at])) }
}

export function BangTicket({ rows, choViewChung, views, congCu, boLoc = '' }: {
  rows: Ticket[]; choViewChung: boolean; views: BangView[]; congCu?: React.ReactNode
  /** Chữ ký bộ lọc + trang + sắp xếp: chỉ tô dòng vừa đổi khi CÙNG chữ ký (tức là do tự làm mới). */
  boLoc?: string
}) {
  // So với lần render trước NGAY TRONG render (mẫu "điều chỉnh state khi props đổi"
  // của React) — rows mới chỉ tới khi router.refresh() / điều hướng mang RSC mới về.
  const [truoc, setTruoc] = useState<{ rows: Ticket[]; anh: AnhBang }>(() => ({ rows, anh: chup(rows, boLoc) }))
  const [noiBat, setNoiBat] = useState<Set<string>>(() => new Set())
  if (truoc.rows !== rows) {
    const anh = chup(rows, boLoc)
    setNoiBat(dongVuaDoi(truoc.anh, anh))
    setTruoc({ rows, anh })
  }
  useEffect(() => {
    if (noiBat.size === 0) return
    const hen = setTimeout(() => setNoiBat(new Set()), TO_SANG_MS)
    return () => clearTimeout(hen)
  }, [noiBat])

  return (
    <BangTuyChinh
      rows={rows} keyOf={(t) => t.ticket_code} moTaOf={(t) => `ticket ${t.ticket_code}`} nhan="ticket"
      bang="tickets" cot={COT} macDinh={MAC_DINH} sapMacDinh="hoat_dong" views={views} choViewChung={choViewChung} congCu={congCu}
      lopDong={(t) => (noiBat.has(t.ticket_code) ? 'bg-amber-50 transition-colors duration-700' : 'transition-colors duration-700')}
    />
  )
}
