'use client'

// PROTOTYPE vứt đi — nội dung menu thuộc tính kiểu Linear, MỘT bản cho cả ContextMenu (chuột phải) lẫn DropdownMenu (nút …).
// DS chưa có menu con + Radio/Checkbox của ContextMenu → ghép thẳng primitive radix-ui, mặc class của menu-styles.ts.
import { useEffect, useRef, useState, type ComponentType, type KeyboardEvent, type ReactNode } from 'react'
import { CalendarBlank, CaretRight, CellSignalHigh, Check, CircleHalf, MagnifyingGlass, Minus, Tag, UserCircle } from '@phosphor-icons/react/ssr'
import { ContextMenu as CM, DropdownMenu as DM } from 'radix-ui'
import { boDau } from '@/bang/timkiem'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, chuCaiDau } from '@/components/ui/avatar'
import { BadgeDot } from '@/components/ui/badge'
import { ContextMenuItem, ContextMenuLabel, ContextMenuSeparator } from '@/components/ui/context-menu'
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useDsPortal } from '@/components/ui/ds-root'
import { Input } from '@/components/ui/input'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { menuCheck, menuContent, menuItem, menuLabel } from '@/components/ui/menu-styles'
import { CHUA_GIAO, NGUOI, NHAN, TRANG_THAI, UU_TIEN, type Sub, type Ticket, type TrangThai, type UuTien } from './du-lieu'

type P = { className?: string; children?: ReactNode }
type Kit = {
  Label: ComponentType<P>
  Separator: ComponentType<P>
  Item: ComponentType<P & { onSelect?(e: Event): void }>
  RadioGroup: ComponentType<P & { value: string; onValueChange(v: string): void; onKeyDown?(e: KeyboardEvent<HTMLDivElement>): void }>
  RadioItem: ComponentType<P & { value: string }>
  CheckboxItem: ComponentType<P & { checked: boolean | 'indeterminate'; onCheckedChange(): void; onSelect(e: Event): void }>
  Sub: ComponentType<{ open: boolean; onOpenChange(o: boolean): void; children: ReactNode }>
  SubTrigger: ComponentType<P & { onKeyDown?(e: KeyboardEvent<HTMLDivElement>): void }>
  SubContent: ComponentType<P & { sideOffset?: number; alignOffset?: number; collisionPadding?: number; 'data-sub'?: string }>
  Portal: ComponentType<{ container?: HTMLElement | null; children: ReactNode }>
}

/** Phần DS chưa có, dựng từ primitive của MỘT họ menu (DM hoặc CM — cùng API Radix Menu, khác context). */
function tuPrimitive(N: typeof DM) {
  function CheckboxItem({ className, children, checked, ...p }: P & { checked: boolean | 'indeterminate'; onCheckedChange(): void; onSelect(e: Event): void }) {
    return (
      <N.CheckboxItem className={cn(menuItem, className)} checked={checked} {...p}>
        {children}
        <N.ItemIndicator asChild>
          {checked === 'indeterminate' ? <Minus aria-hidden="true" className={menuCheck} /> : <Check aria-hidden="true" className={menuCheck} />}
        </N.ItemIndicator>
      </N.CheckboxItem>
    )
  }
  function RadioItem({ className, children, ...p }: P & { value: string }) {
    return (
      <N.RadioItem className={cn(menuItem, className)} {...p}>
        {children}
        <N.ItemIndicator asChild>
          <Check aria-hidden="true" className={menuCheck} />
        </N.ItemIndicator>
      </N.RadioItem>
    )
  }
  return { CheckboxItem, RadioItem, Sub: N.Sub, SubTrigger: N.SubTrigger, SubContent: N.SubContent, Portal: N.Portal }
}

const KIT: Record<'nut' | 'chuot', Kit> = {
  nut: {
    ...tuPrimitive(DM),
    Label: DropdownMenuLabel,
    Separator: DropdownMenuSeparator,
    Item: DropdownMenuItem,
    RadioGroup: DropdownMenuRadioGroup,
    RadioItem: DropdownMenuRadioItem,
  },
  chuot: {
    ...tuPrimitive(CM as unknown as typeof DM),
    Label: ContextMenuLabel,
    Separator: ContextMenuSeparator,
    Item: ContextMenuItem,
    RadioGroup: CM.RadioGroup,
  },
}

