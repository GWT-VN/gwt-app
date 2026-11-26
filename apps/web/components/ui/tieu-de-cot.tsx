'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CaretDown, EyeSlash, Funnel } from '@phosphor-icons/react/ssr'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Badge, BadgeDot } from './badge'
import { useDsPortal } from './ds-root'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { VungDoc } from './skeleton'
import { KeoCtx, useOKeo } from './table'
import * as s from './table-styles'
import { laGhim, RONG_O_CHON, toiThieu, type BenTha, type CotBang, type MenuCot } from './use-cot-bang'

/**
 * Câu đọc cho thao tác cột KHÔNG qua kéo (menu tiêu đề Dời trái/phải/Ẩn, nút "+" `ThemCot`): `KeoCot` giữ một vùng
 * `VungDoc` (role status) trong ô portal DS — vùng có sẵn từ lúc mở trang nên câu mới được đọc. Ngoài `KeoCot` = im.
 */
export const BaoCotCtx = createContext<((cau: string) => void) | null>(null)

/**
 * Cảm biến phím kéo của DS (`KeoCot`, `CotHienThi`) = `KeyboardSensor` của dnd-kit, BỎ việc huỷ kéo khi `visibilitychange`.
 * dnd-kit 6.3.1 huỷ kéo phím mỗi lần tab đổi hiện/ẩn; khung Browser của app Claude (và trình duyệt nhúng) bắn sự kiện này
 * liên tục khi khung bị che/hiện → nhấc cột xong bấm ↑ là "Đã huỷ kéo" (đo 26/11). Kéo phím dở dang khi đổi tab không
 * hỏng gì: quay lại vẫn dời/thả/Esc tiếp được. Huỷ khi đổi cỡ cửa sổ (toạ độ cũ sai) và Esc giữ nguyên.
 * ponytail: vá phương thức riêng `handleCancel` của dnd-kit 6.3.1 (constructor tự bind theo prototype) — nâng dnd-kit thì
 * chạy lại test "visibilitychange không huỷ kéo" (table.dom.test, cot-bang.dom.test).
 */
export class CamBienPhimKeo extends KeyboardSensor {}
const huyGoc = (KeyboardSensor.prototype as unknown as { handleCancel(e: Event): void }).handleCancel
Object.assign(CamBienPhimKeo.prototype, {
  handleCancel(this: unknown, e: Event) {
    if (e.type !== 'visibilitychange') huyGoc.call(this, e)
  },
})

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
  /**
   * Lọc theo trường (bo-loc-truong, học Twenty: menu cột → "Filter"): menu thêm "Lọc…" ở đầu → menu đóng rồi gọi
   * `onMo(nút tiêu đề)` — thường là `useMoLoc().mo(id, neo)`. `dang` = trường đang có điều kiện → dấu phễu trên tiêu đề.
   * Mọi kiểu cột dùng được (kể cả cột khoá). Dùng thay `loc` (tick nhanh "là") khi màn có bộ lọc theo trường.
   */
  moLoc?: { dang: boolean; onMo: (neo: HTMLElement) => void }
  /**
   * Có → tay co dãn ở mép phải (kéo / ←→ 8px / nhấp đúp → `onDoi(null)` = về mặc định: `cot.rong` khai sẵn, không khai thì
   * vừa nội dung — `useCotBang().coDan`).
   */
  coDan?: { rong: number; onDoi: (rong: number | null) => void }
  /** Menu canh phải ô (cột sát mép phải bảng, vd Chủ). Cột `phai` tự canh phải. */
  menuPhai?: boolean
  /**
   * Có → menu tiêu đề thêm (sau vạch) "Dời sang trái" · "Dời sang phải" · "Ẩn cột" — `useCotBang().menuCot(cot.id)`
   * (cột khoá trả `undefined` = không mục). Mép / kề cột khoá → mục dời hiện nhưng tắt. Cột `thuong` có `menuCot` cũng
   * có menu. Dời / ẩn có câu đọc (trong `KeoCot`); ẩn xong focus sang tiêu đề kế bên (hết thì tiêu đề trước).
   */
  menuCot?: MenuCot
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
 * `menuCot` (26/11, học Twenty) → menu thêm Dời sang trái / Dời sang phải / Ẩn cột cho cột không khoá.
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
  datO: (el: HTMLElement | null) => void
  datTay: (el: HTMLElement | null) => void
  onPointerDown?: PointerEventHandler
  onKeyDown: (e: ReactKeyboardEvent) => void
  moTa?: string
  dangKeo: boolean
}

