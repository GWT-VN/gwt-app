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
import { KhoiSheet } from './_khoi/khoi-sheet'
import { KhoiTooltip } from './_khoi/khoi-tooltip'

type Khoi = { neo: string; ten: string; Khoi?: ComponentType }
const k = (ten: string, Khoi?: ComponentType): Khoi => ({
  neo: ten.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
  ten,
  Khoi,
})

/**
 * Mục lục + khối của /ds theo nhóm của spec §6, theo thứ tự hiện. Mỗi khối một file `_khoi/khoi-<neo>.tsx` export
 * `Khoi<Ten>()` bọc `<section id="<neo>">` (neo = tên viết kebab). Khối chưa dựng: để trống → mục lục hiện chữ mờ
 * "chưa dựng", không có link chết — CEO nhìn một chỗ thấy hết đã làm / chưa làm.
 */
const NHOM: { ten: string; lat: number; khoi: Khoi[] }[] = [
  {
    ten: 'Nền',
    lat: 1,
    khoi: [k('Button', KhoiButton), k('Badge', KhoiBadge), k('Avatar', KhoiAvatar), k('Kbd', KhoiKbd), k('Alert', KhoiAlert), k('Tooltip', KhoiTooltip)],
  },
  {
    ten: 'Overlay',
    lat: 2,
    khoi: [
      k('DropdownMenu', KhoiDropdownMenu),
      k('ContextMenu', KhoiContextMenu),
      k('Dialog', KhoiDialog),
      k('ConfirmDialog', KhoiConfirmDialog),
      k('Sheet', KhoiSheet),
    ],
  },
  {
    ten: 'Form',
    lat: 3,
    khoi: ['Input', 'InputAffix', 'Checkbox', 'Radio', 'Switch', 'Select', 'Combobox', 'DatePicker', 'DateRangePicker', 'FileUpload', 'FormLayout'].map((t) => k(t)),
  },
  { ten: 'Điều hướng', lat: 4, khoi: ['Tabs', 'Sidebar'].map((t) => k(t)) },
  {
    ten: 'Data view',
    lat: 4,
    khoi: ['Table', 'DataViewToolbar', 'FilterBar', 'Pagination', 'BulkActionBar', 'SavedView', 'ListView', 'KanbanBoard', 'InlineEdit', 'RecordPicker'].map((t) => k(t)),
  },
  { ten: 'Trang chi tiết', lat: 5, khoi: ['Breadcrumb', 'PageHeader', 'PropertyList', 'Timeline', 'Composer', 'DetailLayout'].map((t) => k(t)) },
  { ten: 'Phản hồi', lat: 5, khoi: ['EmptyState', 'Skeleton', 'Banner', 'Toast'].map((t) => k(t)) },
  { ten: 'Toàn app', lat: 6, khoi: ['CommandPalette', 'StatCard'].map((t) => k(t)) },
  { ten: 'Thông báo', lat: 6, khoi: ['Count', 'NotificationCenter', 'NotificationMatrix'].map((t) => k(t)) },
]
const KHOI = NHOM.flatMap((n) => n.khoi)
const SO_DA_DUNG = KHOI.filter((x) => x.Khoi).length

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

      <nav aria-label="Mục lục component" className="mb-8 flex flex-col gap-3">
        <p className="m-0 [font:var(--text-text-sm)] text-muted-foreground">
          Đã dựng {SO_DA_DUNG}/{KHOI.length} component. Mục mờ = chưa dựng (lát sau).
        </p>
        {NHOM.map((n) => (
          <div key={n.ten} className="flex items-baseline gap-x-4">
            <span className="w-36 shrink-0 [font:var(--text-text-sm)] font-semibold">
              {n.ten} <span className="font-normal text-muted-foreground">· lát {n.lat}</span>
            </span>
            <ul className="m-0 flex min-w-0 flex-1 list-none flex-wrap items-center gap-x-4 gap-y-1 p-0">
              {n.khoi.map(({ neo, ten, Khoi }) => (
                <li key={neo}>
                  {Khoi ? (
                    <Button asChild variant="link" size="sm">
                      <a href={`#${neo}`}>{ten}</a>
                    </Button>
                  ) : (
                    <span className="[font:var(--text-text-sm)] text-(--color-text-tertiary)">{ten}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Neo tiêu đề khối (`h2 > a` ở mọi _khoi): vòng focus DS như Button, thay outline mặc định trình duyệt. */}
      <div className="flex flex-col gap-12 [&_h2>a]:rounded-sm [&_h2>a]:focus-visible:outline-2 [&_h2>a]:focus-visible:outline-offset-2 [&_h2>a]:focus-visible:outline-ring">
        {KHOI.map(({ neo, Khoi }) => Khoi && <Khoi key={neo} />)}
      </div>
    </DsRoot>
  )
}
