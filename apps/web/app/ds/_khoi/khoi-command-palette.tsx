'use client'

import { useState, type ReactNode } from 'react'
import { Cpu, MagnifyingGlass, Package, Ticket, User } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { CommandPalette, CommandPanel, PhimMoLenh, usePhimMoLenh, type MucLenh, type NhomLenh } from '@/components/ui/command-palette'
import { hop } from '@/components/ui/command-styles'
import { cn } from '@/lib/utils'
import { BienThe, KhoiHang } from '../_khung/tam'

// Dữ liệu demo — tên giả trung tính, SĐT giả (chỉ hiện ••• + 4 số cuối), mã tự đặt. Không đọc DB.
const KHACH: [string, string, string, string][] = [
  ['KH-01057', 'Khách sạn Sen Vàng', 'Doanh nghiệp · Thủ Đức', '0909 123 456'],
  ['KH-01102', 'Công ty Demo An Phát', 'Doanh nghiệp · Quận 7', '0912 000 111'],
  ['KH-01145', 'Trường mầm non Demo Hoa Mai', 'Trường học · Bình Thạnh', '0938 222 333'],
  ['KH-01188', 'Nhà hàng Demo Biển Xanh', 'Nhà hàng · Quận 1', '0907 444 555'],
  ['KH-01203', 'Văn phòng Demo Minh Khang', 'Doanh nghiệp · Gò Vấp', '0983 666 777'],
  ['KH-01231', 'Spa Demo Thảo Mộc', 'Cửa hàng · Quận 3', '0976 888 999'],
  ['KH-01260', 'Cửa hàng Demo Gia Bảo', 'Cửa hàng · Tân Bình', '0965 135 246'],
]

const NHOM: NhomLenh[] = [
  {
    ten: 'Ticket',
    icon: Ticket,
    muc: [
      { id: 'TK-2611-045', ten: 'TK-2611-045 · Khách sạn Sen Vàng', phu: 'Mới · Báo KT trưởng, xếp lịch trong ngày', truong: ['TK-2611-045', 'Khách sạn Sen Vàng'] },
      { id: 'TK-2611-031', ten: 'TK-2611-031 · Công ty Demo An Phát', phu: 'Đang xử lý · Chờ linh kiện', truong: ['TK-2611-031', 'Công ty Demo An Phát'] },
    ],
  },
  {
    ten: 'Khách hàng',
    icon: User,
    muc: KHACH.map(([ma, ten, loai, sdt]) => ({ id: ma, ten, phu: `${ma} · ${loai} · SĐT •••${sdt.replace(/\D/g, '').slice(-4)}`, truong: [ten, ma, sdt] })),
  },
  {
    ten: 'Máy (serial)',
    icon: Cpu,
    muc: [{ id: 'D50-2306-0192', ten: 'D50-2306-0192', phu: 'CTD50 · Khách sạn Sen Vàng', truong: ['D50-2306-0192', 'CTD50', 'Khách sạn Sen Vàng'] }],
  },
  {
    ten: 'Đơn hàng',
    icon: Package,
    muc: [{ id: '261118-E004', ten: 'Đơn 261118-E004', phu: 'Website · đã giao · Công ty Demo An Phát', truong: ['261118-E004', 'Công ty Demo An Phát'] }],
  },
]
const PHAM_VI = 'ticket, khách, serial, đơn'
const boQua = () => {}

/** Nhãn mục của preview (`.ds-nhan`, khung trình bày — không phải component): 12/16 500 muted, cách dưới 8. */
function Nhan({ children }: { children: ReactNode }) {
  return <p className="mb-2 border-none border-current text-[12px] leading-[16px] font-medium text-muted-foreground">{children}</p>
}

/** Mặt hộp nằm tĩnh trên trang (preview vẽ `<dialog open>` relative): bọc `hop`, không fixed/z. */
function MatTinh({ chu, so }: { chu: string; so: string }) {
  return (
    <div data-so={so} role="group" aria-label={`Tìm toàn cục (mẫu "${chu}")`} className={cn(hop, 'relative')}>
      <CommandPanel nhom={NHOM} onChon={boQua} onHoiBap={boQua} phamVi={PHAM_VI} defaultSearch={chu} />
    </div>
  )
}

