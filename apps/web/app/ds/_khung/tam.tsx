import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CHU } from './chu'

/**
 * Khung trình bày trang /ds (kiểu trang Colors của artifact) — server component, chỉ token:
 *
 *   <Tam tieuDe="Màu" moTa="…" muc={[…]}>        đầu trang = một tấm riêng; các mục xếp dưới, cách nhau 16
 *     <Muc id="nen" tieuDe="Nền" moTa="…" hanhDong={…}>   mỗi mục = MỘT TẤM RIÊNG (bo radius-2xl, viền `border`) — CEO 20/11:
 *                                                     tách hẳn từng tấm, không dùng dải xám dày để ngăn
 *       <BangToken … />                                bảng Tên | cột… (bang.tsx) — cột thẳng hàng giữa các mục
 *       <ThanMuc>văn bản, demo tự do</ThanMuc>
 *     </Muc>
 *   </Tam>
 *
 * `Muc` không `tieuDe` = mục chỉ có thân. `id` của Muc là neo #.
 */
export function Tam({
  tieuDe,
  moTa,
  muc,
  children,
}: {
  tieuDe: ReactNode
  moTa?: ReactNode
  /** Mục lục trong trang (link `#id` tới các Muc). */
  muc?: { id: string; ten: string }[]
  children: ReactNode
}) {
  return (
    <article className="flex flex-col gap-4">
      <header className="rounded-(--radius-2xl) border border-(--border) bg-background px-5 pt-6 pb-5 md:px-8 md:pt-8">
        <h1 className={`m-0 ${CHU.h1}`}>{tieuDe}</h1>
        {moTa && <div className={`mt-2 max-w-[72ch] text-muted-foreground ${CHU.sm}`}>{moTa}</div>}
        {muc && (
          <nav aria-label="Trong trang này" className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {muc.map((m) => (
              <Button key={m.id} asChild variant="link" size="sm">
                <a href={`#${m.id}`}>{m.ten}</a>
              </Button>
            ))}
          </nav>
        )}
      </header>
      {children}
    </article>
  )
}

/** Lề ngang chung của tiêu đề mục, hàng, thân — mép chữ thẳng hàng với tiêu đề Tam. */
const LE = 'px-5 md:px-8'

export function Muc({
  id,
  neo = id,
  tieuDe,
  moTa,
  hanhDong,
  className,
  children,
}: {
  id?: string
  /** Link tiêu đề `#neo` khi neo nằm ở phần tử con (vd khối _khoi giữ id) — mặc định = `id`. */
  neo?: string
  tieuDe?: ReactNode
  moTa?: ReactNode
  hanhDong?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={cn('scroll-mt-6 overflow-hidden rounded-(--radius-2xl) border border-(--border) bg-background', className)}>
      {tieuDe && (
        <div className={`flex min-h-14 items-center justify-between gap-4 py-5 ${LE}`}>
          <div className="flex min-w-0 flex-col gap-1">
            {/* CEO 20/11: tiêu đề tấm rõ hơn (heading-sm 18/26 600) + đệm trên dưới 20 */}
            <h2 className="m-0 ds-heading-sm">
              {neo ? (
                <a href={`#${neo}`} className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  {tieuDe}
                </a>
              ) : (
                tieuDe
              )}
            </h2>
            {moTa && <div className={`max-w-[72ch] text-muted-foreground ${CHU.sm}`}>{moTa}</div>}
          </div>
          {hanhDong && <div className="flex shrink-0 items-center gap-2">{hanhDong}</div>}
        </div>
      )}
      <div className="divide-y divide-(--border) border-t border-(--border) first:border-t-0">{children}</div>
    </section>
  )
}

/** Thân mục dạng văn bản / demo tự do (một ô, không cột tên). */
export function ThanMuc({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('py-5', LE, className)}>{children}</div>
}
