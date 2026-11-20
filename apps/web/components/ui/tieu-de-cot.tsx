'use client'

import {
  useContext,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEventHandler,
  type ReactNode,
} from 'react'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardCode,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragMoveEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { ArrowDown, ArrowUp, CaretDown, Check, Funnel } from '@phosphor-icons/react/ssr'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { Badge, BadgeDot } from './badge'
import { useDsPortal } from './ds-root'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { menuCheck, menuItem } from './menu-styles'
import { KeoCtx, useOKeo } from './table'
import * as s from './table-styles'
import { toiThieu, type BenTha, type CotBang } from './use-cot-bang'

type Chieu = 'tang' | 'giam'
/** Một tag trong menu lọc — vẽ bằng `Badge` outline (+ chấm màu) như trong ô. Có cả "Chưa phân loại" nếu dữ liệu có. */
export type MucLoc = { giaTri: string; nhan: string; color?: 'info' | 'success' | 'warning' | 'danger' | 'discovery' }

export type SapCot = { chieu: Chieu | null; onDoi: (chieu: Chieu | null) => void }
export type LocCot = { tuyChon: MucLoc[]; daChon: string[]; onDoi: (giaTri: string[]) => void }

/**
 * Props theo `cot.kieu` (tsc chặn): cột biết rõ kiểu (vd hằng `{ kieu: 'loc' }`) mà nhận `sap` → lỗi kiểu (`never`).
 * Cột kiểu chung `CotBang` (lấy từ mảng, `useCotBang().hien`) nhận cả hai — thu hẹp bằng `cot.kieu === 'sap' ? … : undefined`;
 * lách kiểu vẫn ném lỗi lúc chạy. `PropsTieuDeCot` (không tham số) = dạng chung, `Omit<…>` dùng được như cũ.
 */
export type PropsTieuDeCot<C extends CotBang = CotBang> = {
  cot: C
  /** Vị trí trong hàng (0…) — ô trước nằm trên ô sau để nửa phải tay co dãn (vắt qua mép) không bị ô kế đè. */
  viTri?: number
  /** Chỉ cột `kieu: 'sap'`: chiều đang sắp theo cột này (`null` = không). */
  sap?: C extends { kieu: 'sap' } ? SapCot : never
  /** Chỉ cột `kieu: 'loc'`: tag có trong dữ liệu + đang chọn. */
  loc?: C extends { kieu: 'loc' } ? LocCot : never
  /** Có → tay co dãn ở mép phải (kéo / ←→ 8px / nhấp đúp về `cot.rong`). */
  coDan?: { rong: number; onDoi: (rong: number) => void }
  /** Menu canh phải ô (cột sát mép phải bảng, vd Chủ). Cột `phai` tự canh phải. */
  menuPhai?: boolean
  /** `div` → `role="columnheader"` (ListView lưới CSS). */
  la?: 'th' | 'div'
  className?: string
}

/**
 * TieuDeCot — tiêu đề cột của dạng xem Bảng (README Table "Nhãn cột", spec §5.3). Menu theo BẢN CHẤT dữ liệu:
 * `kieu: 'sap'` → mục sắp nói nghĩa bằng lời (`cot.nghia`), `aria-sort` trên ô; `kieu: 'loc'` → tick nhiều tag (menu giữ
 * mở) + "Bỏ lọc cột này", KHÔNG có mục sắp (cột lọc nhận `sap` → ném lỗi lúc chạy); `thuong` → nhãn trần.
 * Trong `KeoCot`: kéo cả ô để đổi chỗ (chuột) / Space nhấc · ←→ dời · Space thả · Esc huỷ (bàn phím, câu đọc tiếng Việt);
 * Enter / ↓ mở menu. Một lớp hover: cả ô sáng, nút menu phủ kín ô; không icon tay cầm (con trỏ grab).
 */
export function TieuDeCot<C extends CotBang>(props: PropsTieuDeCot<C>) {
  const p = props as PropsTieuDeCot
  const { cot } = p
  if (process.env.NODE_ENV !== 'production') {
    if (cot.kieu !== 'sap' && (cot.nghia || p.sap))
      throw new Error(
        `TieuDeCot: cột "${cot.ten}" kiểu "${cot.kieu}" không sắp được — chỉ cột có thứ tự/số lượng (kieu 'sap') có menu sắp; cột nhãn chỉ lọc theo tag (README Table).`,
      )
    if (cot.kieu !== 'loc' && p.loc)
      throw new Error(`TieuDeCot: cột "${cot.ten}" kiểu "${cot.kieu}" không lọc theo tag được — khai kieu 'loc'.`)
  }
  return useContext(KeoCtx) ? <TieuDeKeo {...p} /> : <ODau p={p} />
}

