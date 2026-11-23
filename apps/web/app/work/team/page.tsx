import { Suspense } from 'react'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { ManV2 } from '@/components/khung/ManV2'
import { BangTeam } from '@/components/work/v2/BangTeam'
import { TaoViec } from '@/components/work/v2/TaoViec'
import { bangTeam, nenTang } from '../actions'

export const metadata = { title: 'Bảng team · GWT Work' }

/**
 * Bảng team (v2, dựng bằng DS) — mọi việc mình được xem (work.visible_task_ids quyết định), dạng Bảng / Danh sách /
 * Kanban; lọc tab · người · trạng thái · từ khoá ở URL. Menu khu (Việc của tôi, Việc tự sinh theo quyền) ở khung điều hướng.
 */
export default async function BangTeamPage() {
  await requireNhanSu()
  const [rows, nt] = await Promise.all([bangTeam(), nenTang()])
  return (
    <ManV2>
      <Suspense>
        <BangTeam
          rows={rows}
          nenTang={nt}
          nutTao={<TaoViec nenTang={nt} />}
        />
      </Suspense>
    </ManV2>
  )
}
