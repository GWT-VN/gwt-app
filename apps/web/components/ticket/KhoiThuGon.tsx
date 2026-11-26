import type { ReactNode } from 'react'
import { hienNgay } from '@/lib/dinh-dang-ngay'

const TRICH = 70


/** Dòng tóm tắt khi khối đóng: số dòng + trích dòng mới nhất (1 dòng, cắt ~70 ký tự). */
export function tomTatNhatKy(notes: readonly { noi_dung: string; created_at: string }[]): string {
  if (!notes.length) return 'chưa có ghi chú'
  const moi = notes.reduce((a, b) => (Date.parse(b.created_at) > Date.parse(a.created_at) ? b : a))
  const gon = moi.noi_dung.replace(/\s+/g, ' ').trim()
  const trich = gon.length > TRICH ? `${gon.slice(0, TRICH).trimEnd()}…` : gon
  return `${notes.length} dòng · mới nhất ${hienNgay(moi.created_at)}: ${trich}`
}

/**
 * Khối thu gọn được (chị Trang 18/11: nhật ký trao đổi "mở ra đóng vào", không cần nhìn mãi).
 * `<details>` gốc của trình duyệt: không cần JS, bàn phím / trình đọc màn hình dùng được. Mặc định đóng.
 */
export function KhoiThuGon({ tieuDe, tomTat, moSan = false, children }: {
  tieuDe: string; tomTat?: string; moSan?: boolean; children: ReactNode
}) {
  return (
    <details open={moSan} className="group bg-white rounded-xl border">
      <summary className="flex cursor-pointer list-none items-baseline gap-2 p-5 select-none [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="text-slate-400 transition-transform group-open:rotate-90">▸</span>
        <span className="font-medium text-slate-900 shrink-0">{tieuDe}</span>
        {tomTat && <span className="min-w-0 truncate text-sm text-slate-500 group-open:hidden">{tomTat}</span>}
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  )
}
