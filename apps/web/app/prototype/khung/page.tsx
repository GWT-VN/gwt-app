// PROTOTYPE — lượt 1: khung điều hướng + chỗ đặt agent Bắp. 3 phương án ?variant=A|B|C.
// Nhánh bỏ đi prototype/v2-khung — KHÔNG merge. Dữ liệu giả, không đọc DB.
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'
import './_proto/tokens.css'
import './_proto/ui.css'
import './_proto/shell.css'
import '../bang/_bang/bang.css' // .b-noi: định vị hộp nổi (Noi) cho hộp thông báo
import { KhungPrototype } from './_proto/Switcher'

// Inter tự host lúc build (next/font), có bộ dấu tiếng Việt
const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter', display: 'swap' })

export const metadata = { title: 'Prototype · Khung + Bắp' }

export default async function Page({ searchParams }: { searchParams: Promise<{ variant?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { variant = 'F' } = await searchParams
  return (
    <div className={inter.variable}>
      <KhungPrototype variant={variant.toUpperCase()} />
    </div>
  )
}
