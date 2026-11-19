import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'

/** Trang xem DS — chỉ dev. Production: 404 (proxy cũng không cho qua khi chưa đăng nhập). Inter do DsRoot tự nạp. */
export default function DsLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === 'production') notFound()
  return children
}
