'use client'

// Hàng tab của danh sách ticket F = hàng tab dùng chung (components/HangTab.tsx) với 4 tab cố định VIEW_F
// (CEO 26/11 "mặc định sẽ là 4 cái kia cố định. view thứ 5 thì tùy customize").
import type { TicketTab } from '@/app/actions'
import { useHangTab } from '@/components/HangTab'
import { VIEW_F } from './truong-f'

const CO_DINH = VIEW_F

export function useTabTicket(p: {
  tabRieng?: TicketTab[]
  quyenTabChung?: boolean
  dieuKien: { nhan: string; giaTri: string }[]
}) {
  return useHangTab({ ...p, bang: 'ticket_tab', coDinh: CO_DINH, nhan: 'ticket', khu: 'CSKH', viDuTen: 'VD: Chờ linh kiện Hà Nội' })
}
