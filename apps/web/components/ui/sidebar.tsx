'use client'

import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import Link from 'next/link'
import { Funnel, GearSix, List, Plus, Sparkle, SquaresFour, X, type Icon } from '@phosphor-icons/react'
import { laMac } from '@/lib/phim-tat'
import { Avatar, AvatarFallback, chuCaiDau } from './avatar'
import { Button } from './button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuShortcut, DropdownMenuTrigger } from './dropdown-menu'
import { Sheet, SheetClose, SheetContent, SheetTitle } from './sheet'
import * as s from './sidebar-styles'
import { Tooltip } from './tooltip'

/** Một khu (module) trên thanh icon. `gap` = có việc gấp (chấm đỏ). `sapCo` = chưa mở: chỉ hiện trong "Tất cả khu". */
export type Khu = { id: string; ten: string; icon: Icon; mau: string; gap?: boolean; sapCo?: boolean }
/** Một mục menu của panel. `dangO` = màn đang mở (`aria-current="page"`). */
export type MucMenu = { id: string; ten: string; href: string; dem?: number; dangO?: boolean; icon?: Icon }

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
 * - Tooltip tên khu bên PHẢI icon, hiện cả khi Tab tới (DS Tooltip). Chữ tooltip trùng tên nút → `aria-hidden` (TenTip)
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
  /** Đường dẫn màn Quản trị (icon đáy thanh). */
  quanTri?: string
  nguoiDung?: { ten: string }
  bap?: ReactNode
  /** Số gợi ý Bắp chủ động đưa ra (chấm số trên nút dock). */
  bapGoiY?: number
  children?: ReactNode
}) {
  const [moMenu, setMoMenu] = useState(false)
  const [moBap, setMoBap] = useState(false)
  const k = khu.find((x) => x.id === khuDangChon)

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
    <div data-slot="khung-app" className={s.khung}>
      {moMenu ? (
        <Sheet open onOpenChange={setMoMenu}>
          <SheetContent side="left" aria-describedby={undefined} className={s.nganKeo}>
            <SheetTitle className="sr-only">Menu {k?.ten}</SheetTitle>
            {trai(true)}
          </SheetContent>
        </Sheet>
      ) : (
        <div data-slot="khung-trai" className={s.trai}>
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
  nguoiDung?: { ten: string }
  trongNgan: boolean
  dongNgan: () => void
}) {
  const [xemThem, setXemThem] = useState(false)
  const idLoc = useId()
  const idGan = useId()
  const k = khu.find((x) => x.id === khuDangChon)
  const ganHien = xemThem ? ganDay : ganDay?.slice(0, GAN_DAY_HIEN)
  return (
    <>
      <nav aria-label="Khu" data-slot="khung-rail" className={s.rail}>
        <span aria-hidden="true" data-slot="khung-logo" className={s.logo}>
          GWT
        </span>
        {khu
          .filter((x) => !x.sapCo)
          .map((x) => {
            const dang = x.id === khuDangChon
            const I = x.icon
            return (
              <Tooltip key={x.id} content={<TenTip ten={x.ten} />} side="right">
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
              </Tooltip>
            )
          })}
        <div data-slot="khung-ngan" className={s.ngan} />
        <DropdownMenu>
          <Tooltip content={<TenTip ten="Tất cả khu" />} side="right">
            <DropdownMenuTrigger asChild>
              <button type="button" data-slot="khu-tat-ca" className={s.iconKhu} aria-label="Tất cả khu">
                <SquaresFour aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
          </Tooltip>
          {/* `.pD-launcher`: bên phải thanh, cách 8, mép trên thẳng nút, rộng tối thiểu 220. */}
          <DropdownMenuContent side="right" align="start" sideOffset={8} className="min-w-55">
            <DropdownMenuLabel>Tất cả khu</DropdownMenuLabel>
            {khu.map((x) => (
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
        {quanTri && (
          <Tooltip content={<TenTip ten="Quản trị" />} side="right">
            <Link href={quanTri} data-slot="khu-quan-tri" className={s.iconKhu} aria-label="Quản trị">
              <GearSix aria-hidden="true" />
            </Link>
          </Tooltip>
        )}
        {nguoiDung && (
          <Avatar data-slot="khung-avatar" role="img" aria-label={nguoiDung.ten} title={nguoiDung.ten} className={s.avatar}>
            <AvatarFallback>{chuCaiDau(nguoiDung.ten)}</AvatarFallback>
          </Avatar>
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
            {menu.map((m) => (
              <Muc key={m.id} m={m} />
            ))}
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
      href={m.href}
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
