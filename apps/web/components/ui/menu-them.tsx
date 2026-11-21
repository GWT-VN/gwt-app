'use client'

import { createContext, useEffect, useRef, type ComponentProps, type KeyboardEvent } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { Input } from './input'
import { Kbd, KbdGroup } from './kbd'
import { menuTimKiem } from './menu-styles'

/**
 * Phần GWT CỘNG THÊM cho ba họ menu shadcn (dropdown-menu.tsx, context-menu.tsx, menubar.tsx) — shadcn không có. Mỗi
 * họ vẫn là file riêng y khung shadcn (mỗi phần một hàm, primitive Radix của chính họ đó); ở đây chỉ là hành vi không
 * phụ thuộc primitive: ô tìm đầu menu con, chuyển chữ gõ vào ô tìm, tự focus khi menu con mở, nhóm Kbd phím tắt, giá trị
 * RadioGroup cho mục chặn quyền. Nguồn: prototype menu thuộc tính CEO duyệt 20/11 (app/prototype/menu-thuoc-tinh).
 */

/** Chọn ô tìm của MỘT khung menu (menu con nằm ở portal riêng, không lồng DOM). */
const O_TIM = '[data-slot="menu-tim-kiem"] input'

/**
 * Gõ chữ khi focus ở mục cha (menu con đang mở) hoặc ở một mục của menu con có ô tìm → chữ vào ô tìm, không chạy typeahead
 * của Radix. Đổi focus TRONG keydown: trình duyệt chèn ký tự vào phần tử đang focus lúc đó (ô tìm). Space giữ nghĩa chọn
 * mục; IME đang ghép (key "Process", isComposing) và tổ hợp Ctrl/⌘/Alt không chuyển.
 */
function vaoOTim(e: KeyboardEvent<HTMLElement>, khung: Element | null | undefined) {
  if (e.key.length !== 1 || e.key === ' ' || e.ctrlKey || e.metaKey || e.altKey || e.nativeEvent.isComposing) return
  const o = khung?.querySelector<HTMLInputElement>(O_TIM)
  if (!o || o === e.target) return
  e.stopPropagation()
  o.focus()
}

/** onKeyDown của `*SubTrigger`: menu con có MenuTimKiem đang mở mà focus còn ở mục cha → gõ chữ đi vào ô tìm. */
export function phimSubTrigger(e: KeyboardEvent<HTMLElement>) {
  // aria-controls chỉ có khi menu con đang mở (Radix) → id khung menu con.
  const id = e.currentTarget.getAttribute('aria-controls')
  if (id) vaoOTim(e, e.currentTarget.ownerDocument.getElementById(id))
}

/**
 * onKeyDownCapture của `*SubContent` (pha capture ở khung: chặn trước khi phím tới mục — Enter/Space — và tới typeahead ở
 * onKeyDown của khung). Có MenuTimKiem: ↑ ở mục đầu → về ô; gõ chữ ở mục bất kỳ → vào ô.
 */
export function phimSubContent(e: KeyboardEvent<HTMLElement>) {
  const m = e.currentTarget
  const o = m.querySelector<HTMLInputElement>(O_TIM)
  if (o && e.key === 'ArrowUp' && e.target === m.querySelector('[role^="menuitem"]')) {
    e.preventDefault()
    e.stopPropagation()
    o.focus()
    return
  }
  vaoOTim(e, m)
}

/**
 * Focus khi menu con vừa mở (rAF: sau khi Radix đã tự focus — mở bằng phím thì Radix đưa focus vào mục đầu): ô tìm nếu
 * có; không có ô tìm mà mở bằng phím (focus đang trong menu con) → mục đang ✓, không có thì giữ mục đầu. Mở bằng chuột
 * (focus còn ở mục cha) mà không có ô tìm → không giành focus. Đặt làm con cuối của `*SubContent`.
 */
export function TuFocusMenuCon() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const m = ref.current?.closest<HTMLElement>('[role="menu"]')
      if (!m) return
      const o = m.querySelector<HTMLElement>(O_TIM)
      if (o) o.focus({ preventScroll: true })
      else if (m.contains(document.activeElement))
        m.querySelector<HTMLElement>('[aria-checked="true"]')?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(id)
  }, [])
  return <span ref={ref} hidden />
}

/**
 * Phím tắt dạng nhóm Kbd (vd `['⇧', 'D']`) — `*Shortcut phim` và `*SubTrigger phim`. Chữ phím nằm trong tên đọc của mục
 * như bản chữ.
 */
export function PhimKbd({ phim, className, ...props }: ComponentProps<'span'> & { phim: string[] }) {
  return (
    <KbdGroup className={cn('ml-auto', className)} {...props}>
      {phim.map((k, i) => (
        <Kbd key={i}>{k}</Kbd>
      ))}
    </KbdGroup>
  )
}

/**
 * Giá trị đang chọn của `*RadioGroup` — mục chặn quyền (`*RadioItem disabled`, vẽ bằng Item thường vì Radix RadioItem gọi
 * `onValueChange` của nhóm BẤT KỂ preventDefault) tự đọc để gắn `aria-checked`. Một context chung cho cả ba họ: nhóm
 * radio không lồng nhau giữa các họ.
 */
export const GiaTriRadio = createContext<string | undefined>(undefined)

/**
 * Ô gõ để tìm ở đầu menu con (CHUAN-FILTER: >10 mục phải gõ được — vd Người làm). Bên gọi tự lọc danh sách theo `value`.
 * Menu con mở → focus vào ô (`TuFocusMenuCon`). Phím trong ô là để gõ: chặn typeahead và ←/→ của Radix; ↓ sang mục đầu;
 * Enter chọn mục khi danh sách còn ĐÚNG 1 (nhiều mục thì Enter không đoán); Esc/Tab để Radix xử lý (Esc đóng hết menu).
 * IME đang ghép (Telex/VNI) → không xử lý Enter/↓. Tên đọc mặc định = placeholder. Dùng được trong mọi họ menu.
 */
export function MenuTimKiem({
  value,
  onValueChange,
  placeholder,
  onKeyDown,
  ...props
}: Omit<ComponentProps<'input'>, 'value' | 'onChange'> & { value: string; onValueChange(v: string): void }) {
  return (
    <div data-slot="menu-tim-kiem" className={menuTimKiem}>
      <Input
        icon={<MagnifyingGlass />}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        {...props}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.key === 'Tab' || e.key === 'Escape') return
          e.stopPropagation()
          if (e.nativeEvent.isComposing) return
          const muc = e.currentTarget.closest('[role="menu"]')?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? []
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            muc[0]?.focus()
          } else if (e.key === 'Enter') {
            e.preventDefault()
            if (muc.length === 1) muc[0].click()
          }
        }}
      />
    </div>
  )
}