function TieuDeKeo(p: PropsTieuDeCot) {
  const so = useSortable({ id: p.cot.id, disabled: { draggable: !!p.cot.khoa, droppable: false } })
  const keo: Keo = {
    datO: so.setNodeRef,
    datTay: so.setActivatorNodeRef,
    onPointerDown: so.listeners?.onPointerDown as PointerEventHandler | undefined,
    onKeyDown: (e) => {
      // Đang nhấc: phím thuộc cảm biến kéo (nó nghe ở document) — chặn Radix mở menu bằng Space/Enter/↓ khi thả.
      // Chừa Tab (thả + đi tiếp như thường). Esc: `useEscKhiKeo` đã chặn ở document cho mọi cảm biến.
      if (so.active) {
        if (e.key !== 'Tab') e.preventDefault()
        return
      }
      so.listeners?.onKeyDown?.(e)
    },
    moTa: p.cot.khoa ? undefined : so.attributes['aria-describedby'],
    dangKeo: !!so.active,
  }
  return <ODau p={p} keo={keo} />
}

function ODau({ p, keo }: { p: PropsTieuDeCot; keo?: Keo }) {
  // Tách sẵn: luật react-hooks/refs coi cả object `keo` là ref vì một trường của nó gắn vào `ref=`.
  const coKeo = !!keo
  const { datO, datTay, onPointerDown: nhanKeo, onKeyDown: phimKeo, moTa, dangKeo } = keo ?? {}
  const { cot, sap, loc, moLoc, coDan, viTri = 0, menuPhai, la = 'th', className } = p
  const menuCot = cot.khoa ? undefined : p.menuCot
  const [mo, setMo] = useState(false)
  const bd = useRef<{ x: number; w: number } | null>(null)
  const oKeo = useOKeo(cot.id)
  const ketThuc = useContext(KeoCtx)?.ketThuc
  const bao = useContext(BaoCotCtx)
  // Ô tiêu đề (để tìm ô kế bên khi ẩn cột) + ref kéo của dnd-kit — gộp trong một callback ổn định.
  const oRef = useRef<HTMLElement | null>(null)
  const datOGop = useCallback(
    (el: HTMLElement | null) => {
      oRef.current = el
      datO?.(el)
    },
    [datO],
  )
  const Tag = la
  const soLoc = loc?.daChon.length ?? 0
  const coSapLoc = (cot.kieu === 'sap' && !!sap) || (cot.kieu === 'loc' && !!loc)
  const coMenu = coSapLoc || !!menuCot || !!moLoc
  // "Lọc…" chọn xong: chờ menu đóng hẳn (Radix trả focus) rồi mới mở pop lọc — không để focus của menu giành lại.
  const choMoLoc = useRef(false)
  const dangLoc = soLoc > 0 || !!moLoc?.dang
  const min = toiThieu(cot)
  const nghia = cot.kieu === 'sap' && sap?.chieu ? cot.nghia[sap.chieu] : null
  const tenNho = cot.ten.toLowerCase()

  const doiCot = (ben: BenTha) => {
    const ke = ben === 'trai' ? menuCot?.trai : menuCot?.phai
    if (!menuCot || !ke) return
    menuCot.onDoi(ben)
    bao?.(`Đã dời cột ${cot.ten} sang ${ben === 'trai' ? 'trái, trước' : 'phải, sau'} cột ${ke}.`)
  }
  const anCot = () => {
    if (!menuCot) return
    // Ô này sắp bị gỡ (Radix trả focus về nút đã mất) → đưa focus sang tiêu đề kế bên sau khi dựng lại.
    const o = oRef.current
    const ke = (o?.nextElementSibling ?? o?.previousElementSibling) as HTMLElement | null
    menuCot.onAn()
    bao?.(`Đã ẩn cột ${cot.ten}.`)
    requestAnimationFrame(() => ke?.querySelector<HTMLElement>('button, input, [tabindex="0"]')?.focus())
  }

  const nhan = (
    <>
      <span className="min-w-0 truncate">{cot.ten}</span>
      {nghia && (
        <>
          {sap?.chieu === 'tang' ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />}
          <span className="sr-only">, đang sắp {nghia.toLowerCase()}</span>
        </>
      )}
      {dangLoc && (
        <span className={s.thLoc}>
          <Funnel weight="fill" aria-hidden="true" />
          {soLoc > 0 && <span aria-hidden="true">{soLoc}</span>}
          <span className="sr-only">, đang lọc{soLoc > 0 ? ` ${soLoc}` : ''}</span>
        </span>
      )}
      {/* Mũi menu (hiện 50% khi rê) chỉ khi chưa có dấu sắp/lọc — dấu đó đã báo cột có menu; cột hẹp (Ưu tiên 76) không
          phải cắt chữ để chừa chỗ cho cả hai. */}
      {coMenu && !nghia && !dangLoc && <CaretDown data-an="" aria-hidden="true" />}
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
            ref={datTay}
            className={nutLop}
            data-on={nghia || dangLoc ? '' : undefined}
            aria-describedby={moTa}
            onKeyDown={phimKeo}
            // Trong KeoCot: nhấn chuột là bắt đầu KÉO — menu mở khi nhả (click), không mở lúc nhấn như Radix mặc định
            // (menu modal mở giữa lúc kéo). Giao cho cảm biến kéo TRƯỚC rồi mới preventDefault (chặn Radix): dnd-kit bỏ
            // qua sự kiện đã bị preventDefault (đo bằng chuột CDP thật). Click ngay sau khi thả / lúc đang nhấc → bỏ qua.
            onPointerDown={
              coKeo
                ? (e) => {
                    nhanKeo?.(e)
                    e.preventDefault()
                  }
                : undefined
            }
            onClick={
              coKeo
                ? () => {
                    if (dangKeo || Date.now() - (ketThuc?.current ?? 0) < 300) return
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
          aria-label={
            moLoc
              ? `Cột ${tenNho}`
              : cot.kieu === 'sap' && sap
                ? `Sắp xếp theo ${tenNho}`
                : cot.kieu === 'loc' && loc
                  ? `Lọc theo ${tenNho}`
                  : `Cột ${tenNho}`
          }
          // preview khối "Menu tiêu đề cột": menu rộng 240.
          className="w-[240px]"
          onCloseAutoFocus={(e) => {
            if (!choMoLoc.current || !moLoc) return
            choMoLoc.current = false
            const nut = oRef.current?.querySelector<HTMLElement>('button')
            if (!nut) return
            e.preventDefault()
            moLoc.onMo(nut)
          }}
        >
          {moLoc && (
            <>
              <DropdownMenuItem onSelect={() => (choMoLoc.current = true)}>
                <Funnel aria-hidden="true" />
                Lọc…
              </DropdownMenuItem>
              {(coSapLoc || menuCot) && <DropdownMenuSeparator />}
            </>
          )}
          {cot.kieu === 'sap' && sap && (
            <>
              <DropdownMenuLabel>Sắp xếp</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sap.chieu ?? ''} onValueChange={(v) => sap.onDoi(v as Chieu)}>
                {(['tang', 'giam'] as const).map((ch) => (
                  <DropdownMenuRadioItem key={ch} value={ch}>
                    {cot.nghia[ch]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
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
          {menuCot && (
            <>
              {coSapLoc && <DropdownMenuSeparator />}
              <DropdownMenuItem disabled={!menuCot.trai} onSelect={() => doiCot('trai')}>
                <ArrowLeft aria-hidden="true" />
                Dời sang trái
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!menuCot.phai} onSelect={() => doiCot('phai')}>
                <ArrowRight aria-hidden="true" />
                Dời sang phải
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={anCot}>
                <EyeSlash aria-hidden="true" />
                Ẩn cột
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  } else if (coKeo && !cot.khoa) {
    // Cột không menu: nhãn là tay cầm bàn phím (role button của dnd-kit) — không có gì khác để focus.
    noiDung = (
      <span
        ref={datTay}
        role="button"
        tabIndex={0}
        aria-roledescription="cột kéo được"
        aria-describedby={moTa}
        onKeyDown={phimKeo}
        className={nutLop}
      >
        {nhan}
      </span>
    )
  } else noiDung = <span className={cn('flex min-w-0', cot.phai && 'justify-end')}>{nhan}</span>

  // Cột khoá đứng đầu → dính trái khi bảng cuộn ngang (ô thân: `TableCell ghim`). ListView (div) không cuộn ngang.
  const ghim = la === 'th' && laGhim(cot, viTri)
  const ariaSort = cot.kieu === 'sap' && sap ? (sap.chieu === 'tang' ? 'ascending' : sap.chieu === 'giam' ? 'descending' : 'none') : undefined

  return (
    <Tag
      ref={datOGop}
      data-slot="table-head"
      data-cot={cot.id}
      data-ghim={ghim ? '' : undefined}
      role={la === 'div' ? 'columnheader' : undefined}
      aria-sort={ariaSort}
      {...oKeo}
      className={cn(s.th, coKeo && !cot.khoa && s.thKeo, s.oKeo, cot.phai && s.phai, ghim && s.thGhim, className)}
      style={{ zIndex: Math.max(3, 20 - viTri) }}
      onPointerDown={nhanKeo}
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
          onDoubleClick={() => coDan.onDoi(null)}
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

/**
 * Đang kéo (`dangKeo`, bất kể cảm biến): Esc chỉ để huỷ kéo. Cảm biến chuột/pointer của dnd-kit 6 huỷ kéo khi Esc nhưng
 * KHÔNG preventDefault → phím trôi tới ThanhDaChon (`escBoChon`, window pha nổi) và bỏ hết dòng đã chọn. Chặn ở
 * document pha capture: dnd-kit không đọc `defaultPrevented` nên vẫn tự huỷ; ai nhường phím đã xử lý thì nhường.
 * Kèm dấu `data-dang-keo` trên body cho listener gắn TRƯỚC (XemNhanh, cũng capture ở document) biết mà bỏ qua.
 */
export function useEscKhiKeo(dangKeo: boolean) {
  useEffect(() => {
    if (!dangKeo) return
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault()
    }
    document.addEventListener('keydown', k, true)
    document.body.setAttribute('data-dang-keo', '')
    return () => {
      document.removeEventListener('keydown', k, true)
      document.body.removeAttribute('data-dang-keo')
    }
  }, [dangKeo])
}

/**
 * `<colgroup>` của bảng dùng `useCotBang` — học Twenty (`useResizeTableHeader`): MỌI cột, kể cả cột khoá đầu, rộng cố
 * định theo `doRong`; một `<col>` CUỐI không đặt rộng = cột trống ăn phần dư của khung (cột "+" `ThemCot`, hoặc ô trống
 * `cotDem`). Kéo tay co mép phải cột X → chỉ X đổi, các cột sau dời theo, mép tay co luôn dưới chuột; tổng vượt khung →
 * bảng cuộn ngang (`<Table layout="fixed" style={{ minWidth: RONG_O_CHON + tongRong + <cột cuối> }}>`). KHÔNG để một cột
 * thật "ăn phần dư": kéo cột khác thì cột đó co bù → mép trái cột đang kéo chạy ngược (CEO 26/11). Hàng tiêu đề và mọi
 * hàng thân cần ô cuối tương ứng để kẻ ngang hết bề rộng.
 */
export function ColCotBang({ hien, doRong, chon = true }: { hien: CotBang[]; doRong: Record<string, number>; chon?: boolean }) {
  return (
    <colgroup>
      {chon && <col style={{ width: RONG_O_CHON }} />}
      {hien.map((x) => (
        <col key={x.id} data-cot={x.id} style={{ width: doRong[x.id] }} />
      ))}
      <col data-cot-cuoi="" />
    </colgroup>
  )
}

const vaCham: CollisionDetection = (a) => {
  const tro = pointerWithin(a)
  return tro.length ? tro : closestCenter(a)
}

/**
 * KeoCot — bọc `<Table>` để kéo đổi chỗ cột (dnd-kit cổ điển, ruling R8): chuột kéo cả ô tiêu đề (nhích 8px mới tính
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
  const [cauBao, setCauBao] = useState('')
  const trenRef = useRef(tren)
  const ketThuc = useRef(0)
  useEscKhiKeo(!!keo)
  const sensors = useSensors(
    // 8px như Twenty: bấm gần mép mà lệch khỏi tay co dãn không thành kéo đổi chỗ cột (nền xám + vạch 2px) quá dễ.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(CamBienPhimKeo, {
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
      <BaoCotCtx.Provider value={setCauBao}>
        {portal && createPortal(<VungDoc chu={cauBao} />, portal)}
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
      </BaoCotCtx.Provider>
    </KeoCtx.Provider>
  )
}
