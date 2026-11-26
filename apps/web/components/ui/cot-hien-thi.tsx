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
 */
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
  const ids = hien.map((c) => c.id)
  const ten = (x: UniqueIdentifier) => cot.find((c) => c.id === x)?.ten ?? String(x)
  const huong = (a: UniqueIdentifier, o: UniqueIdentifier) => (ids.indexOf(String(o)) > ids.indexOf(String(a)) ? 'sau' : 'trước')
  const dao = (x: string) => {
    choFocus.current = x
    onAn?.(an.includes(x) ? an.filter((y) => y !== x) : [...an, x])
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Đã nhấc cột ${ten(active.id)}. Mũi tên lên xuống để dời, Space để thả, Esc để huỷ.`,
    onDragOver: ({ active, over }) =>
      over && over.id !== active.id ? `Cột ${ten(active.id)} sẽ nằm ${huong(active.id, over.id)} cột ${ten(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over && over.id !== active.id
        ? `Đã thả cột ${ten(active.id)} ${huong(active.id, over.id)} cột ${ten(over.id)}.`
        : `Đã thả cột ${ten(active.id)} ở chỗ cũ.`,
    onDragCancel: ({ active }) => `Đã huỷ kéo. Cột ${ten(active.id)} về chỗ cũ.`,
  }

  return (
    <div ref={goc} className="border-none border-current">
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
        <DndContext
          id={id}
          sensors={sensors}
          collisionDetection={closestCenter}
          accessibility={{
            announcements,
            container: portal ?? undefined,
            screenReaderInstructions: {
              draggable: 'Nhấn Space để nhấc cột. Khi đang nhấc: mũi tên lên xuống để dời, Space để thả, Esc để huỷ.',
            },
          }}
          onDragStart={() => setKeo(true)}
          onDragEnd={({ active, over }) => {
            setKeo(false)
            if (over && over.id !== active.id)
              onDoiCho?.(String(active.id), String(over.id), ids.indexOf(String(over.id)) > ids.indexOf(String(active.id)) ? 'phai' : 'trai')
          }}
          onDragCancel={() => setKeo(false)}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {hien.map((c) => (
              <DongKeo key={c.id} cot={c} keo={!!onDoiCho} onMat={() => dao(c.id)} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      {dangAn.length > 0 && (
        <div role="group" aria-label="Đang ẩn" className="border-none border-current">
          <div aria-hidden="true" className={menuLabel}>
            Đang ẩn
          </div>
          {dangAn.map((c) => (
            <div key={c.id} data-cot-cd={c.id} className={cdDongCot}>
              <span aria-hidden="true" className={cdKeChua} />
              <span className="min-w-0 flex-1 truncate">{c.ten}</span>
              <Button variant="ghost" size="icon-sm" data-mat={c.id} aria-label={`Hiện ${c.ten}`} onClick={() => dao(c.id)}>
                <EyeSlash aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DongKeo({ cot, keo, onMat }: { cot: CotBang; keo: boolean; onMat: () => void }) {
  // Tách sẵn: luật react-hooks/refs coi cả object của useSortable là ref vì setNodeRef gắn vào `ref=`.
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: cot.id,
    disabled: !keo,
  })
  return (
    <div
      ref={setNodeRef}
      data-cot-cd={cot.id}
      data-keo={isDragging ? '' : undefined}
      className={cdDongCot}
      style={{ transform: CSS.Translate.toString(transform), transition: transition }}
    >
      {keo ? (
        <Button
          ref={setActivatorNodeRef}
          variant="ghost"
          size="icon-sm"
          className="cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-roledescription="cột kéo được"
          aria-label={`Đổi chỗ cột ${cot.ten}`}
        >
          <DotsSixVertical aria-hidden="true" />
        </Button>
      ) : (
        <span aria-hidden="true" className={cdKeChua} />
      )}
      <span className="min-w-0 flex-1 truncate">{cot.ten}</span>
      <Button variant="ghost" size="icon-sm" data-mat={cot.id} aria-label={`Ẩn ${cot.ten}`} onClick={onMat}>
        <Eye aria-hidden="true" />
      </Button>
    </div>
  )
}
