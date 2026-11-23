// Nguồn (khung `Sidebar*` cuối file): shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import type { VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { CaretRight, Funnel, GearSix, List, Plus, SidebarSimple, Sparkle, SquaresFour, X, type Icon } from '@phosphor-icons/react'
import { useIsMobile } from '@/hooks/use-mobile'
import { laMac } from '@/lib/phim-tat'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, chuCaiDau } from './avatar'
import { Button } from './button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuShortcut, DropdownMenuTrigger } from './dropdown-menu'
import { Input } from './input'
import { Separator } from './separator'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './sheet'
import * as s from './sidebar-styles'
import { Skeleton } from './skeleton'
import { Tooltip, TooltipContent, TooltipNhanh, TooltipProvider, TooltipTrigger } from './tooltip'

/**
 * Một khu (module) trên thanh icon. `gap` = có việc gấp (chấm đỏ). `sapCo` = chưa mở: chỉ hiện trong "Tất cả khu".
 * `day` = đặt ở ĐÁY thanh (vd Quản trị), không nằm trong "Tất cả khu".
 */
export type Khu = { id: string; ten: string; icon: Icon; mau: string; gap?: boolean; sapCo?: boolean; day?: boolean }
/**
 * Một mục menu của panel. `dangO` = màn đang mở (`aria-current="page"`). `con` = mục nhóm: bấm mở/đóng danh sách trang
 * con (khung `SidebarMenuSub`: thụt 14, vạch trái), tự mở khi có con `dangO`; mục nhóm không có `href`.
 */
export type MucMenu = { id: string; ten: string; href?: string; dem?: number; dangO?: boolean; icon?: Icon; con?: MucMenu[] }

type NguoiDung = { ten: string; phu?: string; menu?: ReactNode }

const GAN_DAY_HIEN = 5

/**
 * Phím Bắp: Ctrl+J (Windows/Linux) · ⌘J (Mac) — cùng luật nền tảng với phím mở lệnh của `lib/phim-tat.ts` (Mac không
 * nhận Ctrl; bộ gõ đang ghép chữ, kèm Alt/Shift → không). Ở đây vì `phim-tat.ts` thuộc CommandPalette (chỉ phím K).
 */
function laPhimBap(e: KeyboardEvent, mac: boolean) {
  if (e.isComposing || e.altKey || e.shiftKey || e.key.toLowerCase() !== 'j') return false
  return mac ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey
}

/**
 * Các KhungApp có Bắp đang mount, theo thứ tự mount. Chỉ cái mount SAU CÙNG phản hồi Ctrl/⌘J (app thật chỉ có một khung;
 * trang /ds có thể có nhiều bản demo → không bật hết cùng lúc). Gỡ khi unmount → cái trước đó nhận lại.
 */
const NGHE_BAP: symbol[] = []
const khongDangKy = () => () => {}

/**
 * KhungApp — khung điều hướng GWT App (Sidebar, phương án F; README `ds/nguon/components/Sidebar`): thanh icon khu 52px
 * + panel menu 288px của khu đang chọn + vùng nội dung + nút Bắp (dock). Giá trị ở `sidebar-styles.ts`.
 * - Đổ đầy phần tử cha (`h-full`): màn đặt nó trong khung cao toàn màn; trang /ds đặt trong hộp cao cố định.
 * - Khu và menu do màn quyết (theo phân quyền hiện có): `onChonKhu` → màn đổi `khuDangChon` + `menu`.
 * - Nội dung màn tự bọc `<main>` (khung không tự đặt landmark main — trang /ds đã có main).
 * - Tooltip tên khu bên PHẢI icon, hiện cả khi Tab tới (`TooltipNhanh`, cách icon 8px). Chữ tooltip trùng tên nút → `aria-hidden` (TenTip)
 *   (không đọc hai lần).
 * - ≤767px: thanh trên 52px có "Mở menu" → Sheet `side="left"` chứa thanh khu + panel — NGOẠI LỆ không SheetHeader:
 *   nút "Đóng menu" (SheetClose, `data-autofocus`) nằm trong đầu panel, tiêu đề hộp là `SheetTitle` sr-only "Menu <khu>"; Esc / "Đóng menu" / bấm link → đóng, focus
 *   về nút. Màn hình nở ra ≥768 khi đang mở → tự đóng.
 * - `bap`: nội dung thẻ Bắp (chưa chốt) — có thì hiện nút dock; Ctrl J (Mac ⌘J) bật tắt — nhiều khung thì chỉ khung mount sau cùng; Esc đóng, focus về nút.
 */
