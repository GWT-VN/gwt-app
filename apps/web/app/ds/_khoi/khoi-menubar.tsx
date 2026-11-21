'use client'

import { useState } from 'react'
import { ArrowCounterClockwise, ArrowClockwise, Copy, DownloadSimple, FilePlus, MagnifyingGlass, Trash } from '@phosphor-icons/react/ssr'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Mã giả (không PII). */
const GAN_DAY = ['DH-DEMO-0001', 'DH-DEMO-0002', 'DH-DEMO-0003']

function MenuTep({ mau }: { mau?: string }) {
  return (
    <MenubarMenu>
      <MenubarTrigger data-so={mau ? undefined : 'mo-tep'}>Tệp</MenubarTrigger>
      <MenubarContent>
        <MenubarGroup>
          <MenubarItem data-so={mau ? undefined : 'don-moi'}>
            <FilePlus aria-hidden="true" />
            Đơn mới
            <MenubarShortcut phim={['Ctrl', 'N']} />
          </MenubarItem>
          <MenubarItem>
            <Copy aria-hidden="true" />
            Nhân bản
            <MenubarShortcut>Ctrl D</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            <DownloadSimple aria-hidden="true" />
            Xuất Excel (không có quyền)
          </MenubarItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger inset>Mở gần đây</MenubarSubTrigger>
          <MenubarSubContent>
            {GAN_DAY.map((m) => (
              <MenubarItem key={m}>{m}</MenubarItem>
            ))}
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        <MenubarItem variant="destructive">
          <Trash aria-hidden="true" />
          Xoá đơn
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  )
}

function MenuSua() {
  return (
    <MenubarMenu>
      <MenubarTrigger>Sửa</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>
          <ArrowCounterClockwise aria-hidden="true" />
          Hoàn tác
          <MenubarShortcut phim={['Ctrl', 'Z']} />
        </MenubarItem>
        <MenubarItem>
          <ArrowClockwise aria-hidden="true" />
          Làm lại
          <MenubarShortcut phim={['Ctrl', '⇧', 'Z']} />
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem>
          <MagnifyingGlass aria-hidden="true" />
          Tìm trong đơn
          <MenubarShortcut phim={['Ctrl', 'F']} />
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  )
}

function MenuXem() {
  const [cot, setCot] = useState<Record<string, boolean>>({ kenh: true, 'bao-hanh': false })
  const [matDo, setMatDo] = useState('vua')
  return (
    <MenubarMenu>
      <MenubarTrigger>Xem</MenubarTrigger>
      <MenubarContent>
        <MenubarLabel>Cột</MenubarLabel>
        {(
          [
            ['kenh', 'Kênh bán'],
            ['bao-hanh', 'Bảo hành'],
          ] as const
        ).map(([k, ten]) => (
          <MenubarCheckboxItem
            key={k}
            checked={cot[k]}
            onCheckedChange={(b) => setCot((c) => ({ ...c, [k]: b }))}
            // Tick nhiều cột liền: giữ menu mở (luật menu NGUON).
            onSelect={(e) => e.preventDefault()}
          >
            {ten}
          </MenubarCheckboxItem>
        ))}
        <MenubarSeparator />
        <MenubarLabel>Mật độ dòng</MenubarLabel>
        <MenubarRadioGroup value={matDo} onValueChange={setMatDo}>
          <MenubarRadioItem value="gon">Gọn</MenubarRadioItem>
          <MenubarRadioItem value="vua">Vừa</MenubarRadioItem>
          <MenubarRadioItem value="rong" disabled>
            Rộng (không có quyền)
          </MenubarRadioItem>
        </MenubarRadioGroup>
      </MenubarContent>
    </MenubarMenu>
  )
}

/** Thanh đủ ba menu — dùng chung khối trần và hàng biến thể. */
function ThanhDon({ mau }: { mau?: string }) {
  return (
    <Menubar aria-label={`Thanh lệnh đơn hàng${mau ? ` (mẫu: ${mau})` : ''}`} className="w-fit">
      <MenuTep mau={mau} />
      <MenuSua />
      <MenuXem />
    </Menubar>
  )
}

/**
 * #menubar trần (/ds/tron). Artifact CHƯA có Menubar → không cổng so khớp; nguồn shadcn new-york-v4 gán token (README
 * ds/nguon/components/Menubar/README.md). pb-72 = chỗ menu mở dưới thanh (khối cuối trang không chừa thì Radix lật lên).
 */
export function KhoiMenubar() {
  return (
    <section id="menubar" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#menubar">Menubar</a>
      </h2>
      <div className="pb-72">
        <ThanhDon />
      </div>
    </section>
  )
}

/** #menubar dạng hàng (/ds). */
export function KhoiMenubarHang() {
  return (
    <KhoiHang neo="menubar">
      <BienThe
        ten="Thanh lệnh"
        moTa="Nhóm lệnh của một màn (Tệp · Sửa · Xem). ←/→ giữa các nút, ↓ mở; đang mở một menu thì rê sang nút khác mở luôn"
      >
        <ThanhDon mau="thanh lệnh" />
      </BienThe>
      <BienThe
        ten="Mục trong menu"
        moTa="Cùng kiểu mục với DropdownMenu: phím tắt Kbd, mục chặn quyền vẫn di phím tới được, menu con, mục nguy hiểm cuối"
      >
        <Menubar aria-label="Thanh lệnh (mẫu: mục trong menu)" className="w-fit">
          <MenuTep mau="mục trong menu" />
        </Menubar>
      </BienThe>
      <BienThe ten="Ô tick + chọn một" moTa="Ô tick giữ menu mở để tick nhiều cột; chọn một có ✓ bên phải, mục bị chặn ghi lý do">
        <Menubar aria-label="Thanh lệnh (mẫu: ô tick + chọn một)" className="w-fit">
          <MenuXem />
        </Menubar>
      </BienThe>
    </KhoiHang>
  )
}
