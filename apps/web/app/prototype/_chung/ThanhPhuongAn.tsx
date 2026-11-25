'use client'

// PROTOTYPE vứt đi — thanh đổi phương án dùng chung (đáy màn, ←/→), ghi `?variant=` lên URL. Chỉ hiện khi dev.
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { CaretLeft, CaretRight } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Kbd, KbdGroup } from '@/components/ui/kbd'

export type PhuongAn = { ma: string; ten: string }

export function ThanhPhuongAn({ ds, hienTai }: { ds: PhuongAn[]; hienTai: string }) {
  const router = useRouter()
  const duong = usePathname()
  const i = Math.max(0, ds.findIndex((p) => p.ma === hienTai))

  const sang = (buoc: number) => {
    const q = new URLSearchParams(window.location.search)
    q.set('variant', ds[(i + buoc + ds.length) % ds.length].ma)
    router.replace(`${duong}?${q}${window.location.hash}`, { scroll: false })
  }

  useEffect(() => {
    const nghe = (e: KeyboardEvent) => {
      if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea, select, [contenteditable=true], [role=dialog], [role=grid], [role=listbox], [role=menu], [role=tablist]')) return
      sang(e.key === 'ArrowLeft' ? -1 : 1)
    }
    window.addEventListener('keydown', nghe)
    return () => window.removeEventListener('keydown', nghe)
  })

  if (process.env.NODE_ENV === 'production') return null
  return (
    // Góc trái-dưới vùng nội dung (giữa đáy là chỗ của thanh hàng loạt), z dưới bulkbar 55 → thanh thật luôn đè thanh này.
    <nav
      aria-label="Đổi phương án"
      className={cn(
        'fixed bottom-4 left-[calc(var(--khung-trai-rong,0px)+16px)] max-[767px]:left-4 z-50 flex items-center gap-1 rounded-(--radius-full) p-1',
        'max-w-[calc(100vw-32px)] border-none border-current bg-popover text-popover-foreground',
        '[box-shadow:var(--shadow),var(--shadow-hairline)]',
      )}
    >
      <Button variant="ghost" size="icon-sm" aria-label="Phương án trước" onClick={() => sang(-1)}>
        <CaretLeft />
      </Button>
      <span aria-live="polite" className="min-w-0 truncate px-1 ds-text-sm font-medium">
        Prototype · {ds[i].ma} — {ds[i].ten}
      </span>
      <KbdGroup className="ml-1 max-md:hidden">
        <Kbd>←</Kbd>
        <Kbd>→</Kbd>
      </KbdGroup>
      <Button variant="ghost" size="icon-sm" aria-label="Phương án sau" onClick={() => sang(1)}>
        <CaretRight />
      </Button>
    </nav>
  )
}
