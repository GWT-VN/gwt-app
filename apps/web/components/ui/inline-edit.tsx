'use client'

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { ArrowLeft, CaretDown, CaretRight, PencilSimple, WarningCircle } from '@phosphor-icons/react/ssr'
import { isoNgay, ngayTuIso } from '@/bang/ngay'
import type { MucChon } from '@/bang/OChonGoiY'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from './avatar'
import { Badge, BadgeCaret, type badgeVariants } from './badge'
import { Calendar } from './calendar'
import { calendarPop } from './calendar-styles'
import { ComboboxPanel } from './combobox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { Input } from './input'
import {
  cat,
  chipPhu,
  khach,
  LY_DO_CHO,
  luuY,
  nguoi,
  oSua,
  oSuaChu,
  oSuaInput,
  oSuaMui,
  oSuaNhan,
  oSuaWrap,
  recordPickerKhung,
} from './inline-edit-styles'
import { menuCheck, menuContent } from './menu-styles'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { RecordPicker, type BanGhi } from './record-picker'
import { thongBao } from './sonner'
import { useMoBangChuot } from './use-mo-bang-chuot'
import type { VariantProps } from 'class-variance-authority'
import { hienNgay } from '@/lib/dinh-dang-ngay'


/**
 * InlineEdit — sửa tại chỗ trong dòng bảng/danh sách (README InlineEdit, chốt 18/11): bấm nội dung ô là sửa ngay.
 *
 * Chung mọi ô:
 * - Ô là `<button>` `aria-label="Sửa <trường> <mã>"`; giá trị đang có đọc qua `aria-describedby` (aria-label đè chữ bên
 *   trong nút). Nút mở menu/pop mang `aria-haspopup` + `aria-expanded` (Radix).
 * - Chặn nổi bọt lên dòng: bấm ô / mục menu (portal vẫn nổi bọt theo cây React) và Enter/Space không tới `onClick` /
 *   `onKeyDown` của dòng → không mở bản ghi.
 * - Lưu lạc quan: ô hiện giá trị mới ngay, gọi `onLuu(moi)`; xong → `thongBao.xong("<mã>: <trường> → <giá trị>")` có
 *   Hoàn tác (gọi `onLuu(cũ)`, ô về giá trị cũ); `onLuu` ném lỗi / reject → ô trả giá trị cũ + `thongBao.loi` có Thử lại.
 *   `value` từ ngoài đổi (dữ liệu tải lại) → ô theo `value` mới.
 * - Menu/pop: portal vùng DS (z 90), bám ô, thiếu chỗ thì lật (Radix Popper, chừa mép 8), không bị vùng cuộn ngang của
 *   bảng cắt; cuộn → pop bám theo ô (Radix autoUpdate). Esc / bấm ngoài đóng, focus về ô.
 */

type Luu<T> = (moi: T) => unknown

const bang = (a: unknown, b: unknown) => a === b || JSON.stringify(a) === JSON.stringify(b)
const chuLoi = (e: unknown) => (e instanceof Error && e.message ? e.message : 'lỗi không rõ')

/**
 * Giá trị đang hiện của ô + `luu(moi)` lạc quan. `xong(v)` = câu toast khi lưu xong; `truong` vào câu lỗi.
 * Đồng bộ `value` từ ngoài theo mẫu "giá trị trước đó" của React (không effect).
 */
const NhapCtx = createContext(false)
/**
 * Ô sửa trong HÀNG NHÁP (bản ghi chưa tạo — `DongThem`/`useDongMoi`, CEO 25/11): chọn = đổi giá trị cục bộ, chưa lưu gì
 * → không toast "đã lưu" + Hoàn tác. Bọc quanh các ô của hàng nháp.
 */
export function OSuaNhap({ children }: { children: ReactNode }) {
  return <NhapCtx.Provider value>{children}</NhapCtx.Provider>
}

