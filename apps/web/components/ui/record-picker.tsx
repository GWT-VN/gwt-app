'use client'

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Check, MagnifyingGlass, Plus, WarningCircle } from '@phosphor-icons/react/ssr'
import type { MucChon } from '@/bang/OChonGoiY'
import { boDau } from '@/bang/timkiem'
import { TOI_THIEU_KY_TU, useTimXa } from '@/bang/useTimXa'
import { cn } from '@/lib/utils'
import { Command, CommandInput, CommandItem, CommandList } from './command'
import { commandInput, commandInputIcon, commandInputWrapper } from './command-styles'
import {
  cat,
  recordPickerDem,
  recordPickerDong1,
  recordPickerDong2,
  recordPickerDs,
  recordPickerLuuY,
  recordPickerMuc,
  recordPickerPhai,
  recordPickerRong,
  recordPickerTen,
  recordPickerTick,
} from './inline-edit-styles'
import { menuItem, menuSeparator } from './menu-styles'
import { Spinner } from './spinner'

/** Một bản ghi để chọn (khách, máy, đơn…). Mỗi dòng phải đủ thông tin phân biệt hai bản ghi na ná tên. */
export type BanGhi = {
  /** Mã (khoá) — hiện đầu dòng 2. */
  ma: string
  ten: string
  /** Cá nhân / Doanh nghiệp… */
  loai?: string
  khuVuc?: string
  /** SĐT — đưa đủ cũng được: component CHỈ hiện và chỉ tìm theo 4 số cuối ("SĐT •••1234"). */
  sdt?: string
  /** Dòng 3: máy · serial đang dùng (bên gọi tự ghép). */
  may?: string
  /** Ghi chú phải dòng 1 (vd "2 ticket mở" / "không ticket mở"). */
  phai?: string
  /** Cờ lưu ý đỏ cạnh tên. */
  luuY?: boolean
}

/** 4 số cuối của SĐT — thứ DUY NHẤT của số điện thoại được ra màn (không lộ PII trên màn danh sách). */
const duoiSdt = (sdt?: string) => (sdt ? sdt.replace(/\D/g, '').slice(-4) : '')

const dong2 = (b: BanGhi) =>
  [b.ma, b.loai, b.khuVuc, b.sdt && `SĐT •••${duoiSdt(b.sdt)}`].filter(Boolean).join(' · ')

/** Chuỗi tìm = đúng các trường HIỂN THỊ (tên, mã, loại, khu vực, 4 số cuối, máy/serial), bỏ dấu. */
const chuoiTim = (b: BanGhi) => boDau([b.ten, b.ma, b.loai, b.khuVuc, duoiSdt(b.sdt), b.may].filter(Boolean).join(' '))

const KHONG_TIM = async (): Promise<BanGhi[]> => []

/**
 * RecordPicker — THÂN bảng chọn bản ghi (README RecordPicker): ô tìm (focus sẵn khi mở trong pop) · dòng đếm · danh sách 3 dòng/mục (tự
 * cuộn, tối đa 340) · chân "+ Tạo <loại> mới "<chữ đang gõ>"" luôn thấy. Đặt trong pop có khung `menuContent` +
 * `recordPickerKhung` (xem `OSuaKhach` ở inline-edit.tsx) hoặc vẽ tĩnh.
 *
 * - cmdk 1.1.1 như `ComboboxPanel`: ô tìm `role="combobox"` + `aria-activedescendant`, danh sách `role="listbox"`, mục
 *   `role="option"` + `aria-selected` = mục đang SÁNG (↑/↓). Mục ĐANG CHỌN (`value`) = `data-checked` → nền alpha-04 + ✓
 *   + "(đang chọn)" cho trình đọc màn hình. Ta giữ mục sáng (`value` của cmdk) và tự gắn lại `aria-activedescendant` —
 *   cmdk chỉ tính lại khi chữ trong ô đổi (luật NGUON.md).
 * - Tìm không dấu trên mọi trường hiển thị. `muc` (đã nạp) lọc tại chỗ; `tim` (bảng lớn) gọi server qua `useTimXa`
 *   (debounce 250ms, tối thiểu `TOI_THIEU_KY_TU` ký tự, bỏ kết quả về muộn) — `tim` phải giữ nguyên tham chiếu.
 * - Enter chọn dòng đang sáng (mặc định dòng đầu). Bộ gõ tiếng Việt đang ghép chữ: Enter KHÔNG chọn, lọc theo chữ đã ghép.
 * - SĐT: chỉ `•••` + 4 số cuối, kể cả khi bên gọi đưa số đủ.
 */
