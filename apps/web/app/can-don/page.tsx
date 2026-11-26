import Link from 'next/link'
import { ticketThieuData, boComboThieuCon, listToFix } from '@/app/actions'
import { vnDateTime } from '@/components/TicketBadge'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'

export default async function CanDonPage() {
  const [tickets, boThieu, khach] = await Promise.all([
    ticketThieuData(), boComboThieuCon(), listToFix('', { moiTrang: 1 }),
  ])

  return (
    <ManV2>
      <TrangDuLieu className="max-w-4xl">
        <div className="min-w-0 space-y-4">
          <PageHeader tieuDe="Data cần dọn" meta={[<>Các mục thiếu dữ liệu cần bổ sung để hồ sơ đủ.</>]} />

          {/* 1. Ticket thiếu máy/khách */}
          <section className="bg-card rounded-(--radius-xl) border overflow-hidden">
            <div className="px-4 py-2.5 bg-muted border-b flex items-center justify-between">
              <span className="font-medium text-foreground">Ticket thiếu máy / khách ({tickets.length})</span>
              <Link href="/tao-ticket" className="text-xs text-muted-foreground underline">+ Tạo ticket</Link>
            </div>
            {tickets.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">Không có ticket nào thiếu dữ liệu.</p>
            ) : (
              <ul className="divide-y text-sm max-h-96 overflow-auto">
                {tickets.map((t) => (
                  <li key={t.ticket_code} className="px-4 py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/ticket/${t.ticket_code}`} prefetch={false} className="tabular-nums text-xs text-foreground underline">{t.ticket_code}</Link>
                      <span className="text-muted-foreground text-xs"> · {vnDateTime(t.created_at)}</span>
                      <div className="text-xs text-muted-foreground truncate">
                        {t.customer_name ?? '— chưa có khách —'}{t.source_serial ? ` · serial ${t.source_serial}` : ''}
                      </div>
                    </div>
                    <span className="rounded-full bg-(--color-background-warning-surface) text-(--color-text-warning) px-2 py-0.5 text-[11px] flex-none whitespace-nowrap">thiếu {t.thieu}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 2. Bộ combo thiếu con */}
          <section className="bg-card rounded-(--radius-xl) border overflow-hidden">
            <div className="px-4 py-2.5 bg-muted border-b font-medium text-foreground">
              Bộ WH15A/WH30A(ECO) chưa đủ 3 thiết bị ({boThieu.length})
            </div>
            {boThieu.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">Không có bộ nào thiếu con.</p>
            ) : (
              <ul className="divide-y text-sm max-h-96 overflow-auto">
                {boThieu.map((b) => (
                  <li key={b.ma_bo} className="px-4 py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/may/${encodeURIComponent(b.ma_bo)}`} prefetch={false} className="tabular-nums text-xs text-foreground underline">{b.ma_bo}</Link>
                      <span className="text-muted-foreground text-xs"> · {b.combo}</span>
                      <div className="text-xs text-muted-foreground truncate">{b.customer_name ?? '—'}</div>
                    </div>
                    <span className="rounded-full bg-(--color-background-danger-surface) text-(--color-text-danger) px-2 py-0.5 text-[11px] flex-none whitespace-nowrap">{b.so_con}/3 con</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 3. Khách cần dọn (link sang trang chi tiết) */}
          <section className="bg-card rounded-(--radius-xl) border px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <span className="font-medium text-foreground">Khách cần dọn (thiếu SĐT / địa chỉ)</span>
              <div className="text-xs text-muted-foreground">{khach.tong} khách cần bổ sung thông tin liên hệ.</div>
            </div>
            <Link href="/khach" className="rounded-lg border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted whitespace-nowrap">Mở danh sách →</Link>
          </section>
        </div>
      </TrangDuLieu>
    </ManV2>
  )
}
