import Link from 'next/link'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { coQuyenHienNut } from '@/lib/nen-tang/kiem-quyen'
import { vieCcuaToi, nenTang, xongTuanNay } from './actions'
import { ViecCuaToi } from '@/components/work/ViecCuaToi'

export const metadata = { title: 'Việc của tôi · GWT Work' }

/**
 * Khu Work — "Việc của tôi": mọi nhân sự đang hoạt động đều vào được
 * (cổng nền tảng requireNhanSu, không cần vai trò CS). Xuyên mọi phòng ban.
 */
export default async function WorkPage() {
  await requireNhanSu()
  // Nhân viên thường không thấy mục 'Việc tự sinh' (CEO chốt 24/08). Ẩn link
  // chỉ là cho gọn mắt — rào thật nằm trong chính trang đó.
  const thayTuSinh = await coQuyenHienNut('work.luat_tu_sinh', 'QUANLY')
  const [rows, nt, xong] = await Promise.all([vieCcuaToi(), nenTang(), xongTuanNay()])

  return (
    <main data-khu="work" className="min-h-screen">
      <div className="max-w-5xl mx-auto px-5 py-5 sm:px-6 space-y-5 khung-trang">
        <header>
          <nav className="flex gap-3 mb-2" style={{ fontSize: 12.5 }} aria-label="Khu Việc">
            <span style={{ color: "var(--faint)" }}>Việc của tôi</span>
            <Link href="/work/team" style={{ color: "var(--accent-ink)" }}>Bảng team</Link>
            {thayTuSinh && (
              <Link href="/work/tu-sinh" style={{ color: "var(--accent-ink)" }}>Việc tự sinh</Link>
            )}
          </nav>
          <h1 style={{ fontSize: 20, fontWeight: 670, letterSpacing: "-.02em", margin: 0 }}>Việc của tôi</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
            Công việc bạn phụ trách hoặc cùng làm — xuyên mọi phòng ban.
          </p>
        </header>
        <ViecCuaToi rowsBanDau={rows} nenTang={nt} viecXongTuanNay={xong} />
      </div>
    </main>
  )
}
