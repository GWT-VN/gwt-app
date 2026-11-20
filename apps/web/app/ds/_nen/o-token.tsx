import type { ReactNode } from 'react'
import type { Hang } from '../_khung/bang'
import type { Token } from './du-lieu'

// Ô dùng chung của 7 trang nền: giá trị Sáng/Tối, mô tả `usage`, hàng token đơn giản cho BangToken (_khung/bang.tsx).

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
