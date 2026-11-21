'use client'

import { Fragment } from 'react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { BienThe, KhoiHang } from '../_khung/tam'

const MA_MAY = Array.from({ length: 40 }, (_, i) => `NX-${String(2201 + i).padStart(4, '0')}`)
const KHO = ['Đà Nẵng', 'Hà Nội', 'TP.HCM', 'Cần Thơ', 'Hải Phòng', 'Nha Trang', 'Huế', 'Vinh', 'Quy Nhơn', 'Đà Lạt']

/** Demo không PII. `data-so` để đo. */
function CacBienThe() {
  return (
    <>
      <BienThe ten="Dọc" moTa="Cao cố định 288; thanh cuộn tự vẽ dày 10, con chạy alpha-30. Tab vào vùng rồi ↑/↓ để cuộn.">
        <ScrollArea className="h-72 w-48 rounded-(--radius-md) [box-shadow:inset_0_0_0_1px_var(--border)]" data-so="doc">
          <div className="p-4">
            <h4 className="m-0 mb-4 text-[14px] leading-[20px] font-medium">Mã máy trong kho</h4>
            {MA_MAY.map((m) => (
              <Fragment key={m}>
                <div className="text-[14px] leading-[20px]">{m}</div>
                <Separator className="my-2" />
              </Fragment>
            ))}
          </div>
        </ScrollArea>
      </BienThe>
      <BienThe ten="Ngang" moTa='Thêm <ScrollBar orientation="horizontal" /> trong ScrollArea.'>
        <ScrollArea
          className="w-full max-w-96 rounded-(--radius-md) whitespace-nowrap [box-shadow:inset_0_0_0_1px_var(--border)]"
          data-so="ngang"
        >
          <div className="flex w-max gap-3 p-4">
            {KHO.map((k) => (
              <div
                key={k}
                className="flex h-20 w-32 shrink-0 items-center justify-center rounded-(--radius-md) bg-muted text-[14px] leading-[20px]"
              >
                Kho {k}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </BienThe>
    </>
  )
}

/** #scroll-area trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp riêng. */
export function KhoiScrollArea() {
  return (
    <section id="scroll-area" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#scroll-area">ScrollArea</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #scroll-area dạng hàng (/ds). */
export function KhoiScrollAreaHang() {
  return (
    <KhoiHang neo="scroll-area">
      <CacBienThe />
    </KhoiHang>
  )
}
