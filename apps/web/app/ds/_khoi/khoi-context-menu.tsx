'use client'

import { useState } from 'react'
import {
  ArrowSquareOut,
  BellSimple,
  CalendarBlank,
  CellSignalHigh,
  CellSignalLow,
  CellSignalMedium,
  Check,
  CheckCircle,
  CircleDashed,
  CircleHalf,
  Copy,
  SidebarSimple,
} from '@phosphor-icons/react/ssr'
import { Badge } from '@/components/ui/badge'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { BienThe, KhoiHang } from '../_khung/tam'

const TRANG_THAI = [
  { id: 'cho', ten: 'Chờ xử lý', Icon: CircleDashed, dam: 'regular' },
  { id: 'dang-lam', ten: 'Đang làm', Icon: CircleHalf, dam: 'fill', mau: 'text-(--color-text-warning)' },
  { id: 'xong', ten: 'Xong', Icon: CheckCircle, dam: 'fill', mau: 'text-(--color-text-success)' },
] as const
/** `fill` + màu chữ chính (tam giác đặc theo mức trong khung viền đủ): CellSignal* regular chỉ vẽ vạch bật, nét mảnh → Cao/Vừa/Thấp khó phân biệt. */
const UU_TIEN = [
  { id: 'cao', ten: 'Cao', Icon: CellSignalHigh },
  { id: 'vua', ten: 'Vừa', Icon: CellSignalMedium },
  { id: 'thap', ten: 'Thấp', Icon: CellSignalLow },
] as const

