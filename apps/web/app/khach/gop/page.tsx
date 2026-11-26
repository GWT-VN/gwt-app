import { redirect } from 'next/navigation'
import { coTheVaoCS } from '@/lib/nen-tang/gac-cong'
import { requireStaff } from '@/lib/nen-tang/phien'
import { khachDayDu, capKhachNghiTrung } from '@/app/actions'
import { GopKhachManHinh } from '@/components/GopKhachManHinh'
import { GoiYGopKhach } from '@/components/GoiYGopKhach'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'

export const metadata = { title: 'Gộp khách trùng · GWT CSKH' }
export const dynamic = 'force-dynamic'

/**
 * Màn gộp 2 hồ sơ khách trùng.
 *
 * Vào thẳng từ menu (chưa chọn ai), hoặc từ nút trong trang khách với `?giu=<id>`
 * đã điền sẵn một bên — đi đường nào cũng tới cùng một chỗ so sánh.
 */
export default async function GopKhachPage({
  searchParams,
}: {
  searchParams: Promise<{ giu?: string; gop?: string }>
}) {
  await requireStaff()
  if (!(await coTheVaoCS())) redirect('/work')
  const { giu, gop } = await searchParams

  const [kGiu, kGop, cap] = await Promise.all([
    giu ? khachDayDu(giu) : Promise.resolve(null),
    gop ? khachDayDu(gop) : Promise.resolve(null),
    capKhachNghiTrung(),
  ])

  return (
    <ManV2>
      <TrangDuLieu className="max-w-5xl">
        <div className="min-w-0 space-y-4">
          <PageHeader
            tieuDe="Gộp khách trùng"
            meta={["So sánh hai hồ sơ cạnh nhau rồi mới gộp — hồ sơ bị gộp chỉ bị ẩn, không xoá hẳn"]}
          />

          <div className="rounded-(--radius-xl) border border-(--color-border-info-surface) bg-(--color-background-info-surface) px-3 py-2 text-sm text-(--color-text-info)">
            Máy, ticket, lịch bảo trì và liên hệ của hồ sơ bị gộp sẽ chuyển hết sang hồ sơ giữ.
            Trường nào hồ sơ giữ đang trống thì được lấp; trường nào <strong>cả hai đều có</strong>
            {' '}thì hồ sơ giữ thắng — bảng bên dưới nói rõ từng dòng.
          </div>

          {/* `key` theo đúng cặp id: bấm "Xem & gộp" ở danh sách bên dưới là điều
              hướng trong CÙNG route /khach/gop, React giữ nguyên component cũ nên
              state khởi tạo từ props (giu/gop) không bao giờ chạy lại — màn hình
              trống trơn dù server đã trả đúng hai hồ sơ. Đổi key = ép dựng lại. */}
          <GopKhachManHinh key={`${giu ?? ''}-${gop ?? ''}`} giuBanDau={kGiu} gopBanDau={kGop} />

          {/* Danh sách việc cần làm nằm DƯỚI khu thao tác: vào thẳng từ menu thì
              cuộn một chút là thấy, còn vào từ nút trong hồ sơ khách (đã có sẵn một
              bên) thì phần thao tác vẫn ở ngay trên đầu. */}
          <div className="pt-2">
            <GoiYGopKhach cap={cap} />
          </div>
        </div>
      </TrangDuLieu>
    </ManV2>
  )
}
