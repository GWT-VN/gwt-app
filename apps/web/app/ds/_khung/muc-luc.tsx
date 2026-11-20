'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { List, MagnifyingGlass, Moon, Sun } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { locMucLuc } from './loc'
import { CHU } from './chu'
import { duongDan, TRANG, type NhomMuc, type Theme } from './trang'

/**
 * Mục cột trái — giá trị `.ui-sidebar-item` của ds/nguon/bundle.css (cao control-md 32, padding 0 8, gap 8, bo radius-md 8,
 * 14/20) + màu kiểu ChatGPT `.pD-cuon` (chữ muted, rê alpha-04, đang xem nền `sidebar-accent` alpha-08/12 + chữ đậm 500).
 * Focus: outline 2px ring vào trong (−2) như `.ui-sidebar-item:focus-visible`.
 */
const MUC = [
  'flex h-(--control-size-md) min-w-0 items-center gap-2 rounded-md px-2 text-[14px] leading-[20px]',
  'text-muted-foreground hover:bg-(--alpha-04) hover:text-foreground',
  'data-active:bg-(--sidebar-accent) data-active:font-medium data-active:text-foreground',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--sidebar-ring)',
  '[&>svg]:size-4 [&>svg]:shrink-0',
].join(' ')

const TRANG_COMPONENTS = TRANG.find((t) => t.slug === 'components')!

/** Neo của khối đang ở đầu khung nhìn trên /ds (cuộn hoặc bấm `#neo`). */
function useNeoDangXem(bat: boolean): string {
  const [neo, setNeo] = useState('')
  useEffect(() => {
    if (!bat) return
    const tinh = () => {
      let id = ''
      for (const s of document.querySelectorAll<HTMLElement>('main section[id]')) {
        // Ngưỡng = scroll-margin-top của chính khối (chỗ nhảy #neo dừng lại: 144, màn hẹp 192) + 8 — ngưỡng cứng 96
        // thấp hơn chỗ dừng → bấm #date-picker lại đánh dấu khối trước nó.
        if (s.getBoundingClientRect().top > (parseFloat(getComputedStyle(s).scrollMarginTop) || 0) + 8) break
        id = s.id
      }
      setNeo(id)
    }
    tinh()
    // Mở thẳng /ds#neo: trình duyệt nhảy neo trước khi hydrate, rồi khối phía trên còn đổi cao (font, README) mà không
    // phát sự kiện scroll → tính lại khi bố cục đổi cao.
    const ro = new ResizeObserver(tinh)
    const main = document.querySelector('main')
    if (main) ro.observe(main)
    window.addEventListener('scroll', tinh, { passive: true })
    window.addEventListener('hashchange', tinh)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', tinh)
      window.removeEventListener('hashchange', tinh)
    }
  }, [bat])
  return neo
}

