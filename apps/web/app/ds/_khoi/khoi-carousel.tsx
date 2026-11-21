'use client'

import { useEffect, useState } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { BienThe, KhoiHang } from '../_khung/tam'

const SO = [1, 2, 3, 4, 5]

/** Ô demo: số lớn giữa thẻ muted — không ảnh, không PII. */
function O({ n }: { n: number }) {
  return (
    <div className="flex aspect-square items-center justify-center rounded-xl border border-(--border) bg-muted [font:var(--text-heading-lg)] tabular-nums">
      {n}
    </div>
  )
}

/** Một mục mỗi trang + câu "Mục x / 5" đọc từ `setApi` (vùng live polite). */
function MotMuc() {
  const [api, setApi] = useState<CarouselApi>()
  const [hienTai, setHienTai] = useState(0)

  useEffect(() => {
    if (!api) return
    const cap = () => setHienTai(api.selectedScrollSnap() + 1)
    cap()
    api.on('select', cap)
    return () => {
      api.off('select', cap)
    }
  }, [api])

  return (
    <div className="flex flex-col items-center gap-2 px-12">
      <Carousel setApi={setApi} aria-label="Ảnh mẫu demo" className="w-full max-w-48" data-so="mot">
        <CarouselContent>
          {SO.map((n) => (
            <CarouselItem key={n} aria-label={`${n} / ${SO.length}`}>
              <O n={n} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <p aria-live="polite" className="m-0 text-[12px] leading-[18px] text-muted-foreground tabular-nums">
        {hienTai ? `Mục ${hienTai} / ${SO.length}` : ''}
      </p>
    </div>
  )
}

function CacBienThe() {
  return (
    <>
      <BienThe ten="Một mục" moTa="Nút trước/sau = Button outline icon 32, tự tắt ở hai đầu. Focus trong vùng: ← / → chuyển mục.">
        <MotMuc />
      </BienThe>
      <BienThe ten="Nhiều mục" moTa="basis-1/2, từ md basis-1/3; align start. Khối chứa chừa lề 48 mỗi bên cho nút.">
        <div className="px-12">
          <Carousel opts={{ align: 'start' }} aria-label="Danh sách demo" className="max-w-md" data-so="nhieu">
            <CarouselContent>
              {SO.map((n) => (
                <CarouselItem key={n} className="basis-1/2 md:basis-1/3" aria-label={`${n} / ${SO.length}`}>
                  <O n={n} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </BienThe>
    </>
  )
}

/** #carousel trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp. */
export function KhoiCarousel() {
  return (
    <section id="carousel" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#carousel">Carousel</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #carousel dạng hàng (/ds). */
export function KhoiCarouselHang() {
  return (
    <KhoiHang neo="carousel">
      <CacBienThe />
    </KhoiHang>
  )
}
