'use client'

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type Ref,
} from 'react'
import { CaretDown } from '@phosphor-icons/react/ssr'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'
import {
  tabsContent,
  tabsCount,
  tabsKhung,
  tabsListPill,
  tabsListSegmented,
  tabsTriggerPill,
  tabsTriggerSegmented,
} from './tabs-styles'

/**
 * Tabs — khung shadcn (Radix Tabs), diện mạo `.ui-tabs-*` của ds/nguon/bundle.css. README: Tabs.
 * - Bàn phím WAI-ARIA Tabs do Radix lo: ←/→ chuyển + kích hoạt luôn (`activationMode="automatic"`), Home/End, bỏ qua
 *   tab tắt, chỉ tab đang chọn tabIndex 0 (RovingFocus: trước khi nhóm nhận focus thì rãnh `tablist` là điểm dừng Tab).
 * - `TabsList variant`: `segmented` (mặc định — chuyển khung trong thẻ/bảng nhỏ) · `pill` (hàng tab màn dữ liệu).
 * - Pill tràn: cuộn ngang, mờ mép phải 40px khi còn phần khuất. `thuGon`: tab không vừa gom vào nút "Thêm ▾"
 *   (DropdownMenu DS, chuẩn GitHub/Linear) — tab đang chọn luôn hiện; chọn từ menu → tab đó thành đang chọn, focus về nó.
 *   Nút "Thêm" đứng NGOÀI `tablist` (tablist chỉ chứa tab).
 * - Tab gắn URL (lọc trạng thái danh sách) → tham số chuẩn trong CHUAN-FILTER.md, điều khiển bằng `value`/`onValueChange`.
 */

type Kieu = 'segmented' | 'pill'
type NhanTab = { children: ReactNode; disabled?: boolean }

const GiaTri = createContext<{ value?: string; doi: (v: string) => void }>({ doi: () => {} })
const KieuTabs = createContext<{ variant: Kieu; an?: ReadonlySet<string>; nhan?: Map<string, NhanTab> }>({
  variant: 'segmented',
})

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  activationMode = 'automatic',
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>) {
  // Tự giữ giá trị (khi không điều khiển) để nút "Thêm" của TabsList chọn được tab đang ẩn.
  const [noi, setNoi] = useState(defaultValue)
  const v = value ?? noi
  const doi = useCallback(
    (x: string) => {
      if (value === undefined) setNoi(x)
      onValueChange?.(x)
    },
    [value, onValueChange],
  )
  return (
    <GiaTri.Provider value={{ value: v, doi }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        value={v}
        onValueChange={doi}
        activationMode={activationMode}
        className={cn('border-none border-current', className)}
        {...props}
      />
    </GiaTri.Provider>
  )
}

/**
 * Chỉ số tab phải ẩn khi thu gọn: vừa hết (kể cả khoảng cách) → không ẩn; không vừa → giữ tab đang chọn, rồi giữ lần lượt
 * từ đầu tới tab đầu tiên không vừa (chừa nút "Thêm" + một khoảng cách), ẩn từ đó về sau — thứ tự tab không xáo trộn.
 */
export function tinhThuGon({
  rong,
  cho,
  gap,
  rongThem,
  chon,
}: {
  rong: number[]
  cho: number
  gap: number
  rongThem: number
  chon: number
}): number[] {
  const tong = rong.reduce((a, b) => a + b, 0) + gap * Math.max(rong.length - 1, 0)
  if (tong <= cho) return []
  const tran = cho - rongThem - gap
  let dung = chon >= 0 ? rong[chon] : -gap
  const an: number[] = []
  for (let i = 0; i < rong.length; i++) {
    if (i === chon) continue
    if (an.length === 0 && dung + gap + rong[i] <= tran) dung += gap + rong[i]
    else an.push(i)
  }
  return an
}

const UOC_THEM = 88 // ước rộng nút "Thêm" lần đo đầu (nút còn ẩn, chưa đo được) — đo thật ngay vòng sau

export function TabsList({
  variant = 'segmented',
  thuGon = false,
  className,
  children,
  ...props
}: ComponentProps<typeof TabsPrimitive.List> & { variant?: Kieu; thuGon?: boolean }) {
  const list = (ref?: Ref<HTMLDivElement>) => (
    <TabsPrimitive.List
      ref={ref}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(variant === 'pill' ? tabsListPill : tabsListSegmented, className)}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  )
  if (variant !== 'pill') return <KieuTabs.Provider value={{ variant }}>{list()}</KieuTabs.Provider>
  return <HangPill thuGon={thuGon} list={list} />
}