function useLacQuan<T>(value: T, onLuu: Luu<T>, ma: string, truong: string, xong: (v: T) => string) {
  const nhap = useContext(NhapCtx)
  const [gt, setGt] = useState(value)
  const [goc, setGoc] = useState(value)
  if (!bang(value, goc)) {
    setGoc(value)
    setGt(value)
  }
  // `chu` = câu toast tính LÚC CHỌN (closure của lượt render đó) — `null` khi hoàn tác (không báo lại).
  async function ghi(moi: T, cu: T, chu: string | null): Promise<void> {
    setGt(moi)
    try {
      await onLuu(moi)
    } catch (e) {
      setGt(cu)
      thongBao.loi(`${ma}: chưa lưu được ${truong} — ${chuLoi(e)}`, { thuLai: () => void ghi(moi, cu, chu) })
      return
    }
    if (chu !== null && !nhap) thongBao.xong(chu, { hoanTac: () => ghi(cu, moi, null) })
  }
  return {
    gt,
    /** `chu` — câu toast khi bên gọi biết tên mà state chưa kịp có (vd mục vừa chọn từ `tim`); mặc định `xong(moi)`. */
    luu: (moi: T, chu?: string) => {
      if (!bang(moi, gt)) void ghi(moi, gt, chu ?? xong(moi))
    },
  }
}

/** Neo ô: chặn bấm + Enter/Space nổi lên dòng (kể cả từ menu/pop trong portal — React nổi bọt theo cây component). */
function NeoO({ children }: { children: ReactNode }) {
  return (
    <span
      data-slot="inline-edit"
      className={oSuaWrap}
      onClick={(e: MouseEvent) => e.stopPropagation()}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') e.stopPropagation()
      }}
    >
      {children}
    </span>
  )
}

/** Mục radio của menu ô = `DropdownMenuRadioItem` DS (✓ bên phải khi đang chọn — `.b-tick` 16 trong `.b-noi`). */
function MucRadio({
  value,
  children,
  phai,
  chip,
  onSelect,
}: {
  value: string
  children: ReactNode
  /** Thay ✓ bằng icon khác (vd ▸ của mục mở bước 2). */
  phai?: ReactNode
  /**
   * Nội dung là chip (Badge): dòng KHÔNG tô nền khi rê / phím đánh dấu — chính chip đậm lên (Badge soft
   * `in-data-highlighted`). CEO 26/11: "khi chọn trạng thái ko cần cho hover thế này mà phải hiện hover ở chip".
   * Không dấu ✓ (CEO 26/11 "thừa" — giá trị đang chọn đã hiện ngay trên ô mở menu); trình đọc màn hình vẫn có
   * `aria-checked` của mục radio.
   */
  chip?: boolean
  onSelect(e: Event): void
}) {
  return (
    <DropdownMenuRadioItem value={value} onSelect={onSelect} indicator={chip ? false : phai} className={cn(chip && 'data-highlighted:bg-transparent')}>
      {children}
    </DropdownMenuRadioItem>
  )
}

// ======================= Nhãn (ưu tiên, loại lỗi…) =======================

export type MucNhan<T extends string = string> = {
  gt: T
  /** Nhãn vẽ trong ô + menu — thường là `<Badge variant="soft">` (README: P1 solid danger · P2 warning · P3 mặc định · P4 outline). */
  nhan: ReactNode
  /** Chữ cho toast + trình đọc màn hình khi `nhan` không phải chuỗi. */
  chu?: string
}

const chuNhan = (m: { nhan: ReactNode; chu?: string } | undefined, gt: string) =>
  m?.chu ?? (typeof m?.nhan === 'string' ? m.nhan : gt)

/**
 * Ô nhãn: menu chọn (DropdownMenu + RadioGroup), không khung, không mũi tên ngoài; rê / mở → viền 2px alpha-08 trên
 * chính nhãn (nhãn viền: viền trong alpha-25 + nền alpha-04). `rong` → menu rộng tối thiểu 240 (`.b-noi-rong`).
 */
