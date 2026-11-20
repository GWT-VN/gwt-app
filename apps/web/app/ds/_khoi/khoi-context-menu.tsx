'use client'

import { ArrowSquareOut, Check, Copy, SidebarSimple } from '@phosphor-icons/react/ssr'
import { Badge } from '@/components/ui/badge'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { BienThe, KhoiHang } from '../_khung/tam'

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
    </KhoiHang>
  )
}
