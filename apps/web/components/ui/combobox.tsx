'use client'

// C có chủ đích (R21, docs/rework/2026-11-21-chep-shadcn-ke-hoach.md): Combobox của shadcn new-york-v4 dựng trên
// `@base-ui/react` (16 export) — DS chưa cài thư viện đó, giữ bản ghép kiểu shadcn cũ: Popover + Command (cmdk). Hỏi lại CEO
// khi màn nghiệp vụ cần chip chọn nhiều.
import { useRef, useState, type ReactNode } from 'react'
import { CaretUpDown, Check, MagnifyingGlass, X } from '@phosphor-icons/react/ssr'
import type { MucChon } from '@/bang/OChonGoiY'
import { locMucChon } from '@/bang/timkiem'
import { TOI_THIEU_KY_TU, useTimXa } from '@/bang/useTimXa'
import { cn } from '@/lib/utils'
import { Command, CommandInput, CommandItem, CommandList, useGanMucSang } from './command'
import * as cs from './command-styles'
import { menuCheck, menuContent } from './menu-styles'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { nutXoaTrongO, selectTrigger, selectValue } from './control-styles'
import { Spinner } from './spinner'
import { useTriggerChon, type TriggerChonProps } from './use-trigger-chon'

/**
 * Combobox — ghép Popover + `Command*` của DS (command.tsx, cmdk), giá trị từ `.ui-select-trigger` (trigger, qua `selectTrigger`) và
 * `.ui-menu*` (pop: `.ui-menu-search`, `.ui-menu-list`, `.ui-menu-item .ui-code`, `.ui-menu-note`/`.ui-menu-empty`) của
 * ds/nguon/bundle.css.
 *
 * **Bắt buộc cho danh sách > 10 mục** (luật docs/CHUAN-FILTER.md; ≤ 10 mục dùng `Select`). Là lớp áo cho gói `bang/`, không
 * viết lại logic: `options` (đã nạp ở client) → lọc bằng `locMucChon` (không dấu, theo mã lẫn tên lẫn `phu`); `tim` (gọi
 * server) → `useTimXa` (debounce 250ms, tối thiểu `TOI_THIEU_KY_TU` ký tự, bỏ kết quả về muộn). `tim` phải giữ nguyên
 * tham chiếu (hàm cấp module / `useCallback`). Ô lọc trang danh sách (tham số URL) vẫn là `BoLocGoiY`.
 *
 * - Trigger `<button>` y Select (cao 32, viền inset, lỗi/tắt) + icon CaretUpDown; hiện `nhan` của mục đang chọn. Có giá
 *   trị (và không tắt) → nút ✕ "Bỏ chọn" nhỏ cạnh icon gọi `onValueChange(null)` rồi trả focus về trigger. Không có mục
 *   rỗng để "bỏ chọn" trong danh sách.
 * - Pop: portal vào vùng DS, z-90 (lớp menu), rộng ≥ trigger và ≥ 200, không quá khung nhìn − 16 (khổ 390 không tràn).
 *   Mở → focus ô tìm (cmdk: `role="combobox"`, `aria-controls`, `aria-activedescendant`), mục đầu sáng sẵn; ↑/↓ di
 *   chuyển, Enter chọn, Esc / bấm ngoài đóng + focus về trigger; Esc trong Dialog chỉ đóng pop.
 * - Bộ gõ tiếng Việt đang ghép chữ (Telex/VNI qua IME): Enter KHÔNG chọn, danh sách lọc theo chữ đã ghép xong.
 * - Ghi chú cuối (`aria-live="polite"`, một vùng duy nhất cho mọi câu trạng thái): cắt bớt → "Đang hiện N / M mục — gõ
 *   thêm để thu hẹp", không cắt → "M mục"; rỗng / chưa đủ ký tự / đang tìm / lỗi (câu lỗi `tim` ném ra) theo README.
 *
 * Tên: `FieldLabel htmlFor` trỏ `id`, hoặc `aria-labelledby` / `aria-label`; tên đọc = nhãn + mục đang chọn
 * (`useTriggerChon`). Lỗi → `aria-invalid` + `aria-describedby`; `required` → `aria-required`; `name` → input ẩn mang mã
 * (`gt`) cho form; `onBlur` khi focus rời trigger lúc pop đóng.
 * Pop là `role="dialog"` của Radix (chứa ô tìm combobox + listbox), tên lấy từ `aria-labelledby` / `aria-label` của trigger.
 */
