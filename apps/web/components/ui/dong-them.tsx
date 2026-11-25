'use client'

/**
 * Tạo bản ghi NGAY TẠI CHỖ kiểu Notion "+ New" (CEO chốt 25/11/2026, thay hộp "Tạo việc"):
 * - Nút "+ <nhan>" (Button ghost xs `nutThem`, chữ tertiary, icon thẳng mép chữ của dạng xem) cuối Danh sách / Bảng,
 *   chân cột Kanban.
 * - Bấm → hiện HẲN MỘT HÀNG TRỐNG (CEO: "ra hẳn một hàng trống chứ không phải hiện form"): Danh sách / Bảng vẽ dòng nháp
 *   cùng lưới cột (`ListView dongNhap`, `BangViec dongNhap`), các ô khác để trống, ô tên là ô gõ trơn (chữ 14/20, không
 *   viền, gợi ý tertiary); Kanban: một thẻ trống trong cột. Nút "+" ẩn trong lúc có hàng nháp.
 * - Gõ tên, Enter = `onTao(tên)` (tên là trường bắt buộc duy nhất; thuộc tính khác sửa tại ô của dòng vừa hiện); xong →
 *   hàng nháp xoá trắng, GIỮ để gõ tiếp. Esc / rời ô khi trống = bỏ hàng nháp; rời ô khi đã gõ = giữ chữ.
 * - `onTao` trả Promise: `true` = xong, `false`/ném = giữ chữ (bên gọi báo lỗi bằng toast). Đang gửi: ô chỉ đọc (KHÔNG
 *   disabled — disabled làm rơi focus), Enter lặp bị chặn.
 * - `ref.mo()`: nút chính thanh công cụ mở hàng nháp (đã mở → focus lại) + cuộn tới.
 *
 * Cách dùng: Danh sách / Bảng gọi `useDongMoi` (hàng nháp nằm TRONG lưới của dạng xem, nút nằm dưới); Kanban dùng
 * `<DongThem kieu="the">` (nút + thẻ trống tự vẽ trong chân cột).
 */
import { useImperativeHandle, useRef, useState, type ReactNode, type Ref } from 'react'
import { Plus } from '@phosphor-icons/react/ssr'
import { Button } from './button'
import { Card } from './card'
import { nutThem } from './inline-edit-styles'
import { the as theKanban } from './kanban-styles'
import { cn } from '@/lib/utils'

export type DongThemRef = { mo: () => void }

/** Lề trái của khung nút theo dạng xem: ListView đệm dòng 16 · Table (layout fixed) đệm ô 6 · Kanban đệm thẻ 8. */
const LE = { ds: 'px-4', bang: 'px-1.5', the: 'px-2' } as const
/** Khung chứa nút "+": cao control-size-lg, icon thẳng mép chữ nhờ lề âm của `nutThem`. */
export const khungNutThem = (kieu: keyof typeof LE) =>
  cn('flex min-h-(--control-size-lg) min-w-0 items-center border-none border-current', LE[kieu])
/** Ô gõ trơn — chữ 14/20 như tên dòng, không viền/nền/outline (như ô chữ Composer); hàng nháp đã có nền "đang gõ". */
const O_GO =
  'w-full min-w-0 border-none bg-transparent p-0 text-[14px] leading-[20px] text-foreground [outline:none] placeholder:text-(--color-text-tertiary)'

type PropsDongMoi = {
  /** Chữ nút, vd "Việc mới" (hiện "+ Việc mới"). */
  nhan: string
  /** Tên đọc của nút + ô gõ khi một màn có nhiều dòng thêm (vd cột Kanban: "Việc mới — Đang làm"). Bỏ = `nhan`. */
  nhanDoc?: string
  /** Gợi ý trong ô gõ, vd "Tên việc — Enter để tạo, Esc để thôi". */
  placeholder?: string
  onTao: (ten: string) => Promise<boolean>
  ref?: Ref<DongThemRef>
}

/** Trạng thái + ô gõ + nút của hàng nháp. `oGo` đặt vào ô tên của hàng nháp; `nut` đặt dưới dạng xem khi `!mo`. */
export function useDongMoi({ nhan, nhanDoc, placeholder, onTao, ref }: PropsDongMoi) {
  const [mo, setMo] = useState(false)
  const [chu, setChu] = useState('')
  const [dangGui, setDangGui] = useState(false)
  const chan = useRef(false)
  const oGoRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    mo: () => {
      setMo(true)
      // Chưa dựng: autoFocus lo. Đã mở sẵn (còn chữ nháp, đã rời focus): focus lại tay — setMo(true) không vẽ lại.
      oGoRef.current?.focus()
      requestAnimationFrame(() => oGoRef.current?.scrollIntoView({ block: 'nearest' }))
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

  const oGo: ReactNode = (
    <input
      ref={oGoRef}
      autoFocus
      value={chu}
      readOnly={dangGui}
      aria-busy={dangGui || undefined}
      aria-label={nhanDoc ?? nhan}
      placeholder={placeholder}
      className={O_GO}
      onChange={(e) => setChu(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation() // phím trong ô gõ không đến dòng / bảng (Enter mở dòng, phím tắt danh sách)
        if (e.nativeEvent.isComposing) return
        if (e.key === 'Enter') {
          e.preventDefault()
          void gui()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          dong()
        }
      }}
      onBlur={() => !chu.trim() && !dangGui && dong()}
    />
  )

  const nut: ReactNode = (
    <Button variant="ghost" size="xs" className={nutThem} aria-label={nhanDoc} onClick={() => setMo(true)}>
      <Plus aria-hidden="true" />
      {nhan}
    </Button>
  )

  return { mo, oGo, nut }
}

/** Nút "+" + hàng nháp tự vẽ: `the` = thẻ trống trong cột Kanban; `ds`/`bang` = ô gõ ngay chỗ nút (khi không có lưới). */
export function DongThem({ kieu = 'the', className, ...p }: PropsDongMoi & { kieu?: keyof typeof LE; className?: string }) {
  const { mo, oGo, nut } = useDongMoi(p)
  if (mo && kieu === 'the')
    return (
      <div data-slot="dong-them" className={cn('border-none border-current px-2 pb-2', className)}>
        <Card className={cn(theKanban, 'cursor-text')}>{oGo}</Card>
      </div>
    )
  return (
    <div data-slot="dong-them" className={cn(khungNutThem(kieu), className)}>
      {mo ? oGo : nut}
    </div>
  )
}