/** Dòng có menu con (thêm 20/11 — artifact chưa có; nguồn prototype menu thuộc tính CEO duyệt). */
function DongMenuCon() {
  const [tt, setTt] = useState('dang-lam')
  const [ut, setUt] = useState('cao')
  const [theoDoi, setTheoDoi] = useState(true)
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          data-so="dong-menu-con"
          tabIndex={0}
          role="row"
          aria-keyshortcuts="Shift+F10"
          className="flex min-h-[50px] cursor-pointer items-center gap-3 border-none border-current rounded-(--radius-xl) px-4 py-1 outline-none hover:bg-(--alpha-05) focus-within:bg-(--alpha-05) focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]"
        >
          <span role="cell">
            <Badge color="danger">P1</Badge>
          </span>
          <span role="cell" className="shrink-0 font-medium">
            TK-2611-040
          </span>
          <span role="cell" className="truncate text-muted-foreground">
            Máy lọc báo lỗi E3 (chuột phải: menu con)
          </span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent aria-label="Thuộc tính TK-2611-040">
        <ContextMenuLabel>TK-2611-040</ContextMenuLabel>
        <ContextMenuSub>
          <ContextMenuSubTrigger icon={<CircleHalf aria-hidden="true" />} phim={['S']}>
            Trạng thái
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuRadioGroup value={tt} onValueChange={setTt}>
              {TRANG_THAI.map((x) => (
                <ContextMenuRadioItem key={x.id} value={x.id}>
                  <x.Icon aria-hidden="true" weight={x.dam} className={'mau' in x ? x.mau : undefined} />
                  {x.ten}
                </ContextMenuRadioItem>
              ))}
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSub>
          <ContextMenuSubTrigger icon={<CellSignalHigh aria-hidden="true" />} phim={['P']}>
            Ưu tiên
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuRadioGroup value={ut} onValueChange={setUt}>
              {UU_TIEN.map((x) => (
                <ContextMenuRadioItem key={x.id} value={x.id}>
                  <x.Icon aria-hidden="true" weight="fill" className="text-foreground" />
                  {x.ten}
                </ContextMenuRadioItem>
              ))}
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuCheckboxItem checked={theoDoi} onCheckedChange={setTheoDoi}>
          <BellSimple aria-hidden="true" />
          Theo dõi
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <CalendarBlank aria-hidden="true" />
          Đặt hạn…
          <ContextMenuShortcut phim={['⇧', 'D']} />
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

/** Dòng ticket + menu chuột phải — dùng chung khối cũ và hàng biến thể. */
function DongTicket() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          data-so="dong"
          tabIndex={0}
          role="row"
          aria-keyshortcuts="Shift+F10"
          className="flex min-h-[50px] cursor-pointer items-center gap-3 border-none border-current rounded-(--radius-xl) px-4 py-1 outline-none hover:bg-(--alpha-05) focus-within:bg-(--alpha-05) focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]"
        >
          <span role="cell">
            <Badge color="warning">P2</Badge>
          </span>
          <span role="cell" className="shrink-0 font-medium">
            TK-2611-039
          </span>
          <span role="cell" className="truncate text-muted-foreground">
            Chờ duyệt miễn phí thay bơm
          </span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent aria-label="Thao tác TK-2611-039">
        <ContextMenuLabel>TK-2611-039</ContextMenuLabel>
        <ContextMenuItem data-so="mo">
          <ArrowSquareOut aria-hidden="true" />
          Mở ticket
        </ContextMenuItem>
        <ContextMenuItem data-so="xem-nhanh">
          <SidebarSimple aria-hidden="true" mirrored />
          Xem nhanh bên phải
        </ContextMenuItem>
        <ContextMenuItem data-so="sao-chep">
          <Copy aria-hidden="true" />
          Sao chép mã
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem data-so="dong-ticket">
          <Check aria-hidden="true" />
          Đóng ticket
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

/**
 * #context-menu — tái tạo ds/nguon/components/ContextMenu/preview.html: một dòng ticket (mã giả TK-2611-039 của
 * preview), chuột phải → dòng tô sáng + menu tại con trỏ; Shift+F10 / phím Menu khi dòng đang focus → menu dưới dòng.
 * Dòng mẫu chỉ mang hộp của `.b-ds-hang` (cao 50, đệm 4 16, bo xl, nền alpha-05 khi trỏ/focus trong, vòng inset khi
 * focus phím; `border-none border-current` vì div ăn preflight `0 solid --border`, `.b-ds-hang` không viền) — cột/ô sửa
 * của dòng là việc của ListView. pb-56 = chỗ menu chiếm dưới dòng (khối cuối trang mà không chừa thì Radix lật menu lên).
 * `data-so` = khoá so khớp (ds/so-khop/contextmenu.json).
 */
export function KhoiContextMenu() {
  return (
    <section id="context-menu" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#context-menu">ContextMenu</a>
      </h2>
      {/* role table/row/cell y preview (`.b-ds` role="table", `.b-ds-hang` role="row") — dòng focus được có vai trò thật */}
      <div role="table" aria-label="Ticket mẫu" className="pb-56">
        <DongTicket />
      </div>
      {/* Ví dụ menu con bọc figure (KHÔNG phải div): khung so khớp lấy mọi div con trực tiếp của khối → giữ nguyên. */}
      <figure>
        <figcaption className="mb-2 text-[13px] leading-[18px] text-muted-foreground">
          Menu con · phím tắt (thêm ở repo 20/11, chưa có trong artifact)
        </figcaption>
        <div role="table" aria-label="Ticket mẫu có menu con" className="pb-56">
          <DongMenuCon />
        </div>
      </figure>
    </section>
  )
}

/** /ds dạng hàng. */
export function KhoiContextMenuHang() {
  return (
    <KhoiHang neo="context-menu">
      <BienThe ten="Trên dòng danh sách" moTa="Chuột phải hoặc Shift+F10 trên dòng; mục trùng menu ⋯">
        <div role="table" aria-label="Ticket mẫu">
          <DongTicket />
        </div>
      </BienThe>
      <BienThe ten="Menu con + phím tắt" moTa="Mục cha: icon · nhãn · phím · ▸; menu con có ✓ ở giá trị đang có">
        <div role="table" aria-label="Ticket mẫu có menu con">
          <DongMenuCon />
        </div>
      </BienThe>
    </KhoiHang>
  )
}
