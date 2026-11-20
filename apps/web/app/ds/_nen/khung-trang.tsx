import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import type { Token } from './du-lieu'
import { NutChep } from './nut-chep'

// Phần dùng chung của 7 trang nền /ds. Chữ dùng lớp .ds-* của ds/tokens.css (khai lẻ từng thuộc tính → giữ cv11/ss03
// của DsRoot; shorthand `font:` sẽ xoá chúng).

export function TrangNen({ tieuDe, moTa, children }: { tieuDe: string; moTa: ReactNode; children: ReactNode }) {
  return (
    <article className="flex max-w-full min-w-0 flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="ds-heading-lg m-0">{tieuDe}</h1>
        <p className="ds-text-sm m-0 max-w-prose text-muted-foreground">{moTa}</p>
      </header>
      {children}
    </article>
  )
}

export function KhoiNen({ id, tieuDe, moTa, children }: { id: string; tieuDe: string; moTa?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-16 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="ds-heading-sm m-0">
          <a
            href={`#${id}`}
            className="rounded-(--radius-sm) text-foreground no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {tieuDe}
          </a>
        </h2>
        {moTa && <p className="ds-text-sm m-0 max-w-prose text-muted-foreground">{moTa}</p>}
      </div>
      {children}
    </section>
  )
}

/** Tên biến + nút chép trên một dòng. */
export function TenBien({ bien }: { bien: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <code className="ds-text-sm min-w-0 font-medium break-words">{bien}</code>
      <NutChep bien={bien} />
    </div>
  )
}

/** Giá trị: một dòng khi hai theme trùng, hai dòng Sáng/Tối khi khác. */
export function GiaTri({ token }: { token: Pick<Token, 'sang' | 'toi'> }) {
  if (token.sang === token.toi) return <p className="ds-text-xs m-0 break-words text-muted-foreground tabular-nums">{token.sang}</p>
  return (
    <dl className="ds-text-xs m-0 grid grid-cols-[auto_1fr] gap-x-2 break-words text-muted-foreground tabular-nums">
      <dt>Sáng</dt>
      <dd className="m-0">{token.sang}</dd>
      <dt>Tối</dt>
      <dd className="m-0">{token.toi}</dd>
    </dl>
  )
}

/** Mô tả `usage` của tokens.json: đoạn trong dấu backtick hiện thành <code> thay vì để lộ dấu. */
export function MoTa({ chu }: { chu?: string }) {
  if (!chu) return null
  return (
    <p className="ds-text-xs m-0 text-muted-foreground">
      {chu.split('`').map((doan, i) => (i % 2 ? <code key={i} className="[font-family:inherit] font-medium text-foreground">{doan}</code> : doan))}
    </p>
  )
}

/** Mục lục trong trang (link tới các khối #id). */
export function MucLucTrang({ muc }: { muc: { id: string; ten: string }[] }) {
  return (
    <nav aria-label="Trong trang này" className="-mt-6 flex flex-wrap gap-x-4 gap-y-1">
      {muc.map((m) => (
        <Button key={m.id} asChild variant="link" size="sm">
          <a href={`#${m.id}`}>{m.ten}</a>
        </Button>
      ))}
    </nav>
  )
}
