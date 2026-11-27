'use client'

import { Fragment, useEffect, useImperativeHandle, useRef, useState, type ReactNode, type Ref, type RefCallback } from 'react'
import { ArrowLeft, CalendarBlank, Check, EyeSlash, SlidersHorizontal, ListBullets, TextT, User, X } from '@phosphor-icons/react/ssr'
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
import { menuCheck, menuContent, menuItem, menuLabel, menuSeparator } from './menu-styles'
import type { NgayCot } from './use-cot-bang'
import { KIEU_NGAY } from '@/lib/dinh-dang-ngay'
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
 * - Mở từ NGOÀI (menu tiêu đề cột "Lọc…", học Twenty): `useMoLoc()` → `mo(trường, neo)`. Trường đã có chip → mở chip đó;
 *   chưa có → pop của NutLoc mở thẳng trang sửa trường đó, neo vào `neo` (tiêu đề cột — Radix `virtualRef`; chip thì pop
 *   vẫn neo ở chip). Đóng → focus về `neo` (kể cả khi chip bị gỡ vì rỗng).
 */

export type TruongLoc = {
  id: string
  ten: string
  kieu: KieuTruong
  /** Chọn/người: các giá trị (mã + nhãn). Người tự có "Tôi" ghim đầu (giá trị `TOI`). */
  tuyChon?: { giaTri: string; nhan: string }[]
}
type OnDoi = (truong: string, d: DieuKienLoc | null) => void
/** Mở pop lọc của một trường từ ngoài; `neo` = nơi neo pop + nhận lại focus khi đóng (vd nút tiêu đề cột). */
/** Mở từ tiêu đề cột: thêm "Ẩn cột" ở cuối pop (CEO 27/11 "chỉ giữ lại action ẩn cột ở cuối cùng"). */
/** Phần thêm ở CHÂN pop lọc mở từ tiêu đề cột (menu cột cũ đã bỏ — CEO 27/11): Định dạng ngày (cột ngày) + Ẩn cột. */
export type PhuMoLoc = { anCot?: () => void; ngay?: NgayCot }
export type MoLocRef = { mo: (truong: string, neo?: HTMLElement | null, phu?: PhuMoLoc) => void }

/**
 * Nối nút "Lọc" + các chip với chỗ mở từ ngoài (menu tiêu đề cột): `<NutLoc ref={x.nut}>`, `<ChipLoc ref={x.chip(id)}>`,
 * rồi `x.mo(id, nútTiêuĐề)` — có chip của trường thì mở chip, không thì mở NutLoc ở trường đó.
 */
export function useMoLoc() {
  // Một object ổn định giữ nút + chip trong closure (không phải ref: React Compiler cấm truyền object chứa ref lúc render).
  const [x] = useState(() => {
    let nut: MoLocRef | null = null
    const chip = new Map<string, MoLocRef>()
    const cb = new Map<string, RefCallback<MoLocRef>>()
    return {
      nut: ((r) => {
        nut = r
      }) as RefCallback<MoLocRef>,
      chip: (id: string): RefCallback<MoLocRef> => {
        let f = cb.get(id)
        if (!f) {
          f = (r) => {
            if (r) chip.set(id, r)
            else chip.delete(id)
          }
          cb.set(id, f)
        }
        return f
      },
      mo: (id: string, neo?: HTMLElement | null, phu?: PhuMoLoc) => (chip.get(id) ?? nut)?.mo(id, neo, phu),
    }
  })
  return x
}

/** Neo ngoài của pop (mở từ tiêu đề cột): neo ảo Radix theo khung phần tử + trả focus về nó khi đóng. */
function useNeoNgoai() {
  const neo = useRef<HTMLElement | null>(null)
  const [co, setCo] = useState(false)
  return {
    neo,
    dat: (el?: HTMLElement | null) => {
      neo.current = el ?? null
      setCo(!!el)
    },
    /** Đặt trong PopoverContent: neo ảo khi đang mở từ ngoài. */
    anchor: co ? <PopoverAnchor virtualRef={neo} /> : null,
    /** onCloseAutoFocus: có neo ngoài → focus về đó (true = đã xử lý). */
    traFocus: (e: Event) => {
      const el = neo.current
      if (!el) return false
      e.preventDefault()
      neo.current = null
      setCo(false)
      el.focus()
      return true
    },
  }
}

