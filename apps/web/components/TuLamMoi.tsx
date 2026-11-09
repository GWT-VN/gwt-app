'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useDaChon } from '@/bang'
import { nenLamMoi, laODangGo } from '@/lib/ticketHoatDong'

/** Chu kỳ tự làm mới khi tab đang mở. */
const CHU_KY_MS = 20_000
/** focus + visibilitychange hay bắn cùng lúc -> gộp lượt trong khoảng này. */
const TOI_THIEU_MS = 2_000

function gioPhutGiay(d: Date) {
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

/**
 * Tự làm mới danh sách bằng router.refresh() — chạy lại server component với ĐÚNG URL
 * đang xem (giữ từ khoá, bộ lọc, trang, sắp xếp), không tải lại cả trang, không mất
 * state phía trình duyệt (ô tìm đang gõ, cột đang chọn).
 *
 * Dừng khi: tab ẩn · đang gõ trong ô nhập chữ (ô tìm) · đang chọn dòng (làm mới có thể
 * đẩy dòng đã chọn sang trang khác). Làm mới NGAY khi quay lại tab / cửa sổ.
 *
 * Không dùng Supabase Realtime: app chưa có kênh Realtime nào để theo khuôn, và bảng
 * tickets đi qua dataClient() (service role) ở máy chủ — mở Realtime phía trình duyệt
 * phải thêm publication + RLS cho anon/authenticated, tức là đổi DB production.
 *
 * Phải nằm trong <KhungChon> (đọc số dòng đang chọn).
 */
export function TuLamMoi() {
  const router = useRouter()
  const { soDong } = useDaChon()
  const [dangLam, batDau] = useTransition()
  const [luc, setLuc] = useState<Date | null>(null)
  const lanCuoi = useRef(0)

  const thu = useCallback(() => {
    const bayGio = Date.now()
    if (!nenLamMoi({
      an: document.visibilityState === 'hidden',
      dangGo: laODangGo(document.activeElement as HTMLElement | null),
      soDaChon: soDong,
      bayGio,
      lanCuoi: lanCuoi.current,
      toiThieuMs: TOI_THIEU_MS,
    })) return
    lanCuoi.current = bayGio
    batDau(() => router.refresh())
  }, [router, soDong])

  // Mốc "Cập nhật lúc": lúc trang vừa dựng, và mỗi khi một lượt làm mới xong. Đặt trong
  // setTimeout 0 (không setState đồng bộ trong effect) và chỉ chạy ở trình duyệt nên giờ
  // máy chủ / trình duyệt không lệch nhau lúc hydrate.
  useEffect(() => {
    if (dangLam) return
    const hen = setTimeout(() => setLuc(new Date()), 0)
    return () => clearTimeout(hen)
  }, [dangLam])

  useEffect(() => {
    const nhip = setInterval(thu, CHU_KY_MS)
    const khiHien = () => { if (document.visibilityState === 'visible') thu() }
    document.addEventListener('visibilitychange', khiHien)
    window.addEventListener('focus', thu)
    return () => {
      clearInterval(nhip)
      document.removeEventListener('visibilitychange', khiHien)
      window.removeEventListener('focus', thu)
    }
  }, [thu])

  const dungVi = soDong > 0 ? 'tạm dừng tự làm mới khi đang chọn dòng' : 'tự làm mới mỗi 20 giây'
  return (
    <p className="text-xs text-slate-500" aria-live="polite">
      {luc ? `Cập nhật lúc ${gioPhutGiay(luc)}` : 'Đang cập nhật…'}
      <span className="text-slate-400"> · {dangLam ? 'đang làm mới…' : dungVi}</span>
    </p>
  )
}
