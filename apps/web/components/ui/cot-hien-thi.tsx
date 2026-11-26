'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  closestCenter,
  DndContext,
  KeyboardCode,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DotsSixVertical, Eye, EyeSlash } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { cdDongCot, cdKeChua } from './data-view-styles'
import { useDsPortal } from './ds-root'
import { menuLabel } from './menu-styles'
import { CamBienPhimKeo, useEscKhiKeo } from './tieu-de-cot'
import type { BenTha, CotBang } from './use-cot-bang'

/**
 * CotHienThi — thân trang "Cột hiển thị" của ⚙ `CaiDatHienThi` (học Twenty 26/11, mục C): hai nhóm "Đang hiện" / "Đang
 * ẩn", thứ tự = thứ tự cột của bảng (`cot` truyền theo `useCotBang().thuTu`). "Đang hiện": tay kéo (khi có `onDoiCho`) +
 * tên + nút mắt "Ẩn <tên>"; cột khoá đứng đầu, không tay kéo, không mắt. "Đang ẩn": tên + nút mắt gạch "Hiện <tên>".
 * Kéo = dnd-kit sortable dọc: chuột nhích 4px; phím Space nhấc · ↑↓ dời · Space/Enter/Tab thả · Esc huỷ (Esc không đóng
 * ⚙ — PopoverContent bỏ qua Esc khi body có `data-dang-keo`), câu đọc tiếng Việt như `KeoCot`. Bấm mắt → dòng sang nhóm
 * kia, focus theo sang nút mắt của chính cột đó.
 * CEO 26/11 (như Twenty): (1) bấm THẲNG vào dòng (tên) cũng ẩn/hiện — nút mắt vẫn là đường bàn phím; (2) kéo được QUA
 * nhóm: hai nhóm chung một danh sách sắp xếp, nhãn "Đang ẩn" là mốc chia (mục `__an`, không kéo, chỉ làm đích) — thả trên
 * mốc = hiện, dưới mốc = ẩn; cột ẩn cũng có tay kéo.
 */
