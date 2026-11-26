'use client'

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, CalendarBlank, Check, Funnel, ListBullets, TextT, User, X } from '@phosphor-icons/react/ssr'
import {
  canGiaTri,
  laRong,
  nhanChip,
  PHEP,
  PHEP_MAC_DINH,
  TEN_PHEP,
  TOI,
  type DieuKienLoc,
  type KieuTruong,
  type PhepLoc,
} from '@/bang/locTruong'
import { boDau } from '@/bang/timkiem'
import { cn } from '@/lib/utils'
import { chipKhung, chipX } from './bang-styles'
import { Button } from './button'
import { Command, CommandInput, CommandItem, CommandList, CommandSeparator, useGanMucSang } from './command'
import * as cs from './command-styles'
import { cdDau } from './data-view-styles'
import { DatePicker } from './date-picker'
import { DateRangePicker } from './date-range-picker'
import { Input } from './input'
import { menuCheck, menuContent } from './menu-styles'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from './popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { TooltipNhanh } from './tooltip'

/**
 * Bộ lọc THEO TRƯỜNG — học hành vi Twenty (docs/rework/2026-11-26-f-hoc-hanh-vi-twenty.md mục D; chỉ hành vi, không chép
 * mã AGPL). Logic thuần (URL, áp lên dòng, nhãn chip) ở `bang/locTruong.ts`; file này chỉ là lớp DS ghép từ Popover +
 * Command + Select + DatePicker/DateRangePicker + Input + kiểu chip `.ui-chip` của FilterBar.
 *
 * - `NutLoc`: nút "Lọc" ở thanh công cụ → pop: ô "Tìm trường" (khớp không dấu) → chọn trường → trang sửa điều kiện (← về
 *   danh sách). Trường đã có điều kiện → mở lại đúng điều kiện đó, không tạo trùng.
 * - `ChipLoc`: một điều kiện = một chip trong ThanhDangLoc: bấm chữ chip → pop sửa (neo vào chip), × → gỡ (focus sang chip
 *   kế bên).
 * - Sửa điều kiện: Select phép theo kiểu (`PHEP`) · giá trị: chọn/người = danh sách có ô tìm, tick nhiều (người ghim "Tôi"
 *   đầu) · ngày = DatePicker / DateRangePicker · chữ = Input (Enter đóng). Giá trị đổi → áp NGAY (`onDoi`). Bỏ hết giá trị
 *   thì GIỮ điều kiện cũ tới lúc đóng (chip không biến mất dưới tay) — đóng / ← khi rỗng → gỡ (`onDoi(id, null)`).
 * - Phím: cmdk ↑/↓ + Enter (chọn trường / tick giá trị); Tab đi qua ← · Điều kiện · ô giá trị; Esc đóng (lớp lồng trong —
 *   Select, lịch — chỉ đóng lớp đó), focus về nút mở (Radix).
 * - Pop cách mép khung nhìn ≥ 16 (`collisionPadding`), rộng 280 (tối đa 100vw − 32).
 */

export type TruongLoc = {
  id: string
  ten: string
  kieu: KieuTruong
  /** Chọn/người: các giá trị (mã + nhãn). Người tự có "Tôi" ghim đầu (giá trị `TOI`). */
  tuyChon?: { giaTri: string; nhan: string }[]
}
type OnDoi = (truong: string, d: DieuKienLoc | null) => void

const ICON: Record<KieuTruong, ReactNode> = {
  chon: <ListBullets aria-hidden="true" />,
  nguoi: <User aria-hidden="true" />,
  ngay: <CalendarBlank aria-hidden="true" />,
  chu: <TextT aria-hidden="true" />,
}
const kv = 'border-none border-current'
const khungPop = cn(menuContent, 'w-[280px] max-w-[calc(100vw-32px)] max-h-(--radix-popover-content-available-height)')
const TU_FOCUS = '[data-tu-focus]'

const moi = (t: TruongLoc): DieuKienLoc => ({ truong: t.id, phep: PHEP_MAC_DINH[t.kieu], giaTri: [] })
const tenGiaTri = (t: TruongLoc) => (g: string) => t.tuyChon?.find((m) => m.giaTri === g)?.nhan ?? g

