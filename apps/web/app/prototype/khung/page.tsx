// PROTOTYPE — lượt 1: khung điều hướng + chỗ đặt agent Bắp. 3 phương án ?variant=A|B|C.
// Nhánh bỏ đi prototype/v2-khung — KHÔNG merge. Dữ liệu giả, không đọc DB.
import { notFound } from 'next/navigation'
import './_proto/tokens.css'
import './_proto/ui.css'
import './_proto/shell.css'
import { KhungPrototype } from './_proto/Switcher'

export const metadata = { title: 'Prototype · Khung + Bắp' }

export default async function Page({ searchParams }: { searchParams: Promise<{ variant?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { variant = 'D' } = await searchParams
  return <KhungPrototype variant={variant.toUpperCase()} />
}
