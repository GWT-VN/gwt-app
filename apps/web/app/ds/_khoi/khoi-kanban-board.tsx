'use client'

import { useState } from 'react'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ContextMenuItem } from '@/components/ui/context-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { KanbanBoard, NoiDungThe, type CotKanban, type TheKanban } from '@/components/ui/kanban-board'
import { thongBao } from '@/components/ui/toast'
import { BienThe, KhoiHang } from '../_khung/tam'
import { Nhan } from './khoi-filter-bar'

/* Dữ liệu demo (không PII): tên khách/nhân viên giả có chữ "demo"; việc + hạn chép preview artifact. */

const COT: CotKanban[] = [
  { id: 'moi', nhan: 'Mới', color: 'discovery' },
  { id: 'xu-ly', nhan: 'Đang xử lý', color: 'info' },
  { id: 'cho', nhan: 'Chờ', color: 'warning', hoiLyDo: true },
  { id: 'cho-kh', nhan: 'Chờ KH xác nhận' },
  { id: 'dong', nhan: 'Đóng', color: 'success' },
]

const UU = {
  P1: <Badge variant="solid" color="danger">P1</Badge>,
  P2: <Badge color="warning">P2</Badge>,
  P3: <Badge>P3</Badge>,
  P4: <Badge variant="outline">P4</Badge>,
}
const LOI = {
  ro: ['Rò rỉ nước', 'info'],
  nuoc: ['Chất lượng nước', 'success'],
  main: ['Main', 'discovery'],
} as const
const nhan = (uu: keyof typeof UU, loi: keyof typeof LOI) => (
  <>
    {UU[uu]}
    <Badge variant="outline" title={`Loại lỗi: ${LOI[loi][0]}`}>
      <BadgeDot color={LOI[loi][1]} />
      {LOI[loi][0]}
    </Badge>
  </>
)

type Ve = Omit<TheKanban, 'noiDung' | 'ten'> & Omit<Parameters<typeof NoiDungThe>[0], 'ma' | 'nhan'> & { uu: keyof typeof UU; loi: keyof typeof LOI }
const VE: Ve[] = [
  { id: 'TK-2611-045', cot: 'moi', uu: 'P1', loi: 'ro', khach: 'Khách sạn Demo Sen Vàng', luuY: true, hoiLai: 1, viec: 'Báo KT trưởng, xếp lịch trong ngày', han: { chu: '10:00', kieu: 'homNay' }, chu: 'Hà demo' },
  { id: 'TK-2611-041', cot: 'moi', uu: 'P2', loi: 'nuoc', khach: 'Nhà hàng Demo Bếp Quê', viec: 'Hẹn lấy mẫu nước kiểm TDS', han: { chu: 'Mai 09:30' }, chu: 'Hà demo' },
  { id: 'TK-2611-042', cot: 'xu-ly', uu: 'P1', loi: 'ro', khach: 'Khách lẻ demo 01', luuY: true, hoiLai: 2, viec: 'Cử KT kiểm tra rò nước đáy máy', han: { chu: '11:00', kieu: 'homNay' }, chu: 'Hà demo' },
  { id: 'TK-2611-043', cot: 'xu-ly', uu: 'P2', loi: 'main', khach: 'Khách lẻ demo 02', hoiLai: 1, viec: 'Gọi hướng dẫn xử lý màn hình báo E4', han: { chu: 'Quá 1 ngày', kieu: 'tre' }, chu: 'Kỹ thuật demo' },
  { id: 'TK-2611-039', cot: 'cho', lyDo: 'duyệt', uu: 'P2', loi: 'main', khach: 'Công ty Demo An Phát', luuY: true, viec: 'Chờ CEO duyệt miễn phí thay bơm', han: { chu: 'Quá 2 ngày', kieu: 'tre' }, chu: 'Hà demo' },
  { id: 'TK-2611-036', cot: 'cho', lyDo: 'vật tư', uu: 'P2', loi: 'ro', khach: 'Khách lẻ demo 03', viec: 'KT xếp lịch thay van', han: { chu: '16:00', kieu: 'homNay' }, chu: 'Hà demo' },
  { id: 'TK-2611-030', cot: 'cho-kh', uu: 'P3', loi: 'main', khach: 'Khách lẻ demo 04', viec: 'Gọi khách xác nhận máy chạy ổn', han: { chu: 'Mai 15:00' }, chu: 'Thu Trang demo' },
  { id: 'TK-2611-029', cot: 'cho-kh', uu: 'P4', loi: 'nuoc', khach: 'Khách lẻ demo 05', viec: 'Gửi báo cáo sau dịch vụ qua Zalo', han: { chu: '14:00', kieu: 'homNay' }, chu: 'Kỹ thuật demo' },
]
const theTu = (v: Ve): TheKanban => ({
  id: v.id,
  cot: v.cot,
  lyDo: v.lyDo,
  ten: v.id,
  noiDung: <NoiDungThe nhan={nhan(v.uu, v.loi)} khach={v.khach} luuY={v.luuY} hoiLai={v.hoiLai} viec={v.viec} ma={v.id} han={v.han} chu={v.chu} />,
})

