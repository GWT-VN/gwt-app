import { MagnifyingGlass } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'

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
      <div>
        <Button data-so="nut" variant="outline" aria-haspopup="dialog">
          <MagnifyingGlass aria-hidden="true" /> Tìm… <Kbd data-so="ctrl">Ctrl</Kbd>
          <Kbd data-so="k">K</Kbd>
        </Button>
      </div>
    </section>
  )
}