type Keo = {
  nodeRef: (el: HTMLElement | null) => void
  handleRef: (el: HTMLElement | null) => void
  onPointerDown?: PointerEventHandler
  onKeyDown: (e: ReactKeyboardEvent) => void
  moTa?: string
  dangKeo: boolean
  ketThuc: { current: number }
}

function TieuDeKeo(p: PropsTieuDeCot) {
  const ctx = useContext(KeoCtx)!
  const so = useSortable({ id: p.cot.id, disabled: { draggable: !!p.cot.khoa, droppable: false } })
  const keo: Keo = {
    nodeRef: so.setNodeRef,
    handleRef: so.setActivatorNodeRef,
    onPointerDown: so.listeners?.onPointerDown as PointerEventHandler | undefined,
    onKeyDown: (e) => {
      // Đang nhấc: phím thuộc cảm biến kéo (nó nghe ở document) — chặn Radix mở menu bằng Space/Enter/↓ khi thả.
      // Esc cũng preventDefault: listener Esc ở document (thanh hàng loạt bang/ — bỏ hết dòng đã chọn) chạy TRƯỚC listener
      // của cảm biến và chỉ nhường phím đã bị chặn. Chừa Tab (thả + đi tiếp như thường).
      if (so.active) {
        if (e.key !== 'Tab') e.preventDefault()
        return
      }
      so.listeners?.onKeyDown?.(e)
    },
    moTa: p.cot.khoa ? undefined : so.attributes['aria-describedby'],
    dangKeo: !!so.active,
    ketThuc: ctx.ketThuc,
  }
  return <ODau p={p} keo={keo} />
}

