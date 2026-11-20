import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import type { Token } from './du-lieu'
import { NutChep } from './nut-chep'

// Khung trình bày dùng chung của 7 trang nền /ds, theo trang Colors của artifact: nền xám (`muted`) → tấm trắng bo lớn
// (`background`, radius-xl) cho tiêu đề và cho từng mục → mỗi mục một bảng kẻ ngang giữa hàng, kẻ dọc mảnh giữa cột.
// Chữ dùng lớp .ds-* của ds/tokens.css (khai lẻ từng thuộc tính → giữ cv11/ss03 của DsRoot; shorthand `font:` xoá chúng).
// Chưa có Table trong DS (lát 4) → bảng ở đây là khung xem token của /ds, không phải component cho màn.

const TAM = 'rounded-(--radius-xl) bg-background p-4 md:p-6'
const NEO = 'rounded-(--radius-sm) text-foreground no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

export function TrangNen({
  tieuDe,
  moTa,
  muc,
  children,
}: {
  tieuDe: string
  moTa: ReactNode
  muc?: { id: string; ten: string }[]
  children: ReactNode
}) {
  return (
    <article className="flex max-w-full min-w-0 flex-col gap-2 rounded-(--radius-2xl) bg-muted p-2 md:gap-3 md:p-3">
      <header className={`${TAM} flex flex-col gap-3`}>
        <h1 className="ds-heading-xl m-0">{tieuDe}</h1>
        <p className="ds-text-sm m-0 max-w-prose text-muted-foreground">{moTa}</p>
        {muc && (
          <nav aria-label="Trong trang này" className="flex flex-wrap gap-x-4 gap-y-1">
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

/** Một mục (tấm trắng): hàng tiêu đề có neo `#id`, mô tả, rồi nội dung (thường là BangToken). */
export function MucNen({ id, tieuDe, moTa, children }: { id: string; tieuDe: string; moTa?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-tieu-de`} className={`${TAM} flex scroll-mt-16 flex-col gap-4`}>
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-tieu-de`} className="ds-heading-sm m-0">
          <a href={`#${id}`} className={NEO}>
            {tieuDe}
          </a>
        </h2>
        {moTa && <p className="ds-text-sm m-0 max-w-prose text-muted-foreground">{moTa}</p>}
      </div>
      {children}
    </section>
  )
}

export type Hang = {
  key: string
  /** Tên hiện ở cột đầu (vd `background`, `heading-lg`). */
  ten: ReactNode
  /** Dòng phụ dưới tên (tham chiếu, mô tả dùng). */
  phu?: ReactNode
  o: ReactNode[]
  /** Có thì cột cuối có nút chép tên biến. */
  bien?: string
}

const O = 'px-3 py-2 align-middle text-left'

/**
 * Bảng token: cột Tên + các cột `cot` + cột nút chép. Bề rộng tối thiểu `rong` (bội --spacing) — màn hẹp cuộn ngang
 * TRONG bảng (vùng cuộn focus được bằng Tab, có tên) thay vì tràn trang. `table-fixed`: mặc định cột Tên 2/5, các cột còn
 * lại chia đều → Sáng/Tối thẳng hàng giữa các mục; `doRong` đổi khi cột mẫu cần rộng.
 */
export function BangToken({
  ten,
  cot,
  hang,
  rong = 120,
  doRong = ['w-2/5'],
}: {
  ten: string
  cot: string[]
  hang: Hang[]
  rong?: number
  /** Lớp bề rộng cho từng cột theo thứ tự [Tên, ...cot]; cột không ghi chia đều phần còn lại. */
  doRong?: (string | undefined)[]
}) {
  return (
    // relative: phần tử sr-only (absolute) bên trong neo vào vùng cuộn — không thì nó đẩy trang tràn ngang ở 390.
    <div
      role="region"
      aria-label={ten}
      tabIndex={0}
      className="relative -mx-4 overflow-x-auto px-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring md:-mx-6 md:px-6"
    >
      <table className="ds-text-sm w-full table-fixed border-collapse" style={{ minWidth: `calc(var(--spacing) * ${rong})` }}>
        <thead>
          <tr className="border-b">
            {['Tên', ...cot].map((c, i) => (
              <th key={c} scope="col" className={`${O} ds-text-xs font-medium text-muted-foreground ${i ? 'border-l' : 'pl-0'} ${doRong[i] ?? ''}`}>
                {c}
              </th>
            ))}
            <th scope="col" className="w-10 p-0">
              <span className="sr-only">Chép</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {hang.map((h) => (
            <tr key={h.key} className="border-b last:border-b-0">
              <th scope="row" className={`${O} pl-0 font-normal`}>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <code className="ds-text-sm font-medium break-words">{h.ten}</code>
                  {h.phu}
                </div>
              </th>
              {h.o.map((o, i) => (
                <td key={i} className={`${O} border-l`}>
                  {o}
                </td>
              ))}
              <td className="py-2 pl-2 align-middle">{h.bien && <NutChep bien={h.bien} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Giá trị: một dòng khi hai theme trùng, hai dòng Sáng/Tối khi khác. */
export function GiaTri({ token }: { token: Pick<Token, 'sang' | 'toi'> }) {
  if (token.sang === token.toi) return <span className="ds-text-sm break-words tabular-nums">{token.sang}</span>
  return (
    <dl className="ds-text-xs m-0 grid grid-cols-[auto_1fr] gap-x-2 break-words tabular-nums">
      <dt className="text-muted-foreground">Sáng</dt>
      <dd className="m-0">{token.sang}</dd>
      <dt className="text-muted-foreground">Tối</dt>
      <dd className="m-0">{token.toi}</dd>
    </dl>
  )
}

/** Mô tả `usage` của tokens.json: đoạn trong dấu backtick hiện thành <code> thay vì để lộ dấu. */
export function MoTa({ chu }: { chu?: string }) {
  if (!chu) return null
  return (
    <span className="ds-text-xs text-muted-foreground">
      {chu.split('`').map((doan, i) =>
        i % 2 ? (
          <code key={i} className="[font-family:inherit] font-medium text-foreground">
            {doan}
          </code>
        ) : (
          doan
        ),
      )}
    </span>
  )
}

/** Hàng token đơn giản (tên bỏ `--`, mô tả dùng ở dòng phụ, cột Mẫu + Giá trị). */
export function hangToken(t: Token, mau: ReactNode): Hang {
  return { key: t.ten, ten: t.ten, phu: <MoTa chu={t.dung} />, o: [mau, <GiaTri key="g" token={t} />], bien: t.bien }
}
