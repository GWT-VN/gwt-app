'use client'

import type { CSSProperties, ReactNode } from 'react'
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
} from './toast-styles'

/**
 * Toast — Sonner 2.0.8 (shadcn Sonner), giao diện `.ui-toast` của ds/nguon/bundle.css.
 * - Đặt MỘT `<Toaster />` mỗi trang, TRONG `<DsRoot>` (Sonner không portal — toaster render tại chỗ → nằm trong vùng
 *   `[data-ds="v2"]`, có token). Gọi `thongBao.*` ở bất kỳ đâu (client).
 * - z 56 (thang z NGUON.md, dưới Dialog 70): Sonner gốc đặt `z-index: 999999999` trên `[data-sonner-toaster]` → ghi
 *   đè bằng style của toaster (inline thắng stylesheet Sonner chèn lúc chạy).
 * - Đáy giữa cách đáy 72 ở mọi khổ (Sonner điện thoại mặc định 16 → `mobileOffset`); bề ngang toaster = khung − 32.
 * - Sonner tự lo: chồng nhiều toast, dừng hẹn giờ khi rê chuột, vuốt để tắt, Alt+T tới vùng thông báo.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      offset={{ bottom: CACH_DAY }}
      mobileOffset={{ bottom: CACH_DAY }}
      containerAriaLabel="Thông báo"
      style={{ zIndex: Z_TOAST, '--width': 'calc(100% - 32px)' } as CSSProperties}
    />
  )
}

type Loai = 'xong' | 'loi' | 'chay'
type Nut = { ten: string; lam: () => void }

/** Viên thuốc. role cố định theo loại (xong/chạy: status, lỗi: alert) — không đổi role tại chỗ (trình đọc màn hình hay bỏ qua). */
function NoiDung({ loai, chu, tienDo, nut, dong }: { loai: Loai; chu: ReactNode; tienDo?: number; nut?: Nut; dong?: () => void }) {
  return (
    <div data-slot="toast" role={loai === 'loi' ? 'alert' : 'status'} data-color={loai === 'loi' ? 'danger' : undefined} className={toastVien}>
      {loai === 'chay' ? (
        <Spinner className={toastSpinner} />
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
  return toast.custom(
    (id) => (
      <NoiDung
        loai={loai}
        chu={chu}
        tienDo={o.tienDo}
        // Bấm nút hành động = làm xong việc của toast → đóng nó.
        nut={o.nut && { ten: o.nut.ten, lam: () => (o.nut!.lam(), toast.dismiss(id)) }}
        dong={loai === 'loi' ? () => toast.dismiss(id) : undefined}
      />
    ),
    { id: o.id, duration: o.duration, className: toastLi },
  )
}

/**
 * Thông báo sau thao tác (README Toast). Trả id của toast.
 * - `xong(chu, { hoanTac?, id? })`: ✓, tự tắt 5 giây; `hoanTac` → nút "Hoàn tác" (gọi rồi đóng). `id` của toast
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