export function RecordPicker({
  muc,
  tim,
  value,
  onChon,
  onTaoMoi,
  loai = 'khách',
  tenDanhSach = 'Khách hàng',
  placeholder = 'Tên, mã KH, 4 số cuối SĐT, serial…',
  max = 50,
  defaultSearch = '',
  tinh = false,
  className,
}: {
  /** Danh sách đã nạp ở client. Truyền `muc` HOẶC `tim`. */
  muc?: BanGhi[]
  /** Tìm xa (gọi server); ném lỗi thì dòng đếm hiện câu lỗi. */
  tim?: (q: string) => Promise<BanGhi[]>
  /** Mã bản ghi đang chọn (✓). */
  value?: string | null
  onChon(b: BanGhi): void
  /** Có → chân "+ Tạo <loại> mới" (nhận chữ đang gõ). */
  onTaoMoi?: (q: string) => void
  /** Danh từ trong dòng đếm / ô tìm / chân: "khách", "máy"… */
  loai?: string
  tenDanhSach?: string
  placeholder?: string
  /** Số mục hiện tối đa; cắt thì dòng đếm nói rõ. */
  max?: number
  /** Chữ có sẵn trong ô tìm lúc mount (khối /ds vẽ tĩnh trạng thái đang gõ). */
  defaultSearch?: string
  /**
   * Mặt vẽ tĩnh NẰM SẴN trên trang (khối /ds): cùng DOM/class nhưng phần tử thường — không cmdk, `inert`, ô tìm chỉ đọc.
   * ⚠️ cmdk 1.1.1 gọi `scrollIntoView({ block: 'nearest' })` lên mục sáng lúc mount / đổi mục → mặt cmdk sống giữa trang
   * kéo CẢ CỬA SỔ tới nó (đo 20/11: nạp /ds#pagination bị kéo tới khối RecordPicker). Trong pop thì vô hại (pop fixed,
   * chỉ danh sách cuộn).
   */
  tinh?: boolean
  className?: string
}) {
  // `go` = chữ trong ô (kể cả đang ghép dở); `q` = chữ để lọc — chỉ cập nhật khi bộ gõ ghép xong.
  const [go, setGo] = useState(defaultSearch)
  const [q, setQ] = useState(defaultSearch)
  const ghep = useRef(false)
  // useTimXa chỉ chuyển tiếp mảng kết quả, không đọc trường nào → ép kiểu qua MucChon (hook của bang/ khai MucChon).
  const xa = useTimXa((tim ?? KHONG_TIM) as unknown as (s: string) => Promise<MucChon[]>, tim ? q : '') as unknown as {
    ds: BanGhi[]
    dangTim: boolean
    loi: string | null
    thieuKyTu: boolean
  }
  const [sang, setSang] = useState('')
  const gocRef = useRef<HTMLDivElement>(null)

  const s = boDau(q.trim())
  const khop = muc ? (s ? muc.filter((b) => chuoiTim(b).includes(s)) : muc) : tim && !xa.thieuKyTu && !xa.dangTim && !xa.loi ? xa.ds : []
  const ds = khop.slice(0, max)
  const sangThat = ds.some((b) => b.ma === sang) ? sang : (ds[0]?.ma ?? '')

  // cmdk 1.1.1 chỉ gắn aria-activedescendant khi mục sáng đổi bằng ↑/↓ → gắn lại theo `data-value` (mẫu combobox.tsx).
  useLayoutEffect(() => {
    const goc = gocRef.current
    if (!goc) return
    const id = [...goc.querySelectorAll('[cmdk-item]')].find((el) => el.getAttribute('data-value') === sangThat)?.id
    for (const el of goc.querySelectorAll('[cmdk-input], [cmdk-list]')) {
      if (id) el.setAttribute('aria-activedescendant', id)
      else el.removeAttribute('aria-activedescendant')
    }
  })

  const tu = go.trim()
  let dem: ReactNode
  if (tim && xa.loi) dem = <span className="text-(--color-text-danger)">{xa.loi}</span>
  else if (tim && xa.thieuKyTu) dem = `Gõ ít nhất ${TOI_THIEU_KY_TU} ký tự để tìm ${loai}`
  else if (tim && xa.dangTim)
    dem = (
      <span className="inline-flex items-center gap-2">
        <Spinner aria-hidden />
        Đang tìm…
      </span>
    )
  else {
    const so = s || tim ? `${khop.length} ${loai} khớp` : `${khop.length} ${loai}`
    dem = `${khop.length > ds.length ? `Đang hiện ${ds.length} / ${so}` : so} · Enter chọn dòng đầu`
  }

  const noiDung = (b: BanGhi) => {
    const chon = b.ma === value
    return (
      <>
        <span className={recordPickerDong1}>
          <span data-slot="record-picker-ten" className={cn(cat, recordPickerTen)}>
            {b.ten}
          </span>
          {b.luuY && <WarningCircle weight="fill" aria-label="Có lưu ý" role="img" className={recordPickerLuuY} />}
          {b.phai && <span className={recordPickerPhai}>{b.phai}</span>}
          {chon && (
            <>
              <span className="sr-only">(đang chọn)</span>
              <Check aria-hidden="true" className={cn(recordPickerTick, !b.phai && 'ml-auto')} />
            </>
          )}
        </span>
        <span className={cn(cat, recordPickerDong2)}>{dong2(b)}</span>
        {b.may && <span className={cn(cat, recordPickerDong2)}>{b.may}</span>}
      </>
    )
  }
  const lopMuc = cn(menuItem, recordPickerMuc, 'data-[selected=true]:bg-(--menu-item-bg)')
  const rong = !ds.length && !(tim && (xa.thieuKyTu || xa.dangTim || xa.loi)) && (
    <div className={recordPickerRong}>{tu ? `Không thấy ${loai} "${tu}"` : `Chưa có ${loai} nào.`}</div>
  )
  // `.ui-menu-search` y ComboboxPanel: cao 32, đệm 0 8, gap 8, tràn mép menu, gạch dưới border → alpha-50 khi focus.
  const leHangTim = '-mx-(--menu-gutter) -mt-(--menu-gutter) mb-(--menu-gutter)'
  const demO = (
    <div aria-live={tinh ? undefined : 'polite'} data-slot="record-picker-dem" className={recordPickerDem}>
      {dem}
    </div>
  )
  const chan = onTaoMoi && (
    <>
      <div data-slot="record-picker-sep" className={menuSeparator} />
      {/* Nút thường ngoài danh sách cmdk (Tab tới được): không có data-highlighted → sáng theo rê chuột. */}
      <button
        type="button"
        data-slot="record-picker-tao"
        className={cn(menuItem, 'hover:bg-(--menu-item-bg)')}
        onClick={() => onTaoMoi(tu)}
      >
        <Plus aria-hidden="true" />
        {tu ? `Tạo ${loai} mới "${tu}"` : `Tạo ${loai} mới`}
      </button>
    </>
  )

  if (tinh)
    return (
      <div data-slot="record-picker" inert cmdk-root="" className={cn('border-none border-current', className)}>
        <div data-slot="record-picker-search" className={cn(commandInputWrapper, leHangTim)}>
          <MagnifyingGlass aria-hidden="true" className={commandInputIcon} />
          <input readOnly tabIndex={-1} value={go} aria-label={`Tìm ${loai}`} placeholder={placeholder} className={commandInput} />
        </div>
        {demO}
        <div cmdk-list="" role="listbox" aria-label={tenDanhSach} data-slot="record-picker-ds" className={recordPickerDs}>
          <div cmdk-list-sizer="">
            {ds.map((b) => (
              <div
                key={b.ma}
                cmdk-item=""
                role="option"
                aria-selected={b.ma === sangThat}
                data-selected={b.ma === sangThat}
                data-checked={b.ma === value || undefined}
                className={lopMuc}
              >
                {noiDung(b)}
              </div>
            ))}
            {rong}
          </div>
        </div>
        {chan}
      </div>
    )

  return (
    <Command
      ref={gocRef}
      value={sangThat}
      onValueChange={setSang}
      shouldFilter={false}
      vimBindings={false}
      label={`Tìm ${loai}`}
      data-slot="record-picker"
      className={cn('block h-auto w-auto overflow-visible rounded-none bg-transparent text-inherit', className)}
      onKeyDown={(e) => {
        // cmdk đã bỏ qua phím khi nativeEvent.isComposing / keyCode 229; cờ riêng phủ bộ gõ không gắn cờ đó.
        if (ghep.current && e.key === 'Enter') e.preventDefault()
      }}
    >
      {/* Trong pop, Radix focus ô tìm khi mở. */}
      <CommandInput
        value={go}
        onValueChange={(v) => {
          setGo(v)
          if (!ghep.current) setQ(v)
        }}
        onCompositionStart={() => {
          ghep.current = true
        }}
        onCompositionEnd={(e) => {
          ghep.current = false
          setQ(e.currentTarget.value)
        }}
        placeholder={placeholder}
        aria-label={`Tìm ${loai}`}
        wrapperClassName={leHangTim}
        wrapperSlot="record-picker-search"
      />
      {demO}
      <CommandList label={tenDanhSach} data-slot="record-picker-ds" className={cn('p-0', recordPickerDs)}>
        {ds.map((b) => (
          <CommandItem
            key={b.ma}
            value={b.ma}
            onSelect={() => onChon(b)}
            data-checked={b.ma === value || undefined}
            className={lopMuc}
          >
            {noiDung(b)}
          </CommandItem>
        ))}
        {rong}
      </CommandList>
      {chan}
    </Command>
  )
}
