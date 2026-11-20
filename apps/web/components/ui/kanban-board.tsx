'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  DragOverlay,
  KeyboardCode,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type KeyboardCoordinateGetter,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { ArrowCounterClockwise, WarningCircle } from '@phosphor-icons/react/ssr'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, chuCaiDau } from './avatar'
import { Badge, type badgeVariants } from './badge'
import { Button } from './button'
import { Card } from './card'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from './context-menu'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogTitle } from './dialog'
import { useDsPortal } from './ds-root'
import { Field, FieldError, FieldLabel } from './field'
import { cat, khach as lopKhach, LY_DO_CHO, luuY as lopLuuY } from './inline-edit-styles'
import * as s from './kanban-styles'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { thongBao } from './toast'

type MauBadge = NonNullable<VariantProps<typeof badgeVariants>['color']>

export type CotKanban = {
  id: string
  nhan: string
  /** Màu tag đầu cột (Badge soft theo nghĩa: mới discovery · đang xử lý info · chờ warning · đóng success); bỏ = xám. */
  color?: MauBadge
  /** Vào cột này phải chọn lý do (vd "Chờ") — hỏi bằng hộp trước khi gọi `onChuyen`. */
  hoiLyDo?: boolean
}

export type TheKanban = {
  id: string
  /** id cột đang đứng. */
  cot: string
  /** Lý do của cột `hoiLyDo` đang đứng — Hoàn tác trả lại đúng lý do này. */
  lyDo?: string
  /** Tên ngắn (thường là mã) cho câu đọc kéo thả, toast, nhãn menu. */
  ten: string
  /** Ruột thẻ — thường là `<NoiDungThe>`. */
  noiDung: ReactNode
}

export type PropsKanbanBoard = {
  cot: readonly CotKanban[]
  the: readonly TheKanban[]
  /**
   * Thẻ đổi cột (kéo thả, menu "Chuyển sang…", hoặc Hoàn tác). Trả Promise được; ném lỗi / reject → toast lỗi có Thử lại.
   * Bảng KHÔNG tự dời thẻ: bên gọi cập nhật `the`.
   */
  onChuyen: (id: string, cotMoi: string, lyDo?: string) => unknown
  /** Bấm thẻ / Enter → mở bản ghi. */
  onMo: (id: string) => void
  /** Mục riêng của thẻ trong menu chuột phải (vd Mở ticket, Sao chép mã) — đứng trên phần "Chuyển sang…". */
  menuThe?: (t: TheKanban) => ReactNode
  /** Lý do cho cột `hoiLyDo` (mặc định khách · KT · vật tư · hãng · duyệt — như InlineEdit). */
  lyDo?: readonly string[]
  className?: string
}

const chuLoi = (e: unknown) => (e instanceof Error && e.message ? e.message : 'lỗi không rõ')

/**
 * KanbanBoard — dạng xem Kanban theo trạng thái (README KanbanBoard, chốt 18/11): mỗi cột một trạng thái, kéo thẻ sang
 * cột khác để đổi trạng thái. Giá trị từ `.b-kanban`, `.b-k-*`, `.b-the*` của ds/nguon/bundle.css qua kanban-styles.ts.
 *
 * - Kéo (dnd-kit cổ điển, ruling R8): chuột nhích 4px mới tính kéo (bấm thường vẫn mở thẻ); bàn phím Space nhấc · ←→ sang
 *   cột · Space/Enter thả · Esc (hoặc Tab) huỷ, câu đọc tiếng Việt. Thẻ nguồn mờ, cột đích tô nền, bóng kéo = bản sao thẻ
 *   (z 90 lớp menu). Thả đúng cột cũ = không gì xảy ra. Cảm ứng KHÔNG kéo (vuốt là cuộn ngang qua các cột) — nhấn giữ thẻ
 *   mở menu "Chuyển sang…".
 * - Chuột phải / Shift+F10 / phím Menu trên thẻ → ContextMenu: mục riêng (`menuThe`) + "Chuyển sang…" mọi cột khác — đường
 *   cho người không kéo được.
 * - Vào cột `hoiLyDo`: hộp hỏi lý do (focus nút Huỷ như README Dialog); Huỷ / Esc = thẻ ở nguyên chỗ cũ.
 * - Chuyển xong → toast "<tên> → <cột>[ lý do]" có Hoàn tác (về cột + lý do cũ); lỗi → toast lỗi có Thử lại.
 * - Chuyển bằng phím / menu / hộp: focus đi theo thẻ sang cột mới (thẻ được dựng lại ở cột mới).
 * - Bấm thẻ / Enter → `onMo`. Thẻ `tabIndex=0`, role button (tên = nội dung thẻ).
 * - Cột rỗng: "Kéo thẻ vào đây". Rỗng do lọc CẢ MÀN: bên gọi vẽ `EmptyState kieu="loc"` thay cho bảng (như Table).
 * - ≤ 767: cột 82% bề ngang, cuộn ngang có snap. Bảng lấp chiều cao khung cha (flex cột) — khung cha đặt chiều cao.
 */
