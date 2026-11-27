import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { chanNeuThieuQuyen } from '@/lib/nen-tang/kiem-quyen'
import Link from 'next/link'
import { BangLechQuyen } from '@/components/BangLechQuyen'
import { MaTranQuyen } from '@/components/MaTranQuyen'
import { docLech, docMaTran } from '@/lib/nen-tang/ma-tran'
import { maTranDangLamLuat } from '@/lib/nen-tang/kiem-quyen'
import { QUYEN } from '@/lib/nen-tang/quyen'

export default async function PhanQuyenPage() {
  // Rào THẬT của trang này.
  await chanNeuThieuQuyen('he_thong.phan_quyen', 'ADMIN')
  const [maTran, lech] = await Promise.all([docMaTran(), docLech()])
  const lamLuat = maTranDangLamLuat()

  return (
    <ManV2>
      <TrangDuLieu className="space-y-4">
        <PageHeader tieuDe="Phân quyền theo vai trò"
          duongDan={<Button asChild variant="ghost"><Link href="/nhan-vien">← Nhân viên</Link></Button>}
        />

        {lamLuat ? (
          <Alert color="danger">
            <AlertTitle>⚡ Ma trận ĐANG LÀ LUẬT THẬT — bỏ tick một ô là người đó mất việc đó ngay.</AlertTitle>
            <AlertDescription>
              Không còn chạy thử. Muốn quay về luật cũ thì đặt biến môi trường
              <code className="mx-1 text-xs">MA_TRAN_QUYEN=off</code> rồi khởi động lại — mất khoảng một
              phút, không cần deploy lại.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert color="warning">
            <AlertTitle>Ma trận đang CHẠY THỬ — tick ở đây chưa đổi quyền thật của ai.</AlertTitle>
            <AlertDescription>
              Luật quyết định hiện vẫn là luật cũ trong code. Bảng này được lưu lại và
              đối chiếu, để anh chỉnh cho đúng ý trước khi bật làm luật thật. Bật rồi thì mỗi ô
              bỏ tick là một người mất một việc — nên chỉnh xong hãy báo.
            </AlertDescription>
          </Alert>
        )}

        <p className="text-sm text-muted-foreground">
          {QUYEN.length} việc trong app, gom từ 149 thao tác thật. Cột <b>Quản trị</b> khoá cứng
          toàn quyền — bỏ tick là khoá chết chính màn hình này. Kéo ngang để thấy hết vai trò;
          cột việc luôn dính bên trái. Di chuột vào tên cột để xem tên vai trò đầy đủ.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Lệch — ma trận nói khác luật đang chạy</h2>
          <BangLechQuyen ds={lech} />
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Ma trận</h2>
          <MaTranQuyen maTran={maTran} />
        </section>
      </TrangDuLieu>
    </ManV2>
  )
}
