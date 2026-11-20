'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type ComponentType,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { MagnifyingGlass, Sparkle } from '@phosphor-icons/react/ssr'
import { Command as CommandPrimitive } from 'cmdk'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { boDau, chuanHoaTuKhoa } from '@/bang/timkiem'
import { laMac, laPhimMoLenh, phimMoLenh } from '@/lib/phim-tat'
import { cn } from '@/lib/utils'
import * as s from './command-styles'
import { overlay } from './dialog-styles'
import { useDsPortal } from './ds-root'
import { Kbd, KbdGroup } from './kbd'
import { useNutMo } from './use-nut-mo'

/** Một dòng kết quả. `truong` = các trường đem khớp, MỖI TRƯỜNG SO RIÊNG (không nối) — vd tên, mã, SĐT. */
export type MucLenh = { id: string; ten: string; phu?: string; truong: string[] }
/** Một nhóm theo loại đối tượng (Ticket, Khách hàng…). `icon` vẽ đầu mỗi dòng của nhóm (Phosphor). */
export type NhomLenh = { ten: string; icon?: ComponentType<{ 'aria-hidden'?: boolean | 'true' }>; muc: MucLenh[] }

const MOI_NHOM = 5
const BAP = '__hoi-bap'
const LA_SDT = /^[\d\s.+-]+$/

/**
 * Khớp một mục: chữ gõ đã bỏ dấu là chuỗi con của một trường đã bỏ dấu ("sen vang" = "Sen Vàng"); chữ gõ trông như SĐT
 * (chỉ số và `.`/`-`/`+`/cách, ≥ 3 chữ số) → bỏ `.`/`-`/cách ở CẢ HAI bên rồi so ("0909.123" = "0909 123 456").
 */
function khop(m: MucLenh, k: string, sdt: string) {
  return m.truong.some((t) => boDau(t).includes(k) || (!!sdt && t.replace(/[\s.-]/g, '').includes(sdt)))
}

/** Bọc đoạn khớp không dấu bằng `mark`, giữ nguyên chữ gốc (ánh xạ từng ký tự gốc → ký tự đã bỏ dấu; prototype). */
function danhDau(s0: string, k: string): ReactNode {
  const str = s0.normalize('NFC') // NFD (dấu tách rời) làm dấu của ký tự cuối rơi ra ngoài mark
  if (!k) return str
  let n = ''
  const vt: number[] = []
  for (let i = 0; i < str.length; i++) for (const c of boDau(str[i])) { n += c; vt.push(i) }
  const o = n.indexOf(k)
  if (o < 0) return str
  const a = vt[o]
  const b = vt[o + k.length - 1] + 1
  return <>{str.slice(0, a)}<mark>{str.slice(a, b)}</mark>{str.slice(b)}</>
}

const khongDangKy = () => () => {}

/** Chữ phím mở lệnh theo nền tảng (Ctrl K / ⌘ K) — server và lần vẽ đầu là "Ctrl", sau hydrate mới đổi ⌘ trên Mac. */
export function PhimMoLenh({ className }: { className?: string }) {
  const mac = useSyncExternalStore(khongDangKy, () => laMac(), () => false)
  return (
    <KbdGroup className={className}>
      {phimMoLenh(mac).map((p) => (
        <Kbd key={p}>{p}</Kbd>
      ))}
    </KbdGroup>
  )
}

/** Ctrl K (Mac ⌘K) ở bất kỳ đâu → bật/tắt CommandPalette. `setOpen` là setter của useState. */
export function usePhimMoLenh(setOpen: Dispatch<SetStateAction<boolean>>) {
  useEffect(() => {
    const nghe = (e: KeyboardEvent) => {
      if (!laPhimMoLenh(e, laMac())) return
      e.preventDefault()
      setOpen((o) => !o)
    }
    window.addEventListener('keydown', nghe)
    return () => window.removeEventListener('keydown', nghe)
  }, [setOpen])
}

type PropsThan = {
  nhom: NhomLenh[]
  onChon(m: MucLenh): void
  /** Có thì dòng "Hỏi Bắp: “…”" luôn đứng cuối khi đã gõ chữ (nhóm "Nhờ Bắp"). */
  onHoiBap?(q: string): void
  /** Chữ trong câu "không thấy": "Không thấy “x” trong <phamVi>." — vd "ticket, khách, serial, đơn". */
  phamVi?: string
  placeholder?: string
  defaultSearch?: string
}

