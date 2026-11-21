'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Nhãn + số % bằng chữ cạnh thanh (thanh không tự nói số). */
function Dong({ ten, value, so }: { ten: string; value: number; so?: string }) {
  return (
    <div className="flex max-w-80 flex-col gap-1.5">
      <div className="flex justify-between text-[12px] leading-[18px] text-muted-foreground tabular-nums">
        <span>{ten}</span>
        <span>{value}%</span>
      </div>
      <Progress value={value} aria-label={ten} data-so={so} />
    </div>
  )
}

/** Demo không PII. */
function CacBienThe() {
  const [p, setP] = useState(20)
  return (
    <>
      <BienThe ten="Đang chạy" moTa="Cao 4, rãnh alpha-08, thanh primary-solid. Luôn kèm số % bằng chữ.">
        <Dong ten="Đang tải bao-gia-DH-1024.pdf" value={64} so="dang" />
      </BienThe>
      <BienThe ten="Xong" moTa="100% → data-state complete.">
        <Dong ten="Nhập 425 dòng khách" value={100} so="xong" />
      </BienThe>
      <BienThe ten="Bấm thử" moTa="Thanh trượt 200ms ease khi đổi giá trị.">
        <div className="flex flex-col gap-3">
          <Dong ten="Đồng bộ kho" value={p} so="thu" />
          <div>
            <Button variant="outline" size="sm" onClick={() => setP((x) => (x >= 100 ? 0 : x + 20))}>
              {p >= 100 ? 'Làm lại' : 'Thêm 20%'}
            </Button>
          </div>
        </div>
      </BienThe>
    </>
  )
}

/** #progress trần (/ds/tron). Chưa có trong artifact riêng (token `.ui-progress`) → không có cổng so khớp riêng. */
export function KhoiProgress() {
  return (
    <section id="progress" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#progress">Progress</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #progress dạng hàng (/ds). */
export function KhoiProgressHang() {
  return (
    <KhoiHang neo="progress">
      <CacBienThe />
    </KhoiHang>
  )
}
