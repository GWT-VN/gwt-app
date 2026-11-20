// PROTOTYPE vứt đi — menu thuộc tính kiểu Linear trên bảng ticket. ?theme=dark cho tối. Chỉ chạy dev.
import { notFound } from 'next/navigation'
import { DsRoot } from '@/components/ui/ds-root'
import { Toaster } from '@/components/ui/toast'
import { TrangMenuThuocTinh } from './_menu/trang'

export default async function MenuThuocTinhPage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { theme } = await searchParams
  return (
    <DsRoot theme={theme === 'dark' ? 'dark' : 'light'} className="min-h-screen">
      <TrangMenuThuocTinh />
      <Toaster />
    </DsRoot>
  )
}