export function KanbanBoard({ cot, the, onChuyen, onMo, menuThe, lyDo = LY_DO_CHO, className }: PropsKanbanBoard) {
  const id = useId()
  const portal = useDsPortal()
  const [keo, setKeo] = useState<string | null>(null)
  const [tren, setTren] = useState<string | null>(null)
  const [hoi, setHoi] = useState<{ the: TheKanban; cot: CotKanban } | null>(null)
  const ketThuc = useRef(0)
  // Thẻ chờ nhận focus khi đã được dựng ở cột mới (chuyển bằng menu / hộp — node cũ đã gỡ, focus rơi về body). Thả bằng
  // phím: dnd-kit tự trả focus về thẻ cùng id (RestoreFocus); ghi ở đây vẫn vô hại.
  const theoThe = useRef<{ id: string; cot: string } | null>(null)
  const daRoi = useRef(false)
  const trenRef = useRef<string | null>(null)

  useEffect(() => {
    const t = theoThe.current
    if (!t) return
    const el = document.querySelector<HTMLElement>(
      `[data-cot-id="${CSS.escape(t.cot)}"] [data-the-id="${CSS.escape(t.id)}"]`,
    )
    if (!el) return
    theoThe.current = null
    el.focus({ preventScroll: true })
    el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  })

  const timThe = (x: UniqueIdentifier | null | undefined) => the.find((t) => t.id === x)
  const timCot = (x: UniqueIdentifier | null | undefined) => cot.find((c) => c.id === x)
  const tenThe = (x: UniqueIdentifier) => timThe(x)?.ten ?? String(x)
  const tenCot = (x: UniqueIdentifier) => timCot(x)?.nhan ?? String(x)
  const cotGoc = (x: UniqueIdentifier) => timThe(x)?.cot

  async function ghi(t: TheKanban, c: CotKanban, ly: string | undefined, theoFocus: boolean) {
    const cu = { cot: t.cot, lyDo: t.lyDo }
    if (theoFocus) theoThe.current = { id: t.id, cot: c.id }
    try {
      await onChuyen(t.id, c.id, ly)
    } catch (e) {
      theoThe.current = null
      thongBao.loi(`${t.ten}: chưa chuyển được sang ${c.nhan} — ${chuLoi(e)}`, { thuLai: () => void ghi(t, c, ly, false) })
      return
    }
    thongBao.xong(`${t.ten} → ${c.nhan}${ly ? ` ${ly}` : ''}`, {
      hoanTac: async () => {
        try {
          await onChuyen(t.id, cu.cot, cu.lyDo)
        } catch (e) {
          thongBao.loi(`${t.ten}: chưa hoàn tác được — ${chuLoi(e)}`)
        }
      },
    })
  }

  /** Thẻ `t` muốn sang cột `c`: cột cần lý do → mở hộp; không thì ghi luôn. */
  const chuyen = (t: TheKanban, c: CotKanban, theoFocus: boolean) => {
    if (c.id === t.cot) return
    if (c.hoiLyDo) setHoi({ the: t, cot: c })
    else void ghi(t, c, undefined, theoFocus)
  }

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: toaDoPhim(cot, trenRef),
      keyboardCodes: {
        start: [KeyboardCode.Space],
        cancel: [KeyboardCode.Esc, KeyboardCode.Tab],
        end: [KeyboardCode.Space, KeyboardCode.Enter],
      },
    }),
  )

  const datTren = (x: string | null) => {
    trenRef.current = x
    setTren(x)
  }
  const xong = () => {
    setKeo(null)
    datTren(null)
    ketThuc.current = Date.now()
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      `Đã nhấc thẻ ${tenThe(active.id)}. Mũi tên trái phải để sang cột khác, Space để thả, Esc để huỷ.`,
    // Lúc vừa nhấc dnd-kit báo "đang trên cột của chính nó" ngay → im, không đè câu "Đã nhấc".
    onDragOver: ({ active, over }) => {
      if (!over) return undefined
      if (over.id !== cotGoc(active.id)) {
        daRoi.current = true
        return `Thẻ ${tenThe(active.id)} sẽ sang cột ${tenCot(over.id)}.`
      }
      return daRoi.current ? `Thẻ ${tenThe(active.id)} về lại cột ${tenCot(over.id)}.` : undefined
    },
    onDragEnd: ({ active, over }) => {
      if (!over || over.id === cotGoc(active.id)) return `Đã thả thẻ ${tenThe(active.id)} ở chỗ cũ.`
      return timCot(over.id)?.hoiLyDo
        ? `Thẻ ${tenThe(active.id)} vào cột ${tenCot(over.id)}: chọn lý do.`
        : `Đã chuyển thẻ ${tenThe(active.id)} sang cột ${tenCot(over.id)}.`
    },
    onDragCancel: ({ active }) => `Đã huỷ kéo. Thẻ ${tenThe(active.id)} về chỗ cũ.`,
  }

  const dangKeo = timThe(keo)

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={vaCham}
      accessibility={{
        announcements,
        container: portal ?? undefined,
        screenReaderInstructions: {
          draggable:
            'Nhấn Space để nhấc thẻ. Khi đang nhấc: mũi tên trái phải để sang cột khác, Space để thả, Esc để huỷ. Enter mở thẻ; Shift+F10 mở menu Chuyển sang.',
        },
      }}
      onDragStart={(e) => {
        daRoi.current = false
        theoThe.current = null
        setKeo(String(e.active.id))
      }}
      onDragOver={(e) => datTren(e.over && e.over.id !== cotGoc(e.active.id) ? String(e.over.id) : null)}
      onDragEnd={(e) => {
        const t = timThe(e.active.id)
        const c = timCot(e.over?.id)
        xong()
        if (t && c) chuyen(t, c, e.activatorEvent instanceof KeyboardEvent)
      }}
      onDragCancel={xong}
    >
      <div data-slot="kanban-board" className={cn(s.bang, className)}>
        {cot.map((c) => {
          const ds = the.filter((t) => t.cot === c.id)
          return (
            <Cot key={c.id} cot={c} so={ds.length} tren={tren === c.id}>
              {ds.map((t) => (
                <The
                  key={t.id}
                  t={t}
                  cot={cot}
                  dangKeo={keo === t.id}
                  coKeo={!!keo}
                  ketThuc={ketThuc}
                  menuThe={menuThe}
                  onMo={onMo}
                  onChuyen={(c2) => chuyen(t, c2, true)}
                />
              ))}
            </Cot>
          )
        })}
      </div>
      {/* Bóng kéo portal vào ô DS (khung chứa có container-type/transform không làm lệch vị trí fixed); z 90 = lớp menu. */}
      {portal &&
        createPortal(
          <DragOverlay dropAnimation={null} zIndex={90}>
            {dangKeo ? (
              <Card data-slot="kanban-bong" className={cn(s.the, s.theBong)}>
                {dangKeo.noiDung}
              </Card>
            ) : null}
          </DragOverlay>,
          portal,
        )}
      <HopLyDo
        hoi={hoi}
        lyDo={lyDo}
        onHuy={() => setHoi(null)}
        onChon={(ly) => {
          if (!hoi) return
          setHoi(null)
          void ghi(hoi.the, hoi.cot, ly, true)
        }}
      />
    </DndContext>
  )
}

