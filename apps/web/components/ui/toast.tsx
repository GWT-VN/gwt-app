'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { Check, WarningCircle, X } from '@phosphor-icons/react'
import { Toaster as SonnerToaster, toast } from 'sonner'
import { Spinner } from './spinner'
import {
  CACH_DAY,
  THOI_GIAN_XONG,
  Z_TOAST,
  toastDong,
  toastIconLoi,
  toastIconXong,
  toastLi,
  toastNut,
  toastSpinner,
  toastTienDo,
  toastTienDoChay,
  toastVien,
  toasterLop,
} from './toast-styles'

/**
 * Toast — Sonner 2.0.8 (shadcn Sonner), giao diện `.ui-toast` của ds/nguon/bundle.css.
 * - Đặt MỘT `<Toaster />` mỗi trang, TRONG `<DsRoot>` (Sonner không portal — toaster render tại chỗ → nằm trong vùng
 *   `[data-ds="v2"]`, có token). Gọi `thongBao.*` ở bất kỳ đâu (client).
 * - z 56 (thang z NGUON.md, dưới Dialog 70): Sonner gốc đặt `z-index: 999999999` trên `[data-sonner-toaster]` → ghi
 *   đè bằng style của toaster (inline thắng stylesheet Sonner chèn lúc chạy).
 * - Đáy giữa cách đáy 72 ở mọi khổ (Sonner điện thoại mặc định 16 → `mobileOffset`); bề ngang toaster = khung − 32.
 *   BulkActionBar đang hiện → 124 (≤767: 236), qua `toasterLop`.
 * - Sonner tự lo: chồng nhiều toast, dừng hẹn giờ khi rê chuột, vuốt để tắt, Alt+T tới vùng thông báo.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      offset={{ bottom: CACH_DAY }}
      mobileOffset={{ bottom: CACH_DAY }}
      containerAriaLabel="Thông báo"
      className={toasterLop}
      style={{ zIndex: Z_TOAST, '--width': 'calc(100% - 32px)' } as CSSProperties}
    />
  )
}

type Loai = 'xong' | 'loi' | 'chay'
type Nut = { ten: string; lam: () => void }

/**
 * Viên thuốc. Đọc màn hình (R12 — lệch README có chủ đích: README ghi `role="status"`): `<section aria-live="polite">` của
 * Sonner đã bọc mọi toast → xong/đang chạy KHÔNG gắn role riêng (gắn thêm = vùng live lồng nhau, dễ đọc hai lần); lỗi
 * giữ `role="alert"` (khẩn) — vùng live gần nhất của nội dung lỗi là chính alert (Chrome tính live root = alert).
 *
 * Focus phím (WCAG 2.2.1, 2.4.3): focus vào toast (li của Sonner hoặc nút) → `giu(true)` dừng hẹn giờ; rời ra ngoài →
 * `giu(false)` chạy lại đủ thời gian. Toast bị gỡ khi đang chứa focus → trả focus về phần tử đứng trước khi vào toast
 * (Sonner chỉ tự trả khi toast CUỐI biến mất — còn toast khác thì focus rơi về body).
 */
