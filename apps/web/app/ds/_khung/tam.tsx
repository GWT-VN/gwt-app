import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { CHU } from './chu'

/**
 * Khung trình bày trang /ds (kiểu trang Colors của artifact) — server component, chỉ token:
 *
 *   <Tam tieuDe="Màu" moTa="…">                 tấm lớn: bo radius-4xl 24, viền `border`; khe giữa các mục = nền `muted`
 *     <Muc tieuDe="Nền" hanhDong={…}>           mục trắng: hàng tiêu đề (16 medium) + các hàng, kẻ ngang 1px `border`
 *       <Hang ten="default">demo</Hang>         hàng: cột tên 192 (48 × spacing) + các ô giãn đều, kẻ dọc 1px
 *       <Hang ten="background" o={[a, b]} />    nhiều ô (vd Light | Dark)
 *     </Muc>
 *   </Tam>
 *
 * < 768: hàng xếp dọc (tên trên, ô dưới). `Muc` không `tieuDe` = mục chỉ có thân (văn bản). `id` của Muc là neo #.
 */
export function Tam({ tieuDe, moTa, children }: { tieuDe: ReactNode; moTa?: ReactNode; children: ReactNode }) {
  return (
    <article className="flex flex-col gap-2 overflow-hidden rounded-(--radius-4xl) border border-(--border) bg-muted">
      <header className="bg-background px-5 pt-6 pb-5 md:px-8 md:pt-8">
        <h1 className={`m-0 ${CHU.h1}`}>{tieuDe}</h1>
        {moTa && <div className={`mt-2 max-w-[72ch] text-muted-foreground ${CHU.sm}`}>{moTa}</div>}
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
    <section id={id} className={cn('scroll-mt-6 bg-background', className)}>
      {tieuDe && (
        <div className={`flex min-h-14 items-center justify-between gap-4 py-3 ${LE}`}>
          <div className="min-w-0">
            <h2 className="m-0 text-[16px] leading-[24px] font-medium">
              {neo ? (
                <a href={`#${neo}`} className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  {tieuDe}
                </a>
              ) : (
                tieuDe
              )}
            </h2>
            {moTa && <p className={`m-0 truncate text-muted-foreground ${CHU.sm}`}>{moTa}</p>}
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

/** Một hàng: cột tên (192) + `o` (mỗi phần tử một ô) hoặc `children` (một ô). */
export function Hang({ ten, o, children }: { ten: ReactNode; o?: ReactNode[]; children?: ReactNode }) {
  const cac = o ?? [children]
  return (
    <div className="flex flex-col divide-(--border) max-md:divide-y md:flex-row md:divide-x">
      <div className={`flex items-center py-3 md:w-48 md:shrink-0 ${LE} md:pr-4 ${CHU.sm} text-muted-foreground`}>{ten}</div>
      {cac.map((x, i) => (
        <div key={i} className="flex min-w-0 flex-1 items-center px-5 py-3 md:px-4">
          {x}
        </div>
      ))}
    </div>
  )
}
