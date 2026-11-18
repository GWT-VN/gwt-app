// PROTOTYPE — nhóm Form của DS (Radio · Switch · ô tiền · DatePicker · DateRange · FileUpload · FormLayout). ?theme=dark
// Nhánh bỏ đi prototype/v2-khung — KHÔNG merge. Dữ liệu giả, không đọc DB.
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'
import '../khung/_proto/tokens.css'
import './_form/tokens-dark.css'
import '../khung/_proto/ui.css'
import '../bang/_bang/bang.css'
import './_form/form.css'
import { FormDemo } from './_form/FormDemo'

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter', display: 'swap' })

export const metadata = { title: 'Prototype · Form DS' }

export default async function Page({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { theme } = await searchParams
  return <div className={inter.variable}><FormDemo toi={theme === 'dark'} /></div>
}