/** Nút 🔍 mở hộp + Ctrl K / ⌘K; dòng dưới báo mục vừa chọn (demo không điều hướng). `chu` = chữ có sẵn khi mở. */
function MoThat({ so = 'mo', chu }: { so?: string; chu?: string }) {
  const [mo, setMo] = useState(false)
  const [daChon, setDaChon] = useState('')
  usePhimMoLenh(setMo)
  return (
    <div className="flex flex-wrap items-center gap-3 border-none border-current">
      <Button data-so={so} variant="outline" aria-haspopup="dialog" onClick={() => setMo(true)}>
        <MagnifyingGlass aria-hidden="true" />
        Tìm…
        <PhimMoLenh />
      </Button>
      <span aria-live="polite" className="text-[12px] leading-[18px] text-muted-foreground">
        {daChon && `Đã chọn: ${daChon} (demo — trang thật sẽ mở bản ghi)`}
      </span>
      <CommandPalette
        open={mo}
        onOpenChange={setMo}
        nhom={NHOM}
        onChon={(m: MucLenh) => setDaChon(m.ten)}
        onHoiBap={(q) => setDaChon(`Hỏi Bắp: “${q}”`)}
        phamVi={PHAM_VI}
        defaultSearch={chu}
      />
    </div>
  )
}

/**
 * #command-palette — tái tạo ds/nguon/components/CommandPalette/preview.html: cột rộng tối đa 640, hai mặt hộp tĩnh
 * ("sen vang" có kết quả · "sen vang xyzxyz" không thấy) cách nhau 24 (+ lề dưới 28 của `.ds-muc`). Thêm nút mở hộp
 * THẬT (nổi, portal) trên cùng — cổng so khớp mở bằng nút này. Khoá: ds/so-khop/commandpalette.json.
 */
export function KhoiCommandPalette() {
  return (
    <section id="command-palette" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#command-palette">CommandPalette</a>
      </h2>
      <div className="mb-4 border-none border-current">
        {/* Mở sẵn chữ "sen vang" như mặt đầu của preview → cổng so khớp đo hộp nổi cùng nội dung. */}
        <MoThat chu="sen vang" />
      </div>
      <div className="max-w-[640px] border-none border-current">
        <div className="flex flex-col gap-6 border-none border-current">
          <div className="mb-7 border-none border-current">
            <Nhan>Gõ &quot;sen vang&quot; (không dấu) — kết quả nhóm theo loại, đoạn khớp in đậm</Nhan>
            <MatTinh so="co-ket-qua" chu="sen vang" />
          </div>
          <div className="mb-7 border-none border-current">
            <Nhan>Không thấy — gợi ý bỏ bớt chữ hoặc hỏi Bắp</Nhan>
            <MatTinh so="khong-thay" chu="sen vang xyzxyz" />
          </div>
        </div>
      </div>
    </section>
  )
}

/** #command-palette dạng hàng (/ds): mở thật · có kết quả · cắt 5 dòng · SĐT · không thấy. Mặt tĩnh rộng tối đa 640. */
export function KhoiCommandPaletteHang() {
  return (
    <KhoiHang neo="command-palette">
      <BienThe ten="Mở bằng nút hoặc phím tắt" moTa="Bấm nút, hoặc Ctrl K (Mac: ⌘K) ở bất kỳ đâu. Gõ thử: sen vang, 0909.123, demo.">
        <MoThat so="mo-hang" />
      </BienThe>
      {[
        ['Có kết quả', 'Gõ không dấu vẫn ra; mỗi loại một nhóm, đoạn khớp in đậm. Enter mở dòng đang sáng.', 'sen vang'],
        ['Nhiều kết quả', 'Mỗi nhóm hiện tối đa 5 dòng, cạnh tên nhóm ghi đang hiện bao nhiêu trên tổng — gõ thêm để thu hẹp.', 'demo'],
        ['Tìm theo số điện thoại', 'Gõ kiểu 0909.123 hay 0909-123 vẫn khớp số lưu dạng 0909 123 456.', '0909.123'],
        ['Không thấy', 'Câu gợi ý bỏ bớt chữ, kèm dòng hỏi Bắp để không rơi vào ngõ cụt.', 'sen vang xyzxyz'],
      ].map(([ten, moTa, chu]) => (
        <BienThe key={chu} ten={ten} moTa={moTa}>
          <div className="max-w-[640px] border-none border-current">
            <MatTinh so={`hang-${chu}`} chu={chu} />
          </div>
        </BienThe>
      ))}
    </KhoiHang>
  )
}
