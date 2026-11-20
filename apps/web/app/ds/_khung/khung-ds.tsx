import type { ReactNode } from 'react'
import { DsRoot } from '@/components/ui/ds-root'
import { NHOM_MUC } from './khoi'
import { MucLuc, ThanhDiDong } from './muc-luc'
import type { Theme } from './trang'

/** `?theme=dark` → tối, còn lại sáng. */
export async function layTheme(searchParams: Promise<{ theme?: string }>): Promise<Theme> {
  return (await searchParams).theme === 'dark' ? 'dark' : 'light'
}

/**
 * Khung mọi trang /ds: cột trái 240 dính (cuộn riêng, nền `sidebar`, viền phải `sidebar-border` như `.ui-sidebar`) +
 * nội dung. < 768 (`md` = 48rem, trùng mốc DS): cột trái ẩn, thay bằng thanh trên có nút "Mục lục" mở Sheet.
 * `trang` = slug trong `TRANG` (trang.ts) — mục đang xem.
 */
export function KhungDs({ theme, trang, children }: { theme: Theme; trang: string; children: ReactNode }) {
  const p = { trang, theme, nhom: NHOM_MUC }
  return (
    <DsRoot theme={theme} className="min-h-screen md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <a
        href="#noi-dung"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-20 focus:rounded-md focus:bg-background focus:px-3 focus:py-1.5 focus:outline-2 focus:outline-ring"
      >
        Bỏ qua mục lục
      </a>
      <aside className="sticky top-0 hidden h-screen overflow-y-auto border-r border-(--sidebar-border) bg-(--sidebar) px-2 py-3 md:block">
        <MucLuc {...p} coDau />
      </aside>
      <div className="min-w-0">
        <ThanhDiDong {...p} />
        {/* Thanh trên dính ở màn hẹp cao ~49px → neo `#id` chừa 64 để tiêu đề không nằm dưới thanh. */}
        <main id="noi-dung" className="px-4 py-6 max-md:[&_[id]]:scroll-mt-16 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </DsRoot>
  )
}
