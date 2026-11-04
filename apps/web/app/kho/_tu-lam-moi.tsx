'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { nenLamMoi } from '@/lib/kho/tu-lam-moi'

/**
 * Tự làm mới trang Kho mỗi `giay` giây (mặc định 20) — sổ kho đổi liên tục: bot đọc tin Discord + ô sửa trên Google Sheet mỗi ~20 giây,
 * người khác sửa trên app. `router.refresh()` chỉ tải lại dữ liệu server, GIỮ nguyên trạng thái client (ô đang gõ, bộ lọc).
 * KHÔNG làm mới khi: tab đang ẩn, đang gõ trong ô nhập, đang mở hộp sửa / huỷ (role=dialog hoặc <dialog open>).
 */
export function TuLamMoi({ giay = 20 }: { giay?: number }) {
  const router = useRouter()
  const [luc, setLuc] = useState<Date | null>(null)
  useEffect(() => {
    const h = setInterval(() => {
      const el = document.activeElement
      if (!nenLamMoi({
        hien: document.visibilityState === 'visible',
        dangGo: !!el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName),
        coHop: !!document.querySelector('[role="dialog"], dialog[open]'),
      })) return
      router.refresh()
      setLuc(new Date())
    }, giay * 1000)
    return () => clearInterval(h)
  }, [router, giay])
  return (
    <span className="text-[11px] text-slate-400" title={`Trang tự cập nhật mỗi ${giay} giây (tạm dừng khi đang gõ / đang mở hộp sửa)`}>
      ⟳ tự cập nhật{luc ? ` · ${luc.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}
    </span>
  )
}