/** Chuột: cột dưới con trỏ. Phím (không có con trỏ): cột giao nhiều nhất với bóng kéo. */
const vaCham: CollisionDetection = (a) => {
  const tro = pointerWithin(a)
  return tro.length ? tro : rectIntersection(a)
}

/**
 * ←/→ khi đang nhấc bằng phím: đặt bóng kéo vào giữa cột kề (dưới đầu cột) — một phím một cột. ↑/↓ chặn cuộn trang,
 * không dời (thứ tự trong cột theo dữ liệu, không kéo đổi được).
 */
function toaDoPhim(cot: readonly CotKanban[], trenRef: { current: string | null }): KeyboardCoordinateGetter {
  return (e, { active, context }) => {
    const ngang = e.code === KeyboardCode.Right || e.code === KeyboardCode.Left
    if (!ngang && e.code !== KeyboardCode.Up && e.code !== KeyboardCode.Down) return
    e.preventDefault()
    const hop = context.collisionRect
    if (!ngang || !hop) return
    const hien = trenRef.current ?? (context.over?.id as string | undefined) ?? (context.active?.data.current?.cot as string | undefined)
    const i = cot.findIndex((c) => c.id === hien) + (e.code === KeyboardCode.Right ? 1 : -1)
    const r = i >= 0 && i < cot.length ? context.droppableRects.get(cot[i].id) : undefined
    if (!r || !active) return
    return { x: r.left + (r.width - hop.width) / 2, y: r.top + 40 }
  }
}

