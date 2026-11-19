'use client'

import { useState } from 'react'
import { ArrowRight, Copy, DotsThree, Eye, PencilSimple, Trash } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const COT = [
  ['ma', 'Mã đơn'],
  ['khach', 'Khách hàng'],
  ['kenh', 'Kênh bán'],
  ['bao-hanh', 'Bảo hành'],
] as const

/**
 * #dropdown-menu — tái tạo ds/nguon/components/DropdownMenu/preview.html (gap 24, căn trên = style inline của preview;
 * rộng 240/220 = style inline của từng .ui-menu). Preview ép hai menu mở cùng lúc; ở đây bấm trigger thật mới mở (một
 * lúc một menu — menu modal). "Sửa" có hover thật, không ép. pb-60 (240px) = chỗ menu tĩnh chiếm dưới nút trong preview —
 * khối nằm cuối trang mà không chừa thì Radix lật menu lên trên nút. `data-so` = khoá so khớp (ds/so-khop/dropdownmenu.json).
 */
export function KhoiDropdownMenu() {
  const [cot, setCot] = useState<Record<string, boolean>>({ ma: true, khach: true, kenh: false, 'bao-hanh': false })
  return (
    <section id="dropdown-menu" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#dropdown-menu">DropdownMenu</a>
      </h2>
      <div className="flex flex-wrap items-start gap-6 pb-60">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button data-so="mo-thao-tac" variant="outline" size="icon" aria-label="Thao tác với đơn DH-DEMO-0001">
              <DotsThree aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[240px]">
            <DropdownMenuLabel>Đơn DH-DEMO-0001</DropdownMenuLabel>
            <DropdownMenuItem data-so="xem">
              <Eye aria-hidden="true" />
              Xem chi tiết
              <DropdownMenuShortcut>Enter</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem data-so="sua">
              <PencilSimple aria-hidden="true" />
              Sửa
              <DropdownMenuShortcut>E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem data-so="nhan-ban">
              <Copy aria-hidden="true" />
              Nhân bản
            </DropdownMenuItem>
            <DropdownMenuItem data-so="chuyen-kho" disabled>
              <ArrowRight aria-hidden="true" />
              Chuyển kho (không có quyền)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-so="xoa" variant="destructive">
              <Trash aria-hidden="true" />
              Xoá đơn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button data-so="mo-cot" variant="outline">
              Cột hiển thị
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[220px]">
            <DropdownMenuLabel>Hiện cột</DropdownMenuLabel>
            {COT.map(([k, ten]) => (
              <DropdownMenuCheckboxItem
                key={k}
                data-so={`cot-${k}`}
                checked={cot[k]}
                onCheckedChange={(b) => setCot((c) => ({ ...c, [k]: b }))}
              >
                {ten}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  )
}