export function KhungApp({
  khu,
  khuDangChon,
  onChonKhu,
  menu,
  tao,
  boLocDaLuu,
  ganDay,
  congCu,
  quanTri,
  nguoiDung,
  bap,
  bapGoiY,
  children,
}: {
  khu: Khu[]
  khuDangChon: string
  onChonKhu: (id: string) => void
  menu: MucMenu[]
  /** Nút tạo nhanh đầu panel ("Tạo ticket"). */
  tao?: { ten: string; href: string }
  boLocDaLuu?: MucMenu[]
  ganDay?: MucMenu[]
  /** Nút đầu panel bên phải tên khu (chuông, tìm). */
  congCu?: ReactNode
  /** Đường dẫn màn Quản trị (icon đáy thanh). Cần cả menu Quản trị trong panel → dùng khu `day` thay vì prop này. */
  quanTri?: string
  /** Avatar đáy thanh. `menu` (các `DropdownMenuItem`, vd Đăng xuất) → avatar thành nút mở menu tài khoản; `phu` = dòng phụ (email). */
  nguoiDung?: NguoiDung
  bap?: ReactNode
  /** Số gợi ý Bắp chủ động đưa ra (chấm số trên nút dock). */
  bapGoiY?: number
  children?: ReactNode
}) {
  const [moMenu, setMoMenu] = useState(false)
  const [moBap, setMoBap] = useState(false)
  const k = khu.find((x) => x.id === khuDangChon)

  // Rộng cột trái → biến `--khung-trai-rong` trên gốc khung: thứ nổi giữa đáy (thanh hàng loạt) canh giữa VÙNG NỘI DUNG,
  // không đè sang menu. Đo thật (chỉ rail 52 / rail + panel 340) thay vì đoán theo class; ≤767 thanh tự về giữa màn.
  const gocRef = useRef<HTMLDivElement>(null)
  const traiRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const goc = gocRef.current
    const trai = traiRef.current
    if (!goc || !trai || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => goc.style.setProperty('--khung-trai-rong', `${trai.offsetWidth}px`))
    ro.observe(trai)
    return () => ro.disconnect()
  }, [moMenu])

  useEffect(() => {
    if (!moMenu) return
    const m = window.matchMedia?.('(min-width: 768px)')
    const f = () => m?.matches && setMoMenu(false)
    m?.addEventListener('change', f)
    return () => m?.removeEventListener('change', f)
  }, [moMenu])

  const coBap = bap !== undefined
  useEffect(() => {
    if (!coBap) return
    const toi = Symbol()
    NGHE_BAP.push(toi)
    const mac = laMac()
    const f = (e: KeyboardEvent) => {
      if (NGHE_BAP.at(-1) !== toi || !laPhimBap(e, mac)) return
      e.preventDefault()
      setMoBap((v) => !v)
    }
    window.addEventListener('keydown', f)
    return () => {
      window.removeEventListener('keydown', f)
      NGHE_BAP.splice(NGHE_BAP.indexOf(toi), 1)
    }
  }, [coBap])

  const trai = (trongNgan: boolean) => (
    <Trai
      {...{ khu, khuDangChon, onChonKhu, menu, tao, boLocDaLuu, ganDay, congCu, quanTri, nguoiDung }}
      trongNgan={trongNgan}
      dongNgan={() => setMoMenu(false)}
    />
  )

  return (
    <div ref={gocRef} data-slot="khung-app" className={s.khung}>
      {moMenu ? (
        <Sheet open onOpenChange={setMoMenu}>
          <SheetContent side="left" showCloseButton={false} aria-describedby={undefined} className={s.nganKeo}>
            <SheetTitle className="sr-only">Menu {k?.ten}</SheetTitle>
            {trai(true)}
          </SheetContent>
        </Sheet>
      ) : (
        <div ref={traiRef} data-slot="khung-trai" className={s.trai}>
          {trai(false)}
        </div>
      )}
      <div data-slot="khung-main" className={s.main}>
        <div data-slot="khung-top" className={s.top}>
          <Button
            variant="ghost"
            size="icon-sm"
            shape="rounded"
            aria-label="Mở menu"
            aria-haspopup="dialog"
            aria-expanded={moMenu}
            onClick={() => setMoMenu(true)}
          >
            <List aria-hidden="true" />
          </Button>
          <span className="font-semibold">{k?.ten}</span>
        </div>
        <div data-slot="khung-noi-dung" className={s.noiDung}>
          {children}
        </div>
      </div>
      {coBap && <Bap mo={moBap} setMo={setMoBap} goiY={bapGoiY} noiDung={bap} />}
    </div>
  )
}

