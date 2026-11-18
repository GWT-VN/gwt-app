// PROTOTYPE — lượt 2: bảng ticket CSKH trong khung F đã chốt. 5 phương án ?variant=A|B|C|D|E
// Nhánh bỏ đi prototype/v2-khung — KHÔNG merge. Dữ liệu giả, không đọc DB.
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'
import '../khung/_proto/tokens.css'
import '../khung/_proto/ui.css'
import '../khung/_proto/shell.css'
import './_bang/bang.css'
import { BangPrototype } from './_bang/PhuongAn'

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter', display: 'swap' })

export const metadata = { title: 'Prototype · Bảng ticket' }

export default async function Page({ searchParams }: { searchParams: Promise<{ variant?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { variant = 'A' } = await searchParams
  return (
    <div className={inter.variable}>
      <BangPrototype variant={variant.toUpperCase()} />
    </div>
  )
}