export type Doi = {
  trangThai(v: TrangThai): void
  nguoiLam(v: string | null): void
  uuTien(v: UuTien): void
  nhan(id: string, them: boolean): void
  /** "Đặt hạn…": đóng menu, mở ô chọn hạn neo vào ô Hạn của dòng. */
  han(): void
}

/** Mở bằng phím (S/A/P/L ngoài bảng hoặc trong menu) → menu con vừa mở tự focus: ô tìm › mục đang ✓ › mục đầu. */
function TuFocus({ xong }: { xong(): void }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const m = ref.current?.closest<HTMLElement>('[role=menu]')
      const dich =
        m?.querySelector<HTMLElement>('input') ??
        m?.querySelector<HTMLElement>('[aria-checked=true]') ??
        m?.querySelector<HTMLElement>('[role^=menuitem]')
      dich?.focus({ preventScroll: true })
      xong()
    })
    return () => cancelAnimationFrame(id)
  }, [xong])
  return <span ref={ref} hidden />
}

function MucCon({
  K,
  id,
  sub,
  doiSub,
  icon,
  ten,
  phim,
  quaPhim,
  xongPhim,
  children,
}: {
  K: Kit
  id: Sub
  sub: Sub | null
  doiSub(id: Sub, mo: boolean): void
  icon: ReactNode
  ten: string
  phim: string
  quaPhim: boolean
  xongPhim(): void
  children: ReactNode
}) {
  const portal = useDsPortal()
  return (
    <K.Sub open={sub === id} onOpenChange={(o) => doiSub(id, o)}>
      <K.SubTrigger
        // Mục cha giữ nền sáng khi menu con đang mở (focus đã sang menu con → mất data-highlighted).
        className={cn(menuItem, 'data-[state=open]:bg-(--menu-item-bg)')}
        onKeyDown={
          id === 'nguoi-lam'
            ? (e) => {
                // Gõ chữ khi đứng ở "Người làm" → chữ vào thẳng ô tìm của menu con (không chạy typeahead của menu cha).
                if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return
                const o = portal?.querySelector<HTMLInputElement>('[data-sub=nguoi-lam] input')
                if (!o) return
                e.stopPropagation()
                o.focus()
              }
            : undefined
        }
      >
        {icon}
        {ten}
        <KbdGroup className="ml-auto">
          <Kbd>{phim}</Kbd>
        </KbdGroup>
        <CaretRight aria-hidden="true" />
      </K.SubTrigger>
      <K.Portal container={portal}>
        {/* alignOffset −6 = --menu-gutter: mục đầu menu con thẳng hàng mục cha. sideOffset 4 = DropdownMenuContent DS. */}
        <K.SubContent className={menuContent} sideOffset={4} alignOffset={-6} collisionPadding={8} data-sub={id}>
          {children}
          {quaPhim && sub === id && <TuFocus xong={xongPhim} />}
        </K.SubContent>
      </K.Portal>
    </K.Sub>
  )
}

/** Menu con Người làm: ô gõ để tìm ở đầu (CHUAN-FILTER), gõ lọc ngay, ↓ xuống danh sách, Enter chọn mục đầu. */
function ChonNguoi({ K, value, onChon }: { K: Kit; value: string; onChon(id: string): void }) {
  const [q, setQ] = useState('')
  const o = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const id = requestAnimationFrame(() => o.current?.focus({ preventScroll: true }))
    return () => cancelAnimationFrame(id)
  }, [])
  const k = boDau(q).trim()
  const ds = [{ id: CHUA_GIAO, ten: 'Chưa giao' }, ...NGUOI].filter((n) => !k || boDau(n.ten).includes(k))
  const mucDau = (el: HTMLElement) => el.closest('[role=menu]')?.querySelector<HTMLElement>('[role=menuitemradio]')
  return (
    <>
      <div className="px-0.5 pt-0.5 pb-1.5 border-none border-current">
        <Input
          ref={o}
          icon={<MagnifyingGlass />}
          placeholder="Tìm người…"
          aria-label="Tìm người làm"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Tab' || e.key === 'Escape') return
            // Chặn typeahead + ←/→ (đóng menu con) của Radix: phím trong ô là để gõ.
            e.stopPropagation()
            if (e.nativeEvent.isComposing) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              mucDau(e.currentTarget)?.focus()
            } else if (e.key === 'Enter') {
              e.preventDefault()
              mucDau(e.currentTarget)?.click()
            }
          }}
        />
      </div>
      {ds.length ? (
        <K.RadioGroup
          value={value}
          onValueChange={onChon}
          onKeyDown={(e) => {
            // ↑ ở mục đầu → về ô tìm.
            if (e.key === 'ArrowUp' && e.target === mucDau(e.currentTarget)) o.current?.focus()
          }}
        >
          {ds.map((n) => (
            <K.RadioItem key={n.id} value={n.id}>
              {n.id === CHUA_GIAO ? (
                <UserCircle aria-hidden="true" />
              ) : (
                <Avatar size="sm" aria-hidden="true">
                  <AvatarFallback>{chuCaiDau(n.ten)}</AvatarFallback>
                </Avatar>
              )}
              {n.ten}
            </K.RadioItem>
          ))}
        </K.RadioGroup>
      ) : (
        <div className={menuLabel}>Không có ai khớp “{q}”</div>
      )}
    </>
  )
}