/** Danh sách có ô tìm (cmdk) — dùng cho danh sách trường và giá trị. Mục sáng tự giữ (lọc ngoài, như ThemCot). */
function DsTim({
  tenTim,
  tenDs,
  goiY,
  muc,
  onChon,
  tachSau,
  rong,
  bamMep,
}: {
  tenTim: string
  tenDs: string
  goiY: string
  muc: { gt: string; nhan: string; dau?: ReactNode; chon?: boolean }[]
  onChon: (gt: string) => void
  /** Vạch sau mục thứ i (mục ghim) — chỉ khi không gõ tìm. */
  tachSau?: number
  rong: string
  /** Ô tìm là hàng đầu pop → tràn mép trên (trongPopHangTim); nằm giữa pop → kẻ cả trên. */
  bamMep?: boolean
}) {
  const [go, setGo] = useState('')
  const [sang, setSang] = useState('')
  const goc = useRef<HTMLDivElement>(null)
  const tu = boDau(go.trim())
  const ds = tu ? muc.filter((m) => boDau(m.nhan).includes(tu)) : muc
  const sangThat = ds.some((m) => m.gt === sang) ? sang : (ds[0]?.gt ?? '')
  const nhieu = muc.some((m) => m.chon !== undefined)
  const ghiChu = !muc.length ? rong : !ds.length ? `Không có mục nào khớp "${go.trim()}"` : ''
  useGanMucSang(goc, sangThat)
  return (
    <Command
      ref={goc}
      value={sangThat}
      onValueChange={setSang}
      shouldFilter={false}
      vimBindings={false}
      label={tenTim}
      className={cs.trongPopGoc}
    >
      <CommandInput
        data-tu-focus=""
        value={go}
        onValueChange={setGo}
        placeholder={goiY}
        wrapperClassName={
          bamMep ? cs.trongPopHangTim : '-mx-(--menu-gutter) mb-(--menu-gutter) [border-top:1px_solid_var(--border)]'
        }
      />
      <div aria-live="polite" className={ghiChu ? cs.commandEmpty : kv}>
        {ghiChu}
      </div>
      <CommandList label={tenDs} className={cs.trongPopDs}>
        {ds.map((m, i) => (
          <Fragment key={m.gt}>
            <CommandItem value={m.gt} aria-checked={nhieu ? !!m.chon : undefined} onSelect={() => onChon(m.gt)}>
              {m.dau}
              <span className="min-w-0 truncate">{m.nhan}</span>
              {m.chon && <Check aria-hidden="true" className={menuCheck} />}
            </CommandItem>
            {!tu && i === tachSau && <CommandSeparator alwaysRender />}
          </Fragment>
        ))}
      </CommandList>
    </Command>
  )
}

