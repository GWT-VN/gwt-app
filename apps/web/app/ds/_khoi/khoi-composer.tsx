'use client'

import { useState } from 'react'
import { Composer } from '@/components/ui/composer'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Demo dùng chung cho `KhoiComposer` (/ds/tron) và `KhoiComposerHang` (/ds) — dữ liệu demo, không lưu. Cổng so khớp nhắm theo vị trí con (ds/so-khop/composer.json). */

const TEP_LOI = typeof File === 'undefined' ? [] : [new File(['demo'], 'bien-ban-hen.pdf', { type: 'application/pdf' })]
const LOI = 'Chưa gửi được — mất kết nối. Nội dung vẫn giữ nguyên, bấm Gửi lại.'

/** Gửi thử: chờ 0,8 giây rồi báo đã gửi (dòng chữ dưới ô) — không lưu đâu cả. */
function GuiThu() {
  const [daGui, setDaGui] = useState('')
  return (
    <div className="flex flex-col gap-2 border-none border-current">
      <Composer
        onGui={(noi, tep) =>
          new Promise<void>((xong) =>
            setTimeout(() => {
              setDaGui(`Đã gửi (demo): ${noi.slice(0, 40) || '(chỉ tệp)'}${tep.length ? ` · ${tep.length} tệp` : ''}`)
              xong()
            }, 800),
          )
        }
      />
      <p aria-live="polite" className="m-0 border-none border-current text-[12px] leading-[18px] text-muted-foreground">
        {daGui}
      </p>
    </div>
  )
}

const LOI_GUI = <Composer onGui={() => {}} defaultValue="Đã hẹn KT tới 14:00, khách đồng ý." defaultTep={TEP_LOI} loi={LOI} />
const KHOA = <Composer onGui={() => {}} disabled placeholder="Ticket đã đóng — mở lại để ghi tiếp" />

/**
 * #composer — tái tạo ds/nguon/components/Composer/preview.html (rộng tối đa 640, ba ô cách 16): thường · gửi lỗi (giữ
 * nội dung + tệp, viền đỏ, "Gửi lại") · khoá. Câu lỗi dưới ô lỗi preview không có (DS thêm — README "lỗi gửi giữ nguyên").
 */
export function KhoiComposer() {
  return (
    <section id="composer" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#composer">Composer</a>
      </h2>
      <div className="flex max-w-[640px] flex-col gap-4 border-none border-current">
        <Composer onGui={() => {}} />
        {LOI_GUI}
        {KHOA}
      </div>
    </section>
  )
}

/** #composer dạng hàng cho /ds. */
export function KhoiComposerHang() {
  return (
    <KhoiHang neo="composer">
      <BienThe ten="Thường" moTa="Gõ rồi Ctrl + Enter (máy Mac ⌘ + Enter) để gửi; Enter xuống dòng. Ô trống thì nút gửi tắt.">
        <div className="max-w-[640px] border-none border-current">
          <GuiThu />
        </div>
      </BienThe>
      <BienThe ten="Đang gửi" moTa="Ô và nút bị khoá, nút quay vòng chờ.">
        <div className="max-w-[640px] border-none border-current">
          <Composer onGui={() => {}} dangGui defaultValue="Khách xác nhận máy đã hết rò." />
        </div>
      </BienThe>
      <BienThe ten="Gửi lỗi" moTa="Giữ nguyên nội dung và tệp, viền đỏ, câu lỗi bên dưới, nút thành Gửi lại.">
        <div className="max-w-[640px] border-none border-current">{LOI_GUI}</div>
      </BienThe>
      <BienThe ten="Khoá" moTa="Bản ghi đã đóng: mờ đi, chữ gợi ý nói vì sao không ghi được.">
        <div className="max-w-[640px] border-none border-current">{KHOA}</div>
      </BienThe>
    </KhoiHang>
  )
}
