// PROTOTYPE vứt đi — họ A chọn ngày + giờ, đổi bằng ?variant= (A1…A5; A = A1; B, C cũ vẫn mở được), ?theme=dark cho tối. Chỉ chạy dev.
import { notFound } from 'next/navigation'
import { DsRoot } from '@/components/ui/ds-root'
import { TrangChonGio, type MaBienThe } from './_chon-gio/trang'

export default async function ChonGioPage({ searchParams }: { searchParams: Promise<{ variant?: string; theme?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { variant, theme } = await searchParams
  // Danh sách gõ lại ở đây: giá trị (không phải component) import từ file 'use client' sang server chỉ là proxy.
  const MA: MaBienThe[] = ['A1', 'A2', 'A3', 'A4', 'A5', 'B', 'C']
  const bt = MA.find((m) => m === variant) ?? 'A1'
  return (
    <DsRoot theme={theme === 'dark' ? 'dark' : 'light'} className="min-h-screen">
      <TrangChonGio variant={bt} />
    </DsRoot>
  )
}