const ICON: Record<KieuTruong, ReactNode> = {
  chon: <ListBullets aria-hidden="true" />,
  nguoi: <User aria-hidden="true" />,
  ngay: <CalendarBlank aria-hidden="true" />,
  chu: <TextT aria-hidden="true" />,
}
const kv = 'border-none border-current'
const khungPop = cn(menuContent, 'w-[280px] max-w-[calc(100vw-32px)] max-h-(--radix-popover-content-available-height)')
const TU_FOCUS = '[data-tu-focus]'

/**
 * Chân pop lọc mở từ tiêu đề cột (kiểu mục menu DS): cột ngày → nhóm "Định dạng ngày" (chọn một, có dấu ✓ — trước ở menu
 * cột, CEO 26/11) · vạch · "Ẩn cột". Bấm "Ẩn cột" đóng pop (`dong`); đổi định dạng giữ pop mở.
 */
function ChanCot({ phu, dong }: { phu?: PhuMoLoc; dong: () => void }) {
  // `phu` chụp lúc mở pop → giữ kiểu đang chọn tại chỗ để dấu ✓ theo kịp khi đổi.
  const [kieu, setKieu] = useState(phu?.ngay?.kieu)
  if (!phu?.anCot && !phu?.ngay) return null
  const { anCot, ngay } = phu
  const mucLop = cn(menuItem, 'hover:bg-(--menu-item-bg)')
  return (
    <>
      {ngay && (
        <>
          <div role="separator" className={menuSeparator} />
          <div role="group" aria-labelledby="chan-cot-ngay">
            <div id="chan-cot-ngay" className={menuLabel}>
              Định dạng ngày
            </div>
            {KIEU_NGAY.map((k) => (
              <button
                key={k.kieu}
                type="button"
                aria-pressed={kieu === k.kieu}
                className={mucLop}
                onClick={() => {
                  setKieu(k.kieu)
                  ngay.onDoi(k.kieu)
                }}
              >
                <CalendarBlank aria-hidden="true" />
                {k.nhan}
                {kieu === k.kieu && <Check aria-hidden="true" className={menuCheck} />}
              </button>
            ))}
          </div>
        </>
      )}
      {anCot && (
        <>
          <div role="separator" className={menuSeparator} />
          <button
            type="button"
            className={mucLop}
            onClick={() => {
              dong()
              anCot()
            }}
          >
            <EyeSlash aria-hidden="true" />
            Ẩn cột
          </button>
        </>
      )}
    </>
  )
}

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
  /** `giu`: bấm kèm Ctrl/⌘/Shift (hoặc Space/Enter kèm phím đó) — bên gọi giữ pop mở để chọn tiếp. */
  onChon: (gt: string, giu: boolean) => void
  /** Vạch sau mục thứ i (mục ghim) — chỉ khi không gõ tìm. */
  tachSau?: number
  rong: string
  /** Ô tìm là hàng đầu pop → tràn mép trên (trongPopHangTim); nằm giữa pop → kẻ cả trên. */
  bamMep?: boolean
}) {
  const [go, setGo] = useState('')
  const [sang, setSang] = useState('')
  const goc = useRef<HTMLDivElement>(null)
  // cmdk `onSelect` không kèm sự kiện → ghi phím bổ trợ lúc nhấn chuột/phím ngay trước đó.
  const phu = useRef(false)
  const ghiPhu = (e: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => {
    phu.current = e.ctrlKey || e.metaKey || e.shiftKey
  }
  const tu = boDau(go.trim())
  const ds = tu ? muc.filter((m) => boDau(m.nhan).includes(tu)) : muc
  const sangThat = ds.some((m) => m.gt === sang) ? sang : (ds[0]?.gt ?? '')
  const nhieu = muc.some((m) => m.chon !== undefined)
  const ghiChu = !muc.length ? rong : !ds.length ? `Không có mục nào khớp "${go.trim()}"` : ''
  useGanMucSang(goc, sangThat)
  return (
    <Command
      ref={goc}
      onKeyDownCapture={ghiPhu}
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
      <CommandList label={tenDs} className={cs.trongPopDs} onPointerDownCapture={ghiPhu}>
        {ds.map((m, i) => (
          <Fragment key={m.gt}>
            <CommandItem value={m.gt} aria-checked={nhieu ? !!m.chon : undefined} onSelect={() => onChon(m.gt, phu.current)}>
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
  /** Đóng pop; `cuoi` = điều kiện vừa đặt (state `nhap` chưa kịp cập nhật). */
  onXong: (cuoi?: DieuKienLoc) => void
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
        // Chọn một giá trị → áp lọc và ĐÓNG pop (CEO 27/11 "bấm filter xong thì phải ẩn menu chọn đi"); giữ Ctrl/⌘/Shift
        // khi bấm để chọn tiếp nhiều giá trị.
        onChon={(g, giu) => {
          const d = { ...nhap, giaTri: nhap.giaTri.includes(g) ? nhap.giaTri.filter((x) => x !== g) : [...nhap.giaTri, g] }
          onNhap(d)
          if (!giu) onXong(d)
        }}
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
  const dong = (cuoi: DieuKienLoc | null = nhap) => {
    if (cuoi && laRong(cuoi) && dieuKien.some((d) => d.truong === cuoi.truong)) onDoi(cuoi.truong, null)
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

/**
 * `TieuDeCot moLoc` của một cột lọc được: chip nhãn "TÊN: GIÁ TRỊ" khi đang lọc + bấm tiêu đề mở thẳng pop lọc (kèm
 * "Ẩn cột") — CEO 27/11. `mo` = `useMoLoc().mo`. Trường không có trong `truong` → undefined (cột không lọc).
 */
export function moLocCot(id: string, dieuKien: DieuKienLoc[], truong: TruongLoc[], mo: MoLocRef['mo']) {
  const x = truong.find((y) => y.id === id)
  if (!x) return undefined
  const d = dieuKien.find((y) => y.truong === id)
  return {
    dang: !!d,
    giaTri: d ? nhanChip(d, x.ten, tenGiaTri(x)).giaTri : undefined,
    onMo: (neo: HTMLElement, phu?: PhuMoLoc) => mo(id, neo, phu),
  }
}

/**
 * Nút "Lọc" (thanh công cụ DataViewToolbar, khe `loc`) + pop chọn trường → sửa điều kiện. `onXoaHet` → khi đang có điều
 * kiện, nút "✕ Xoá bộ lọc" (ghost, có chữ) đứng TRƯỚC nút Lọc (CEO 27/11 "Thêm nút reset filter… label rõ ràng") — thay
 * "Xoá lọc" của hàng chip cũ. `coCot` (khuôn F): trường nào đang hiện thành chip ở nhãn cột (`moLocCot`) → `true`; điều
 * kiện của trường KHÔNG có cột đang hiện (cột ẩn, trường không có cột, chế độ Danh sách/Kanban) hiện `ChipLoc` ngay trước
 * nút Xoá — bộ lọc đang bật luôn thấy được ở đâu đó.
 */
export function NutLoc({
  truong,
  dieuKien,
  onDoi,
  onXoaHet,
  coCot,
  ref,
}: {
  truong: TruongLoc[]
  dieuKien: DieuKienLoc[]
  onDoi: OnDoi
  onXoaHet?: () => void
  coCot?: (truongId: string) => boolean
  ref?: Ref<MoLocRef>
}) {
  const [mo, setMo] = useState(false)
  const [phu, setPhu] = useState<PhuMoLoc>()
  const { nhap, setNhap, doi, dong } = useNhap(dieuKien, onDoi)
  const khung = useRef<HTMLDivElement>(null)
  const ngoai = useNeoNgoai()
  useImperativeHandle(ref, () => ({
    mo: (id, neo, p) => {
      const x = truong.find((y) => y.id === id)
      if (!x) return
      ngoai.dat(neo)
      setPhu(p)
      setNhap(dieuKien.find((d) => d.truong === id) ?? moi(x))
      setMo(true)
    },
  }))
  const t = nhap && truong.find((x) => x.id === nhap.truong)
  // Đổi trang trong pop đang mở (danh sách ↔ sửa) → focus ô đầu của trang mới.
  useEffect(() => {
    if (mo) focusTrong(khung.current)
  }, [mo, nhap?.truong])
  const doiMo = (o: boolean, cuoi?: DieuKienLoc) => {
    if (!o) dong(cuoi)
    else setPhu(undefined)
    setMo(o)
  }
  return (
    <>
    {coCot &&
      dieuKien.map((d) => {
        const x = !coCot(d.truong) && truong.find((y) => y.id === d.truong)
        return x && <ChipLoc key={d.truong} truong={x} dieuKien={d} onDoi={onDoi} />
      })}
    {onXoaHet && dieuKien.length > 0 && (
      <Button variant="ghost" size="sm" onClick={onXoaHet}>
        <X aria-hidden="true" />
        {/* Khổ điện thoại: chỉ icon (thanh công cụ 390 tràn mép — đo 27/11), chữ vẫn cho trình đọc màn hình. */}
        <span className="max-sm:sr-only">Xoá bộ lọc</span>
      </Button>
    )}
    <Popover open={mo} onOpenChange={doiMo}>
      {/* Cụm công cụ DataViewToolbar = nút icon ghost 32, icon 18 + tooltip (README) — y nút ⚙. */}
      <TooltipNhanh content="Lọc theo trường">
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Lọc" data-slot="nut-loc" className="[&_svg]:size-[18px]">
            <SlidersHorizontal aria-hidden="true" />
          </Button>
        </PopoverTrigger>
      </TooltipNhanh>
      {ngoai.anchor}
      <PopoverContent
        ref={khung}
        aria-label="Lọc"
        data-slot="bo-loc-truong"
        align={ngoai.anchor ? 'start' : 'end'}
        collisionPadding={16}
        className={khungPop}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          focusTrong(khung.current)
        }}
        onCloseAutoFocus={(e) => void ngoai.traFocus(e)}
      >
        {t && nhap ? (
          <>
            <SuaDieuKien
              truong={t}
              nhap={nhap}
              onNhap={doi}
              onXong={(d) => doiMo(false, d)}
              lui={() => {
                dong()
                setNhap(null)
              }}
            />
            <ChanCot phu={phu} dong={() => doiMo(false)} />
          </>
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
    </>
  )
}

/** Một điều kiện đang áp = một chip (`.ui-chip` có ×): bấm chữ → sửa; × → gỡ. Đặt trong ThanhDangLoc (`dieuKien[].chip`). */
export function ChipLoc({
  truong: t,
  dieuKien: d,
  onDoi,
  ref,
}: {
  truong: TruongLoc
  dieuKien: DieuKienLoc
  onDoi: OnDoi
  ref?: Ref<MoLocRef>
}) {
  const [mo, setMo] = useState(false)
  const [phu, setPhu] = useState<PhuMoLoc>()
  const { nhap, setNhap, doi, dong } = useNhap([d], onDoi)
  const goc = useRef<HTMLSpanElement>(null)
  const khung = useRef<HTMLDivElement>(null)
  const ngoai = useNeoNgoai()
  const n = nhanChip(d, t.ten, tenGiaTri(t))
  // Đóng khi rỗng = chip sắp mất → không trả focus về chữ chip (Radix) mà sang chỗ còn lại (`focusKeBen`) — mở từ tiêu
  // đề cột thì về tiêu đề đó.
  const seGo = useRef(false)
  const doiMo = (o: boolean, cuoi: DieuKienLoc | null = nhap) => {
    if (o) setNhap(d)
    else {
      setPhu(undefined)
      seGo.current = !!cuoi && laRong(cuoi)
      // Chuyển focus TRƯỚC khi gỡ (bên gọi có thể gỡ chip ngay trong `onDoi`, Popover mất luôn, không còn onCloseAutoFocus).
      if (seGo.current) {
        const neo = ngoai.neo.current
        if (neo) neo.focus()
        else focusKeBen(goc.current)
      }
      dong(cuoi)
    }
    setMo(o)
  }
  useImperativeHandle(ref, () => ({
    mo: (_id, neo, p) => {
      ngoai.dat(neo)
      doiMo(true)
      setPhu(p)
    },
  }))
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
          if (seGo.current) {
            seGo.current = false
            e.preventDefault()
            ngoai.dat(null)
            return
          }
          ngoai.traFocus(e)
        }}
      >
        {nhap && <SuaDieuKien truong={t} nhap={nhap} onNhap={doi} onXong={(c) => doiMo(false, c)} />}
        {nhap && <ChanCot phu={phu} dong={() => doiMo(false)} />}
      </PopoverContent>
    </Popover>
  )
}