export function Combobox({
  value,
  onValueChange,
  options,
  tim,
  mucDangChon,
  placeholder = 'Chọn…',
  searchPlaceholder,
  max,
  name,
  ...trig
}: TriggerChonProps & {
  value: string | null
  onValueChange(v: string | null): void
  /** Danh sách đã nạp ở client (lọc tại chỗ). Truyền `options` HOẶC `tim`. */
  options?: MucChon[]
  /**
   * Tìm xa (gọi server); ném lỗi thì pop hiện câu lỗi. `max` nên bằng trần dòng của RPC: trả về ≥ `max` mục là chạm
   * trần → ghi chú "N kết quả đầu — gõ thêm để thu hẹp" (có thể còn mục khác ngoài N).
   */
  tim?: (q: string) => Promise<MucChon[]>
  /**
   * Mục ứng với `value` khi danh sách KHÔNG có sẵn ở client (chế độ `tim`, vd form sửa mở với mã khách đã lưu) → trigger
   * hiện `nhan` thay vì mã thô. Chỉ dùng khi `mucDangChon.gt === value`; lệch thì hiện `value`. Chế độ `options` không cần.
   */
  mucDangChon?: MucChon
  placeholder?: string
  searchPlaceholder?: string
  /** Số mục hiện tối đa (mặc định 30); cắt thì ghi chú nói rõ. */
  max?: number
}) {
  const [mo, setMo] = useState(false)
  const { idGiaTri, trigger } = useTriggerChon(trig, !!value, mo)
  const nutRef = useRef<HTMLButtonElement>(null)
  // Tìm xa: mục vừa chọn không nằm trong `options` → nhớ để trigger hiện tên thay vì mã.
  const [nho, setNho] = useState<MucChon | null>(null)
  const dang = value
    ? (options?.find((m) => m.gt === value) ?? [mucDangChon, nho].find((m) => m?.gt === value) ?? null)
    : null
  const ten = value ? (dang?.nhan ?? value) : null
  const coXoa = !!value && !trig.disabled

  return (
    <Popover open={mo} onOpenChange={setMo}>
      <div className="relative w-full min-w-0">
        <PopoverTrigger asChild>
          <button
            ref={nutRef}
            type="button"
            {...trigger}
            data-slot="combobox-trigger"
            data-placeholder={value ? undefined : ''}
            // cn: selectTrigger chứa cả font-normal (controlOutline) lẫn font-medium — twMerge giữ 500 như Select.
            className={cn(selectTrigger)}
          >
            <span id={idGiaTri} data-slot="select-value" className={selectValue}>
              {ten ?? placeholder}
            </span>
            {/* Chừa chỗ cho nút ✕ (nằm ngoài <button> — không lồng nút trong nút). */}
            {coXoa && <span aria-hidden className="ml-auto size-5 shrink-0" />}
            <CaretUpDown aria-hidden="true" />
          </button>
        </PopoverTrigger>
        {coXoa && (
          <button
            type="button"
            aria-label={`Bỏ chọn ${ten}`}
            onClick={() => {
              onValueChange(null)
              nutRef.current?.focus()
            }}
            // Phải = gutter 12 + icon 16 + gap 8 = 36 → right-9 (9 × --spacing). Nút 20, icon 14 muted, rê → foreground.
            className={cn(nutXoaTrongO, 'right-9')}
          >
            <X aria-hidden="true" />
          </button>
        )}
        {name && <input type="hidden" name={name} value={value ?? ''} />}
      </div>
      <PopoverContent
        data-slot="combobox-content"
        aria-labelledby={trig['aria-labelledby']}
        aria-label={trig['aria-labelledby'] ? undefined : (trig['aria-label'] ?? 'Danh sách chọn')}
        className={cn(
          menuContent,
          'w-auto min-w-[max(200px,var(--radix-popover-trigger-width))] max-w-[calc(100vw-16px)]',
          'max-h-(--radix-popover-content-available-height)',
        )}
      >
        <ComboboxPanel
          value={value}
          onSelect={(m) => {
            setNho(m)
            onValueChange(m.gt)
            setMo(false)
          }}
          options={options}
          tim={tim}
          searchPlaceholder={searchPlaceholder}
          max={max}
        />
      </PopoverContent>
    </Popover>
  )
}

