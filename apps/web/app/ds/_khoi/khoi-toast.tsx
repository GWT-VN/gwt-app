'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { thongBao, type ToastId } from '@/components/ui/toast'
import { BienThe, KhoiHang } from '../_khung/tam'

const NOOP = () => {}

const xong = () => thongBao.xong('TK-2611-045 → Đang xử lý', { hoanTac: NOOP })
const loi = () => thongBao.loi('Không lưu được — mất kết nối', { thuLai: NOOP })

/** Đang chạy: 20% → 100% (bước 20, 800ms) rồi đổi tại chỗ sang thành công. Gỡ khối giữa chừng → dừng. */
function useChay() {
  const hen = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(hen.current), [])
  return () => {
    clearTimeout(hen.current)
    const chu = 'Đang xuất Báo cáo thu chi 11.2026.xlsx'
    const id: ToastId = thongBao.dangChay(chu, { tienDo: 20 })
    const buoc = (p: number) => {
      hen.current = setTimeout(() => {
        if (p > 100) thongBao.xong('Đã xuất Báo cáo thu chi 11.2026.xlsx', { id })
        else {
          thongBao.dangChay(chu, { id, tienDo: p })
          buoc(p + 20)
        }
      }, 800)
    }
    buoc(40)
  }
}

/**
 * #toast — ds/nguon/components/Toast/preview.html vẽ 3 toast tĩnh; DS bấm nút ra toast thật (Sonner, đáy giữa cách đáy
 * 72). `data-so` = khoá so khớp (ds/so-khop/toast.json). Toaster do trang gắn (khung-ds.tsx, tron/page.tsx).
 */
export function KhoiToast() {
  const chay = useChay()
  return (
    <section id="toast" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#toast">Toast</a>
      </h2>
      <div className="flex flex-wrap gap-2">
        <Button data-so="xong" variant="outline" onClick={xong}>
          Thành công + Hoàn tác
        </Button>
        <Button data-so="loi" variant="outline" onClick={loi}>
          Lỗi + Thử lại
        </Button>
        <Button data-so="chay" variant="outline" onClick={chay}>
          Đang chạy
        </Button>
      </div>
    </section>
  )
}

/** /ds dạng hàng. */
export function KhoiToastHang() {
  const chay = useChay()
  return (
    <KhoiHang neo="toast">
      <BienThe ten="Thành công" moTa="Hiện ở đáy giữa màn, tự tắt sau 5 giây; bấm Hoàn tác để lùi lại">
        <Button variant="outline" onClick={xong}>
          Thành công + Hoàn tác
        </Button>
      </BienThe>
      <BienThe ten="Lỗi" moTa="Không tự tắt; có Thử lại và nút đóng">
        <Button variant="outline" onClick={loi}>
          Lỗi + Thử lại
        </Button>
      </BienThe>
      <BienThe ten="Đang chạy" moTa="Vòng xoay + thanh tiến độ; chạy xong tự đổi sang thành công ngay tại chỗ">
        <Button variant="outline" onClick={chay}>
          Đang chạy
        </Button>
      </BienThe>
    </KhoiHang>
  )
}
