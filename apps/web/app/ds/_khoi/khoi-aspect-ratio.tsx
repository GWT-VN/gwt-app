'use client'

import { Image as ImageIcon } from '@phosphor-icons/react/ssr'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Ô ảnh giả (không tải ảnh ngoài): nền muted + icon giữa, như ô xem trước `.ui-file-thumb`. */
function OAnh({ chu }: { chu: string }) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-1 text-[12px] leading-[18px] text-muted-foreground">
      <ImageIcon aria-hidden="true" className="size-6" />
      {chu}
    </div>
  )
}

/** Demo không PII. `data-so` để đo. */
function CacBienThe() {
  return (
    <>
      <BienThe ten="16 / 9" moTa="Ảnh bìa bài wiki, video hướng dẫn — khung giữ tỉ lệ khi đổi bề ngang.">
        <div className="max-w-80">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-(--radius-lg) bg-muted" data-so="rong">
            <OAnh chu="16 / 9" />
          </AspectRatio>
        </div>
      </BienThe>
      <BienThe ten="1 / 1" moTa="Ảnh sản phẩm trong lưới catalog.">
        <div className="w-40">
          <AspectRatio ratio={1} className="overflow-hidden rounded-(--radius-lg) bg-muted" data-so="vuong">
            <OAnh chu="1 / 1" />
          </AspectRatio>
        </div>
      </BienThe>
    </>
  )
}

/** #aspect-ratio trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp riêng. */
export function KhoiAspectRatio() {
  return (
    <section id="aspect-ratio" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#aspect-ratio">AspectRatio</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #aspect-ratio dạng hàng (/ds). */
export function KhoiAspectRatioHang() {
  return (
    <KhoiHang neo="aspect-ratio">
      <CacBienThe />
    </KhoiHang>
  )
}
