import type { ComponentProps, ReactNode } from 'react'
import { ManV2 } from '@/components/khung/ManV2'
import { Badge } from '@/components/ui/badge'
import { PropertyRow } from '@/components/ui/property-list'
import { cn } from '@/lib/utils'
// Helper hiển thị + badge dùng chung cho khu Sales. Thuần trình bày (render ở server).
import { hienNgay } from '@/lib/dinh-dang-ngay'

export function SalesScreen({ className, ...props }: ComponentProps<'main'>) {
  return (
    <ManV2>
      <main className={cn('mx-auto w-full p-4 sm:p-6', className)} {...props} />
    </ManV2>
  )
}

const vnd = new Intl.NumberFormat('vi-VN')

export function fmtVnd(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return vnd.format(Math.round(Number(n))) + ' ₫'
}

export function fmtQty(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return vnd.format(Number(n))
}

/** order_date lưu 'YYYY-MM-DD' → mặc định `hienNgay` (dd/MM, khác năm dd/MM/yy), không lệch múi giờ. */
export const fmtDate = (d: string | null | undefined): string => hienNgay(d)

/** SĐT có thể mất số 0 đầu (lưu dạng số) → thêm lại khi thấy 9 chữ số. */
export function fmtPhone(raw: string | null | undefined): string {
  if (!raw) return '—'
  let s = String(raw).trim()
  if (/^\d{9}$/.test(s)) s = '0' + s
  return s
}

const TAB = {
  DON_POE: { nhan: 'POE', mau: 'success' },
  DON_POU: { nhan: 'POU', mau: 'info' },
  DON_OTHERS: { nhan: 'Khác', mau: 'secondary' },
  DON_TANG: { nhan: 'Tặng', mau: 'warning' },
} as const

export function TabBadge({ tab }: { tab: string | null }) {
  const t = tab && Object.hasOwn(TAB, tab) ? TAB[tab as keyof typeof TAB] : null
  return <Badge variant="soft" color={t?.mau ?? 'secondary'}>{t?.nhan ?? (tab || '—')}</Badge>
}

/** Badge trạng thái chung: tô màu theo từ khoá, không cần bảng cứng. */
export function StatusBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>
  const v = value.toLowerCase()
  let mau: ComponentProps<typeof Badge>['color'] = 'secondary'
  if (/(đã thu|đủ|hoàn thành|xong|đã giao|done|active|kích hoạt)/.test(v)) mau = 'success'
  else if (/(chờ|đối soát|pending|xử lý|open|mới)/.test(v)) mau = 'warning'
  else if (/(huỷ|hủy|lỗi|cancel|từ chối)/.test(v)) mau = 'danger'
  return <Badge variant="soft" color={mau}>{value}</Badge>
}

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return <PropertyRow nhan={label} trong="—">{value}</PropertyRow>
}