const MOC_AN = '__an'
export function CotHienThi({
  cot,
  an,
  onAn,
  onDoiCho,
}: {
  cot: CotBang[]
  an: string[]
  onAn?: (an: string[]) => void
  /** `useCotBang().doiCho` — không truyền thì không có tay kéo. */
  onDoiCho?: (id: string, dich: string, ben: BenTha) => void
}) {
  const id = useId()
  const portal = useDsPortal()
  const goc = useRef<HTMLDivElement>(null)
  const choFocus = useRef<string | null>(null)
  const [keo, setKeo] = useState(false)
  useEscKhiKeo(keo)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(CamBienPhimKeo, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: {
        start: [KeyboardCode.Space],
        cancel: [KeyboardCode.Esc],
        end: [KeyboardCode.Space, KeyboardCode.Enter, KeyboardCode.Tab],
      },
    }),
  )

  // Dòng vừa đổi nhóm → focus nút mắt của nó ở nhóm mới (nút cũ đã bị gỡ).
  useEffect(() => {
    const x = choFocus.current
    if (!x) return
    choFocus.current = null
    goc.current?.querySelector<HTMLElement>(`[data-mat="${x}"]`)?.focus()
  }, [an])

  const khoa = cot.filter((c) => c.khoa)
  const hien = cot.filter((c) => !c.khoa && !an.includes(c.id))
  const dangAn = cot.filter((c) => !c.khoa && an.includes(c.id))
  // Một danh sách cho cả hai nhóm, mốc `__an` chia: trên = hiện, dưới = ẩn.
  const ids = [...hien.map((c) => c.id), MOC_AN, ...dangAn.map((c) => c.id)]
  const ten = (x: UniqueIdentifier) => cot.find((c) => c.id === x)?.ten ?? String(x)
  /** Danh sách sau khi thả `a` vào chỗ `o` (arrayMove). */
  const sauKhiTha = (a: UniqueIdentifier, o: UniqueIdentifier) => {
    const m = ids.filter((x) => x !== String(a))
    m.splice(ids.indexOf(String(o)), 0, String(a))
    return m
  }
  /** Câu mô tả chỗ thả: sang nhóm kia, hoặc trước/sau cột kề trong nhóm. */
  const cho = (a: UniqueIdentifier, o: UniqueIdentifier) => {
    const m = sauKhiTha(a, o)
    const i = m.indexOf(String(a))
    const moc = m.indexOf(MOC_AN)
    const dangAnA = an.includes(String(a))
    if (i > moc) return dangAnA ? 'trong nhóm Đang ẩn' : 'sang Đang ẩn'
    const ke = i > 0 ? `sau cột ${ten(m[i - 1])}` : m[i + 1] && m[i + 1] !== MOC_AN ? `trước cột ${ten(m[i + 1])}` : 'đầu nhóm'
    return dangAnA ? `sang Đang hiện, ${ke}` : ke
  }
  const dao = (x: string) => {
    choFocus.current = x
    onAn?.(an.includes(x) ? an.filter((y) => y !== x) : [...an, x])
  }
  const tha = (a: string, o: string) => {
    const m = sauKhiTha(a, o)
    const moc = m.indexOf(MOC_AN)
    const i = m.indexOf(a)
    const seAn = i > moc
    if (seAn !== an.includes(a)) onAn?.(seAn ? [...an, a] : an.filter((y) => y !== a))
    if (seAn) return
    // Thứ tự trong nhóm hiện: đặt cạnh cột kề (useCotBang gộp được hai lần đổi state liên tiếp — setS hàm).
    if (i > 0) onDoiCho?.(a, m[i - 1], 'phai')
    else if (m[i + 1] && m[i + 1] !== MOC_AN) onDoiCho?.(a, m[i + 1], 'trai')
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Đã nhấc cột ${ten(active.id)}. Mũi tên lên xuống để dời, Space để thả, Esc để huỷ.`,
    onDragOver: ({ active, over }) =>
      over && over.id !== active.id ? `Cột ${ten(active.id)} sẽ nằm ${cho(active.id, over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over && over.id !== active.id ? `Đã thả cột ${ten(active.id)} ${cho(active.id, over.id)}.` : `Đã thả cột ${ten(active.id)} ở chỗ cũ.`,
    onDragCancel: ({ active }) => `Đã huỷ kéo. Cột ${ten(active.id)} về chỗ cũ.`,
  }

  return (
    <div ref={goc} className="border-none border-current">
      <DndContext
        id={id}
        sensors={sensors}
        collisionDetection={closestCenter}
        accessibility={{
          announcements,
          container: portal ?? undefined,
          screenReaderInstructions: {
            draggable: 'Nhấn Space để nhấc cột. Khi đang nhấc: mũi tên lên xuống để dời (qua nhãn Đang ẩn là ẩn cột), Space để thả, Esc để huỷ.',
          },
        }}
        onDragStart={() => setKeo(true)}
        onDragEnd={({ active, over }) => {
          setKeo(false)
          if (over && over.id !== active.id) tha(String(active.id), String(over.id))
        }}
        onDragCancel={() => setKeo(false)}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div role="group" aria-label="Đang hiện" className="border-none border-current">
            <div aria-hidden="true" className={menuLabel}>
              Đang hiện
            </div>
            {khoa.map((c) => (
              <div key={c.id} data-cot-cd={c.id} className={cdDongCot}>
                <span aria-hidden="true" className={cdKeChua} />
                <span className="min-w-0 flex-1 truncate">{c.ten}</span>
              </div>
            ))}
            {hien.map((c) => (
              <DongKeo key={c.id} cot={c} keo={!!onDoiCho} an={false} onMat={() => dao(c.id)} />
            ))}
          </div>
          <div role="group" aria-label="Đang ẩn" className="border-none border-current">
            <MocAn />
            {dangAn.map((c) => (
              <DongKeo key={c.id} cot={c} keo={!!onDoiCho} an onMat={() => dao(c.id)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

/** Nhãn "Đang ẩn" = mốc chia của danh sách sắp xếp: không kéo được, chỉ làm đích thả. */
function MocAn() {
  const { setNodeRef, transform, transition } = useSortable({ id: MOC_AN, disabled: { draggable: true, droppable: false } })
  return (
    <div
      ref={setNodeRef}
      aria-hidden="true"
      data-cot-cd={MOC_AN}
      className={menuLabel}
      style={{ transform: CSS.Translate.toString(transform), transition: transition }}
    >
      Đang ẩn
    </div>
  )
}

function DongKeo({ cot, keo, an, onMat }: { cot: CotBang; keo: boolean; an: boolean; onMat: () => void }) {
  // Tách sẵn: luật react-hooks/refs coi cả object của useSortable là ref vì setNodeRef gắn vào `ref=`.
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: cot.id,
    disabled: !keo,
  })
  return (
    // Bấm cả dòng = bấm mắt (CEO 26/11) — chuột tiện; bàn phím vẫn qua nút mắt (div không nhận focus, không lặp tab stop).
    // Tay kéo và nút mắt tự chặn nổi bọt để bấm/kéo chúng không kích thêm lần nữa.
    <div
      ref={setNodeRef}
      data-cot-cd={cot.id}
      data-keo={isDragging ? '' : undefined}
      className={cn(cdDongCot, 'cursor-pointer hover:bg-(--menu-item-bg)')}
      style={{ transform: CSS.Translate.toString(transform), transition: transition }}
      onClick={onMat}
    >
      {keo ? (
        <Button
          ref={setActivatorNodeRef}
          variant="ghost"
          size="icon-sm"
          className="cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          aria-roledescription="cột kéo được"
          aria-label={`Đổi chỗ cột ${cot.ten}`}
        >
          <DotsSixVertical aria-hidden="true" />
        </Button>
      ) : (
        <span aria-hidden="true" className={cdKeChua} />
      )}
      <span className="min-w-0 flex-1 truncate">{cot.ten}</span>
      <Button
        variant="ghost"
        size="icon-sm"
        data-mat={cot.id}
        aria-label={`${an ? 'Hiện' : 'Ẩn'} ${cot.ten}`}
        onClick={(e) => {
          e.stopPropagation()
          onMat()
        }}
      >
        {an ? <EyeSlash aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </Button>
    </div>
  )
}
