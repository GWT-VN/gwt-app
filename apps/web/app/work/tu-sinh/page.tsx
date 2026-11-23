import { Suspense } from 'react'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { chanNeuThieuQuyen, quyenChoMan } from '@/lib/nen-tang/kiem-quyen'
import { ManV2 } from '@/components/khung/ManV2'
import { TuSinh } from '@/components/work/v2/TuSinh'
import { manTuSinh, nenTang } from '../actions'

export const metadata = { title: 'Việc tự sinh · GWT Work' }

/**
 * Bật/tắt luật, đổi người nhận, chỉnh ngưỡng, chạy tay — cùng một mã quyền.
 * Hỏi qua ma trận chứ không đọc cờ vai trò: CEO tick khác đi thì nút đổi theo,
 * và nút hiện ra luôn khớp với rào phía Server Action.
 */
const QUYEN_MAN = [['work.luat_tu_sinh', 'QUANLY']] as const

/**
 * Việc tự sinh (v2, dựng bằng DS) — sự kiện trong CSKH / Sales tự đẻ ra việc, không ai phải nhớ.
 * Bộ quét chạy dưới DB mỗi 15 phút; màn này chỉ để xem và chỉnh luật. Menu khu ở khung điều hướng.
 */
export default async function TuSinhPage() {
  await requireNhanSu()
  /*
    CEO chốt 24/08: nhân viên thường KHÔNG thấy màn này, chứ không phải "thấy mà
    bấm không ăn". Bày ra một trang toàn nút chết là bắt người ta đoán mình đã
    làm sai gì. Chỉ CEO / quản trị hệ thống / quản lý mới vào.

    Chặn ở ĐÂY chứ không chỉ ẩn link trên nav: ẩn link không phải phân quyền,
    ai biết đường dẫn vẫn gõ thẳng vào được.
  */
  await chanNeuThieuQuyen('work.luat_tu_sinh', 'QUANLY')
  const [duLieu, nt, quyen] = await Promise.all([manTuSinh(), nenTang(), quyenChoMan(QUYEN_MAN)])

  return (
    <ManV2>
      <Suspense>
        <TuSinh duLieu={duLieu} nenTang={nt} duocSuaLuat={quyen['work.luat_tu_sinh'] ?? false} />
      </Suspense>
    </ManV2>
  )
}
