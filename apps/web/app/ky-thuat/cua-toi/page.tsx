import { EmptyState } from '@/components/ui/empty-state'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { requireStaff } from '@/lib/nen-tang/phien'
import { lichCuaToi } from '@/app/actions'
import { LichCuaToiKT } from '@/components/LichCuaToiKT'
import { DoiMatKhau } from '@/components/DoiMatKhau'
import { NutQuayLai } from '@/components/NutQuayLai'

/** Màn hình cho KỸ THUẬT: lịch chuyến của chính mình (7 ngày trước → 30 ngày tới). */
export default async function LichCuaToiPage() {
  await requireStaff()
  const hom = new Date()
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const tu = new Date(hom); tu.setDate(tu.getDate() - 7)
  const den = new Date(hom); den.setDate(den.getDate() + 30)
  const { kt, rows } = await lichCuaToi(iso(tu), iso(den))

  return (
    <ManV2>
      <TrangDuLieu className="max-w-2xl space-y-4">
        <NutQuayLai macDinh="/" />
        <PageHeader
          tieuDe="Lịch của tôi"
          meta={[...(kt ? [`Kỹ thuật: ${kt.ten}`] : []), 'Chuyến 7 ngày qua đến 30 ngày tới.']}
        />

        {!kt ? (
          <EmptyState kieu="quyen" capTieuDe={2} tieuDe="Chưa có hồ sơ kỹ thuật" moTa="Tài khoản của bạn chưa được gắn với hồ sơ kỹ thuật (khớp theo email). Liên hệ quản trị để được cấp." />
        ) : (
          <LichCuaToiKT rows={rows} />
        )}

        <details className="bg-card rounded-xl border p-4">
          <summary className="text-sm font-medium text-foreground cursor-pointer">Đổi mật khẩu</summary>
          <p className="text-xs text-muted-foreground mt-1 mb-2">Nên đổi mật khẩu tạm được cấp sang mật khẩu của riêng bạn.</p>
          <DoiMatKhau />
        </details>
      </TrangDuLieu>
    </ManV2>
  )
}
