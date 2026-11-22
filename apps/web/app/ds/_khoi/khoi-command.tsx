'use client'

import { useState } from 'react'
import { CalendarBlank, Gear, Printer, Receipt, Ticket, User } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { BienThe, KhoiHang } from '../_khung/tam'

/**
 * Danh sách lệnh demo (không PII). `keywords` không dấu: bộ lọc mặc định của cmdk (command-score) không bỏ dấu — gõ "tao"
 * vẫn ra "Tạo ticket". Lọc tiếng Việt thật (bỏ dấu, SĐT) dùng `shouldFilter={false}` + `bang/timkiem` như CommandPalette.
 */
function CacLenh({ onChon }: { onChon(ten: string): void }) {
  return (
    <>
      <CommandEmpty>Không thấy lệnh nào.</CommandEmpty>
      <CommandGroup heading="Gợi ý">
        <CommandItem keywords={['tao ticket']} onSelect={() => onChon('Tạo ticket')}>
          <Ticket aria-hidden="true" />
          <span>Tạo ticket</span>
        </CommandItem>
        <CommandItem keywords={['them khach hang']} onSelect={() => onChon('Thêm khách hàng')}>
          <User aria-hidden="true" />
          <span>Thêm khách hàng</span>
        </CommandItem>
        <CommandItem keywords={['lich hen']} onSelect={() => onChon('Lịch hẹn')}>
          <CalendarBlank aria-hidden="true" />
          <span>Lịch hẹn</span>
        </CommandItem>
        <CommandItem disabled keywords={['in phieu']}>
          <Printer aria-hidden="true" />
          <span>In phiếu (chưa nối máy in)</span>
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Cài đặt">
        <CommandItem keywords={['ho so']} onSelect={() => onChon('Hồ sơ')}>
          <User aria-hidden="true" />
          <span>Hồ sơ</span>
          <CommandShortcut>Ctrl P</CommandShortcut>
        </CommandItem>
        <CommandItem keywords={['hoa don']} onSelect={() => onChon('Hoá đơn')}>
          <Receipt aria-hidden="true" />
          <span>Hoá đơn</span>
          <CommandShortcut>Ctrl B</CommandShortcut>
        </CommandItem>
        <CommandItem keywords={['cai dat']} onSelect={() => onChon('Cài đặt')}>
          <Gear aria-hidden="true" />
          <span>Cài đặt</span>
          <CommandShortcut>Ctrl S</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  )
}

function DaChon({ ten }: { ten: string }) {
  return (
    <p aria-live="polite" className="mt-2 min-h-[18px] text-[12px] leading-[18px] text-muted-foreground">
      {ten && `Đã chọn: ${ten} (demo)`}
    </p>
  )
}

/**
 * Command nằm trên trang. `defaultValue` không trùng mục nào → lúc nạp CHƯA sáng mục nào: cmdk 1.1.1 cuộn mục sáng vào
 * khung nhìn lúc mount (kéo cả trang /ds tới khối này). Bấm ô gõ rồi ↓, hoặc gõ chữ → mục đầu sáng.
 */
function NamTrenTrang() {
  const [chon, setChon] = useState('')
  return (
    <div className="max-w-[400px]">
      <Command
        data-so="tren-trang"
        defaultValue="-"
        label="Lệnh (demo)"
        className="h-auto [box-shadow:var(--shadow),var(--shadow-hairline)]"
      >
        <CommandInput placeholder="Gõ lệnh hoặc tìm…" />
        <CommandList>
          <CacLenh onChon={setChon} />
        </CommandList>
      </Command>
      <DaChon ten={chon} />
    </div>
  )
}

function TrongHop() {
  const [mo, setMo] = useState(false)
  const [chon, setChon] = useState('')
  return (
    <div>
      <Button data-so="mo-hop" variant="outline" aria-haspopup="dialog" onClick={() => setMo(true)}>
        Mở bảng lệnh
      </Button>
      <DaChon ten={chon} />
      <CommandDialog open={mo} onOpenChange={setMo}>
        <CommandInput placeholder="Gõ lệnh hoặc tìm…" />
        <CommandList>
          <CacLenh
            onChon={(ten) => {
              setMo(false)
              setChon(ten)
            }}
          />
        </CommandList>
      </CommandDialog>
    </div>
  )
}

const BIEN_THE = [
  {
    ten: 'Nằm trên trang',
    moTa: 'Command + CommandInput/List/Group/Item/Separator/Shortcut/Empty. Cỡ gọn theo .ui-menu: hàng gõ 32, mục 32, tên nhóm 12/18. Mục tắt vẫn hiện, không chọn được.',
    Demo: NamTrenTrang,
  },
  {
    ten: 'Trong hộp (CommandDialog)',
    moTa: 'Dialog của DS + Command phóng to theo .ui-command: hàng gõ 52 chữ 16, mục cao 40. Esc / bấm nền đóng, focus về nút mở. Ô tìm toàn cục của app là CommandPalette.',
    Demo: TrongHop,
  },
]

/**
 * #command trần (/ds/tron). Artifact chỉ có CommandPalette (dựng trên Command) → Command không có cổng so khớp riêng; số
 * đo khớp token ghi ở README `ds/nguon/components/Command/README.md`.
 */
export function KhoiCommand() {
  return (
    <section id="command" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#command">Command</a>
      </h2>
      <div className="flex flex-col gap-6">
        {BIEN_THE.map(({ ten, Demo }) => (
          <Demo key={ten} />
        ))}
      </div>
    </section>
  )
}

/** #command dạng hàng (/ds). */
export function KhoiCommandHang() {
  return (
    <KhoiHang neo="command">
      {BIEN_THE.map(({ ten, moTa, Demo }) => (
        <BienThe key={ten} ten={ten} moTa={moTa}>
          <Demo />
        </BienThe>
      ))}
    </KhoiHang>
  )
}