export function OSuaNhan<T extends string>({
  ma,
  truong,
  value,
  muc,
  onLuu,
  rong,
}: {
  ma: string
  truong: string
  value: T
  muc: readonly MucNhan<T>[]
  onLuu: Luu<T>
  rong?: boolean
}) {
  const tim = (v: string) => muc.find((m) => m.gt === v)
  const { gt, luu } = useLacQuan(value, onLuu, ma, truong, (v) => `${ma}: ${truong} → ${chuNhan(tim(v), v)}`)
  const id = useId()
  const dang = tim(gt)
  return (
    <NeoO>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" data-an-mui="" className={oSuaNhan} aria-label={`Sửa ${truong} ${ma}`} aria-describedby={id}>
            {/* display: contents → nhãn là "cháu" của nút trong DOM nhưng là con trong bố cục (viền rê vẽ trên nhãn). */}
            <span id={id} className="contents">
              {dang?.nhan ?? gt}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={cn(rong && 'min-w-[240px]')}>
          <DropdownMenuRadioGroup value={gt}>
            {muc.map((m) => (
              <MucRadio key={m.gt} value={m.gt} chip={typeof m.nhan !== 'string'} onSelect={() => luu(m.gt)}>
                {m.nhan}
              </MucRadio>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </NeoO>
  )
}

// ======================= Trạng thái =======================

type MauBadge = NonNullable<VariantProps<typeof badgeVariants>['color']>

export type MucTrangThai = {
  gt: string
  nhan: string
  /** Màu Badge soft theo nghĩa (mới discovery · đang xử lý info · chờ warning · đóng success…); bỏ = xám. */
  color?: MauBadge
  /** Chọn trạng thái này phải chọn thêm lý do (vd "Chờ"). */
  hoiLyDo?: boolean
}
export type GiaTriTrangThai = { tt: string; lyDo?: string }

/** Chip trạng thái: Badge soft theo màu; "· lý do" chữ 400 mờ 80%; `caret` → ▾ 10px bên trong (ô bấm được). */
export function ChipTrangThai({ muc, value, caret }: { muc?: MucTrangThai; value: GiaTriTrangThai; caret?: boolean }) {
  return (
    <Badge variant="soft" color={muc?.color ?? 'secondary'}>
      {muc?.nhan ?? value.tt}
      {/* Khoảng trắng đầu bị gộp mất trong flex (không hiện) nhưng giữ chữ "Chờ · KT" cho trình đọc màn hình. */}
      {value.lyDo && <span className={chipPhu}> · {value.lyDo}</span>}
      {caret && <BadgeCaret />}
    </Badge>
  )
}

/**
 * Ô trạng thái: DS Badge soft + ▾ bên trong (`BadgeCaret`), menu radio các trạng thái. Mục `hoiLyDo` (vd "Chờ") mở
 * bước 2 "Chờ vì…" ngay trong menu (khách · KT · vật tư · hãng · duyệt — `lyDo`); chỉ lưu khi đủ trạng thái + lý do.
 * Bước 2: "Quay lại" hoặc ← về bước 1.
 */
export function OSuaTrangThai({
  ma,
  value,
  muc,
  onLuu,
  lyDo = LY_DO_CHO,
  truong = 'trạng thái',
}: {
  ma: string
  value: GiaTriTrangThai
  muc: readonly MucTrangThai[]
  onLuu: Luu<GiaTriTrangThai>
  lyDo?: readonly string[]
  truong?: string
}) {
  const tim = (v: string) => muc.find((m) => m.gt === v)
  const { gt, luu } = useLacQuan(value, onLuu, ma, truong, (v) => `${ma} → ${tim(v.tt)?.nhan ?? v.tt}${v.lyDo ? ` ${v.lyDo}` : ''}`)
  const id = useId()
  // Bước 2: mã trạng thái đang hỏi lý do; null = bước 1.
  const [buoc2, setBuoc2] = useState<string | null>(null)
  const khungRef = useRef<HTMLDivElement>(null)
  const daDoi = useRef(false)
  // Đổi bước → mục cũ bị gỡ khỏi DOM, focus rơi ra ngoài menu → đưa vào bước mới: lý do đang chọn (APG), không có thì
  // lý do đầu; quay lại bước 1 → mục vừa rời.
  useEffect(() => {
    if (!daDoi.current) return
    daDoi.current = false
    const khung = khungRef.current
    const dich = buoc2
      ? (khung?.querySelector<HTMLElement>('[role="menuitemradio"][aria-checked="true"]') ??
        khung?.querySelector<HTMLElement>('[role="menuitemradio"]'))
      : khung?.querySelector('[data-hoi-ly-do]')?.closest<HTMLElement>('[role="menuitemradio"]')
    dich?.focus()
  }, [buoc2])
  const doiBuoc = (b: string | null) => {
    daDoi.current = true
    setBuoc2(b)
  }

  return (
    <NeoO>
      <DropdownMenu onOpenChange={(mo) => mo && setBuoc2(null)}>
        <DropdownMenuTrigger asChild>
          <button type="button" data-an-mui="" className={oSuaNhan} aria-label={`Sửa ${truong} ${ma}`} aria-describedby={id}>
            <span id={id} className="contents">
              <ChipTrangThai muc={tim(gt.tt)} value={gt} caret />
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          ref={khungRef}
          align="start"
         
          onKeyDown={(e) => {
            if (buoc2 && e.key === 'ArrowLeft') doiBuoc(null)
          }}
        >
          {buoc2 ? (
            <>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  doiBuoc(null)
                }}
              >
                <ArrowLeft aria-hidden="true" />
                Quay lại
              </DropdownMenuItem>
              <DropdownMenuLabel>{tim(buoc2)?.nhan ?? buoc2} vì…</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={gt.tt === buoc2 && gt.lyDo ? gt.lyDo : ''}>
                {lyDo.map((l) => (
                  <MucRadio key={l} value={l} onSelect={() => luu({ tt: buoc2, lyDo: l })}>
                    {tim(buoc2)?.nhan ?? buoc2} {l}
                  </MucRadio>
                ))}
              </DropdownMenuRadioGroup>
            </>
          ) : (
            <DropdownMenuRadioGroup value={gt.tt}>
              {muc.map((m) => (
                <MucRadio
                  key={m.gt}
                  value={m.gt}
                  chip
                  phai={
                    m.hoiLyDo ? (
                      <>
                        <span className="sr-only">(chọn lý do)</span>
                        <CaretRight aria-hidden="true" className={menuCheck} />
                      </>
                    ) : undefined
                  }
                  onSelect={(e) => {
                    if (!m.hoiLyDo) return luu({ tt: m.gt })
                    e.preventDefault()
                    doiBuoc(m.gt)
                  }}
                >
                  {/* data-hoi-ly-do: điểm focus khi quay lại từ bước 2. */}
                  <span data-hoi-ly-do={m.hoiLyDo || undefined} className="contents">
                    <ChipTrangThai muc={m} value={{ tt: m.gt, lyDo: m.gt === gt.tt ? gt.lyDo : undefined }} />
                  </span>
                </MucRadio>
              ))}
            </DropdownMenuRadioGroup>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </NeoO>
  )
}

// ======================= Chữ (việc tiếp theo…) =======================

/**
 * Ô chữ: bấm → ô nhập tại chỗ (cao 30, rộng ≥ 240). Enter lưu, Esc huỷ (focus về ô), rời ô thì lưu. Chữ cắt khoảng
 * trắng; rỗng hoặc không đổi = không lưu. Bộ gõ tiếng Việt đang ghép chữ: Enter thuộc bộ gõ, KHÔNG lưu.
 */
export function OSuaChu({
  ma,
  truong,
  value,
  onLuu,
  placeholder = '—',
}: {
  ma: string
  truong: string
  value: string
  onLuu: Luu<string>
  placeholder?: string
}) {
  const { gt, luu } = useLacQuan(value, onLuu, ma, truong, (v) => `${ma}: ${truong} → ${v}`)
  const id = useId()
  const [sua, setSua] = useState(false)
  const [nhap, setNhap] = useState('')
  const dangSua = useRef(false)
  const ghep = useRef(false)
  const traFocus = useRef(false)
  const nutRef = useRef<HTMLButtonElement>(null)
  useLayoutEffect(() => {
    if (!sua && traFocus.current) {
      traFocus.current = false
      nutRef.current?.focus()
    }
  }, [sua])
  // Gọi một lần cho mỗi lượt sửa (Enter rồi ô nhập bị gỡ có thể bắn thêm blur).
  const ket = (luuLai: boolean, focusVe: boolean) => {
    if (!dangSua.current) return
    dangSua.current = false
    traFocus.current = focusVe
    setSua(false)
    const t = nhap.trim()
    if (luuLai && t && t !== gt) luu(t)
  }
  const ten = `Sửa ${truong} ${ma}`

  return (
    <NeoO>
      {sua ? (
        <Input
          autoFocus
          aria-label={ten}
          value={nhap}
          className={oSuaInput}
          onChange={(e) => setNhap(e.target.value)}
          onCompositionStart={() => {
            ghep.current = true
          }}
          onCompositionEnd={() => {
            ghep.current = false
          }}
          onBlur={() => ket(true, false)}
          onKeyDown={(e) => {
            // Mọi phím trong ô nhập thuộc ô (Space, ↑↓ không tới dòng/bảng).
            e.stopPropagation()
            if (e.key === 'Enter') {
              if (e.nativeEvent.isComposing || e.keyCode === 229 || ghep.current) return
              e.preventDefault()
              ket(true, true)
            } else if (e.key === 'Escape') {
              e.preventDefault()
              ket(false, true)
            }
          }}
        />
      ) : (
        <button
          ref={nutRef}
          type="button"
          className={cn(oSua, oSuaChu)}
          aria-label={ten}
          aria-describedby={id}
          onClick={() => {
            dangSua.current = true
            setNhap(gt)
            setSua(true)
          }}
        >
          <span id={id} className={cn(cat, !gt && 'text-muted-foreground')}>
            {gt || placeholder}
          </span>
          <PencilSimple aria-hidden="true" className={oSuaMui} />
        </button>
      )}
    </NeoO>
  )
}

// ======================= Hạn (ngày giờ) =======================

/** "YYYY-MM-DD…" → "dd/MM HH:mm" (ngày = mặc định `hienNgay`, khác năm dd/MM/yy; giờ lấy nguyên văn — không đổi múi). */
function hienHan(v: string) {
  const gio = v.slice(10).match(/(\d{2}):(\d{2})/)
  return `${hienNgay(v.slice(0, 10))}${gio ? ` ${gio[1]}:${gio[2]}` : ''}`
}

/**
 * Ô hạn: bấm → lịch (Popover + Calendar, như DatePicker). Chọn ngày → lưu `YYYY-MM-DD` + NGUYÊN phần giờ cũ của
 * `value` (vd "2026-11-21 17:30" → "2026-11-25 17:30"; "…T08:00:00+07:00" giữ cả múi). `hien` = cách hiện trong ô
 * (mặc định "dd/MM HH:mm"; ô có màu trễ/hôm nay do bên gọi vẽ).
 */
export function OSuaHan({
  ma,
  value,
  onLuu,
  truong = 'hạn',
  hien = hienHan,
}: {
  ma: string
  /** ISO: "YYYY-MM-DD" + phần giờ tuỳ ý. */
  value: string
  onLuu: Luu<string>
  truong?: string
  hien?: (v: string) => ReactNode
}) {
  const { gt, luu } = useLacQuan(value, onLuu, ma, truong, (v) => `${ma}: ${truong} → ${hienHan(v)}`)
  const id = useId()
  const [mo, setMo] = useState(false)
  const chuot = useMoBangChuot()
  const ngay = gt.slice(0, 10)
  return (
    <NeoO>
      <Popover open={mo} onOpenChange={setMo}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={oSua}
            aria-label={`Sửa ${truong} ${ma}`}
            aria-describedby={id}
            onPointerDown={chuot.onPointerDown}
            onKeyDown={chuot.onKeyDown}
          >
            <span id={id} className="tabular-nums whitespace-nowrap">
              {hien(gt)}
            </span>
            <CaretDown aria-hidden="true" className={oSuaMui} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          aria-label="Chọn ngày"
         
          data-mo-chuot={chuot.chuot || undefined}
          className={cn(
            calendarPop,
            'data-mo-chuot:[&_:focus-visible]:[outline:none]! data-mo-chuot:[&_:focus-visible]:outline-offset-0!',
          )}
          onKeyDownCapture={chuot.onKeyDown}
        >
          <Calendar
            mode="single"
            required
            autoFocus
            selected={ngayTuIso(ngay)}
            defaultMonth={ngayTuIso(ngay)}
            onSelect={(d) => {
              luu(isoNgay(d) + gt.slice(10))
              setMo(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </NeoO>
  )
}

// ======================= Người (chủ, người làm) =======================

/** Chữ cái avatar: chữ đầu của 2 từ cuối ("Kiều Trang" → "KT"). */
const chuDau = (ten: string) =>
  ten
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()

/**
 * Ô người: Combobox có tìm (Popover + `ComboboxPanel` — danh sách > 10 bắt buộc gõ để tìm, CHUAN-FILTER): `options` lọc
 * tại chỗ (không dấu, mã + tên) hoặc `tim` gọi server (+ `mucDangChon` để ô hiện tên). Ô: avatar + tên, ▾ khi rê.
 * `gon` (cột hẹp < 112px — bên gọi quyết) → chỉ avatar, không mũi tên, viền rê trên avatar; tên vẫn đọc qua mô tả.
 */
export function OSuaNguoi({
  ma,
  truong,
  value,
  options,
  tim,
  mucDangChon,
  onLuu,
  gon,
  max,
  chuaGiao = 'Chưa giao',
  avatar: coAvatar = true,
  onTaoMoi,
}: {
  ma: string
  truong: string
  value: string | null
  options?: MucChon[]
  tim?: (q: string) => Promise<MucChon[]>
  mucDangChon?: MucChon
  onLuu: Luu<string | null>
  gon?: boolean
  max?: number
  chuaGiao?: string
  /** false = ô chọn chữ thường (không avatar) — `OSuaChon`. */
  avatar?: boolean
  /** Có → chân pop "＋ Thêm <truong> "…"": bên gọi tạo mục mới, trả mục đó → ô chọn luôn (lạc quan + Hoàn tác như chọn thường). */
  onTaoMoi?: (q: string) => Promise<MucChon>
}) {
  // Mọi mục đã chọn trong phiên (chế độ `tim`: không có danh sách ở client) — Hoàn tác / Thử lại về mục CŨ vẫn hiện tên.
  const [nho, setNho] = useState<ReadonlyMap<string, MucChon>>(() => new Map())
  const tenCua = (v: string | null) =>
    v === null
      ? chuaGiao
      : (options?.find((m) => m.gt === v) ?? (mucDangChon?.gt === v ? mucDangChon : nho.get(v)))?.nhan ?? v
  const cau = (ten: string) => `${ma}: ${truong} → ${ten}`
  const { gt, luu } = useLacQuan(value, onLuu, ma, truong, (v) => cau(tenCua(v)))
  const id = useId()
  const [mo, setMo] = useState(false)
  const ten = tenCua(gt)
  const avatar =
    gt === null || !coAvatar ? null : (
      <Avatar aria-hidden="true">
        <AvatarFallback>{chuDau(ten)}</AvatarFallback>
      </Avatar>
    )
  return (
    <NeoO>
      <Popover open={mo} onOpenChange={setMo}>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-gon={gon ? '' : undefined}
            className={gon ? oSuaNhan : oSua}
            aria-label={`Sửa ${truong} ${ma}`}
            aria-describedby={id}
          >
            {gon ? (
              <span id={id} className="contents">
                {avatar ?? <span className="text-muted-foreground">—</span>}
                <span className="sr-only">{ten}</span>
              </span>
            ) : (
              <>
                <span id={id} className={nguoi}>
                  {avatar}
                  <span className={cn(cat, gt === null && 'text-muted-foreground')}>{ten}</span>
                </span>
                <CaretDown aria-hidden="true" className={oSuaMui} />
              </>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          aria-label={`Chọn ${truong}`}
          // Pop của ô bảng bám ô nhưng cách mép màn ≥ 16 (luật lớp nổi, tu-kiem A — 8 bị phê "sát viền").
          collisionPadding={16}
          className={cn(
            menuContent,
            'w-auto min-w-[240px] max-w-[calc(100vw-16px)] max-h-(--radix-popover-content-available-height)',
          )}
        >
          <ComboboxPanel
            value={gt}
            options={options}
            tim={tim}
            max={max}
            searchPlaceholder="Gõ tên hoặc mã…"
            onSelect={(m) => {
              setNho((n) => new Map(n).set(m.gt, m))
              luu(m.gt, cau(m.nhan))
              setMo(false)
            }}
            loaiTao={truong}
            onTaoMoi={
              onTaoMoi &&
              (async (q) => {
                setMo(false)
                try {
                  const m = await onTaoMoi(q)
                  setNho((n) => new Map(n).set(m.gt, m))
                  luu(m.gt, cau(m.nhan))
                } catch (e) {
                  thongBao.loi(`${ma}: chưa thêm được ${truong} "${q}" — ${chuLoi(e)}`)
                }
              })
            }
          />
        </PopoverContent>
      </Popover>
    </NeoO>
  )
}

/**
 * Ô chọn MỘT giá trị chữ có tìm (loại ticket, loại lỗi, máy…): như `OSuaNguoi` nhưng không avatar — Popover +
 * `ComboboxPanel` (gõ để tìm, CHUAN-FILTER), lưu lạc quan + Hoàn tác / Thử lại. Thêm 26/11 (danh sách ticket F: bấm ô để
 * chọn giá trị, học hành vi Twenty).
 */
export function OSuaChon(props: Omit<Parameters<typeof OSuaNguoi>[0], 'avatar' | 'gon'>) {
  return <OSuaNguoi {...props} avatar={false} />
}

// ======================= Khách (RecordPicker) =======================

/**
 * Ô khách: tên (cắt …) + cờ lưu ý đỏ; bấm → pop `RecordPicker` 400px (đủ thông tin phân biệt khách trùng tên, SĐT
 * chỉ 4 số cuối). Chọn → lưu cả bản ghi (bên gọi cập nhật ticket + cờ lưu ý theo khách mới). `onTaoMoi(chữ đang gõ)`
 * → đóng pop rồi gọi (bên gọi mở form tạo khách). `children` = cách vẽ ô thay mặc định (vd thêm số lần hỏi lại).
 */
export function OSuaKhach({
  ma,
  value,
  muc,
  tim,
  onLuu,
  onTaoMoi,
  truong = 'khách',
  children,
}: {
  ma: string
  value: BanGhi | null
  muc?: BanGhi[]
  tim?: (q: string) => Promise<BanGhi[]>
  onLuu: Luu<BanGhi | null>
  onTaoMoi?: (q: string) => void
  truong?: string
  children?: ReactNode
}) {
  const { gt, luu } = useLacQuan(value, onLuu, ma, truong, (v) => `${ma}: ${truong} → ${v?.ten ?? '—'}`)
  const id = useId()
  const [mo, setMo] = useState(false)
  return (
    <NeoO>
      <Popover open={mo} onOpenChange={setMo}>
        <PopoverTrigger asChild>
          <button type="button" className={oSua} aria-label={`Sửa ${truong} ${ma}`} aria-describedby={id}>
            <span id={id} className={khach}>
              {children ?? (
                <>
                  <span className={cn(cat, !gt && 'text-muted-foreground')}>{gt?.ten ?? '—'}</span>
                  {gt?.luuY && (
                    <span role="img" aria-label="Khách có lưu ý" className={luuY}>
                      <WarningCircle weight="fill" aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </span>
            <CaretDown aria-hidden="true" className={oSuaMui} />
          </button>
        </PopoverTrigger>
        <PopoverContent aria-label={`Chọn ${truong}`} className={cn(menuContent, recordPickerKhung)}>
          <RecordPicker
            muc={muc}
            tim={tim}
            value={gt?.ma}
            loai={truong}
            onChon={(b) => {
              luu(b)
              setMo(false)
            }}
            onTaoMoi={
              onTaoMoi &&
              ((q) => {
                setMo(false)
                onTaoMoi(q)
              })
            }
          />
        </PopoverContent>
      </Popover>
    </NeoO>
  )
}
