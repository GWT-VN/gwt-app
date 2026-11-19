import Link from 'next/link'
import type { ComponentType } from 'react'
import { DsRoot } from '@/components/ui/ds-root'
import { Button } from '@/components/ui/button'
import { KhoiAlert } from './_khoi/khoi-alert'
import { KhoiAvatar } from './_khoi/khoi-avatar'
import { KhoiBadge } from './_khoi/khoi-badge'
import { KhoiButton } from './_khoi/khoi-button'
import { KhoiConfirmDialog } from './_khoi/khoi-confirm-dialog'
import { KhoiContextMenu } from './_khoi/khoi-context-menu'
import { KhoiDialog } from './_khoi/khoi-dialog'
import { KhoiDropdownMenu } from './_khoi/khoi-dropdown-menu'
import { KhoiKbd } from './_khoi/khoi-kbd'
import { KhoiTooltip } from './_khoi/khoi-tooltip'

/**
 * Mục lục + khối của /ds, theo thứ tự hiện. Mỗi khối một file `_khoi/khoi-<neo>.tsx` export `Khoi<Ten>()` bọc
 * `<section id="<neo>">`. Khối chưa dựng: để `Khoi` trống → mục lục hiện chữ mờ "chưa dựng", không có link chết.
 */
const KHOI: { neo: string; ten: string; Khoi?: ComponentType }[] = [
  { neo: 'button', ten: 'Button', Khoi: KhoiButton },
  { neo: 'badge', ten: 'Badge', Khoi: KhoiBadge },
  { neo: 'avatar', ten: 'Avatar', Khoi: KhoiAvatar },
  { neo: 'kbd', ten: 'Kbd', Khoi: KhoiKbd },
  { neo: 'alert', ten: 'Alert', Khoi: KhoiAlert },
  { neo: 'tooltip', ten: 'Tooltip', Khoi: KhoiTooltip },
  { neo: 'dropdown-menu', ten: 'DropdownMenu', Khoi: KhoiDropdownMenu },
  { neo: 'context-menu', ten: 'ContextMenu', Khoi: KhoiContextMenu },
  { neo: 'dialog', ten: 'Dialog', Khoi: KhoiDialog },
  { neo: 'confirm-dialog', ten: 'ConfirmDialog', Khoi: KhoiConfirmDialog },
  { neo: 'sheet', ten: 'Sheet' },
]

/** /ds — xem component DS v2 thật, mỗi component một khối có #neo. `?theme=dark` cho tối. */
export default async function DsPage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const theme = (await searchParams).theme === 'dark' ? 'dark' : 'light'
  // p-4 = body ds/nguon/bundle.css padding 16 → khối giãn ngang so khớp được width
  return (
    <DsRoot theme={theme} className="min-h-screen p-4">
      <header className="mb-8 flex items-center justify-between gap-4">
        <h1 className="[font:var(--text-heading-md)]">Design system v2</h1>
        <Button asChild variant="outline" size="sm">
          <Link href={`/ds?theme=${theme === 'dark' ? 'light' : 'dark'}`}>{theme === 'dark' ? 'Sáng' : 'Tối'}</Link>
        </Button>
      </header>

      <nav aria-label="Mục lục component" className="mb-8">
        <ul className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-1 p-0">
          {KHOI.map(({ neo, ten, Khoi }) => (
            <li key={neo}>
              {Khoi ? (
                <Button asChild variant="link" size="sm">
                  <a href={`#${neo}`}>{ten}</a>
                </Button>
              ) : (
                <span className="[font:var(--text-text-sm)] text-muted-foreground">
                  {ten} <span className="[font:var(--text-text-xs)]">· chưa dựng</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-12">
        {KHOI.map(({ neo, Khoi }) => Khoi && <Khoi key={neo} />)}
      </div>
    </DsRoot>
  )
}
