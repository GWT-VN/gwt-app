import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'

// Biến --font-inter phải nằm trên TỔ TIÊN của DsRoot: DsRoot đọc var(--font-sans) = var(--font-inter, ui-sans-serif)…
const inter = Inter({ variable: '--font-inter', subsets: ['latin', 'vietnamese'] })

/** Trang xem DS — chỉ dev. Production: 404 (proxy cũng không cho qua khi chưa đăng nhập). */
export default function DsLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === 'production') notFound()
  return <div className={inter.variable}>{children}</div>
}