function Cot({ cot, so, tren, children }: { cot: CotKanban; so: number; tren: boolean; children: ReactNode }) {
  const { setNodeRef } = useDroppable({ id: cot.id })
  return (
    <section ref={setNodeRef} data-cot-id={cot.id} data-tren={tren || undefined} aria-label={cot.nhan} className={s.cot}>
      <header className={s.cotDau}>
        <Badge color={cot.color ?? 'secondary'}>{cot.nhan}</Badge>
        <span className={s.cotDem}>{so}</span>
      </header>
      <div className={s.cotDs}>{so ? children : <div className={s.cotRong}>Kéo thẻ vào đây</div>}</div>
    </section>
  )
}

function The({
  t,
  cot,
  dangKeo,
  coKeo,
  ketThuc,
  menuThe,
  onMo,
  onChuyen,
}: {
  t: TheKanban
  cot: readonly CotKanban[]
  dangKeo: boolean
  coKeo: boolean
  ketThuc: { current: number }
  menuThe?: (t: TheKanban) => ReactNode
  onMo: (id: string) => void
  onChuyen: (c: CotKanban) => void
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: t.id,
    data: { cot: t.cot },
    attributes: { roleDescription: 'thẻ kéo được' },
  })
  const khac = cot.filter((c) => c.id !== t.cot)
  const mucRieng = menuThe?.(t)
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card
          ref={setNodeRef}
          data-the-id={t.id}
          data-keo={dangKeo || undefined}
          {...attributes}
          aria-pressed={undefined}
          {...listeners}
          className={s.the}
          onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
            // Đang nhấc: phím thuộc cảm biến kéo (nó nghe ở document) — không để Enter mở thẻ / Space cuộn trang.
            if (coKeo) {
              if (e.key !== 'Tab' && e.key !== 'Escape') e.preventDefault()
              return
            }
            if (e.key === 'Enter' && e.target === e.currentTarget) {
              e.preventDefault()
              onMo(t.id)
              return
            }
            listeners?.onKeyDown?.(e)
          }}
          onClick={() => {
            // Click ngay sau khi thả (chuột nhả trên chính thẻ) không phải "mở".
            if (coKeo || Date.now() - ketThuc.current < 300) return
            onMo(t.id)
          }}
        >
          {t.noiDung}
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent aria-label={`Thao tác ${t.ten}`}>
        <ContextMenuLabel>{t.ten}</ContextMenuLabel>
        {mucRieng && (
          <>
            {mucRieng}
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuLabel>Chuyển sang…</ContextMenuLabel>
        {khac.map((c) => (
          <ContextMenuItem key={c.id} onSelect={() => onChuyen(c)}>
            <Badge color={c.color ?? 'secondary'}>{c.nhan}</Badge>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}

/** Hộp "chọn lý do" khi thẻ vào cột `hoiLyDo`. Focus nút Huỷ khi mở (README Dialog); thiếu lý do → báo lỗi tại ô. */
function HopLyDo({
  hoi,
  lyDo,
  onHuy,
  onChon,
}: {
  hoi: { the: TheKanban; cot: CotKanban } | null
  lyDo: readonly string[]
  onHuy: () => void
  onChon: (lyDo: string) => void
}) {
  const id = useId()
  const [chon, setChon] = useState('')
  const [loi, setLoi] = useState(false)
  const oRef = useRef<HTMLButtonElement>(null)
  const dong = () => {
    setChon('')
    setLoi(false)
  }
  const huy = () => {
    dong()
    onHuy()
  }
  return (
    // Đóng: Huỷ → focus về thẻ (còn ở chỗ cũ, use-nut-mo); Chuyển → thẻ dựng lại ở cột mới, bảng tự đưa focus tới nó.
    <Dialog open={!!hoi} onOpenChange={(mo) => !mo && huy()}>
      {hoi && (
        <DialogContent>
          <DialogTitle>
            Chuyển {hoi.the.ten} sang {hoi.cot.nhan}
          </DialogTitle>
          <DialogDescription>Chọn lý do để mọi người biết thẻ đang vướng ở đâu.</DialogDescription>
          <form
            id={`${id}-form`}
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              if (!chon) {
                setLoi(true)
                oRef.current?.focus()
                return
              }
              dong()
              onChon(chon)
            }}
          >
            <DialogBody>
              <Field>
                <FieldLabel htmlFor={`${id}-o`}>Lý do chờ</FieldLabel>
                <Select
                  value={chon}
                  onValueChange={(v) => {
                    setChon(v)
                    setLoi(false)
                  }}
                >
                  <SelectTrigger
                    ref={oRef}
                    id={`${id}-o`}
                    aria-invalid={loi || undefined}
                    aria-describedby={loi ? `${id}-loi` : undefined}
                  >
                    <SelectValue placeholder="Chọn lý do" />
                  </SelectTrigger>
                  <SelectContent>
                    {lyDo.map((l) => (
                      <SelectItem key={l} value={l}>
                        {hoi.cot.nhan} {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loi && <FieldError id={`${id}-loi`}>Chọn lý do chờ</FieldError>}
              </Field>
            </DialogBody>
          </form>
          <DialogFooter>
            <Button variant="outline" data-autofocus="" onClick={huy}>
              Huỷ
            </Button>
            <Button type="submit" form={`${id}-form`}>
              Chuyển
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}

/**
 * Ruột thẻ theo README KanbanBoard ("Cấu tạo thẻ"): dòng 1 nhãn (ưu tiên, loại lỗi — Badge) · dòng 2 tên khách (+ cờ
 * lưu ý đỏ, ↻ số lần hỏi lại) · dòng 3 việc tiếp theo · chân mã · hạn · avatar chủ. Không 'use client' riêng — dùng trong
 * bảng (client).
 */
export function NoiDungThe({
  nhan,
  khach,
  luuY,
  hoiLai,
  viec,
  ma,
  han,
  chu,
}: {
  nhan?: ReactNode
  khach: string
  /** Khách có thẻ lưu ý — phải đọc. */
  luuY?: boolean
  /** Số lần khách hỏi lại (> 0 mới hiện). */
  hoiLai?: number
  viec?: string
  ma: string
  han?: { chu: string; kieu?: 'homNay' | 'tre' }
  /** Tên người chủ thẻ → avatar chữ cái (tên đọc qua `title`/sr-only). */
  chu?: string
}) {
  return (
    <>
      {nhan && (
        <div className={s.theDau}>
          <span className={s.theNhan}>{nhan}</span>
        </div>
      )}
      <div className={s.theKhach}>
        <span className={cn(lopKhach, "max-w-full")}>
          <span className={cat}>{khach}</span>
          {luuY && (
            <span className={lopLuuY} title="Khách có thẻ lưu ý — phải đọc">
              <WarningCircle weight="fill" aria-hidden="true" />
              <span className="sr-only">, khách có lưu ý</span>
            </span>
          )}
          {!!hoiLai && (
            <span className={s.hoiLai} title={`Khách đã hỏi lại ${hoiLai} lần`}>
              <ArrowCounterClockwise aria-hidden="true" />
              <span aria-hidden="true">{hoiLai}</span>
              <span className="sr-only">, khách hỏi lại {hoiLai} lần</span>
            </span>
          )}
        </span>
      </div>
      {viec && <div className={s.theViec}>{viec}</div>}
      <div className={s.theChan}>
        <span className={s.theMa}>{ma}</span>
        {han && <span className={s.theHan[han.kieu ?? 'thuong']}>{han.chu}</span>}
        {chu && (
          <>
            <span className="flex-1" />
            <Avatar size="sm" aria-hidden="true" title={chu}>
              <AvatarFallback>{chuCaiDau(chu)}</AvatarFallback>
            </Avatar>
            <span className="sr-only">, chủ {chu}</span>
          </>
        )}
      </div>
    </>
  )
}