/**
 * Thân CommandPalette (ô gõ + vùng trạng thái + danh sách + chân) — CommandPalette dùng bên trong hộp. Xuất ra cho chỗ cần
 * mặt NẰM SẴN trên trang (khối /ds vẽ tĩnh): tự bọc `hop` của command-styles.ts qua `className`.
 */
export function CommandPanel({
  nhom,
  onChon,
  onHoiBap,
  phamVi,
  placeholder = 'Tìm SĐT, tên khách, serial, mã đơn, mã ticket…',
  defaultSearch = '',
  className,
}: PropsThan & { className?: string }) {
  // `go` = chữ trong ô (kể cả đang ghép dở); `q` = chữ dùng để lọc — chỉ cập nhật khi bộ gõ ghép xong (như Combobox).
  const [go, setGo] = useState(defaultSearch)
  const [q, setQ] = useState(defaultSearch)
  const ghep = useRef(false)
  const [sang, setSang] = useState('')
  const gocRef = useRef<HTMLDivElement>(null)

  const tu = q.trim()
  const k = chuanHoaTuKhoa(q)
  const sdt = LA_SDT.test(tu) && tu.replace(/\D/g, '').length >= 3 ? tu.replace(/[\s.-]/g, '') : ''
  const ket = nhom
    .map((g, gi) => {
      const m = k ? g.muc.filter((x) => khop(x, k, sdt)) : g.muc
      return { ...g, gi, hien: m.slice(0, MOI_NHOM), tong: m.length }
    })
    .filter((g) => g.hien.length)
  const tong = ket.reduce((t, g) => t + g.tong, 0)
  const coBap = !!tu && !!onHoiBap
  const cacGiaTri = [...ket.flatMap((g) => g.hien.map((m) => `${g.gi}:${m.id}`)), ...(coBap ? [BAP] : [])]
  // Mục sáng do ta giữ (NGUON: cmdk 1.1.1 chỉ tính lại khi chữ đổi). Không còn trong danh sách → mục đầu.
  const sangThat = cacGiaTri.includes(sang) ? sang : (cacGiaTri[0] ?? '')

  // cmdk 1.1.1 chỉ gắn aria-activedescendant khi mục sáng đổi bằng ↑/↓ → gắn lại từ `data-value` (mẫu combobox.tsx).
  useLayoutEffect(() => {
    const g = gocRef.current
    if (!g) return
    const id = [...g.querySelectorAll('[cmdk-item]')].find((el) => el.getAttribute('data-value') === sangThat)?.id
    for (const el of g.querySelectorAll('[cmdk-input], [cmdk-list]')) {
      if (id) el.setAttribute('aria-activedescendant', id)
      else el.removeAttribute('aria-activedescendant')
    }
  })

  const dongMuc = (value: string, icon: ReactNode, tenMuc: ReactNode, phuMuc: ReactNode, chon: () => void) => (
    <CommandPrimitive.Item key={value} value={value} onSelect={chon} className={s.dong}>
      {icon}
      <span className={s.chu}>
        <span className={s.ten}>{tenMuc}</span>
        {phuMuc && <span className={s.phu}>{phuMuc}</span>}
      </span>
      {value === sangThat && <Kbd aria-hidden="true">↵</Kbd>}
    </CommandPrimitive.Item>
  )

  return (
    <CommandPrimitive
      ref={gocRef}
      value={sangThat}
      onValueChange={setSang}
      shouldFilter={false}
      vimBindings={false}
      loop
      label="Tìm toàn cục"
      className={cn(s.goc, className)}
      onKeyDown={(e) => {
        // cmdk bỏ qua phím khi nativeEvent.isComposing / keyCode 229; cờ riêng phủ trình duyệt/bộ gõ không gắn cờ đó.
        if (ghep.current && (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) e.preventDefault()
      }}
    >
      <div data-slot="command-input" className={s.hangGo}>
        <MagnifyingGlass aria-hidden="true" />
        <CommandPrimitive.Input
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
          aria-label="Tìm toàn cục"
          placeholder={placeholder}
          spellCheck={false}
          className={s.oGo}
        />
        <Kbd className={s.phimEsc}>Esc</Kbd>
      </div>
      {/* Đọc số kết quả mỗi lần gõ (aria-activedescendant có thể giữ nguyên id mục đầu nên không tự đọc lại). */}
      <div role="status" className="sr-only">
        {tu ? (tong ? `${tong} kết quả` : `Không thấy “${tu}”`) : ''}
      </div>
      {tu && !tong && (
        <div data-slot="command-empty" className={s.rong}>
          Không thấy “{tu}”{phamVi ? ` trong ${phamVi}` : ''}. Thử bỏ bớt chữ{onHoiBap ? ', hoặc hỏi Bắp' : ''}.
        </div>
      )}
      <CommandPrimitive.List label="Kết quả" className={s.danhSach}>
        {ket.map((g) => {
          const Icon = g.icon
          return (
            <CommandPrimitive.Group
              key={g.gi}
              heading={
                <>
                  {g.ten}
                  {g.tong > g.hien.length && <span className={s.dem}> · {g.hien.length}/{g.tong}</span>}
                </>
              }
            >
              {g.hien.map((m) =>
                dongMuc(`${g.gi}:${m.id}`, Icon && <Icon aria-hidden="true" />, danhDau(m.ten, k), m.phu && danhDau(m.phu, k), () =>
                  onChon(m),
                ),
              )}
            </CommandPrimitive.Group>
          )
        })}
        {coBap && (
          <CommandPrimitive.Group heading="Nhờ Bắp">
            {dongMuc(BAP, <Sparkle aria-hidden="true" />, <>Hỏi Bắp: “<mark>{tu}</mark>”</>, null, () => onHoiBap!(tu))}
          </CommandPrimitive.Group>
        )}
      </CommandPrimitive.List>
      <div data-slot="command-foot" aria-hidden="true" className={s.chan}>
        <span>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> chọn
        </span>
        <span>
          <Kbd>↵</Kbd> mở
        </span>
        <span>
          <Kbd>Esc</Kbd> đóng
        </span>
        <span>Tìm không cần gõ dấu</span>
      </div>
    </CommandPrimitive>
  )
}

/**
 * CommandPalette — ô tìm toàn cục (shadcn `CommandDialog`: Radix Dialog + cmdk), giá trị từ `dialog.ui-command` /
 * `.ui-command-*` của ds/nguon/bundle.css qua command-styles.ts. Mở bằng `usePhimMoLenh` (Ctrl K / ⌘K) hoặc nút 🔍
 * (nút nên ghi `PhimMoLenh`).
 * - Khớp KHÔNG DẤU bằng `boDau`/`chuanHoaTuKhoa` của `bang/`, từng trường của mục so riêng; chữ gõ dạng SĐT bỏ `.`/`-`/cách
 *   trước khi so. Mỗi nhóm tối đa 5 dòng; cắt thì tên nhóm ghi "· 5/12". Đoạn khớp bọc `mark` (đậm 600, không tô).
 * - APG combobox + listbox: focus luôn ở ô gõ (`role="combobox"`, `aria-activedescendant` — gắn lại thủ công, xem
 *   NGUON cmdk 1.1.1), ↑/↓ đổi dòng (vòng), Enter mở → `onChon` + đóng. Số kết quả đọc qua `role="status"`; câu "không
 *   thấy" NGOÀI listbox, dòng "Hỏi Bắp" (khi có `onHoiBap`) trong listbox.
 * - Bộ gõ tiếng Việt đang ghép chữ: Enter / ↑↓ thuộc bộ gõ, danh sách lọc theo chữ đã ghép xong.
 * - Hộp: portal vào vùng DS, z-70 (lớp dialog), nền mờ chung `overlay` của dialog-styles.ts; Esc / bấm nền đóng, focus về
 *   phần tử đã mở (`useNutMo`). Mỗi lần mở là thân mới (chữ cũ không giữ).
 */
export function CommandPalette({
  open,
  onOpenChange,
  onChon,
  onHoiBap,
  ...than
}: PropsThan & { open: boolean; onOpenChange(open: boolean): void }) {
  const container = useDsPortal()
  if (!container) return null
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal container={container}>
        <DialogPrimitive.Overlay data-slot="command-overlay" className={overlay} />
        <HopLenh data-slot="command-palette" className={s.hopNoi}>
          <DialogPrimitive.Title className="sr-only">Tìm toàn cục</DialogPrimitive.Title>
          <CommandPanel
            {...than}
            onChon={(m) => {
              onOpenChange(false)
              onChon(m)
            }}
            onHoiBap={
              onHoiBap &&
              ((q) => {
                onOpenChange(false)
                onHoiBap(q)
              })
            }
          />
        </HopLenh>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** Con trực tiếp của Portal → chỉ mount khi mở (xem useNutMo). Không export. */
function HopLenh(props: ComponentProps<typeof DialogPrimitive.Content>) {
  return <DialogPrimitive.Content {...props} {...useNutMo(props)} />
}
