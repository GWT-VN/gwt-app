import { MagnifyingGlass } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { CHU } from '../_khung/chu'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Demo dùng chung cho `KhoiKbd` (/ds/tron) và `KhoiKbdHang` (/ds). */
const NUT = (
  <Button data-so="nut" variant="outline" aria-haspopup="dialog">
    <MagnifyingGlass aria-hidden="true" /> Tìm… <Kbd data-so="ctrl">Ctrl</Kbd>
    <Kbd data-so="k">K</Kbd>
  </Button>
)

/**
 * #kbd — tái tạo ds/nguon/components/Kbd/preview.html: phím tắt nằm trong nút outline "Tìm…" (mở CommandPalette ở
 * lát 6). `data-so` = khoá so khớp (ds/so-khop/kbd.json nhắm `#kbd > div`).
 */
export function KhoiKbd() {
  return (
    <section id="kbd" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#kbd">Kbd</a>
      </h2>
      <div>{NUT}</div>
    </section>
  )
}

/** Thay chỗ trống của hàng chỉ có Kbd trên màn cảm ứng (Kbd tự ẩn ở đó — không bàn phím). */
const AN_CAM_UNG = (
  <span className={`hidden ${CHU.xs} text-muted-foreground pointer-coarse:inline`}>Phím tắt ẩn trên màn cảm ứng</span>
)

/** #kbd dạng hàng cho /ds. Thiết bị cảm ứng (không bàn phím) ẩn Kbd. */
export function KhoiKbdHang() {
  return (
    <KhoiHang neo="kbd">
      <BienThe ten="Kbd" moTa="Một phím — gợi ý phím tắt cạnh chữ. Trên màn cảm ứng chỉ phím tắt ẩn đi.">
        <Kbd>Esc</Kbd>
        {AN_CAM_UNG}
      </BienThe>
      <BienThe ten="KbdGroup" moTa="Tổ hợp phím, cách nhau 4px. Trên màn cảm ứng chỉ phím tắt ẩn đi.">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        {AN_CAM_UNG}
      </BienThe>
      <BienThe ten="Trong nút viền" moTa="Nút mở tìm kiếm kèm phím tắt. Trên màn cảm ứng nút vẫn hiện, chỉ phím tắt ẩn.">
        {NUT}
      </BienThe>
    </KhoiHang>
  )
}
