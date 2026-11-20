import { DsRoot } from '@/components/ui/ds-root'
import { Toaster } from '@/components/ui/toast'
import { layTheme } from '../_khung/khung-ds'
import { KHOI } from '../_khung/khoi'

/**
 * /ds/tron — chỉ các khối component, KHÔNG cột trái, padding 16 = body ds/nguon/bundle.css → khối giãn ngang cùng bề
 * rộng với preview artifact. Trang đo của `ds/so-khop.mjs` (cột trái làm lệch width). Người xem dùng /ds.
 */
export default async function DsTronPage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const theme = await layTheme(searchParams)
  return (
    <DsRoot theme={theme} className="min-h-screen p-4">
      <div className="flex flex-col gap-12 [&_h2>a]:rounded-sm [&_h2>a]:focus-visible:outline-2 [&_h2>a]:focus-visible:outline-offset-2 [&_h2>a]:focus-visible:outline-ring">{KHOI.map(({ neo, Khoi }) => Khoi && <Khoi key={neo} />)}</div>
      <Toaster />
    </DsRoot>
  )
}
