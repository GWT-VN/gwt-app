import type { ReactNode } from 'react'
import { NutChep } from './nut-chep'

// Bảng token của trang nền /ds — đặt làm con trực tiếp của `Muc` (tam.tsx): lề ngang = lề Muc. Chưa có Table trong DS
// (lát 4) → đây là khung xem token của /ds, không phải component cho màn. Chữ dùng lớp .ds-* (giữ cv11/ss03).

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
      className="relative overflow-x-auto px-5 py-1 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring md:px-8"
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
