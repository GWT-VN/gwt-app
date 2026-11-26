import Link from 'next/link'
import type { Ticket } from '@/app/actions'
import { Badge } from '@/components/ui/badge'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { StateBadge, vnDateTime } from '@/components/TicketBadge'

/** Danh sách ticket rút gọn cho hồ sơ máy, khách và ticket liên quan. */
export function TicketList({ tickets, empty }: { tickets: Ticket[]; empty: string }) {
  if (tickets.length === 0) return <p className="text-muted-foreground">{empty}</p>
  return (
    <ItemGroup className="gap-2">
      {tickets.map((t) => (
        <Item key={t.ticket_code} asChild size="sm" variant="outline">
          <Link href={`/ticket/${encodeURIComponent(t.ticket_code)}`} prefetch={false}>
            <ItemContent className="min-w-0">
              <ItemTitle>{t.ticket_code}{t.ticket_type && ` · ${t.ticket_type}`}</ItemTitle>
              <ItemDescription className="tabular-nums">{vnDateTime(t.created_at)}{t.description && ` · ${t.description}`}</ItemDescription>
            </ItemContent>
            <ItemActions>
              {t.khan && <Badge variant="soft" color="danger">Khẩn</Badge>}
              <StateBadge state={t.state} />
            </ItemActions>
          </Link>
        </Item>
      ))}
    </ItemGroup>
  )
}
