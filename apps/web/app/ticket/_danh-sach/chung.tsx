'use client'

// Phần chung của danh sách ticket (/ticket, ds-f.tsx + xem-nhanh-f.tsx). Prototype ?variant= dùng lại qua _prototype/chung.tsx.
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChatsCircle, Funnel, ShieldCheck, Tag, Toolbox, Wrench } from '@phosphor-icons/react/ssr'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Ticket, TicketTab } from '@/app/actions'
import type { MayKhach } from '@/app/ticket/loi-actions'
import { Button } from '@/components/ui/button'
import { thongBao } from '@/components/ui/sonner'

export type DuLieuTicket = {
  rows: Ticket[]
  tong: number
  trang: number
  soTrang: number
  loaiList: string[]
  dsLoi: { code: string; ten: string; ma_may?: string[]; ngung?: boolean; choDuyet?: boolean }[]
  /** DB local gần như trống → có thêm ticket Demo trong bộ nhớ (chỉ dev). */
  demo?: boolean
  /** F: giá trị có trong dữ liệu CHƯA lọc của từng trường chọn/người (đọc DB, truong-f.ts `tuyChonF`). */
  tuyChonLoc?: Record<string, string[]>
  /** F: tab tự tạo (sau 4 tab cố định) + quyền tạo tab dùng chung. */
  tabRieng?: TicketTab[]
  quyenTabChung?: boolean
  /** F: sửa tại ô / Xem nhanh / kéo thẻ (cs.ticket.tao_sua). Không có → ô chỉ đọc. */
  quyenSua?: boolean
  /** F: nhân viên chọn làm Phụ trách (gt = staff id). */
  nhanVien?: { gt: string; nhan: string; anMa?: boolean }[]
  /** F: máy đã lắp theo khách (customer_id) — pop chọn ô Máy. */
  mayKhach?: Record<string, MayKhach[]>
}

/** Hành động chưa nối (bước 4 của docs/rework/2026-11-26-ticket-f-dung-that.md). */
/** Ticket Demo trong bộ nhớ (dev, DB local gần trống) — không lưu được. */
export const laDemo = (ma: string) => /^DEMO-\d+$/.test(ma)
export const DEMO_KHONG_LUU = 'Demo — không lưu'

export const chuaLuu = () => thongBao.xong('Chưa lưu — hành động này chưa nối dữ liệu')

/** SĐT che, chỉ giữ 4 số cuối. */
export const cheSdt = (s: string | null) => (s ? `•••${s.replace(/\D/g, '').slice(-4)}` : null)


export const tenKhach = (t: Ticket) => t.customer_name ?? 'Chưa gắn khách'

export { mayLoi, ngayGioNgan, ngayNgan } from './truong-f'

/** Ghi tham số URL (giữ mọi tham số khác, đổi lọc → bỏ `trang`). */
export function useDatUrl() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  return (sua: Record<string, string | null>, giuTrang = false) => {
    const p = new URLSearchParams(sp.toString())
    if (!giuTrang) p.delete('trang')
    for (const [k, v] of Object.entries(sua)) {
      if (v) p.set(k, v)
      else p.delete(k)
    }
    router.replace(`${pathname}?${p}`, { scroll: false })
  }
}

export function NutTaoTicket() {
  return (
    <Button asChild>
      <Link href="/tao-ticket">Tạo ticket</Link>
    </Button>
  )
}

/** Icon theo loại ticket (CEO 27/11 "thêm icon cho phần này") — menu chọn Loại + ô Loại. Loại lạ → nhãn chung. */
const ICON_LOAI: Record<string, ReactNode> = {
  'Bảo hành': <ShieldCheck aria-hidden="true" />,
  'Lắp đặt': <Toolbox aria-hidden="true" />,
  'Sửa chữa': <Wrench aria-hidden="true" />,
  'Thay lõi': <Funnel aria-hidden="true" />,
  'Tư vấn': <ChatsCircle aria-hidden="true" />,
}
export const mucLoai = (loai: string[]) => loai.map((g) => ({ gt: g, nhan: g, icon: ICON_LOAI[g] ?? <Tag aria-hidden="true" /> }))