function ODau({ p, keo }: { p: PropsTieuDeCot; keo?: Keo }) {
  const { cot, sap, loc, coDan, viTri = 0, menuPhai, la = 'th', className } = p
  const [mo, setMo] = useState(false)
  const bd = useRef<{ x: number; w: number } | null>(null)
  const oKeo = useOKeo(cot.id)
  const Tag = la
  const soLoc = loc?.daChon.length ?? 0
  const coMenu = (cot.kieu === 'sap' && !!sap) || (cot.kieu === 'loc' && !!loc)
  const min = toiThieu(cot)
  const nghia = cot.kieu === 'sap' && sap?.chieu ? cot.nghia[sap.chieu] : null
  const tenNho = cot.ten.toLowerCase()

  const nhan = (
    <>
      <span className="min-w-0 truncate">{cot.ten}</span>
      {nghia && (
        <>
          {sap?.chieu === 'tang' ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />}
          <span className="sr-only">, đang sắp {nghia.toLowerCase()}</span>
        </>
      )}
      {soLoc > 0 && (
        <span className={s.thLoc}>
          <Funnel weight="fill" aria-hidden="true" />
          <span aria-hidden="true">{soLoc}</span>
          <span className="sr-only">, đang lọc {soLoc}</span>
        </span>
      )}
      {/* Mũi menu (hiện 50% khi rê) chỉ khi chưa có dấu sắp/lọc — dấu đó đã báo cột có menu; cột hẹp (Ưu tiên 76) không
          phải cắt chữ để chừa chỗ cho cả hai. */}
      {coMenu && !nghia && !soLoc && <CaretDown data-an="" aria-hidden="true" />}
    </>
  )

  const nutLop = cn(s.thSort, cot.phai && s.thSortPhai)
  let noiDung: ReactNode
  if (coMenu) {
    noiDung = (
      <DropdownMenu open={mo} onOpenChange={setMo}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            ref={keo?.handleRef}
            className={nutLop}
            data-on={nghia || soLoc ? '' : undefined}
            aria-describedby={keo?.moTa}
            onKeyDown={keo?.onKeyDown}
            // Trong KeoCot: nhấn chuột là bắt đầu KÉO — menu mở khi nhả (click), không mở lúc nhấn như Radix mặc định
            // (menu modal mở giữa lúc kéo). Giao cho cảm biến kéo TRƯỚC rồi mới preventDefault (chặn Radix): dnd-kit bỏ
            // qua sự kiện đã bị preventDefault (đo bằng chuột CDP thật). Click ngay sau khi thả / lúc đang nhấc → bỏ qua.
            onPointerDown={
              keo
                ? (e) => {
                    keo.onPointerDown?.(e)
                    e.preventDefault()
                  }
                : undefined
            }
            onClick={
              keo
                ? () => {
                    if (keo.dangKeo || Date.now() - keo.ketThuc.current < 300) return
                    setMo((m) => !m)
                  }
                : undefined
            }
          >
            {nhan}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={cot.phai || menuPhai ? 'end' : 'start'}
          aria-labelledby={undefined}
          aria-label={cot.kieu === 'sap' ? `Sắp xếp theo ${tenNho}` : `Lọc theo ${tenNho}`}
          // preview khối "Menu tiêu đề cột": menu rộng 240.
          className="w-[240px]"
        >
          {cot.kieu === 'sap' && sap && (
            <>
              <DropdownMenuLabel>Sắp xếp</DropdownMenuLabel>
              <DropdownMenuPrimitive.RadioGroup value={sap.chieu ?? ''} onValueChange={(v) => sap.onDoi(v as Chieu)}>
                {(['tang', 'giam'] as const).map((ch) => (
                  <DropdownMenuPrimitive.RadioItem key={ch} value={ch} className={menuItem}>
                    {cot.nghia[ch]}
                    <DropdownMenuPrimitive.ItemIndicator asChild>
                      <Check aria-hidden="true" className={menuCheck} />
                    </DropdownMenuPrimitive.ItemIndicator>
                  </DropdownMenuPrimitive.RadioItem>
                ))}
              </DropdownMenuPrimitive.RadioGroup>
              {sap.chieu && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => sap.onDoi(null)}>Bỏ sắp xếp</DropdownMenuItem>
                </>
              )}
            </>
          )}
          {cot.kieu === 'loc' && loc && (
            <>
              <DropdownMenuLabel>Hiện {tenNho}</DropdownMenuLabel>
              {loc.tuyChon.map((m) => {
                const bat = loc.daChon.includes(m.giaTri)
                return (
                  <DropdownMenuCheckboxItem
                    key={m.giaTri}
                    checked={bat}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(b) =>
                      loc.onDoi(b ? [...loc.daChon, m.giaTri] : loc.daChon.filter((x) => x !== m.giaTri))
                    }
                  >
                    <Badge variant="outline">
                      {m.color && <BadgeDot color={m.color} />}
                      {m.nhan}
                    </Badge>
                  </DropdownMenuCheckboxItem>
                )
              })}
              {soLoc > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => loc.onDoi([])}>Bỏ lọc cột này</DropdownMenuItem>
                </>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  } else if (keo && !cot.khoa) {
    // Cột không menu: nhãn là tay cầm bàn phím (role button của dnd-kit) — không có gì khác để focus.
    noiDung = (
      <span
        ref={keo.handleRef}
        role="button"
        tabIndex={0}
        aria-roledescription="cột kéo được"
        aria-describedby={keo.moTa}
        onKeyDown={keo.onKeyDown}
        className={nutLop}
      >
        {nhan}
      </span>
    )
  } else noiDung = <span className={cn('flex min-w-0', cot.phai && 'justify-end')}>{nhan}</span>

  const ariaSort = cot.kieu === 'sap' && sap ? (sap.chieu === 'tang' ? 'ascending' : sap.chieu === 'giam' ? 'descending' : 'none') : undefined

  return (
    <Tag
      ref={keo?.nodeRef}
      data-slot="table-head"
      data-cot={cot.id}
      role={la === 'div' ? 'columnheader' : undefined}
      aria-sort={ariaSort}
      {...oKeo}
      className={cn(s.th, keo && !cot.khoa && s.thKeo, s.oKeo, cot.phai && s.phai, className)}
      style={{ zIndex: Math.max(3, 20 - viTri) }}
      onPointerDown={keo?.onPointerDown}
    >
      {noiDung}
      {coDan && (
        <span
          role="separator"
          aria-orientation="vertical"
          aria-label={`Đổi độ rộng cột ${cot.ten}`}
          aria-valuenow={coDan.rong}
          aria-valuemin={min}
          tabIndex={0}
          className={s.tayCo}
          onPointerDown={(e) => {
            e.stopPropagation() // không để cảm biến kéo cột ở ô bắt đầu kéo
            e.preventDefault()
            e.currentTarget.setPointerCapture(e.pointerId)
            bd.current = { x: e.clientX, w: coDan.rong }
          }}
          onPointerMove={(e) => {
            const b = bd.current
            if (b) coDan.onDoi(Math.max(min, Math.round(b.w + e.clientX - b.x)))
          }}
          onPointerUp={() => {
            bd.current = null
          }}
          onDoubleClick={() => coDan.onDoi(cot.rong)}
          onKeyDown={(e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
            e.preventDefault()
            coDan.onDoi(Math.max(min, coDan.rong + (e.key === 'ArrowRight' ? 8 : -8)))
          }}
        />
      )}
    </Tag>
  )
}

const vaCham: CollisionDetection = (a) => {
  const tro = pointerWithin(a)
  return tro.length ? tro : closestCenter(a)
}

