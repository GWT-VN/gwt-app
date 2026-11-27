'use client'

// PROTOTYPE vứt đi — PA D "Kanban theo trạng thái": KanbanBoard DS, kéo thẻ đổi cột (chỉ đổi trên màn, không lưu).
import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Ticket } from '@/app/actions'
import { OTimKiem } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { Badge } from '@/components/ui/badge'
import { DataViewToolbar, TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { KanbanBoard, NoiDungThe, type CotKanban, type TheKanban } from '@/components/ui/kanban-board'
import { thongBao } from '@/components/ui/sonner'
import { DauPrototype, mayLoi, NhanKhan, ngayNgan, NutTaoTicket, TabTicket, tenKhach, type DuLieuTicket } from './chung'

const COT: CotKanban[] = [
  { id: 'moi', nhan: 'Mới', color: 'discovery' },
  { id: 'dang', nhan: 'Đang xử lý', color: 'info' },
  { id: 'cho', nhan: 'Chờ khách / linh kiện', color: 'warning' },
  { id: 'xong', nhan: 'Đã xong', color: 'success' },
]

/**
 * Giả định chia cột (DB chưa có trạng thái con): Đã xong = state Done · Mới = chưa CS nào nhận · Đang xử lý = đã có kỹ
 * thuật · Chờ khách / linh kiện = CS đã nhận, chưa có kỹ thuật. Ticket Đã huỷ không lên bảng.
 */
const cotCua = (t: Ticket) => (t.state === 'Done' ? 'xong' : !t.cs_phu_trach ? 'moi' : t.ky_thuat ? 'dang' : 'cho')

export function TicketD({ rows, tong, demo }: DuLieuTicket) {
  const router = useRouter()
  // Cột đã kéo trên màn (mã → cột) — prototype không ghi DB.
  const [doi, setDoi] = useState<Record<string, string>>({})

  const the: TheKanban[] = rows
    .filter((t) => t.state !== 'Cancel')
    .map((t) => ({
      id: t.ticket_code,
      cot: doi[t.ticket_code] ?? cotCua(t),
      ten: t.ticket_code,
      noiDung: (
        <NoiDungThe
          nhan={
            t.khan ? (
              <NhanKhan />
            ) : (
              t.ticket_type && (
                <Badge variant="soft" color="secondary">
                  {t.ticket_type}
                </Badge>
              )
            )
          }
          khach={tenKhach(t)}
          viec={mayLoi(t)}
          ma={t.ticket_code}
          han={{ chu: ngayNgan(t.created_at) }}
          chu={t.cs_ten ?? undefined}
        />
      ),
    }))

  return (
    <TrangDuLieu>
      <DauPrototype
        ma="D"
        demo={demo}
        cach="Kéo thẻ sang cột khác (hoặc chuột phải → Chuyển sang…) — chỉ đổi trên màn; bấm thẻ mở trang chi tiết PA A. Giả định chia cột: Mới = chưa CS nhận · Đang xử lý = đã có kỹ thuật · Chờ = CS nhận, chưa có kỹ thuật."
      />
      <CauHinhBangDs giaoDien={O_TIM_PILL}>
        <DataViewToolbar
          tieuDe="Ticket CSKH"
          timKiem={
            <Suspense>
              <OTimKiem placeholder="Mã ticket, serial, khách, SĐT…" aria-label="Tìm ticket" />
            </Suspense>
          }
          nutChinh={<NutTaoTicket />}
          tabs={<TabTicket tong={tong} />}
          dangXem="kanban"
          onDoiXem={() => thongBao.xong('Prototype D chỉ có dạng Kanban')}
          xemNhanh={false}
          onXemNhanh={() => thongBao.xong('Prototype D: bấm thẻ mở trang chi tiết')}
        />
        {!the.length ? (
          <EmptyState size="sm" kieu="loc" tieuDe="Không có ticket nào" moTa="Thử tab khác hoặc bỏ bớt từ khoá." />
        ) : (
          <KanbanBoard
            cot={COT}
            the={the}
            onChuyen={(id, cot) => setDoi((d) => ({ ...d, [id]: cot }))}
            onMo={(ma) => router.push(`/ticket/${encodeURIComponent(ma)}?variant=A`)}
          />
        )}
      </CauHinhBangDs>
    </TrangDuLieu>
  )
}