/** Bảng demo có state: kéo / menu / Hoàn tác đổi cột thật trong trang (không ghi đâu). */
function BangDemo({ onMo }: { onMo?: (id: string) => void }) {
  const [ve, setVe] = useState(VE)
  return (
    <KanbanBoard
      cot={COT}
      the={ve.map(theTu)}
      onMo={(id) => onMo?.(id)}
      menuThe={(t) => (
        <>
          <ContextMenuItem onSelect={() => onMo?.(t.id)}>Mở ticket</ContextMenuItem>
          <ContextMenuItem onSelect={() => thongBao.xong(`Đã sao chép ${t.ten} (demo)`)}>Sao chép mã</ContextMenuItem>
        </>
      )}
      onChuyen={(id, cot, lyDo) => setVe((ds) => ds.map((v) => (v.id === id ? { ...v, cot, lyDo } : v)))}
    />
  )
}

/**
 * #kanban-board — khối trần (/ds/tron, cổng so khớp): tái tạo ds/nguon/components/KanbanBoard/preview.html — Kanban cỡ
 * thật trong khung cao 600 (preview gõ `padding: 0` đè đệm đáy của `.b-trang-k`), 5 cột, cột Đóng rỗng.
 */
export function KhoiKanbanBoard() {
  return (
    <section id="kanban-board" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#kanban-board">KanbanBoard</a>
      </h2>
      <div className="border-none border-current">
        <div data-so="muc" className="min-w-0 border-none border-current">
          <Nhan>Kanban — cỡ thật (cuộn ngang qua các cột)</Nhan>
          <div data-so="trang" className="flex h-[600px] flex-col border-none border-current">
            <BangDemo />
          </div>
        </div>
      </div>
    </section>
  )
}

/** #kanban-board dạng hàng (/ds). */
export function KhoiKanbanBoardHang() {
  const [mo, setMo] = useState<string | null>(null)
  return (
    <KhoiHang neo="kanban-board">
      <BienThe
        ten="Bấm thử"
        moTa="Kéo thẻ sang cột khác để đổi trạng thái (bàn phím: Space nhấc, ← →, Space thả, Esc huỷ). Thả vào Chờ phải chọn lý do. Chuột phải (Shift+F10) có “Chuyển sang…”. Chuyển xong có Hoàn tác. Điện thoại: mỗi cột 82% bề ngang, vuốt ngang qua các cột, nhấn giữ thẻ để chuyển."
      >
        <div className="flex h-[560px] flex-col border-none border-current">
          <BangDemo onMo={setMo} />
        </div>
        <p aria-live="polite" className="mt-2 border-none border-current text-[12px] leading-[18px] text-muted-foreground">
          {mo ? `Bấm thẻ mở bản ghi — vừa mở ${mo} (demo).` : 'Bấm thẻ (hoặc Enter) để mở bản ghi.'}
        </p>
      </BienThe>
      <BienThe ten="Rỗng do lọc" moTa="Cả màn không còn thẻ nào khớp lọc: thay bảng bằng ô trống nói điều kiện đang lọc + Xoá lọc (như Table).">
        <EmptyState kieu="loc" tieuDe="Không có ticket nào khớp bộ lọc" moTa="Thử bỏ bớt điều kiện “Loại lỗi: Main”.">
          <Button variant="outline" size="sm">
            Xoá lọc
          </Button>
        </EmptyState>
      </BienThe>
    </KhoiHang>
  )
}