/**
 * KeoCot — bọc `<Table>` để kéo đổi chỗ cột (dnd-kit cổ điển, ruling R8): chuột kéo cả ô tiêu đề (nhích 4px mới tính
 * kéo — bấm thường vẫn mở menu), bàn phím Space nhấc · ←→ dời · Space/Enter thả · Esc huỷ. Cột nguồn mờ, vạch thả 2px
 * ring suốt chiều cao bảng: chuột theo nửa ô đang rê, phím theo hướng dời. Bóng kéo = thẻ nhỏ tên cột (`.b-keo-bong`).
 * `cot` = cột ĐANG HIỆN đúng thứ tự (`useCotBang().hien`), `doiCho` = `useCotBang().doiCho`.
 */
export function KeoCot({
  cot,
  doiCho,
  children,
}: {
  cot: CotBang[]
  doiCho: (id: string, dich: string, ben: BenTha) => void
  children: ReactNode
}) {
  const id = useId()
  const portal = useDsPortal()
  const [keo, setKeo] = useState<string | null>(null)
  const [tren, setTren] = useState<{ id: string; ben: BenTha } | null>(null)
  const trenRef = useRef(tren)
  const ketThuc = useRef(0)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      // Enter để mở menu tiêu đề → chỉ Space nhấc; thả bằng Space/Enter/Tab.
      keyboardCodes: {
        start: [KeyboardCode.Space],
        cancel: [KeyboardCode.Esc],
        end: [KeyboardCode.Space, KeyboardCode.Enter, KeyboardCode.Tab],
      },
    }),
  )
  const ids = cot.map((c) => c.id)
  const ten = (x: UniqueIdentifier) => cot.find((c) => c.id === x)?.ten ?? String(x)
  const viTri = (x: UniqueIdentifier) => ids.indexOf(String(x))
  const huong = (a: UniqueIdentifier, o: UniqueIdentifier) => (viTri(o) > viTri(a) ? 'sau' : 'trước')

  const datTren = (t: { id: string; ben: BenTha } | null) => {
    trenRef.current = t
    setTren((cu) => (cu?.id === t?.id && cu?.ben === t?.ben ? cu : t))
  }
  const capNhat = (e: DragMoveEvent) => {
    const o = e.over
    if (!o || o.id === e.active.id) return datTren(null)
    const ev = e.activatorEvent
    let ben: BenTha
    if ('clientX' in ev && typeof ev.clientX === 'number') {
      const x = ev.clientX + e.delta.x
      ben = x > o.rect.left + o.rect.width / 2 ? 'phai' : 'trai'
    } else ben = viTri(o.id) > viTri(e.active.id) ? 'phai' : 'trai'
    datTren({ id: String(o.id), ben })
  }
  const xong = () => {
    setKeo(null)
    datTren(null)
    ketThuc.current = Date.now()
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      `Đã nhấc cột ${ten(active.id)}. Mũi tên trái phải để dời, Space để thả, Esc để huỷ.`,
    // Lúc vừa nhấc dnd-kit báo "đang trên chính nó" ngay → im, không đè câu "Đã nhấc".
    onDragOver: ({ active, over }) =>
      over && over.id !== active.id
        ? `Cột ${ten(active.id)} sẽ nằm ${huong(active.id, over.id)} cột ${ten(over.id)}.`
        : undefined,
    onDragEnd: ({ active, over }) =>
      over && over.id !== active.id
        ? `Đã thả cột ${ten(active.id)} ${huong(active.id, over.id)} cột ${ten(over.id)}.`
        : `Đã thả cột ${ten(active.id)} ở chỗ cũ.`,
    onDragCancel: ({ active }) => `Đã huỷ kéo. Cột ${ten(active.id)} về chỗ cũ.`,
  }

  return (
    <KeoCtx.Provider value={{ keo, tren, ketThuc }}>
      <DndContext
        id={id}
        sensors={sensors}
        collisionDetection={vaCham}
        accessibility={{
          announcements,
          container: portal ?? undefined,
          screenReaderInstructions: {
            draggable:
              'Nhấn Space để nhấc cột. Khi đang nhấc: mũi tên trái phải để dời, Space để thả, Esc để huỷ. Enter mở menu của cột.',
          },
        }}
        onDragStart={(e) => setKeo(String(e.active.id))}
        onDragMove={capNhat}
        onDragOver={capNhat}
        onDragEnd={(e) => {
          const t = trenRef.current
          if (t) doiCho(String(e.active.id), t.id, t.ben)
          xong()
        }}
        onDragCancel={xong}
      >
        <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
          {children}
        </SortableContext>
        {/* z 90 = lớp menu (thang z NGUON) — bóng kéo nổi trên header dính và mọi lớp trang. */}
        <DragOverlay dropAnimation={null} zIndex={90}>
          {keo ? (
            <span data-slot="keo-bong" className={s.keoBong}>
              {ten(keo)}
            </span>
          ) : null}
        </DragOverlay>
      </DndContext>
    </KeoCtx.Provider>
  )
}
