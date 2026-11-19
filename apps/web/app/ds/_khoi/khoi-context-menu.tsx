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
      <div className="pb-56">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              data-so="dong"
              tabIndex={0}
              aria-label="Ticket TK-2611-039 — chuột phải hoặc Shift+F10 để mở thao tác"
              className="flex min-h-[50px] cursor-pointer items-center gap-3 border-none border-current rounded-(--radius-xl) px-4 py-1 outline-none hover:bg-(--alpha-05) focus-within:bg-(--alpha-05) focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]"
            >
              <Badge color="warning">P2</Badge>
              <span className="shrink-0 font-medium">TK-2611-039</span>
              <span className="truncate text-muted-foreground">Chờ duyệt miễn phí thay bơm</span>
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
      </div>
    </section>
  )
}