/** Trang sửa một điều kiện: đầu (← + tên trường) · Select phép · ô giá trị theo kiểu. */
function SuaDieuKien({
  truong: t,
  nhap,
  onNhap,
  onXong,
  lui,
}: {
  truong: TruongLoc
  nhap: DieuKienLoc
  onNhap: (d: DieuKienLoc) => void
  onXong: () => void
  lui?: () => void
}) {
  const doiPhep = (p: PhepLoc) => {
    // Chọn/người/chữ giữ giá trị; ngày chỉ giữ khi cùng dạng một ngày (trước ↔ từ).
    const mot = (x: PhepLoc) => x === 'truoc' || x === 'sau'
    const giu = t.kieu !== 'ngay' || (mot(p) && mot(nhap.phep))
    onNhap({ ...nhap, phep: p, giaTri: canGiaTri(p) && giu ? nhap.giaTri : [] })
  }
  const ngay = (v: string | null) => onNhap({ ...nhap, giaTri: v ? [v] : [] })
  let giaTri: ReactNode = null
  if (!canGiaTri(nhap.phep)) giaTri = null
  else if (t.kieu === 'chon' || t.kieu === 'nguoi') {
    const muc = [...(t.kieu === 'nguoi' ? [{ giaTri: TOI, nhan: 'Tôi' }] : []), ...(t.tuyChon ?? [])]
    giaTri = (
      <DsTim
        tenTim={`Tìm ${t.ten}`}
        tenDs={`Giá trị ${t.ten}`}
        goiY="Tìm…"
        rong="Chưa có giá trị nào"
        tachSau={t.kieu === 'nguoi' ? 0 : undefined}
        muc={muc.map((m) => ({ gt: m.giaTri, nhan: m.nhan, chon: nhap.giaTri.includes(m.giaTri) }))}
        onChon={(g) =>
          onNhap({ ...nhap, giaTri: nhap.giaTri.includes(g) ? nhap.giaTri.filter((x) => x !== g) : [...nhap.giaTri, g] })
        }
      />
    )
  } else if (t.kieu === 'ngay')
    giaTri =
      nhap.phep === 'khoang' ? (
        <DateRangePicker
          aria-label="Khoảng ngày"
          value={nhap.giaTri.length === 2 ? { tu: nhap.giaTri[0], den: nhap.giaTri[1] } : null}
          onValueChange={(k) => onNhap({ ...nhap, giaTri: k ? [k.tu, k.den] : [] })}
        />
      ) : (
        <DatePicker aria-label="Ngày" value={nhap.giaTri[0] ?? null} onValueChange={ngay} />
      )
  else
    giaTri = (
      <Input
        data-tu-focus=""
        aria-label={`Giá trị lọc ${t.ten}`}
        placeholder="Nhập chữ…"
        value={nhap.giaTri[0] ?? ''}
        onChange={(e) => onNhap({ ...nhap, giaTri: [e.target.value] })}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
          e.preventDefault()
          onXong()
        }}
      />
    )
  return (
    <>
      <div className={cn(cdDau, !lui && 'pl-2')}>
        {lui && (
          <Button variant="ghost" size="icon-sm" aria-label="Quay lại" onClick={lui}>
            <ArrowLeft aria-hidden="true" />
          </Button>
        )}
        {t.ten}
      </div>
      <div className={cn(kv, 'flex flex-col gap-1.5 pb-(--menu-gutter)')}>
        <Select value={nhap.phep} onValueChange={(p) => doiPhep(p as PhepLoc)}>
          <SelectTrigger
            // Ngày / chọn không giá trị: Điều kiện là ô đầu tiên nhận focus.
            data-tu-focus={t.kieu === 'ngay' ? '' : undefined}
            aria-label={`Điều kiện lọc ${t.ten}`}
            className="w-full"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PHEP[t.kieu].map((p) => (
              <SelectItem key={p} value={p}>
                {TEN_PHEP[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {t.kieu === 'ngay' || t.kieu === 'chu' ? giaTri : null}
      </div>
      {t.kieu === 'chon' || t.kieu === 'nguoi' ? giaTri : null}
    </>
  )
}

/** Giữ bản nháp điều kiện đang sửa: áp ngay khi có giá trị; `dong()` gỡ nếu rỗng. */
function useNhap(dieuKien: DieuKienLoc[], onDoi: OnDoi) {
  const [nhap, setNhap] = useState<DieuKienLoc | null>(null)
  const doi = (d: DieuKienLoc) => {
    setNhap(d)
    if (!laRong(d)) onDoi(d.truong, d)
  }
  const dong = () => {
    if (nhap && laRong(nhap) && dieuKien.some((d) => d.truong === nhap.truong)) onDoi(nhap.truong, null)
    setNhap(null)
  }
  return { nhap, setNhap, doi, dong }
}

const focusTrong = (el: HTMLElement | null) => el?.querySelector<HTMLElement>(TU_FOCUS)?.focus()
/**
 * Chip `g` sắp bị gỡ → focus chip kế bên (sau, không có thì trước); hết chip → nút "Lọc" của trang (`data-slot="nut-loc"`,
 * nằm ở thanh công cụ, ngoài cây của chip nên phải tìm theo tài liệu). Gọi TRƯỚC khi gỡ (chip còn trong DOM).
 */
function focusKeBen(g: HTMLElement | null) {
  const ke = [g?.nextElementSibling, g?.previousElementSibling].find((e) => e?.matches('[data-slot="chip-loc"]'))
  ;(ke?.querySelector<HTMLElement>('button') ?? g?.ownerDocument.querySelector<HTMLElement>('[data-slot="nut-loc"]'))?.focus()
}

/** Nút "Lọc" (thanh công cụ DataViewToolbar, khe `loc`) + pop chọn trường → sửa điều kiện. */
export function NutLoc({ truong, dieuKien, onDoi }: { truong: TruongLoc[]; dieuKien: DieuKienLoc[]; onDoi: OnDoi }) {
  const [mo, setMo] = useState(false)
  const { nhap, setNhap, doi, dong } = useNhap(dieuKien, onDoi)
  const khung = useRef<HTMLDivElement>(null)
  const t = nhap && truong.find((x) => x.id === nhap.truong)
  // Đổi trang trong pop đang mở (danh sách ↔ sửa) → focus ô đầu của trang mới.
  useEffect(() => {
    if (mo) focusTrong(khung.current)
  }, [mo, nhap?.truong])
  const doiMo = (o: boolean) => {
    if (!o) dong()
    setMo(o)
  }
  return (
    <Popover open={mo} onOpenChange={doiMo}>
      {/* Cụm công cụ DataViewToolbar = nút icon ghost 32, icon 18 + tooltip (README) — y nút ⚙. */}
      <TooltipNhanh content="Lọc theo trường">
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Lọc" data-slot="nut-loc" className="[&_svg]:size-[18px]">
            <Funnel aria-hidden="true" />
          </Button>
        </PopoverTrigger>
      </TooltipNhanh>
      <PopoverContent
        ref={khung}
        aria-label="Lọc"
        data-slot="bo-loc-truong"
        align="end"
        collisionPadding={16}
        className={khungPop}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          focusTrong(khung.current)
        }}
      >
        {t && nhap ? (
          <SuaDieuKien
            truong={t}
            nhap={nhap}
            onNhap={doi}
            onXong={() => doiMo(false)}
            lui={() => {
              dong()
              setNhap(null)
            }}
          />
        ) : (
          <DsTim
            bamMep
            tenTim="Tìm trường"
            tenDs="Trường"
            goiY="Tìm trường"
            rong="Không có trường nào"
            muc={truong.map((x) => ({ gt: x.id, nhan: x.ten, dau: ICON[x.kieu] }))}
            onChon={(id) => {
              const x = truong.find((y) => y.id === id)!
              setNhap(dieuKien.find((d) => d.truong === id) ?? moi(x))
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}

/** Một điều kiện đang áp = một chip (`.ui-chip` có ×): bấm chữ → sửa; × → gỡ. Đặt trong ThanhDangLoc (`dieuKien[].chip`). */
export function ChipLoc({ truong: t, dieuKien: d, onDoi }: { truong: TruongLoc; dieuKien: DieuKienLoc; onDoi: OnDoi }) {
  const [mo, setMo] = useState(false)
  const { nhap, setNhap, doi, dong } = useNhap([d], onDoi)
  const goc = useRef<HTMLSpanElement>(null)
  const khung = useRef<HTMLDivElement>(null)
  const n = nhanChip(d, t.ten, tenGiaTri(t))
  // Đóng khi rỗng = chip sắp mất → không trả focus về chữ chip (Radix) mà sang chỗ còn lại (`focusKeBen`).
  const seGo = useRef(false)
  const doiMo = (o: boolean) => {
    if (o) setNhap(d)
    else {
      seGo.current = !!nhap && laRong(nhap)
      // Chuyển focus TRƯỚC khi gỡ (bên gọi có thể gỡ chip ngay trong `onDoi`, Popover mất luôn, không còn onCloseAutoFocus).
      if (seGo.current) focusKeBen(goc.current)
      dong()
    }
    setMo(o)
  }
  const go = () => {
    focusKeBen(goc.current)
    onDoi(t.id, null)
  }
  return (
    <Popover open={mo} onOpenChange={doiMo}>
      <PopoverAnchor asChild>
        <span ref={goc} data-slot="chip-loc" className={cn(chipKhung, 'pl-0 pr-1')}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Sửa lọc ${n.truoc} ${n.giaTri}`}
              className={cn(
                kv,
                'h-full min-w-0 truncate rounded-(--radius-full) bg-transparent pl-2.5 pr-0 text-inherit cursor-pointer',
                '[outline:none] focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-solid focus-visible:outline-(--ring)',
              )}
            >
              {n.truoc} <strong>{n.giaTri}</strong>
            </button>
          </PopoverTrigger>
          <button type="button" aria-label={`Bỏ lọc ${t.ten}`} className={chipX} onClick={go}>
            <X aria-hidden="true" />
          </button>
        </span>
      </PopoverAnchor>
      <PopoverContent
        ref={khung}
        aria-label={`Lọc ${t.ten}`}
        data-slot="bo-loc-truong"
        collisionPadding={16}
        className={khungPop}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          focusTrong(khung.current)
        }}
        onCloseAutoFocus={(e) => {
          if (!seGo.current) return
          seGo.current = false
          e.preventDefault()
        }}
      >
        {nhap && <SuaDieuKien truong={t} nhap={nhap} onNhap={doi} onXong={() => doiMo(false)} />}
      </PopoverContent>
    </Popover>
  )
}
