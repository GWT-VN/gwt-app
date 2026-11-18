'use client'
// PROTOTYPE — vỏ hộp nổi dùng chung trên thẻ <dialog> gốc (showModal): trình duyệt lo bẫy focus, Esc, chặn nền, trả focus.
// Dùng cho ConfirmDialog (ui-dialog) và ô tìm toàn cục (ui-command). Đã kiểm 18/11: bấm lề trong hộp / kéo chọn chữ ra
// ngoài không đóng; Esc + bấm nền bị chặn khi `ban`.
import { useLayoutEffect, useRef, type AriaRole, type ReactNode } from 'react'

export function HopGoc({ mo, dong, ban, className, role, nhan, labelledby, describedby, children }: {
  mo: boolean; dong: () => void; ban?: boolean; className: string; role?: AriaRole
  nhan?: string; labelledby?: string; describedby?: string; children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const nhanNen = useRef(false)
  useLayoutEffect(() => { // layout: đóng trước khi vẽ → không chớp khung rỗng
    const d = ref.current; if (!d) return
    if (mo && !d.open) { d.showModal(); d.querySelector<HTMLElement>('[data-autofocus]')?.focus() } // autoFocus của React chạy lúc hộp còn đóng → không ăn
    if (!mo && d.open) d.close()
  }, [mo])
  // bấm nền = điểm bấm NẰM NGOÀI khung hộp, cả lúc nhấn lẫn lúc thả (kéo chọn chữ rồi thả ra ngoài không tính)
  const ngoai = (e: { clientX: number; clientY: number; target: EventTarget; currentTarget: HTMLDialogElement }) => {
    if (e.target !== e.currentTarget) return false
    const r = e.currentTarget.getBoundingClientRect()
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
  }
  return (
    <dialog ref={ref} className={className} role={role} aria-label={nhan} aria-labelledby={labelledby} aria-describedby={describedby} onClose={dong}
      onCancel={(e) => { if (ban) e.preventDefault() }}
      onKeyDown={(e) => { if (ban && e.key === 'Escape') e.preventDefault() }} /* Chrome (CloseWatcher) chỉ cho chặn cancel 1 lần — chặn Esc từ keydown thì không phát yêu cầu đóng */
      onPointerDown={(e) => { nhanNen.current = ngoai(e) }}
      onClick={(e) => { if (nhanNen.current && ngoai(e) && !ban) dong(); nhanNen.current = false }}>
      {mo && children}
    </dialog>
  )
}
