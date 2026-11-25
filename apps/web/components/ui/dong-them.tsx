'use client'

/**
 * DongThem — dòng "+ <nhan>" cuối Danh sách / Bảng / cột Kanban để tạo bản ghi NGAY TẠI CHỖ (kiểu Notion "+ New",
 * CEO chốt 25/11/2026 thay hộp "Tạo việc"). Bấm → chính dòng đó thành ô gõ KIỂU DÒNG (không khung form — CEO 25/11:
 * "không dùng form kiểu này"): nền rê của dòng (`alpha-05`, bo `radius-xl`), icon + giữ nguyên chỗ, chữ 14/20 gõ thẳng
 * sau icon, gợi ý màu tertiary, không viền / không vòng focus riêng (nền dòng đã nói "đang gõ ở đây"). Gõ tên, Enter = `onTao(tên)`; tạo xong
 * ô xoá trắng và GIỮ mở để gõ tiếp; Esc (hoặc rời ô khi chưa gõ gì) = đóng. Các thuộc tính khác sửa tại ô của dòng vừa
 * hiện (InlineEdit) — dòng thêm chỉ nhận tên, vì tên là trường bắt buộc duy nhất.
 *
 * - `kieu` chỉ đổi lề trái cho thẳng mép chữ của dạng xem chứa nó: `ds` = đệm dòng ListView 16 · `bang` = đệm ô Table
 *   (layout fixed) 6 · `the` = đệm danh sách thẻ Kanban 8. Nút "+" dùng `nutThem` (ghost xs, chữ tertiary, icon thẳng mép
 *   chữ); lúc gõ icon đứng yên đúng chỗ đó (không nhảy).
 * - `onTao` trả Promise: resolve `true` = xong (xoá ô), `false`/ném = giữ chữ để sửa (bên gọi tự báo lỗi bằng toast).
 *   Đang gửi: ô chỉ đọc (KHÔNG disabled — disabled làm rơi focus, gõ tiếp phải bấm lại), Enter lặp bị chặn.
 * - `ref.mo()`: nút chính của thanh công cụ ("+ Việc mới") mở dòng này + cuộn tới.
 */
import { useImperativeHandle, useRef, useState, type Ref } from 'react'
import { Plus } from '@phosphor-icons/react/ssr'
import { Button } from './button'
import { nutThem } from './inline-edit-styles'
import { cn } from '@/lib/utils'

export type DongThemRef = { mo: () => void }

const LE = { ds: 'px-4', bang: 'px-1.5', the: 'px-2' } as const
/** Lúc gõ: nền rê của dòng ListView (alpha-05, bo radius-xl). */
const DANG_GO = 'rounded-(--radius-xl) bg-(--alpha-05)'
/** Icon + cỡ icon / khe của Button xs (để không nhảy khi đổi từ nút sang ô gõ). */
const ICON = 'flex shrink-0 text-(--color-text-tertiary) [&>svg]:size-(--control-icon-size-xs)'
/** Ô gõ trơn — chữ 14/20 như tên dòng, không viền/nền/outline (như ô chữ Composer). */
const O_GO =
  'min-w-0 flex-1 border-none bg-transparent p-0 text-[14px] leading-[20px] text-foreground [outline:none] placeholder:text-(--color-text-tertiary)'

export function DongThem({
  nhan,
  nhanDoc,
  placeholder,
  onTao,
  kieu = 'ds',
  ref,
  className,
}: {
  /** Chữ nút, vd "Việc mới" (hiện "+ Việc mới"). */
  nhan: string
  /** Tên đọc của nút + ô gõ khi một màn có nhiều dòng thêm (vd cột Kanban: "Việc mới — Đang làm"). Bỏ = `nhan`. */
  nhanDoc?: string
  /** Gợi ý trong ô nhập, vd "Tên việc — Enter để tạo, Esc để thôi". */
  placeholder?: string
  onTao: (ten: string) => Promise<boolean>
  kieu?: keyof typeof LE
  ref?: Ref<DongThemRef>
  className?: string
}) {
  const [mo, setMo] = useState(false)
  const [chu, setChu] = useState('')
  const [dangGui, setDangGui] = useState(false)
  const chan = useRef(false)
  const khung = useRef<HTMLDivElement>(null)
  const oGo = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    mo: () => {
      setMo(true)
      // Ô chưa dựng: autoFocus lo. Ô đã mở sẵn (còn chữ nháp, đã rời focus): focus lại tay — setMo(true) không vẽ lại.
      oGo.current?.focus()
      requestAnimationFrame(() => khung.current?.scrollIntoView({ block: 'nearest' }))
    },
  }))

  async function gui() {
    const ten = chu.trim()
    if (!ten || chan.current) return
    chan.current = true
    setDangGui(true)
    try {
      if (await onTao(ten)) setChu('')
    } catch {
      // Bên gọi đã báo lỗi; giữ chữ để sửa.
    } finally {
      chan.current = false
      setDangGui(false)
    }
  }

  const dong = () => {
    setMo(false)
    setChu('')
  }

  return (
    <div
      ref={khung}
      data-slot="dong-them"
      className={cn(
        'flex min-h-(--control-size-lg) min-w-0 items-center gap-1 border-none border-current',
        LE[kieu],
        mo && DANG_GO,
        className,
      )}
    >
      {mo ? (
        <>
          <span aria-hidden="true" className={ICON}>
            <Plus />
          </span>
          <input
          ref={oGo}
          autoFocus
          value={chu}
          readOnly={dangGui}
          aria-busy={dangGui || undefined}
          aria-label={nhanDoc ?? nhan}
          placeholder={placeholder}
          className={O_GO}
          onChange={(e) => setChu(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return
            if (e.key === 'Enter') {
              e.preventDefault()
              void gui()
            } else if (e.key === 'Escape') {
              e.preventDefault()
              e.stopPropagation()
              dong()
            }
          }}
          onBlur={() => !chu.trim() && !dangGui && dong()}
          />
        </>
      ) : (
        <Button
          variant="ghost"
          size="xs"
          className={nutThem}
          aria-label={nhanDoc}
          onClick={() => setMo(true)}
        >
          <Plus aria-hidden="true" />
          {nhan}
        </Button>
      )}
    </div>
  )
}