function NoiDung({
  loai,
  chu,
  tienDo,
  nut,
  dong,
  giu,
}: {
  loai: Loai
  chu: ReactNode
  tienDo?: number
  nut?: Nut
  dong?: () => void
  giu?: (dang: boolean) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const giuRef = useRef(giu)
  useEffect(() => {
    giuRef.current = giu
  })
  useEffect(() => {
    const li = ref.current?.closest<HTMLElement>('[data-sonner-toast]')
    if (!li) return
    let truoc: HTMLElement | null = null
    let trong = false
    const vao = (e: FocusEvent) => {
      if (trong) return
      trong = true
      const t = e.relatedTarget
      truoc = t instanceof HTMLElement && !li.contains(t) ? t : null
      giuRef.current?.(true)
    }
    const ra = (e: FocusEvent) => {
      if (li.contains(e.relatedTarget as Node | null)) return
      // Chrome bắn focusout khi GỠ phần tử đang focus (relatedTarget null) — toast đang gỡ (Sonner gắn data-removed
      // 200ms trước khi gỡ) thì không tính là rời: giữ `trong` để lúc gỡ trả focus về `truoc`.
      if (!li.isConnected || li.dataset.removed === 'true') return
      trong = false
      giuRef.current?.(false)
    }
    li.addEventListener('focusin', vao)
    li.addEventListener('focusout', ra)
    return () => {
      li.removeEventListener('focusin', vao)
      li.removeEventListener('focusout', ra)
      // Gỡ khi đang chứa focus → focus đã rơi về body (jsdom không bắn focusout lúc gỡ, Chrome có — xem `ra`).
      const mat = !document.activeElement || document.activeElement === document.body || !document.activeElement.isConnected
      if (trong && mat && truoc?.isConnected) truoc.focus({ preventScroll: true })
    }
  }, [])
  return (
    <div ref={ref} data-slot="toast" role={loai === 'loi' ? 'alert' : undefined} data-color={loai === 'loi' ? 'danger' : undefined} className={toastVien}>
      {loai === 'chay' ? (
        <Spinner aria-hidden className={toastSpinner} />
      ) : loai === 'loi' ? (
        <WarningCircle weight="fill" aria-hidden className={toastIconLoi} />
      ) : (
        <Check aria-hidden className={toastIconXong} />
      )}
      {chu}
      {tienDo !== undefined && (
        <span role="progressbar" aria-valuenow={tienDo} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ" className={toastTienDo}>
          <span className={toastTienDoChay} style={{ '--p': `${tienDo}%` } as CSSProperties} />
        </span>
      )}
      {nut && (
        <button type="button" className={toastNut} onClick={nut.lam}>
          {nut.ten}
        </button>
      )}
      {dong && (
        <button type="button" data-slot="toast-dong" className={toastDong} aria-label="Đóng thông báo" onClick={dong}>
          <X aria-hidden />
        </button>
      )}
    </div>
  )
}

export type ToastId = string | number

function hien(loai: Loai, chu: ReactNode, o: { id?: ToastId; duration: number; nut?: Nut; tienDo?: number }): ToastId {
  const ve = (id: ToastId) => (
    <NoiDung
      loai={loai}
      chu={chu}
      tienDo={o.tienDo}
      // Bấm nút hành động = làm xong việc của toast → đóng nó.
      nut={o.nut && { ten: o.nut.ten, lam: () => (o.nut!.lam(), toast.dismiss(id)) }}
      dong={loai === 'loi' ? () => toast.dismiss(id) : undefined}
      // Chỉ toast tự tắt mới cần dừng hẹn giờ. Sonner không có API dừng → cập nhật cùng id với duration Infinity (Sonner
      // đặt lại thời gian còn lại theo duration mới), rời ra → duration gốc (đủ 5 giây). Toast đã đóng thì thôi —
      // `create` cùng id của toast đã đóng sẽ dựng lại toast mới.
      giu={
        Number.isFinite(o.duration)
          ? (dang) => {
              if (toast.getToasts().some((t) => t.id === id))
                toast.custom(ve, { id, duration: dang ? Infinity : o.duration, className: toastLi })
            }
          : undefined
      }
    />
  )
  return toast.custom(ve, { id: o.id, duration: o.duration, className: toastLi })
}

/**
 * Thông báo sau thao tác (README Toast). Trả id của toast.
 * - `xong(chu, { hoanTac?, id? })`: ✓, tự tắt 5 giây (focus phím trong toast → dừng); `hoanTac` → nút "Hoàn tác" (gọi rồi đóng). `id` của toast
 *   `dangChay` → đổi TẠI CHỖ (một toast).
 * - `loi(chu, { thuLai?, id? })`: ✕ đỏ, KHÔNG tự tắt, `role="alert"`, nút "Thử lại" + nút đóng. `id` → đóng toast đó và
 *   mở toast lỗi MỚI (vùng alert được chèn mới mới được đọc ngay).
 * - `dangChay(chu, { tienDo?, id? })`: vòng xoay + thanh tiến độ 0–100, không tự tắt; gọi lại cùng `id` để cập nhật.
 * - `dong(id?)`: đóng một toast (không id = tất cả).
 */
export const thongBao = {
  xong: (chu: ReactNode, o: { hoanTac?: () => void; id?: ToastId } = {}) =>
    hien('xong', chu, { id: o.id, duration: THOI_GIAN_XONG, nut: o.hoanTac && { ten: 'Hoàn tác', lam: o.hoanTac } }),
  loi: (chu: ReactNode, o: { thuLai?: () => void; id?: ToastId } = {}) => {
    if (o.id !== undefined) toast.dismiss(o.id)
    return hien('loi', chu, { duration: Infinity, nut: o.thuLai && { ten: 'Thử lại', lam: o.thuLai } })
  },
  dangChay: (chu: ReactNode, o: { tienDo?: number; id?: ToastId } = {}) =>
    hien('chay', chu, { id: o.id, duration: Infinity, tienDo: o.tienDo }),
  dong: (id?: ToastId) => {
    toast.dismiss(id)
  },
}
