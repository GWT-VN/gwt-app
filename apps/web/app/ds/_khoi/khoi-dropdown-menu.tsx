'use client'

import { useState, type ReactNode } from 'react'
import {
  ArrowRight,
  CalendarBlank,
  CellSignalHigh,
  CellSignalLow,
  CellSignalMedium,
  Copy,
  DotsThree,
  Eye,
  PencilSimple,
  Tag,
  Trash,
  UserCircle,
} from '@phosphor-icons/react/ssr'
import { boDau } from '@/bang/timkiem'
import { BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuTimKiem,
} from '@/components/ui/dropdown-menu'
import { menuLabel } from '@/components/ui/menu-styles'
import { BienThe, KhoiHang } from '../_khung/tam'

/**
 * Ưu tiên: Phosphor CellSignal* bản regular chỉ vẽ vạch đang bật, nét mảnh + màu muted → Cao/Vừa/Thấp khó phân biệt
 * (prototype bị mờ). `fill` (tam giác đặc theo mức trong khung viền đủ) + màu chữ chính → thấy mức so với đầy.
 */
const UU_TIEN = [
  { id: 'cao', ten: 'Cao', Icon: CellSignalHigh },
  { id: 'vua', ten: 'Vừa', Icon: CellSignalMedium },
  { id: 'thap', ten: 'Thấp', Icon: CellSignalLow },
] as const

/** 12 tên giả (không PII) → quá 10 mục nên menu con phải có ô gõ để tìm (CHUAN-FILTER). */
const NGUOI = [
  'Trần Minh An', 'Lê Thu Bình', 'Phạm Quốc Cường', 'Vũ Hải Dương', 'Đỗ Mai Hạnh', 'Hoàng Gia Huy',
  'Ngô Bảo Khánh', 'Bùi Ngọc Lan', 'Đặng Đức Long', 'Phan Thảo My', 'Trịnh Văn Nam', 'Lý Kim Oanh',
]

/** Nhãn: "Lỗi máy" chỉ một phần các ticket đang chọn có → dấu – (indeterminate). */
const NHAN_DAU = { 'loi-may': 'indeterminate', 'bao-hanh': true, 'lap-dat': false } as const
const NHAN = [
  { id: 'loi-may', ten: 'Lỗi máy', color: 'danger' },
  { id: 'bao-hanh', ten: 'Bảo hành', color: 'info' },
  { id: 'lap-dat', ten: 'Lắp đặt', color: 'success' },
] as const

/** Menu thuộc tính có menu con (thêm 20/11 — artifact chưa có; nguồn prototype menu thuộc tính CEO duyệt). */
function MenuThuocTinh({ mau }: { mau?: string }) {
  const [uuTien, setUuTien] = useState('vua')
  const [nguoi, setNguoi] = useState(NGUOI[0])
  const [q, setQ] = useState('')
  const [nhan, setNhan] = useState<Record<string, boolean | 'indeterminate'>>(NHAN_DAU)
  const k = boDau(q).trim()
  const ds = NGUOI.filter((n) => !k || boDau(n).includes(k))
  return (
    <DropdownMenu onOpenChange={(o) => !o && setQ('')}>
      <DropdownMenuTrigger asChild>
        <Button data-so="mo-menu-con" variant="outline" aria-label={`Thuộc tính 2 ticket${mau ? ` (mẫu: ${mau})` : ''}`}>
          Thuộc tính…
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel>2 ticket</DropdownMenuLabel>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<CellSignalHigh aria-hidden="true" />} phim={['P']}>
            Ưu tiên
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={uuTien} onValueChange={setUuTien}>
              {UU_TIEN.map((x) => (
                <DropdownMenuRadioItem key={x.id} value={x.id}>
                  <x.Icon aria-hidden="true" weight="fill" className="text-foreground" />
                  {x.ten}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<UserCircle aria-hidden="true" />} phim={['A']}>
            Người làm
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <MenuTimKiem value={q} onValueChange={setQ} placeholder="Tìm người…" />
            {ds.length ? (
              <DropdownMenuRadioGroup value={nguoi} onValueChange={setNguoi}>
                {ds.map((n) => (
                  <DropdownMenuRadioItem key={n} value={n}>
                    {n}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            ) : (
              <div className={menuLabel}>Không có ai khớp “{q}”</div>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<Tag aria-hidden="true" />} phim={['L']}>
            Nhãn
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {NHAN.map((n) => (
              <DropdownMenuCheckboxItem
                key={n.id}
                checked={nhan[n.id]}
                onCheckedChange={(b) => setNhan((c) => ({ ...c, [n.id]: b }))}
                onSelect={(e) => e.preventDefault()}
              >
                {/* Chấm 6 đặt trong ô 16 = cột icon của các mục khác. */}
                <span className="grid size-4 shrink-0 place-content-center border-none border-current">
                  <BadgeDot color={n.color} />
                </span>
                {n.ten}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <CalendarBlank aria-hidden="true" />
          Đặt hạn…
          <DropdownMenuShortcut phim={['⇧', 'D']} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

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
      {/* Ví dụ menu con bọc figure (KHÔNG phải div): khung so khớp lấy mọi div con trực tiếp của khối → giữ nguyên.
          pb-60 = chỗ menu + menu con. */}
      <figure className="flex flex-col items-start gap-2 pb-60">
        <figcaption className="text-[13px] leading-[18px] text-muted-foreground">
          Menu con · phím tắt · một phần (thêm ở repo 20/11, chưa có trong artifact): → mở menu con, ← về mục cha.
        </figcaption>
        <MenuThuocTinh />
      </figure>
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
      <BienThe
        ten="Menu con + phím tắt"
        moTa="Mục cha: icon · nhãn · phím · ▸; menu con có ✓ ở giá trị đang có, ô tìm khi quá 10 mục, nhãn một phần hiện –"
      >
        <MenuThuocTinh mau="menu con" />
      </BienThe>
      <BienThe ten="Menu ⋯ của dòng" moTa="Đủ các kiểu trên trong một menu thao tác">
        <MenuDon mau="đủ mục">{DU}</MenuDon>
      </BienThe>
    </KhoiHang>
  )
}
