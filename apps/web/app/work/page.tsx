import { Suspense } from 'react'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { ManV2 } from '@/components/khung/ManV2'
import { ViecCuaToi } from '@/components/work/v2/ViecCuaToi'
import { vieCcuaToi, xongTuanNay } from './actions'

export const metadata = { title: 'Việc của tôi · GWT Work' }

/**
 * Khu Work — "Việc của tôi" (v2, dựng bằng DS): mọi nhân sự đang hoạt động đều vào được (cổng nền tảng requireNhanSu,
 * không cần vai trò CS). Xuyên mọi phòng ban. Menu khu (Bảng team, Việc tự sinh theo quyền) nằm ở khung điều hướng.
 */
export default async function WorkPage() {
  await requireNhanSu()
  const [rows, xong] = await Promise.all([vieCcuaToi(), xongTuanNay()])
  return (
    <ManV2>
      <Suspense>
        <ViecCuaToi rows={rows} xongTuanNay={xong} />
      </Suspense>
    </ManV2>
  )
}
