import { Card } from '@/components/ui/card'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { chanNeuThieuQuyen, coQuyenHienNut } from '@/lib/nen-tang/kiem-quyen'
import { listKhachChoDuyet, listYeuCauThayDoi, listYeuCauExport } from '@/app/actions'
import { KhachChoDuyetList } from '@/components/KhachChoDuyetList'
import { DuyetList } from '@/components/DuyetList'
import { DuyetExportList } from '@/components/DuyetExportList'

export default async function DuyetPage() {
  await chanNeuThieuQuyen('cs.yeu_cau.xem', 'QUANLY')
  // Trang này gác bằng cs.yeu_cau.xem, nhưng khối "khách chờ duyệt" bên dưới đòi
  // cs.khach.duyet_cho — HAI quyền khác nhau. Ai được tick quyền này mà không được
  // tick quyền kia thì gọi vô điều kiện là bị đá khỏi trang.
  const duocDuyetKhach = await coQuyenHienNut('cs.khach.duyet_cho', 'QUANLY')
  const [khachCho, yeuCau, yeuCauExport] = await Promise.all([
    duocDuyetKhach ? listKhachChoDuyet() : Promise.resolve([]),
    listYeuCauThayDoi(), listYeuCauExport(),
  ])

  return (
    <ManV2>
      <TrangDuLieu className="space-y-4">
        <PageHeader tieuDe="Chờ duyệt" />

        <Card className="space-y-2">
          <h2 className="font-medium text-foreground">Khách mới ({khachCho.length})</h2>
          <p className="text-xs text-muted-foreground">Khách do CS tạo, chờ duyệt để chính thức.</p>
          <KhachChoDuyetList items={khachCho} />
        </Card>

        <Card className="space-y-2">
          <h2 className="font-medium text-foreground">Yêu cầu sửa/xoá ({yeuCau.length})</h2>
          <p className="text-xs text-muted-foreground">CS đề xuất sửa/xoá khách · SĐT phụ · lịch thay lõi · máy đã lắp. Duyệt là áp thật.</p>
          <DuyetList items={yeuCau} />
        </Card>

        <Card className="space-y-2">
          <h2 className="font-medium text-foreground">Yêu cầu xuất có SĐT/địa chỉ ({yeuCauExport.length})</h2>
          <p className="text-xs text-muted-foreground">Duyệt xong người gửi mới tải được bản có PII.</p>
          <DuyetExportList items={yeuCauExport} />
        </Card>
      </TrangDuLieu>
    </ManV2>
  )
}
