import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { chanNeuThieuQuyen } from '@/lib/nen-tang/kiem-quyen'
import Link from 'next/link'
import { dsKyThuat, boiCanhKhach, type ViecInput } from '@/app/actions'
import { KyThuatBang } from '@/components/KyThuatBang'
import { coSuaDanhSach } from '@/lib/nen-tang/sua-danh-sach-server'

export default async function KyThuatPage({
  searchParams,
}: {
  searchParams: Promise<{ kh?: string; loai?: string; ref?: string; mota?: string; ngay?: string }>
}) {
  await chanNeuThieuQuyen('cs.ky_thuat.ho_so', 'QUANLY')
  const { kh, loai, ref, mota, ngay } = await searchParams
  const [dsKt, suaDs] = await Promise.all([dsKyThuat(), coSuaDanhSach()])

  // Quick-link từ ticket/máy/bảo trì: prefill khách + 1 việc.
  let prefill: { khachId: string; ctx: Awaited<ReturnType<typeof boiCanhKhach>>; ngay?: string; viec?: ViecInput[] } | undefined
  if (kh) {
    const ctx = await boiCanhKhach(kh)
    const viec: ViecInput[] | undefined = loai ? [{ loai_viec: loai, ref: ref || undefined, mo_ta: mota || undefined }] : undefined
    prefill = { khachId: kh, ctx, ngay: ngay || undefined, viec }
  }

  return (
    <ManV2>
      <TrangDuLieu className="max-w-5xl space-y-4">
        <PageHeader
          tieuDe="Gán lịch kỹ thuật"
          meta={['Gán chuyến cho nhân viên hoặc cộng tác viên. Mỗi chuyến có thể gồm nhiều việc.']}
          hanhDong={<Button asChild variant="outline"><Link href="/ky-thuat/lich">Xem lịch đã lên</Link></Button>}
        />

        {prefill && <Alert color="info"><AlertDescription>Đã tạo sẵn 1 việc từ liên kết nhanh — chọn kỹ thuật + ngày rồi tạo chuyến (thêm việc khác nếu cần).</AlertDescription></Alert>}

        <KyThuatBang suaDs={suaDs} dsKt={dsKt} prefill={prefill} />
      </TrangDuLieu>
    </ManV2>
  )
}
