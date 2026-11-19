import Link from 'next/link'
import { DotsThree, Plus } from '@phosphor-icons/react/ssr'
import { DsRoot } from '@/components/ui/ds-root'
import { Button } from '@/components/ui/button'

/**
 * /ds — xem component DS v2 thật, mỗi component một khối có #neo. `?theme=dark` cho tối.
 * Khối #button tái tạo 3 hàng của ds/nguon/components/Button/preview.html; `data-so` = khoá so khớp với preview
 * (ds/so-khop.mjs đo getComputedStyle từng cặp). Hàng 2 không ép hover/focus bằng class — tạo bằng tương tác thật.
 */
export default async function DsPage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const theme = (await searchParams).theme === 'dark' ? 'dark' : 'light'
  return (
    <DsRoot theme={theme} className="min-h-screen p-6">
      <header className="mb-8 flex items-center justify-between gap-4">
        <h1 className="[font:var(--text-heading-md)]">Design system v2</h1>
        <Button asChild variant="outline" size="sm">
          <Link href={`/ds?theme=${theme === 'dark' ? 'light' : 'dark'}`}>{theme === 'dark' ? 'Sáng' : 'Tối'}</Link>
        </Button>
      </header>

      <section id="button" className="scroll-mt-6">
        <h2 className="mb-4 [font:var(--text-heading-xs)]">
          <a href="#button">Button</a>
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button data-so="default">Lưu thay đổi</Button>
            <Button data-so="secondary" variant="secondary">Xuất Excel</Button>
            <Button data-so="outline" variant="outline">Bộ lọc</Button>
            <Button data-so="ghost" variant="ghost">Huỷ</Button>
            <Button data-so="destructive" variant="destructive">Xoá đơn</Button>
            <Button data-so="link" variant="link">Xem chi tiết</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button>Hover</Button>
            <Button>Focus</Button>
            <Button data-so="disabled" disabled>Disabled</Button>
            <Button data-so="loading" loading>Đang lưu</Button>
            <Button data-so="outline-disabled" variant="outline" disabled>Outline disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button data-so="sm" size="sm"><Plus />Thêm (sm 28)</Button>
            <Button data-so="md">Thêm (md 32)</Button>
            <Button data-so="lg" size="lg">Thêm (lg 36)</Button>
            <Button data-so="icon" size="icon" variant="outline" aria-label="Thêm"><Plus /></Button>
            <Button data-so="rounded-sm" size="sm" shape="rounded" variant="outline">Rounded (trong bảng)</Button>
            <Button data-so="icon-sm-rounded" size="icon-sm" shape="rounded" variant="ghost" aria-label="Thêm thao tác">
              <DotsThree />
            </Button>
          </div>
          <p className="m-0 [font:var(--text-text-xs)] text-muted-foreground">
            Hàng 2: trỏ chuột / Tab để thấy hover, focus thật (không ép bằng class).
          </p>
        </div>
      </section>
    </DsRoot>
  )
}