/** Nút sáng/tối: cùng trang, giữ khối đang xem (`#neo`). */
export function NutTheme({ trang, theme, neo }: { trang: string; theme: Theme; neo?: string }) {
  const toi = theme === 'dark'
  return (
    <Button asChild variant="ghost" size="icon-sm">
      <Link href={duongDan(trang, toi ? 'light' : 'dark', neo)} aria-label={toi ? 'Chuyển nền sáng' : 'Chuyển nền tối'}>
        {toi ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      </Link>
    </Button>
  )
}

type Props = { trang: string; theme: Theme; nhom: NhomMuc[] }

/** Ô tìm + danh sách mục. `onChon` = đóng Sheet khi bấm một mục (màn hẹp). */
export function MucLuc({ trang, theme, nhom, onChon, coDau }: Props & { onChon?: () => void; coDau?: boolean }) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const neo = useNeoDangXem(trang === 'components')
  // Cột trái tự cuộn tới component đang xem (chỉ cuộn cột trái — nó nằm trọn trong khung nhìn).
  const navRef = useRef<HTMLElement>(null)
  useEffect(() => {
    navRef.current?.querySelector('[aria-current="location"]')?.scrollIntoView({ block: 'nearest' })
  }, [neo])
  const loc = locMucLuc(TRANG, nhom, q)
  const coComponent = loc.trang.some((t) => t.slug === 'components') || loc.nhom.length > 0
  // Enter trong ô tìm → mở kết quả đầu tiên (trang trước, rồi component đã dựng).
  const dauTien = [
    ...loc.trang.map((t) => duongDan(t.slug, theme)),
    ...loc.nhom.flatMap((n) => n.muc.filter((m) => m.daDung).map((m) => duongDan('components', theme, m.neo))),
  ][0]

  return (
    <div className="flex flex-col gap-3" onClick={(e) => (e.target as HTMLElement).closest('a') && onChon?.()}>
      {coDau && (
        <div className="flex items-center justify-between gap-2 pl-2">
          <Link href={duongDan('tong-quan', theme)} className={`${CHU.h3} rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}>
            Design system v2
          </Link>
          <NutTheme trang={trang} theme={theme} neo={neo} />
        </div>
      )}
      <Input
        type="search"
        icon={<MagnifyingGlass />}
        aria-label="Tìm mục hoặc component"
        placeholder="Tìm mục, component"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || !q.trim() || !dauTien) return
          e.preventDefault()
          router.push(dauTien)
          onChon?.()
        }}
      />
      <nav ref={navRef} aria-label="Mục lục design system">
        <ul className="m-0 flex list-none flex-col gap-px p-0">
          {loc.trang
            .filter((t) => t.slug !== 'components')
            .map(({ slug, ten, icon: Icon }) => (
              <li key={slug}>
                <Link
                  href={duongDan(slug, theme)}
                  className={MUC}
                  aria-current={slug === trang ? 'page' : undefined}
                  data-active={slug === trang || undefined}
                >
                  <Icon aria-hidden="true" />
                  <span className="truncate">{ten}</span>
                </Link>
              </li>
            ))}
          {coComponent && (
            <li>
              <Link
                href={duongDan('components', theme)}
                className={MUC}
                aria-current={trang === 'components' ? 'page' : undefined}
                data-active={(trang === 'components' && !neo) || undefined}
              >
                <TRANG_COMPONENTS.icon aria-hidden="true" />
                <span className="truncate">Components</span>
              </Link>
              {loc.nhom.map((n) => (
                <div key={n.ten} className="mt-2">
                  <p className="m-0 flex h-7 items-center pl-8 text-[12px] leading-[18px] font-semibold text-muted-foreground">
                    {n.ten}
                    <span className="ml-1 font-normal">· lát {n.lat}</span>
                  </p>
                  <ul className="m-0 flex list-none flex-col gap-px p-0">
                    {n.muc.map((m) => (
                      <li key={m.neo}>
                        {m.daDung ? (
                          <Link
                            href={duongDan('components', theme, m.neo)}
                            className={`${MUC} pl-8`}
                            aria-current={trang === 'components' && neo === m.neo ? 'location' : undefined}
                            data-active={(trang === 'components' && neo === m.neo) || undefined}
                          >
                            <span className="truncate">{m.ten}</span>
                          </Link>
                        ) : (
                          <span className="flex h-(--control-size-md) items-center pl-8 text-[14px] leading-[20px] text-(--color-text-tertiary)">
                            {m.ten}
                            <span className="sr-only"> (chưa dựng)</span>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </li>
          )}
        </ul>
        {!loc.trang.length && !loc.nhom.length && (
          <p className="m-0 px-2 py-2 text-[14px] leading-[20px] text-muted-foreground">Không có mục nào khớp “{q.trim()}”.</p>
        )}
      </nav>
    </div>
  )
}
/** Thanh trên ở màn hẹp (< 768): nút "Mục lục" mở Sheet chứa đúng MucLuc của cột trái, + nút sáng/tối. */
export function ThanhDiDong(props: Props) {
  const [mo, setMo] = useState(false)
  const neo = useNeoDangXem(props.trang === 'components')
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-(--border) bg-background px-4 py-2 md:hidden">
      <Sheet open={mo} onOpenChange={setMo}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <List aria-hidden="true" />
            Mục lục
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Mục lục</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <MucLuc {...props} onChon={() => setMo(false)} />
          </SheetBody>
        </SheetContent>
      </Sheet>
      <NutTheme trang={props.trang} theme={props.theme} neo={neo} />
    </div>
  )
}
