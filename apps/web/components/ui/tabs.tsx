// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
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
import { tinhThuGon } from '@/lib/tabs-thu-gon'
import { cn } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'
import {
  tabsContent,
  tabsCount,
  tabsKhung,
  tabsKhungLine,
  tabsListVariants,
  tabsRoot,
  tabsTriggerLine,
  tabsTriggerPill,
  tabsTriggerSegmented,
  tabsThemLine,
} from './tabs-styles'

/**
 * Tabs — khung shadcn (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `tabsListVariants`; Radix Tabs; `orientation`),
 * diện mạo `.ui-tabs-*` của ds/nguon/bundle.css. README: Tabs.
 * - Bàn phím WAI-ARIA Tabs do Radix lo: ←/→ chuyển + kích hoạt luôn (`activationMode="automatic"`), Home/End, bỏ qua
 *   tab tắt, chỉ tab đang chọn tabIndex 0 (RovingFocus: trước khi nhóm nhận focus thì rãnh `tablist` là điểm dừng Tab).
 * - `TabsList variant` (R19): giá trị shadcn `default` (mặc định — rãnh xám + thumb = segmented control của artifact,
 *   chuyển khung trong thẻ/bảng nhỏ) · `line` (vạch dưới, artifact chưa có). Phần GWT thêm: `segmented` (= `default`),
 *   `pill` (hàng tab màn dữ liệu), `thuGon`, `TabsCount`.
 * - Pill tràn: cuộn ngang, mờ mép phải 40px khi còn phần khuất. `thuGon`: tab không vừa gom vào nút "Thêm ▾"
 *   (DropdownMenu DS, chuẩn GitHub/Linear) — tab đang chọn luôn hiện; chọn từ menu → tab đó thành đang chọn, focus về nó
 *   (giá trị về trễ — URL qua router — thì focus tạm ở "Thêm", chuyển sang tab khi nó hiện).
 *   Nút "Thêm" đứng NGOÀI `tablist` (tablist chỉ chứa tab). `line` + `thuGon` (Xem nhanh, học Twenty "+4 More ▾"): cùng
 *   logic, nút ghi số tab đang ẩn "+N Thêm ▾", hàng không cuộn (thu gọn đã lo tràn).
 * - `cuoi` (pill/line thu gọn): nút đi SAU tab cuối (vd "+" thêm tab, "…" thao tác tab — Twenty "+ Add view" đứng ngay
 *   sau view cuối, CEO 27/11). Nằm ngoài `tablist`; bề rộng của nó trừ vào chỗ của tab khi tính thu gọn.
 * - Icon trước chữ: đặt `<Icon aria-hidden />` (Phosphor) làm con đầu của `TabsTrigger` — cỡ token icon md tự áp, tên tab
 *   chỉ là chữ; menu "Thêm" hiện cả icon.
 * - Tab gắn URL (lọc trạng thái danh sách) → tham số chuẩn trong CHUAN-FILTER.md, điều khiển bằng `value`/`onValueChange`.
 */

type Kieu = 'default' | 'line' | 'segmented' | 'pill'
/** Vẻ của tab/số đếm: `default` và `segmented` là một. */
type Ve = 'segmented' | 'line' | 'pill'
const veCua = (v: Kieu): Ve => (v === 'default' ? 'segmented' : v)
type NhanTab = { children: ReactNode; disabled?: boolean }

const GiaTri = createContext<{ value?: string; doi: (v: string) => void }>({ doi: () => {} })
const KieuTabs = createContext<{
  variant: Kieu
  an?: ReadonlySet<string>
  dangKy?: (value: string, n: NhanTab) => void
}>({
  variant: 'default',
})

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  activationMode = 'automatic',
  orientation = 'horizontal',
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
        data-orientation={orientation}
        orientation={orientation}
        className={cn(tabsRoot, className)}
        {...props}
      />
    </GiaTri.Provider>
  )
}

const UOC_THEM = 88 // ước rộng nút "Thêm" lần đo đầu (nút còn ẩn, chưa đo được) — đo thật ngay vòng sau

export function TabsList({
  variant = 'default',
  thuGon = false,
  cuoi,
  className,
  children,
  ...props
}: ComponentProps<typeof TabsPrimitive.List> & { variant?: Kieu; thuGon?: boolean; cuoi?: ReactNode }) {
  const list = (ref?: Ref<HTMLDivElement>) => (
    <TabsPrimitive.List
      ref={ref}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  )
  if (variant === 'pill') return <HangThuGon variant="pill" thuGon={thuGon} list={list} cuoi={cuoi} />
  if (variant === 'line' && thuGon) return <HangThuGon variant="line" thuGon list={list} cuoi={cuoi} />
  return <KieuTabs.Provider value={{ variant }}>{list()}</KieuTabs.Provider>
}

