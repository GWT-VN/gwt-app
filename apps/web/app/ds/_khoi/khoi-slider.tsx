'use client'

import { useState } from 'react'
import { Field, FieldTitle } from '@/components/ui/field'
import { Slider } from '@/components/ui/slider'
import { dinhDangSo } from '@/lib/dinh-dang-so'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Demo không PII. Luôn hiện giá trị đang chọn bằng chữ (núm không tự hiện số). */
function CacBienThe() {
  const [muc, setMuc] = useState([60])
  const [gia, setGia] = useState([2_000_000, 8_000_000])
  return (
    <>
      <BienThe ten="Một giá trị" moTa="←/→ đổi 5, PageUp/PageDown đổi 50, Home/End về 0 / 100.">
        <Field className="max-w-80" data-so="mot">
          <div className="flex items-center justify-between border-none border-current">
            <FieldTitle>Ngưỡng cảnh báo tồn kho</FieldTitle>
            <span className="text-[14px] leading-[20px] text-muted-foreground tabular-nums border-none border-current">
              {muc[0]}%
            </span>
          </div>
          <Slider value={muc} onValueChange={setMuc} step={5} nhan="Ngưỡng cảnh báo tồn kho" />
        </Field>
      </BienThe>
      <BienThe ten="Khoảng" moTa="Hai núm: từ – đến (lọc khoảng giá); mỗi núm có tên riêng.">
        <Field className="max-w-80" data-so="khoang">
          <div className="flex items-center justify-between border-none border-current">
            <FieldTitle>Khoảng giá</FieldTitle>
            <span className="text-[14px] leading-[20px] text-muted-foreground tabular-nums border-none border-current">
              {dinhDangSo(gia[0])} – {dinhDangSo(gia[1])} ₫
            </span>
          </div>
          <Slider
            value={gia}
            onValueChange={setGia}
            min={0}
            max={20_000_000}
            step={500_000}
            minStepsBetweenThumbs={1}
            nhan={['Giá từ', 'Giá đến']}
          />
        </Field>
      </BienThe>
      <BienThe ten="Tắt" moTa="Không kéo được, mờ 50%.">
        <Slider defaultValue={[40]} disabled nhan="Mức ưu tiên (tắt)" className="max-w-80" />
      </BienThe>
    </>
  )
}

/** #slider trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp riêng. */
export function KhoiSlider() {
  return (
    <section id="slider" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#slider">Slider</a>
      </h2>
      <div className="divide-y divide-(--border) border-none border-current">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #slider dạng hàng (/ds). */
export function KhoiSliderHang() {
  return (
    <KhoiHang neo="slider">
      <CacBienThe />
    </KhoiHang>
  )
}