const KHONG_TIM = async (): Promise<MucChon[]> => []

/**
 * Thân pop của Combobox (ô tìm + danh sách + ghi chú) — Combobox tự dùng bên trong PopoverContent. Xuất ra cho chỗ cần
 * danh sách chọn NẰM SẴN trên trang (vd khối `/ds` vẽ tĩnh trạng thái rỗng / gõ thêm / đang tìm): khi đó tự bọc
 * `menuContent` qua `className`. `defaultSearch` = chữ có sẵn trong ô tìm lúc mount.
 */
export function ComboboxPanel({
  value,
  onSelect,
  options,
  tim,
  searchPlaceholder = 'Gõ mã hoặc tên…',
  max = 30,
  defaultSearch = '',
  tinh = false,
  className,
}: {
  value: string | null
  onSelect(m: MucChon): void
  options?: MucChon[]
  tim?: (q: string) => Promise<MucChon[]>
  searchPlaceholder?: string
  max?: number
  defaultSearch?: string
  /**
   * Mặt vẽ tĩnh NẰM SẴN trên trang (khối /ds): cùng DOM/class nhưng phần tử thường — không cmdk, `inert` (không focus,
   * không thêm combobox/listbox thường trực vào cây a11y), ô tìm chỉ đọc. ⚠️ cmdk 1.1.1 gọi `scrollIntoView({ block:
   * 'nearest' })` lên mục sáng lúc mount / đổi mục → mặt cmdk sống giữa trang kéo CẢ CỬA SỔ tới nó (cùng bẫy
   * CommandPanel/RecordPicker, review đợt 2 M9). Pop thật (Combobox mở) không dùng `tinh`.
   */
  tinh?: boolean
  className?: string
}) {
  // `go` = chữ trong ô (kể cả đang ghép dở); `q` = chữ dùng để lọc/tìm — chỉ cập nhật khi bộ gõ ghép xong.
  const [go, setGo] = useState(defaultSearch)
  const [q, setQ] = useState(defaultSearch)
  const ghep = useRef(false)
  const xa = useTimXa(tim ?? KHONG_TIM, tim ? q : '')
  // Mục đang sáng (cmdk `value`) do ta giữ: cmdk tự chọn mục đầu chỉ khi CHỮ trong ô đổi — danh sách đổi mà chữ không đổi
  // (bộ gõ ghép xong, kết quả tìm xa về) thì mất mục sáng, Enter không chọn gì. Mục sáng không còn trong danh sách → mục đầu.
  const [sang, setSang] = useState('')
  const gocRef = useRef<HTMLDivElement>(null)

  const tai = options ? locMucChon(options, q, max) : null
  const choXa = !options && (xa.loi || xa.thieuKyTu || xa.dangTim)
  const ds = tai ? tai.ds : choXa ? [] : xa.ds.slice(0, max)
  const tong = tai ? tai.tong : xa.ds.length
  const tu = q.trim()
  const sangThat = ds.some((m) => m.gt === sang) ? sang : (ds[0]?.gt ?? '')

  useGanMucSang(gocRef, sangThat)

  let ghiChu: ReactNode
  if (!options && xa.loi) ghiChu = <span className="text-(--color-text-danger)">{xa.loi}</span>
  else if (!options && xa.thieuKyTu) ghiChu = `Gõ thêm — cần ít nhất ${TOI_THIEU_KY_TU} ký tự để tìm.`
  else if (!options && xa.dangTim) ghiChu = <><Spinner aria-hidden />Đang tìm…</>
  else if (!ds.length) ghiChu = tu ? `Không có mục nào khớp "${tu}".` : 'Không có mục nào.'
  else if (!options)
    // Tìm xa: RPC có trần dòng → không biết tổng thật; "20 mục" dễ hiểu sai là chỉ có 20. Chạm trần `max` → nói rõ là
    // N kết quả ĐẦU; chưa chạm → đó là toàn bộ kết quả.
    ghiChu = tong >= max ? `${ds.length} kết quả đầu — gõ thêm để thu hẹp` : `${tong} kết quả`
  else ghiChu = tong > ds.length ? `Đang hiện ${ds.length} / ${tong} mục — gõ thêm để thu hẹp` : `${tong} mục`

  // Phần Command mặc định đã là `.ui-menu*` (command-styles.ts); Combobox chỉ thêm phần "Command trong pop" (`trongPop*`).
  const lopGoc = cn(cs.trongPopGoc, className)
  const lopHang = cs.trongPopHangTim
  const lopDs = cs.trongPopDs
  const noiDung = (m: MucChon) => (
    <>
      {m.nhan !== m.gt && (
        // `.ui-menu-item .ui-code`: mono 12, muted, rộng tối thiểu 24 (bundle.css gõ 24px); số thẳng cột.
        <span className="min-w-[24px] shrink-0 font-mono text-[12px] tabular-nums text-muted-foreground">{m.gt}</span>
      )}
      <span className="min-w-0 truncate">{m.nhan}</span>
      {m.phu && <span className="min-w-0 truncate text-[12px] text-muted-foreground">{m.phu}</span>}
      {m.gt === value && (
        <>
          <span className="sr-only">(đang chọn)</span>
          <Check aria-hidden="true" className={menuCheck} />
        </>
      )}
    </>
  )
  // `.ui-menu-note` / `.ui-menu-empty` (cùng số đo): padding 6 8, 12/18, muted. Đang tìm: spinner cách chữ 8.
  const ghiChuO = (
    <div
      aria-live={tinh ? undefined : 'polite'}
      data-slot="combobox-note"
      className={cn(
        'px-2 py-1.5 border-none border-current text-[12px] leading-[18px] text-muted-foreground',
        !options && !xa.loi && !xa.thieuKyTu && xa.dangTim && 'flex items-center gap-2',
      )}
    >
      {ghiChu}
    </div>
  )

  if (tinh)
    return (
      <div data-slot="command" cmdk-root="" inert className={cn(cs.command, lopGoc)}>
        <div data-slot="command-input-wrapper" className={cn(cs.commandInputWrapper, lopHang)}>
          <MagnifyingGlass aria-hidden="true" className={cs.commandInputIcon} />
          <input
            data-slot="command-input"
            readOnly
            tabIndex={-1}
            value={go}
            aria-label="Tìm theo mã hoặc tên"
            placeholder={searchPlaceholder}
            className={cs.commandInput}
          />
        </div>
        <div data-slot="command-list" cmdk-list="" role="listbox" aria-label="Kết quả" className={cn(cs.commandList, lopDs)}>
          <div cmdk-list-sizer="">
            {ds.map((m) => (
              <div
                key={m.gt}
                data-slot="command-item"
                cmdk-item=""
                role="option"
                aria-selected={m.gt === sangThat}
                data-selected={m.gt === sangThat}
                data-checked={m.gt === value || undefined}
                className={cs.commandItem}
              >
                {noiDung(m)}
              </div>
            ))}
          </div>
        </div>
        {ghiChuO}
      </div>
    )

  return (
    <Command
      ref={gocRef}
      value={sangThat}
      onValueChange={setSang}
      shouldFilter={false}
      vimBindings={false}
      label="Tìm theo mã hoặc tên"
      className={lopGoc}
      onKeyDown={(e) => {
        // cmdk đã bỏ qua phím khi nativeEvent.isComposing / keyCode 229; cờ riêng phủ trình duyệt/bộ gõ không gắn cờ đó.
        if (ghep.current && e.key === 'Enter') e.preventDefault()
      }}
    >
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
        placeholder={searchPlaceholder}
        wrapperClassName={lopHang}
      />
      <CommandList label="Kết quả" className={lopDs}>
        {ds.map((m) => (
          <CommandItem key={m.gt} value={m.gt} onSelect={() => onSelect(m)} data-checked={m.gt === value || undefined}>
            {noiDung(m)}
          </CommandItem>
        ))}
      </CommandList>
      {ghiChuO}
    </Command>
  )
}