/** Hàng pill (cuộn ngang, tuỳ chọn thu gọn) hoặc hàng line thu gọn (không cuộn). */
function HangThuGon({
  variant,
  thuGon,
  list,
  cuoi,
}: {
  variant: 'pill' | 'line'
  thuGon: boolean
  list: (ref: Ref<HTMLDivElement>) => ReactNode
  cuoi?: ReactNode
}) {
  const line = variant === 'line'
  const { value, doi } = useContext(GiaTri)
  const khung = useRef<HTMLDivElement>(null)
  const ds = useRef<HTMLDivElement>(null)
  const them = useRef<HTMLButtonElement>(null)
  const cuoiRef = useRef<HTMLDivElement>(null)
  const rong = useRef(new Map<string, number>())
  const rongThem = useRef(0)
  // Nhãn mọi tab (TabsTrigger ghi trong layout effect). Menu "Thêm" KHÔNG đọc ref này lúc render (chậm một nhịp: số
  // đếm của tab ẩn đổi → menu vẫn số cũ) mà chụp lại thành state lúc menu MỞ — khi đó mọi trigger đã ghi xong.
  const nhan = useRef(new Map<string, NhanTab>())
  const dangKy = useCallback((x: string, n: NhanTab) => {
    nhan.current.set(x, n)
  }, [])
  const [nhanMenu, setNhanMenu] = useState<ReadonlyMap<string, NhanTab>>(() => new Map())
  const canFocus = useRef<string | null>(null)
  const choFocus = useRef<string | null>(null)
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
      const gap = parseFloat(getComputedStyle(l).columnGap) || 0
      // Khe `cuoi` (nút sau tab cuối) chiếm chỗ cố định — trừ trước khi chia cho tab.
      const rongCuoi = cuoiRef.current ? cuoiRef.current.offsetWidth + (parseFloat(ck.columnGap) || 0) : 0
      const cho = k.clientWidth - (parseFloat(ck.paddingLeft) || 0) - (parseFloat(ck.paddingRight) || 0) - rongCuoi
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
  // Tab vừa chọn từ menu "Thêm" nhận focus khi nó ĐÃ là tab đang chọn và đã hiện. Giá trị có thể về trễ (URL qua
  // router.replace) — lúc menu đóng tab đó còn ẩn → thử lại sau mỗi lần render tới khi được.
  const thuFocus = () => {
    const x = choFocus.current
    const el = x != null && x === value ? ds.current?.querySelector<HTMLElement>(`[role="tab"][data-value="${CSS.escape(x)}"]`) : null
    if (!el || el.hidden) return
    choFocus.current = null
    el.focus()
  }
  useLayoutEffect(thuFocus)
  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => do_())
    if (khung.current) ro.observe(khung.current)
    if (ds.current) ro.observe(ds.current)
    return () => ro.disconnect()
  }, [do_])

  const anSet = new Set(an)
  return (
    <KieuTabs.Provider value={{ variant, an: anSet, dangKy }}>
      <div
        ref={khung}
        data-slot="tabs-khung"
        data-tran={(!line && tran) || undefined}
        onScroll={line ? undefined : do_}
        className={line ? tabsKhungLine : tabsKhung}
      >
        {list(ds)}
        {thuGon && (
          <DropdownMenu onOpenChange={(mo) => mo && setNhanMenu(new Map(nhan.current))}>
            <DropdownMenuTrigger asChild>
              <button
                ref={them}
                type="button"
                data-slot="tabs-them"
                hidden={an.length === 0}
                className={line ? tabsThemLine : tabsTriggerPill}
              >
                {line && `+${an.length} `}Thêm
                <CaretDown aria-hidden="true" className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onCloseAutoFocus={(e) => {
                if (!canFocus.current) return
                choFocus.current = canFocus.current
                canFocus.current = null
                e.preventDefault()
                thuFocus()
                // Chưa được (giá trị chưa về): tạm đứng ở nút Thêm thay vì rơi về body.
                if (choFocus.current) them.current?.focus()
              }}
            >
              {an.map((x) => {
                const n = nhanMenu.get(x)
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
        {cuoi && (
          <div ref={cuoiRef} data-slot="tabs-cuoi" className="flex shrink-0 items-center gap-1 border-none border-current">
            {cuoi}
          </div>
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
  const { variant, an, dangKy } = useContext(KieuTabs)
  const ve = veCua(variant)
  // Nhãn cho menu "Thêm" (tab đang ẩn vẫn mount, chỉ `hidden`).
  useLayoutEffect(() => {
    dangKy?.(value, { children, disabled })
  })
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-value={value}
      value={value}
      disabled={disabled}
      hidden={an?.has(value) || undefined}
      className={cn(ve === 'pill' ? tabsTriggerPill : ve === 'line' ? tabsTriggerLine : tabsTriggerSegmented, className)}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
}

/** Số đếm trong tab — nằm trong nút nên đọc kèm nhãn ("Quá hạn 2"). `color="danger"` cho số cần chú ý. */
export function TabsCount({ color, className, ...props }: Omit<ComponentProps<'span'>, 'color'> & { color?: 'danger' }) {
  const ve = veCua(useContext(KieuTabs).variant)
  return (
    <span
      data-slot="tabs-count"
      data-color={color}
      className={cn(tabsCount[ve], color === 'danger' ? tabsCount.danger : tabsCount.thuong[ve], className)}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn(tabsContent, className)} {...props} />
}

export { tabsListVariants }