export function NoiDungMenu({
  loai,
  dich,
  sub,
  doiSub,
  quaPhim,
  xongPhim,
  doi,
}: {
  loai: 'nut' | 'chuot'
  dich: Ticket[]
  sub: Sub | null
  doiSub(id: Sub, mo: boolean): void
  quaPhim: boolean
  xongPhim(): void
  doi: Doi
}) {
  const K = KIT[loai]
  /** Giá trị chung của các dòng đích; lệch nhau → '' (không ✓ mục nào). */
  const chung = (f: (t: Ticket) => string | null) => (dich.every((t) => f(t) === f(dich[0])) ? (f(dich[0]) ?? CHUA_GIAO) : '')
  const con = { K, sub, doiSub, quaPhim, xongPhim }
  return (
    <>
      <K.Label>{dich.length > 1 ? `${dich.length} ticket` : dich[0].ma}</K.Label>
      <MucCon {...con} id="trang-thai" icon={<CircleHalf aria-hidden="true" />} ten="Trạng thái" phim="S">
        <K.RadioGroup value={chung((t) => t.trangThai)} onValueChange={(v) => doi.trangThai(v as TrangThai)}>
          {TRANG_THAI.map((x) => (
            <K.RadioItem key={x.id} value={x.id}>
              <x.Icon aria-hidden="true" weight={x.dam} className={x.mau} />
              {x.ten}
            </K.RadioItem>
          ))}
        </K.RadioGroup>
      </MucCon>
      <MucCon {...con} id="nguoi-lam" icon={<UserCircle aria-hidden="true" />} ten="Người làm" phim="A">
        <ChonNguoi K={K} value={chung((t) => t.nguoiLam)} onChon={(v) => doi.nguoiLam(v === CHUA_GIAO ? null : v)} />
      </MucCon>
      <MucCon {...con} id="uu-tien" icon={<CellSignalHigh aria-hidden="true" />} ten="Ưu tiên" phim="P">
        <K.RadioGroup value={chung((t) => t.uuTien)} onValueChange={(v) => doi.uuTien(v as UuTien)}>
          {UU_TIEN.map((x) => (
            <K.RadioItem key={x.id} value={x.id}>
              <x.Icon aria-hidden="true" weight={x.dam} className={x.mau} />
              {x.ten}
            </K.RadioItem>
          ))}
        </K.RadioGroup>
      </MucCon>
      <MucCon {...con} id="nhan" icon={<Tag aria-hidden="true" />} ten="Nhãn" phim="L">
        {NHAN.map((n) => {
          const co = dich.filter((t) => t.nhan.includes(n.id)).length
          return (
            <K.CheckboxItem
              key={n.id}
              checked={co === dich.length ? true : co ? 'indeterminate' : false}
              onCheckedChange={() => doi.nhan(n.id, co !== dich.length)}
              // Chọn nhiều: giữ menu mở khi tick (luật menu NGUON).
              onSelect={(e) => e.preventDefault()}
            >
              {/* Chấm 6 đặt trong ô 16 = cột icon của các mục khác. */}
              <span className="grid size-4 shrink-0 place-content-center border-none border-current">
                <BadgeDot color={n.color} />
              </span>
              {n.ten}
            </K.CheckboxItem>
          )
        })}
      </MucCon>
      <K.Separator />
      <K.Item onSelect={doi.han}>
        <CalendarBlank aria-hidden="true" />
        Đặt hạn…
        <KbdGroup className="ml-auto">
          <Kbd>⇧</Kbd>
          <Kbd>D</Kbd>
        </KbdGroup>
      </K.Item>
    </>
  )
}