function HangPill({ thuGon, list }: { thuGon: boolean; list: (ref: Ref<HTMLDivElement>) => ReactNode }) {
  const { value, doi } = useContext(GiaTri)
  const khung = useRef<HTMLDivElement>(null)
  const ds = useRef<HTMLDivElement>(null)
  const them = useRef<HTMLButtonElement>(null)
  const rong = useRef(new Map<string, number>())
  const rongThem = useRef(0)
  const nhan = useRef(new Map<string, NhanTab>())
  const canFocus = useRef<string | null>(null)
  const [an, setAn] = useState<string[]>([])
  const [tran, setTran] = useState(false)

  const do_ = useCallback(() => {
    const k = khung.current
    const l = ds.current
    if (!k || !l) return
    const tabs = [...l.querySelectorAll<HTMLElement>('[role="tab"]')]
    // Tab đang ẩn không đo được (display none) → giữ độ rộng lần cuối nó hiện.
    for (const t of tabs) if (!t.hidden) rong.current.set(t.dataset.value ?? '', t.offsetWidth)
    if (thuGon) {
      if (them.current && !them.current.hidden) rongThem.current = them.current.offsetWidth
      const ck = getComputedStyle(k)
      const cho = k.clientWidth - (parseFloat(ck.paddingLeft) || 0) - (parseFloat(ck.paddingRight) || 0)
      const gap = parseFloat(getComputedStyle(l).columnGap) || 0
      const gt = tabs.map((t) => t.dataset.value ?? '')
      const moi = tinhThuGon({
        rong: gt.map((x) => rong.current.get(x) ?? 0),
        cho,
        gap,
        rongThem: rongThem.current || UOC_THEM,
        chon: gt.indexOf(value ?? ''),
      }).map((i) => gt[i])
      setAn((cu) => (cu.length === moi.length && cu.every((x, i) => x === moi[i]) ? cu : moi))
    }
    setTran(k.scrollLeft + k.clientWidth < k.scrollWidth - 1)
  }, [thuGon, value])

  // Chạy lại sau mỗi lần render (đổi tab chọn, đổi tab ẩn, nút Thêm vừa hiện) — kết quả ổn định thì setState bỏ qua.
  useLayoutEffect(do_)
  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => do_())
    if (khung.current) ro.observe(khung.current)
    if (ds.current) ro.observe(ds.current)
    return () => ro.disconnect()
  }, [do_])

  const anSet = new Set(an)
  return (
    <KieuTabs.Provider value={{ variant: 'pill', an: anSet, nhan: nhan.current }}>
      <div ref={khung} data-slot="tabs-khung" data-tran={tran || undefined} onScroll={do_} className={tabsKhung}>
        {list(ds)}
        {thuGon && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button ref={them} type="button" data-slot="tabs-them" hidden={an.length === 0} className={tabsTriggerPill}>
                Thêm
                <CaretDown aria-hidden="true" className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onCloseAutoFocus={(e) => {
                if (!canFocus.current) return
                canFocus.current = null
                e.preventDefault()
                ds.current?.querySelector<HTMLElement>('[role="tab"][data-state="active"]')?.focus()
              }}
            >
              {an.map((x) => {
                const n = nhan.current.get(x)
                return (
                  <DropdownMenuItem
                    key={x}
                    disabled={n?.disabled}
                    onSelect={() => {
                      canFocus.current = x
                      doi(x)
                    }}
                  >
                    {n?.children}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </KieuTabs.Provider>
  )
}

export function TabsTrigger({
  className,
  value,
  disabled,
  children,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { variant, an, nhan } = useContext(KieuTabs)
  // Nhãn cho menu "Thêm" (tab đang ẩn vẫn mount, chỉ `hidden`).
  useLayoutEffect(() => {
    nhan?.set(value, { children, disabled })
  })
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-value={value}
      value={value}
      disabled={disabled}
      hidden={an?.has(value) || undefined}
      className={cn(variant === 'pill' ? tabsTriggerPill : tabsTriggerSegmented, className)}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
}

/** Số đếm trong tab — nằm trong nút nên đọc kèm nhãn ("Quá hạn 2"). `color="danger"` cho số cần chú ý. */
export function TabsCount({ color, className, ...props }: Omit<ComponentProps<'span'>, 'color'> & { color?: 'danger' }) {
  const { variant } = useContext(KieuTabs)
  return (
    <span
      data-slot="tabs-count"
      data-color={color}
      className={cn(tabsCount[variant], color === 'danger' ? tabsCount.danger : tabsCount.thuong[variant], className)}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn(tabsContent, className)} {...props} />
}
