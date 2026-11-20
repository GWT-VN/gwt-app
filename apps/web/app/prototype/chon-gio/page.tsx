// PROTOTYPE vứt đi — 3 cách chọn ngày + giờ, đổi bằng ?variant= (A | B | C), ?theme=dark cho tối. Chỉ chạy dev.
import { notFound } from 'next/navigation'
import { DsRoot } from '@/components/ui/ds-root'
import { TrangChonGio, type MaBienThe } from './_chon-gio/trang'

export default async function ChonGioPage({ searchParams }: { searchParams: Promise<{ variant?: string; theme?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { variant, theme } = await searchParams
  const bt: MaBienThe = variant === 'B' || variant === 'C' ? variant : 'A'
  return (
    <DsRoot theme={theme === 'dark' ? 'dark' : 'light'} className="min-h-screen">
      <TrangChonGio variant={bt} />
    </DsRoot>
  )
}
