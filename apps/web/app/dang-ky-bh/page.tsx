import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { listKhachChoDuyet } from '@/app/actions'
import { ChonKieuLap } from '@/components/ChonKieuLap'
import { KhachChoDuyetList } from '@/components/KhachChoDuyetList'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'

export default async function DangKyBHPage() {
  // Hỏi quyền TRƯỚC rồi mới đọc hàng chờ: listKhachChoDuyet() tự gác bằng
  // cs.khach.duyet_cho và ĐÁ VỀ TRANG CHỦ nếu thiếu — gọi vô điều kiện là nhân
  // viên thường mở trang này liền bị văng, dù phần đăng ký bảo hành phía trên
  // vốn dành cho họ.
  const quyen = await hoiQuyen({ duyetKhach: ['cs.khach.duyet_cho', 'QUANLY'] })
  const choDuyet = quyen.duyetKhach ? await listKhachChoDuyet() : []
  return (
    <ManV2>
      <TrangDuLieu className="max-w-6xl">
        <div className="min-w-0 space-y-4">
          <PageHeader tieuDe="Đăng ký bảo hành" meta={["Gắn serial cho khách và kích hoạt bảo hành"]} />

          {/* Việc CẦN LÀM lên trước việc nhập liệu. Trước đây khối này nằm tuốt dưới
              đáy trang nên quản lý không thấy có gì chờ mình duyệt. Và chỉ hiện khi
              thật sự có hồ sơ chờ — rỗng thì đừng chiếm chỗ. */}
          {quyen.duyetKhach && choDuyet.length > 0 && (
            <section className="rounded-(--radius-xl) border border-(--color-border-warning-surface) bg-(--color-background-warning-surface) p-4">
              <h2 className="text-sm font-semibold text-(--color-text-warning)">
                {choDuyet.length} khách chờ duyệt kích hoạt
              </h2>
              <p className="text-xs text-(--color-text-warning)/80 mt-0.5 mb-3">
                Cấp quản lý duyệt trước khi máy vào bảo hành.
              </p>
              <KhachChoDuyetList items={choDuyet} />
            </section>
          )}

          <p className="text-sm bg-(--color-background-info-surface) text-(--color-text-info) rounded-lg px-3 py-2">
            Gắn máy (serial) cho khách và kích hoạt bảo hành. Chọn <strong>1 máy lẻ</strong> hoặc
            <strong> 1 bộ combo</strong> (WH15A/WH30A…). Thông tin máy tự lấy từ kho serial;
            khách mới tạo được ngay nhưng <strong>chờ admin duyệt</strong>.
          </p>
          <ChonKieuLap />
        </div>
      </TrangDuLieu>
    </ManV2>
  )
}
