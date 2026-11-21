'use client'

import { useState } from 'react'
import { Check } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { BienThe, KhoiHang } from '../_khung/tam'

const KHO = ['Kho Hà Nội', 'Kho Đà Nẵng', 'Kho TP. Hồ Chí Minh'] as const

/**
 * Nút + ngăn "Chọn kho xuất" — dùng chung khối trần và hàng biến thể. Ba kho là ba nút (chọn xong đóng ngăn), kho đang
 * chọn mang ✓ + `aria-pressed`; Huỷ = DrawerClose. `huong` = prop `direction` của shadcn.
 */
function NganChonKho({ huong = 'bottom', so }: { huong?: 'bottom' | 'right'; so?: string }) {
  const [mo, setMo] = useState(false)
  const [kho, setKho] = useState<string>(KHO[0])
  return (
    <Drawer direction={huong} open={mo} onOpenChange={setMo}>
      <DrawerTrigger asChild>
        <Button data-so={so} variant="outline">
          {kho}…
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Chọn kho xuất</DrawerTitle>
          <DrawerDescription>Áp dụng cho phiếu xuất đang mở (dữ liệu demo).</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          {KHO.map((k) => (
            <Button
              key={k}
              variant={k === kho ? 'secondary' : 'ghost'}
              aria-pressed={k === kho}
              onClick={() => {
                setKho(k)
                setMo(false)
              }}
            >
              {k === kho && <Check aria-hidden="true" />}
              {k}
            </Button>
          ))}
          <DrawerClose asChild>
            <Button variant="outline">Huỷ</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

/**
 * #drawer — chưa có trong artifact (nguồn shadcn new-york-v4, `vaul`). Ngăn đáy "Chọn kho xuất": tiêu đề + mô tả, ba
 * kho + Huỷ xếp dọc rộng hết. Không có cổng so khớp (artifact chưa có preview) — giá trị gán token Dialog/Sheet, đo
 * getComputedStyle trong báo cáo đợt. `data-so` để đo.
 */
export function KhoiDrawer() {
  return (
    <section id="drawer" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#drawer">Drawer</a>
      </h2>
      <div className="flex">
        <NganChonKho so="mo" />
      </div>
    </section>
  )
}

/** /ds dạng hàng. */
export function KhoiDrawerHang() {
  return (
    <KhoiHang neo="drawer">
      <BienThe ten="Ngăn đáy" moTa="Mặc định. Chọn nhanh trên điện thoại; kéo xuống, Esc hoặc bấm nền để đóng">
        <NganChonKho />
      </BienThe>
      <BienThe ten="Cạnh phải" moTa='direction="right": rộng 3/4, trần 384px; vuốt sang phải để đóng'>
        <NganChonKho huong="right" />
      </BienThe>
    </KhoiHang>
  )
}
