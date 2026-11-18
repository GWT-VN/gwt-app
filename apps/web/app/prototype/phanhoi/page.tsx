// PROTOTYPE — nhóm Phản hồi của DS (ConfirmDialog · EmptyState · Skeleton · Banner · Toast · nút đang tải). ?theme=dark
// Nhánh bỏ đi prototype/v2-khung — KHÔNG merge. Dữ liệu giả, không đọc DB.
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'
import '../khung/_proto/tokens.css'
import '../form/_form/tokens-dark.css'
import '../khung/_proto/ui.css'
import '../bang/_bang/bang.css'
import '../form/_form/form.css'
import './_ph/phanhoi.css'
import { PhanHoiDemo } from './_ph/PhanHoiDemo'

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter', display: 'swap' })

export const metadata = { title: 'Prototype · Phản hồi DS' }

export default async function Page({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { theme } = await searchParams
  return <div className={inter.variable}><PhanHoiDemo toi={theme === 'dark'} /></div>
}
