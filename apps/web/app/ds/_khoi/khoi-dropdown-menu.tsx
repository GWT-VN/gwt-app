'use client'

import { useState, type ReactNode } from 'react'
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
import { BienThe, KhoiHang } from '../_khung/tam'

const COT = [
  ['ma', 'Mã đơn'],
  ['khach', 'Khách hàng'],
  ['kenh', 'Kênh bán'],
  ['bao-hanh', 'Bảo hành'],
] as const

/** Mục của menu ⋯ đơn — dùng chung giữa khối cũ (đủ mục) và các hàng biến thể (từng nhóm mục). */
const MUC = {
  nhan: <DropdownMenuLabel>Đơn DH-DEMO-0001</DropdownMenuLabel>,
  xem: (
    <DropdownMenuItem data-so="xem">
      <Eye aria-hidden="true" />
      Xem chi tiết
      <DropdownMenuShortcut>Enter</DropdownMenuShortcut>
    </DropdownMenuItem>
  ),
  sua: (
    <DropdownMenuItem data-so="sua">
      <PencilSimple aria-hidden="true" />
      Sửa
      <DropdownMenuShortcut>E</DropdownMenuShortcut>
    </DropdownMenuItem>
  ),
  nhanBan: (
    <DropdownMenuItem data-so="nhan-ban">
      <Copy aria-hidden="true" />
      Nhân bản
    </DropdownMenuItem>
  ),
  chuyenKho: (
    <DropdownMenuItem data-so="chuyen-kho" disabled>
      <ArrowRight aria-hidden="true" />
      Chuyển kho (không có quyền)
    </DropdownMenuItem>
  ),
  xoa: (
    <DropdownMenuItem data-so="xoa" variant="destructive">
      <Trash aria-hidden="true" />
      Xoá đơn
    </DropdownMenuItem>
  ),
}

/** Menu ⋯ đủ mục (thứ tự của preview). */
const DU = (
  <>
    {MUC.nhan}
    {MUC.xem}
    {MUC.sua}
    {MUC.nhanBan}
    {MUC.chuyenKho}
    <DropdownMenuSeparator />
    {MUC.xoa}
  </>
)

/**
 * Nút ⋯ + menu thao tác đơn. `so` = khoá so khớp của nút (chỉ khối cũ — các hàng có nhiều nút ⋯). `mau` = tên hàng, ghép
 * vào tên đọc của nút để nhiều nút ⋯ trên cùng trang không trùng tên.
 */
function MenuDon({ so, mau, children }: { so?: string; mau?: string; children: ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button data-so={so} variant="outline" size="icon" aria-label={`Thao tác với đơn DH-DEMO-0001${mau ? ` (mẫu: ${mau})` : ''}`}>
          <DotsThree aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Menu chọn cột hiển thị (CheckboxItem). */
function MenuCot() {
  const [cot, setCot] = useState<Record<string, boolean>>({ ma: true, khach: true, kenh: false, 'bao-hanh': false })
  return (
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
            // Chọn cột: tick nhiều mục liền → giữ menu mở (mặc định Radix đóng sau mỗi lần chọn).
            onSelect={(e) => e.preventDefault()}
          >
            {ten}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * #dropdown-menu — tái tạo ds/nguon/components/DropdownMenu/preview.html (gap 24, căn trên = style inline của preview;
 * rộng 240/220 = style inline của từng .ui-menu). Preview ép hai menu mở cùng lúc; ở đây bấm trigger thật mới mở (một
 * lúc một menu — menu modal). "Sửa" có hover thật, không ép. pb-60 (240px) = chỗ menu tĩnh chiếm dưới nút trong preview —
 * khối nằm cuối trang mà không chừa thì Radix lật menu lên trên nút. `data-so` = khoá so khớp (ds/so-khop/dropdownmenu.json).
 */
export function KhoiDropdownMenu() {
  return (
    <section id="dropdown-menu" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#dropdown-menu">DropdownMenu</a>
      </h2>
      <div className="flex flex-wrap items-start gap-6 pb-60">
        <MenuDon so="mo-thao-tac">{DU}</MenuDon>
        <MenuCot />
      </div>
    </section>
  )
}

/** /ds dạng hàng: mỗi kiểu mục một hàng, nút mở menu thật chỉ chứa nhóm mục đó. */
export function KhoiDropdownMenuHang() {
  return (
    <KhoiHang neo="dropdown-menu">
      <BienThe ten="Nhóm + phím tắt" moTa="Nhãn nhóm ở đầu; phím tắt canh phải, chỉ để gợi nhớ">
        <MenuDon mau="nhóm + phím tắt">
          {MUC.nhan}
          {MUC.xem}
          {MUC.sua}
          {MUC.nhanBan}
        </MenuDon>
      </BienThe>
      <BienThe ten="Mục bị chặn quyền" moTa="Vẫn hiện, vẫn di phím tới được nhưng không bấm được; lý do ghi ngay trong chữ">
        <MenuDon mau="mục bị chặn quyền">
          {MUC.xem}
          {MUC.chuyenKho}
        </MenuDon>
      </BienThe>
      <BienThe ten="Mục nguy hiểm" moTa="Xoá/huỷ: chữ đỏ, đặt cuối sau đường kẻ">
        <MenuDon mau="mục nguy hiểm">
          {MUC.sua}
          <DropdownMenuSeparator />
          {MUC.xoa}
        </MenuDon>
      </BienThe>
      <BienThe ten="Mục có ô tick" moTa="Chọn nhiều (vd cột hiển thị), menu giữ mở khi tick">
        <MenuCot />
      </BienThe>
      <BienThe ten="Menu ⋯ của dòng" moTa="Đủ các kiểu trên trong một menu thao tác">
        <MenuDon mau="đủ mục">{DU}</MenuDon>
      </BienThe>
    </KhoiHang>
  )
}