function Trai({
  khu,
  khuDangChon,
  onChonKhu,
  menu,
  tao,
  boLocDaLuu,
  ganDay,
  congCu,
  quanTri,
  nguoiDung,
  trongNgan,
  dongNgan,
}: {
  khu: Khu[]
  khuDangChon: string
  onChonKhu: (id: string) => void
  menu: MucMenu[]
  tao?: { ten: string; href: string }
  boLocDaLuu?: MucMenu[]
  ganDay?: MucMenu[]
  congCu?: ReactNode
  quanTri?: string
  nguoiDung?: NguoiDung
  trongNgan: boolean
  dongNgan: () => void
}) {
  const [xemThem, setXemThem] = useState(false)
  const idLoc = useId()
  const idGan = useId()
  const k = khu.find((x) => x.id === khuDangChon)
  const ganHien = xemThem ? ganDay : ganDay?.slice(0, GAN_DAY_HIEN)
  const nutKhu = (x: Khu) => {
    const dang = x.id === khuDangChon
    const I = x.icon
    return (
      <TooltipNhanh key={x.id} content={<TenTip ten={x.ten} />} side="right" sideOffset={8}>
        <button
          type="button"
          data-slot="khu-icon"
          data-khu={x.id}
          className={s.iconKhu}
          aria-label={x.gap ? `${x.ten}, có việc gấp` : x.ten}
          aria-current={dang ? 'true' : undefined}
          onClick={() => onChonKhu(x.id)}
        >
          <I aria-hidden="true" weight={dang ? 'fill' : 'regular'} />
          {x.gap && <span data-slot="khu-gap" className={s.chamGap} />}
        </button>
      </TooltipNhanh>
    )
  }
  return (
    <>
      <nav aria-label="Khu" data-slot="khung-rail" className={s.rail}>
        <span aria-hidden="true" data-slot="khung-logo" className={s.logo}>
          GWT
        </span>
        {khu.filter((x) => !x.sapCo && !x.day).map(nutKhu)}
        <div data-slot="khung-ngan" className={s.ngan} />
        <DropdownMenu>
          <TooltipNhanh content={<TenTip ten="Tất cả khu" />} side="right" sideOffset={8}>
            <DropdownMenuTrigger asChild>
              <button type="button" data-slot="khu-tat-ca" className={s.iconKhu} aria-label="Tất cả khu">
                <SquaresFour aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
          </TooltipNhanh>
          {/* `.pD-launcher`: bên phải thanh, cách 8, mép trên thẳng nút, rộng tối thiểu 220. */}
          <DropdownMenuContent side="right" align="start" sideOffset={8} className="min-w-55">
            <DropdownMenuLabel>Tất cả khu</DropdownMenuLabel>
            {khu.filter((x) => !x.day).map((x) => (
              <DropdownMenuItem key={x.id} data-khu={x.id} disabled={x.sapCo} onSelect={() => onChonKhu(x.id)}>
                <span
                  aria-hidden="true"
                  data-slot="khu-cham"
                  className={s.cham}
                  style={{ background: x.sapCo ? 'var(--gray-250)' : x.mau }}
                />
                {x.ten}{' '}
                {x.sapCo && <DropdownMenuShortcut>sắp có</DropdownMenuShortcut>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="flex-1" />
        {khu.filter((x) => x.day && !x.sapCo).map(nutKhu)}
        {quanTri && (
          <TooltipNhanh content={<TenTip ten="Quản trị" />} side="right" sideOffset={8}>
            <Link href={quanTri} data-slot="khu-quan-tri" className={s.iconKhu} aria-label="Quản trị">
              <GearSix aria-hidden="true" />
            </Link>
          </TooltipNhanh>
        )}
        {nguoiDung && !nguoiDung.menu && (
          <Avatar data-slot="khung-avatar" role="img" aria-label={nguoiDung.ten} title={nguoiDung.ten} className={s.avatar}>
            <AvatarFallback>{chuCaiDau(nguoiDung.ten)}</AvatarFallback>
          </Avatar>
        )}
        {nguoiDung?.menu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" data-slot="khung-tai-khoan" className={s.nutTaiKhoan} aria-label={`Tài khoản ${nguoiDung.ten}`}>
                <Avatar data-slot="khung-avatar" aria-hidden="true" className={cn(s.avatar, 'mt-0')}>
                  <AvatarFallback>{chuCaiDau(nguoiDung.ten)}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" sideOffset={8} className="min-w-55">
              <DropdownMenuLabel className="flex flex-col">
                <span className="truncate">{nguoiDung.ten}</span>
                {nguoiDung.phu && <span className={s.taiKhoanPhu}>{nguoiDung.phu}</span>}
              </DropdownMenuLabel>
              {nguoiDung.menu}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>

      <nav
        aria-label={`Menu ${k?.ten ?? ''}`}
        data-slot="khung-panel"
        className={s.panel}
        onClick={trongNgan ? (e) => (e.target as Element).closest('a') && dongNgan() : undefined}
      >
        <div data-slot="khung-dau" className={s.dau}>
          <h2 data-slot="khung-tieu-de" className={s.tieuDe}>
            <span aria-hidden="true" data-slot="khung-cham" className={s.cham} style={{ background: k?.mau }} />
            <span className="truncate">{k?.ten}</span>
          </h2>
          <span className="flex-1" />
          {congCu}
          {trongNgan && (
            <SheetClose asChild>
              <Button variant="ghost" size="icon-sm" shape="rounded" aria-label="Đóng menu" data-autofocus="">
                <X aria-hidden="true" />
              </Button>
            </SheetClose>
          )}
        </div>
        <div data-slot="khung-cuon" className={s.cuon}>
          {tao && (
            <Link href={tao.href} data-slot="khung-tao" className={s.item}>
              <Plus aria-hidden="true" />
              {tao.ten}
            </Link>
          )}
          <div data-nhom="">
            {menu.map((m) => (m.con ? <MucNhom key={m.id} m={m} /> : <Muc key={m.id} m={m} />))}
          </div>
          {!!boLocDaLuu?.length && (
            <div data-nhom="" role="group" aria-labelledby={idLoc}>
              <div id={idLoc} data-slot="khung-nhan" className={s.nhan}>
                Bộ lọc đã lưu
              </div>
              {boLocDaLuu.map((m) => (
                <Muc key={m.id} m={{ icon: Funnel, ...m }} />
              ))}
            </div>
          )}
          {!!ganDay?.length && (
            <div data-nhom="" role="group" aria-labelledby={idGan}>
              <div id={idGan} className={s.nhan}>
                Gần đây
              </div>
              {ganHien?.map((m) => (
                <Muc key={m.id} m={m} ganDay />
              ))}
              {ganDay.length > GAN_DAY_HIEN && (
                <button type="button" data-slot="khung-xem-them" className={s.xemThem} aria-expanded={xemThem} onClick={() => setXemThem((v) => !v)}>
                  {xemThem ? 'Thu gọn' : 'Xem thêm'}
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  )
}

/**
 * Chữ tooltip = đúng tên nút (README: tooltip tên khu). Radix nối tooltip vào `aria-describedby` của nút → trình đọc màn
 * hình đọc tên hai lần. `aria-hidden` trên chữ: phần mô tả tính ra rỗng (nút được tham chiếu, con ẩn thì bỏ), chữ vẫn hiện.
 */
function TenTip({ ten }: { ten: string }) {
  return <span aria-hidden="true">{ten}</span>
}

function Muc({ m, ganDay }: { m: MucMenu; ganDay?: boolean }) {
  const I = m.icon
  return (
    <Link
      href={m.href ?? '#'}
      data-slot="khung-muc"
      data-muc={m.id}
      className={s.item}
      aria-current={m.dangO ? 'page' : undefined}
    >
      {I && <I aria-hidden="true" />}
      {ganDay ? <span className={s.cat}>{m.ten}</span> : m.ten}
      {m.dem !== undefined && <span data-slot="khung-dem" className={s.so}>{m.dem}</span>}
    </Link>
  )
}

/**
 * Mục nhóm (`MucMenu.con`): nút mở/đóng (`aria-expanded`, mũi tên xoay 90°) + danh sách con kiểu `SidebarMenuSub`. Mở sẵn khi
 * một con đang ở; sang con khác trong nhóm vẫn giữ mở. Đóng = gỡ hẳn danh sách (Tab không lọt vào link ẩn).
 */
function MucNhom({ m }: { m: MucMenu }) {
  const id = useId()
  const coDangO = !!m.con?.some((c) => c.dangO)
  const [mo, setMo] = useState(coDangO)
  // Vừa đi vào một trang con → mở nhóm (chỉnh state lúc render theo giá trị trước, không qua effect).
  const [dangOTruoc, setDangOTruoc] = useState(coDangO)
  if (coDangO !== dangOTruoc) {
    setDangOTruoc(coDangO)
    if (coDangO) setMo(true)
  }
  const I = m.icon
  return (
    <div data-slot="khung-nhom-muc" data-muc={m.id}>
      <button
        type="button"
        data-slot="khung-muc-nhom"
        className={s.item}
        aria-expanded={mo}
        aria-controls={mo ? id : undefined}
        onClick={() => setMo((v) => !v)}
      >
        {I && <I aria-hidden="true" />}
        <span className={s.cat}>{m.ten}</span>
        <CaretRight aria-hidden="true" data-mo={mo || undefined} className={s.muiNhom} />
      </button>
      {mo && (
        <ul id={id} data-slot="khung-muc-con" className={s.scMenuSub}>
          {m.con?.map((c) => (
            <li key={c.id} className={s.scMenuSubItem}>
              <Muc m={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Bap({ mo, setMo, goiY, noiDung }: { mo: boolean; setMo: (v: boolean) => void; goiY?: number; noiDung: ReactNode }) {
  // Chữ phím theo nền tảng (như CommandPalette): server + lần hydrate đầu là Ctrl J, Mac đổi sang ⌘J sau hydrate.
  const phim = useSyncExternalStore(khongDangKy, () => laMac(), () => false) ? '⌘J' : 'Ctrl J'
  const nut = useRef<HTMLButtonElement>(null)
  const the = useRef<HTMLDivElement>(null)
  const id = useId()
  const dong = () => {
    setMo(false)
    nut.current?.focus()
  }
  useEffect(() => {
    if (mo) the.current?.focus()
  }, [mo])
  return (
    <>
      {mo && (
        <div
          ref={the}
          id={id}
          role="dialog"
          aria-label="Bắp"
          tabIndex={-1}
          data-slot="khung-bap"
          className={s.theBap}
          onKeyDown={(e) => {
            if (e.key !== 'Escape') return
            e.stopPropagation()
            dong()
          }}
        >
          <div className={s.theBapDau}>
            <Sparkle aria-hidden="true" className="size-4 shrink-0" />
            <span className="font-semibold">Bắp</span>
            <span className="text-[12px] leading-[18px] text-muted-foreground">trợ lý trong app · {phim}</span>
            <span className="flex-1" />
            <Button variant="ghost" size="icon-sm" shape="rounded" aria-label="Đóng Bắp" onClick={dong}>
              <X aria-hidden="true" />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{noiDung}</div>
        </div>
      )}
      <button
        ref={nut}
        type="button"
        data-slot="khung-dock"
        className={s.dock}
        aria-label={mo ? 'Đóng Bắp' : `Mở Bắp (${phim})${goiY ? ` — ${goiY} gợi ý` : ''}`}
        title={`Bắp (${phim})`}
        aria-expanded={mo}
        aria-controls={mo ? id : undefined}
        onClick={() => setMo(!mo)}
      >
        {mo ? <X aria-hidden="true" /> : <Sparkle aria-hidden="true" />}
        {!mo && !!goiY && (
          <span aria-hidden="true" data-slot="khung-dock-so" className={s.dockSo}>
            {goiY}
          </span>
        )}
      </button>
    </>
  )
}

/*
 * ───────── Khung shadcn `Sidebar*` (24 phần + `useSidebar`) ─────────
 * Chép new-york-v4, đổi: `cn` của DS, icon Phosphor, chữ tiếng Việt, class/token ở `sidebar-styles.ts` (khối
 * `.ui-sidebar*` của bundle.css), z theo thang NGUON (khung 45, rail 46). Giữ hành vi shadcn: cookie `sidebar_state`,
 * phím Ctrl/⌘B bật tắt, ≤767px thành Sheet trái (`showCloseButton={false}` thay `[&>button]:hidden`), thu icon có tooltip
 * cạnh phải cách 8 (như tip thanh bên KhungApp). Lệch có chủ đích:
 * - `SidebarMenuSkeleton` rộng theo `useId` (shadcn `Math.random` trong render → lệch SSR/hydrate, lint React Compiler).
 * - Phím Ctrl/⌘B bỏ qua khi đang gõ chữ ghép (`isComposing`) hoặc kèm Alt/Shift (như phím Bắp).
 * KhungApp (phương án F) chưa dựng lại trên khung này — rail + panel + dock là bố cục riêng của GWT.
 */

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

type SidebarContextProps = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }
  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: ComponentProps<'div'> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = useState(false)

  // Trạng thái nội bộ; `open`/`onOpenChange` để điều khiển từ ngoài.
  const [_open, _setOpen] = useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }
      // Cookie giữ trạng thái thanh bên giữa các lần tải trang.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open],
  )

  const toggleSidebar = useCallback(() => {
    return isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o)
  }, [isMobile, setOpen, setOpenMobile])

  // Phím tắt Ctrl/⌘B bật tắt thanh bên.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || event.altKey || event.shiftKey) return
      if (event.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  // `data-state="expanded" | "collapsed"` để class Tailwind bám vào.
  const state = open ? 'expanded' : 'collapsed'

  const contextValue = useMemo<SidebarContextProps>(
    () => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={{ '--sidebar-width': SIDEBAR_WIDTH, '--sidebar-width-icon': SIDEBAR_WIDTH_ICON, ...style } as CSSProperties}
          className={cn(s.scWrapper, className)}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  children,
  ...props
}: ComponentProps<'div'> & {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === 'none') {
    return (
      <div data-slot="sidebar" className={cn(s.scTinh, className)} {...props}>
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          showCloseButton={false}
          className={s.scNgan}
          style={{ '--sidebar-width': SIDEBAR_WIDTH_MOBILE } as CSSProperties}
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Thanh bên</SheetTitle>
            <SheetDescription>Menu điều hướng trên điện thoại.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col border-none border-current">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  const noi = variant === 'floating' || variant === 'inset'
  return (
    <div
      className={s.scGoc}
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* Chỗ trống giữ bề ngang thanh bên trên máy tính. */}
      <div data-slot="sidebar-gap" className={cn(s.scGap, noi ? s.scGapNoi : s.scGapThuong)} />
      <div
        data-slot="sidebar-container"
        className={cn(s.scKhung, side === 'left' ? s.scKhungTrai : s.scKhungPhai, noi ? s.scKhungNoi : s.scKhungThuong, className)}
        {...props}
      >
        <div data-sidebar="sidebar" data-slot="sidebar-inner" className={s.scTrong}>
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({ className, onClick, ...props }: ComponentProps<typeof Button>) {
  const { isMobile, open, openMobile, toggleSidebar } = useSidebar()
  return (
    <Button
      aria-expanded={isMobile ? openMobile : open}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={className}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <SidebarSimple aria-hidden="true" />
      <span className="sr-only">Thu / mở thanh bên</span>
    </Button>
  )
}

function SidebarRail({ className, ...props }: ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Thu / mở thanh bên"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Thu / mở thanh bên"
      className={cn(s.scRail, className)}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: ComponentProps<'main'>) {
  return <main data-slot="sidebar-inset" className={cn(s.scInset, className)} {...props} />
}

function SidebarInput({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn('h-(--control-size-md) w-full bg-background shadow-none', className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="sidebar-header" data-sidebar="header" className={cn(s.scHeader, className)} {...props} />
}

function SidebarFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="sidebar-footer" data-sidebar="footer" className={cn(s.scFooter, className)} {...props} />
}

function SidebarSeparator({ className, ...props }: ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn('mx-2 w-auto bg-(--sidebar-border)', className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="sidebar-content" data-sidebar="content" className={cn(s.scContent, className)} {...props} />
}

function SidebarGroup({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="sidebar-group" data-sidebar="group" className={cn(s.scGroup, className)} {...props} />
}

function SidebarGroupLabel({ className, asChild = false, ...props }: ComponentProps<'div'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'div'
  return <Comp data-slot="sidebar-group-label" data-sidebar="group-label" className={cn(s.scGroupLabel, className)} {...props} />
}

function SidebarGroupAction({ className, asChild = false, ...props }: ComponentProps<'button'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp data-slot="sidebar-group-action" data-sidebar="group-action" className={cn(s.scGroupAction, className)} {...props} />
}

function SidebarGroupContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="sidebar-group-content" data-sidebar="group-content" className={cn(s.scGroupContent, className)} {...props} />
}

function SidebarMenu({ className, ...props }: ComponentProps<'ul'>) {
  return <ul data-slot="sidebar-menu" data-sidebar="menu" className={cn(s.scMenu, className)} {...props} />
}

function SidebarMenuItem({ className, ...props }: ComponentProps<'li'>) {
  return <li data-slot="sidebar-menu-item" data-sidebar="menu-item" className={cn(s.scMenuItem, className)} {...props} />
}

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  ...props
}: ComponentProps<'button'> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | ComponentProps<typeof TooltipContent>
} & VariantProps<typeof s.sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot.Root : 'button'
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(s.sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) return button
  const tip = typeof tooltip === 'string' ? { children: tooltip } : tooltip

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      {/* Tip thanh bên: cạnh phải, cách 8 (như tip icon khu của KhungApp); chỉ khi đang thu icon trên máy tính. */}
      <TooltipContent side="right" align="center" sideOffset={8} hidden={state !== 'collapsed' || isMobile} {...tip} />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: ComponentProps<'button'> & { asChild?: boolean; showOnHover?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(s.scMenuAction, showOnHover && s.scMenuActionHien, className)}
      {...props}
    />
  )
}

function SidebarMenuBadge({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="sidebar-menu-badge" data-sidebar="menu-badge" className={cn(s.scMenuBadge, className)} {...props} />
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: ComponentProps<'div'> & { showIcon?: boolean }) {
  // shadcn: rộng ngẫu nhiên 50–90%. Ở đây suy từ useId → ổn định giữa server và client.
  const id = useId()
  const width = `${50 + ([...id].reduce((t, c) => t + c.charCodeAt(0), 0) % 40)}%`
  return (
    <div data-slot="sidebar-menu-skeleton" data-sidebar="menu-skeleton" className={cn(s.scMenuSkeleton, className)} {...props}>
      {showIcon && <Skeleton className="size-4 rounded-(--radius-md)" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={{ '--skeleton-width': width } as CSSProperties}
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: ComponentProps<'ul'>) {
  return <ul data-slot="sidebar-menu-sub" data-sidebar="menu-sub" className={cn(s.scMenuSub, className)} {...props} />
}

function SidebarMenuSubItem({ className, ...props }: ComponentProps<'li'>) {
  return <li data-slot="sidebar-menu-sub-item" data-sidebar="menu-sub-item" className={cn(s.scMenuSubItem, className)} {...props} />
}

function SidebarMenuSubButton({
  asChild = false,
  size = 'md',
  isActive = false,
  className,
  ...props
}: ComponentProps<'a'> & { asChild?: boolean; size?: 'sm' | 'md'; isActive?: boolean }) {
  const Comp = asChild ? Slot.Root : 'a'
  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(s.scMenuSubButton, className)}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
